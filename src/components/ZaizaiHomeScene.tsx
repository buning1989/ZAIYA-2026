import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { HOME_PHASE_SCENE, type HomeTimePhase } from "@/lib/homeTimePhase";

/* —— 首页在在动画场景：按时间段选择对应 GIF，柔和淡入淡出 ——
 * - morning/daytime 复用 wake-up 拉开窗帘动画（与缓解选择页同源）
 * - evening → 夜晚看书翻页；night → 睡觉温和呼吸
 * - 切换使用 400ms 淡入淡出（sync 模式新旧同框交叉溶解），不闪烁
 * - GIF 保持原始比例（object-contain），不拉伸变形；循环播放
 * - key 取 src：morning↔daytime 同源不触发重挂载，避免无意义重播
 */

const ease = [0.22, 1, 0.36, 1] as const;

// 各时间段 GIF 的渲染配置（外层占位 + 内层 media 尺寸 + 光学微调）
// wake-up 为 640×1138(9:16)，主体位于画布中部；reading/sleeping 为 640×640(1:1)。
// 方形 GIF 取较大显示尺寸，使主体视觉重量与起床场景接近；透明画布自然承接于白底。
const SCENE_RENDER: Record<
  HomeTimePhase,
  { mediaClass: string; scale: number; x: number; y: number; alt: string }
> = {
  morning: { mediaClass: "h-[338px] w-[190px]", scale: 1.12, x: -3, y: -2, alt: "在在起床" },
  daytime: { mediaClass: "h-[338px] w-[190px]", scale: 1.12, x: -3, y: -2, alt: "在在起床" },
  evening: { mediaClass: "h-[260px] w-[260px]", scale: 1.0, x: 1, y: -3, alt: "在在夜晚看书" },
  night: { mediaClass: "h-[260px] w-[260px]", scale: 1.0, x: 2, y: -6, alt: "在在睡觉" },
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
        <motion.img
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
        />
      </AnimatePresence>
    </div>
  );
}
