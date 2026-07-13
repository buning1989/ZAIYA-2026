/* —— 案例结果页｜小晨自身的变化 ——
 * Guided Demo 第一张总结页。独立阶段页，第三方视角描述小晨自身的改变。
 *
 * 结构：
 *   A. 主标题
 *   B. 副标题
 *   C. 三张变化卡片（桌面端横向等高排列）
 *   D. 页面收束
 *   E. 底部主按钮（与右箭头等价，进入第二张总结页）
 *
 * 不包含：数据图表、百分比或趋势数值、医生 / 老师 / 家长的作用、
 * 产品机制和理论依据、"明显改善""恢复正常"等结论。
 * 关系变化属于第二张总结页（guided-product-value）。
 *
 * 导航由 UnifiedDemoStage 统一承载左右箭头与键盘切换。
 */

type Props = {
  /** 进入第二张总结页（与右箭头执行相同逻辑） */
  onNext: () => void;
};

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
    body: "她会主动记录状态、整理复诊问题，也能决定哪些信息可以分享。",
  },
  {
    tag: "自我看见",
    title: "开始重新看见自己",
    body: "她不再只看到那些做不到的事，也开始看见自己已经做出的努力。",
  },
];

export default function GuidedCaseResultPage({ onNext }: Props) {
  return (
    <div className="mx-auto w-full max-w-[920px]">
      {/* —— A. 主标题 —— */}
      <h1 className="text-[26px] font-semibold leading-[1.5] text-ink">
        小晨开始重新参与自己的生活。
      </h1>

      {/* —— B. 副标题 —— */}
      <p className="mt-6 text-[17px] leading-[1.8] text-ink-soft">
        变化还不稳定，但她开始记录、整理、回看，
        <br />
        也逐渐看见自己的感受和努力。
      </p>

      {/* —— C. 三张变化卡片 —— */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {changeCards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-line-soft bg-card-soft/60 px-5 py-5"
          >
            <span className="inline-block rounded-full border border-line bg-white/60 px-2 py-0.5 text-[11px] tracking-[0.04em] text-ink-soft">
              {card.tag}
            </span>
            <p className="mt-3 text-[16px] font-semibold leading-[1.4] text-ink">
              {card.title}
            </p>
            <p className="mt-2 text-[14px] leading-[1.7] text-ink-soft">
              {card.body}
            </p>
          </div>
        ))}
      </div>

      {/* —— D. 页面收束 —— */}
      <p className="mt-8 text-[15px] leading-[1.8] text-ink-soft">
        恢复不是一下子变好，
        <br />
        而是逐渐重新拥有对生活的参与感。
      </p>

      {/* —— E. 底部主按钮（与右箭头等价） —— */}
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={onNext}
          className="rounded-full bg-ink px-7 py-3 text-[15px] font-medium text-white transition-colors hover:bg-ink/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-4"
        >
          看看她与身边的人发生了什么变化
        </button>
      </div>
    </div>
  );
}
