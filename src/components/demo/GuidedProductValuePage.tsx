import type { ReactNode } from "react";

/* —— 支持交付页｜记录如何进入支持流程 ——
 * Guided Demo 第二张总结页。独立阶段页，第三方视角描述小晨如何自主确认，
 * 并把两周记录交给医疗、家庭、学校支持者。
 *
 * 结构：
 *   A. 主标题
 *   B. 副标题
 *   C. 三张并列支持交付卡片（医疗 / 家庭 / 学校，与第一页同款横向等高布局）
 *   D. 居中收束语（独立于卡片）
 *   E. CTA 前收束语
 *   F. 底部主按钮（进入自由体验模式，使用全局行动绿）
 *
 * 不包含：数据图表、产品机制、GPM/BPS 理论、第一页中的记录 / 整理 / 回看内容、
 * 中心关系图、连线、信息确认说明条、"重新观看案例"按钮。
 * 视觉与第一张总结页保持一组：相同宽度、标题字号、卡片圆角、边框和背景。
 *
 * 作为 Guided Demo 最后一页，左箭头由 UnifiedDemoStage 统一承载返回第一页；
 * 右箭头由 UnifiedDemoStage 统一隐藏，不允许继续循环到案例开头。
 */

type Props = {
  /** 进入自由体验：切换到自由体验模式 */
  onEnterFreeExperience: () => void;
};

type RelationCard = {
  tag: string;
  title: string;
  body: ReactNode;
};

const relationCards: RelationCard[] = [
  {
    tag: "医疗｜明天",
    title: "王医生会第一次看到这两周",
    body: (
      <>
        <p>不是“她说她最近很累”，</p>
        <p>是十天的入睡时间、三餐记录、几次哭泣发生在什么时候。</p>
        <p className="mt-3">
          没有结论，没有解释——
          <br />
          判断仍然是医生的事。
        </p>
      </>
    ),
  },
  {
    tag: "家庭｜明天",
    title: "妈妈第一次不用替她描述",
    body: (
      <>
        <p>诊室里的材料，是小晨自己带去的。</p>
        <p>这两周过得怎么样，妈妈不用再猜。</p>
      </>
    ),
  },
  {
    tag: "学校｜之后",
    title: "老师可以早一点知道她卡在哪儿",
    body: (
      <>
        <p>不是成绩，也不是请假天数——</p>
        <p>是她哪几天连起床都没做到。</p>
        <p className="mt-3">
          前提同样是：
          <br />
          <strong className="font-medium text-ink">她愿意，而且她按了确认。</strong>
        </p>
      </>
    ),
  },
];

export default function GuidedProductValuePage({
  onEnterFreeExperience,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-[920px]">
      {/* —— A. 主标题 —— */}
      <h1 className="text-center text-[26px] font-semibold leading-[1.5] text-ink">
        接下来，会发生什么
      </h1>

      {/* —— B. 副标题 —— */}
      <p className="mt-6 text-center text-[17px] leading-[1.8] text-ink-soft">
        这两周记下的东西，暂时只在小晨自己手里。
        <br />
        从明天开始，它会一件一件地，被交出去——每一次，都由她自己确认。
      </p>

      {/* —— C. 三张并列支持交付卡片 —— */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {relationCards.map((card) => (
          <div
            key={card.title}
            className="flex min-h-[238px] flex-col rounded-2xl border border-line-soft bg-white px-5 py-5"
          >
            <span className="inline-block rounded-full border border-line bg-white px-2 py-0.5 text-[11px] tracking-[0.04em] text-ink-soft">
              {card.tag}
            </span>
            <p className="mt-3 text-[16px] font-normal leading-[1.4] text-ink">
              {card.title}
            </p>
            <div className="mt-3 space-y-2 text-[14px] leading-[1.75] text-ink-soft">
              {card.body}
            </div>
          </div>
        ))}
      </div>

      {/* —— D. 居中收束语 —— */}
      <p className="mt-12 text-center text-[17px] font-medium leading-[1.85] text-ink-soft">
        在呀不替她说话。
        <br />
        它只是让她第一次有东西可以拿出来——
        <br />
        交给谁，什么时候交，交多少，都由她自己决定。
      </p>

      {/* —— E. CTA 前收束语 —— */}
      <p className="mt-7 text-center text-[16px] font-medium leading-[1.8] text-ink-soft">
        不是替她表达，
        <br />
        而是让她第一次有材料，能够把自己的生活状态带出去。
      </p>

      {/* —— F. 底部主按钮（使用全局行动绿） —— */}
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={onEnterFreeExperience}
          className="rounded-full bg-action-primary px-8 py-3 text-[15px] font-medium text-action-primary-text transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-4"
        >
          进入自由体验模式
        </button>
      </div>
    </div>
  );
}
