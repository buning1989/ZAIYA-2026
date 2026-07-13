import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import {
  HOME_PHASE_ORDER,
  HOME_PHASE_SCENE,
  type HomeTimePhase,
} from "@/lib/homeTimePhase";

/* —— 首页在在动画场景：7 个时间段的 webm 视频叠放，通过 opacity 切换 ——
 * - preloadAll=true（体验模式轮播）：7 个 video 同时挂载并 preload="auto"，
 *   切换时零加载延迟，仅当前 phase 的 video play()，其余 pause()
 * - preloadAll=false（落地页 Hero）：只渲染当前 phase 的 1 个 video
 * - 切换使用 400ms opacity 交叉溶解，不闪烁
 * - 视频保持原始比例（object-contain），循环播放
 */

const ease = [0.22, 1, 0.36, 1] as const;

const SCENE_RENDER: Record<HomeTimePhase, { alt: string }> = {
  morning: { alt: "在在晨起" },
  forenoon: { alt: "在在上午" },
  noon: { alt: "在在午间" },
  afternoon: { alt: "在在下午" },
  dusk: { alt: "在在傍晚" },
  evening: { alt: "在在晚间" },
  night: { alt: "在在深夜" },
};

export default function ZaizaiHomeScene({
  phase,
  guide,
  preloadAll = false,
}: {
  phase: HomeTimePhase;
  guide?: ReactNode;
  /** 体验模式轮播：预挂载全部 7 个 video 避免切换卡顿；落地页 Hero 只需 1 个 */
  preloadAll?: boolean;
}) {
  const phases = preloadAll ? HOME_PHASE_ORDER : [phase];

  return (
    <div className="pointer-events-none relative h-[304px] w-[220px] overflow-visible">
      {guide && (
        <div className="absolute left-1/2 top-0 z-10 w-[240px] -translate-x-1/2 text-center">
          {guide}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <div className="relative h-[260px] w-[260px]">
          {phases.map((p) => (
            <PhaseVideo
              key={p}
              src={HOME_PHASE_SCENE[p]}
              alt={SCENE_RENDER[p].alt}
              isActive={p === phase}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PhaseVideo({
  src,
  alt,
  isActive,
}: {
  src: string;
  alt: string;
  isActive: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  // 切到当前 phase 时重置到开头并播放；切走时暂停，节省 CPU/GPU
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (isActive) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [isActive]);

  return (
    <motion.video
      ref={ref}
      src={src}
      draggable={false}
      initial={false}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 0.4, ease }}
      className="absolute inset-0 block h-full w-full select-none object-contain"
      muted
      playsInline
      loop
      preload="auto"
      controls={false}
      aria-label={alt}
    />
  );
}
