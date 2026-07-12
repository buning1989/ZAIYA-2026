type ObservationPoint = {
  no: string;
  title: string;
  detail: string;
};

const observations: ObservationPoint[] = [
  {
    no: "01",
    title: "先看首页：建立稳定的生活节律",
    detail:
      "首页不是功能面板，而是一个低压力的生活锚点。在在通过时间、场景和轻气泡，陪用户重新感受到一天的节奏：早上、白天、晚上、睡前。",
  },
  {
    no: "02",
    title: "再看即时入口：接住关键时刻",
    detail:
      "右下角对话、缓解情绪、左下角陪伴广场，分别对应表达困难、情绪高峰和低风险陪伴。它们服务的不是聊天本身，而是让用户在卡住、崩溃或孤立时，有一个更容易接近的入口。",
  },
  {
    no: "03",
    title: "然后看生活记录：让真实状态留下来",
    detail:
      "记一下不是为了打卡，而是把情绪、睡眠、饮食、服用、活动、体重这些生活状态，用低压力方式留下来。对社会功能受损用户来说，能留下事实本身就是一种支持。",
  },
  {
    no: "04",
    title: "最后看回看、整理与隐私：让支持系统更有效",
    detail:
      "回头看看帮助用户看见变化；帮我整理把零散生活信息变成可讨论的材料；我的隐私确保数据不是监控工具，而是用户可控制的支持资源。",
  },
];

/* —— 评委观察指南 ——
 * 自由体验模式右侧说明，面向评委而非普通用户。
 * 传递在呀的一句话定位：帮助社会功能受损人群重构健康生活模式。
 * 评委通过四条主线观察产品逻辑：首页节律 / 即时入口 / 生活记录 / 回看整理隐私。
 *
 * 文字 5 层级（由强到弱）：
 *   1. 小标签     12px  浅色   低权重        —— 自由体验
 *   2. 主标题     32px  深色   700          —— 请重点看：在呀如何重构健康生活模式
 *   3. 定位说明   15px  软色   常规          —— 3 段，建立产品判断框架
 *   4. 观察点     编号 + 标题 + 说明，4 条 01–04
 *   5. 底部提示   12px  最弱   不抢重点      —— 自由体验不会影响案例演示进度
 *
 * 不与手机内部状态联动，保持静态导览。
 */
export default function FreeExperiencePanel() {
  return (
    <div className="flex h-full w-full max-w-[480px] flex-col justify-center lg:w-[440px]">
      {/* 第 1 层：小标签 */}
      <p className="text-[12px] tracking-[0.14em] text-ink-faint">
        自由体验
      </p>

      {/* 第 2 层：主标题 */}
      <h2 className="mt-4 whitespace-nowrap text-[32px] font-bold leading-[1.25] text-ink">
        在呀 ZÀIYA 如何重构健康生活模式
      </h2>

      {/* 第 4 层：观察点 01 / 02 / 03 / 04 */}
      <ol className="mt-8 space-y-5" aria-label="评委观察点">
        {observations.map((point) => (
          <li key={point.no} className="flex gap-4">
            <span className="w-6 shrink-0 text-[12px] font-semibold tabular-nums text-accent">
              {point.no}
            </span>
            <div className="flex flex-col gap-1.5">
              <p className="text-[16px] font-semibold leading-[1.4] text-ink">
                {point.title}
              </p>
              <p className="text-[14px] leading-[1.6] text-ink-soft">
                {point.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>

    </div>
  );
}
