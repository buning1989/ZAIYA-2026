/* —— 两周后开场页（纯信息页，无按钮）——
 * 独立阶段页，只承载两周后的背景介绍。
 *
 * 结构：
 *   A. 小标签：第二周第一天
 *   B. 主标题 + 正文
 *
 * 不包含：按钮、进入第二天 CTA、返回链接。
 * 导航由 UnifiedDemoStage 的统一左右箭头和键盘事件承载。
 *
 * 文案严格使用最新剧情文件，不表达"已恢复"或"明显变好"。
 */
export default function TwoWeekTransition() {
  return (
    <div className="mx-auto w-full max-w-[680px]">
      {/* —— A. 小标签 —— */}
      <p className="text-center text-[15px] tracking-[0.18em] text-ink-faint">
        第三周第一天
      </p>

      {/* —— B. 主标题 + 正文 —— */}
      <h1 className="mt-3 text-center text-[36px] font-bold leading-[1.25] text-ink">
        两周后
        <br />
        小晨开始主动使用这些能力
      </h1>

      <p className="mt-6 text-center text-[18px] leading-[1.7] text-ink-soft">变化还不稳定，但在呀已经不只在她崩溃时出现。</p>
      <p className="mt-3 text-center text-[18px] leading-[1.7] text-ink-soft">它持续识别小晨在情绪、饮食、学习和睡眠中卡住的环节，陪她迈出下一步。</p>
    </div>
  );
}
