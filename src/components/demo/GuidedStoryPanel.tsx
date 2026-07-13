import { AnimatePresence, motion } from "framer-motion";
import { moduleLabelMap, type GuidedScenarioStep } from "./types";

type Props = {
  step: GuidedScenarioStep;
  scenarioName: string;
  total: number;
};

const ease = [0.22, 1, 0.36, 1] as const;

/* —— 右侧故事说明面板 ——
 * 四层信息结构：
 *   1. 场景元信息（eyebrow：案例名 · 序号）
 *   2. 场景标题（时间｜标题）
 *   3. 事件叙事（narrative，段首关键词可选加粗）
 *   4. 设计依据（为什么这样设计 + 心理学方法标签 + 普通语言解释 + 最终设计目标）
 *
 * 正文阅读区域 max-width 560px。
 * 必要时允许右侧区域内部纵向滚动。
 */
export default function GuidedStoryPanel({
  step,
  scenarioName,
  total,
}: Props) {
  const tags = step.moduleTags ?? [];
  const rationaleTags = step.principles
    .split(" × ")
    .map((t) => t.trim())
    .filter(Boolean);
  const hasPlain = Boolean(step.plainExplanation);

  return (
    <div className="flex h-full w-full max-w-[560px] flex-col justify-center overflow-y-auto pr-1">
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3, ease }}
        >
          {/* 1. 场景元信息 */}
          <p className="text-[12px] leading-[18px] font-medium text-[#8A9285]">
            {scenarioName} · {step.order}/{total}
          </p>

          {/* 2. 场景标题（时间 ｜ 标题） */}
          <h2 className="mt-[14px] text-[28px] font-bold leading-[1.25] tracking-[-0.02em] text-ink">
            <span className="tabular-nums">{step.time}</span>
            <span className="mx-2 text-[#8A9285]">｜</span>
            <span>{step.title}</span>
          </h2>

          {/* 涉及模块标签 */}
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] tracking-[0.08em] text-[#8A9285]">
                涉及模块
              </span>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#DDE1D8] bg-white px-2 py-[3px] text-[11px] leading-[20px] text-[#657060]"
                >
                  {moduleLabelMap[tag]}
                </span>
              ))}
            </div>
          )}

          {/* 3. 事件叙事 */}
          <div className="mt-[26px] space-y-[14px]">
            {step.narrative.map((paragraph, index) => {
              const lead = step.narrativeLeads?.[index];
              if (lead && lead.length > 0 && paragraph.startsWith(lead)) {
                return (
                  <p
                    key={index}
                    className="text-[16px] leading-[1.8] font-normal text-[#3E453B]"
                  >
                    <span className="font-semibold text-[#273123]">
                      {lead}
                    </span>
                    {paragraph.slice(lead.length)}
                  </p>
                );
              }
              return (
                <p
                  key={index}
                  className="text-[16px] leading-[1.8] font-normal text-[#3E453B]"
                >
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* 4. 设计依据：为什么这样设计 */}
          <div className="mt-[28px] border-t border-t-[#E6E8E2] border-l-2 border-l-[#52604A] pt-[22px] pl-4">
            <p className="text-[13px] font-medium tracking-[0.08em] text-[#657060]">
              为什么这样设计
            </p>

            {/* 心理学方法标签 */}
            {rationaleTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {rationaleTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#DDE1D8] bg-white px-[9px] py-[3px] text-[12px] leading-[20px] text-[#657060]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* 普通语言解释（仅部分节点提供） */}
            {hasPlain && (
              <p className="mt-[14px] text-[15px] leading-[1.75] font-normal text-[#596055]">
                {step.plainExplanation}
              </p>
            )}

            {/* 最终设计目标 */}
            <p
              className={`text-[15px] leading-[1.7] font-semibold text-[#2F392B] ${
                hasPlain ? "mt-[10px]" : "mt-[14px]"
              }`}
            >
              {step.explanation}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
