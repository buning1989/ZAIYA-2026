import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import RecordInlineInput from "./RecordInlineInput";
import RecordNoteSection from "./RecordNoteSection";
import RecordSummaryCard, { type SummaryRow } from "./RecordSummaryCard";
import GroupedTimeChoice, {
  type GroupedTimeChoiceGroup,
} from "./GroupedTimeChoice";
import SegmentedTimeScale from "./SegmentedTimeScale";
import {
  sleepLevels,
  sleepLevelLabel,
  sleepSubwordsByLevel,
  bedTimeRanges,
  fallAsleepDurationOptions,
  wakeTimeRanges,
  awakeDurationOptions,
  type SleepLevel,
} from "@/data/sleepOptions";
import type { Answers, RecordType } from "@/data/record";

const ease = [0.22, 1, 0.36, 1] as const;
const TOTAL_STEPS = 6;
// 选中后保留 550ms 再进入下一题，让用户清楚看到选中反馈
const AUTO_ADVANCE_MS = 550;

const bedTimeGroups: GroupedTimeChoiceGroup[] = [
  { id: "earlier", label: "更早", optionValues: ["before_21"] },
  { id: "evening", label: "晚上", optionValues: ["21_22", "22_23", "23_00"] },
  { id: "lateNight", label: "凌晨", optionValues: ["00_01", "01_02", "02_03"] },
  { id: "later", label: "更晚", optionValues: ["after_03"] },
];

const wakeTimeGroups: GroupedTimeChoiceGroup[] = [
  { id: "earlier", label: "更早", optionValues: ["before_06"] },
  { id: "earlyMorning", label: "清晨", optionValues: ["06_07", "07_08"] },
  {
    id: "morning",
    label: "上午",
    optionValues: ["08_09", "09_10", "10_11", "11_12"],
  },
  { id: "later", label: "更晚", optionValues: ["after_12"] },
];

type Step = 1 | 2 | 3 | 4 | 5 | 6;
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

export default function SleepRecordWizard({
  answers,
  setAnswers,
  onFinishRecord,
  onAbort,
  onProgressChange,
}: Props) {
  // —— 核心状态机 ——
  const [step, setStep] = useState<Step>(1);
  const [phase, setPhase] = useState<Phase>("editing");
  const [editMode, setEditMode] = useState(false);
  // 当前打开的输入面板（其他感受 / 补充说明）
  const [inputPanel, setInputPanel] = useState<InputPanel>(null);

  // —— 各步答案 ——
  const [sleepLevel, setSleepLevel] = useState<SleepLevel | null>(null);
  const [sleepSubwords, setSleepSubwords] = useState<string[]>([]);
  // 「其他感受」自由输入文本（与 sleepSubwords 合并展示在「感受」字段）
  const [customFeelingText, setCustomFeelingText] = useState("");
  const [bedTimeRange, setBedTimeRange] = useState<string | null>(null);
  const [fallAsleepTimeRange, setFallAsleepTimeRange] = useState<string | null>(
    null,
  );
  const [wakeTimeRange, setWakeTimeRange] = useState<string | null>(null);
  const [awakeDurationRange, setAwakeDurationRange] = useState<string | null>(
    null,
  );
  // 补充说明（结算页可点击行触发抽屉输入，非必填）
  const [note, setNote] = useState("");

  // 点击锁定：选中后等待自动跳转期间，禁止重复触发（避免连续快速点击跳过多个问题）
  const [isLocked, setIsLocked] = useState(false);
  const isLockedRef = useRef(false);

  // 自动跳转计时器
  const autoAdvanceTimer = useRef<number | null>(null);

  const clearAutoAdvance = () => {
    if (autoAdvanceTimer.current !== null) {
      window.clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  };

  const setTimeSelectionLocked = (locked: boolean) => {
    isLockedRef.current = locked;
    setIsLocked(locked);
  };

  useEffect(
    () => () => {
      clearAutoAdvance();
    },
    [],
  );

  // —— 派生数据 ——
  const subwordOptions = sleepLevel ? sleepSubwordsByLevel[sleepLevel] : [];
  const levelLabel = sleepLevel ? sleepLevelLabel[sleepLevel] : null;
  // 感受合并展示：预设选项 + 自定义感受文本，顿号拼接
  const feelingSummary = [
    sleepSubwords.join("、"),
    customFeelingText.trim(),
  ]
    .filter(Boolean)
    .join("、");

  // 用 useMemo 稳定引用，作为同步 effect 的依赖
  const bedTimeOption = useMemo(
    () => bedTimeRanges.find((o) => o.value === bedTimeRange) ?? null,
    [bedTimeRange],
  );
  const fallAsleepOption = useMemo(
    () =>
      fallAsleepDurationOptions.find((o) => o.value === fallAsleepTimeRange) ??
      null,
    [fallAsleepTimeRange],
  );
  const wakeTimeOption = useMemo(
    () => wakeTimeRanges.find((o) => o.value === wakeTimeRange) ?? null,
    [wakeTimeRange],
  );
  const awakeOption = useMemo(
    () => awakeDurationOptions.find((o) => o.value === awakeDurationRange) ?? null,
    [awakeDurationRange],
  );

  // —— 进度上报 ——
  useEffect(() => {
    onProgressChange({
      hasCompletedFirstStep: step >= 2 || phase !== "editing",
      isFullRecordReady: phase === "preview" || phase === "saved",
      isSafetyPhase: false,
    });
  }, [step, phase, onProgressChange]);

  // —— 同步到父级 wizardAnswers（含 label / rangeText / estimate 三组字段 + note） ——
  useEffect(() => {
    const newAnswers: Answers = {};
    if (sleepLevel) {
      newAnswers.sleepLevel = {
        type: "option",
        value: String(sleepLevel),
        label: sleepLevelLabel[sleepLevel],
      };
    }
    if (sleepSubwords.length > 0) {
      newAnswers.sleepSubwords = {
        type: "option",
        value: sleepSubwords.join("|"),
        label: sleepSubwords.join("、"),
      };
    }
    // 「其他感受」自由输入文本（独立字段，结算页与 sleepSubwords 合并展示在「感受」）
    if (customFeelingText.trim()) {
      newAnswers.customFeelingText = {
        type: "custom",
        value: customFeelingText.trim(),
      };
    }
    // 上床时间：保存口语化 label、标准 rangeText、估算值 estimate
    if (bedTimeOption) {
      newAnswers.bedTimeLabel = {
        type: "custom",
        value: bedTimeOption.label,
      };
      if (bedTimeOption.rangeText) {
        newAnswers.bedTimeRange = {
          type: "custom",
          value: bedTimeOption.rangeText,
        };
      }
      if (bedTimeOption.estimate) {
        newAnswers.bedTime = { type: "custom", value: bedTimeOption.estimate };
      }
    }
    // 入睡用时（duration，estimate 为分钟数）
    if (fallAsleepOption) {
      newAnswers.fallAsleepTimeLabel = {
        type: "custom",
        value: fallAsleepOption.label,
      };
      if (fallAsleepOption.rangeText) {
        newAnswers.fallAsleepTimeRange = {
          type: "custom",
          value: fallAsleepOption.rangeText,
        };
      }
      if (typeof fallAsleepOption.estimate === "number") {
        newAnswers.fallAsleepTime = {
          type: "custom",
          value: String(fallAsleepOption.estimate),
        };
      }
    }
    // 醒来时间
    if (wakeTimeOption) {
      newAnswers.wakeTimeLabel = {
        type: "custom",
        value: wakeTimeOption.label,
      };
      if (wakeTimeOption.rangeText) {
        newAnswers.wakeTimeRange = {
          type: "custom",
          value: wakeTimeOption.rangeText,
        };
      }
      if (wakeTimeOption.estimate) {
        newAnswers.wakeTime = { type: "custom", value: wakeTimeOption.estimate };
      }
    }
    // 夜里醒着时长
    if (awakeOption) {
      newAnswers.awakeDurationLabel = {
        type: "custom",
        value: awakeOption.label,
      };
      if (awakeOption.rangeText) {
        newAnswers.awakeDurationRange = {
          type: "custom",
          value: awakeOption.rangeText,
        };
      }
      if (typeof awakeOption.estimate === "number") {
        newAnswers.awakeDuration = {
          type: "custom",
          value: String(awakeOption.estimate),
        };
      }
    }
    // 补充说明
    if (note.trim()) {
      newAnswers.note = { type: "custom", value: note.trim() };
    }
    setAnswers(newAnswers);
  }, [
    sleepLevel,
    sleepSubwords,
    customFeelingText,
    bedTimeOption,
    fallAsleepOption,
    wakeTimeOption,
    awakeOption,
    note,
    setAnswers,
  ]);

  // ===================== 修改模式 =====================
  const exitEditMode = () => {
    setEditMode(false);
    setPhase("preview");
  };

  // ===================== 选择处理 =====================

  // Step 1：整体睡眠感受（单选 → 自动进入）
  const handleSelectLevel = (level: SleepLevel) => {
    clearAutoAdvance();
    const changed = sleepLevel !== level;
    setSleepLevel(level);
    // 修改了上游 → 清空下游具体感受（含自定义感受文本）
    if (changed) {
      setSleepSubwords([]);
      setCustomFeelingText("");
    }
    autoAdvanceTimer.current = window.setTimeout(() => {
      if (editMode) {
        exitEditMode();
      } else {
        setStep(2);
      }
    }, AUTO_ADVANCE_MS);
  };

  // Step 2：具体睡眠感受（多选，预设选项 toggle）
  const handleToggleSubword = (word: string) => {
    setSleepSubwords((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word],
    );
  };

  // Step 2：「其他感受」胶囊点击：若有内容则清空，否则打开输入抽屉
  const handleCustomFeelingChipClick = () => {
    if (customFeelingText.trim()) {
      setCustomFeelingText("");
      return;
    }
    setInputPanel("custom");
  };

  // Step 2：底部按钮 → 下一步 / 确认修改
  const handleNextFromSubwords = () => {
    if (sleepSubwords.length === 0 && !customFeelingText.trim()) return;
    if (editMode) {
      exitEditMode();
    } else {
      setStep(3);
    }
  };

  // Step 2：「暂不补充」→ 直接进入下一步（具体感受为非必填主观字段）
  const handleSkipSubwords = () => {
    if (editMode) {
      exitEditMode();
    } else {
      setStep(3);
    }
  };

  // Steps 3-6：分段时间轴单选 → 选中后保留 550ms 再进入下一题
  // 等待期间锁定点击，避免连续快速点击跳过多个问题
  const handleSelectTimeRange = (
    value: string,
    stepNum: Step,
  ) => {
    if (isLockedRef.current) return;
    setTimeSelectionLocked(true);
    clearAutoAdvance();
    switch (stepNum) {
      case 3:
        setBedTimeRange(value);
        break;
      case 4:
        setFallAsleepTimeRange(value);
        break;
      case 5:
        setWakeTimeRange(value);
        break;
      case 6:
        setAwakeDurationRange(value);
        break;
    }
    autoAdvanceTimer.current = window.setTimeout(() => {
      if (editMode) {
        exitEditMode();
      } else if (stepNum < 6) {
        setStep((stepNum + 1) as Step);
      } else {
        setPhase("preview");
      }
      setTimeSelectionLocked(false);
    }, AUTO_ADVANCE_MS);
  };

  // 「记不清，先跳过」：当前字段保存为 null，直接进入下一题
  // 跳过不写入 label / rangeText / estimate，结算页不展示该行
  const handleSkipTimeRange = (stepNum: Step) => {
    if (isLockedRef.current) return;
    clearAutoAdvance();
    switch (stepNum) {
      case 3:
        setBedTimeRange(null);
        break;
      case 4:
        setFallAsleepTimeRange(null);
        break;
      case 5:
        setWakeTimeRange(null);
        break;
      case 6:
        setAwakeDurationRange(null);
        break;
    }
    if (editMode) {
      exitEditMode();
    } else if (stepNum < 6) {
      setStep((stepNum + 1) as Step);
    } else {
      setPhase("preview");
    }
  };

  // 输入抽屉保存：写入对应字段
  const handleInputSave = (value: string) => {
    if (inputPanel === "custom") {
      setCustomFeelingText(value);
    }
    setInputPanel(null);
  };

  // 结算页"保存记录" → 调用保存接口 + 发能量 + 盖章 + Toast → 切 saved 态
  // saved 态"回到记一下" → onAbort 回首页
  const handleSave = () => {
    if (phase === "saved") {
      onAbort();
      return;
    }
    onFinishRecord(answers);
    setPhase("saved");
  };

  const timeStr = "刚刚";

  // —— 通用样式 ——
  // 多选胶囊：与情绪 / 饮食 / 服用模块一致
  const chipClass = (selected: boolean) =>
    `inline-flex items-center justify-center rounded-full border px-4 py-2 text-[14px] font-medium whitespace-nowrap max-w-[240px] overflow-hidden text-ellipsis transition-all active:scale-[0.97] ${
      selected
        ? "border-transparent bg-accent-soft text-ink"
        : "border-line bg-white text-ink hover:border-action-primary/60"
    }`;

  // 判断选项是否为「几乎没睡着」→ 结算页不展示该行
  // 「记不清，先跳过」已通过字段为 null 自然跳过，不在此判断
  const isUnknownLabel = (label: string | undefined): boolean =>
    !label || label === "几乎没睡着";

  // ===================== 渲染：结算单（preview / saved） =====================
  if (phase === "preview" || phase === "saved") {
    // 构造结算单字段行：仅展示有值的字段，「几乎没睡着」不展示
    const rows: SummaryRow[] = [];
    if (levelLabel) {
      rows.push({ label: "睡眠", value: levelLabel });
    }
    if (feelingSummary) {
      rows.push({ label: "感受", value: feelingSummary });
    }
    if (bedTimeOption && !isUnknownLabel(bedTimeOption.label)) {
      rows.push({ label: "上床", value: bedTimeOption.label });
    }
    if (fallAsleepOption && !isUnknownLabel(fallAsleepOption.label)) {
      rows.push({ label: "入睡", value: fallAsleepOption.label });
    }
    if (wakeTimeOption && !isUnknownLabel(wakeTimeOption.label)) {
      rows.push({ label: "起床", value: wakeTimeOption.label });
    }
    if (awakeOption && !isUnknownLabel(awakeOption.label)) {
      rows.push({ label: "夜醒", value: awakeOption.label });
    }
    rows.push({ label: "时间", value: timeStr });

    return (
      <div className="relative flex h-full flex-col bg-white">
        <RecordSummaryCard
          rows={rows}
          saved={phase === "saved"}
          primaryButtonText={phase === "saved" ? "回到记一下" : "保存记录"}
          onPrimaryClick={handleSave}
        >
          <RecordNoteSection
            value={note}
            onChange={setNote}
            saved={phase === "saved"}
            placeholder="比如做了梦、半夜醒了几次、醒来后的感觉"
            hint="比如做了梦、半夜醒了几次、醒来后的感觉"
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
            {/* —— Step 1：整体睡眠感受（单选，自动进入） —— */}
            {step === 1 && (
              <div className="pt-6">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  昨晚睡得怎么样？
                </p>
                <div className="mt-7 flex flex-col gap-2.5">
                  {sleepLevels.map((opt) => {
                    const selected = sleepLevel === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSelectLevel(opt.value)}
                        className={`flex h-14 items-center gap-3 rounded-2xl border px-5 text-left transition-all active:scale-[0.99] ${
                          selected
                            ? "border-transparent bg-accent-soft text-ink"
                            : "border-line bg-white text-ink hover:border-ink-faint"
                        }`}
                      >
                        <span className="h-2 w-2 shrink-0 rounded-full bg-ink-faint/60" />
                        <span className="flex-1 text-[15px] font-medium tracking-tight">
                          {opt.label}
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

            {/* —— Step 2：具体睡眠感受（按 sleepLevel 动态展示，多选 + 「其他感受」抽屉输入） —— */}
            {step === 2 && sleepLevel && (
              <div className="pt-6">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  更接近哪些感受？
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-2.5">
                  {subwordOptions.map((word) => (
                    <button
                      key={word}
                      onClick={() => handleToggleSubword(word)}
                      className={chipClass(sleepSubwords.includes(word))}
                    >
                      {word}
                    </button>
                  ))}
                  {/* 「其他感受」胶囊：已填写态显示填写内容摘要，点击清空；未填写态点击打开输入抽屉 */}
                  <button
                    onClick={handleCustomFeelingChipClick}
                    className={chipClass(!!customFeelingText.trim())}
                  >
                    {customFeelingText.trim()
                      ? `其他：${customFeelingText.trim()}`
                      : "其他感受"}
                  </button>
                </div>
              </div>
            )}

            {/* —— Step 3：大概上床时间（分组直选，选择后自动进入） —— */}
            {step === 3 && (
              <div className="pt-10">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  大概几点上床？
                </p>
                <div className="mt-8">
                  <GroupedTimeChoice
                    options={bedTimeRanges}
                    groups={bedTimeGroups}
                    value={bedTimeRange}
                    onChange={(v) => handleSelectTimeRange(v, 3)}
                    ariaLabel="上床时间"
                    disabled={isLocked}
                  />
                </div>
              </div>
            )}

            {/* —— Step 4：入睡用时（大尺寸分段时间轴，单选，自动进入） —— */}
            {step === 4 && (
              <div className="pt-10">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  躺下后多久睡着？
                </p>
                <div className="mt-8">
                  <SegmentedTimeScale
                    options={fallAsleepDurationOptions}
                    value={fallAsleepTimeRange}
                    onChange={(v) => handleSelectTimeRange(v, 4)}
                    ariaLabel="入睡用时"
                    startLabel="很快"
                    endLabel="很久"
                  />
                </div>
              </div>
            )}

            {/* —— Step 5：大概醒来或起床时间（分组直选，选择后自动进入） —— */}
            {step === 5 && (
              <div className="pt-10">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  大概几点醒来或起床？
                </p>
                <div className="mt-8">
                  <GroupedTimeChoice
                    options={wakeTimeRanges}
                    groups={wakeTimeGroups}
                    value={wakeTimeRange}
                    onChange={(v) => handleSelectTimeRange(v, 5)}
                    ariaLabel="醒来时间"
                    disabled={isLocked}
                  />
                </div>
              </div>
            )}

            {/* —— Step 6：夜里醒着大概多久（大尺寸分段时间轴，单选，自动进入） —— */}
            {step === 6 && (
              <div className="pt-10">
                <p className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  夜里一共醒着多久？
                </p>
                <div className="mt-8">
                  <SegmentedTimeScale
                    options={awakeDurationOptions}
                    value={awakeDurationRange}
                    onChange={(v) => handleSelectTimeRange(v, 6)}
                    ariaLabel="夜间清醒时长"
                    startLabel="很少"
                    endLabel="很久"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 底部按钮：仅 Step 2（多选需确认，「暂不补充」可跳过主观感受） */}
      {step === 2 && (
        <div className="bg-white px-5 pb-6 pt-3">
          <div className="flex gap-3">
            <button
              onClick={handleSkipSubwords}
              className="flex-1 rounded-xl border border-line bg-white px-4 py-3 text-[14px] font-medium text-ink-soft transition-colors hover:border-ink-faint"
            >
              暂不补充
            </button>
            <button
              onClick={handleNextFromSubwords}
              disabled={sleepSubwords.length === 0 && !customFeelingText.trim()}
              className={`flex-1 rounded-xl px-4 py-3 text-[14px] font-medium transition-opacity ${
                sleepSubwords.length > 0 || customFeelingText.trim()
                  ? "bg-action-primary text-action-primary-text hover:opacity-90"
                  : "bg-surface-muted text-ink-faint"
              }`}
            >
              {editMode ? "确认修改" : "确认这些感受"}
            </button>
          </div>
        </div>
      )}

      {/* —— 统一输入面板：其他感受（editing 态 Step 2 触发） —— */}
      <RecordInlineInput
        show={inputPanel === "custom"}
        title="其他感受"
        placeholder="写下更接近你的感受"
        value={customFeelingText}
        onSave={handleInputSave}
        onClose={() => setInputPanel(null)}
      />

      {/* —— 底部跳过入口：Step 3-6 时间尺页面统一固定在底部安全区上方 —— */}
      {step >= 3 && step <= 6 && (
        <div className="bg-white px-5 pb-7 pt-2">
          <button
            onClick={() => handleSkipTimeRange(step)}
            className="mx-auto flex min-h-[44px] w-full max-w-[260px] items-center justify-center text-[13px] text-ink-faint transition-colors hover:text-ink-soft"
          >
            记不清，先跳过
          </button>
        </div>
      )}
    </div>
  );
}
