import { AnimatePresence, motion } from "framer-motion";
import { moduleLabelMap, type GuidedScenarioStep } from "./types";

type Props = {
  step: GuidedScenarioStep;
  scenarioName: string;
  total: number;
};

const ease = [0.22, 1, 0.36, 1] as const;

/* —— 右侧故事说明面板 ——
 * 统一四层结构：
 *   1. 进度标签 + 时间｜标题
 *   2. 涉及模块标签
 *   3. 连续故事正文（narrative 数组自然分段）
 *   4. "为什么这样做" + 心理学方法（principles）+ 作用说明（explanation）
 *
 * 不缩小正文字号。
 * 必要时允许右侧区域内部纵向滚动。
 */
export default function GuidedStoryPanel({
  step,
  scenarioName,
  total,
}: Props) {
  const tags = step.moduleTags ?? [];

  return (
    <div className="flex h-full w-full max-w-[480px] flex-col justify-center overflow-y-auto lg:w-[460px] lg:pr-2">
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
          <h2 className="mt-4 text-[28px] font-bold leading-[1.2] text-ink">
            <span className="tabular-nums">{step.time}</span>
            <span className="mx-2 text-ink-faint">｜</span>
            <span>{step.title}</span>
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

          {/* 连续故事正文 */}
          <div className="mt-5 space-y-3">
            {step.narrative.map((paragraph, index) => (
              <p
                key={index}
                className="text-[16px] leading-[1.75] text-ink"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* 为什么这样做 */}
          <div className="mt-6 border-t border-line-soft pt-5">
            <p className="text-[13px] font-medium tracking-[0.08em] text-ink-faint">
              为什么这样做
            </p>
            <p className="mt-2 text-[14px] leading-[1.7] text-ink-soft">
              {step.principles}
            </p>
            <p className="mt-2 text-[15px] leading-[1.7] text-ink">
              {step.explanation}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
