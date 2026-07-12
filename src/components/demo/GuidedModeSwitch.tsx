/* —— 顶部/下方模式分段切换：案例演示 / 自由体验 ——
 * 圆角胶囊容器 + 两个分段按钮。
 * 选中态清晰（深底浅字），未选中态弱化。
 *
 * 可复用于 guided 和 free 两个模式：通过 currentMode 控制高亮，
 * 通过 onSwitchToGuided / onSwitchToFree 切换。
 * 位置由父容器控制，本组件自身水平居中。
 */
type Props = {
  /** 当前模式 */
  currentMode: "guided" | "free";
  /** 切换到案例演示 */
  onSwitchToGuided: () => void;
  /** 切换到自由体验 */
  onSwitchToFree: () => void;
};

export default function GuidedModeSwitch({
  currentMode,
  onSwitchToGuided,
  onSwitchToFree,
}: Props) {
  const isGuided = currentMode === "guided";

  return (
    <div className="flex justify-center">
      <div
        role="tablist"
        aria-label="Demo 模式切换"
        className="inline-flex items-center rounded-full border border-line bg-white p-1"
      >
        <button
          role="tab"
          aria-selected={isGuided}
          onClick={onSwitchToGuided}
          className={[
            "rounded-full px-5 py-1.5 text-[13px] font-medium transition-colors",
            isGuided
              ? "bg-ink text-white"
              : "text-ink-soft hover:text-ink",
          ].join(" ")}
        >
          案例演示
        </button>
        <button
          role="tab"
          aria-selected={!isGuided}
          onClick={onSwitchToFree}
          className={[
            "rounded-full px-5 py-1.5 text-[13px] font-medium transition-colors",
            !isGuided
              ? "bg-ink text-white"
              : "text-ink-soft hover:text-ink",
          ].join(" ")}
        >
          自由体验
        </button>
      </div>
    </div>
  );
}
