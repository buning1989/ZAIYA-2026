import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { preloadVideo } from "@/lib/mediaPreloader";

/* —— 对话模式顶部在在动画 ——
 * 对话场景统一使用静静趴着 WebM，保留 idle / listening / thinking / responding
 * 四状态接口，避免影响父级对话状态机。
 * - 四个 video 常驻叠层，preload="none"：仅 active 状态由 play() 触发加载
 *   性能优化（2026-07-13）：从 preload="auto" 改为 "none"，避免一次性加载 4 个视频
 * - 预加载优化：状态接口仍走预加载链，但当前四状态共享同一个 WebM。
 * - 切换加 200ms 淡入淡出，容器尺寸不变，不抖动
 * - 任一视频加载失败：回退到 idle，控制台 warning，不阻断使用
 * - video 容器背景透明，承接 WebM 透明底素材
 */

export type DialogueAnimState =
  | "idle"
  | "listening"
  | "thinking"
  | "responding";

export const DIALOGUE_PRONE_REST_VIDEO =
  "./assets/zaiya/dialogue/zaiya-dialogue-prone-rest.webm";

const VIDEO_SOURCES: Record<DialogueAnimState, string> = {
  idle: DIALOGUE_PRONE_REST_VIDEO,
  listening: DIALOGUE_PRONE_REST_VIDEO,
  thinking: DIALOGUE_PRONE_REST_VIDEO,
  responding: DIALOGUE_PRONE_REST_VIDEO,
};

// 当前素材是持续陪伴动作，四种对话状态都循环播放。
const LOOP_STATES: Set<DialogueAnimState> = new Set([
  "idle",
  "listening",
  "thinking",
  "responding",
]);

const CROSSFADE_MS = 200;
const ease = "cubic-bezier(0.22, 1, 0.36, 1)";

interface Props {
  /** 当前对话动画状态（由父级依据优先级计算后传入） */
  state: DialogueAnimState;
  /** responding 短动作播放结束时的回调，父级可借此提前切回 idle */
  onRespondingEnd?: () => void;
  /** 容器额外 className（尺寸/定位由父级控制，保持与原 video 一致） */
  className?: string;
  /** 内层 video 额外 className */
  videoClassName?: string;
}

export default function DialogueZaiyaAnimation({
  state,
  onRespondingEnd,
  className,
  videoClassName,
}: Props) {
  const videoRefs = useRef<Record<DialogueAnimState, HTMLVideoElement | null>>({
    idle: null,
    listening: null,
    thinking: null,
    responding: null,
  });
  const [failed, setFailed] = useState<Set<DialogueAnimState>>(new Set());

  // 目标状态对应的视频加载失败时，回退到 idle（idle 也失败则无动画，可接受）
  const effectiveState: DialogueAnimState = failed.has(state) ? "idle" : state;

  // 状态切换时：激活对应 video（从头播放），其余暂停
  // 同时预加载下一个状态的视频（预加载链）
  useEffect(() => {
    const active = effectiveState;
    (Object.keys(videoRefs.current) as DialogueAnimState[]).forEach((s) => {
      const el = videoRefs.current[s];
      if (!el) return;
      if (s === active) {
        // 从头开始播放，确保状态进入时动作干净
        try {
          el.currentTime = 0;
        } catch {
          // 某些浏览器在未 loaded 前设置 currentTime 会抛错，忽略
        }
        const p = el.play();
        if (p && typeof p.catch === "function") {
          p.catch(() => {
            /* autoplay 受限等场景静默处理 */
          });
        }
      } else {
        el.pause();
      }
    });

    // 预加载链：当前状态显示时，提前预加载下一个可能的状态
    const NEXT_STATE: Record<DialogueAnimState, DialogueAnimState> = {
      idle: "listening",
      listening: "thinking",
      thinking: "responding",
      responding: "idle",
    };
    const nextState = NEXT_STATE[active];
    if (nextState && nextState !== active) {
      preloadVideo(VIDEO_SOURCES[nextState]);
    }
  }, [effectiveState]);

  return (
    <div
      className={cn(
        "relative h-[338px] w-[190px] select-none",
        className,
      )}
      style={{
        transform: "translateY(10px) scale(1.12)",
        transformOrigin: "center center",
      }}
    >
      {(Object.keys(VIDEO_SOURCES) as DialogueAnimState[]).map((s) => {
        const active = s === effectiveState;
        const loop = LOOP_STATES.has(s);
        return (
          <video
            key={s}
            ref={(el) => {
              videoRefs.current[s] = el;
            }}
            src={VIDEO_SOURCES[s]}
            muted
            playsInline
            preload="none"
            loop={loop}
            // 初始挂载时让 idle 自动播放，其余由 effect 接管
            autoPlay={s === "idle"}
            onEnded={() => {
              // responding 短动作播放结束：通知父级切回 idle
              if (s === "responding") onRespondingEnd?.();
            }}
            onError={() => {
              setFailed((prev) => {
                if (prev.has(s)) return prev;
                console.warn(
                  `[DialogueZaiyaAnimation] 视频加载失败，回退 idle：${VIDEO_SOURCES[s]}`,
                );
                return new Set(prev).add(s);
              });
            }}
            className={cn(
              "absolute inset-0 h-full w-full max-w-none object-contain transition-opacity",
              videoClassName,
            )}
            style={{
              opacity: active ? 1 : 0,
              transform: "scale(1.4)",
              transformOrigin: "center center",
              transitionDuration: `${CROSSFADE_MS}ms`,
              transitionTimingFunction: ease,
            }}
          />
        );
      })}
    </div>
  );
}
