/* —— 案例结果页｜小晨这两周发生了什么 ——
 * Guided Demo 第一张总结页。独立阶段页，只讲案例人物的两周变化。
 *
 * 结构：
 *   A. 主标题
 *   B. 副标题
 *   C. 三张变化卡片（桌面端横向排列）
 *
 * 不包含：医生 / 咨询师 / 学校 / 家长角色卡片、GPM 理论、
 * 产品机制解释、"进入自由体验"等最终操作。
 * 这些内容属于第二张总结页（guided-product-value）。
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
    title: "生活开始有迹可循",
    body: "入睡时间整体有所提前，但仍有波动。饮食记录从第一周 3 天增加到第二周 5 天。",
  },
  {
    tag: "自我管理",
    title: "从被动接住，到主动参与",
    body: "她开始主动记录状态、整理复诊问题、确认分享范围，也第一次回看自己的变化。",
  },
  {
    tag: "自我肯定",
    title: "开始重新看见自己",
    body: "她为自己保存了一张肯定卡片。不是因为一切都好了，而是她开始看见自己已经做过的努力。",
  },
];

export default function GuidedCaseResultPage() {
  return (
    <div className="mx-auto w-full max-w-[920px]">
      {/* —— A. 主标题 —— */}
      <h1 className="text-[26px] font-semibold leading-[1.5] text-ink">
        小晨的生活，不再是一段无人看见的空白。
      </h1>

      {/* —— B. 副标题 —— */}
      <p className="mt-6 max-w-[640px] text-[17px] leading-[1.8] text-ink">
        两周里，她从被动获得支持，慢慢开始记录、整理、回看，
        也开始参与自己的恢复过程。
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
    </div>
  );
}
