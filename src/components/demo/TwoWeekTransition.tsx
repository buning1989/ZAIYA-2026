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
    title: "入口前移",
    detail: "醒来后，她会主动看一眼在在。",
  },
  {
    title: "求助提前",
    detail: "还没完全崩溃时，她会先来求助。",
  },
  {
    title: "事实留下",
    detail: "吃了什么、出门做了什么，开始被轻轻记下来。",
  },
  {
    title: "收尾出现",
    detail: "睡前，她能说出今天发生过的一点点不同。",
  },
];

/* —— 两周后过渡页 ——
 * 出现在第一天最后一步与第二天第一步之间。
 *
 * 版式与第一天背景介绍页（XiaochenCaseIntro）保持一致：
 *   A. 身份区：小标签 + 主标题 + 副标题 + 引语
 *   B. 2×2 卡片区：四个小变化
 *   C. 观看提示区：分割线 + 主按钮
 *
 * 核心判断：第一页讲“她卡在哪里”，过渡页讲“卡住还在，但哪些地方开始松动”。
 * 不说「康复 / 治好 / 恢复正常」，明确仍然困难，但生活齿轮开始重新咬合。
 */
export default function TwoWeekTransition({ onEnter, onBack }: Props) {
  return (
    <div className="mx-auto w-full max-w-[680px]">
      {/* —— A. 身份区 —— */}
      <section aria-label="两周后过渡">
        {/* 小标签 */}
        <p className="text-center text-[12px] tracking-[0.18em] text-ink-faint">
          使用约 2 周后
        </p>

        {/* 主标题 */}
        <h1 className="mt-3 text-center text-[40px] font-bold leading-[1.2] text-ink">
          两周后，小晨没有突然变好
        </h1>

        {/* 副标题 */}
        <p className="mt-4 text-center text-[21px] font-medium leading-[1.5] text-ink">
          她还是会起不来、会请假、会在学习前发紧，也还是会被家人误解。
        </p>

        {/* 引语 */}
        <p className="mt-4 text-center text-[19px] leading-[1.6] text-ink-soft">
          “今天好像没那么糟。”
        </p>
      </section>

      {/* —— B. 小变化卡片区 —— */}
      <section
        aria-label="很小的变化"
        className="mt-10"
      >
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

      {/* —— C. 观看提示区 —— */}
      <section
        aria-label="评委观看提示"
        className="mt-10 border-t border-line-soft pt-8"
      >
        <p className="text-center text-[16px] leading-[1.7] text-ink">
          <span className="font-semibold">接下来看的不是一个“被治好”的小晨。</span>
        </p>
        <p className="mt-3 text-center text-[16px] leading-[1.7] text-ink-soft">
          而是一个仍然困难、但生活齿轮开始重新咬合的两周后。
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
