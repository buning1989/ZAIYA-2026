/* —— 自由体验入口页右侧引导 ——
 * 极简操作引导：弱化标签 + 主标题 + 两行说明 + 弱化提示。
 * 不再承担完整产品说明任务，让手机 Demo 成为页面主视觉。
 *
 * 文字 4 层级（由强到弱）：
 *   1. 弱化标签   12px  浅色   低权重        —— 自由体验
 *   2. 主标题     20px  深色   600          —— 现在，自己试试在呀。
 *   3. 说明文案   15px  软色   常规          —— 两行操作引导
 *   4. 弱化提示   12px  最弱   不抢重点      —— 可直接点击手机内的任一入口
 */
export default function FreeExperiencePanel() {
  return (
    <div className="mx-auto flex w-full max-w-[400px] flex-col text-center lg:mx-0 lg:text-left">
      {/* 第 1 层：弱化标签 */}
      <p className="text-[12px] tracking-[0.14em] text-ink-faint">
        自由体验
      </p>

      {/* 第 2 层：主标题 */}
      <h2 className="mt-4 text-[20px] font-semibold leading-[1.4] text-ink">
        现在，自己试试在呀 ZÀIYA。
      </h2>

      {/* 第 3 层：说明文案 */}
      <p className="mt-5 text-[15px] leading-[1.7] text-ink-soft">
        从首页开始，随意进入记录、缓解、陪伴或回看。
        <br />
        没有固定路线，也不需要按顺序完成。
      </p>

      {/* 第 4 层：弱化提示 */}
      <p className="mt-6 text-[12px] text-ink-faint">
        可直接点击手机内的任一入口
      </p>

      {/* 第 5 层：数据声明 */}
      <p className="mt-3 text-[11px] leading-[1.6] text-ink-faint/70">
        当前页面中的数据均为 Mock 数据，对话尚未接入 LLM，仅用于产品演示。
      </p>
    </div>
  );
}
