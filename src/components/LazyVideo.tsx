import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

/* —— 统一懒加载视频组件 ——
 * 设计目标：在不改变视觉/动画内容的前提下，显著降低非首屏视频对首屏加载的影响。
 *
 * 行为：
 * 1. 非首屏视频初始不挂载 <source>，仅渲染 poster 静态首帧。
 * 2. IntersectionObserver 检测可视区域，接近时（rootMargin 预加载）才挂载 source 并 load()。
 * 3. 进入可视区域后调用 play()；离开后 pause()。
 * 4. preload="auto"（video 元素仅在 shouldLoad=true 时渲染，此时应立即加载），muted/loop/playsInline。
 * 5. loadeddata/canplay 后用淡入替换 poster。
 * 6. 加载失败保留 poster，不显示破损图标。
 * 7. 同一页面避免多个不可见视频继续播放（离开可视区即暂停）。
 *
 * 关键约束：
 * - 不能在保留无条件 autoplay 的同时仅依赖 preload="none"。
 * - 视频应在进入可视区域后再主动执行 play()。
 *
 * 通过 `eager` 属性可强制首屏立即加载（用于 Hero 等首屏动画）。
 */

export type LazyVideoHandle = {
  /** 主动触发播放（用于父组件需要外部控制的场景，如对话状态切换） */
  play: () => void;
  /** 主动暂停 */
  pause: () => void;
  /** 重新加载（切换 src 后） */
  reload: () => void;
  /** 当前 video 元素（用于父组件直接操作） */
  video: HTMLVideoElement | null;
};

type Props = {
  /** 视频源（WebM 优先，可附带 MP4 fallback） */
  src: string;
  /** MP4 fallback 源（可选，用于不支持 WebM 的环境） */
  mp4Src?: string;
  /** 静态首帧 poster（WebP/PNG，建议带 alpha） */
  poster?: string;
  /** 是否首屏立即加载（绕过 IntersectionObserver）。默认 false。 */
  eager?: boolean;
  /** 预加载边距（rootMargin），默认 "200px"。 */
  rootMargin?: string;
  /** 容器额外 className */
  className?: string;
  /** 内层 video/poster 元素的额外 className（覆盖默认的 absolute inset-0）。
   *  提供时 video 与 poster 都会使用此 className + mediaStyle，不再 absolute 填充。 */
  mediaClassName?: string;
  /** 内层 video/poster 元素的 style（与 mediaClassName 配合使用） */
  mediaStyle?: React.CSSProperties;
  /** poster 淡入时长（ms），默认 400 */
  fadeDuration?: number;
  /** 是否循环。默认 true。 */
  loop?: boolean;
  /** alt 文本（用于 poster img） */
  alt?: string;
  /** 视频加载失败时的回调 */
  onError?: () => void;
  /** 视频可以播放时的回调 */
  onCanPlay?: () => void;
  /** aria-label */
  ariaLabel?: string;
  /** 是否禁用自动播放（仅加载，不自动 play）。默认 false。 */
  disableAutoplay?: boolean;
  /** 离开可视区域时是否暂停。默认 true。 */
  pauseWhenOutOfView?: boolean;
  /** 容器内层布局模式：
   *  - "fill"（默认）：video/poster absolute inset-0 填充容器
   *  - "natural"：video/poster 使用 mediaClassName/mediaStyle 自然布局（用于需要精确尺寸/transform 的场景）
   */
  layout?: "fill" | "natural";
};

const LazyVideo = forwardRef<LazyVideoHandle, Props>(function LazyVideo(
  {
    src,
    mp4Src,
    poster,
    eager = false,
    rootMargin = "200px",
    className,
    mediaClassName,
    mediaStyle,
    fadeDuration = 400,
    loop = true,
    alt = "",
    onError,
    onCanPlay,
    ariaLabel,
    disableAutoplay = false,
    pauseWhenOutOfView = true,
    layout = "fill",
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(eager);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const playedRef = useRef(false);

  useImperativeHandle(
    ref,
    () => ({
      play: () => {
        const v = videoRef.current;
        if (!v || !shouldLoad) return;
        const p = v.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
        playedRef.current = true;
      },
      pause: () => {
        videoRef.current?.pause();
      },
      reload: () => {
        const v = videoRef.current;
        if (!v) return;
        setReady(false);
        v.load();
      },
      video: videoRef.current,
    }),
    [shouldLoad],
  );

  // IntersectionObserver：非 eager 时检测可视区
  useEffect(() => {
    if (eager) {
      setShouldLoad(true);
      return;
    }
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldLoad((prev) => prev || true);
            const v = videoRef.current;
            if (v && !disableAutoplay) {
              const p = v.play();
              if (p && typeof p.catch === "function") p.catch(() => {});
              playedRef.current = true;
            }
          } else if (pauseWhenOutOfView) {
            videoRef.current?.pause();
          }
        }
      },
      { rootMargin, threshold: 0.01 },
    );
    observerRef.current = observer;
    observer.observe(el);
    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [eager, rootMargin, disableAutoplay, pauseWhenOutOfView]);

  // React may reuse the same <video> node inside carousels when only src changes.
  // Reset media state and explicitly reload so the previous animation frame cannot linger.
  useEffect(() => {
    setReady(false);
    setFailed(false);
    playedRef.current = false;

    const v = videoRef.current;
    if (!v || !shouldLoad) return;
    v.load();
    if (!disableAutoplay) {
      const p = v.play();
      if (p && typeof p.catch === "function") {
        p.then(() => {
          playedRef.current = true;
        }).catch(() => {});
      } else {
        playedRef.current = true;
      }
    }
  }, [src, mp4Src, shouldLoad, disableAutoplay]);

  // shouldLoad 变化时主动 load + play
  useEffect(() => {
    if (!shouldLoad) return;
    const v = videoRef.current;
    if (!v) return;
    v.load();
    if (!disableAutoplay) {
      const p = v.play();
      if (p && typeof p.catch === "function") {
        p.then(() => {
          playedRef.current = true;
        }).catch(() => {});
      } else {
        playedRef.current = true;
      }
    }
  }, [shouldLoad, disableAutoplay]);

  const handleCanPlay = () => {
    setReady(true);
    onCanPlay?.();
    if (!playedRef.current && !disableAutoplay) {
      const v = videoRef.current;
      if (v) {
        const p = v.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
        playedRef.current = true;
      }
    }
  };

  const handleError = () => {
    setFailed(true);
    onError?.();
  };

  const isFill = layout === "fill";
  const sharedMediaClass = isFill
    ? cn(
        "pointer-events-none absolute inset-0 h-full w-full select-none object-contain transition-opacity",
        mediaClassName,
      )
    : cn(
        "pointer-events-none block max-w-none select-none object-contain transition-opacity",
        mediaClassName,
      );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {poster && (
        <img
          src={poster}
          alt={alt}
          aria-hidden="true"
          draggable={false}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className={sharedMediaClass}
          style={{
            ...(mediaStyle ?? {}),
            opacity: ready && !failed ? 0 : 1,
            transitionDuration: `${fadeDuration}ms`,
          }}
        />
      )}
      {shouldLoad && !failed && (
        <video
          ref={videoRef}
          className={sharedMediaClass}
          style={{
            ...(mediaStyle ?? {}),
            opacity: ready ? 1 : 0,
            transitionDuration: `${fadeDuration}ms`,
          }}
          muted
          loop={loop}
          playsInline
          preload="auto"
          aria-label={ariaLabel}
          aria-hidden={ariaLabel ? undefined : true}
          onLoadedData={handleCanPlay}
          onCanPlay={handleCanPlay}
          onError={handleError}
        >
          <source src={src} type="video/webm" />
          {mp4Src && <source src={mp4Src} type="video/mp4" />}
        </video>
      )}
      {!poster && !ready && (
        <div className="absolute inset-0" aria-hidden="true" />
      )}
    </div>
  );
});

export default LazyVideo;
