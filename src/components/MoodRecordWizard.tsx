import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ChevronLeft } from "lucide-react";
import VoiceInputBar from "./VoiceInputBar";
import { MoonPhaseIcon } from "./MoonPhaseIcon";
import { FULL_RECORD_ENERGY_REWARD } from "@/data/userProfile";
import {
  primaryMoods,
  specialSituationCategories,
  getSecondaryGroupsForPolarity,
  findGroupByWord,
  type PrimaryMood,
} from "@/data/moodOptions";
import type { Answers, RecordType } from "@/data/record";

const ease = [0.22, 1, 0.36, 1] as const;

type Step = 1 | 2 | 3 | 4 | 5;
type Phase = "form" | "toast" | "done" | "safety";

/* 选项超过阈值时折叠，默认展示前 VISIBLE 个，剩余放入「更多」 */
const COLLAPSE_THRESHOLD = 12;
const COLLAPSE_VISIBLE = 10;

export interface MoodRecordWizardHandle {
  /** 尝试内部返回（上一步 / 退出安全流程）。返回 true 表示已处理，父级不再拦截。 */
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
    // —— 内部状态 ——
    const [step, setStep] = useState<Step>(1);
    const [primaryMood, setPrimaryMood] = useState<PrimaryMood | null>(null);
    const [secondaryMood, setSecondaryMood] = useState<string | null>(null);
    const [tertiarySelected, setTertiarySelected] = useState<string[]>([]);
    const [specialSelected, setSpecialSelected] = useState<
      Record<string, string[]>
    >({});
    const [expandedSpecialId, setExpandedSpecialId] = useState<string | null>(
      null,
    );
    const [note, setNote] = useState("");
    const [phase, setPhase] = useState<Phase>("form");

    // "更多" 展开状态（每步独立，进入新步时重置）
    const [showAllSecondary, setShowAllSecondary] = useState(false);
    const [showAllTertiary, setShowAllTertiary] = useState(false);

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

    // —— 派生数据 ——
    const secondaryGroup = secondaryMood
      ? findGroupByWord(secondaryMood)
      : null;
    const availableGroups = primaryMood
      ? getSecondaryGroupsForPolarity(primaryMood.polarity)
      : [];
    const allSecondaryWords = availableGroups.flatMap((g) => g.words);
    const tertiaryPrompt = secondaryGroup?.tertiaryPrompt ?? null;
    const tertiaryOptions = secondaryGroup?.tertiaryOptions ?? [];

    const secondaryNeedsCollapse =
      allSecondaryWords.length > COLLAPSE_THRESHOLD;
    const visibleSecondaryWords = showAllSecondary
      ? allSecondaryWords
      : allSecondaryWords.slice(0, COLLAPSE_VISIBLE);
    const hiddenSecondaryCount =
      allSecondaryWords.length - COLLAPSE_VISIBLE;

    const tertiaryNeedsCollapse = tertiaryOptions.length > COLLAPSE_THRESHOLD;
    const visibleTertiaryOptions = showAllTertiary
      ? tertiaryOptions
      : tertiaryOptions.slice(0, COLLAPSE_VISIBLE);
    const hiddenTertiaryCount = tertiaryOptions.length - COLLAPSE_VISIBLE;

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
      if (secondaryMood && secondaryGroup) {
        newAnswers.secondaryMood = {
          type: "option",
          value: secondaryGroup.id,
          label: secondaryMood,
        };
      }
      if (tertiarySelected.length > 0) {
        newAnswers.tertiaryCause = {
          type: "option",
          value: tertiarySelected.join("|"),
          label: tertiarySelected.join("、"),
        };
      }
      Object.entries(specialSelected).forEach(([catId, opts]) => {
        if (opts.length > 0) {
          const cat = specialSituationCategories.find((c) => c.id === catId);
          if (cat) {
            newAnswers[`special_${catId}`] = {
              type: "option",
              value: opts.join("|"),
              label: `${cat.entry}：${opts.join("、")}`,
            };
          }
        }
      });
      if (note.trim()) {
        newAnswers.note = { type: "custom", value: note };
      }
      setAnswers(newAnswers);
    }, [
      primaryMood,
      secondaryMood,
      secondaryGroup,
      tertiarySelected,
      specialSelected,
      note,
      setAnswers,
    ]);

    // —— 选择处理（含状态重置） ——

    // 切换一级：清空二级 + 三级（不清空特殊情况、备注）
    const handleSelectPrimary = (mood: PrimaryMood) => {
      if (primaryMood?.label === mood.label) {
        setPrimaryMood(null);
        return;
      }
      setPrimaryMood(mood);
      setSecondaryMood(null);
      setTertiarySelected([]);
      setShowAllSecondary(false);
      setShowAllTertiary(false);
    };

    // 切换二级：清空三级（不清空特殊情况、备注）
    const handleSelectSecondary = (word: string) => {
      if (secondaryMood === word) {
        setSecondaryMood(null);
        return;
      }
      setSecondaryMood(word);
      setTertiarySelected([]);
      setShowAllTertiary(false);
    };

    const handleToggleTertiary = (option: string) => {
      setTertiarySelected((prev) =>
        prev.includes(option)
          ? prev.filter((o) => o !== option)
          : [...prev, option],
      );
    };

    const handleToggleSpecialOption = (catId: string, option: string) => {
      setSpecialSelected((prev) => {
        const current = prev[catId] ?? [];
        const next = current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option];
        return { ...prev, [catId]: next };
      });
    };

    const handleSpecialCategoryClick = (catId: string) => {
      setExpandedSpecialId(expandedSpecialId === catId ? null : catId);
    };

    const handleSelfHarmClick = () => {
      setPhase("safety");
    };

    // —— 步骤导航（底部按钮） ——
    const canProceed = (() => {
      if (step === 1) return primaryMood !== null;
      if (step === 2) return secondaryMood !== null;
      if (step === 3) return tertiarySelected.length > 0;
      return true; // step 4、5 可跳过
    })();

    const buttonLabel = (() => {
      if (step === 5) return "完成";
      if (step === 4) {
        const hasSpecial = Object.values(specialSelected).some(
          (o) => o.length > 0,
        );
        return hasSpecial ? "下一步" : "跳过";
      }
      return "下一步";
    })();

    const handleNext = () => {
      if (!canProceed && step <= 3) return;
      if (step === 5) {
        // 完成：保存 + 进入 toast
        onFinishRecord(answers);
        setPhase("toast");
        setTimeout(() => setPhase("done"), 1300);
        return;
      }
      setStep((step + 1) as Step);
      if (step + 1 === 2) setShowAllSecondary(false);
      if (step + 1 === 3) setShowAllTertiary(false);
    };

    // —— 摘要数据（Toast / Done 页用） ——
    const specialEntries = Object.entries(specialSelected)
      .filter(([, opts]) => opts.length > 0)
      .map(([catId, opts]) => {
        const cat = specialSituationCategories.find((c) => c.id === catId);
        return cat ? { entry: cat.entry, selectedOptions: opts } : null;
      })
      .filter(
        (x): x is { entry: string; selectedOptions: string[] } => x !== null,
      );

    const now = new Date();
    const timeStr = `今天 ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

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

          {/* 摘要卡 */}
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
              {secondaryMood && (
                <div className="flex gap-2 text-[13px] leading-relaxed">
                  <span className="shrink-0 text-ink-faint">更接近：</span>
                  <span className="text-ink">{secondaryMood}</span>
                </div>
              )}
              {tertiarySelected.length > 0 && (
                <div className="flex gap-2 text-[13px] leading-relaxed">
                  <span className="shrink-0 text-ink-faint">原因：</span>
                  <span className="text-ink">
                    {tertiarySelected.join("、")}
                  </span>
                </div>
              )}
              {specialEntries.map((entry) => (
                <div
                  key={entry.entry}
                  className="flex gap-2 text-[13px] leading-relaxed"
                >
                  <span className="shrink-0 text-ink-faint">特殊情况：</span>
                  <span className="text-ink">
                    {entry.entry}：{entry.selectedOptions.join("、")}
                  </span>
                </div>
              ))}
              {note.trim() && (
                <div className="flex gap-2 text-[13px] leading-relaxed">
                  <span className="shrink-0 text-ink-faint">备注：</span>
                  <span className="text-ink">{note.trim()}</span>
                </div>
              )}
              <div className="flex gap-2 text-[13px] leading-relaxed">
                <span className="shrink-0 text-ink-faint">时间：</span>
                <span className="text-ink">{timeStr}</span>
              </div>
            </div>
          </div>

          {/* 底部按钮区 */}
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

          {/* 能量 Toast */}
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
              {/* —— Step 1：一级情绪 —— */}
              {step === 1 && (
                <div className="pt-4">
                  <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                    今天整体怎么样？
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

              {/* —— Step 2：二级情绪 —— */}
              {step === 2 && primaryMood && (
                <div className="pt-4">
                  <div className="mb-5 flex items-center justify-center gap-1.5 text-[12px] text-ink-faint">
                    <MoonPhaseIcon
                      level={primaryMood.score as 1 | 2 | 3 | 4 | 5}
                      size={12}
                    />
                    <span>已选：{primaryMood.label}</span>
                  </div>
                  <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                    更接近哪种感觉？
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                    {visibleSecondaryWords.map((word) => (
                      <button
                        key={word}
                        onClick={() => handleSelectSecondary(word)}
                        className={chipClass(secondaryMood === word)}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                  {secondaryNeedsCollapse && !showAllSecondary && (
                    <button
                      onClick={() => setShowAllSecondary(true)}
                      className="mt-4 w-full rounded-xl border border-dashed border-line bg-line-soft/30 px-4 py-2.5 text-[13px] text-ink-faint transition-colors hover:border-ink-faint hover:text-ink-soft"
                    >
                      更多（{hiddenSecondaryCount}）
                    </button>
                  )}
                </div>
              )}

              {/* —— Step 3：三级原因 —— */}
              {step === 3 && tertiaryPrompt && (
                <div className="pt-4">
                  {secondaryMood && (
                    <div className="mb-5 text-center text-[12px] text-ink-faint">
                      已选：{secondaryMood}
                    </div>
                  )}
                  <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                    {tertiaryPrompt}
                  </p>
                  <p className="mt-2 text-center text-[12px] text-ink-faint">
                    可以多选
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                    {visibleTertiaryOptions.map((option) => {
                      const selected = tertiarySelected.includes(option);
                      return (
                        <button
                          key={option}
                          onClick={() => handleToggleTertiary(option)}
                          className={chipClass(selected)}
                        >
                          {selected && (
                            <Check
                              className="h-3.5 w-3.5"
                              strokeWidth={2.4}
                            />
                          )}
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {tertiaryNeedsCollapse && !showAllTertiary && (
                    <button
                      onClick={() => setShowAllTertiary(true)}
                      className="mt-4 w-full rounded-xl border border-dashed border-line bg-line-soft/30 px-4 py-2.5 text-[13px] text-ink-faint transition-colors hover:border-ink-faint hover:text-ink-soft"
                    >
                      更多（{hiddenTertiaryCount}）
                    </button>
                  )}
                </div>
              )}

              {/* —— Step 4：特殊情况（大类 → 展开具体表现） —— */}
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
                      // 自伤/危险想法 → 独立安全流程
                      if (cat.isSafetyFlow) {
                        return (
                          <button
                            key={cat.id}
                            onClick={handleSelfHarmClick}
                            className="flex items-center justify-between rounded-xl border border-[rgba(200,120,100,0.3)] bg-[rgba(200,120,100,0.05)] px-4 py-3 text-left transition-colors hover:border-[rgba(200,120,100,0.5)]"
                          >
                            <span className="text-[14px] font-medium text-ink-soft">
                              {cat.entry}
                            </span>
                            <ChevronDown className="h-4 w-4 text-ink-faint" />
                          </button>
                        );
                      }
                      // 普通特殊情况大类 → 展开/收起具体表现
                      const isExpanded = expandedSpecialId === cat.id;
                      const selectedOpts = specialSelected[cat.id] ?? [];
                      return (
                        <div
                          key={cat.id}
                          className="overflow-hidden rounded-xl border border-line bg-white"
                        >
                          <button
                            onClick={() =>
                              handleSpecialCategoryClick(cat.id)
                            }
                            className="flex w-full items-center justify-between px-4 py-3 text-left"
                          >
                            <span className="text-[14px] font-medium text-ink-soft">
                              {cat.entry}
                              {selectedOpts.length > 0 && (
                                <span className="ml-2 text-[12px] text-[#2C3B27]">
                                  已选 {selectedOpts.length}
                                </span>
                              )}
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 text-ink-faint transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease }}
                                className="overflow-hidden"
                              >
                                <div className="flex flex-wrap gap-2 px-4 pb-4">
                                  {cat.options.map((option) => {
                                    const selected = selectedOpts.includes(
                                      option,
                                    );
                                    return (
                                      <button
                                        key={option}
                                        onClick={() =>
                                          handleToggleSpecialOption(
                                            cat.id,
                                            option,
                                          )
                                        }
                                        className={chipClass(selected)}
                                      >
                                        {selected && (
                                          <Check
                                            className="h-3.5 w-3.5"
                                            strokeWidth={2.4}
                                          />
                                        )}
                                        {option}
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* —— Step 5：备注 —— */}
              {step === 5 && (
                <div className="pt-4">
                  <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                    想补一句吗？
                  </p>
                  <p className="mt-2 text-center text-[12px] text-ink-faint">
                    可以跳过
                  </p>
                  <div className="mt-6">
                    <VoiceInputBar
                      value={note}
                      onChange={setNote}
                      onSend={() => {}}
                      canSend={false}
                      showSendButton={false}
                      placeholder="想写点什么吗..."
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 底部按钮：所有步骤都有 */}
        <div className="bg-white px-5 pb-6 pt-3">
          <button
            onClick={handleNext}
            disabled={!canProceed && step <= 3}
            className={`w-full rounded-xl px-4 py-3 text-[14px] font-medium transition-opacity ${
              canProceed || step > 3
                ? "bg-action-primary text-action-primary-text hover:opacity-90"
                : "bg-line-soft text-ink-faint"
            }`}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    );
  },
);

export default MoodRecordWizard;
