/* —— 步骤 1/5：选择沟通对象 ——
 * 4 个选项卡（医生可选，其余暂未开放）
 * 通用 communicationTarget 结构，不写死医生 */
import { useState } from "react";
import { ChevronLeft, Check } from "lucide-react";
import {
  COMMUNICATION_TARGETS,
  type CommunicationTargetType,
  type CommunicationSession,
} from "@/data/organize";
import { StepProgress, PrimaryButton } from "./shared";

interface Props {
  session: CommunicationSession;
  onBack: () => void;
  onNext: (targetType: CommunicationTargetType, targetLabel: string) => void;
}

export default function TargetStep({ session, onBack, onNext }: Props) {
  const [selected, setSelected] = useState<CommunicationTargetType | null>(
    session.targetLabel ? session.targetType : null,
  );

  const handleSelect = (targetType: CommunicationTargetType, available: boolean) => {
    if (!available) return;
    setSelected(targetType);
  };

  const canProceed = selected !== null;

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
          这份内容准备给谁看？
        </h1>
      </div>
      <StepProgress current={1} total={5} />

      {/* 内容区 */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        <div className="mt-5 flex flex-col gap-2.5">
          {COMMUNICATION_TARGETS.map((target) => {
            const isSelected = selected === target.targetType;
            return (
              <button
                key={target.targetType}
                onClick={() =>
                  handleSelect(target.targetType, target.available)
                }
                disabled={!target.available}
                className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-colors ${
                  isSelected
                    ? "border-accent bg-accent-soft/50"
                    : target.available
                      ? "border-line bg-white hover:bg-card-soft/30"
                      : "border-line bg-card-soft/20 opacity-60"
                }`}
              >
                <div
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${
                    isSelected
                      ? "border-accent bg-accent"
                      : "border-line bg-white"
                  }`}
                >
                  {isSelected && (
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-ink">
                      {target.targetLabel}
                    </span>
                    {!target.available && (
                      <span className="rounded-full bg-line-soft px-2 py-0.5 text-[10px] text-ink-faint">
                        暂未开放
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
                    {target.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="shrink-0 px-5 pb-8 pt-3">
        <PrimaryButton
          onClick={() => {
            if (selected) {
              const target = COMMUNICATION_TARGETS.find(
                (t) => t.targetType === selected,
              )!;
              onNext(selected, target.targetLabel);
            }
          }}
          disabled={!canProceed}
        >
          下一步
        </PrimaryButton>
      </div>
    </div>
  );
}
