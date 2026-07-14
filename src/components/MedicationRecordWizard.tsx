import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import RecordInlineInput from "./RecordInlineInput";
import RecordNoteSection from "./RecordNoteSection";
import RecordSummaryCard, { type SummaryRow } from "./RecordSummaryCard";
import type { Answers, RecordType } from "@/data/record";

const ease = [0.22, 1, 0.36, 1] as const;
const TOTAL_STEPS = 3;
const AUTO_ADVANCE_MS = 250;

type Step = 1 | 2 | 3;
// 三段状态机：editing（填写）→ preview（结算单预览，未保存）→ saved（保存成功）
type Phase = "editing" | "preview" | "saved";
// 当前打开的输入面板：custom=其他感受 / null=未打开
type InputPanel = "custom" | null;

interface Props {
  type: RecordType;
  answers: Answers;
  setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
  onSave: (answers: Answers) => void;
  onFinishRecord: (answers: Answers) => void;
  onAbort: () => void;
  onProgressChange: (progress: {
    hasCompletedFirstStep: boolean;
    isFullRecordReady: boolean;
    isSafetyPhase: boolean;
  }) => void;
}

/* —— 第一步：服药时段（单选，自动进入下一步） —— */
const DOSE_SLOTS = [
  { value: "morning", label: "早上的药", time: "08:00" },
  { value: "noon", label: "中午的药", time: "13:00" },
  { value: "evening", label: "晚上的药", time: "20:00" },
] as const;

/* —— 第二步：起效时间（单选，自动进入下一步） —— */
const EFFECT_TIMES = [
  { value: "30m", label: "半小时" },
  { value: "1h", label: "1 小时" },
  { value: "1h30m", label: "1.5 小时" },
  { value: "2h", label: "2 小时" },
  { value: "none", label: "没感觉" },
] as const;

/* —— 第三步：身体感受（多选，「没有感受」与其他互斥；「其他感受」打开输入面板） —— */
const DISCOMFORT_OPTIONS = [
  { value: "drowsy", label: "嗜睡" },
  { value: "dry_mouth", label: "口干" },
  { value: "dizzy", label: "头晕" },
  { value: "nausea", label: "恶心" },
  { value: "none", label: "没有感受" },
] as const;
const NONE_DISCOMFORT_VALUE = "none";

export default function MedicationRecordWizard({
  setAnswers,
  onFinishRecord,
  onAbort,
  onProgressChange,
}: Props) {
  // —— 核心状态机 ——
  const [step, setStep] = useState<Step>(1);
  const [phase, setPhase] = useState<Phase>("editing");
  // 当前打开的输入面板（其他感受 / 补充说明）
  const [inputPanel, setInputPanel] = useState<InputPanel>(null);

  // —— 各步答案（本地 state，实时同步到父级 wizardAnswers） ——
  const [doseSlot, setDoseSlot] = useState<string | null>(null);
  const [doseTime, setDoseTime] = useState<string | null>(null);
  const [effectTime, setEffectTime] = useState<string | null>(null);
  const [discomfortTags, setDiscomfortTags] = useState<string[]>([]);
  const [customDiscomfortText, setCustomDiscomfortText] = useState("");
  const [note, setNote] = useState("");

  const autoAdvanceTimer = useRef<number | null>(null);

  const clearAutoAdvance = () => {
    if (autoAdvanceTimer.current !== null) {
      window.clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  };

  useEffect(
    () => () => {
      clearAutoAdvance();
    },
    [],
  );

  // —— 由本地 state 构造 answers（供父级同步与保存使用） ——
  const buildAnswers = (): Answers => {
    const next: Answers = {};
    if (doseSlot) {
      const slot = DOSE_SLOTS.find((d) => d.value === doseSlot);
      next.doseSlot = {
        type: "option",
        value: doseSlot,
        label: slot?.label ?? doseSlot,
      };
      if (doseTime) {
        next.doseTime = { type: "option", value: doseTime, label: doseTime };
      }
    }
    if (effectTime) {
      const et = EFFECT_TIMES.find((e) => e.value === effectTime);
      next.effectTime = {
        type: "option",
        value: effectTime,
        label: et?.label ?? effectTime,
      };
    }
    if (discomfortTags.length > 0) {
      const labels = discomfortTags
        .map((v) => DISCOMFORT_OPTIONS.find((o) => o.value === v)?.label ?? v)
        .join("、");
      next.discomfortTags = {
        type: "option",
        value: discomfortTags.join("|"),
        label: labels,
      };
    }
    if (customDiscomfortText.trim()) {
      next.customDiscomfortText = {
        type: "custom",
        value: customDiscomfortText.trim(),
      };
    }
    if (note.trim()) {
      next.note = { type: "custom", value: note.trim() };
    }
    return next;
  };

  // —— 同步到父级 wizardAnswers（用于顶部入口判断与部分保存） ——
  useEffect(() => {
    setAnswers(buildAnswers());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doseSlot, doseTime, effectTime, discomfortTags, customDiscomfortText, note]);

  // —— 进度上报 ——
  // editing：依据 step；preview/saved：完整记录已就绪
  useEffect(() => {
    onProgressChange({
      hasCompletedFirstStep: step >= 2 || phase !== "editing",
      isFullRecordReady: phase === "preview" || phase === "saved",
      isSafetyPhase: false,
    });
  }, [step, phase, onProgressChange]);

  // —— Step 1：服药时段单选 → 250ms 后自动进入 ——
  const handleSelectDoseSlot = (value: string, time: string) => {
    clearAutoAdvance();
    setDoseSlot(value);
    setDoseTime(time);
    autoAdvanceTimer.current = window.setTimeout(() => {
      setStep(2);
    }, AUTO_ADVANCE_MS);
  };

  // —— Step 2：起效时间单选 → 250ms 后自动进入 ——
  const handleSelectEffectTime = (value: string) => {
    clearAutoAdvance();
    setEffectTime(value);
    autoAdvanceTimer.current = window.setTimeout(() => {
      setStep(3);
    }, AUTO_ADVANCE_MS);
  };

  // —— Step 3：身体感受多选（「没有感受」与其他互斥） ——
  const handleToggleDiscomfort = (value: string) => {
    setDiscomfortTags((prev) => {
      if (value === NONE_DISCOMFORT_VALUE) {
        // 选择「没有感受」→ 清空其他 + 清空自定义感受（互斥）
        setCustomDiscomfortText("");
        return prev.includes(value) ? [] : [value];
      }
      // 选择其他感受 → 取消「没有感受」
      const withoutNone = prev.filter((v) => v !== NONE_DISCOMFORT_VALUE);
      return withoutNone.includes(value)
        ? withoutNone.filter((v) => v !== value)
        : [...withoutNone, value];
    });
  };

  // —— Step 3：进入结算单预览（不保存） ——
  const handleEnterPreview = () => {
    if (!canEnterPreview) return;
    setPhase("preview");
  };

  // —— 结算单：点击「保存记录」→ 真正调用保存接口 → 切 saved 态 ——
  const handleSave = () => {
    if (phase !== "preview") return;
    const finalAnswers = buildAnswers();
    setAnswers(finalAnswers);
    onFinishRecord(finalAnswers);
    setPhase("saved");
  };

  // —— 「其他感受」胶囊点击：若有内容则清空（再次点击取消），若无内容则打开输入面板 ——
  const handleCustomChipClick = () => {
    if (customDiscomfortText.trim()) {
      setCustomDiscomfortText("");
      return;
    }
    setInputPanel("custom");
  };

  // —— 保存输入面板内容 ——
  const handleInputSave = (value: string) => {
    if (inputPanel === "custom") {
      setCustomDiscomfortText(value);
      // 选择自定义感受时取消「没有感受」
      setDiscomfortTags((prev) => prev.filter((v) => v !== NONE_DISCOMFORT_VALUE));
    }
    setInputPanel(null);
  };

  // —— 进入结算单的可用条件：选了任一身体感受，或填了自定义感受 ——
  // 注：补充说明不作为必填条件，仅作为附加字段。
  const canEnterPreview =
    discomfortTags.length > 0 || customDiscomfortText.trim().length > 0;

  // —— 摘要数据 ——
  const doseSlotLabel =
    DOSE_SLOTS.find((d) => d.value === doseSlot)?.label ?? null;
  const effectTimeLabel =
    EFFECT_TIMES.find((e) => e.value === effectTime)?.label ?? null;
  // 感受 = discomfortTags 标签 + 自定义感受文本，顿号拼接
  const discomfortLabel = [
    discomfortTags
      .map((v) => DISCOMFORT_OPTIONS.find((o) => o.value === v)?.label ?? v)
      .join("、"),
    customDiscomfortText.trim(),
  ]
    .filter(Boolean)
    .join("、");

  const timeStr = "刚刚";

  // 多选胶囊：与情绪记录模块二级选项一致的轻量样式
  const chipClass = (selected: boolean) =>
    `inline-flex items-center justify-center rounded-full border px-4 py-2 text-[14px] font-medium whitespace-nowrap max-w-[240px] overflow-hidden text-ellipsis transition-all active:scale-[0.97] ${
      selected
        ? "border-transparent bg-accent-soft text-ink"
        : "border-line bg-white text-ink hover:border-action-primary/60"
    }`;

  // ===================== 渲染：结算单（preview / saved） =====================
  if (phase === "preview" || phase === "saved") {
    const rows: SummaryRow[] = [
      {
        label: "时段",
        value: doseSlotLabel ? `${doseSlotLabel}${doseTime ? ` ${doseTime}` : ""}` : "",
        placeholder: "未选择",
      },
      { label: "起效", value: effectTimeLabel ?? "", placeholder: "未选择" },
      { label: "感受", value: discomfortLabel, placeholder: "未选择" },
      { label: "时间", value: timeStr },
    ];

    return (
      <div className="relative flex h-full flex-col bg-white">
        <RecordSummaryCard
          rows={rows}
          saved={phase === "saved"}
          primaryButtonText={phase === "saved" ? "回到记一下" : "保存记录"}
          onPrimaryClick={phase === "saved" ? onAbort : handleSave}
        >
          <RecordNoteSection
            value={note}
            onChange={setNote}
            saved={phase === "saved"}
            placeholder="比如今天吃药后还有什么想记的"
            hint="比如今天吃药后还有什么想记的"
          />
        </RecordSummaryCard>

      </div>
    );
  }

  // ===================== 渲染：分步表单 =====================
  return (
    <div className="flex h-full flex-col bg-white">
      {/* 进度条 + 步骤数字 */}
      <div className="px-5 pt-6">
        <div className="flex items-center gap-2.5">
          <div className="h-[2px] flex-1 rounded-full bg-line-soft">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-ink-faint">
            {step}/{TOTAL_STEPS}
          </span>
        </div>
      </div>

      {/* 步骤内容 */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22, ease }}
          >
            {/* —— Step 1：服药时段（单选，自动进入） —— */}
            {step === 1 && (
              <div className="pt-6">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  吃的是哪一顿药？
                </p>
                <div className="mt-7 flex flex-col gap-2.5">
                  {DOSE_SLOTS.map((d) => {
                    const selected = doseSlot === d.value;
                    return (
                      <button
                        key={d.value}
                        onClick={() => handleSelectDoseSlot(d.value, d.time)}
                        className={`flex h-16 items-center gap-3 rounded-2xl border px-5 text-left transition-all active:scale-[0.99] ${
                          selected
                            ? "border-transparent bg-accent-soft text-ink"
                            : "border-line bg-white text-ink hover:border-ink-faint"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="text-[15px] font-medium tracking-tight">
                            {d.label}
                          </div>
                          <div className="mt-0.5 text-[12px] text-ink-faint">
                            {d.time}
                          </div>
                        </div>
                        {selected && (
                          <Check
                            className="h-4 w-4 text-ink"
                            strokeWidth={2.4}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* —— Step 2：起效时间（单选，自动进入） —— */}
            {step === 2 && (
              <div className="pt-6">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  吃完药后，多久开始有感觉？
                </p>
                <div className="mt-7 flex flex-col gap-2.5">
                  {EFFECT_TIMES.map((e) => {
                    const selected = effectTime === e.value;
                    return (
                      <button
                        key={e.value}
                        onClick={() => handleSelectEffectTime(e.value)}
                        className={`flex h-14 items-center gap-3 rounded-2xl border px-5 text-left transition-all active:scale-[0.99] ${
                          selected
                            ? "border-transparent bg-accent-soft text-ink"
                            : "border-line bg-white text-ink hover:border-ink-faint"
                        }`}
                      >
                        <span className="flex-1 text-[15px] font-medium tracking-tight">
                          {e.label}
                        </span>
                        {selected && (
                          <Check
                            className="h-4 w-4 text-ink"
                            strokeWidth={2.4}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* —— Step 3：身体感受（多选 + 其他感受入口 + 补充说明入口） —— */}
            {step === 3 && (
              <div className="pt-6">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  身体有哪些感觉？
                </p>

                {/* 感受胶囊容器：5 个固定选项 + 「其他感受」扩展入口，同一行容器自动换行 */}
                <div className="mt-7 flex flex-wrap justify-center gap-2.5">
                  {DISCOMFORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => handleToggleDiscomfort(o.value)}
                      className={chipClass(discomfortTags.includes(o.value))}
                    >
                      {o.label}
                    </button>
                  ))}
                  {/* 「其他感受」胶囊：已填写态时显示填写内容摘要，点击清空；未填写态点击打开输入面板 */}
                  <button
                    onClick={handleCustomChipClick}
                    className={chipClass(!!customDiscomfortText.trim())}
                  >
                    {customDiscomfortText.trim()
                      ? `其他：${customDiscomfortText.trim()}`
                      : "其他感受"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 底部按钮：仅第 3 步显示「查看记录」入口（不直接保存） */}
      {step === 3 && (
        <div className="bg-white px-5 pb-6 pt-3">
          <button
            onClick={handleEnterPreview}
            disabled={!canEnterPreview}
            className={`w-full rounded-xl px-4 py-3 text-[14px] font-medium transition-opacity ${
              canEnterPreview
                ? "bg-action-primary text-action-primary-text hover:opacity-90"
                : "bg-surface-muted text-ink-faint"
            }`}
          >
            确认这些感受
          </button>
        </div>
      )}

      {/* —— 统一输入面板：其他感受（editing 态 Step 3 触发） —— */}
      <RecordInlineInput
        show={inputPanel === "custom"}
        title="其他感受"
        placeholder="如果还有别的感受，可以写在这里"
        value={customDiscomfortText}
        onSave={handleInputSave}
        onClose={() => setInputPanel(null)}
      />
    </div>
  );
}
