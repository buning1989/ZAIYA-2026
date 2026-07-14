/* —— 案例结果页｜小晨自身的变化 ——
 * Guided Demo 第一张总结页。独立阶段页，第三方视角描述小晨自身的改变。
 *
 * 结构：
 *   A. 弱化时间标签（使用在呀两周后）
 *   B. 主标题
 *   C. 副标题
 *   D. 四张变化证据卡片（桌面端 2 × 2 排列）
 *   E. 居中收束语（独立于卡片，为本页盖章）
 *
 * 不包含：数据图表、百分比或趋势数值、医生 / 老师 / 家长的作用、
 * 产品机制和理论依据、"明显改善""恢复正常"等结论、底部行动按钮。
 * 关系变化属于第二张总结页（guided-product-value）。
 *
 * 导航由 UnifiedDemoStage 统一承载左右箭头与键盘切换。
 */

type ChangeCard = {
  tag: string;
  title: string;
  body: string;
};

const changeCards: ChangeCard[] = [
  {
    tag: "作息",
    title: "入睡时间提前了一个多小时",
    body: "两周前的这个时间，她还在凌晨一两点醒着看天花板。这两周，多数夜里在午夜前后睡着。仍有起伏。",
  },
  {
    tag: "学业",
    title: "她去了一趟学校，把作业交了",
    body: "早上仍然起不来。但那天下午，她自己去了。",
  },
  {
    tag: "饮食",
    title: "中午主动吃了一个面包",
    body: "三餐还是有空格。这一格是她自己填上的。",
  },
  {
    tag: "治疗配合",
    title: "复诊前的材料，是她自己整理的",
    body: "记了 10 天，自己整理成一份，自己按的确认，还在后面补上了最想问医生的那句话。",
  },
];

export default function GuidedCaseResultPage() {
  return (
    <div className="mx-auto w-full max-w-[920px]">
      {/* —— A. 弱化时间标签 —— */}
      <p className="text-center text-[13px] leading-[1.6] text-ink-faint">
        使用在呀 ZÀIYA 两周后
      </p>

      {/* —— B. 主标题 —— */}
      <h1 className="mt-3 text-center text-[26px] font-semibold leading-[1.5] text-ink">
        小晨没有痊愈。
        <br />
        但有几件事，
        <br className="sm:hidden" />
        两周前她做不到。
      </h1>

      {/* —— D. 四张变化证据卡片 —— */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {changeCards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-line-soft bg-white px-5 py-5"
          >
            <span className="inline-block rounded-full border border-line-soft bg-white px-2.5 py-0.5 text-[11px] tracking-[0.04em] text-ink">
              {card.tag}
            </span>
            <p className="mt-3 text-[16px] font-medium leading-[1.55] text-ink">
              {card.title}
            </p>
            <p className="mt-2 text-[14.5px] leading-[1.75] text-ink-soft">
              {card.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
