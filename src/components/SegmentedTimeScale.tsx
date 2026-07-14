/* —— 纵向时长选择卡（SegmentedTimeScale）——
 *
 * 可复用的离散选择组件，用于睡眠记录中的入睡用时 / 夜间清醒时长。
 * 选项纵向排列，仅支持点击选择，保持和分组时间选择相同的单次点击心智。
 *
 * 视觉规则：
 *   - 外层完整圆角矩形，圆角与卡片一致（rounded-2xl）
 *   - 各行之间 1px 浅色分隔线，选中行使用 accent-soft 淡绿色整块填充
 *   - 点击按压反馈：active:scale-[0.98]，120ms 过渡
 *   - 每行点击高度 ≥ 48px
 *
 * 交互规则：
 *   - 仅支持直接点击，不支持左右滑动
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
  disabled?: boolean;
}

export default function SegmentedTimeScale({
  options,
  value,
  onChange,
  ariaLabel,
  disabled = false,
}: SegmentedTimeScaleProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* 纵向选择卡主体 */}
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        className="overflow-hidden rounded-2xl border border-line bg-white"
      >
        {options.map((opt, idx) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={`flex min-h-[52px] w-full cursor-pointer items-center justify-center px-4 text-center text-[14px] font-medium leading-tight tracking-tight transition-all duration-120 active:scale-[0.98] disabled:pointer-events-none ${
                idx > 0 ? "border-t border-line-soft" : ""
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
    </div>
  );
}
