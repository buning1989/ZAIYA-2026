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

/* —— 两周后开场页（纯信息页，无按钮）——
 * 拆分后的独立阶段页，只承载两周后的背景介绍。
 *
 * 结构：
 *   A. 小标签：第二周第一天
 *   B. 主标题 + 正文 + 引语
 *   C. 四张变化卡片
 *   D. 底部说明
 *
 * 不包含：按钮、进入第二天 CTA、返回链接。
 * 导航由 UnifiedDemoStage 的统一左右箭头和键盘事件承载。
 */
export default function TwoWeekTransition() {
  return (
    <div className="mx-auto w-full max-w-[680px]">
      {/* —— A. 小标签 —— */}
      <p className="text-center text-[12px] tracking-[0.18em] text-ink-faint">
        第二周第一天
      </p>

      {/* —— B. 主标题 + 正文 + 引语 —— */}
      <h1 className="mt-3 text-center text-[36px] font-bold leading-[1.25] text-ink">
        她还没有突然变好，但已经不再一路撑到崩溃
      </h1>

      <p className="mt-4 text-center text-[19px] leading-[1.6] text-ink">
        她还是会起不来、会请假、会被家人误解，但她开始更早求助，也开始真的做出一点改变。
      </p>

      <p className="mt-4 text-center text-[18px] leading-[1.6] text-ink-soft">
        “今天……好像没那么糟。”
      </p>

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
      </section>
    </div>
  );
}
