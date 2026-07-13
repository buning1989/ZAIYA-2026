import { useEffect, useRef, useState } from "react";

type Props = {
  /** 容器尺寸类名，需给出明确宽高（如 h-44 w-44）。 */
  className?: string;
  /** 是否绘制脚下接触阴影。 */
  shadow?: boolean;
  /** 可选：自定义视频源，不传时使用默认视频。 */
  src?: string;
};

export const ZAIZAI_VIDEO_SRC = "./assets/zaiya/zaiya-transparent.webm";
export const ZAIZAI_RELIEF_VIDEO_SRC = "./assets/zaiya/zaiya-relief-transparent.webm";
const ZAIZAI_VIDEO_POSTER = "./assets/zaiya/zaiya-wave-poster.png";

export default function ZaizaiVideo({
  className = "h-24 w-24",
  shadow = true,
  src = ZAIZAI_VIDEO_SRC,
}: Props) {
  const [reducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  });
  const [failed, setFailed] = useState(false);
  // 延迟一帧渲染 video：规避 StrictMode 双挂载与 AnimatePresence 切层时
  // 组件快速卸载导致的 <source> 请求被中止（net::ERR_ABORTED 控制台噪音）。
  const [canLoadVideo, setCanLoadVideo] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [inView, setInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setCanLoadVideo(true);
  }, []);

  // IntersectionObserver：检测可视区域，进入后才加载视频，离开后暂停
  useEffect(() => {
    if (reducedMotion || failed || !canLoadVideo) return;
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            // 进入可视区：主动 play（不依赖 autoplay）
            const v = videoRef.current;
            if (v) {
              const p = v.play();
              if (p && typeof p.catch === "function") p.catch(() => {});
            }
          } else {
            // 离开可视区：暂停
            videoRef.current?.pause();
          }
        }
      },
      { rootMargin: "200px", threshold: 0.01 },
    );
    observerRef.current = observer;
    observer.observe(el);
    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [reducedMotion, failed, canLoadVideo]);

  // 视频挂载后主动 load + play（inView 时）
  useEffect(() => {
    if (!inView) return;
    const v = videoRef.current;
    if (!v) return;
    v.load();
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, [inView]);

  if (reducedMotion || failed || !canLoadVideo) {
    return (
      <div
        ref={containerRef}
        className={`pointer-events-none relative overflow-hidden ${className}`}
      >
        <img
          src={ZAIZAI_VIDEO_POSTER}
          alt=""
          aria-hidden="true"
          className="block h-full w-full select-none object-contain"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none relative overflow-visible ${className}`}
    >
      {shadow && (
        <div className="absolute left-1/2 top-[84%] h-[10%] w-[56%] -translate-x-1/2 rounded-full bg-black/18 blur-[7px]" />
      )}
      {/* 静态首帧 poster：视频未 ready 前显示，ready 后由 video 覆盖 */}
      <img
        src={ZAIZAI_VIDEO_POSTER}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 block h-[170%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none object-contain"
      />
      {inView && (
        <video
          ref={videoRef}
          key={src}
          className="absolute left-1/2 top-1/2 block h-[170%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none"
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          onError={() => setFailed(true)}
        >
          <source src={src} type="video/webm" />
        </video>
      )}
    </div>
  );
}
