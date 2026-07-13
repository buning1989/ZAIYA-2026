import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { MoonPhaseIcon } from "./MoonPhaseIcon";
import RecordNoteSection from "./RecordNoteSection";
import RecordSummaryCard, { type SummaryRow } from "./RecordSummaryCard";
import {
  primaryMoods,
  specialSituationCategories,
  getSecondaryGroupsForPolarity,
  getTertiaryPromptBySelectedSecondaryWords,
  getTertiaryPoolBySelectedSecondaryWords,
  type PrimaryMood,
} from "@/data/moodOptions";
import {
  crisisHotlines,
  mockEmergencyContacts,
  SAFETY_DIALOG_STARTER,
} from "@/data/crisisResources";
import type { Answers, RecordType } from "@/data/record";

const ease = [0.22, 1, 0.36, 1] as const;
const TOTAL_STEPS = 5;
const AUTO_ADVANCE_MS = 250;
// 选中反馈停留时间：选中后明显停留再自动前进，避免"刚选中就滑走"
const SELECTION_FEEDBACK_MS = 800;
// 选中态高亮动画节奏（比普通切换更慢，让反馈更可感知）
const SELECTION_BOUNCE_MS = 480;

type Step = 1 | 2 | 3 | 4 | 5;
// toast 不再是独立 phase，仅作为 confirm 页内的浮层状态
type Phase = "form" | "confirm" | "safety";
type CarouselDirection = -1 | 0 | 1;

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
  /** 安全承接页：点击「去跟 ZAIYA 聊一聊」时回调，退出记录流程并打开 ZAIYA 对话 */
  onOpenZaiyaDialog?: (starterText: string) => void;
}

type ChoiceCarouselItem = {
  id: string;
  label: string;
  selected?: boolean;
};

interface ChoiceCarouselProps {
  items: ChoiceCarouselItem[];
  activeIndex: number;
  direction: CarouselDirection;
  selectedFeedbackId?: string | null;
  onCardClick: (index: number) => void;
  onNavigate: (index: number, direction: CarouselDirection) => void;
}

const wrapIndex = (index: number, total: number) => {
  if (total <= 0) return 0;
  return ((index % total) + total) % total;
};

const getVisibleDotIndexes = (total: number, activeIndex: number) => {
  const maxDots = 7;
  const halfWindow = Math.floor(maxDots / 2);
  let start = Math.max(0, activeIndex - halfWindow);
  const end = Math.min(total, start + maxDots);

  if (end - start < maxDots) {
    start = Math.max(0, end - maxDots);
  }

  return Array.from({ length: end - start }, (_, index) => start + index);
};

function CarouselDots({
  total,
  activeIndex,
}: {
  total: number;
  activeIndex: number;
}) {
  if (total <= 1) return null;

  return (
    <div className="mt-3 flex justify-center gap-1.5">
      {getVisibleDotIndexes(total, activeIndex).map((index) => {
        const active = index === activeIndex;
        return (
          <span
            key={index}
            className={`rounded-full transition-all duration-200 ${
              active
                ? "h-1.5 w-5 bg-ink"
                : "h-1.5 w-1.5 bg-ink/[0.28]"
            }`}
          />
        );
      })}
    </div>
  );
}

function ChoiceCarousel({
  items,
  activeIndex,
  direction,
  selectedFeedbackId,
  onCardClick,
  onNavigate,
}: ChoiceCarouselProps) {
  const visibleOffsets =
    items.length <= 1
      ? [0]
      : items.length === 2
        ? [0, direction < 0 ? -1 : 1]
        : [-1, 0, 1];

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onNavigate(wrapIndex(activeIndex - 1, items.length), -1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      onNavigate(wrapIndex(activeIndex + 1, items.length), 1);
    }
  };

  return (
    <div
      className="relative outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="卡片选择"
    >
      <div
        data-choice-carousel
        className="relative h-40 overflow-hidden py-2"
      >
        <AnimatePresence initial={false} custom={direction}>
          {visibleOffsets.map((offset) => {
            const index = wrapIndex(activeIndex + offset, items.length);
            const item = items[index];
            if (!item) return null;

            const active = offset === 0;
            const selected = Boolean(item.selected);
            const selectedFeedback = selectedFeedbackId === item.id;
            // 侧边卡只露边缘、不展示文字：scale 略小，整体弱化但不靠透明度解决层叠
            const scale = active ? 1 : 0.9;
            // 侧边卡保持实色（不透明），文字单独隐藏，避免穿透当前卡
            const opacity = active ? 1 : 0.55;
            // 位移加大，让侧边卡只露 20-30% 边缘，不压到当前卡文字区
            const translateX = offset * 150;
            const targetX = `calc(-50% + ${translateX}px)`;
            const enterX = `calc(-50% + ${direction >= 0 ? 300 : -300}px)`;
            const exitX = `calc(-50% + ${direction >= 0 ? -300 : 300}px)`;

            return (
              <motion.button
                key={item.id}
                type="button"
                data-carousel-card
                data-carousel-index={index}
                onClick={() => onCardClick(index)}
                className={`absolute left-1/2 top-1/2 flex min-h-[118px] w-[72%] items-center justify-center rounded-2xl border px-5 py-6 text-center shadow-sm outline-none transition-[border-color,background-color,box-shadow] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary/50 focus-visible:ring-offset-0 active:scale-[0.97] ${
                  selectedFeedback && active
                    ? "border-action-primary bg-action-soft shadow-[0_12px_26px_rgba(44,59,39,0.12)]"
                    : selected
                      ? "border-action-primary/80 bg-action-soft shadow-[0_10px_22px_rgba(44,59,39,0.08)]"
                      : active
                        ? "border-action-primary/40 bg-card shadow-[0_10px_22px_rgba(44,59,39,0.07)]"
                        : "border-line bg-card"
                }`}
                initial={{
                  opacity: 0,
                  x: enterX,
                  y: "-50%",
                  scale: 0.84,
                  zIndex: 0,
                }}
                animate={{
                  opacity,
                  x: targetX,
                  y: "-50%",
                  scale: selectedFeedback && active ? [1, 1.04, 1] : scale,
                  zIndex: active ? 3 : 1,
                }}
                exit={{
                  opacity: 0,
                  x: exitX,
                  y: "-50%",
                  scale: 0.84,
                  zIndex: 0,
                }}
                transition={{
                  // 选中反馈用更慢的高亮节奏；普通切换保持轻快
                  duration: selectedFeedback && active ? SELECTION_BOUNCE_MS / 1000 : 0.28,
                  ease,
                }}
              >
                {/* 当前卡：完整文字；侧边卡：不渲染文字，避免层叠穿透 */}
                {active && (
                  <span className="line-clamp-2 text-[15px] font-medium leading-relaxed tracking-tight text-ink">
                    {item.label}
                  </span>
                )}
                {active && selected && (
                  <motion.span
                    initial={
                      selectedFeedback ? { scale: 0.5, opacity: 0 } : false
                    }
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.22, ease }}
                    className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-action-soft text-ink"
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
      <CarouselDots total={items.length} activeIndex={activeIndex} />
    </div>
  );
}

export default function MoodRecordWizard({
  answers,
  setAnswers,
  onFinishRecord,
  onAbort,
  onProgressChange,
  onOpenZaiyaDialog,
}: Props) {
  // —— 核心状态机 ——
  const [step, setStep] = useState<Step>(1);
  const [phase, setPhase] = useState<Phase>("form");
  // 修改模式：从确认页进入某一步修改，完成后直接回确认页
  const [editMode, setEditMode] = useState(false);

  // —— 各步答案 ——
  const [primaryMood, setPrimaryMood] = useState<PrimaryMood | null>(null);
  const [feelings, setFeelings] = useState<string[]>([]);
  const [reasons, setReasons] = useState<string[]>([]);
  const [specialCategoryId, setSpecialCategoryId] = useState<string | null>(
    null,
  );
  const [specialDetails, setSpecialDetails] = useState<string[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [carouselDirection, setCarouselDirection] =
    useState<CarouselDirection>(0);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(
    null,
  );
  const [note, setNote] = useState("");

  // 安全承接页：当前展开的行动出口（contacts=紧急联系人 / hotlines=热线 / null=未展开）
  const [safetyExpanded, setSafetyExpanded] = useState<
    "contacts" | "hotlines" | null
  >(null);

  // 确认页"完成记录"后的原地保存态：保存后不再跳 done 页，仅切换按钮 + 盖章
  const [isSaved, setIsSaved] = useState(false);

  // —— 误触处理：自动跳转计时器 ref ——
  const autoAdvanceTimer = useRef<number | null>(null);
  const selectionFeedbackTimer = useRef<number | null>(null);

  // 清理计时器
  const clearAutoAdvance = () => {
    if (autoAdvanceTimer.current !== null) {
      window.clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  };

  const clearSelectionFeedbackTimer = () => {
    if (selectionFeedbackTimer.current !== null) {
      window.clearTimeout(selectionFeedbackTimer.current);
      selectionFeedbackTimer.current = null;
    }
  };

  // 组件卸载时清理
  useEffect(
    () => () => {
      clearAutoAdvance();
      clearSelectionFeedbackTimer();
    },
    [],
  );

  // —— 派生数据 ——
  // Step 2：按一级情绪 polarity 取二级分组，再展平为词列表
  //   negative → 4 组 / neutral → 1 组 / positive → 2 组
  const feelingGroups = primaryMood
    ? getSecondaryGroupsForPolarity(primaryMood.polarity)
    : [];
  const feelingOptions = feelingGroups.flatMap((g) => g.words);
  // Step 3：根据已选二级词生成三级题干 + 统一选项池
  //   - 仅负向：返回负向统一池（4 个小标题分组）
  //   - 仅正向：返回正向统一池（平铺）
  //   - 混选：负向池在前 + 正向池在后，「说不上来」全局只保留一个
  const tertiaryPrompt = getTertiaryPromptBySelectedSecondaryWords(feelings);
  const tertiaryPool = getTertiaryPoolBySelectedSecondaryWords(feelings);
  const specialCategory = specialCategoryId
    ? specialSituationCategories.find((c) => c.id === specialCategoryId) ??
      null
    : null;
  const hasAnyReason = reasons.length > 0;
  const feelingLabel = feelings.length > 0 ? feelings.join("、") : null;

  // Step 4/5：循环卡片轮播相关
  const totalCards = specialCategory?.options.length ?? 0;
  const activeCarouselCount =
    step === 4 ? specialSituationCategories.length : totalCards;

  // —— 进度上报 ——
  useEffect(() => {
    onProgressChange({
      hasCompletedFirstStep: step >= 2,
      isFullRecordReady: phase === "confirm",
      isSafetyPhase: phase === "safety",
    });
  }, [step, phase, onProgressChange]);

  const inferCarouselDirection = (index: number): CarouselDirection => {
    if (activeCarouselCount <= 1) return 0;
    const targetIndex = wrapIndex(index, activeCarouselCount);
    if (targetIndex === wrapIndex(cardIndex - 1, activeCarouselCount)) {
      return -1;
    }
    if (targetIndex === wrapIndex(cardIndex + 1, activeCarouselCount)) {
      return 1;
    }
    return targetIndex > cardIndex ? 1 : -1;
  };

  const navigateCarousel = (index: number, direction?: CarouselDirection) => {
    setCarouselDirection(direction ?? inferCarouselDirection(index));
    setCardIndex(wrapIndex(index, activeCarouselCount));
  };

  // Step 4/5 进入时重置卡片索引
  useEffect(() => {
    if (step === 4 || (step === 5 && specialCategory)) {
      setCardIndex(0);
      setCarouselDirection(0);
      setSelectedFeedbackId(null);
      clearSelectionFeedbackTimer();
    }
  }, [step, specialCategory]);

  const isCurrentCarouselIndex = (index: number) => {
    return index === cardIndex;
  };

  useEffect(() => {
    if (phase !== "form" || (step !== 4 && step !== 5)) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setCarouselDirection(-1);
        setCardIndex((current) => wrapIndex(current - 1, activeCarouselCount));
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setCarouselDirection(1);
        setCardIndex((current) => wrapIndex(current + 1, activeCarouselCount));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [phase, step, activeCarouselCount]);

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
    if (feelingLabel) {
      newAnswers.feeling = {
        type: "option",
        value: feelings.join("|"),
        label: feelingLabel,
      };
    }
    if (hasAnyReason) {
      newAnswers.reasons = {
        type: "option",
        value: reasons.join("|"),
        label: reasons.join("、"),
      };
    }
    if (specialCategory) {
      newAnswers.specialCategory = {
        type: "option",
        value: specialCategory.id,
        label: specialCategory.entry,
      };
      if (specialDetails.length > 0) {
        newAnswers.specialDetails = {
          type: "option",
          value: specialDetails.join("|"),
          label: specialDetails.join("、"),
        };
      }
    }
    if (note.trim()) {
      newAnswers.note = { type: "custom", value: note.trim() };
    }
    setAnswers(newAnswers);
  }, [
    primaryMood,
    feelings,
    feelingLabel,
    reasons,
    hasAnyReason,
    specialCategory,
    specialDetails,
    note,
    setAnswers,
  ]);

  // ===================== 修改模式（保留用于分步表单内部流转） =====================
  const exitEditMode = () => {
    setEditMode(false);
    setPhase("confirm");
  };

  // ===================== 选择处理（含误触重选 + 状态重置） =====================

  // Step 1：一级情绪单选 → 250ms 选中态 → 自动进入
  // 误触处理：停留期间点击其他选项 → 更新选择 + 重新计时
  const handleSelectPrimary = (mood: PrimaryMood) => {
    clearAutoAdvance();
    const changed = primaryMood?.label !== mood.label;
    setPrimaryMood(mood);
    // 修改了上游 → 清空下游（仅在真正变化时）
    if (changed) {
      setFeelings([]);
      setReasons([]);
    }
    // 启动计时器
    autoAdvanceTimer.current = window.setTimeout(() => {
      if (editMode) {
        exitEditMode();
      } else {
        setStep(2);
      }
    }, AUTO_ADVANCE_MS);
  };

  // Step 2：二级感受多选
  const handleToggleFeeling = (word: string) => {
    setFeelings((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word],
    );
  };

  // Step 2：底部按钮 → 下一步 / 确认修改
  const handleNextFromFeelings = () => {
    if (feelings.length === 0) return;
    if (editMode) {
      exitEditMode();
    } else {
      setStep(3);
    }
  };

  // Step 3：三级原因多选
  const handleToggleReason = (option: string) => {
    setReasons((prev) =>
      prev.includes(option)
        ? prev.filter((r) => r !== option)
        : [...prev, option],
    );
  };

  // Step 3：底部按钮 → 下一步 / 确认修改
  const handleNextFromReasons = () => {
    if (!hasAnyReason) return;
    if (editMode) {
      exitEditMode();
    } else {
      setStep(4);
    }
  };

  // Step 4：特殊情况大类单选
  // - 自伤/危险想法：进入独立安全流程，不保存为普通记录
  // - 普通大类：250ms → 自动进入 Step 5 细项页
  const handleSelectSpecialCategory = (catId: string) => {
    clearAutoAdvance();
    const cat = specialSituationCategories.find((c) => c.id === catId);
    if (cat?.isSafetyFlow) {
      // 不设置 specialCategoryId，避免作为普通记录保存
      setPhase("safety");
      return;
    }
    const changed = specialCategoryId !== catId;
    setSpecialCategoryId(catId);
    if (changed) {
      setSpecialDetails([]);
    }
    // 无论普通模式还是修改模式，大类选择后都进入细项页
    autoAdvanceTimer.current = window.setTimeout(() => {
      setStep(5);
    }, AUTO_ADVANCE_MS);
  };

  // Step 4：底部"暂不补充" → 清空特殊情况 → 确认页
  const handleSkipSpecial = () => {
    setSpecialCategoryId(null);
    setSpecialDetails([]);
    if (editMode) {
      exitEditMode();
    } else {
      setPhase("confirm");
    }
  };

  // 安全承接页：去跟 ZAIYA 聊一聊
  // 退出记录流程，打开 ZAIYA 对话并预填安全承接 starter 文案
  const handleGoZaiyaDialog = () => {
    if (onOpenZaiyaDialog) {
      onOpenZaiyaDialog(SAFETY_DIALOG_STARTER);
    }
  };

  // 进入安全承接页时重置展开状态
  useEffect(() => {
    if (phase === "safety") {
      setSafetyExpanded(null);
    }
  }, [phase]);

  // Step 5：细项多选
  const handleToggleSpecialDetail = (detail: string) => {
    setSpecialDetails((prev) =>
      prev.includes(detail)
        ? prev.filter((d) => d !== detail)
        : [...prev, detail],
    );
  };

  // Step 5：底部"完成"/"确认修改" → 确认页
  const handleCompleteSpecialDetails = () => {
    if (editMode) {
      exitEditMode();
    } else {
      setPhase("confirm");
    }
  };

  // 确认页："完成记录" → 原地保存 + 发能量 + 盖章 + Toast（不再跳 done 页）
  // 幂等：已保存后再次点击直接返回，不重复发能量
  const handleCompleteRecord = () => {
    if (isSaved) {
      onAbort();
      return;
    }
    onFinishRecord(answers);
    setIsSaved(true);
  };

  // —— 摘要数据 ——
  const allReasonLabels = [...reasons];

  const timeStr = "刚刚";

  // —— 通用样式 ——
  // 多选胶囊：选中态只用填充色 + 加深边框表达，不再显示对号图标
  const chipClass = (selected: boolean) =>
    `inline-flex items-center justify-center rounded-full border px-4 py-2 text-[14px] font-medium whitespace-nowrap transition-all active:scale-[0.97] ${
      selected
        ? "border-action-primary bg-action-soft text-ink"
        : "border-line bg-white text-ink hover:border-action-primary/60"
    }`;

  // ===================== 渲染：确认页（只读展示，不提供修改/删除入口） =====================
  if (phase === "confirm") {
    const rows: SummaryRow[] = [];
    if (primaryMood) {
      rows.push({ label: "情绪", value: `${primaryMood.label}（${primaryMood.score}/5）` });
    }
    if (feelingLabel) {
      rows.push({ label: "感受", value: feelingLabel });
    }
    if (allReasonLabels.length > 0) {
      rows.push({ label: "原因", value: allReasonLabels.join("、") });
    }
    if (specialCategory) {
      rows.push({
        label: "特殊情况",
        value:
          specialCategory.entry +
          (specialDetails.length > 0 ? `：${specialDetails.join("、")}` : ""),
      });
    }
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

  // ===================== 渲染：安全承接页（自伤/危险想法，独立于普通记录） =====================
  if (phase === "safety") {
    return (
      <div className="flex h-full flex-col overflow-y-auto bg-white px-5">
        {/* —— 区域 1：承接文案 —— */}
        <div className="pt-10">
          <h2 className="text-center text-[19px] font-medium leading-[1.5] tracking-tight text-ink">
            这些感受很重，
            <br />
            你不必一个人扛
          </h2>
          <p className="mt-6 text-center text-[14px] leading-[1.8] text-ink-soft">
            先把自己放到安全一点的地方。
            <br />
            可以找一个现在能联系到的人，告诉 TA：
            <br />
            「我现在不太安全，能不能陪我一下？」
            <br />
            如果不知道找谁，也可以先打热线。
          </p>
        </div>

        {/* 弱提示卡片：不保存说明 + 紧急危险提示 */}
        <div className="mt-6 rounded-2xl bg-surface-soft/60 px-4 py-3">
          <p className="text-[12px] leading-[1.7] text-ink-faint">
            这条内容不会作为普通情绪记录保存。如果你正处在紧急危险中，请立刻联系身边可信任的人，或拨打当地急救 / 报警电话。
          </p>
        </div>

        {/* —— 区域 2：两个辅助行动出口 —— */}
        <div className="mt-7 flex flex-col gap-3">
          {/* 卡片 1：联系紧急联系人 */}
          <button
            onClick={() =>
              setSafetyExpanded(
                safetyExpanded === "contacts" ? null : "contacts",
              )
            }
            className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-left transition-colors hover:border-ink-faint"
          >
            <div className="flex-1">
              <div className="text-[15px] font-medium tracking-tight text-ink">
                联系紧急联系人
              </div>
              <div className="mt-0.5 text-[12px] text-ink-faint">
                找一个现在能联系到你的人。
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200 ${
                safetyExpanded === "contacts" ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence initial={false}>
            {safetyExpanded === "contacts" && (
              <motion.div
                key="contacts"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-2 pt-1">
                  {mockEmergencyContacts.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3"
                    >
                      <div className="flex-1">
                        <div className="text-[14px] font-medium text-ink">
                          {c.name}
                        </div>
                        <div className="mt-0.5 text-[12px] text-ink-faint">
                          {c.relation} · {c.phone}
                        </div>
                      </div>
                      <a
                        href={`tel:${c.phone.replace(/-/g, "")}`}
                        className="shrink-0 rounded-lg bg-action-primary px-3.5 py-2 text-[13px] font-medium text-action-primary-text transition-opacity hover:opacity-90"
                      >
                        拨打
                      </a>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 卡片 2：拨打心理援助热线 */}
          <button
            onClick={() =>
              setSafetyExpanded(
                safetyExpanded === "hotlines" ? null : "hotlines",
              )
            }
            className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-left transition-colors hover:border-ink-faint"
          >
            <div className="flex-1">
              <div className="text-[15px] font-medium tracking-tight text-ink">
                拨打心理援助热线
              </div>
              <div className="mt-0.5 text-[12px] text-ink-faint">
                如果不知道找谁，可以先打热线。
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200 ${
                safetyExpanded === "hotlines" ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence initial={false}>
            {safetyExpanded === "hotlines" && (
              <motion.div
                key="hotlines"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-2 pt-1">
                  {crisisHotlines.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3"
                    >
                      <div className="flex-1">
                        <div className="text-[14px] font-medium text-ink">
                          {h.name}
                        </div>
                        <div className="mt-0.5 text-[12px] text-ink-faint">
                          {h.note} · {h.phone}
                        </div>
                      </div>
                      <a
                        href={`tel:${h.phone}`}
                        className="shrink-0 rounded-lg bg-action-primary px-3.5 py-2 text-[13px] font-medium text-action-primary-text transition-opacity hover:opacity-90"
                      >
                        拨打
                      </a>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* —— 区域 3：底部主行动按钮 —— */}
        <div className="mt-auto pb-6 pt-6">
          <button
            onClick={handleGoZaiyaDialog}
            className="w-full rounded-xl bg-action-primary px-4 py-3 text-[14px] font-medium text-action-primary-text transition-opacity hover:opacity-90"
          >
            去跟 ZAIYA 聊一聊
          </button>
        </div>
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
      {/* 修改模式顶部提示 */}
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
            {/* —— Step 1：一级情绪（单选，自动进入） —— */}
            {step === 1 && (
              <div className="pt-6">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  现在情绪大概在哪儿？
                </p>
                <div className="mt-7 flex flex-col gap-2.5">
                  {primaryMoods.map((mood) => {
                    const selected = primaryMood?.label === mood.label;
                    return (
                      <button
                        key={mood.label}
                        onClick={() => handleSelectPrimary(mood)}
                        className={`flex h-14 items-center gap-3 rounded-2xl border px-5 text-left transition-all active:scale-[0.99] ${
                          selected
                            ? "border-action-primary/60 bg-action-soft text-ink"
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

            {/* —— Step 2：二级感受（按一级 polarity 展平，多选） —— */}
            {step === 2 && primaryMood && (
              <div className="pt-6">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  「{primaryMood.label}」更接近哪些感觉？
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-2.5">
                  {feelingOptions.map((word) => (
                    <button
                      key={word}
                      onClick={() => handleToggleFeeling(word)}
                      className={chipClass(feelings.includes(word))}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* —— Step 3：三级原因（统一池，多选） —— */}
            {step === 3 && tertiaryPool.options.length > 0 && (
              <div className="pt-6">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  {tertiaryPrompt}
                </p>
                {tertiaryPool.grouped ? (
                  // 负向 / mixed：按小标题分组展示
                  <div className="mt-6 flex flex-col gap-5">
                    {tertiaryPool.groups.map((group, gi) => (
                      <div key={`${group.title}-${gi}`}>
                        <div className="mb-2.5 text-center text-[12px] font-medium tracking-wide text-ink-faint">
                          {group.title}
                        </div>
                        <div className="flex flex-wrap justify-center gap-2.5">
                          {group.options.map((option) => {
                            const selected = reasons.includes(option);
                            return (
                              <button
                                key={option}
                                onClick={() => handleToggleReason(option)}
                                className={chipClass(selected)}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // 正向：平铺展示
                  <div className="mt-7 flex flex-wrap justify-center gap-2.5">
                    {tertiaryPool.options.map((option) => {
                      const selected = reasons.includes(option);
                      return (
                        <button
                          key={option}
                          onClick={() => handleToggleReason(option)}
                          className={chipClass(selected)}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* —— Step 4：特殊情况大类（不在同页展开细项；自伤走安全流程） —— */}
            {step === 4 && (
              <div className="pt-6">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  还有没有这些情况？
                </p>
                <p className="mt-1.5 text-center text-[13px] text-ink-faint">
                  没有也可以不填
                </p>
                <div className="mt-5">
                  <ChoiceCarousel
                    key="special-category-carousel"
                    items={specialSituationCategories.map((cat) => ({
                      id: cat.id,
                      label: cat.entry,
                      selected: specialCategoryId === cat.id,
                    }))}
                    activeIndex={cardIndex}
                    direction={carouselDirection}
                    selectedFeedbackId={selectedFeedbackId}
                    onNavigate={navigateCarousel}
                    onCardClick={(index) => {
                      const cat = specialSituationCategories[index];
                      if (!cat) return;

                      if (!isCurrentCarouselIndex(index)) {
                        navigateCarousel(index);
                        return;
                      }

                      handleSelectSpecialCategory(cat.id);
                    }}
                  />
                </div>
              </div>
            )}

            {/* —— Step 5：特殊情况细项（横向滑动卡片多选） —— */}
            {step === 5 && specialCategory && (
              <div className="pt-6">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  更接近哪些情况？
                </p>
                <p className="mt-1.5 text-center text-[13px] font-medium leading-relaxed tracking-tight text-ink-faint">
                  {specialCategory.entry}
                </p>

                <div className="mt-5">
                  <ChoiceCarousel
                    key={`special-detail-carousel-${specialCategory.id}`}
                    items={specialCategory.options.map((detail) => ({
                      id: detail,
                      label: detail,
                      selected: specialDetails.includes(detail),
                    }))}
                    activeIndex={cardIndex}
                    direction={carouselDirection}
                    selectedFeedbackId={selectedFeedbackId}
                    onNavigate={navigateCarousel}
                    onCardClick={(index) => {
                      const detail = specialCategory.options[index];
                      if (!detail) return;

                      if (!isCurrentCarouselIndex(index)) {
                        navigateCarousel(index);
                        return;
                      }

                      const wasSelected = specialDetails.includes(detail);
                      handleToggleSpecialDetail(detail);

                      clearSelectionFeedbackTimer();

                      if (!wasSelected && totalCards > 1) {
                        setSelectedFeedbackId(detail);
                        selectionFeedbackTimer.current = window.setTimeout(() => {
                          setSelectedFeedbackId(null);
                          navigateCarousel(index + 1, 1);
                        }, SELECTION_FEEDBACK_MS);
                      } else {
                        setSelectedFeedbackId(null);
                      }
                    }}
                  />
                </div>

                {/* 已选区域 */}
                {specialDetails.length > 0 && (
                  <div className="mt-4 px-1">
                    <div className="mb-2 text-[12px] text-ink-faint">已选</div>
                    <div className="flex flex-wrap gap-2">
                      {specialDetails.map((detail) => (
                        <div
                          key={detail}
                          className="inline-flex items-center gap-1.5 rounded-full border border-action-primary/50 bg-action-soft px-3 py-1.5 text-[13px] text-ink"
                        >
                          <span>{detail}</span>
                          <button
                            onClick={() => {
                              clearSelectionFeedbackTimer();
                              setSelectedFeedbackId(null);
                              handleToggleSpecialDetail(detail);
                            }}
                            className="ml-0.5 text-ink opacity-60 transition-opacity hover:opacity-100"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 底部按钮：多选步骤（2、3、5）和特殊情况大类页（4） */}
      {step === 2 && (
        <div className="bg-white px-5 pb-6 pt-3">
          <button
            onClick={handleNextFromFeelings}
            disabled={feelings.length === 0}
            className={`w-full rounded-xl px-4 py-3 text-[14px] font-medium transition-opacity ${
              feelings.length > 0
                ? "bg-action-primary text-action-primary-text hover:opacity-90"
                : "bg-surface-muted text-ink-faint"
            }`}
          >
            {editMode ? "确认修改" : "确认这些感觉"}
          </button>
        </div>
      )}
      {step === 3 && (
        <div className="bg-white px-5 pb-6 pt-3">
          <button
            onClick={handleNextFromReasons}
            disabled={!hasAnyReason}
            className={`w-full rounded-xl px-4 py-3 text-[14px] font-medium transition-opacity ${
              hasAnyReason
                ? "bg-action-primary text-action-primary-text hover:opacity-90"
                : "bg-surface-muted text-ink-faint"
            }`}
          >
            {editMode ? "确认修改" : "确认这些原因"}
          </button>
        </div>
      )}
      {step === 4 && (
        <div className="bg-white px-5 pb-6 pt-3">
          <button
            onClick={handleSkipSpecial}
            className="w-full rounded-full border border-line bg-surface-soft px-4 py-3 text-[13px] font-medium text-ink-soft transition-colors hover:border-ink-faint hover:bg-white"
          >
            没有这些情况，暂不补充
          </button>
        </div>
      )}
      {step === 5 && (
        <div className="bg-white px-5 pb-6 pt-3">
          <div className="flex gap-3">
            <button
              onClick={handleSkipSpecial}
              className="flex-1 rounded-xl border border-line bg-white px-4 py-3 text-[14px] font-medium text-ink-soft transition-colors hover:border-ink-faint"
            >
              暂不补充
            </button>
            <button
              onClick={handleCompleteSpecialDetails}
              className="flex-1 rounded-xl bg-action-primary px-4 py-3 text-[14px] font-medium text-action-primary-text transition-opacity hover:opacity-90"
            >
              {editMode ? "确认修改" : "确认这些情况"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
