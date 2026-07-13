type Props = {
  onEnter: () => void;
  onBack?: () => void;
};

type ChangePoint = {
  title: string;
  detail: string;
};

const changePoints: ChangePoint[] = [
  {
    title: "求助提前",
    detail: "从崩溃后才开口，到刚开始卡住就来找在在。",
  },
  {
    title: "学会自我调节",
    detail: "从被带着做呼吸，到主动打开练习稳定自己。",
  },
  {
    title: "真实行动发生",
    detail: "从卷子一打开就关上，到整理数学、去学校交作业。",
  },
  {
    title: "进步没有被抹掉",
    detail: "一次争吵，不再覆盖她这一天已经做到的事。",
  },
];

/* —— 第一天结束总结 + 两周后开场 ——
 * 替代原 TwoWeekTransition。
 *
 * 结构：
 *   A. 第一天结束总结
 *   B. 两周后开场（身份区：小标签 + 主标题 + 副标题 + 引语）
 *   C. 四张变化卡片
 *   D. 底部说明
 *
 * 所有文案严格来自 Word 文档原文。
 */
export default function TwoWeekTransition({ onEnter, onBack }: Props) {
  return (
    <div className="mx-auto w-full max-w-[680px]">
      {/* —— A. 第一天结束总结 —— */}
      <section aria-label="第一天结束总结" className="border-b border-line-soft pb-8">
        <p className="text-center text-[12px] tracking-[0.18em] text-ink-faint">
          第一天结束
        </p>
        <p className="mt-4 text-center text-[17px] leading-[1.7] text-ink">
          在呀 ZÀIYA 持续识别用户卡住的具体环节，并调用对应的心理学方法，让情绪调节、饮食、学习和睡眠中的下一步重新发生。
        </p>
      </section>

      {/* —— B. 两周后开场 —— */}
      <section aria-label="两周后过渡" className="mt-8">
        {/* 小标签 */}
        <p className="text-center text-[12px] tracking-[0.18em] text-ink-faint">
          两周后
        </p>

        {/* 主标题 */}
        <h1 className="mt-3 text-center text-[36px] font-bold leading-[1.25] text-ink">
          她还没有突然变好，但已经不再一路撑到崩溃
        </h1>

        {/* 副标题 */}
        <p className="mt-4 text-center text-[19px] leading-[1.6] text-ink">
          她还是会起不来、会请假、会被家人误解，但她开始更早求助，也开始真的做出一点改变。
        </p>

        {/* 引语 */}
        <p className="mt-4 text-center text-[18px] leading-[1.6] text-ink-soft">
          “今天……好像没那么糟。”
        </p>
      </section>

      {/* —— C. 四张变化卡片区 —— */}
      <section aria-label="很小的变化" className="mt-10">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {changePoints.map((point) => (
            <div
              key={point.title}
              className="rounded-2xl border border-line-soft bg-card-soft/60 px-5 py-4"
            >
              <p className="text-[16px] font-semibold leading-[1.4] text-ink">
                {point.title}
              </p>
              <p className="mt-1.5 text-[14px] leading-[1.6] text-ink-soft">
                {point.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* —— D. 底部说明 —— */}
      <section
        aria-label="底部说明"
        className="mt-10 border-t border-line-soft pt-8"
      >
        <p className="text-center text-[16px] leading-[1.7] text-ink">
          在呀 ZÀIYA 没有让她立刻好起来。
        </p>
        <p className="mt-3 text-center text-[16px] leading-[1.7] text-ink-soft">
          它让支持发生在失控之前，让每一次微小行动都能发生、被看见，并继续积累。
        </p>

        {/* 主按钮 */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={onEnter}
            className="inline-flex h-12 w-full max-w-[280px] items-center justify-center rounded-full bg-action-primary px-6 text-[15px] font-medium text-action-primary-text transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
          >
            进入两周后的一天
          </button>

          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex h-9 items-center rounded-full px-4 text-[13px] text-ink-faint transition-colors hover:text-ink-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
            >
              ← 回到第一天
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
