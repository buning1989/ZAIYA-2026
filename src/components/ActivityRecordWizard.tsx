import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import RecordInlineInput from "./RecordInlineInput";
import RecordNoteSection from "./RecordNoteSection";
import RecordSummaryCard, { type SummaryRow } from "./RecordSummaryCard";
import {
  activityCategories,
  activityItemsByCategory,
  activityDurationOptions,
  activityAfterFeelingOptions,
  activityCategoryLabel,
  type ActivityCategory,
} from "@/data/activityOptions";
import type { Answers, RecordType } from "@/data/record";

const ease = [0.22, 1, 0.36, 1] as const;
const TOTAL_STEPS = 4;
const AUTO_ADVANCE_MS = 250;

type Step = 1 | 2 | 3 | 4;
type Phase = "form" | "confirm";

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

export default function ActivityRecordWizard({
  answers,
  setAnswers,
  onFinishRecord,
  onAbort,
  onProgressChange,
}: Props) {
  // —— 核心状态机 ——
  const [step, setStep] = useState<Step>(1);
  const [phase, setPhase] = useState<Phase>("form");
  // 修改模式：从确认页进入某一步修改，完成后直接回确认页
  const [editMode, setEditMode] = useState(false);

  // —— 各步答案 ——
  const [category, setCategory] = useState<ActivityCategory | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const [customText, setCustomText] = useState("");
  const [duration, setDuration] = useState<string | null>(null);
  const [feelings, setFeelings] = useState<string[]>([]);
  // 补充说明（确认页 RecordNoteSection 管理）
  const [note, setNote] = useState("");
  // Step 2：是否打开「其他活动」全局底部输入抽屉
  const [showCustomInput, setShowCustomInput] = useState(false);

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
  const itemOptions = category ? activityItemsByCategory[category] : [];
  const categoryLabel = category ? activityCategoryLabel[category] : null;
  const itemsSummary = [items.join("、"), customText.trim()]
    .filter(Boolean)
    .join("；");
  const feelingsSummary = feelings.join("、");

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
    if (category) {
      newAnswers.activityCategory = {
        type: "option",
        value: category,
        label: activityCategoryLabel[category],
      };
    }
    if (items.length > 0) {
      newAnswers.activityItems = {
        type: "option",
        value: items.join("|"),
        label: items.join("、"),
      };
    }
    if (customText.trim()) {
      newAnswers.customActivityText = { type: "custom", value: customText.trim() };
    }
    if (duration) {
      newAnswers.duration = { type: "option", value: duration, label: duration };
    }
    if (feelings.length > 0) {
      newAnswers.afterFeeling = {
        type: "option",
        value: feelings.join("|"),
        label: feelings.join("、"),
      };
    }
    if (note.trim()) {
      newAnswers.note = { type: "custom", value: note.trim() };
    }
    setAnswers(newAnswers);
  }, [category, items, customText, duration, feelings, note, setAnswers]);

  // ===================== 修改模式 =====================
  const exitEditMode = () => {
    setEditMode(false);
    setPhase("confirm");
  };

  // ===================== 选择处理 =====================

  // Step 1：活动大类单选 → 250ms 选中态 → 自动进入
  const handleSelectCategory = (c: ActivityCategory) => {
    clearAutoAdvance();
    // 切换大类时清空已选细项与自定义输入，避免跨大类残留
    if (c !== category) {
      setItems([]);
      setCustomText("");
      setShowCustomInput(false);
    }
    setCategory(c);
    autoAdvanceTimer.current = window.setTimeout(() => {
      if (editMode) {
        exitEditMode();
      } else {
        setStep(2);
      }
    }, AUTO_ADVANCE_MS);
  };

  // 「其他」大类无预设细项，进入 Step 2 时自动打开自由输入抽屉
  useEffect(() => {
    if (step === 2 && category === "other") {
      setShowCustomInput(true);
    }
  }, [step, category]);

  // Step 2：细项多选
  const handleToggleItem = (tag: string) => {
    setItems((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // Step 2：底部按钮 → 下一步 / 确认修改
  const handleNextFromItems = () => {
    if (items.length === 0 && !customText.trim()) return;
    if (editMode) {
      exitEditMode();
    } else {
      setStep(3);
    }
  };

  // Step 3：时长单选 → 250ms 选中态 → 自动进入
  const handleSelectDuration = (d: string) => {
    clearAutoAdvance();
    setDuration(d);
    autoAdvanceTimer.current = window.setTimeout(() => {
      if (editMode) {
        exitEditMode();
      } else {
        setStep(4);
      }
    }, AUTO_ADVANCE_MS);
  };

  // Step 4：感受多选
  const handleToggleFeeling = (tag: string) => {
    setFeelings((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // Step 4：底部按钮 → 确认页 / 确认修改
  const handleNextFromFeelings = () => {
    if (feelings.length === 0) return;
    if (editMode) {
      exitEditMode();
    } else {
      setPhase("confirm");
    }
  };

  // Step 4：「暂不补充」→ 直接进入确认页（感受为非必填主观字段）
  const handleSkipFeelings = () => {
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
    `inline-flex items-center justify-center rounded-full border px-4 py-2 text-[14px] font-medium whitespace-nowrap max-w-[240px] overflow-hidden text-ellipsis transition-all active:scale-[0.97] ${
      selected
        ? "border-transparent bg-accent-soft text-ink"
        : "border-line bg-white text-ink hover:border-action-primary/60"
    }`;

  // ===================== 渲染：确认页 =====================
  if (phase === "confirm") {
    const rows: SummaryRow[] = [];
    if (categoryLabel) {
      rows.push({ label: "活动", value: categoryLabel });
    }
    rows.push({
      label: "具体活动",
      value: itemsSummary,
      placeholder: "未记录",
    });
    rows.push({
      label: "时长",
      value: duration ?? "",
      placeholder: "未记录",
    });
    rows.push({
      label: "感受",
      value: feelingsSummary,
      placeholder: "未记录",
    });
    rows.push({ label: "时间", value: timeStr });

    return (
      <div className="relative h-full bg-white">
        <RecordSummaryCard
          rows={rows}
          saved={isSaved}
          primaryButtonText={isSaved ? "回到记一下" : "保存记录"}
          onPrimaryClick={handleCompleteRecord}
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
                className="h-full rounded-full bg-accent transition-all duration-300"
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
            {/* —— Step 1：活动大类（卡片单选，自动进入） —— */}
            {step === 1 && (
              <div className="pt-6">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  你刚刚做了什么？
                </p>
                <div className="mt-7 flex flex-col gap-2.5">
                  {activityCategories.map((c) => {
                    const selected = category === c.value;
                    return (
                      <button
                        key={c.value}
                        onClick={() => handleSelectCategory(c.value)}
                        className={`relative flex h-14 items-center gap-3 rounded-2xl border px-5 text-left transition-all active:scale-[0.99] ${
                          selected
                            ? "border-transparent bg-accent-soft text-ink"
                            : "border-line bg-white text-ink hover:border-ink-faint"
                        }`}
                      >
                        <span className="h-2 w-2 shrink-0 rounded-full bg-action-primary" />
                        <span className="flex-1 text-[15px] font-medium tracking-tight">
                          {c.label}
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

            {/* —— Step 2：具体活动（多选胶囊；点击「其他」展开自由输入） —— */}
            {step === 2 && category && (
              <div className="pt-6">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  具体做了哪些活动？
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-2.5">
                  {itemOptions.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleToggleItem(tag)}
                      className={chipClass(items.includes(tag))}
                    >
                      {tag}
                    </button>
                  ))}

                  {/* 已填写自定义内容：作为已选中胶囊展示，点击重新打开抽屉编辑 */}
                  {customText.trim() && (
                    <button
                      onClick={() => setShowCustomInput(true)}
                      className={chipClass(true)}
                    >
                      {customText.trim()}
                    </button>
                  )}

                  {/* 「其他」：点击打开底部输入抽屉 */}
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className={chipClass(!!customText.trim())}
                  >
                    其他
                  </button>
                </div>
              </div>
            )}

            {/* —— Step 3：持续时间（胶囊单选，自动进入） —— */}
            {step === 3 && (
              <div className="pt-6">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  大概持续了多久？
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-2.5">
                  {activityDurationOptions.map((d) => (
                    <button
                      key={d}
                      onClick={() => handleSelectDuration(d)}
                      className={chipClass(duration === d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* —— Step 4：做完后的感受（多选胶囊） —— */}
            {step === 4 && (
              <div className="pt-6">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  做完之后有哪些感觉？
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-2.5">
                  {activityAfterFeelingOptions.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleToggleFeeling(tag)}
                      className={chipClass(feelings.includes(tag))}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 底部按钮：Step 2 / Step 4 */}
      {step === 2 && (
        <div className="bg-white px-5 pb-6 pt-3">
          <button
            onClick={handleNextFromItems}
            disabled={items.length === 0 && !customText.trim()}
            className={`w-full rounded-xl px-4 py-3 text-[14px] font-medium transition-opacity ${
              items.length > 0 || customText.trim()
                ? "bg-action-primary text-action-primary-text hover:opacity-90"
                : "bg-surface-muted text-ink-faint"
            }`}
          >
            {editMode ? "确认修改" : "确认这些活动"}
          </button>
        </div>
      )}
      {step === 4 && (
        <div className="bg-white px-5 pb-6 pt-3">
          <div className="flex gap-3">
            <button
              onClick={handleSkipFeelings}
              className="flex-1 rounded-xl border border-line bg-white px-4 py-3 text-[14px] font-medium text-ink-soft transition-colors hover:border-ink-faint"
            >
              暂不补充
            </button>
            <button
              onClick={handleNextFromFeelings}
              disabled={feelings.length === 0}
              className={`flex-1 rounded-xl px-4 py-3 text-[14px] font-medium transition-opacity ${
                feelings.length > 0
                  ? "bg-action-primary text-action-primary-text hover:opacity-90"
                  : "bg-surface-muted text-ink-faint"
              }`}
            >
              {editMode ? "确认修改" : "确认这些感受"}
            </button>
          </div>
        </div>
      )}

      {/* Step 2「其他」全局底部输入抽屉 */}
      <RecordInlineInput
        show={showCustomInput}
        title="其他活动"
        placeholder="也可以自己写，比如：去了趟邮局"
        value={customText}
        onSave={(v) => setCustomText(v)}
        onClose={() => setShowCustomInput(false)}
      />
    </div>
  );
}
