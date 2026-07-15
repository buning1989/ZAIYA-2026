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
    tag: "生活状态",
    title: "生活重新有了节奏",
    body: "她开始留意睡眠、饮食、情绪和每天发生的事。",
  },
  {
    tag: "主动参与",
    title: "从被动支持，到主动参与",
    body: "她开始主动记录状态、整理复诊问题，也能决定哪些信息可以分享。",
  },
  {
    tag: "自我察觉",
    title: "开始重新看见自己",
    body: "她不再只看到做不到的事，也开始看见自己已经做出的努力。",
  },
];

export default function GuidedCaseResultPage() {
  return (
    <div className="mx-auto w-full max-w-[920px]">
      {/* —— A. 弱化时间标签 —— */}
      <p className="text-center text-[15px] leading-[1.6] text-ink-faint">
        使用在呀 ZÀIYA 两周后
      </p>

      {/* —— B. 主标题 —— */}
      <h1 className="mt-3 text-center text-[26px] font-semibold leading-[1.5] text-ink">
        小晨开始重新参与自己的生活
      </h1>

      {/* —— D. 三张变化证据卡片（横向排列） —— */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
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
