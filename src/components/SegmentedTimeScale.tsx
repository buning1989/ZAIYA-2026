/* —— 分段时间轴（SegmentedTimeScale）——
 *
 * 可复用的离散选择组件，用于睡眠记录中上床时间 / 入睡用时 / 醒来时间 / 夜间清醒时长。
 * 五段等宽排列，整条占满内容区宽度，不支持拖动（离散选项，非连续滑杆）。
 *
 * 视觉规则：
 *   - 外层完整圆角矩形，高度 56px，圆角与卡片一致（rounded-2xl）
 *   - 各段之间 1px 分隔线，选中段使用 accent-soft 淡绿色填充
 *   - 点击反馈 150ms 淡入过渡，不弹跳、不缩放
 *   - 每段点击高度 ≥ 44px（由 56px 整体高度保证）
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

  return (
    <div className="flex flex-col gap-2.5">
      {/* 方向提示：左 / 右两端弱化文字 */}
      {hasDirection && (
        <div className="flex items-center justify-between px-1">
          <span className="text-[12px] text-ink-faint">{startLabel}</span>
          <span className="text-[12px] text-ink-faint">{endLabel}</span>
        </div>
      )}

      {/* 分段时间轴主体 */}
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        className="flex h-[56px] w-full overflow-hidden rounded-2xl border border-line bg-white"
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
              className={`flex flex-1 items-center justify-center px-1 text-center text-[13px] font-medium leading-tight tracking-tight transition-colors duration-150 ${
                idx > 0 ? "border-l border-line" : ""
              } ${
                selected
                  ? "bg-accent-soft text-ink"
                  : "bg-white text-ink-soft hover:bg-line-soft/40"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
