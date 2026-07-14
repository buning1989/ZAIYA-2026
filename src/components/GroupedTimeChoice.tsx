/* —— 折叠分组时间选择（GroupedTimeChoice）——
 *
 * 用于睡眠记录中的“上床时间 / 醒来时间”这类低精度时间点选择。
 * 先选大概时段，再选具体小时，避免把睡眠回忆做成精密测量。
 */
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

const ease = [0.22, 1, 0.36, 1] as const;

export default function GroupedTimeChoice({
  options,
  groups,
  value,
  onChange,
  ariaLabel,
  disabled = false,
}: GroupedTimeChoiceProps) {
  const selectedGroupId = useMemo(() => {
    if (!value) return null;
    return (
      groups.find((group) => group.optionValues.includes(value))?.id ?? null
    );
  }, [groups, value]);

  const [openGroupId, setOpenGroupId] = useState<string | null>(
    selectedGroupId,
  );

  useEffect(() => {
    if (selectedGroupId) {
      setOpenGroupId(selectedGroupId);
    }
  }, [selectedGroupId]);

  const openGroup = groups.find((group) => group.id === openGroupId) ?? null;
  const openOptions = openGroup
    ? openGroup.optionValues
        .map((optionValue) =>
          options.find((option) => option.value === optionValue),
        )
        .filter((option): option is TimeRangeOption => Boolean(option))
    : [];

  const handleGroupClick = (groupId: string) => {
    if (disabled) return;
    setOpenGroupId((current) => (current === groupId ? null : groupId));
  };

  const handleOptionClick = (nextValue: string) => {
    if (disabled) return;
    onChange(nextValue);
  };

  return (
    <div role="radiogroup" aria-label={ariaLabel} className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        {groups.map((group) => {
          const active = openGroupId === group.id;
          const selected = selectedGroupId === group.id;

          return (
            <button
              key={group.id}
              type="button"
              disabled={disabled}
              onClick={() => handleGroupClick(group.id)}
              className={`flex h-[62px] items-center justify-center rounded-2xl border px-3 text-center text-[15px] font-semibold tracking-tight transition-all active:scale-[0.98] disabled:pointer-events-none ${
                active || selected
                  ? "border-accent/45 bg-accent-soft text-ink shadow-[0_6px_14px_rgba(39,51,31,0.06)]"
                  : "border-line bg-white text-ink-soft hover:bg-line-soft/45"
              }`}
            >
              {group.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false} mode="wait">
        {openGroup && (
          <motion.div
            key={openGroup.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease }}
            className="rounded-2xl border border-line bg-white p-2"
          >
            <div className="grid grid-cols-3 gap-2">
              {openOptions.map((option) => {
                const selected = value === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={disabled}
                    onClick={() => handleOptionClick(option.value)}
                    className={`min-h-[46px] rounded-xl border px-2 text-[14px] font-semibold tracking-tight transition-all active:scale-[0.98] disabled:pointer-events-none ${
                      selected
                        ? "border-accent/45 bg-accent-soft text-ink"
                        : "border-transparent bg-surface-soft text-ink-soft hover:bg-line-soft/60"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-[12px] leading-tight text-ink-faint">
        选择一个大概范围
      </p>
    </div>
  );
}
