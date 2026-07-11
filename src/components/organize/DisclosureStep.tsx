/* —— 步骤 4/5：特殊情况披露确认 ——
 * 只陈述事实，不做风险判断
 * 「纳入本次材料」需二次确认
 * 「不纳入本次材料」不进入任何最终材料
 * 即时风险不在本页面处理 */
import { useState } from "react";
import { ChevronLeft, Check } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import type {
  CommunicationSession,
  SpecialDisclosure,
  DisclosureDecision,
} from "@/data/organize";
import { StepProgress, PrimaryButton, BottomSheet } from "./shared";

interface Props {
  session: CommunicationSession;
  onBack: () => void;
  onNext: (disclosure: SpecialDisclosure) => void;
}

export default function DisclosureStep({ session, onBack, onNext }: Props) {
  const [disclosure, setDisclosure] = useState<SpecialDisclosure>(
    session.specialDisclosure,
  );
  const [confirmInclude, setConfirmInclude] = useState(false);

  const canProceed =
    disclosure.decision !== "pending" &&
    (disclosure.decision === "exclude" || disclosure.confirmed);

  const handleChoose = (decision: DisclosureDecision) => {
    if (decision === "include") {
      // 纳入需二次确认
      setConfirmInclude(true);
    } else {
      // 不纳入：直接设置，不进入材料
      setDisclosure((prev) => ({
        ...prev,
        decision: "exclude",
        confirmed: true,
        allowedInMaterial: false,
      }));
    }
  };

  const handleConfirmInclude = () => {
    setDisclosure((prev) => ({
      ...prev,
      decision: "include",
      confirmed: true,
      allowedInMaterial: true,
    }));
    setConfirmInclude(false);
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
          还有需要单独确认的内容
        </h1>
      </div>
      <StepProgress current={4} total={5} />

      {/* 内容区 */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        {/* 事实陈述（中性卡片，不使用红色警示） */}
        <div className="mt-5 rounded-2xl border border-line bg-card-soft/30 px-4 py-4">
          <p className="text-[13px] leading-relaxed text-ink">
            {disclosure.summary}
          </p>
        </div>

        {/* 具体内容（默认展示） */}
        <div className="mt-4">
          <div className="rounded-2xl border border-line bg-white px-4 py-3.5">
            <ul className="flex flex-col gap-2">
              {disclosure.detailRecords.map((record, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-[12.5px] leading-relaxed text-ink-soft"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                  {record}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 决定区域 */}
        <div className="mt-6 flex flex-col gap-2.5">
          {/* 纳入本次材料 */}
          <button
            onClick={() => handleChoose("include")}
            className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition-colors ${
              disclosure.decision === "include"
                ? "border-accent bg-accent-soft/50"
                : "border-line bg-white"
            }`}
          >
            <span className="text-[14px] font-medium text-ink">
              纳入本次材料
            </span>
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${
                disclosure.decision === "include"
                  ? "border-accent bg-accent"
                  : "border-line bg-white"
              }`}
            >
              {disclosure.decision === "include" && (
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              )}
            </span>
          </button>

          {/* 不纳入本次材料 */}
          <button
            onClick={() => handleChoose("exclude")}
            className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition-colors ${
              disclosure.decision === "exclude"
                ? "border-accent bg-accent-soft/50"
                : "border-line bg-white"
            }`}
          >
            <span className="text-[14px] font-medium text-ink">
              不纳入本次材料
            </span>
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${
                disclosure.decision === "exclude"
                  ? "border-accent bg-accent"
                  : "border-line bg-white"
              }`}
            >
              {disclosure.decision === "exclude" && (
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              )}
            </span>
          </button>
        </div>

        {/* 已选状态说明 */}
        {disclosure.decision === "include" && disclosure.confirmed && (
          <div className="mt-4 rounded-xl bg-accent-soft/30 px-4 py-3 text-[12px] leading-relaxed text-accent-pressed">
            医生将在完整材料中看到上述记录。
          </div>
        )}
        {disclosure.decision === "exclude" && (
          <div className="mt-4 rounded-xl bg-card-soft/40 px-4 py-3 text-[12px] leading-relaxed text-ink-faint">
            相关内容不会进入本次沟通材料、完整材料和导出内容。
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="shrink-0 px-5 pb-8 pt-3">
        <PrimaryButton
          onClick={() => onNext(disclosure)}
          disabled={!canProceed}
        >
          下一步
        </PrimaryButton>
      </div>

      {/* 纳入二次确认 */}
      <AnimatePresence>
        {confirmInclude && (
          <BottomSheet onClose={() => setConfirmInclude(false)}>
            <div className="text-[16px] font-semibold text-ink">
              确认纳入本次材料？
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              确认后，医生将在完整材料中看到上述记录。
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() => setConfirmInclude(false)}
                className="flex-1 rounded-xl border border-line bg-white py-3 text-[13px] font-medium text-ink"
              >
                返回
              </button>
              <button
                onClick={handleConfirmInclude}
                className="flex-1 rounded-xl bg-action-primary py-3 text-[13px] font-medium text-action-primary-text"
              >
                确认纳入
              </button>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </div>
  );
}
