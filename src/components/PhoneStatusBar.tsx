import { useEffect, useState } from "react";
import { Wifi, X } from "lucide-react";

function formatHHMM(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/* —— iOS 风格手机状态栏（抽象绘制，仅增强真实感，不承担功能） ——
 * 左：时间；右：信号 / Wi-Fi / 电池。颜色 text-ink，接近真实状态栏。
 * 可选关闭按钮（非首页用），位于状态栏右侧之外，不挤占信号区。
 */
export default function PhoneStatusBar({
  showClose = false,
  onClose,
  now,
}: {
  showClose?: boolean;
  onClose?: () => void;
  now?: Date;
}) {
  const [fallbackNow, setFallbackNow] = useState<Date>(() => new Date());

  useEffect(() => {
    if (now) return;

    const iv = window.setInterval(() => setFallbackNow(new Date()), 20000);
    return () => window.clearInterval(iv);
  }, [now]);

  const displayNow = now ?? fallbackNow;

  return (
    <>
      <div className="absolute left-0 right-0 top-0 z-[30] flex items-center justify-between px-6 pt-3.5 pb-1 text-ink">
        <span className="text-[12px] font-semibold tracking-wide">
          {formatHHMM(displayNow)}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="flex items-end gap-[2px]">
            <div className="h-1 w-1 rounded-[1px] bg-ink" />
            <div className="h-1.5 w-1 rounded-[1px] bg-ink" />
            <div className="h-2 w-1 rounded-[1px] bg-ink" />
            <div className="h-2.5 w-1 rounded-[1px] bg-ink" />
          </div>
          <Wifi className="h-3.5 w-3.5" strokeWidth={1.8} />
          <div className="relative ml-0.5 h-3 w-6 rounded-[3px] border border-ink/55 p-[1.5px]">
            <div className="absolute -right-[3px] top-1/2 h-1.5 w-[2px] -translate-y-1/2 rounded-r bg-ink/55" />
            <div className="h-full w-3/4 rounded-[1px] bg-ink" />
          </div>
        </div>
      </div>
      {showClose && onClose && (
        <button
          onClick={onClose}
          aria-label="关闭 Demo"
          className="absolute right-5 top-12 z-[80] grid h-7 w-7 place-items-center rounded-full border border-white/30 bg-white/50 text-ink-faint shadow-sm backdrop-blur-xl transition-colors hover:text-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </>
  );
}
