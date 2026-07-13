/* —— 产品价值总结页（占位）——
 * Guided Demo 第二张总结页的预留节点。
 *
 * 本轮不开发正式内容，仅保证流程连通：
 *   - 节点和路由稳定
 *   - 占位内容不报错、不跳回错误页面
 *
 * 后续将承载原 ConclusionSummaryPage 中的产品价值内容：
 *   医生 / 咨询师 / 学校 / 家长四方价值、GPM 理论、
 *   生物—心理—社会框架、支持系统协同说明等。
 *
 * 作为 Guided Demo 最后一页，只保留左箭头返回案例结果页，
 * 右箭头由 UnifiedDemoStage 统一禁用。
 */
export default function GuidedProductValuePage() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-[680px] flex-col items-center justify-center text-center">
      <p className="text-[12px] tracking-[0.18em] text-ink-faint">
        下一页
      </p>
      <p className="mt-6 text-[20px] leading-[1.8] text-ink">
        在呀如何让这些变化被看见、被支持
      </p>
    </div>
  );
}
