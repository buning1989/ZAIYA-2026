/* —— 横滑时间点刻度（HorizontalTimeScale）——
 *
 * 用于睡眠记录中的“上床时间 / 醒来时间”这类时间点选择。
 * 采用原生横向滚动 + scroll-snap，不实现自定义拖拽位移，避免手势状态过重。
 */
import { useEffect, useRef } from "react";
import type { TimeRangeOption } from "@/data/sleepOptions";

interface HorizontalTimeScaleProps {
  options: TimeRangeOption[];
  value: string | null;
  onChange: (value: string) => void;
  ariaLabel?: string;
  startLabel?: string;
  endLabel?: string;
  disabled?: boolean;
}

const SCROLL_SETTLE_MS = 140;
const PROGRAMMATIC_SCROLL_MS = 220;

export default function HorizontalTimeScale({
  options,
  value,
  onChange,
  ariaLabel,
  startLabel,
  endLabel,
  disabled = false,
}: HorizontalTimeScaleProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const settleTimer = useRef<number | null>(null);
  const programmaticScrollTimer = useRef<number | null>(null);
  const isProgrammaticScroll = useRef(false);

  const hasDirection = !!(startLabel || endLabel);
  const selectedIndex = value
    ? options.findIndex((option) => option.value === value)
    : -1;

  const clearSettleTimer = () => {
    if (settleTimer.current !== null) {
      window.clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
  };

  const clearProgrammaticScrollTimer = () => {
    if (programmaticScrollTimer.current !== null) {
      window.clearTimeout(programmaticScrollTimer.current);
      programmaticScrollTimer.current = null;
    }
  };

  const selectClosestToCenter = () => {
    const scroller = scrollRef.current;
    if (!scroller || disabled || options.length === 0) return;

    const scrollBounds = scroller.getBoundingClientRect();
    const center = scrollBounds.left + scrollBounds.width / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    itemRefs.current.forEach((item, index) => {
      if (!item) return;
      const bounds = item.getBoundingClientRect();
      const itemCenter = bounds.left + bounds.width / 2;
      const distance = Math.abs(itemCenter - center);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    const closest = options[closestIndex];
    if (closest && closest.value !== value) {
      onChange(closest.value);
    }
  };

  const handleScroll = () => {
    if (disabled || isProgrammaticScroll.current) return;
    clearSettleTimer();
    settleTimer.current = window.setTimeout(() => {
      settleTimer.current = null;
      selectClosestToCenter();
    }, SCROLL_SETTLE_MS);
  };

  const handleClick = (nextValue: string) => {
    if (disabled) return;
    onChange(nextValue);
  };

  useEffect(() => {
    return () => {
      clearSettleTimer();
      clearProgrammaticScrollTimer();
    };
  }, []);

  useEffect(() => {
    if (selectedIndex < 0) return;
    const selectedItem = itemRefs.current[selectedIndex];
    if (!selectedItem) return;

    clearProgrammaticScrollTimer();
    isProgrammaticScroll.current = true;
    selectedItem.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "center",
    });
    programmaticScrollTimer.current = window.setTimeout(() => {
      isProgrammaticScroll.current = false;
      programmaticScrollTimer.current = null;
    }, PROGRAMMATIC_SCROLL_MS);
  }, [selectedIndex]);

  return (
    <div className="flex flex-col gap-2">
      {hasDirection && (
        <div className="flex items-center justify-between px-1">
          <span className="text-[12px] text-ink-faint">{startLabel}</span>
          <span className="text-[12px] text-ink-faint">{endLabel}</span>
        </div>
      )}

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-2 left-1/2 z-10 w-px -translate-x-1/2 bg-ink/30" />
        <div className="pointer-events-none absolute left-1/2 top-1 z-10 h-0 w-0 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-accent" />
        <div className="pointer-events-none absolute bottom-1 left-1/2 z-10 h-0 w-0 -translate-x-1/2 border-b-[7px] border-l-[5px] border-r-[5px] border-b-accent border-l-transparent border-r-transparent" />

        <div
          ref={scrollRef}
          role="radiogroup"
          aria-label={ariaLabel}
          onScroll={handleScroll}
          className="no-scrollbar flex h-[92px] snap-x snap-mandatory gap-2 overflow-x-auto rounded-2xl border border-line bg-white px-[calc(50%-32px)] py-3"
        >
          {options.map((option, index) => {
            const selected = value === option.value;
            return (
              <button
                key={option.value}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={disabled}
                onClick={() => handleClick(option.value)}
                className={`relative flex h-full w-16 shrink-0 snap-center flex-col items-center justify-center rounded-xl border px-1 text-center transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none ${
                  selected
                    ? "border-accent/45 bg-accent-soft text-ink shadow-[0_6px_14px_rgba(39,51,31,0.08)]"
                    : "border-transparent bg-white text-ink-soft hover:bg-line-soft/45"
                }`}
              >
                <span
                  className={`mb-2 h-5 w-px rounded-full ${
                    selected ? "bg-ink/70" : "bg-line"
                  }`}
                />
                <span className="text-[13px] font-semibold leading-tight tracking-tight">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-center text-[12px] leading-tight text-ink-faint">
        横滑选择大概时间
      </p>
    </div>
  );
}
