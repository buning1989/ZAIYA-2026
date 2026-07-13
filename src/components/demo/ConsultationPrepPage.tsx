import {
  consultationSteps,
  infoCards,
  stakeholderValues,
  consultationPageContent,
} from "./scenarios/consultationPrep";

type Props = {
  onNext: () => void;
  onBack: () => void;
};

/* —— 复诊整理页面 ——
 * 在两周后故事结束后，新增独立展示区块。
 * 展示日常碎片如何整理成专业人士可理解的信息。
 *
 * 结构：
 *   A. 标题区：小标签 + 主标题 + 副标题
 *   B. 报告生成流程：三个步骤卡片
 *   C. 四张信息卡：睡眠/用药/身体反应/学校功能
 *   D. 专业边界说明
 *   E. 三方价值：对小晨/对家长/对医生
 *   F. 页面收束
 */
export default function ConsultationPrepPage({ onNext, onBack }: Props) {
  return (
    <div className="mx-auto w-full max-w-[680px]">
      {/* —— A. 标题区 —— */}
      <section aria-label="复诊整理标题">
        {/* 小标签 */}
        <p className="text-center text-[12px] tracking-[0.18em] text-ink-faint">
          {consultationPageContent.tag}
        </p>

        {/* 主标题 */}
        <h1 className="mt-3 text-center text-[36px] font-bold leading-[1.25] text-ink">
          {consultationPageContent.title}
        </h1>

        {/* 副标题 */}
        <p className="mt-4 text-center text-[18px] leading-[1.6] text-ink-soft">
          {consultationPageContent.subtitle}
        </p>
      </section>

      {/* —— B. 报告生成流程 —— */}
      <section aria-label="报告生成流程" className="mt-10">
        <div className="space-y-4">
          {consultationSteps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-line-soft bg-card-soft/60 px-6 py-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-action-primary/10 text-[14px] font-semibold text-action-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-[16px] font-semibold leading-[1.4] text-ink">
                    {step.title}
                  </p>
                  <p className="mt-2 text-[14px] leading-[1.7] text-ink-soft">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* —— C. 四张信息卡 —— */}
      <section aria-label="信息卡片" className="mt-10">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {infoCards.map((card) => (
            <div
              key={card.dimension}
              className="rounded-2xl border border-line-soft bg-card-soft/60 px-5 py-4"
            >
              <p className="text-[13px] font-medium tracking-[0.08em] text-ink-faint">
                {card.dimension}
              </p>
              <p className="mt-1.5 text-[15px] font-medium leading-[1.5] text-ink">
                {card.info}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* —— D. 专业边界说明 —— */}
      <section aria-label="专业边界说明" className="mt-8">
        <p className="text-center text-[14px] leading-[1.7] text-ink-soft">
          {consultationPageContent.disclaimer}
        </p>
      </section>

      {/* —— E. 三方价值 —— */}
      <section aria-label="三方价值" className="mt-10">
        <div className="space-y-4">
          {stakeholderValues.map((value) => (
            <div
              key={value.target}
              className="rounded-2xl border border-line-soft bg-card-soft/60 px-6 py-5"
            >
              <p className="text-[14px] font-semibold tracking-[0.08em] text-ink">
                {value.target}
              </p>
              <p className="mt-2 text-[15px] leading-[1.7] text-ink-soft">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* —— F. 页面收束 —— */}
      <section
        aria-label="页面收束"
        className="mt-10 border-t border-line-soft pt-8"
      >
        <p className="text-center text-[16px] leading-[1.7] text-ink">
          {consultationPageContent.closing}
        </p>

        {/* 主按钮 */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={onNext}
            className="inline-flex h-12 w-full max-w-[280px] items-center justify-center rounded-full bg-action-primary px-6 text-[15px] font-medium text-action-primary-text transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
          >
            看完整案例总结
          </button>

          <button
            onClick={onBack}
            className="inline-flex h-9 items-center rounded-full px-4 text-[13px] text-ink-faint transition-colors hover:text-ink-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
          >
            ← 回到两周后
          </button>
        </div>
      </section>
    </div>
  );
}
