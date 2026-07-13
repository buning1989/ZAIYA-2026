import { AnimatePresence, motion } from "framer-motion";
import { moduleLabelMap, type GuidedScenarioStep } from "./types";

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
 *   [小晨小头像] 小晨第一天 · 1/7
 *
 * 三层叙事结构：
 *   1. 小晨：用户状态描述
 *   2. 在呀：产品回应/行动
 *   3. 意义/变化：结果说明
 *
 * 步骤切换时整体柔和淡入，保持安静节奏。
 */
export default function GuidedStoryPanel({
  step,
  scenarioName,
  total,
}: Props) {
  const tags = step.moduleTags ?? [];

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

          {/* 节点标题（时间 + 标题合并，最大字号、加粗） */}
          <h2 className="mt-4 text-[30px] font-bold leading-[1.2] text-ink">
            <span className="tabular-nums">{step.time}</span>
            <span className="ml-2">{step.title}</span>
          </h2>

          {/* 涉及的产品模块标签（低调但可见） */}
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] tracking-[0.08em] text-ink-faint">
                涉及模块
              </span>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line bg-white/60 px-2 py-0.5 text-[11px] text-ink-soft"
                >
                  {moduleLabelMap[tag]}
                </span>
              ))}
            </div>
          )}

          {/* 三层叙事结构 */}
          <div className="mt-5 space-y-4">
            {/* 第一层：小晨 */}
            <div>
              <p className="text-[12px] font-medium tracking-[0.08em] text-ink-faint">
                小晨
              </p>
              <p className="mt-1.5 text-[16px] leading-[1.7] text-ink">
                {step.userState}
              </p>
            </div>

            {/* 第二层：在呀 */}
            <div>
              <p className="text-[12px] font-medium tracking-[0.08em] text-ink-faint">
                在呀
              </p>
              <p className="mt-1.5 text-[16px] leading-[1.7] text-ink">
                {step.zaiyaAction}
              </p>
            </div>

            {/* 第三层：意义/变化 */}
            <div>
              <p className="text-[12px] font-medium tracking-[0.08em] text-ink-faint">
                {step.resultLabel}
              </p>
              <p className="mt-1.5 text-[16px] leading-[1.7] text-ink-soft">
                {step.result}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
