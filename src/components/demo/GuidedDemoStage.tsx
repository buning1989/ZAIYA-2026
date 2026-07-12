type Props = {
  onEnterFree: () => void;
  onExitToSelect: () => void;
};

/**
 * 案例演示舞台区：后续承载真实 Demo 页面与高亮区域。
 * 本阶段仅展示占位文案与两个出口按钮（进入自由体验 / 返回模式选择）。
 */
export default function GuidedDemoStage({ onEnterFree, onExitToSelect }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <h2 className="font-brand text-[24px] tracking-tight text-ink">
        案例演示模式
      </h2>
      <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-soft">
        这里将用于展示一个用户如何在真实生活场景中使用在呀。
      </p>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-faint">
        案例脚本稍后接入。当前仅搭建演示框架。
      </p>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <button
          onClick={onEnterFree}
          className="inline-flex items-center justify-center rounded-lg bg-action-primary px-5 py-2.5 text-[13px] font-medium text-action-primary-text transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
        >
          进入自由体验
        </button>
        <button
          onClick={onExitToSelect}
          className="inline-flex items-center justify-center rounded-lg border border-ink/25 px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-ink/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
        >
          返回模式选择
        </button>
      </div>
    </div>
  );
}
