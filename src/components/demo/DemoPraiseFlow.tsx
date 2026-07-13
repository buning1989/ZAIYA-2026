import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { getGradient } from "@/data/praise";

/* —— 第二周 16:30 节点：夸夸卡创建 → 保存结果 演示流程 ——
 *
 * 状态 A（edit）：创建夸夸卡
 *   - 在在气泡「今天有什么小小的好事发生吗？」
 *   - 已填写好的卡片内容（固定 Demo 文案，不让评委输入）
 *   - 保存按钮
 *
 * 状态 B（saved）：保存后的卡片
 *   - 完整卡片内容
 *   - 轻量提示「已经为自己留下来了」
 *   - 不展示能量、积分、连续打卡
 *
 * 数据隔离：所有数据为组件内固定 Demo 数据，不写入 localStorage、
 * 不触发能量奖励、不调用真实业务接口、不影响自由体验模式。
 *
 * 视觉对齐：复用 PraisePage.EditView 的渐变沉浸结构（左返回/右保存 + 中央居中文案）。
 * 卡片颜色使用固定 g4（暖米），避免每次返回随机变化。
 *
 * 状态重置：组件卸载（离开节点）后重新挂载时，自动恢复到状态 A。
 */

const ease = [0.22, 1, 0.36, 1] as const;

type FlowState = "edit" | "saved";

/* 固定 Demo 数据 —— 严格对齐剧情文件 */
const BUBBLE_TEXT = "今天有什么小小的好事发生吗？";

const CARD_TEXT = "今天把这两周整理好了，\n还写下了最想问医生的那句话。";

const SAVED_HINT = "已经为自己留下来了";

/* 固定卡片颜色：暖米（g4），与前后节点协调的低饱和暖色 */
const CARD_GRADIENT_ID = "g4";

export default function DemoPraiseFlow() {
  const [state, setState] = useState<FlowState>("edit");
  const prefersReducedMotion = useReducedMotion();
  const gradient = getGradient(CARD_GRADIENT_ID);

  return (
    <AnimatePresence mode="wait">
      {state === "edit" ? (
        <motion.div
          key="edit"
          className="absolute inset-0 z-30 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease }}
          style={{
            background: `linear-gradient(140deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
          }}
        >
          {/* 顶部：左返回 / 右保存（对齐真实 EditView） */}
          <div className="flex items-center justify-between px-5 pt-14 pb-2">
            <button
              type="button"
              aria-label="返回"
              className="grid h-8 w-8 place-items-center rounded-full bg-white/50 text-ink-soft backdrop-blur-sm"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => setState("saved")}
              className="rounded-full bg-action-primary px-4 py-1.5 text-[13px] font-medium text-action-primary-text backdrop-blur-sm transition-opacity hover:opacity-90"
            >
              保存这张卡片
            </button>
          </div>

          {/* 在在气泡 */}
          <div className="px-5 pt-2">
            <div className="mx-auto max-w-[260px] rounded-lg bg-white/70 px-3 py-2 backdrop-blur-sm">
              <p className="text-center text-[13px] leading-relaxed text-ink-soft">
                {BUBBLE_TEXT}
              </p>
            </div>
          </div>

          {/* 中央已填写好的卡片内容 */}
          <div className="flex flex-1 flex-col items-center justify-center px-8">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease }}
              className="whitespace-pre-line text-center text-[18px] leading-[1.6] tracking-normal text-ink"
            >
              {CARD_TEXT}
            </motion.p>
          </div>

          {/* 底部留白 */}
          <div className="h-10" />
        </motion.div>
      ) : (
        <motion.div
          key="saved"
          className="absolute inset-0 z-30 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease }}
          style={{
            background: `linear-gradient(140deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
          }}
        >
          {/* 顶部：左返回（保存后不展示保存按钮） */}
          <div className="flex items-center justify-between px-5 pt-14 pb-2">
            <button
              type="button"
              aria-label="返回"
              className="grid h-8 w-8 place-items-center rounded-full bg-white/50 text-ink-soft backdrop-blur-sm"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          </div>

          {/* 轻量提示 */}
          <div className="px-5 pt-2">
            <p className="text-center text-[13px] text-ink-soft">
              {SAVED_HINT}
            </p>
          </div>

          {/* 主体：完整卡片内容 */}
          <div className="flex flex-1 flex-col items-center justify-center px-8">
            <motion.p
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease }}
              className="whitespace-pre-line text-center text-[20px] leading-relaxed text-ink"
            >
              {CARD_TEXT}
            </motion.p>
          </div>

          {/* 底部留白 */}
          <div className="h-10" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
