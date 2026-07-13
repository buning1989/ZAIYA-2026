import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import RecordInlineInput from "./RecordInlineInput";
import RecordNoteSection from "./RecordNoteSection";
import RecordSummaryCard, {
  type SummaryRow,
} from "./RecordSummaryCard";
import {
  mealTypes,
  foodOptionsByMealType,
  bodyFeelingOptions,
  snackTimeOptions,
  mealTypeLabel,
  type MealType,
} from "@/data/mealOptions";
import type { Answers, RecordType } from "@/data/record";

const ease = [0.22, 1, 0.36, 1] as const;
const TOTAL_STEPS = 3;
const AUTO_ADVANCE_MS = 250;

type Step = 1 | 2 | 3;
type Phase = "form" | "confirm";
type InputPanel = null | "food" | "body";

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

export default function MealRecordWizard({
  answers,
  setAnswers,
  onFinishRecord,
  onAbort,
  onProgressChange,
}: Props) {
  // —— 核心状态机 ——
  const [step, setStep] = useState<Step>(1);
  const [phase, setPhase] = useState<Phase>("form");
  // 修改模式：从结算页进入某一步修改，完成后直接回结算页
  const [editMode, setEditMode] = useState(false);

  // —— 各步答案 ——
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [snackTimeLabel, setSnackTimeLabel] = useState<string | null>(null);
  const [foodTags, setFoodTags] = useState<string[]>([]);
  const [customFoodText, setCustomFoodText] = useState("");
  const [bodyTags, setBodyTags] = useState<string[]>([]);
  const [customBodyFeelingText, setCustomBodyFeelingText] = useState("");
  const [note, setNote] = useState("");

  // 统一输入抽屉：复用 RecordInlineInput
  // food = 其他食物 / body = 其他感受 / note = 补充说明
  const [inputPanel, setInputPanel] = useState<InputPanel>(null);

  // 结算页"保存记录"后的原地保存态：保存后不跳 done 页，仅切换按钮 + 盖章
  const [isSaved, setIsSaved] = useState(false);

  // —— 计时器 ref ——
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

  // —— 派生数据 ——
  const foodOptions = mealType ? foodOptionsByMealType[mealType] : [];
  const mealLabel = mealType ? mealTypeLabel[mealType] : null;
  // 「其他 / 自己写」胶囊已填写态：customFoodText 非空
  const foodCustomFilled = customFoodText.trim().length > 0;
  const bodyCustomFilled = customBodyFeelingText.trim().length > 0;

  // 结算页合并展示：标准胶囊 + 自由输入合并到同一行
  const foodSummary = [foodTags.join("、"), customFoodText.trim()]
    .filter(Boolean)
    .join("、");
  const bodySummary = [bodyTags.join("、"), customBodyFeelingText.trim()]
    .filter(Boolean)
    .join("、");

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
    if (mealType) {
      newAnswers.mealType = {
        type: "option",
        value: mealType,
        label: mealTypeLabel[mealType],
      };
    }
    if (mealType === "snack" && snackTimeLabel) {
      newAnswers.snackTimeLabel = {
        type: "option",
        value: snackTimeLabel,
        label: snackTimeLabel,
      };
    }
    if (foodTags.length > 0) {
      newAnswers.foodTags = {
        type: "option",
        value: foodTags.join("|"),
        label: foodTags.join("、"),
      };
    }
    if (customFoodText.trim()) {
      newAnswers.customFoodText = {
        type: "custom",
        value: customFoodText.trim(),
      };
    }
    if (bodyTags.length > 0) {
      newAnswers.bodyTags = {
        type: "option",
        value: bodyTags.join("|"),
        label: bodyTags.join("、"),
      };
    }
    if (customBodyFeelingText.trim()) {
      newAnswers.customBodyFeelingText = {
        type: "custom",
        value: customBodyFeelingText.trim(),
      };
    }
    if (note.trim()) {
      newAnswers.note = { type: "custom", value: note.trim() };
    }
    setAnswers(newAnswers);
  }, [
    mealType,
    snackTimeLabel,
    foodTags,
    customFoodText,
    bodyTags,
    customBodyFeelingText,
    note,
    setAnswers,
  ]);

  // ===================== 修改模式 =====================
  const exitEditMode = () => {
    setEditMode(false);
    setPhase("confirm");
  };

  // ===================== 选择处理 =====================

  // Step 1：餐次单选
  //   - 早餐 / 午餐 / 晚餐：选中后 250ms 自动进入下一步
  //   - 加餐：不自动进入，下方展开时间胶囊，选时间后再进入
  const handleSelectMealType = (m: MealType) => {
    clearAutoAdvance();
    setMealType(m);
    if (m !== "snack") {
      setSnackTimeLabel(null);
      autoAdvanceTimer.current = window.setTimeout(() => {
        if (editMode) exitEditMode();
        else setStep(2);
      }, AUTO_ADVANCE_MS);
    }
  };

  // Step 1：加餐时间单选 → 250ms → 进入下一步
  const handleSelectSnackTime = (label: string) => {
    clearAutoAdvance();
    setSnackTimeLabel(label);
    autoAdvanceTimer.current = window.setTimeout(() => {
      if (editMode) exitEditMode();
      else setStep(2);
    }, AUTO_ADVANCE_MS);
  };

  // Step 2：食物多选
  const handleToggleFood = (tag: string) => {
    setFoodTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // Step 2：「其他 / 自己写」点击 → 打开输入抽屉（不展开内嵌输入框）
  const handleOpenFoodPanel = () => {
    clearAutoAdvance();
    setInputPanel("food");
  };

  const foodValid = foodTags.length > 0 || foodCustomFilled;
  const handleNextFromFood = () => {
    if (!foodValid) return;
    if (editMode) exitEditMode();
    else setStep(3);
  };

  // Step 3：感受多选
  const handleToggleBody = (tag: string) => {
    setBodyTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // Step 3：「其他感受」点击 → 打开输入抽屉
  const handleOpenBodyPanel = () => {
    clearAutoAdvance();
    setInputPanel("body");
  };

  const bodyValid = bodyTags.length > 0 || bodyCustomFilled;
  const handleNextFromBody = () => {
    if (!bodyValid) return;
    if (editMode) exitEditMode();
    else setPhase("confirm");
  };

  // —— 统一输入抽屉保存：根据当前 panel 写入对应字段 ——
  const handleInputSave = (value: string) => {
    if (inputPanel === "food") setCustomFoodText(value);
    else if (inputPanel === "body") setCustomBodyFeelingText(value);
    setInputPanel(null);
  };

  // 结算页："保存记录" → 原地保存 + 发能量 + 盖章 + Toast
  // 幂等：已保存后再次点击直接返回，不重复发能量
  const handleSave = () => {
    if (isSaved) {
      onAbort();
      return;
    }
    onFinishRecord(answers);
    setIsSaved(true);
  };

  const timeStr = "刚刚";

  // —— 通用样式 ——
  // 多选胶囊：选中态只用填充色 + 加深边框表达，不显示对号图标（与情绪 / 服用模块一致）
  const chipClass = (selected: boolean) =>
    `inline-flex items-center justify-center rounded-full border px-4 py-2 text-[14px] font-medium whitespace-nowrap max-w-[240px] overflow-hidden text-ellipsis transition-all active:scale-[0.97] ${
      selected
        ? "border-status-mood/90 bg-status-mood/[0.22] text-ink"
        : "border-status-mood/45 bg-white text-ink hover:border-status-mood/70"
    }`;

  // —— 结算页行配置：全部只读展示，不可点击 ——
  const summaryRows: SummaryRow[] = [];
  if (mealLabel) {
    // 加餐：把加餐时间嵌入餐次行，避免出现两条时间相关行
    const mealValue =
      mealType === "snack" && snackTimeLabel
        ? `${mealLabel} · ${snackTimeLabel}`
        : mealLabel;
    summaryRows.push({
      label: "餐次",
      value: mealValue,
    });
  }
  summaryRows.push({
    label: "吃了什么",
    value: foodSummary,
    placeholder: "未记录",
  });
  summaryRows.push({
    label: "吃完感受",
    value: bodySummary,
    placeholder: "未记录",
  });
  // 时间：记录创建时间
  summaryRows.push({
    label: "时间",
    value: timeStr,
  });

  // ===================== 渲染：结算页 =====================
  if (phase === "confirm") {
    return (
      <div className="relative h-full bg-white">
        <RecordSummaryCard
          rows={summaryRows}
          saved={isSaved}
          primaryButtonText={isSaved ? "回到记一下" : "保存记录"}
          onPrimaryClick={handleSave}
        >
          <RecordNoteSection
            value={note}
            onChange={setNote}
            saved={isSaved}
            placeholder="比如今天有什么特殊情况，或想多记一句"
            hint="比如今天有什么特殊情况，或想多记一句"
          />
        </RecordSummaryCard>

      </div>
    );
  }

  // ===================== 渲染：分步表单 =====================
  return (
    <div className="flex h-full flex-col bg-white">
      {/* 顶部进度：细进度条 + 右端弱化数字（仅非修改模式时展示） */}
      {!editMode && (
        <div className="px-5 pt-3">
          <div className="flex items-center gap-2.5">
            <div className="h-[2px] flex-1 rounded-full bg-line-soft">
              <div
                className="h-full rounded-full bg-status-mood/70 transition-all duration-300"
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
            {/* —— Step 1：餐次（单选；加餐需先选时间） —— */}
            {step === 1 && (
              <div className="pt-6">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  这次记录哪一顿？
                </p>
                <div className="mt-7 flex flex-col gap-2.5">
                  {mealTypes.map((m) => {
                    const selected = mealType === m.value;
                    return (
                      <button
                        key={m.value}
                        onClick={() => handleSelectMealType(m.value)}
                        className={`flex h-14 items-center gap-3 rounded-2xl border px-5 text-left transition-all active:scale-[0.99] ${
                          selected
                            ? "border-status-mood/50 bg-status-mood/[0.08] text-ink"
                            : "border-line bg-white text-ink hover:border-ink-faint"
                        }`}
                      >
                        <span className="h-2 w-2 shrink-0 rounded-full bg-status-mood/70" />
                        <span className="flex-1 text-[15px] font-medium tracking-tight">
                          {m.label}
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

                {/* 加餐时间选择：仅当选中加餐后展开 */}
                {mealType === "snack" && (
                  <div className="mt-6">
                    <p className="text-center text-[13px] text-ink-faint">
                      大概什么时候？
                    </p>
                    <div className="mt-3 flex flex-wrap justify-center gap-2.5">
                      {snackTimeOptions.map((t) => (
                        <button
                          key={t}
                          onClick={() => handleSelectSnackTime(t)}
                          className={chipClass(snackTimeLabel === t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* —— Step 2：吃了什么（多选胶囊 +「其他 / 自己写」触发输入抽屉） —— */}
            {step === 2 && mealType && (
              <div className="pt-6">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  吃了哪些东西？
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-2.5">
                  {foodOptions.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleToggleFood(tag)}
                      className={chipClass(foodTags.includes(tag))}
                    >
                      {tag}
                    </button>
                  ))}
                  {/* 「其他 / 自己写」：点击打开输入抽屉；已填写态高亮 */}
                  <button
                    onClick={handleOpenFoodPanel}
                    className={chipClass(foodCustomFilled)}
                  >
                    其他 / 自己写
                  </button>
                </div>
              </div>
            )}

            {/* —— Step 3：吃完感受（多选胶囊 +「其他感受」触发输入抽屉） —— */}
            {step === 3 && (
              <div className="pt-6">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  吃完有哪些感觉？
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-2.5">
                  {bodyFeelingOptions.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleToggleBody(tag)}
                      className={chipClass(bodyTags.includes(tag))}
                    >
                      {tag}
                    </button>
                  ))}
                  {/* 「其他感受」：点击打开输入抽屉；已填写态高亮 */}
                  <button
                    onClick={handleOpenBodyPanel}
                    className={chipClass(bodyCustomFilled)}
                  >
                    其他感受
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 底部按钮 */}
      {step === 2 && (
        <div className="bg-white px-5 pb-6 pt-3">
          <button
            onClick={handleNextFromFood}
            disabled={!foodValid}
            className={`w-full rounded-xl px-4 py-3 text-[14px] font-medium transition-opacity ${
              foodValid
                ? "bg-action-primary text-action-primary-text hover:opacity-90"
                : "bg-line-soft text-ink-faint"
            }`}
          >
            {editMode ? "确认修改" : "下一步"}
          </button>
        </div>
      )}
      {step === 3 && (
        <div className="bg-white px-5 pb-6 pt-3">
          <button
            onClick={handleNextFromBody}
            disabled={!bodyValid}
            className={`w-full rounded-xl px-4 py-3 text-[14px] font-medium transition-opacity ${
              bodyValid
                ? "bg-action-primary text-action-primary-text hover:opacity-90"
                : "bg-line-soft text-ink-faint"
            }`}
          >
            {editMode ? "确认修改" : "下一步"}
          </button>
        </div>
      )}

      {/* —— 统一输入抽屉：其他食物 / 其他感受 —— */}
      <RecordInlineInput
        show={inputPanel === "food"}
        title="其他食物"
        placeholder="写下你吃了什么"
        value={customFoodText}
        onSave={handleInputSave}
        onClose={() => setInputPanel(null)}
      />
      <RecordInlineInput
        show={inputPanel === "body"}
        title="其他感受"
        placeholder="写下吃完后的感觉"
        value={customBodyFeelingText}
        onSave={handleInputSave}
        onClose={() => setInputPanel(null)}
      />
    </div>
  );
}
