import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { HOME_PHASE_SCENE, type HomeTimePhase } from "@/lib/homeTimePhase";

/* —— 首页在在动画场景：按时间段选择对应 webm 视频，柔和淡入淡出 ——
 * - 7 个时间段对应 7 个不同的 webm 动画
 * - 切换使用 400ms 淡入淡出（sync 模式新旧同框交叉溶解），不闪烁
 * - 视频保持原始比例（object-contain），不拉伸变形；循环播放
 * - key 取 src：不同时间段触发重挂载，切换动画
 */

const ease = [0.22, 1, 0.36, 1] as const;

// 各时间段视频的渲染配置（外层占位 + 内层 media 尺寸 + 光学微调）
// 所有 webm 视频统一使用相同的显示尺寸
const SCENE_RENDER: Record<
  HomeTimePhase,
  { mediaClass: string; scale: number; x: number; y: number; alt: string }
> = {
  morning: { mediaClass: "h-[260px] w-[260px]", scale: 1.0, x: 0, y: 0, alt: "在在晨起" },
  forenoon: { mediaClass: "h-[260px] w-[260px]", scale: 1.0, x: 0, y: 0, alt: "在在上午" },
  noon: { mediaClass: "h-[260px] w-[260px]", scale: 1.0, x: 0, y: 0, alt: "在在午间" },
  afternoon: { mediaClass: "h-[260px] w-[260px]", scale: 1.0, x: 0, y: 0, alt: "在在下午" },
  dusk: { mediaClass: "h-[260px] w-[260px]", scale: 1.0, x: 0, y: 0, alt: "在在傍晚" },
  evening: { mediaClass: "h-[260px] w-[260px]", scale: 1.0, x: 0, y: 0, alt: "在在晚间" },
  night: { mediaClass: "h-[260px] w-[260px]", scale: 1.0, x: 0, y: 0, alt: "在在深夜" },
};

export default function ZaizaiHomeScene({
  phase,
  guide,
}: {
  phase: HomeTimePhase;
  guide?: ReactNode;
}) {
  const src = HOME_PHASE_SCENE[phase];
  const render = SCENE_RENDER[phase];

  return (
    <div className="pointer-events-none relative grid h-[190px] w-[220px] place-items-center overflow-visible">
      {guide && (
        <div className="absolute left-1/2 top-[4px] z-10 w-[226px] -translate-x-1/2">
          {guide}
        </div>
      )}
      <AnimatePresence mode="sync">
        <motion.video
          key={src}
          src={src}
          alt={render.alt}
          draggable={false}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease }}
          className={`block max-w-none select-none object-contain ${render.mediaClass}`}
          style={{
            transform: `translate(${render.x}px, ${render.y}px) scale(${render.scale})`,
            transformOrigin: "center center",
          }}
          autoPlay
          loop
          muted
          playsInline
          controls={false}
        />
      </AnimatePresence>
    </div>
  );
}
