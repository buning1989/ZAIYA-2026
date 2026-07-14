/* —— 大尺寸分段时间尺（SegmentedTimeScale）——
 *
 * 可复用的离散选择组件，用于睡眠记录中上床时间 / 入睡用时 / 醒来时间 / 夜间清醒时长。
 * 五段等宽排列，整条占满内容区宽度。同时支持点击和左右滑动选择。
 *
 * 视觉规则：
 *   - 外层完整圆角矩形，高度 68px，圆角与卡片一致（rounded-2xl）
 *   - 各段之间 1px 分隔线，选中段使用 accent-soft 淡绿色整块填充
 *   - 选中段下方有小型三角指示器，对准所选区段中心，移动动画 180ms
 *   - 点击反馈 150ms 淡入过渡，不弹跳、不缩放
 *   - 每段点击高度 ≥ 44px（由 68px 整体高度保证）
 *
 * 交互规则：
 *   - 直接点击：选中后停留 300ms（由父组件控制自动跳转）
 *   - 左右滑动：按五个离散区段切换，松手吸附最近区段，不允许停留在两区段之间
 *   - 滑动过程中阻止页面整体左右切换和浏览器返回手势
 *   - 不实现连续时间值，不使用圆形拖动滑块
 *
 * 「记不清，先跳过」由父组件渲染（涉及页面跳转逻辑，不属于本组件职责）。 */

import { useCallback, useEffect, useRef } from "react";

export interface SegmentedTimeScaleOption {
  label: string;
  value: string;
}

interface SegmentedTimeScaleProps {
  options: SegmentedTimeScaleOption[];
  value: string | null;
  onChange: (value: string) => void;
  ariaLabel?: string;
  /** 左侧方向提示，如「晚上」「很快」 */
  startLabel?: string;
  /** 右侧方向提示，如「凌晨」「很久」 */
  endLabel?: string;
  /** 选择摘要文案，未选择时保留高度但不显示 */
  summary?: string;
}

// 滑动判定阈值：超过此距离才切换到相邻区段
const SWIPE_THRESHOLD = 24;

export default function SegmentedTimeScale({
  options,
  value,
  onChange,
  ariaLabel,
  startLabel,
  endLabel,
  summary,
}: SegmentedTimeScaleProps) {
  const hasDirection = !!(startLabel || endLabel);
  const containerRef = useRef<HTMLDivElement>(null);
  // 滑动起点 X 坐标
  const touchStartX = useRef<number | null>(null);
  // 滑动过程中是否触发过 onChange（避免松手时重复触发）
  const swipeMovedRef = useRef(false);
  // 触觉反馈（Web 环境不支持时忽略）
  const supportsVibrate = typeof navigator !== "undefined" && "vibrate" in navigator;

  const selectedIndex = value
    ? options.findIndex((o) => o.value === value)
    : -1;

  // 轻量触感反馈
  const triggerHaptic = useCallback(() => {
    if (supportsVibrate) {
      try {
        navigator.vibrate(8);
      } catch {
        // 忽略不支持的环境
      }
    }
  }, [supportsVibrate]);

  // 切换到相邻区段（方向：-1 左 / +1 右），吸附到边界
  const switchToAdjacent = useCallback(
    (direction: -1 | 1) => {
      let nextIdx = selectedIndex;
      if (nextIdx === -1) {
        // 未选择时，右滑从第一段开始，左滑从最后一段开始
        nextIdx = direction > 0 ? 0 : options.length - 1;
      } else {
        nextIdx = Math.max(0, Math.min(options.length - 1, nextIdx + direction));
      }
      if (nextIdx !== selectedIndex) {
        onChange(options[nextIdx].value);
        triggerHaptic();
      }
    },
    [selectedIndex, options, onChange, triggerHaptic],
  );

  // —— 滑动事件处理 ——
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    swipeMovedRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    // 阻止页面整体左右切换和浏览器返回手势
    if (Math.abs(deltaX) > 8) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      switchToAdjacent(deltaX > 0 ? -1 : 1);
      swipeMovedRef.current = true;
    }
  };

  // —— 鼠标拖拽支持（桌面端测试用，与触摸逻辑一致） ——
  const mouseStartX = useRef<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartX.current === null) return;
    const deltaX = e.clientX - mouseStartX.current;
    mouseStartX.current = null;
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      switchToAdjacent(deltaX > 0 ? -1 : 1);
    }
  };

  // 清理：组件卸载时重置
  useEffect(() => {
    return () => {
      touchStartX.current = null;
      mouseStartX.current = null;
    };
  }, []);

  // 指示器位置：选中区段中心（百分比）
  const indicatorLeft =
    selectedIndex >= 0
      ? `${((selectedIndex + 0.5) / options.length) * 100}%`
      : null;

  return (
    <div className="flex flex-col gap-2">
      {/* 方向提示：左 / 右两端弱化文字，与时间尺保持紧凑间距 */}
      {hasDirection && (
        <div className="flex items-center justify-between px-1">
          <span className="text-[12px] text-ink-faint">{startLabel}</span>
          <span className="text-[12px] text-ink-faint">{endLabel}</span>
        </div>
      )}

      {/* 大尺寸分段时间尺主体 + 滑动容器 */}
      <div
        ref={containerRef}
        role="radiogroup"
        aria-label={ariaLabel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        // 允许内部 preventDefault 阻止页面左右切换
        style={{ touchAction: "pan-y" }}
        className="flex h-[68px] w-full select-none overflow-hidden rounded-2xl border border-line bg-white"
      >
        {options.map((opt, idx) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                // 滑动产生的 click 事件跳过（避免松手时重复触发）
                if (swipeMovedRef.current) {
                  swipeMovedRef.current = false;
                  return;
                }
                onChange(opt.value);
              }}
              className={`flex flex-1 cursor-pointer flex-col items-center justify-center px-1 text-center text-[13px] font-medium leading-tight tracking-tight transition-colors duration-150 ${
                idx > 0 ? "border-l border-line" : ""
              } ${
                selected
                  ? "bg-accent-soft text-ink"
                  : "bg-white text-ink-soft hover:bg-line-soft/40"
              }`}
            >
              <span className="line-clamp-2">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* 选中指示器：小型三角，对准所选区段中心，180ms 移动动画 */}
      <div className="relative h-[8px] w-full">
        {indicatorLeft && (
          <div
            className="absolute top-0 h-0 w-0 -translate-x-1/2 transition-all duration-200 ease-out"
            style={{
              left: indicatorLeft,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "6px solid var(--z-accent, #5F745F)",
            }}
          />
        )}
      </div>

      {/* 选择摘要：未选择时保留高度，选择后淡入显示 */}
      <div className="min-h-[20px]">
        {summary && (
          <p className="text-center text-[13px] leading-relaxed text-ink-soft transition-opacity duration-200">
            {summary}
          </p>
        )}
      </div>
    </div>
  );
}
