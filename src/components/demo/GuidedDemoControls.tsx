import { Pause, Play, ChevronLeft, ChevronRight, X } from "lucide-react";

type ControlBtnProps = {
  label: string;
  Icon: typeof Pause;
  disabled?: boolean;
};

function ControlBtn({ label, Icon, disabled = true }: ControlBtnProps) {
  return (
    <button
      disabled={disabled}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-faint transition-colors hover:border-ink-faint hover:text-ink-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

/**
 * 案例演示控制区：后续承载暂停 / 继续 / 上一步 / 下一步 / 退出演示。
 * 本阶段按钮全部置灰，仅保留结构与占位。
 */
export default function GuidedDemoControls() {
  return (
    <footer className="flex items-center justify-center gap-2 border-t border-line px-6 py-4">
      <ControlBtn label="上一步" Icon={ChevronLeft} />
      <ControlBtn label="暂停" Icon={Pause} />
      <ControlBtn label="继续" Icon={Play} />
      <ControlBtn label="下一步" Icon={ChevronRight} />
      <ControlBtn label="退出演示" Icon={X} />
    </footer>
  );
}
