/* —— 分组直选时间选择（GroupedTimeChoice）——
 *
 * 用于睡眠记录中的“上床时间 / 醒来时间”这类低精度时间点选择。
 * 分类只是帮助用户理解时间段，具体选项始终直接可点。
 */
import type { TimeRangeOption } from "@/data/sleepOptions";

export type GroupedTimeChoiceGroup = {
  id: string;
  label: string;
  optionValues: string[];
};

interface GroupedTimeChoiceProps {
  options: TimeRangeOption[];
  groups: GroupedTimeChoiceGroup[];
  value: string | null;
  onChange: (value: string) => void;
  ariaLabel?: string;
  disabled?: boolean;
}

const getGridClass = (count: number) => {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  if (count === 4) return "grid-cols-4";
  return "grid-cols-3";
};

export default function GroupedTimeChoice({
  options,
  groups,
  value,
  onChange,
  ariaLabel,
  disabled = false,
}: GroupedTimeChoiceProps) {
  const handleOptionClick = (nextValue: string) => {
    if (disabled) return;
    onChange(nextValue);
  };

  return (
    <div role="radiogroup" aria-label={ariaLabel} className="space-y-2.5">
      {groups.map((group) => {
        const groupOptions = group.optionValues
          .map((optionValue) =>
            options.find((option) => option.value === optionValue),
          )
          .filter((option): option is TimeRangeOption => Boolean(option));

        return (
          <div
            key={group.id}
            className="grid grid-cols-[42px_minmax(0,1fr)] items-stretch gap-2"
          >
            <div className="flex items-center justify-center rounded-xl bg-surface-soft px-1 text-center text-[12px] font-medium leading-tight text-ink-faint">
              {group.label}
            </div>
            <div
              className={`grid min-h-[48px] gap-1.5 ${getGridClass(
                groupOptions.length,
              )}`}
            >
              {groupOptions.map((option) => {
                const selected = value === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={disabled}
                    onClick={() => handleOptionClick(option.value)}
                    className={`min-h-[48px] rounded-xl border px-2 text-[14px] font-semibold tracking-tight transition-all active:scale-[0.98] disabled:pointer-events-none ${
                      selected
                        ? "border-accent/45 bg-accent-soft text-ink shadow-[0_5px_12px_rgba(39,51,31,0.06)]"
                        : "border-line bg-white text-ink-soft hover:bg-line-soft/45"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className="text-center text-[12px] leading-tight text-ink-faint">
        选择一个大概范围
      </p>
    </div>
  );
}
