/* —— 步骤 2/5：选择整理时间段 ——
 * 4 个选项（默认自定义，预填 2026-06-15 至 2026-07-17）
 * 点击「整理沟通重点」后 600-1000ms 加载，然后进入下一步 */
import { useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import {
  RANGE_OPTIONS,
  getCoverage,
  RECORD_CATEGORIES,
  DEFAULT_CUSTOM_RANGE,
  type RangeKey,
  type CommunicationSession,
} from "@/data/organize";
import { StepProgress, PrimaryButton } from "./shared";

interface Props {
  session: CommunicationSession;
  onBack: () => void;
  onNext: (rangeKey: RangeKey) => void;
}

export default function TimeRangeStep({ session, onBack, onNext }: Props) {
  const [selected, setSelected] = useState<RangeKey>(session.rangeKey || "custom");
  const [loading, setLoading] = useState(false);

  const coverage = getCoverage(selected);

  const handleNext = () => {
    setLoading(true);
    // 600-1000ms 轻量加载
    window.setTimeout(() => {
      setLoading(false);
      onNext(selected);
    }, 800);
  };

  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-2">
        <button
          onClick={onBack}
          aria-label="返回"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-[17px] font-semibold tracking-tight text-ink">
          整理哪段时间的记录？
        </h1>
      </div>
      <StepProgress current={2} total={5} />

      {/* 内容区 */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        {/* 时间段选项 */}
        <div className="mt-5 flex flex-col gap-2.5">
          {RANGE_OPTIONS.map((opt) => {
            const isSelected = selected === opt.value;
            const isDisabled = opt.value === "custom";
            const cov = getCoverage(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => !isDisabled && setSelected(opt.value)}
                disabled={isDisabled}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                  isDisabled
                    ? "border-line bg-card-soft/20 opacity-60"
                    : isSelected
                      ? "border-accent bg-accent-soft/50"
                      : "border-line bg-white hover:bg-card-soft/30"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-ink">
                      {opt.label}
                    </span>
                    {isDisabled && (
                      <span className="rounded-full bg-line-soft px-2 py-0.5 text-[10px] text-ink-faint">
                        暂未开放
                      </span>
                    )}
                  </div>
                  {opt.value === "custom" && isSelected && !isDisabled && (
                    <div className="mt-1 text-[12px] text-ink-faint">
                      {DEFAULT_CUSTOM_RANGE.startDate} — {DEFAULT_CUSTOM_RANGE.endDate}
                    </div>
                  )}
                  {opt.value !== "custom" && (
                    <div className="mt-0.5 text-[12px] text-ink-faint">
                      {cov.startDate} — {cov.endDate}
                    </div>
                  )}
                </div>
                <div
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${
                    isSelected && !isDisabled
                      ? "border-accent bg-accent"
                      : "border-line bg-white"
                  }`}
                >
                  {isSelected && !isDisabled && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* 数据覆盖信息 */}
        <div className="mt-5 rounded-2xl border border-line bg-card-soft/30 px-4 py-3.5">
          <div className="text-[13px] text-ink">
            该时间段共 {coverage.totalDays} 天，其中 {coverage.recordedDays} 天有记录。
          </div>
          <div className="mt-2 text-[12px] leading-relaxed text-ink-faint">
            已覆盖记录类型：{RECORD_CATEGORIES.join("、")}
          </div>
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="shrink-0 px-5 pb-8 pt-3">
        <PrimaryButton onClick={handleNext} disabled={loading}>
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              正在整理相关记录
            </span>
          ) : (
            "整理沟通重点"
          )}
        </PrimaryButton>
      </div>
    </div>
  );
}
