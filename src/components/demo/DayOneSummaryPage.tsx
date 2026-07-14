/* —— 第一天结束总结页 ——
 * 独立阶段页，只负责总结第一天，不出现两周后的信息。
 *
 * 结构：
 *   - 小标签：第一天结束
 *   - 一段核心总结
 *   - 适度留白
 *
 * 不包含：四张变化卡片、两周后背景、按钮、手机模型、
 * "为什么这样做"、产品模块标签、新的解释性文案。
 *
 * 导航由 UnifiedDemoStage 的统一左右箭头和键盘事件承载。
 */
export default function DayOneSummaryPage() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-[680px] flex-col items-center justify-center text-center">
      {/* 核心总结 */}
      <div className="text-[20px] leading-[1.8] text-ink">
        <p>第一天结束</p>
        <p className="mt-6">这一天，小晨没能去上学，没有好好吃饭，凌晨一点半还醒着。</p>
        <p className="mt-2">在呀没有改变其中任何一件。</p>
        <p className="mt-2">它只做了两件事：她来的时候，它在。她不来的时候，它不去找她。</p>
        <p className="mt-2">剩下的是记录。</p>
      </div>
    </div>
  );
}
