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
    tag: "家庭",
    title: "小晨和父母",
    body: (
      <>
        <p>父母从只看到结果，到逐渐理解过程，减少误解和冲突。</p>
      </>
    ),
  },
  {
    tag: "学校",
    title: "小晨和老师",
    body: (
      <>
        <p>老师更早看见她的困难，也更容易提供合适的节奏和支持。</p>
      </>
    ),
  },
  {
    tag: "医疗",
    title: "小晨和医生",
    body: (
      <>
        <p>医生不只依赖一次门诊，也能了解更连续的生活状态。</p>
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
      <p className="text-center text-[15px] leading-[1.6] text-ink-faint">
        持续使用在呀 ZÀIYA 会发生什么
      </p>
      <h1 className="mt-3 text-center text-[36px] font-semibold leading-[1.5] text-ink">
        小晨和身边的人，开始重新建立连接
      </h1>

      {/* —— C. 三张并列支持交付卡片 —— */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {relationCards.map((card) => (
          <div
            key={card.title}
            className="flex flex-col rounded-2xl border border-line-soft bg-white px-5 py-5"
          >
            <span className="inline-block w-fit rounded-full border border-line-soft bg-white px-2.5 py-0.5 text-[11px] tracking-[0.04em] text-ink">
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
