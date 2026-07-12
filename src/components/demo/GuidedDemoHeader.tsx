type Props = {
  onSwitchToFree: () => void;
};

/**
 * 案例演示顶部区：后续展示案例名称、步骤进度、切换自由体验按钮。
 * 本阶段案例名称与步骤进度为占位文本。
 */
export default function GuidedDemoHeader({ onSwitchToFree }: Props) {
  return (
    <header className="flex items-center justify-between border-b border-line px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
          案例演示
        </span>
        <span className="text-[12px] text-ink-faint">案例名称 · 稍后接入</span>
      </div>
      <button
        onClick={onSwitchToFree}
        className="text-[12px] text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline focus:outline-none focus-visible:text-ink"
      >
        切换到自由体验
      </button>
    </header>
  );
}
