import { useEffect } from "react";
import { ArrowRight } from "lucide-react";

type Props = {
  onEnterGuided: () => void;
  onEnterFree: () => void;
  onClose: () => void;
};

/**
 * 模式选择页：进入 Demo 根路径时首先展示。
 * ESC 键关闭返回落地页。
 */
export default function DemoModeSelector({
  onEnterGuided,
  onEnterFree,
  onClose,
}: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-6 py-16">
      <header className="mb-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
          在呀 · Demo
        </p>
        <h1 className="mt-3 font-brand text-[28px] leading-tight text-ink">
          你想怎么体验「在呀 ZÀIYA」？
        </h1>
      </header>

      <div className="grid w-full max-w-3xl gap-4 md:grid-cols-2">
        {/* 跟着一个案例看（默认推荐，略微突出） */}
        <button
          onClick={onEnterGuided}
          className="group flex flex-col rounded-2xl border border-ink/30 bg-white p-7 text-left transition-colors hover:border-ink/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
        >
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
    </div>
  );
}
