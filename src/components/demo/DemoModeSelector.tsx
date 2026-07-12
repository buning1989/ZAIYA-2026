import { ArrowRight } from "lucide-react";

type Props = {
  onEnterGuided: () => void;
  onEnterFree: () => void;
  onClose: () => void;
};

/**
 * 模式选择页：进入 Demo 根路径时首先展示。
 *
 * 两个卡片权重接近，「跟着一个案例看」通过主色按钮与「推荐」标签略微突出，
 * 作为默认推荐入口。整体保持安静、克制、留白充足，不做营销落地页式堆叠。
 */
export default function DemoModeSelector({
  onEnterGuided,
  onEnterFree,
  onClose,
}: Props) {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-6 py-16">
      {/* 关闭：返回落地页 */}
      <button
        onClick={onClose}
        className="absolute right-5 top-5 text-[13px] text-ink-faint transition-colors hover:text-ink-soft focus:outline-none focus-visible:text-ink"
      >
        关闭
      </button>

      <header className="mb-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
          在呀 · Demo
        </p>
        <h1 className="mt-3 font-brand text-[28px] leading-tight text-ink">
          你想怎么体验在呀？
        </h1>
      </header>

      <div className="grid w-full max-w-3xl gap-4 md:grid-cols-2">
        {/* 跟着一个案例看（默认推荐，略微突出） */}
        <button
          onClick={onEnterGuided}
          className="group flex flex-col rounded-2xl border border-ink/30 bg-white p-7 text-left transition-colors hover:border-ink/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
        >
          <span className="self-start rounded-full bg-canvas-soft px-2 py-0.5 text-[11px] text-ink-soft">
            推荐
          </span>
          <h2 className="mt-3 text-[18px] font-semibold tracking-tight text-ink">
            跟着一个案例看
          </h2>
          <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-soft">
            从一个具体用户的生活场景出发，看在呀如何陪用户完成记录、回看和整理。
          </p>
          <span className="mt-6 inline-flex items-center gap-1.5 self-start rounded-lg bg-action-primary px-4 py-2.5 text-[13px] font-medium text-action-primary-text transition-opacity group-hover:opacity-90">
            开始演示
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>

        {/* 自由体验产品 */}
        <button
          onClick={onEnterFree}
          className="group flex flex-col rounded-2xl border border-line bg-white p-7 text-left transition-colors hover:border-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
        >
          <span className="self-start rounded-full bg-line-soft px-2 py-0.5 text-[11px] text-ink-faint">
            自由
          </span>
          <h2 className="mt-3 text-[18px] font-semibold tracking-tight text-ink">
            自由体验产品
          </h2>
          <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-soft">
            直接进入 Demo 首页，查看完整功能和交互。
          </p>
          <span className="mt-6 inline-flex items-center gap-1.5 self-start rounded-lg border border-ink/25 px-4 py-2.5 text-[13px] font-medium text-ink transition-colors group-hover:border-ink/45">
            进入体验
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </div>

      <p className="mt-8 text-center text-[12px] text-ink-faint">
        也可以直接分享带{" "}
        <code className="rounded bg-line-soft px-1.5 py-0.5 text-[11px] text-ink-soft">
          ?mode=guided
        </code>{" "}
        或{" "}
        <code className="rounded bg-line-soft px-1.5 py-0.5 text-[11px] text-ink-soft">
          ?mode=free
        </code>{" "}
        的链接进入对应模式。
      </p>
    </div>
  );
}
