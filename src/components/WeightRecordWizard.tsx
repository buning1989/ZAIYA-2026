import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import RecordNoteSection from "./RecordNoteSection";
import RecordSummaryCard, { type SummaryRow } from "./RecordSummaryCard";
import { calculateBMI, getBMIRemark, getUserProfile } from "@/data/userProfile";
import { weightMeasureContextOptions } from "@/data/weightOptions";
import type { Answers, RecordType } from "@/data/record";

const ease = [0.22, 1, 0.36, 1] as const;
const TOTAL_STEPS = 2;
// 选中反馈停留时间：和情绪模块一致，避免最后一步刚选中就切到确认页
const SELECTION_FEEDBACK_MS = 800;

// 体重调节范围（与原通用 RecordWizard 体重步进器一致）
const WEIGHT_MIN = 20;
const WEIGHT_MAX = 200;
const WEIGHT_STEP = 0.1;

type Step = 1 | 2;
type Phase = "form" | "confirm";

/* —— 解析体重数值：无效返回 null —— */
function parseWeightKg(value: string): number | null {
  if (!value) return null;
  const w = Number(value);
  if (!Number.isFinite(w) || w <= 0) return null;
  return w;
}

interface Props {
  type: RecordType;
  answers: Answers;
  setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
  onSave: (answers: Answers) => void;
  onFinishRecord: (answers: Answers) => void;
  onAbort: () => void;
  /** 上一次体重记录值（用于默认填入 + 步进调节）；无历史时为 null */
  lastWeight: number | null;
  onProgressChange: (progress: {
    hasCompletedFirstStep: boolean;
    isFullRecordReady: boolean;
    isSafetyPhase: boolean;
  }) => void;
}

export default function WeightRecordWizard({
  answers,
  setAnswers,
  onFinishRecord,
  onAbort,
  lastWeight,
  onProgressChange,
}: Props) {
  // —— 核心状态机 ——
  const [step, setStep] = useState<Step>(1);
  const [phase, setPhase] = useState<Phase>("form");
  // 修改模式：从确认页进入某一步修改，完成后直接回确认页
  const [editMode, setEditMode] = useState(false);

  // —— 各步答案 ——
  // 体重输入：有历史时默认填入上一次体重，无历史时为空
  const [weightInput, setWeightInput] = useState<string>(
    lastWeight !== null ? lastWeight.toFixed(1) : "",
  );
  const [measureContext, setMeasureContext] = useState<string | null>(null);
  // 补充说明（确认页 RecordNoteSection 管理）
  const [note, setNote] = useState("");

  // 确认页"完成记录"后的原地保存态：保存后不再跳 done 页，仅切换按钮 + 盖章
  const [isSaved, setIsSaved] = useState(false);

  // —— 自动跳转计时器 ref ——
  const autoAdvanceTimer = useRef<number | null>(null);

  const clearAutoAdvance = () => {
    if (autoAdvanceTimer.current !== null) {
      window.clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  };

  // 组件卸载时清理
  useEffect(
    () => () => {
      clearAutoAdvance();
    },
    [],
  );

  // —— 派生数据 ——
  const weightValue = parseWeightKg(weightInput);
  const weightInvalid = weightInput.trim() !== "" && weightValue === null;

  // BMI：用本次体重 + 隐私资料身高计算；身高缺失时为 null
  const heightCm = getUserProfile().heightCm;
  const bmi =
    weightValue !== null && heightCm > 0
      ? calculateBMI(weightValue, heightCm)
      : null;
  const bmiText =
    bmi !== null
      ? `${bmi.toFixed(1)}（${getBMIRemark(bmi)}）`
      : "暂无（缺少身高）";

  // —— 进度上报 ——
  useEffect(() => {
    onProgressChange({
      hasCompletedFirstStep: step >= 2,
      isFullRecordReady: phase === "confirm",
      isSafetyPhase: false,
    });
  }, [step, phase, onProgressChange]);

  // —— 同步到父级 wizardAnswers ——
  useEffect(() => {
    const newAnswers: Answers = {};
    if (weightValue !== null) {
      newAnswers.weightKg = {
        type: "custom",
        value: weightValue.toFixed(1),
      };
    }
    if (measureContext) {
      newAnswers.measureContext = {
        type: "option",
        value: measureContext,
        label: measureContext,
      };
    }
    if (bmi !== null) {
      newAnswers.bmi = { type: "custom", value: bmi.toFixed(1) };
      newAnswers.bmiLabel = { type: "custom", value: getBMIRemark(bmi) };
    }
    if (note.trim()) {
      newAnswers.note = { type: "custom", value: note.trim() };
    }
    setAnswers(newAnswers);
  }, [weightValue, measureContext, bmi, note, setAnswers]);

  // ===================== 修改模式 =====================
  const exitEditMode = () => {
    setEditMode(false);
    setPhase("confirm");
  };

  // ===================== 选择处理 =====================

  // Step 1：体重数值输入（仅保留数字与小数点）
  const handleWeightChange = (v: string) => {
    let filtered = v.replace(/[^0-9.]/g, "");
    const firstDot = filtered.indexOf(".");
    if (firstDot !== -1) {
      filtered =
        filtered.slice(0, firstDot + 1) +
        filtered.slice(firstDot + 1).replace(/\./g, "");
    }
    setWeightInput(filtered);
  };

  // 步进调节：±0.1，限定在 [WEIGHT_MIN, WEIGHT_MAX]，保留 1 位小数
  const adjustWeight = (delta: number) => {
    const current = weightValue ?? lastWeight ?? WEIGHT_MIN;
    const next = Math.min(
      WEIGHT_MAX,
      Math.max(WEIGHT_MIN, +(current + delta).toFixed(1)),
    );
    setWeightInput(next.toFixed(1));
  };

  // Step 1：底部按钮 → 下一步 / 确认修改
  const handleNextFromWeight = () => {
    if (weightValue === null) return;
    if (editMode) {
      exitEditMode();
    } else {
      setStep(2);
    }
  };

  // Step 2：测量场景单选 → 明确展示选中态 → 自动进入确认页
  const handleSelectContext = (c: string) => {
    clearAutoAdvance();
    setMeasureContext(c);
    autoAdvanceTimer.current = window.setTimeout(() => {
      if (editMode) {
        exitEditMode();
      } else {
        setPhase("confirm");
      }
    }, SELECTION_FEEDBACK_MS);
  };

  // Step 2：「暂不补充」→ 直接进入确认页（测量场景为非必填辅助上下文）
  const handleSkipContext = () => {
    clearAutoAdvance();
    if (editMode) {
      exitEditMode();
    } else {
      setPhase("confirm");
    }
  };

  // 确认页："完成记录" → 原地保存 + 发能量 + 盖章 + Toast
  // 幂等：已保存后再次点击直接返回，不重复发能量
  const handleCompleteRecord = () => {
    if (isSaved) {
      onAbort();
      return;
    }
    onFinishRecord(answers);
    setIsSaved(true);
  };

  const timeStr = "刚刚";

  // —— 通用样式 ——
  // 多选胶囊：选中态只用填充色 + 加深边框表达，不显示对号图标（与情绪模块一致）
  const chipClass = (selected: boolean) =>
    `inline-flex items-center justify-center rounded-full border px-4 py-2 text-[14px] font-medium whitespace-nowrap transition-all active:scale-[0.97] ${
      selected
        ? "border-action-primary bg-action-soft text-ink"
        : "border-line bg-white text-ink hover:border-action-primary/60"
    }`;

  // 步进胶囊（−0.1 / +0.1）
  const stepperClass =
    "inline-flex items-center justify-center rounded-full border border-line bg-white px-4 py-2 text-[14px] font-medium text-ink transition-all active:scale-[0.97] hover:border-ink-faint";

  const summaryRows: SummaryRow[] = [
    {
      label: "体重",
      value: weightValue !== null ? `${weightValue.toFixed(1)} kg` : "",
      placeholder: "未记录",
      preserveLabel: true,
    },
    { label: "BMI", value: bmiText, preserveLabel: true },
    {
      label: "场景",
      value: measureContext ?? "",
      placeholder: "未记录",
      preserveLabel: true,
    },
    { label: "时间", value: timeStr, preserveLabel: true },
  ];

  // ===================== 渲染：分步表单 / 确认页 =====================
  return (
    <div className="relative h-full overflow-hidden bg-white">
      <AnimatePresence initial={false} mode="wait">
        {phase === "confirm" ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22, ease }}
            className="absolute inset-0 bg-white"
          >
            <RecordSummaryCard
              rows={summaryRows}
              saved={isSaved}
              primaryButtonText={isSaved ? "回到记一下" : "保存记录"}
              onPrimaryClick={handleCompleteRecord}
            >
              <RecordNoteSection
                value={note}
                onChange={setNote}
                saved={isSaved}
                placeholder="比如今天饭后称的 / 穿着外套称的 / 不太确定准不准"
                hint="比如今天有什么特殊情况，或想多记一句"
              />
            </RecordSummaryCard>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22, ease }}
            className="absolute inset-0 flex flex-col bg-white"
          >
            {/* 顶部进度：细进度条 + 右端弱化数字（仅非修改模式时展示） */}
            {!editMode && (
              <div className="px-5 pt-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-[2px] flex-1 rounded-full bg-line-soft">
                    <div
                      className="h-full rounded-full bg-action-primary transition-all duration-300"
                      style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-ink-faint">
                    {step}/{TOTAL_STEPS}
                  </span>
                </div>
              </div>
            )}
            {editMode && (
              <div className="px-5 pt-3">
                <span className="text-[12px] text-ink-faint">修改中</span>
              </div>
            )}

            {/* 步骤内容 */}
            <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${step}-${editMode}`}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22, ease }}
                >
                  {/* —— Step 1：体重数值（数字键盘 + 步进微调） —— */}
                  {step === 1 && (
                    <div className="pt-6">
                      <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                        今天的体重大概是多少？
                      </p>

                      {/* 大数字输入 + kg 单位 */}
                      <div className="mt-8 flex items-end justify-center gap-2">
                        <input
                          inputMode="decimal"
                          value={weightInput}
                          onChange={(e) => handleWeightChange(e.target.value)}
                          placeholder="0.0"
                          className="w-[150px] border-b-2 border-action-primary/50 bg-transparent text-center text-[40px] font-[650] leading-tight tracking-tight text-ink outline-none placeholder:text-ink-faint/40 focus:border-action-primary"
                        />
                        <span className="pb-1.5 text-[16px] font-medium text-ink-faint">
                          kg
                        </span>
                      </div>

                      {/* 无效输入轻提示 */}
                      {weightInvalid && (
                        <p className="mt-3 text-center text-[12px] text-ink-faint">
                          请输入一个体重数值
                        </p>
                      )}

                      {/* 步进调节：有历史体重时展示，便于微调 */}
                      {lastWeight !== null && (
                        <div className="mt-6 flex flex-col items-center gap-2.5">
                          <div className="flex gap-3">
                            <button
                              onClick={() => adjustWeight(-WEIGHT_STEP)}
                              className={stepperClass}
                            >
                              −0.1 kg
                            </button>
                            <button
                              onClick={() => adjustWeight(WEIGHT_STEP)}
                              className={stepperClass}
                            >
                              +0.1 kg
                            </button>
                          </div>
                          <p className="text-[12px] text-ink-faint">
                            上次记录：{lastWeight.toFixed(1)} kg
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* —— Step 2：测量场景（胶囊单选，自动进入确认页） —— */}
                  {step === 2 && (
                    <div className="pt-6">
                      <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                        这是在什么时候称的？
                      </p>
                      <div className="mt-7 flex flex-wrap justify-center gap-2.5">
                        {weightMeasureContextOptions.map((c) => (
                          <button
                            key={c}
                            onClick={() => handleSelectContext(c)}
                            className={chipClass(measureContext === c)}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 底部按钮：Step 1 */}
            {step === 1 && (
              <div className="bg-white px-5 pb-6 pt-3">
                <button
                  onClick={handleNextFromWeight}
                  disabled={weightValue === null}
                  className={`w-full rounded-xl px-4 py-3 text-[14px] font-medium transition-opacity ${
                    weightValue !== null
                      ? "bg-action-primary text-action-primary-text hover:opacity-90"
                      : "bg-surface-muted text-ink-faint"
                  }`}
                >
                  {editMode ? "确认修改" : "继续"}
                </button>
              </div>
            )}
            {/* 底部按钮：Step 2（测量场景为非必填，提供「暂不补充」跳过） */}
            {step === 2 && (
              <div className="bg-white px-5 pb-6 pt-3">
                <button
                  onClick={handleSkipContext}
                  className="w-full rounded-full border border-line bg-surface-soft px-4 py-3 text-[13px] font-medium text-ink-soft transition-colors hover:border-ink-faint hover:bg-white"
                >
                  暂不补充
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
