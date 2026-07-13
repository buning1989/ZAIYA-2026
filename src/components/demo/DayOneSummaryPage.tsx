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
      {/* 小标签 */}
      <p className="text-[12px] tracking-[0.18em] text-ink-faint">
        第一天结束
      </p>

      {/* 核心总结 */}
      <p className="mt-8 text-[20px] leading-[1.8] text-ink">
        在呀 ZÀIYA 持续识别用户卡住的具体环节，并调用对应的心理学方法，让情绪调节、饮食、学习和睡眠中的下一步重新发生。
      </p>
    </div>
  );
}
