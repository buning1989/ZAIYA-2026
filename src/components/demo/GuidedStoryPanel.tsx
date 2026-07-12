import { AnimatePresence, motion } from "framer-motion";
import type { GuidedScenarioStep } from "./types";

type Props = {
  step: GuidedScenarioStep;
  scenarioName: string;
  total: number;
};

const ease = [0.22, 1, 0.36, 1] as const;

/* —— 右侧故事说明面板 ——
 * 与左侧手机 Demo 在同一 grid 行内垂直居中对齐。
 *
 * 顶部加入小晨小头像作为身份锚点，与进度标签同行：
 *   [小晨小头像] 小晨第一天 · 1/6
 *
 * 文字 4 层级（由强到弱）：
 *   1. story-step   12px  浅色  字距略大  —— 进度标签
 *   2. story-title  30px  深色  加粗     —— 当前节点标题（时间 + 标题合并）
 *   3. story-summary 18px 深色  半加粗   —— 一句话场景
 *   4. story-detail  15px  浅色  常规     —— 产品动作解释
 *
 * 小晨小头像只作为身份锚点，不抢主标题。
 * 步骤切换时整体柔和淡入，保持安静节奏。
 */
export default function GuidedStoryPanel({
  step,
  scenarioName,
  total,
}: Props) {
  return (
    <div className="flex h-full w-full max-w-[440px] flex-col justify-center lg:w-[420px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3, ease }}
        >
          {/* 进度标签 */}
          <p className="text-[12px] tracking-[0.14em] text-ink-faint">
            {scenarioName} · {step.order}/{total}
          </p>

          {/* 第 2 层：节点标题（时间 + 标题合并，最大字号、加粗） */}
          <h2 className="mt-4 text-[30px] font-bold leading-[1.2] text-ink">
            <span className="tabular-nums">{step.time}</span>
            <span className="ml-2">{step.title}</span>
          </h2>

          {/* 第 3 层：一句话场景（半加粗） */}
          <p className="mt-5 text-[18px] font-medium leading-[1.6] text-ink">
            {step.summary}
          </p>

          {/* 第 4 层：产品动作解释（浅色、行高舒适） */}
          {step.detail && (
            <p className="mt-4 text-[15px] leading-[1.7] text-ink-soft">
              {step.detail}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
