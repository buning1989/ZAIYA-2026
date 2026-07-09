import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft } from "lucide-react";
import { MoonPhaseIcon } from "./MoonPhaseIcon";
import { FULL_RECORD_ENERGY_REWARD } from "@/data/userProfile";
import {
  primaryMoods,
  feelingOptionsByScore,
  reasonOptions,
  specialSituationCategories,
  MUTUALLY_EXCLUSIVE_REASON,
  findSpecialCategoryById,
  type PrimaryMood,
} from "@/data/moodOptions";
import type { Answers, RecordType } from "@/data/record";

const ease = [0.22, 1, 0.36, 1] as const;

type Step = 1 | 2 | 3 | 4 | 5;
type Phase = "form" | "toast" | "done" | "safety";

const AUTO_ADVANCE_DELAY = 280;

export interface MoodRecordWizardHandle {
  goBackInternal: () => boolean;
}

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
    moodInternalStep?: number;
  }) => void;
}

const MoodRecordWizard = forwardRef<MoodRecordWizardHandle, Props>(
  function MoodRecordWizard(
    { answers, setAnswers, onFinishRecord, onAbort, onProgressChange },
    ref,
  ) {
    const [step, setStep] = useState<Step>(1);
    const [primaryMood, setPrimaryMood] = useState<PrimaryMood | null>(null);
    const [feeling, setFeeling] = useState<string | null>(null);
    const [feelingCustom, setFeelingCustom] = useState("");
    const [feelingInputMode, setFeelingInputMode] = useState(false);
    const [reasons, setReasons] = useState<string[]>([]);
    const [reasonCustom, setReasonCustom] = useState("");
    const [reasonInputMode, setReasonInputMode] = useState(false);
    const [specialCategoryId, setSpecialCategoryId] = useState<string | null>(
      null,
    );
    const [specialDetails, setSpecialDetails] = useState<string[]>([]);
    const [phase, setPhase] = useState<Phase>("form");

    // —— 暴露给父组件：内部返回 ——
    useImperativeHandle(ref, () => ({
      goBackInternal: () => {
        if (phase === "safety") {
          setPhase("form");
          return true;
        }
        if (phase !== "form") return false;
        if (step > 1) {
          setStep((step - 1) as Step);
          return true;
        }
        return false;
      },
    }));

    // —— 进度上报 ——
    useEffect(() => {
      onProgressChange({
        hasCompletedFirstStep: step >= 2,
        isFullRecordReady: phase === "toast" || phase === "done",
        moodInternalStep: step,
      });
    }, [step, phase, onProgressChange]);

    // —— 同步到父级 wizardAnswers ——
    useEffect(() => {
      const newAnswers: Answers = {};
      if (primaryMood) {
        newAnswers.primaryMood = {
          type: "option",
          value: String(primaryMood.score),
          label: primaryMood.label,
        };
      }
      if (feeling) {
        newAnswers.feeling = { type: "option", value: feeling, label: feeling };
      } else if (feelingCustom.trim()) {
        newAnswers.feeling = {
          type: "custom",
          value: feelingCustom.trim(),
        };
      }
      if (reasons.length > 0 || reasonCustom.trim()) {
        const all = [...reasons];
        if (reasonCustom.trim()) all.push(reasonCustom.trim());
        newAnswers.reasons = {
          type: "option",
          value: all.join("|"),
          label: all.join("、"),
        };
      }
      if (specialCategoryId) {
        const cat = findSpecialCategoryById(specialCategoryId);
        if (cat) {
          newAnswers.specialCategory = {
            type: "option",
            value: cat.id,
            label: cat.entry,
          };
        }
      }
      if (specialDetails.length > 0) {
        newAnswers.specialDetails = {
          type: "option",
          value: specialDetails.join("|"),
          label: specialDetails.join("、"),
        };
      }
      setAnswers(newAnswers);
    }, [
      primaryMood,
      feeling,
      feelingCustom,
      reasons,
      reasonCustom,
      specialCategoryId,
      specialDetails,
      setAnswers,
    ]);

    // —— 派生数据 ——
    const feelingOptions = primaryMood
      ? feelingOptionsByScore[primaryMood.score]
      : [];
    const selectedCategory = specialCategoryId
      ? findSpecialCategoryById(specialCategoryId)
      : null;

    // —— 步骤 1：选一级情绪（单选自动进入） ——
    const handleSelectPrimary = (mood: PrimaryMood) => {
      if (primaryMood?.label === mood.label) return;
      setPrimaryMood(mood);
      // 修改一级：清空二级（感受）和三级（原因），不清空特殊情况
      setFeeling(null);
      setFeelingCustom("");
      setFeelingInputMode(false);
      setReasons([]);
      setReasonCustom("");
      setReasonInputMode(false);
      setTimeout(() => setStep(2), AUTO_ADVANCE_DELAY);
    };

    // —— 步骤 2：选感受（单选自动进入） ——
    const handleSelectFeeling = (word: string) => {
      setFeeling(word);
      setFeelingCustom("");
      setFeelingInputMode(false);
      // 修改二级：清空三级（原因）
      setReasons([]);
      setReasonCustom("");
      setReasonInputMode(false);
      setTimeout(() => setStep(3), AUTO_ADVANCE_DELAY);
    };

    const handleFeelingCustomConfirm = () => {
      if (!feelingCustom.trim()) return;
      setFeeling(null);
      setReasons([]);
      setReasonCustom("");
      setTimeout(() => setStep(3), AUTO_ADVANCE_DELAY);
    };

    // —— 步骤 3：选原因（多选 + 互斥） ——
    const handleToggleReason = (reason: string) => {
      setReasons((prev) => {
        if (reason === MUTUALLY_EXCLUSIVE_REASON) {
          return prev.includes(reason) ? [] : [MUTUALLY_EXCLUSIVE_REASON];
        }
        const withoutMutex = prev.filter(
          (r) => r !== MUTUALLY_EXCLUSIVE_REASON,
        );
        return withoutMutex.includes(reason)
          ? withoutMutex.filter((r) => r !== reason)
          : [...withoutMutex, reason];
      });
    };

    const canProceedReasons = reasons.length > 0 || reasonCustom.trim().length > 0;

    // —— 步骤 4：选特殊情况大类（单选 → 进入细项 / 暂不补充 → 确认） ——
    const handleSelectSpecialCategory = (catId: string) => {
      const cat = findSpecialCategoryById(catId);
      if (!cat) return;
      if (cat.isSafetyFlow) {
        setPhase("safety");
        return;
      }
      // 切换大类时清空旧细项
      setSpecialCategoryId(catId);
      setSpecialDetails([]);
      setTimeout(() => setStep(5), AUTO_ADVANCE_DELAY);
    };

    const handleSkipSpecial = () => {
      setSpecialCategoryId(null);
      setSpecialDetails([]);
      goToConfirm();
    };

    // —— 步骤 5：选特殊情况细项（多选 → 完成 → 确认） ——
    const handleToggleSpecialDetail = (option: string) => {
      setSpecialDetails((prev) =>
        prev.includes(option)
          ? prev.filter((o) => o !== option)
          : [...prev, option],
      );
    };

    // —— 进入确认页 ——
    const goToConfirm = () => {
      onFinishRecord(answers);
      setPhase("toast");
      setTimeout(() => setPhase("done"), 1300);
    };

    const handleCompleteFromDetails = () => {
      goToConfirm();
    };

    // —— 摘要数据 ——
    const now = new Date();
    const timeStr = `今天 ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const feelingDisplay = feeling ?? (feelingCustom.trim() || null);
    const reasonDisplay = [
      ...reasons,
      ...(reasonCustom.trim() ? [reasonCustom.trim()] : []),
    ];

    // —— 通用 chip 样式 ——
    const chipClass = (selected: boolean) =>
      `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[14px] font-medium transition-all active:scale-[0.97] ${
        selected
          ? "border-[rgba(177,194,113,0.85)] bg-[rgba(177,194,113,0.18)] text-[#2C3B27]"
          : "border-[rgba(177,194,113,0.45)] bg-white text-[#2C3B27] hover:border-[rgba(177,194,113,0.7)]"
      }`;

    // ===================== 渲染：安全流程 =====================
    if (phase === "safety") {
      return (
        <div className="flex h-full flex-col bg-white">
          <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
            <button
              onClick={() => setPhase("form")}
              className="mb-4 flex items-center gap-1 text-[14px] text-ink-faint transition-colors hover:text-ink"
            >
              <ChevronLeft className="h-4 w-4" />
              返回
            </button>
            <div className="mt-8">
              <h2 className="text-[20px] font-semibold leading-relaxed tracking-tight text-ink">
                这些感受很重要
              </h2>
              <p className="mt-4 text-[15px] leading-[1.8] text-ink-soft">
                你愿意说出来，已经很不容易了。
                <br />
                <br />
                如果你正在经历很难承受的时刻，可以联系你信任的大人、家长、医生，或者拨打心理援助热线。
              </p>
              <div className="mt-6 rounded-2xl border border-line bg-line-soft/40 px-5 py-4">
                <p className="text-[13px] font-medium text-ink-faint">
                  心理援助热线（24 小时）
                </p>
                <p className="mt-1 text-[18px] font-semibold tracking-tight text-ink">
                  400-161-9995
                </p>
                <p className="mt-3 text-[13px] font-medium text-ink-faint">
                  全国青少年心理咨询热线
                </p>
                <p className="mt-1 text-[18px] font-semibold tracking-tight text-ink">
                  12355
                </p>
              </div>
              <p className="mt-6 text-[13px] leading-relaxed text-ink-faint">
                这条信息不会作为情绪标签保存。你随时可以回来继续记录。
              </p>
            </div>
          </div>
          <div className="bg-white px-5 pb-6 pt-3">
            <button
              onClick={() => setPhase("form")}
              className="w-full rounded-xl bg-action-primary px-4 py-3 text-[14px] font-medium text-action-primary-text transition-opacity hover:opacity-90"
            >
              我知道了
            </button>
          </div>
        </div>
      );
    }

    // ===================== 渲染：Toast / Done =====================
    if (phase === "toast" || phase === "done") {
      return (
        <div className="no-scrollbar relative flex h-full flex-col overflow-y-auto bg-white px-5">
          <h2 className="pt-4 text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
            这条记录已经完整了
          </h2>

          <div className="mt-4 rounded-2xl border border-line bg-white px-5 py-4">
            <div className="text-[11px] uppercase tracking-[0.16em] text-ink-faint">
              已记录
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              {primaryMood && (
                <div className="flex items-center gap-2 text-[13px] leading-relaxed">
                  <span className="shrink-0 text-ink-faint">情绪：</span>
                  <span className="flex items-center gap-1.5 text-ink">
                    <MoonPhaseIcon
                      level={primaryMood.score as 1 | 2 | 3 | 4 | 5}
                      size={14}
                    />
                    {primaryMood.label}（{primaryMood.score}）
                  </span>
                </div>
              )}
              {feelingDisplay && (
                <div className="flex gap-2 text-[13px] leading-relaxed">
                  <span className="shrink-0 text-ink-faint">感受：</span>
                  <span className="text-ink">{feelingDisplay}</span>
                </div>
              )}
              {reasonDisplay.length > 0 && (
                <div className="flex gap-2 text-[13px] leading-relaxed">
                  <span className="shrink-0 text-ink-faint">原因：</span>
                  <span className="text-ink">{reasonDisplay.join("、")}</span>
                </div>
              )}
              {selectedCategory && (
                <div className="flex gap-2 text-[13px] leading-relaxed">
                  <span className="shrink-0 text-ink-faint">特殊情况：</span>
                  <span className="text-ink">
                    {selectedCategory.entry}
                    {specialDetails.length > 0 &&
                      `：${specialDetails.join("、")}`}
                  </span>
                </div>
              )}
              <div className="flex gap-2 text-[13px] leading-relaxed">
                <span className="shrink-0 text-ink-faint">时间：</span>
                <span className="text-ink">{timeStr}</span>
              </div>
            </div>
          </div>

          <div className="mt-auto pb-6 pt-4">
            {phase === "done" && (
              <button
                onClick={onAbort}
                className="w-full rounded-xl bg-action-primary px-4 py-3 text-[14px] font-medium text-action-primary-text transition-opacity hover:opacity-90"
              >
                回到记一下
              </button>
            )}
          </div>

          <AnimatePresence>
            {phase === "toast" && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.25, ease }}
                className="absolute left-1/2 top-3 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border border-[rgba(177,194,113,0.4)] bg-[#EEF2E4] px-4 py-2 text-[14px] font-semibold tracking-tight text-[#2C3B27] shadow-[0_6px_16px_rgba(44,59,39,0.12)]"
              >
                记录收好了 · +{FULL_RECORD_ENERGY_REWARD} 能量
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // ===================== 渲染：分步表单 =====================
    return (
      <div className="flex h-full flex-col bg-white">
        <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22, ease }}
            >
              {/* —— Step 1：情绪状态（卡片单选，自动进入） —— */}
              {step === 1 && (
                <div className="pt-4">
                  <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                    现在的情绪状态大概在哪儿？
                  </p>
                  <div className="mt-6 flex flex-col gap-2.5">
                    {primaryMoods.map((mood) => {
                      const selected = primaryMood?.label === mood.label;
                      return (
                        <button
                          key={mood.label}
                          onClick={() => handleSelectPrimary(mood)}
                          className={`flex h-14 items-center gap-3 rounded-2xl border px-5 text-left transition-all active:scale-[0.99] ${
                            selected
                              ? "border-[rgba(177,194,113,0.5)] bg-[rgba(177,194,113,0.08)] text-[#2C3B27]"
                              : "border-line bg-white text-ink hover:border-ink-faint"
                          }`}
                        >
                          <MoonPhaseIcon
                            level={mood.score as 1 | 2 | 3 | 4 | 5}
                            size={18}
                          />
                          <span className="flex-1 text-[15px] font-medium tracking-tight">
                            {mood.label}
                          </span>
                          {selected && (
                            <Check
                              className="h-4 w-4 text-[#2C3B27]"
                              strokeWidth={2.4}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* —— Step 2：更接近的感受（胶囊单选，自动进入） —— */}
              {step === 2 && primaryMood && (
                <div className="pt-4">
                  <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                    &ldquo;{primaryMood.label}&rdquo;更接近哪种感觉？
                  </p>
                  {!feelingInputMode ? (
                    <>
                      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                        {feelingOptions.map((word) => (
                          <button
                            key={word}
                            onClick={() => handleSelectFeeling(word)}
                            className={chipClass(feeling === word)}
                          >
                            {word}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setFeelingInputMode(true)}
                        className="mt-5 w-full text-center text-[13px] text-ink-faint transition-colors hover:text-ink-soft"
                      >
                        没有合适的？自己写一句
                      </button>
                    </>
                  ) : (
                    <div className="mt-6">
                      <input
                        type="text"
                        value={feelingCustom}
                        onChange={(e) => setFeelingCustom(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleFeelingCustomConfirm();
                        }}
                        autoFocus
                        placeholder="写一句你的感受..."
                        className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] text-ink placeholder:text-ink-faint focus:border-[rgba(177,194,113,0.6)] focus:outline-none"
                      />
                      <div className="mt-3 flex justify-center gap-3">
                        <button
                          onClick={() => {
                            setFeelingInputMode(false);
                            setFeelingCustom("");
                          }}
                          className="text-[13px] text-ink-faint transition-colors hover:text-ink"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleFeelingCustomConfirm}
                          disabled={!feelingCustom.trim()}
                          className={`text-[13px] font-medium transition-opacity ${
                            feelingCustom.trim()
                              ? "text-[#2C3B27]"
                              : "text-ink-faint opacity-50"
                          }`}
                        >
                          确定
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* —— Step 3：可能相关原因（胶囊多选，底部按钮） —— */}
              {step === 3 && (
                <div className="pt-4">
                  <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                    可能和哪些有关？
                  </p>
                  {!reasonInputMode ? (
                    <>
                      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                        {reasonOptions.map((reason) => (
                          <button
                            key={reason}
                            onClick={() => handleToggleReason(reason)}
                            className={chipClass(reasons.includes(reason))}
                          >
                            {reasons.includes(reason) && (
                              <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                            )}
                            {reason}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setReasonInputMode(true)}
                        className="mt-5 w-full text-center text-[13px] text-ink-faint transition-colors hover:text-ink-soft"
                      >
                        没有合适的？自己写一句
                      </button>
                    </>
                  ) : (
                    <div className="mt-6">
                      <input
                        type="text"
                        value={reasonCustom}
                        onChange={(e) => setReasonCustom(e.target.value)}
                        autoFocus
                        placeholder="写一个原因..."
                        className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] text-ink placeholder:text-ink-faint focus:border-[rgba(177,194,113,0.6)] focus:outline-none"
                      />
                      <div className="mt-3 flex justify-center gap-3">
                        <button
                          onClick={() => {
                            setReasonInputMode(false);
                            setReasonCustom("");
                          }}
                          className="text-[13px] text-ink-faint transition-colors hover:text-ink"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => setReasonInputMode(false)}
                          disabled={!reasonCustom.trim()}
                          className={`text-[13px] font-medium transition-opacity ${
                            reasonCustom.trim()
                              ? "text-[#2C3B27]"
                              : "text-ink-faint opacity-50"
                          }`}
                        >
                          确定
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* —— Step 4：特殊情况大类（卡片单选 → 细项页 / 暂不补充 → 确认） —— */}
              {step === 4 && (
                <div className="pt-4">
                  <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                    还有没有这些情况？
                  </p>
                  <p className="mt-2 text-center text-[12px] text-ink-faint">
                    可以不选
                  </p>
                  <div className="mt-6 flex flex-col gap-2">
                    {specialSituationCategories.map((cat) => {
                      const isSafety = cat.isSafetyFlow;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleSelectSpecialCategory(cat.id)}
                          className={`flex h-12 items-center justify-between rounded-xl border px-4 text-left transition-all active:scale-[0.99] ${
                            isSafety
                              ? "border-[rgba(200,120,100,0.3)] bg-[rgba(200,120,100,0.05)] text-ink-soft hover:border-[rgba(200,120,100,0.5)]"
                              : "border-line bg-white text-ink hover:border-ink-faint"
                          }`}
                        >
                          <span className="text-[14px] font-medium">
                            {cat.entry}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* —— Step 5：特殊情况细项（胶囊多选，底部"完成"） —— */}
              {step === 5 && selectedCategory && (
                <div className="pt-4">
                  <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                    关于&ldquo;{selectedCategory.entry}&rdquo;，更接近哪些情况？
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                    {selectedCategory.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleToggleSpecialDetail(option)}
                        className={chipClass(
                          specialDetails.includes(option),
                        )}
                      >
                        {specialDetails.includes(option) && (
                          <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                        )}
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 底部按钮：仅多选页显示 */}
        <div className="bg-white px-5 pb-6 pt-3">
          {step === 3 && (
            <button
              onClick={() => setStep(4)}
              disabled={!canProceedReasons}
              className={`w-full rounded-xl px-4 py-3 text-[14px] font-medium transition-opacity ${
                canProceedReasons
                  ? "bg-action-primary text-action-primary-text hover:opacity-90"
                  : "bg-line-soft text-ink-faint"
              }`}
            >
              下一步
            </button>
          )}
          {step === 4 && (
            <button
              onClick={handleSkipSpecial}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] font-medium text-ink-soft transition-colors hover:border-ink-faint"
            >
              暂不补充
            </button>
          )}
          {step === 5 && (
            <button
              onClick={handleCompleteFromDetails}
              className="w-full rounded-xl bg-action-primary px-4 py-3 text-[14px] font-medium text-action-primary-text transition-opacity hover:opacity-90"
            >
              完成
            </button>
          )}
        </div>
      </div>
    );
  },
);

export default MoodRecordWizard;
