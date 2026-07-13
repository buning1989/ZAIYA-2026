/* —— 产品价值总结页｜在呀还做了什么 ——
 * Guided Demo 第二张总结页。独立阶段页，解释产品机制与价值。
 *
 * 结构：
 *   A. 主标题（两行）
 *   B. 副标题（问题背景 + 转折句）
 *   C. 三张产品价值卡片（桌面端横向排列）
 *   D. 用户授权说明条
 *   E. 产品定位横向总结卡
 *   F. 专业依据弱化说明
 *   G. 最终收束（主文案 + 辅助文案）
 *   H. 底部操作（重新观看案例 / 进入自由体验）
 *
 * 视觉与第一张总结页保持一组：相同宽度、圆角、边框、正文深绿色、浅色背景。
 * 表达重点不同：第一页偏人物变化，第二页偏产品价值。
 *
 * 作为 Guided Demo 最后一页，左箭头由 UnifiedDemoStage 统一承载，返回案例结果页；
 * 右箭头由 UnifiedDemoStage 统一禁用并隐藏。
 */

type Props = {
  /** 重新观看案例：重置 Guided Demo 进度，返回第一节点 */
  onRestart: () => void;
  /** 进入自由体验：切换到自由体验模式 */
  onEnterFreeExperience: () => void;
};

type ValueCard = {
  tag: string;
  title: string;
  body: string;
  extra?: string;
};

const valueCards: ValueCard[] = [
  {
    tag: "低压力陪伴",
    title: "陪在真实生活发生的地方",
    body: "在起床、吃饭、情绪失控和深夜难熬的时候，用低压力的方式接住用户，而不是再增加一项任务。",
  },
  {
    tag: "连续记录",
    title: "让零散状态逐渐形成趋势",
    body: "睡眠、饮食、情绪、用药和现实活动，不再只散落在记忆和对话里。",
    extra: "用户可以先从外面看见自己的生活。",
  },
  {
    tag: "支持协同",
    title: "让支持建立在同一段生活之上",
    body: "医生获得更连续的信息，家长从结果看见过程，学校和其他支持者也能获得更清晰的支持依据。",
  },
];

export default function GuidedProductValuePage({
  onRestart,
  onEnterFreeExperience,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-[920px]">
      {/* —— A. 主标题 —— */}
      <h1 className="text-[26px] font-semibold leading-[1.5] text-ink">
        每个人都在帮，
        <br />
        但他们看到的，往往只是生活的一小部分。
      </h1>

      {/* —— B. 副标题 —— */}
      <p className="mt-6 text-[17px] leading-[1.8] text-ink-soft">
        医生看到门诊时的状态，咨询师听到一次会谈里的表达，
        <br />
        学校看到缺勤，家长看到争吵。
      </p>
      <p className="mt-2 text-[17px] leading-[1.8] text-ink">
        在呀做的，是把这些时刻之间的生活连接起来。
      </p>

      {/* —— C. 三张产品价值卡片 —— */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {valueCards.map((card) => (
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
            {card.extra ? (
              <p className="mt-2 text-[14px] leading-[1.7] text-ink">
                {card.extra}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {/* —— D. 用户授权说明条 —— */}
      <div className="mt-6 rounded-xl border border-line-soft bg-card-soft/40 px-5 py-4">
        <p className="text-[13px] leading-[1.7] text-ink-soft">
          信息由小晨先查看、确认，再决定是否分享。
          不是绕过她进行监控，也不是把她的生活变成一份黑盒报告。
        </p>
      </div>

      {/* —— E. 产品定位横向总结卡 —— */}
      <div className="mt-8 rounded-2xl border border-line-soft bg-card-soft/60 px-6 py-6">
        <p className="text-[18px] font-semibold leading-[1.6] text-ink">
          在呀不是再增加一个“专家”
        </p>
        <p className="mt-3 text-[15px] leading-[1.8] text-ink-soft">
          它陪在日常里，让真实生活被持续记录、被用户本人理解，
          再被需要的人看见。
        </p>
        <p className="mt-2 text-[15px] leading-[1.8] text-ink-soft">
          它不替代医生、咨询师、学校或家长，
          而是让这些支持建立在更完整的信息基础之上。
        </p>
      </div>

      {/* —— F. 专业依据 —— */}
      <p className="mt-5 text-[12px] leading-[1.7] text-ink-faint">
        产品设计参考 GPM 与生物—心理—社会框架，
        目标指向生活功能和支持系统的长期改善。
      </p>

      {/* —— G. 最终收束 —— */}
      <div className="mt-8 border-t border-line-soft pt-8">
        <p className="text-[18px] leading-[1.7] text-ink-soft">
          不是只陪你熬过难受的一刻。
        </p>
        <p className="mt-1 text-[20px] font-semibold leading-[1.6] text-ink">
          而是陪生活，逐渐走向健康。
        </p>
        <p className="mt-3 text-[13px] leading-[1.7] text-ink-faint">
          这里的健康，不只是情绪变好，
          也是作息、自我管理、治疗配合和现实生活逐渐恢复稳定。
        </p>
      </div>

      {/* —— H. 底部操作 —— */}
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onRestart}
          className="rounded-full border border-line bg-white px-7 py-3 text-[15px] font-medium text-ink-soft transition-colors hover:border-ink-faint hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-4"
        >
          重新观看案例
        </button>
        <button
          type="button"
          onClick={onEnterFreeExperience}
          className="rounded-full bg-ink px-7 py-3 text-[15px] font-medium text-white transition-colors hover:bg-ink/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-4"
        >
          进入自由体验
        </button>
      </div>
    </div>
  );
}
