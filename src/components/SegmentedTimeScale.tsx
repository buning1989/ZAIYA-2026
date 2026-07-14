/* —— 大尺寸分段时间轴（SegmentedTimeScale）——
 *
 * 可复用的离散选择组件，用于睡眠记录中上床时间 / 入睡用时 / 醒来时间 / 夜间清醒时长。
 * 五段等宽排列，整条占满内容区宽度，仅支持点击选择。
 *
 * 视觉规则：
 *   - 外层完整圆角矩形，高度 80px，圆角与卡片一致（rounded-2xl）
 *   - 各段之间 1px 浅色分隔线，选中段使用 accent-soft 淡绿色整块填充
 *   - 选中段下方有小型三角指示器，对准所选区段中心，200ms 移动动画
 *   - 点击按压反馈：active:scale-[0.98]，120ms 过渡
 *   - 每段点击高度 ≥ 44px（由 80px 整体高度保证）
 *
 * 交互规则：
 *   - 仅支持直接点击，不支持左右滑动（五段已全部可见，滑动不提高效率）
 *   - 选中后由父组件控制停留时间再自动进入下一题
 *
 * 「记不清，先跳过」由父组件渲染（涉及页面跳转逻辑，不属于本组件职责）。 */

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
}

export default function SegmentedTimeScale({
  options,
  value,
  onChange,
  ariaLabel,
  startLabel,
  endLabel,
}: SegmentedTimeScaleProps) {
  const hasDirection = !!(startLabel || endLabel);

  const selectedIndex = value
    ? options.findIndex((o) => o.value === value)
    : -1;

  // 指示器位置：选中区段中心（百分比）
  const indicatorLeft =
    selectedIndex >= 0
      ? `${((selectedIndex + 0.5) / options.length) * 100}%`
      : null;

  return (
    <div className="flex flex-col gap-1.5">
      {/* 方向提示：左 / 右两端弱化文字，紧贴时间轴上方 */}
      {hasDirection && (
        <div className="flex items-center justify-between px-1">
          <span className="text-[12px] text-ink-faint">{startLabel}</span>
          <span className="text-[12px] text-ink-faint">{endLabel}</span>
        </div>
      )}

      {/* 大尺寸分段时间轴主体 */}
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        className="flex h-[80px] w-full overflow-hidden rounded-2xl border border-line bg-white"
      >
        {options.map((opt, idx) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={`flex flex-1 cursor-pointer flex-col items-center justify-center px-1 text-center text-[14px] font-medium leading-tight tracking-tight transition-all duration-120 active:scale-[0.98] ${
                idx > 0 ? "border-l border-line-soft" : ""
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

      {/* 选中指示器：小型三角，对准所选区段中心，200ms 移动动画 */}
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
    </div>
  );
}
