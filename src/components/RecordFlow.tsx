import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import ZaizaiVideo from "./ZaizaiVideo";
import VoiceInputBar from "./VoiceInputBar";
import MoodRecordWizard from "./MoodRecordWizard";
import MedicationRecordWizard from "./MedicationRecordWizard";
import MealRecordWizard from "./MealRecordWizard";
import SleepRecordWizard from "./SleepRecordWizard";
import ActivityRecordWizard from "./ActivityRecordWizard";
import WeightRecordWizard from "./WeightRecordWizard";
import EnergyRewardFeedback, {
  type EnergyRewardEvent,
} from "./EnergyRewardFeedback";
import EnergyBadge from "./EnergyBadge";
import { PhoneStatusBar } from "./AppMainSurface";
import { MoonPhaseIcon, type MoonPhaseLevel } from "./MoonPhaseIcon";
import { calculateBMI, getUserProfile, grantEnergy } from "@/data/userProfile";
import {
  CUSTOM_INPUT_VALUE,
  getNextStep,
  getLastWeightRecord,
  isCompleteCoreRecord,
  recordTypes,
  resolveStepOptions,
  summaryLabels,
  type AnswerEntry,
  type Answers,
  type RecordEntry,
  type RecordType,
  type RecordTypeId,
  type Step,
  type StepOption,
} from "@/data/record";
import { SAFETY_DIALOG_STARTER } from "@/data/crisisResources";

const ease = [0.22, 1, 0.36, 1] as const;

type ActiveEnergyReward = EnergyRewardEvent;

/* —— 月相图标（与 LookbackPage MoodBead 同步）—— */
const intensityValueToLevel: Record<string, MoonPhaseLevel> = {
  very_low: 1,
  low: 2,
  normal: 3,
  high: 4,
  very_high: 5,
};

type BmiStatus = "thin" | "normal" | "overweight" | "obesity";

function parseWeightKg(value: string | undefined): number | null {
  if (!value) return null;
  const weight = Number(value);
  if (!Number.isFinite(weight) || weight <= 0) return null;
  return weight;
}

function createRecordSessionId(typeId: RecordTypeId): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `${typeId}-${window.crypto.randomUUID()}`;
  }
  return `${typeId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getBmiStatus(bmi: number): {
  status: BmiStatus;
  label: string;
  summary: string;
  note: string;
} {
  if (bmi < 18.5) {
    return {
      status: "thin",
      label: "偏瘦",
      summary: "低于常用参考范围",
      note: "可以结合近期饮食、睡眠和身体状态一起看。",
    };
  }
  if (bmi < 25) {
    return {
      status: "normal",
      label: "正常",
      summary: "在常用参考范围内",
      note: "这个数值处在常用 BMI 参考范围内。",
    };
  }
  if (bmi < 30) {
    return {
      status: "overweight",
      label: "偏胖",
      summary: "高于常用参考范围",
      note: "BMI 是筛查参考，可以和身体围度、活动状态一起看。",
    };
  }
  return {
    status: "obesity",
    label: "明显偏胖",
    summary: "明显高于常用参考范围",
    note: "BMI 是筛查参考，必要时可以和专业人士一起判断。",
  };
}

/* —— "记一下" 本地状态机 ——
 * 三状态：recordHome → recordWizard → recordResult
 *
 * 单页单项：一次只展示一个 step 的问题 + 选项。
 *   - 结构化选项为主路径，自由输入为补充路径（弱入口「没有合适的，自己写一句」）
 *   - 单选项点击后停留 400ms 自动进入下一项，不设"下一步"按钮
 *   - 异常选项通过 branches 进入温和追问（仍是单页单项，不做风险强化）
 *   - 最后一项（isLast）为「补一句」轻输入框，可不填完成
 *   - 语音 / 图片 icon 仅作辅助样式，不接真实能力
 *   - 完整记录触发能量奖励（前端 mock）
 *
 * 快捷入口配置已从记录页移除，迁移到「更多 → 设置 → 首页与快捷入口 → 记一下」。
 * 完成记录后直接回到记一下首页，并展示短暂保存提示。
 *
 * 全程本地 mock，不接后端 / LLM / 真实数据写入。 */
type Layer = "home" | "wizard";

type Props = {
  /** 返回 more 侧边栏（recordHome 顶部返回） */
  onBack: () => void;
  /** 每次记录完成时回调，传递类型与是否完整，用于 AppMainSurface 历史记录与提示触发
   *  weightValue：体重记录专用，传递当前体重值（KG），用于历史记录持久化 */
  onRecordComplete?: (e: {
    typeId: RecordTypeId;
    isComplete: boolean;
    weightValue?: number;
  }) => void;
  /** 先保存：用户在 wizard 中途点击「先保存」，保存为 basic 记录并直接回首页
   *  不进入完成页、不展示能量、不触发快捷入口提示 */
  onSaveFirst?: (e: {
    typeId: RecordTypeId;
    answers: Answers;
  }) => void;
  /** 安全承接页：点击「去跟 ZAIYA 聊一聊」时回调，退出记录流程并打开 ZAIYA 对话 */
  onOpenZaiyaDialog?: (starterText: string) => void;
  /** 保留给 AppMainSurface 的快捷入口控制；当前记录完成后不再展示独立结果页 */
  showShortcutHint: boolean;
  onAcceptShortcut: () => void;
  onDismissShortcutHint: () => void;
  /** 记录历史，用于「记一下」主页最近记录气泡展示 */
  recordHistory?: RecordEntry[];
};

export default function RecordFlow({
  onBack,
  onRecordComplete,
  onSaveFirst,
  onOpenZaiyaDialog,
  recordHistory = [],
}: Props) {
  const [layer, setLayer] = useState<Layer>("home");
  const [typeId, setTypeId] = useState<RecordTypeId | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // wizard 的 answers 上提：用于顶部入口显示判断与「先记到这儿」部分保存
  const [wizardAnswers, setWizardAnswers] = useState<Answers>({});

  // 是否已完成保存（success 态），用于返回按钮跳过放弃确认
  const [isRecordSaved, setIsRecordSaved] = useState(false);
  const [activeEnergyReward, setActiveEnergyReward] =
    useState<ActiveEnergyReward | null>(null);
  const [energyPulse, setEnergyPulse] = useState(false);
  const energyRewardIdRef = useRef(0);
  const energyButtonRef = useRef<HTMLButtonElement | null>(null);
  const energyPulseTimer = useRef<number | null>(null);
  const recordSessionIdRef = useRef<string>("");
  // 上一次体重记录值（用于体重页默认填入 + 步进调节）
  // 从 recordHistory 中读取最近一条带 weight 值的体重记录；无历史时为 null（页面渲染手动输入框）
  const [lastWeight, setLastWeight] = useState<number | null>(
    () => getLastWeightRecord(recordHistory)?.weight ?? null,
  );

  // 由 RecordWizard 上报的进度状态：用于顶部入口与返回确认分支
  // hasCompletedFirstStep：已进入第二项及以后（第一项已完成）
  // isFullRecordReady：已进入「这条记录已经完整了」确认页
  const [hasCompletedFirstStep, setHasCompletedFirstStep] = useState(false);
  const [isFullRecordReady, setIsFullRecordReady] = useState(false);
  // 安全承接页激活态：拦截普通返回逻辑，弹出安全引导确认
  const [isSafetyPhase, setIsSafetyPhase] = useState(false);
  // 返回确认浮层模式：moodExit=有未保存内容时的三选一（继续/保存当前内容/不保存退出）；safetyExit=安全承接页引导
  const [dialogMode, setDialogMode] = useState<
    "moodExit" | "safetyExit" | null
  >(null);

  const type = typeId
    ? recordTypes.find((t) => t.id === typeId) ?? null
    : null;

  const goWizard = (id: RecordTypeId) => {
    setTypeId(id);
    recordSessionIdRef.current = createRecordSessionId(id);
    setWizardAnswers({});
    setSavedMessage(null);
    setIsRecordSaved(false);
    setHasCompletedFirstStep(false);
    setIsFullRecordReady(false);
    setIsSafetyPhase(false);
    setDialogMode(null);
    setLayer("wizard");
  };

  // 顶部入口显示判断：已有至少 1 项有效输入
  const hasAnyAnswer = Object.values(wizardAnswers).some(
    (a) => a && (a.label?.trim() || a.value.trim()),
  );
  // 可部分保存：已完成第一项、未到确认页、未保存
  const canSavePartial =
    hasCompletedFirstStep && !isFullRecordReady && !isRecordSaved;

  // wizard 完成时调用：保存后直接回到记一下首页，并给出轻提示
  const handleSave = (answers: Answers) => {
    const complete = typeId ? isCompleteCoreRecord(typeId, answers) : false;
    const savedTypeName = type?.name ?? "记录";
    // 体重记录：保存本次体重值作为下一次默认值，并随回调持久化到历史
    let weightValue: number | undefined;
    if (typeId === "weight") {
      const w = parseWeightKg(answers.weightKg?.value);
      if (w !== null) {
        weightValue = w;
        setLastWeight(w);
      }
    }
    if (typeId) onRecordComplete?.({ typeId, isComplete: complete, weightValue });
    setSavedMessage(`${savedTypeName}记录已保存`);
    backToRecordHome();
  };

  // 确认页「完成记录」：保存记录 + 触发光反馈，但原地切换 success 态，不回首页
  // 回首页由 success 态「回到记一下」按钮触发（onBackHome=backToRecordHome）
  const handleCompleteRecord = (answers: Answers) => {
    const complete = typeId ? isCompleteCoreRecord(typeId, answers) : false;
    // 体重记录：保存本次体重值作为下一次默认值，并随回调持久化到历史
    let weightValue: number | undefined;
    if (typeId === "weight") {
      const w = parseWeightKg(answers.weightKg?.value);
      if (w !== null) {
        weightValue = w;
        setLastWeight(w);
      }
    }
    if (typeId) onRecordComplete?.({ typeId, isComplete: complete, weightValue });

    // 触发光反馈：只要保存成功就触发，不要求完整记录
    const hasValidInput = Object.values(answers).some(
      (a) => a && (a.label?.trim() || a.value.trim()),
    );
    if (hasValidInput && typeId) {
      const sourceId = recordSessionIdRef.current || createRecordSessionId(typeId);
      recordSessionIdRef.current = sourceId;
      const result = grantEnergy({
        source: "record_completed",
        sourceId,
      });
      if (result.granted) {
        energyRewardIdRef.current += 1;
        setActiveEnergyReward({
          id: energyRewardIdRef.current,
          occurredAt: Date.now(),
        });
      }
    }

    setIsRecordSaved(true);
    // 不 setSavedMessage：完成反馈由 success 态承担，不再走 Toast
    // 不 backToRecordHome：保持当前 wizard 层，RecordConfirmPage 内部切 phase=success
  };

  // 「先记到这儿」：保存当前已完成内容为部分记录（不完整、不发完整能量、不进确认页），
  // 交给父组件 onSaveFirst 处理（status: basic、退出到应用首页并展示轻反馈）
  const handleSavePartial = () => {
    setDialogMode(null);
    if (typeId) onSaveFirst?.({ typeId, answers: wizardAnswers });
  };

  // 顶部返回按钮拦截（统一走情绪模块的退出交互）：
  //   已保存 → 直接回首页
  //   安全承接页 → 不直接返回普通记录流程，弹出安全引导确认
  //   有未保存内容 → moodExit 三选一（继续记录/保存当前内容/不保存退出）
  //   无任何填写 → 直接返回
  const handleBack = () => {
    if (layer === "home") {
      onBack();
      return;
    }
    if (isRecordSaved) {
      backToRecordHome();
      return;
    }
    // 安全承接页：不直接返回普通记录流程，弹出安全引导确认
    if (isSafetyPhase) {
      setDialogMode("safetyExit");
      return;
    }
    if (hasAnyAnswer) {
      setDialogMode("moodExit");
      return;
    }
    backToRecordHome();
  };

  // 放弃未保存记录：清空状态返回首页
  const handleDiscardAndGoHome = () => {
    setDialogMode(null);
    backToRecordHome();
  };

  const backToRecordHome = () => {
    setLayer("home");
    setTypeId(null);
    setWizardAnswers({});
    setIsRecordSaved(false);
    setHasCompletedFirstStep(false);
    setIsFullRecordReady(false);
    setIsSafetyPhase(false);
    setDialogMode(null);
  };

  // 接收 RecordWizard 上报的进度（stepStack 长度 / 是否进入确认页 / 是否在安全承接页）
  const handleProgressChange = useCallback(
    (progress: {
      hasCompletedFirstStep: boolean;
      isFullRecordReady: boolean;
      isSafetyPhase: boolean;
    }) => {
      setHasCompletedFirstStep(progress.hasCompletedFirstStep);
      setIsFullRecordReady(progress.isFullRecordReady);
      setIsSafetyPhase(progress.isSafetyPhase);
    },
    [],
  );

  const title =
    layer === "home"
      ? "记一下"
      : layer === "wizard"
        ? type?.name ?? "记一下"
        : "";

  useEffect(() => {
    if (!savedMessage) return;
    const timer = window.setTimeout(() => setSavedMessage(null), 2200);
    return () => window.clearTimeout(timer);
  }, [savedMessage]);

  const handleEnergyRewardDone = useCallback(() => {
    setActiveEnergyReward(null);
  }, []);

  const handleEnergyRewardArrive = useCallback(() => {
    setEnergyPulse(true);
    if (energyPulseTimer.current) window.clearTimeout(energyPulseTimer.current);
    energyPulseTimer.current = window.setTimeout(() => {
      setEnergyPulse(false);
      energyPulseTimer.current = null;
    }, 420);
  }, []);

  useEffect(() => {
    return () => {
      if (energyPulseTimer.current) window.clearTimeout(energyPulseTimer.current);
    };
  }, []);

  return (
    <div className="relative flex h-full flex-col bg-white">
      <PhoneStatusBar />

      {/* 顶部返回 + 标题 + 右上角入口（能量 / 先记到这儿 / 空置） */}
      <div className="relative flex items-center gap-3 bg-white px-5 pt-14 pb-2">
        <button
          onClick={handleBack}
          aria-label="返回"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="flex-1 text-[17px] font-semibold tracking-tight text-ink">
          {title}
        </h2>
        {layer === "wizard" && !isSafetyPhase && (isFullRecordReady || isRecordSaved) ? (
          /* 确认页 / 已保存：我的光入口（统一组件，点击提示 Demo 暂未开放） */
          <EnergyBadge
            pulse={energyPulse}
            buttonRef={energyButtonRef}
            position="inline"
          />
        ) : layer === "wizard" && !isSafetyPhase && canSavePartial ? (
          /* 第二项及以后、未到确认页：先记到这儿（部分保存） */
          <button
            onClick={handleSavePartial}
            className="text-[13px] font-medium text-ink-soft transition-colors hover:text-ink"
          >
            先记到这儿
          </button>
        ) : null}
      </div>

      {/* 层级内容 */}
      <div className="relative flex-1 overflow-hidden bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={layer}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.28, ease }}
            className="absolute inset-0 bg-white"
          >
            {layer === "home" && (
              <RecordHome
                onPick={goWizard}
                recordHistory={recordHistory}
                savedMessage={savedMessage}
              />
            )}
            {layer === "wizard" && type && typeId === "mood" && (
              <MoodRecordWizard
                type={type}
                answers={wizardAnswers}
                setAnswers={setWizardAnswers}
                onSave={handleSave}
                onFinishRecord={handleCompleteRecord}
                onAbort={backToRecordHome}
                onProgressChange={handleProgressChange}
                onOpenZaiyaDialog={onOpenZaiyaDialog}
              />
            )}
            {layer === "wizard" && type && typeId === "medication" && (
              <MedicationRecordWizard
                type={type}
                answers={wizardAnswers}
                setAnswers={setWizardAnswers}
                onSave={handleSave}
                onFinishRecord={handleCompleteRecord}
                onAbort={backToRecordHome}
                onProgressChange={handleProgressChange}
              />
            )}
            {layer === "wizard" && type && typeId === "food" && (
              <MealRecordWizard
                type={type}
                answers={wizardAnswers}
                setAnswers={setWizardAnswers}
                onSave={handleSave}
                onFinishRecord={handleCompleteRecord}
                onAbort={backToRecordHome}
                onProgressChange={handleProgressChange}
              />
            )}
            {layer === "wizard" && type && typeId === "sleep" && (
              <SleepRecordWizard
                type={type}
                answers={wizardAnswers}
                setAnswers={setWizardAnswers}
                onSave={handleSave}
                onFinishRecord={handleCompleteRecord}
                onAbort={backToRecordHome}
                onProgressChange={handleProgressChange}
              />
            )}
            {layer === "wizard" && type && typeId === "activity" && (
              <ActivityRecordWizard
                type={type}
                answers={wizardAnswers}
                setAnswers={setWizardAnswers}
                onSave={handleSave}
                onFinishRecord={handleCompleteRecord}
                onAbort={backToRecordHome}
                onProgressChange={handleProgressChange}
              />
            )}
            {layer === "wizard" && type && typeId === "weight" && (
              <WeightRecordWizard
                type={type}
                answers={wizardAnswers}
                setAnswers={setWizardAnswers}
                onSave={handleSave}
                onFinishRecord={handleCompleteRecord}
                onAbort={backToRecordHome}
                lastWeight={lastWeight}
                onProgressChange={handleProgressChange}
              />
            )}
            {layer === "wizard" &&
              type &&
              typeId !== "mood" &&
              typeId !== "medication" &&
              typeId !== "food" &&
              typeId !== "sleep" &&
              typeId !== "activity" &&
              typeId !== "weight" && (
                <RecordWizard
                  type={type}
                  answers={wizardAnswers}
                  setAnswers={setWizardAnswers}
                  onSave={handleSave}
                  onFinishRecord={handleCompleteRecord}
                  onAbort={backToRecordHome}
                  lastWeight={lastWeight}
                  onProgressChange={handleProgressChange}
                />
              )}
          </motion.div>
        </AnimatePresence>
      </div>

      <EnergyRewardFeedback
        event={activeEnergyReward}
        targetRef={energyButtonRef}
        onArrive={handleEnergyRewardArrive}
        onDone={handleEnergyRewardDone}
      />

      {/* 返回确认浮层：moodExit=有未保存内容时的三选一；safetyExit=安全承接页引导 */}
      <AnimatePresence>
        {dialogMode && (
          <>
            {/* 遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-30 bg-ink/25"
              onClick={() => setDialogMode(null)}
            />
            {/* 底部浮层 */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute inset-x-0 bottom-0 z-40 rounded-t-2xl bg-white px-5 pb-8 pt-5 shadow-[0_-8px_24px_rgba(39,51,31,0.08)]"
            >
              {dialogMode === "moodExit" ? (
                <>
                  <h3 className="text-center text-[16px] font-semibold tracking-tight text-ink">
                    这条记录还没有保存
                  </h3>
                  <p className="mt-2 text-center text-[13px] leading-relaxed text-ink-faint">
                    你可以继续记录，也可以先把已经记下的内容保存起来。
                  </p>
                  <div className="mt-5 flex flex-col gap-2.5">
                    {/* 主按钮：继续记录 */}
                    <button
                      onClick={() => setDialogMode(null)}
                      className="w-full rounded-xl bg-action-primary px-4 py-3 text-[14px] font-medium text-action-primary-text transition-opacity hover:opacity-90"
                    >
                      继续记录
                    </button>
                    {/* 次按钮：保存当前内容 */}
                    <button
                      onClick={handleSavePartial}
                      className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] font-medium text-ink transition-colors hover:border-ink-faint"
                    >
                      保存当前内容
                    </button>
                    {/* 弱按钮：不保存退出 */}
                    <button
                      onClick={handleDiscardAndGoHome}
                      className="w-full rounded-xl px-4 py-3 text-[13px] text-ink-faint transition-colors hover:text-ink"
                    >
                      不保存退出
                    </button>
                  </div>
                </>
              ) : dialogMode === "safetyExit" ? (
                <>
                  <h3 className="text-center text-[16px] font-semibold tracking-tight text-ink">
                    先找一个出口，好吗？
                  </h3>
                  <p className="mt-2 text-center text-[13px] leading-relaxed text-ink-faint">
                    你可以先跟 ZAIYA 说一句，或者联系一个现在能接住你的人。
                  </p>
                  <div className="mt-5 flex flex-col gap-2.5">
                    {/* 主按钮：去跟 ZAIYA 聊一聊 */}
                    <button
                      onClick={() => {
                        setDialogMode(null);
                        onOpenZaiyaDialog?.(SAFETY_DIALOG_STARTER);
                      }}
                      className="w-full rounded-xl bg-action-primary px-4 py-3 text-[14px] font-medium text-action-primary-text transition-opacity hover:opacity-90"
                    >
                      去跟 ZAIYA 聊一聊
                    </button>
                    {/* 次按钮：查看紧急联系人（关闭弹窗，留在安全承接页查看行动出口） */}
                    <button
                      onClick={() => setDialogMode(null)}
                      className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] font-medium text-ink transition-colors hover:border-ink-faint"
                    >
                      查看紧急联系人
                    </button>
                    {/* 弱按钮：取消（留在安全承接页） */}
                    <button
                      onClick={() => setDialogMode(null)}
                      className="w-full rounded-xl px-4 py-3 text-[13px] text-ink-faint transition-colors hover:text-ink"
                    >
                      取消
                    </button>
                  </div>
                </>
              ) : null}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* —— 第一层：recordHome ——
 * 在在 + 5 个记录类型入口 + 最近记录气泡（在在说出）。
 * 最近记录仅用于让用户感知"之前留下的内容还在"，不承担历史记录管理。
 * 无记录时不展示气泡，也不显示空状态。 */
function RecordHome({
  onPick,
  recordHistory = [],
  savedMessage,
}: {
  onPick: (id: RecordTypeId) => void;
  recordHistory?: RecordEntry[];
  savedMessage?: string | null;
}) {
  // 从 recordHistory 提取最近 1-3 条气泡摘要
  const bubbles = buildRecentBubbles(recordHistory);

  return (
    <div className="no-scrollbar flex h-full flex-col overflow-y-auto bg-white px-5 pb-8">
      {/* 在在 + 最近记录气泡 */}
      {bubbles.length > 0 ? (
        // 有记录：左右结构，在在在左，气泡在右
        <div className="flex items-start justify-center gap-3 py-4">
          <ZaizaiVideo className="h-20 w-20 shrink-0" />
          <RecentBubbles items={bubbles} />
        </div>
      ) : (
        // 无记录：居中显示在在
        <div className="flex justify-center py-4">
          <ZaizaiVideo className="h-28 w-28" />
        </div>
      )}

      <AnimatePresence>
        {savedMessage && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease }}
            className="mb-3 text-center text-[13px] font-medium text-ink-soft"
          >
            {savedMessage}
          </motion.p>
        )}
      </AnimatePresence>

      {/* 5 个记录类型入口 */}
      <div className="flex flex-col gap-2.5">
        {recordTypes.map((t) => (
          <button
            key={t.id}
            onClick={() => onPick(t.id)}
            className="flex w-full items-center gap-4 rounded-2xl border border-line bg-white px-5 py-4 transition-colors hover:border-ink-faint"
          >
            <t.Icon
              className="h-6 w-6 shrink-0 text-ink-soft"
              strokeWidth={1.8}
            />
            <span className="flex-1 text-left text-[15px] font-medium tracking-tight text-ink">
              {t.name}
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-ink-faint" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* —— 最近记录气泡轮播 ——
 * 在在说出的聊天气泡，偏方正、轻圆角、带小尾巴指向在在。
 * 自动轮播最近 1-3 条，5 秒切换，无控制点，不可手动切换。
 * 无记录时不渲染。 */
function RecentBubbles({ items }: { items: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  return (
    <div className="relative max-w-[220px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3, ease }}
        >
          {/* 气泡主体：偏方正、轻圆角 */}
          <div className="relative rounded-lg bg-surface-soft px-4 py-2.5">
            <p className="line-clamp-2 text-[12px] leading-relaxed text-ink-soft">
              {items[index]}
            </p>
            {/* 小尾巴：指向左侧的在在 */}
            <div className="absolute -left-1.5 top-3">
              <svg
                width="8"
                height="12"
                viewBox="0 0 8 12"
                fill="none"
                className="text-surface-soft"
              >
                <path d="M0 6L8 0v12L0 6z" fill="currentColor" />
              </svg>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* —— 从 recordHistory 提取最近记录气泡摘要 ——
 * 优先级：完整记录 > 基础记录。最多取 3 条。
 * 文案格式："昨天你留下过：xxx" / "前天你记到：xxx"
 * 无记录时返回空数组。 */
function buildRecentBubbles(history: RecordEntry[]): string[] {
  if (history.length === 0) return [];

  // 按时间倒序取最近 3 条
  const recent = history.slice(-3).reverse();

  // 中性保存反馈：不展示固定 mock 摘要，避免与实际保存内容不一致
  const fallbackSummary: Record<RecordTypeId, string> = {
    mood: "刚才这条情绪记录已保存",
    medication: "刚才这条服用记录已保存",
    food: "刚才这条饮食记录已保存",
    sleep: "刚才这条睡眠记录已保存",
    activity: "刚才这条活动记录已保存",
    weight: "刚才这条体重记录已保存",
  };

  return recent.map((entry) => {
    const summary = fallbackSummary[entry.type] ?? "刚才这条记录已保存";
    return `刚刚：${summary}`;
  });
}

/* —— 第二层：RecordWizard ——
 * 单页单项（结构化选项为主路径，自由输入为补充路径）。
 *   - 顶部：进度条
 *   - 中部：在在 + 当前项文案 + 纵向选项卡（仅预设选项）
 *   - 选项卡下方弱入口：「没有合适的，自己写一句」（点击后才展开输入框）
 *   - 自由输入内容卡（可右滑露出 修改/删除）
 *   - 最后一项（补一句）只展示轻输入框，可不填完成
 *
 * 自动推进：单选项点击后停留 400ms 再进入下一项；自由输入发送后同样停留 400ms。
 * 不设置"下一步"按钮。返回上一项通过右滑完成，已选状态/内容卡保留。
 *
 * answers 由父组件 RecordFlow 持有（上提），用于顶部「先记到这儿」入口判断。
 *
 * 答案状态结构：answers[field] = { type: "option" | "custom"; value; label? }
 *   - option: 选择预设选项 → 对应选项卡高亮（持久，回看仍高亮）
 *   - custom: 自由输入 → 以「自定义内容卡」卡片化展示，支持右滑露出 修改/删除
 *
 * 修改：内容回填输入框（editingCustom 态），发送后覆盖原 custom 答案。
 * 删除：二次确认 → 清空当前 field 答案 → 恢复待选状态，不自动进入下一项。
 *
 * 语音 / 图片 icon 仅作辅助样式，不接真实能力。 */
function RecordWizard({
  type,
  answers,
  setAnswers,
  onSave,
  onFinishRecord,
  onAbort,
  lastWeight,
  onProgressChange,
}: {
  type: RecordType;
  answers: Answers;
  setAnswers: Dispatch<SetStateAction<Answers>>;
  onSave: (answers: Answers) => void;
  /** 确认页「完成记录」：保存+发能量，原地切 success 态，不回首页 */
  onFinishRecord: (answers: Answers) => void;
  onAbort: () => void;
  /** 上一次体重记录值（用于体重页默认填入 + 步进调节） */
  lastWeight: number | null;
  /** 上报进度给父组件，用于顶部入口与返回确认分支 */
  onProgressChange?: (progress: {
    hasCompletedFirstStep: boolean;
    isFullRecordReady: boolean;
    isSafetyPhase: boolean;
  }) => void;
}) {
  const initialStep = type.steps[0];
  const [stepStack, setStepStack] = useState<Step[]>([initialStep]);

  const current = stepStack[stepStack.length - 1];
  const stepIndex = stepStack.length - 1;
  const totalSteps = type.steps.length;

  // 输入框文本
  const [inputText, setInputText] = useState("");
  // 当前项是否展开了自由输入（非最后一项需手动展开；最后一项默认展开）
  const [customOpen, setCustomOpen] = useState(false);
  // 编辑态：修改已有 custom 答案
  const [editingCustom, setEditingCustom] = useState(false);
  // 删除二次确认
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  // 当前展开右滑操作的 stepId（同时只允许一张卡展开）
  const [revealedStepId, setRevealedStepId] = useState<string | null>(null);
  // 自动推进锁：延迟期间禁用选项点击，防止重复触发
  const [advancing, setAdvancing] = useState(false);
  // 数字输入值（number 类型 step 专用）
  const [numberValue, setNumberValue] = useState("");
  // 体重页：点击数字进入手动编辑模式
  const [editingWeight, setEditingWeight] = useState(false);
  // 体重页：有历史记录时自动填入上一次体重作为默认值
  useEffect(() => {
    if (type.id === "weight" && lastWeight !== null) {
      setNumberValue(lastWeight.toFixed(1));
      setEditingWeight(false);
    }
  }, [type.id, lastWeight]);

  const WEIGHT_STEP = 0.1;
  const WEIGHT_MIN = 20;
  const WEIGHT_MAX = 200;

  const stepWeight = (delta: number) => {
    const n = parseFloat(numberValue) || 0;
    const next = Math.round((n + delta) * 10) / 10;
    if (next < WEIGHT_MIN || next > WEIGHT_MAX) return;
    setNumberValue(next.toFixed(1));
    setInputText(next.toFixed(1));
  };
  // 多选项的本地选中值（仅 multi step 使用；切步时由 useEffect 重置）
  const [multiSelected, setMultiSelected] = useState<string[]>([]);

  const currentAnswer: AnswerEntry | undefined = answers[current.field];
  // 自由输入写入的目标字段：multi + customField 时为独立补充字段（如情绪原因的 customReason），
  // 不替代多选值；其余情况覆盖当前 field
  const customTargetField = current.customField ?? current.field;
  const customAnswerEntry = answers[customTargetField];

  // 当前 step 的选项（动态选项优先，回退静态 options）
  const stepOptions: StepOption[] = resolveStepOptions(current, answers);
  const isMulti = current.multi === true;
  // 是否允许自由输入：单选默认允许（allowCustom !== false）；多选需显式 allowCustom === true
  const customAllowed = isMulti
    ? current.allowCustom === true
    : current.allowCustom !== false;

  const writeAnswer = (field: string, entry: AnswerEntry) => {
    setAnswers((prev) => ({ ...prev, [field]: entry }));
  };
  const clearAnswer = (field: string) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // 选择普通选项 → 记录 + 停留 400ms + 自动进入下一项
  const selectOption = (value: string, label: string) => {
    if (advancing) return;
    writeAnswer(current.field, { type: "option", value, label });
    setRevealedStepId(null);
    setAdvancing(true);
    window.setTimeout(() => {
      goNext(value);
      setAdvancing(false);
    }, 400);
  };

  // 多选 toggle：点击切换选中，不自动推进
  const toggleMulti = (value: string) => {
    if (advancing) return;
    setMultiSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  // 多选确认：拼接 value（|）与 label（、）写入答案 + 停留 400ms + 进入下一项
  const confirmMulti = () => {
    if (advancing || multiSelected.length === 0) return;
    const labels = multiSelected
      .map((v) => stepOptions.find((o) => o.value === v)?.label ?? v)
      .join("、");
    const value = multiSelected.join("|");
    writeAnswer(current.field, { type: "option", value, label: labels });
    setRevealedStepId(null);
    setAdvancing(true);
    window.setTimeout(() => {
      goNext(value);
      setAdvancing(false);
    }, 400);
  };

  // 自由输入发送 → 写入 custom 答案 + 停留 400ms + 自动进入下一项
  // 最后一项（补一句）：发送后直接完成，不延迟
  // multi + customField：自由输入作为补充说明，写入独立字段，不替代多选值，也不自动推进
  const sendInput = () => {
    const text = inputText.trim();
    if (!text || advancing) return;
    writeAnswer(customTargetField, { type: "custom", value: text });
    setInputText("");
    setEditingCustom(false);
    setRevealedStepId(null);
    if (current.isLast) {
      onSave({ ...answers, [customTargetField]: { type: "custom", value: text } });
      return;
    }
    // multi + customField：补充说明，不替代多选值，也不自动推进
    if (isMulti && current.customField) {
      setCustomOpen(false);
      return;
    }
    setAdvancing(true);
    window.setTimeout(() => {
      goNext(CUSTOM_INPUT_VALUE);
      setAdvancing(false);
    }, 400);
  };

  const goNext = (selectedValue: string) => {
    const next = getNextStep(current, selectedValue, type.steps);
    if (!next) {
      onSave(answers);
      return;
    }
    setStepStack((s) => [...s, next]);
    setInputText("");
    setCustomOpen(false);
    setEditingCustom(false);
    setRevealedStepId(null);
  };

  // 返回上一项（不清空答案）
  const goPrev = useCallback(() => {
    if (stepStack.length > 1) {
      setStepStack((s) => s.slice(0, -1));
      setInputText("");
      setCustomOpen(false);
      setEditingCustom(false);
      setRevealedStepId(null);
    }
  }, [stepStack.length]);

  // 展开自由输入
  const openCustom = () => setCustomOpen(true);
  // 取消自由输入（收起输入框，清空当前输入但不影响已保存的 custom 答案）
  const cancelCustom = () => {
    setCustomOpen(false);
    setInputText("");
    setEditingCustom(false);
  };

  // 修改 custom 答案：内容回填输入框 + 进入 editingCustom + 展开输入框
  const startEditCustom = () => {
    if (customAnswerEntry?.type !== "custom") return;
    setInputText(customAnswerEntry.value);
    setEditingCustom(true);
    setCustomOpen(true);
    setRevealedStepId(null);
  };

  // 确认删除 custom 答案
  const confirmDelete = () => {
    clearAnswer(customTargetField);
    setInputText("");
    setEditingCustom(false);
    setCustomOpen(false);
    setDeleteConfirmOpen(false);
    setRevealedStepId(null);
  };

  // 最后一项完成（补一句）：空输入也允许完成
  const finishLast = () => {
    // number 类型：使用 numberValue
    if (isNumber && numberValue.trim()) {
      const finalAnswers = {
        ...answers,
        [current.field]: { type: "custom" as const, value: numberValue.trim() },
      };
      setAnswers(finalAnswers);
      const next = getNextStep(current, numberValue.trim(), type.steps);
      if (next) {
        setStepStack((s) => [...s, next]);
        setInputText("");
        setNumberValue("");
        setCustomOpen(false);
        setEditingCustom(false);
        setRevealedStepId(null);
        return;
      }
      onSave(finalAnswers);
      return;
    }
    const text = inputText.trim();
    const finalAnswers = text
      ? { ...answers, [current.field]: { type: "custom" as const, value: text } }
      : answers;
    onSave(finalAnswers);
  };

  const isLast = current.isLast;
  const isSegmented = current.inputType === "segmented";
  const isNumber = current.inputType === "number";
  const hasCustom = customAnswerEntry?.type === "custom";
  const weightPreviewKg =
    type.id === "weight" && isNumber ? parseWeightKg(numberValue) : null;
  const bmiPreview =
    weightPreviewKg !== null ? calculateBMI(weightPreviewKg, getUserProfile().heightCm) : null;
  const bmiPreviewInfo =
    bmiPreview !== null ? getBmiStatus(bmiPreview) : null;

  // 输入框是否展示：最后一项默认展示（number 类型除外，它有自己的保存按钮）；其他项点击弱入口后展开
  const showInputBox = (isLast && !isNumber) || customOpen;
  // 是否已达到完整记录标准（最后一项时用于判断是否进入记录确认页）
  const isCompleteRecord = isCompleteCoreRecord(type.id, answers);
  // 最后一项且达到完整记录标准 → 进入记录确认页（不再作为必答题）
  const showConfirmPage = isLast && isCompleteRecord;

  // 上报进度给父组件 RecordFlow：
  //   hasCompletedFirstStep = stepStack.length > 1（已进入第二项及以后）
  //   isFullRecordReady = showConfirmPage（已进入完整记录确认页）
  // 父组件据此决定顶部右上角入口（能量 / 先记到这儿 / 空置）与返回确认浮层模式（二选一 / 三选一）
  useEffect(() => {
    onProgressChange?.({
      hasCompletedFirstStep: stepStack.length > 1,
      isFullRecordReady: showConfirmPage,
      isSafetyPhase: false,
    });
  }, [stepStack.length, showConfirmPage, onProgressChange]);

  // —— 右滑返回上一项（pointer 事件，支持鼠标拖拽 + 触控） ——
  // 触发区域：仅主体内容区（问题 + 选项卡 / 内容卡），排除输入框、语音条、顶部操作区、删除确认等
  // 拖动反馈：主体内容轻微右移 translateX(clamp(dx, 0, 80))；松手未触发回弹到 0
  const [dragX, setDragX] = useState(0);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const pointerActive = useRef(false);

  // 检查 pointerdown 目标是否在排除区域内（输入框、语音条、操作按钮、删除确认等）
  const isExcludedTarget = (target: EventTarget | null): boolean => {
    if (!(target instanceof Element)) return false;
    // 排除：input / textarea / button（选项卡、弱入口、×、语音、发送、修改/删除等）
    // 选项卡本身是 button，但选项卡的右滑不应触发返回 —— 排除所有 button
    // 自定义内容卡的右滑修改/删除也通过 button 触发，排除
    if (target.closest("input, textarea, button, [data-no-swipe]")) return true;
    return false;
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    if (showConfirmPage) return; // 确认页不启用右滑
    if (isExcludedTarget(e.target)) return;
    if (stepStack.length <= 1) return; // 第一项不启用
    pointerStart.current = { x: e.clientX, y: e.clientY };
    pointerActive.current = true;
    // 捕获指针，确保 pointerup 能收到
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!pointerActive.current || !pointerStart.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    // 仅向右拖动才位移，向左忽略
    if (dx <= 0) {
      setDragX(0);
      return;
    }
    // 横向为主时才跟随，避免拦截纵向滚动
    if (dx > Math.abs(dy) * 1.2) {
      setDragX(Math.min(dx, 80));
    }
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (!pointerActive.current || !pointerStart.current) {
      pointerActive.current = false;
      pointerStart.current = null;
      return;
    }
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    pointerStart.current = null;
    pointerActive.current = false;
    setDragX(0); // 回弹
    // 阈值：dx > 60 且横向明显大于纵向
    if (dx > 60 && dx > Math.abs(dy) * 1.5 && stepStack.length > 1) {
      goPrev();
    }
  };

  // ArrowLeft 键盘兜底（隐藏调试用，不在 UI 展示）
  useEffect(() => {
    if (showConfirmPage) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft") return;
      // 聚焦在 input/textarea 时不触发
      const ae = document.activeElement;
      if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA")) return;
      goPrev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goPrev, showConfirmPage]);

  // 多选项切步时：从已存答案回填 multiSelected（支持右滑返回保留选中）
  useEffect(() => {
    if (!isMulti) {
      setMultiSelected([]);
      return;
    }
    const a = answers[current.field];
    setMultiSelected(
      a?.type === "option" && a.value ? a.value.split("|").filter(Boolean) : [],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.id, isMulti]);

  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* 在在（较小） */}
      <div className="flex justify-center bg-white py-2">
        <ZaizaiVideo className="h-20 w-20" />
      </div>

      {/* 顶部进度条（轻量，不显示数字/百分比文案，仅细线） */}
      <div className="bg-white px-5 pb-3">
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-line-soft">
            <motion.div
              className="h-full rounded-full bg-ink"
              initial={false}
              animate={{
                width: `${((stepIndex + 1) / totalSteps) * 100}%`,
              }}
              transition={{ duration: 0.3, ease }}
            />
          </div>
        </div>

      {/* —— 记录确认页（isLast 且达到完整记录标准） —— */}
      {showConfirmPage ? (
        <RecordConfirmPage
          type={type}
          answers={answers}
          setAnswers={setAnswers}
          onFinishRecord={onFinishRecord}
          onBackHome={onAbort}
          onAbort={onAbort}
        />
      ) : (
        <>
          {/* 当前问题 + 选项卡（单页单项，可滚动）
              右滑返回上一项的触发区域：仅此主体内容区。
              排除区域（input/textarea/button/[data-no-swipe]）在 isExcludedTarget 中过滤。 */}
          <div
            className="no-scrollbar flex flex-1 flex-col overflow-y-auto bg-white px-5"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, x: dragX }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease }}
                style={{ x: dragX }}
                className="flex flex-1 flex-col"
              >
                <p className="pt-3 text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                  {current.question}
                </p>

                {/* 数字输入（number 项） */}
                {isNumber && (
                  <>
                    {type.id === "weight" && lastWeight !== null && !editingWeight ? (
                      /* —— 体重调节器：有历史记录时显示 + 0.1 KG / 当前体重 / - 0.1 KG —— */
                      <div className="mt-9 flex flex-col items-center">
                        {/* 上按钮：+ 0.1 KG（轻量胶囊） */}
                        <button
                          onClick={() => stepWeight(WEIGHT_STEP)}
                          className="flex h-8 min-w-[92px] items-center justify-center rounded-full border border-action-primary/45 bg-action-soft px-[14px] text-[13px] font-medium text-ink/[0.72] transition-transform active:scale-[0.96] active:bg-action-primary/20"
                        >
                          + {WEIGHT_STEP.toFixed(1)} KG
                        </button>
                        {/* 中间体重数字：可点击进入手动编辑 */}
                        <button
                          onClick={() => setEditingWeight(true)}
                          className="my-[10px] flex items-baseline justify-center"
                        >
                          <span className="text-[34px] font-[650] leading-[42px] tracking-tight text-ink">
                            {numberValue || "—"}
                          </span>
                          <span className="ml-1 text-[13px] font-medium text-ink/[0.58]">
                            KG
                          </span>
                        </button>
                        {/* 下按钮：- 0.1 KG（轻量胶囊） */}
                        <button
                          onClick={() => stepWeight(-WEIGHT_STEP)}
                          className="flex h-8 min-w-[92px] items-center justify-center rounded-full border border-action-primary/45 bg-action-soft px-[14px] text-[13px] font-medium text-ink/[0.72] transition-transform active:scale-[0.96] active:bg-action-primary/20"
                        >
                          - {WEIGHT_STEP.toFixed(1)} KG
                        </button>
                      </div>
                    ) : (
                      /* —— 手动输入：无历史记录 / 点击数字进入编辑 —— */
                      <div className="mt-9 flex flex-col items-center">
                        <div className="relative h-14 w-full max-w-[220px] rounded-xl border border-line bg-white shadow-[0_8px_24px_-20px_rgba(39,51,31,0.25)]">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={numberValue}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v === "" || /^\d*\.?\d{0,1}$/.test(v)) {
                                setNumberValue(v);
                                setInputText(v);
                              }
                            }}
                            onBlur={() => {
                              // 失焦校验：空值/无效 → 有历史则回退，无历史则留空；
                              // 范围 20–200 → 钳制；保留一位小数
                              const n = parseFloat(numberValue);
                              if (!Number.isFinite(n)) {
                                if (lastWeight !== null) {
                                  const fallback = lastWeight.toFixed(1);
                                  setNumberValue(fallback);
                                  setInputText(fallback);
                                }
                              } else {
                                const clamped = Math.min(
                                  WEIGHT_MAX,
                                  Math.max(WEIGHT_MIN, n),
                                );
                                const rounded = Math.round(clamped * 10) / 10;
                                const formatted = rounded.toFixed(1);
                                setNumberValue(formatted);
                                setInputText(formatted);
                              }
                              setEditingWeight(false);
                            }}
                            placeholder="如：51.5"
                            className="h-full w-full bg-transparent pl-12 pr-12 text-center text-[20px] font-medium tracking-normal text-ink outline-none placeholder:text-[15px] placeholder:text-ink-faint/35"
                          />
                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-medium text-ink-faint">
                            KG
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 辅助信息区：上次记录（仅调节器态）+ BMI（两态都有）；弱辅助，无卡片无边框 */}
                    <div className="mt-[18px] flex flex-col items-center gap-[2px]">
                      {type.id === "weight" &&
                        lastWeight !== null &&
                        !editingWeight && (
                          <p className="text-[12px] leading-[20px] text-ink/[0.48]">
                            上次记录：{lastWeight.toFixed(1)} KG
                          </p>
                        )}
                      {bmiPreview !== null &&
                        bmiPreviewInfo &&
                        getUserProfile().heightCm && (
                          <p className="text-[12px] leading-[20px] text-ink/[0.48]">
                            <span>BMI {bmiPreview}</span>
                            <span className="mx-1">·</span>
                            <span>{bmiPreviewInfo.label}</span>
                            <span className="mx-1">·</span>
                            <span>身高 {getUserProfile().heightCm}cm</span>
                          </p>
                        )}
                    </div>
                  </>
                )}

                {/* 纵向选项卡列表（segmented 项：结构化选项 + 自定义选项卡同层级） */}
                {isSegmented && (
                  <div className="mt-5 flex flex-col gap-2.5">
                    {stepOptions.map((opt) => {
                      const active = isMulti
                        ? multiSelected.includes(opt.value)
                        : currentAnswer?.type === "option" &&
                          currentAnswer.value === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() =>
                            isMulti
                              ? toggleMulti(opt.value)
                              : selectOption(opt.value, opt.label)
                          }
                          disabled={advancing}
                          className={`flex h-14 items-center gap-3 rounded-2xl border px-5 text-left transition-colors ${
                            active
                              ? "border-ink bg-ink text-canvas"
                              : "border-line bg-white text-ink hover:border-ink-faint"
                          } ${advancing ? "opacity-60" : ""}`}
                        >
                          {/* 左侧指示符 */}
                          {isMulti ? (
                            // 多选：方框 + 选中打勾
                            <span
                              className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border ${
                                active ? "border-canvas bg-canvas" : "border-ink-faint"
                              }`}
                            >
                              {active && (
                                <Check className="h-3 w-3 text-ink" strokeWidth={2.4} />
                              )}
                            </span>
                          ) : current.moonPhase ? (
                            // 月相图标（intensity 步，与 LookbackPage MoodBead 同步）
                            <MoonPhaseIcon level={intensityValueToLevel[opt.value] ?? 3} />
                          ) : (
                            // 默认点状符号
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${
                                active ? "bg-white" : "bg-ink-faint"
                              }`}
                            />
                          )}
                          <span className="flex-1 text-[15px] font-medium tracking-tight">
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}

                    {/* 自定义选项卡 + 弱入口
                        单选：allowCustom !== false（默认允许，结构化字段显式 false）
                        多选：allowCustom === true 且指定 customField（如情绪原因补充，不替代多选值） */}
                    {customAllowed && (
                      <>
                        {/* 自定义选项卡：与结构化选项同层级，selected 态，右滑露出 修改/删除 */}
                        {hasCustom && (
                          <CustomAnswerCard
                            text={customAnswerEntry.value}
                            stepId={current.id}
                            revealedStepId={revealedStepId}
                            setRevealedStepId={setRevealedStepId}
                            onEdit={startEditCustom}
                            onDelete={() => setDeleteConfirmOpen(true)}
                          />
                        )}

                        {/* 弱入口：没有合适的？自己写一句
                            仅无 custom answer 且未展开输入框时显示 */}
                        {!hasCustom && !showInputBox && (
                          <button
                            onClick={openCustom}
                            className="mt-2 self-center rounded-full border border-line bg-surface-soft px-4 py-1.5 text-[12px] text-ink-faint transition-colors hover:border-ink-faint hover:text-ink-soft"
                          >
                            没有合适的？自己写一句
                          </button>
                        )}
                      </>
                    )}

                    {/* 多选确认按钮：选中至少 1 项后可继续 */}
                    {isMulti && (
                      <button
                        onClick={confirmMulti}
                        disabled={advancing || multiSelected.length === 0}
                        className={`mt-3 h-12 rounded-2xl px-4 text-[14px] font-medium transition-opacity ${
                          multiSelected.length === 0 || advancing
                            ? "bg-surface-muted text-ink-faint"
                            : "bg-action-primary text-action-primary-text hover:opacity-90"
                        }`}
                      >
                        {multiSelected.length === 0 ? "选择原因后继续" : "下一步"}
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 底部固定保存按钮：仅 number 项（体重），水平居中，贴底
              与主体可滚动区分离，避免与辅助信息挤在一起 */}
          {isNumber && (
            <div className="flex justify-center bg-white px-5 pb-8 pt-3">
              <button
                onClick={finishLast}
                disabled={!numberValue.trim()}
                className={`h-12 w-full max-w-[220px] rounded-xl px-4 text-[14px] font-medium transition-opacity ${
                  numberValue.trim()
                    ? "bg-action-primary text-action-primary-text hover:opacity-90"
                    : "bg-surface-muted text-ink-faint"
                }`}
              >
                保存
              </button>
            </div>
          )}

          {/* 编辑态轻提示 */}
          {editingCustom && (
            <p className="px-5 pb-1 text-center text-[11px] text-ink-faint">
              正在修改这条输入
            </p>
          )}

          {/* 底部自由输入框：最后一项默认展示；其他项点击弱入口后展开。
              展开态通过输入框左侧 × 收起（非最后一项）。语音状态机内置，原地切换不跳页。 */}
          {showInputBox && (
            <div className="px-5 pb-6">
              <FreeInputBox
                value={inputText}
                onChange={setInputText}
                onConfirm={isLast ? finishLast : sendInput}
                onCollapse={cancelCustom}
                isLast={isLast}
                placeholder={
                  isLast
                    ? "写在这里…"
                    : editingCustom
                      ? "修改这条输入…"
                      : "自己写一句…"
                }
                confirmLabel={isLast ? "完成" : editingCustom ? "保存" : "发送"}
              />
            </div>
          )}
        </>
      )}

      {/* 删除二次确认 */}
      <AnimatePresence>
        {deleteConfirmOpen && (
          <DeleteConfirm
            onCancel={() => setDeleteConfirmOpen(false)}
            onConfirm={confirmDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* —— 自定义内容卡（右滑露出 修改/删除） ——
 * 卡片样式接近选项卡，但带「自由」标识。
 * 右滑（drag right）露出左侧的 修改/删除 操作。 */
function CustomAnswerCard({
  text,
  stepId,
  revealedStepId,
  setRevealedStepId,
  onEdit,
  onDelete,
}: {
  text: string;
  stepId: string;
  revealedStepId: string | null;
  setRevealedStepId: (id: string | null) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const revealed = revealedStepId === stepId;
  const ACTION_WIDTH = 144; // 两个 72px 操作

  return (
    <div className="relative overflow-hidden">
      {/* 操作区（右侧，左滑后露出） */}
      <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-1">
        <button
          onClick={onEdit}
          aria-label="修改"
          className="grid h-14 w-[70px] place-items-center rounded-2xl bg-surface-soft text-ink-soft transition-colors hover:text-ink"
        >
          <Pencil className="h-4 w-4" strokeWidth={1.8} />
        </button>
        <button
          onClick={onDelete}
          aria-label="删除"
          className="grid h-14 w-[70px] place-items-center rounded-2xl bg-ink/10 text-ink-soft transition-colors hover:text-ink"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>

      {/* 可拖动卡片：左滑露出右侧操作区 */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -ACTION_WIDTH, right: 0 }}
        dragElastic={0.08}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) setRevealedStepId(stepId);
          else setRevealedStepId(null);
        }}
        animate={{ x: revealed ? -ACTION_WIDTH : 0 }}
        transition={{ duration: 0.25, ease }}
        className="relative flex h-14 items-center gap-3 rounded-2xl border border-ink bg-ink px-5 text-canvas"
      >
        <span className="h-2 w-2 shrink-0 rounded-full bg-white" />
        <span className="line-clamp-1 flex-1 text-[15px] font-medium tracking-tight">
          {text}
        </span>
        <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-canvas/80">
          自由
        </span>
      </motion.div>
    </div>
  );
}

/* —— 删除二次确认（轻量 modal） —— */
function DeleteConfirm({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center bg-ink/30 px-8 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease }}
        className="w-full max-w-[260px] rounded-2xl bg-white p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-[14px] font-medium text-ink">
          确认删除这条输入吗？
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-line bg-white px-4 py-2.5 text-[13px] font-medium text-ink"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-ink px-4 py-2.5 text-[13px] font-medium text-canvas"
          >
            删除
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* —— 自由输入框（复用通用 VoiceInputBar） ——
 * 封装 RecordFlow 特有逻辑：isLast 控制 × 显示与空发送。
 * 语音状态机、录制态视觉、转录态、mock 结果均由 VoiceInputBar 统一处理。
 * 不调用真实麦克风 / 语音识别 API；不跳页、不弹窗。
 * 最后一项为「完成」按钮，允许空输入完成。 */
function FreeInputBox({
  value,
  onChange,
  onConfirm,
  onCollapse,
  isLast,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  /** × 收起自由输入（仅非最后一项调用） */
  onCollapse: () => void;
  isLast: boolean;
  placeholder?: string;
  confirmLabel?: string;
}) {
  // 发送按钮置灰/高亮：最后一项始终可点（允许空完成）；其他项需有内容
  const canSend = isLast || value.trim().length > 0;

  return (
    <VoiceInputBar
      value={value}
      onChange={onChange}
      onSend={onConfirm}
      canSend={canSend}
      onCancel={isLast ? undefined : onCollapse}
      placeholder={placeholder}
    />
  );
}

/* —— 记录确认页（最后一项 + 已达到完整记录标准） ——
 * 不再作为必答题，而是确认页 + 可选补充：
 *   - 主标题：这条记录已经完整了
 *   - 摘要卡：汇总本次已填写字段（动态生成）
 *     · 右上角弱入口「修改」：点击进入 editable 态，字段可点击
 *     · 右上角「更多」菜单：放置「删除这条记录」
 *     · editable 态下点击字段 → 底部浮层修改该字段（不回原 wizard 流程）
 *   - 可选补充区：想补一句也可以。+ 轻量输入框（文本 + 语音 mock）
 *   - 底部主按钮：完成记录（始终可点，未补充不影响完整记录状态）
 *
 * 修改：直接写回 answers（父级 setAnswers），摘要卡即时更新；底部主按钮仍只有「完成记录」。
 * 删除：二次确认 → 丢弃草稿 → onAbort 返回 recordHome，不进入完成页 / 不触发能量。
 *
 * 点击「完成记录」→ onComplete(finalAnswers) → handleSave 判断 isComplete → 保存并回到 recordHome
 * 补充内容写入最后一项的 field（note），不影响 isCompleteCoreRecord 判断。 */
function RecordConfirmPage({
  type,
  answers,
  setAnswers,
  onFinishRecord,
  onBackHome,
  onAbort,
}: {
  type: RecordType;
  answers: Answers;
  setAnswers: Dispatch<SetStateAction<Answers>>;
  /** 点击「完成记录」：保存记录 + 发放能量，原地切换 completion 流程，不回首页 */
  onFinishRecord: (answers: Answers) => void;
  /** 完成流程后「回到记一下」：返回记一下入口页 */
  onBackHome: () => void;
  /** 删除流程：丢弃草稿返回 recordHome */
  onAbort: () => void;
}) {
  // 补充说明输入框文本（仅用于输入态；发送后写入 answers[lastStep.field] 并清空）
  const [supplement, setSupplement] = useState("");
  // 是否正在编辑补充说明（点击「修改补充」后展开输入框）
  const [editingSupplement, setEditingSupplement] = useState(false);
  // 完成反馈流程：confirm → done；奖励反馈由父级 EnergyRewardFeedback 统一承载
  const [completionPhase, setCompletionPhase] = useState<
    "confirm" | "done"
  >("confirm");

  // 修改 / 删除相关状态
  const [editing, setEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // 最后一步（isLast）的 field，补充说明写入此字段
  const lastStep = type.steps[type.steps.length - 1];
  // 当前已保存的补充说明（从 answers 派生）
  const savedNote =
    answers[lastStep.field]?.type === "custom"
      ? answers[lastStep.field]!.value
      : "";

  // 发送补充说明：仅写入 answers 草稿，不触发完成记录、不发能量、不切流程
  const handleSaveSupplement = () => {
    const text = supplement.trim();
    if (!text) return;
    setAnswers((prev) => ({
      ...prev,
      [lastStep.field]: { type: "custom" as const, value: text },
    }));
    setSupplement("");
    setEditingSupplement(false);
  };

  // 点击「修改补充」：回填已保存的补充说明到输入框，展开编辑态
  const handleEditSupplement = () => {
    setSupplement(savedNote);
    setEditingSupplement(true);
  };

  // 完成记录：保存（含补充说明）+ 发放奖励 + 进入完成态
  // 补充说明已由 handleSaveSupplement 写入 answers，这里直接用当前 answers
  const handleComplete = () => {
    onFinishRecord(answers);
    setCompletionPhase("done");
  };

  // 摘要卡：从 steps 中提取已填写的非 isLast 字段，附带 step 引用以读取 options
  const labels = summaryLabels[type.id] ?? {};
  const summaryItems = type.steps
    .filter((s) => !s.isLast && answers[s.field])
    .map((s) => ({
      field: s.field,
      step: s,
      label: labels[s.field] ?? s.question,
      value: answers[s.field]!.label || answers[s.field]!.value,
      answer: answers[s.field]!,
      // 动态选项解析（如情绪原因词依据情绪状态变化）+ 多选标记
      options: resolveStepOptions(s, answers),
      multi: s.multi === true,
    }));
  // 自由输入补充说明（multi + customField，如情绪原因的 customReason）：只读展示，不参与编辑
  const customSupplements = type.steps
    .filter(
      (s) => s.customField && answers[s.customField]?.type === "custom",
    )
    .map((s) => ({
      field: s.customField!,
      value: answers[s.customField!]!.value,
    }));
  const weightSummaryKg =
    type.id === "weight" ? parseWeightKg(answers.weightValue?.value) : null;
  const bmiSummary =
    weightSummaryKg !== null ? calculateBMI(weightSummaryKg, getUserProfile().heightCm) : null;
  const bmiSummaryInfo =
    bmiSummary !== null ? getBmiStatus(bmiSummary) : null;

  // 当前编辑的字段对象
  const currentEdit = editingField
    ? summaryItems.find((it) => it.field === editingField) ?? null
    : null;

  // 选择选项 → 立即写回 answers + 关闭浮层
  const pickOption = (field: string, value: string, label: string) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: { type: "option", value, label },
    }));
    setEditingField(null);
  };

  // 保存自定义文本 → 立即写回 answers + 关闭浮层
  const saveCustom = (field: string, text: string) => {
    if (!text.trim()) return;
    setAnswers((prev) => ({
      ...prev,
      [field]: { type: "custom", value: text.trim() },
    }));
    setEditingField(null);
  };

  // 删除流程：更多菜单 → 二次确认 → 丢弃草稿返回 recordHome
  const openDeleteConfirm = () => {
    setMoreMenuOpen(false);
    setDeleteConfirmOpen(true);
  };
  const confirmDelete = () => {
    setDeleteConfirmOpen(false);
    setEditing(false);
    onAbort();
  };

  const timeStr = "刚刚";

  // —— 完成态：底部按钮切换为「回到记一下」——
  if (completionPhase !== "confirm") {
    return (
      <div className="no-scrollbar relative flex flex-1 flex-col overflow-y-auto bg-white px-5">
        {/* 主标题 */}
        <h2 className="pt-4 text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
          这条记录已经完整了
        </h2>

        {/* 摘要卡 */}
        <div className="mt-4 rounded-2xl border border-line bg-white px-5 py-4">
          <div className="text-[11px] uppercase tracking-[0.16em] text-ink-faint">
            已记录
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            {summaryItems.map((item) => (
              <div
                key={item.field}
                className="flex gap-2 text-[13px] leading-relaxed"
              >
                <span className="shrink-0 text-ink-faint">{item.label}：</span>
                <span className="text-ink">
                  {item.value}{item.field === "weightValue" ? " KG" : ""}
                </span>
              </div>
            ))}
            {customSupplements.map((it) => (
              <div
                key={it.field}
                className="flex gap-2 text-[13px] leading-relaxed"
              >
                <span className="shrink-0 text-ink-faint">补充：</span>
                <span className="text-ink">{it.value}</span>
              </div>
            ))}
            {savedNote && (
              <div className="flex gap-2 text-[13px] leading-relaxed">
                <span className="shrink-0 text-ink-faint">补充：</span>
                <span className="text-ink">{savedNote}</span>
              </div>
            )}
            {bmiSummary !== null && bmiSummaryInfo && getUserProfile().heightCm && (
              <div className="flex gap-2 text-[13px] leading-relaxed">
                <span className="shrink-0 text-ink-faint">BMI：</span>
                <span className="text-ink">{bmiSummary} {bmiSummaryInfo.label}</span>
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
          <button
            onClick={onBackHome}
            className="w-full rounded-xl bg-action-primary px-4 py-3 text-[14px] font-medium text-action-primary-text transition-opacity hover:opacity-90"
          >
            回到记一下
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto bg-white px-5">
      {/* 主标题 */}
      <h2 className="pt-4 text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
        这条记录已经完整了
      </h2>

      {/* 摘要卡 */}
      <div className="mt-4 rounded-2xl border border-line bg-white px-5 py-4">
        {/* 头部：标题 + 右上角操作（默认仅「…」，编辑态显示「取消」） */}
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.16em] text-ink-faint">
            已记录
          </div>
          <div className="relative">
            {editing ? (
              <button
                onClick={() => setEditing(false)}
                className="text-[12px] font-medium text-ink underline underline-offset-4 transition-colors hover:text-ink-soft"
              >
                取消
              </button>
            ) : (
              <>
                <button
                  onClick={() => setMoreMenuOpen((v) => !v)}
                  aria-label="更多"
                  className="grid h-7 w-7 place-items-center rounded-full text-ink-faint transition-colors hover:bg-surface-soft hover:text-ink"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {/* 轻量菜单：修改 / 删除这条记录（不在摘要卡显性展示） */}
                <AnimatePresence>
                  {moreMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMoreMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.18, ease }}
                        className="absolute right-0 top-8 z-20 w-fit min-w-[96px] max-w-[160px] rounded-lg border border-line bg-white p-2.5 shadow-sm"
                      >
                        <button
                          onClick={() => {
                            setMoreMenuOpen(false);
                            setEditing(true);
                          }}
                          className="flex w-full items-center gap-2 px-2 py-3 text-left text-[13px] text-ink-soft transition-colors hover:bg-surface-soft"
                        >
                          <Pencil className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                          修改
                        </button>
                        <button
                          onClick={openDeleteConfirm}
                          className="flex w-full items-center gap-2 px-2 py-3 text-left text-[13px] text-ink-soft transition-colors hover:bg-surface-soft"
                        >
                          <Trash2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                          删除
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </div>

        {/* 字段列表：editable 态下整行可点击，进入底部浮层修改 */}
        <div className="mt-2 flex flex-col gap-1.5">
          {summaryItems.map((item) =>
            editing ? (
              <button
                key={item.field}
                onClick={() => setEditingField(item.field)}
                className="flex w-full items-center gap-2 rounded-lg border border-line bg-surface-soft/60 px-3 py-2 text-left transition-colors hover:border-ink-faint hover:bg-surface-soft"
              >
                <span className="shrink-0 text-[13px] text-ink-faint">
                  {item.label}：
                </span>
                <span className="flex-1 text-[13px] text-ink">{item.value}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />
              </button>
            ) : (
              <div
                key={item.field}
                className="flex gap-2 text-[13px] leading-relaxed"
              >
                <span className="shrink-0 text-ink-faint">{item.label}：</span>
                <span className="text-ink">
                  {item.value}{item.field === "weightValue" ? " KG" : ""}
                </span>
              </div>
            ),
          )}
          {/* 自由输入补充说明（如情绪原因的 customReason）：只读展示，不可编辑 */}
          {customSupplements.map((it) => (
            <div
              key={it.field}
              className="flex gap-2 text-[13px] leading-relaxed"
            >
              <span className="shrink-0 text-ink-faint">补充：</span>
              <span className="text-ink">{it.value}</span>
            </div>
          ))}
          {/* 补充说明（lastStep 字段）：确认态展示，编辑态不展示（由下方输入区管理） */}
          {!editing && savedNote && (
            <div className="flex gap-2 text-[13px] leading-relaxed">
              <span className="shrink-0 text-ink-faint">补充：</span>
              <span className="text-ink">{savedNote}</span>
            </div>
          )}
          {bmiSummary !== null && bmiSummaryInfo && getUserProfile().heightCm && (
            <div className="flex gap-2 text-[13px] leading-relaxed">
              <span className="shrink-0 text-ink-faint">BMI：</span>
              <span className="text-ink">{bmiSummary} {bmiSummaryInfo.label}</span>
            </div>
          )}
          {/* 时间字段（仅展示，不可编辑） */}
          <div className="flex gap-2 text-[13px] leading-relaxed">
            <span className="shrink-0 text-ink-faint">时间：</span>
            <span className="text-ink">{timeStr}</span>
          </div>
        </div>
      </div>

      {/* 可选补充区：方案 A
          - 无补充说明 / 编辑态：显示输入框，发送后写入 answers 草稿
          - 已有补充说明且非编辑态：显示「补充说明已添加 + 修改补充」入口 */}
      <div className="mt-5">
        {savedNote && !editingSupplement ? (
          <div className="flex items-center justify-between rounded-xl border border-line bg-surface-soft/50 px-4 py-3">
            <span className="text-[13px] text-ink-faint">补充说明已添加</span>
            <button
              onClick={handleEditSupplement}
              className="text-[13px] font-medium text-ink-soft underline underline-offset-4 transition-colors hover:text-ink"
            >
              修改补充
            </button>
          </div>
        ) : (
          <div className="mt-2">
            <VoiceInputBar
              value={supplement}
              onChange={setSupplement}
              onSend={handleSaveSupplement}
              canSend={supplement.trim().length > 0}
              placeholder="想补一句也可以..."
            />
          </div>
        )}
      </div>

      {/* 底部主按钮：完成记录（始终可点） */}
      <div className="mt-auto pb-6 pt-4">
        <button
          onClick={handleComplete}
          className="w-full rounded-xl bg-action-primary px-4 py-3 text-[14px] font-medium text-action-primary-text transition-opacity hover:opacity-90"
        >
          完成记录
        </button>
      </div>

      {/* 字段编辑底部浮层 */}
      <AnimatePresence>
        {currentEdit && (
          <FieldEditSheet
            item={currentEdit}
            onPickOption={(value, label) =>
              pickOption(currentEdit.field, value, label)
            }
            onSaveCustom={(text) => saveCustom(currentEdit.field, text)}
            onClose={() => setEditingField(null)}
          />
        )}
      </AnimatePresence>

      {/* 删除记录二次确认 */}
      <AnimatePresence>
        {deleteConfirmOpen && (
          <DeleteRecordConfirm
            onCancel={() => setDeleteConfirmOpen(false)}
            onConfirm={confirmDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* —— 字段编辑底部浮层 ——
 * 从底部弹出，只修改当前字段：
 *   - 枚举字段（单选）：纵向选项列表（点击立即写回 + 关闭浮层）
 *   - 枚举字段（多选）：toggle 选择 + 「完成」按钮，拼接 value/label 写回
 *   - 自由输入字段 / 枚举字段自定义覆盖：底部文本输入框 + 发送按钮（多选项不提供）
 * 选择 / 发送后立即写回 answers（父级 setAnswers），摘要卡即时刷新。 */
function FieldEditSheet({
  item,
  onPickOption,
  onSaveCustom,
  onClose,
}: {
  item: {
    field: string;
    step: Step;
    label: string;
    value: string;
    answer: AnswerEntry;
    options: StepOption[];
    multi: boolean;
  };
  onPickOption: (value: string, label: string) => void;
  onSaveCustom: (text: string) => void;
  onClose: () => void;
}) {
  const options = item.options;
  const isMulti = item.multi;
  const isMoon = item.step.moonPhase === true;
  const currentOptionValue =
    item.answer.type === "option" ? item.answer.value : null;

  // 多选本地状态：从已存答案回填（value 以 | 拼接）
  const [multiSelected, setMultiSelected] = useState<string[]>(() =>
    isMulti && item.answer.type === "option" && item.answer.value
      ? item.answer.value.split("|").filter(Boolean)
      : [],
  );
  // 自定义文本初始值：当前已是 custom 答案时回填，否则空
  const [customText, setCustomText] = useState(
    item.answer.type === "custom" ? item.answer.value : "",
  );

  // 多选确认：拼接 value（|）与 label（、）写回 + 关闭浮层
  const confirmMulti = () => {
    if (multiSelected.length === 0) return;
    const labels = multiSelected
      .map((v) => options.find((o) => o.value === v)?.label ?? v)
      .join("、");
    onPickOption(multiSelected.join("|"), labels);
  };

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col justify-end bg-ink/30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.3, ease }}
        className="rounded-t-2xl bg-white px-5 pb-6 pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 拖拽指示 */}
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
        {/* 字段标签 */}
        <div className="mb-3 text-[12px] uppercase tracking-[0.16em] text-ink-faint">
          {item.label}
        </div>

        {/* 选项列表（segmented 字段） */}
        {options.length > 0 && (
          <div className="flex flex-col gap-2">
            {options.map((opt) => {
              const active = isMulti
                ? multiSelected.includes(opt.value)
                : currentOptionValue === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() =>
                    isMulti
                      ? setMultiSelected((prev) =>
                          prev.includes(opt.value)
                            ? prev.filter((v) => v !== opt.value)
                            : [...prev, opt.value],
                        )
                      : onPickOption(opt.value, opt.label)
                  }
                  className={`flex h-12 items-center gap-3 rounded-xl border px-4 text-left transition-colors ${
                    active
                      ? "border-ink bg-ink text-canvas"
                      : "border-line bg-white text-ink hover:border-ink-faint"
                  }`}
                >
                  {/* 左侧指示符 */}
                  {isMulti ? (
                    <span
                      className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border ${
                        active ? "border-canvas bg-canvas" : "border-ink-faint"
                      }`}
                    >
                      {active && (
                        <Check className="h-3 w-3 text-ink" strokeWidth={2.4} />
                      )}
                    </span>
                  ) : isMoon ? (
                    <MoonPhaseIcon level={intensityValueToLevel[opt.value] ?? 3} size={16} />
                  ) : (
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        active ? "bg-white" : "bg-ink-faint"
                      }`}
                    />
                  )}
                  <span className="text-[14px] font-medium tracking-tight">
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 多选确认按钮 */}
        {isMulti && (
          <button
            onClick={confirmMulti}
            disabled={multiSelected.length === 0}
            className={`mt-3 h-11 w-full rounded-xl px-4 text-[14px] font-medium transition-opacity ${
              multiSelected.length === 0
                ? "bg-surface-muted text-ink-faint"
                : "bg-action-primary text-action-primary-text hover:opacity-90"
            }`}
          >
            {multiSelected.length === 0 ? "选择后完成" : "完成"}
          </button>
        )}

        {/* 自定义文本输入：用于自由输入字段，或对枚举字段自定义覆盖（多选项不提供） */}
        {!isMulti && (
          <VoiceInputBar
            value={customText}
            onChange={setCustomText}
            onSend={() => onSaveCustom(customText)}
            canSend={customText.trim().length > 0}
            placeholder="或自己写一句…"
            sendButtonClassName="bg-action-primary text-action-primary-text"
            className="mt-3"
          />
        )}
      </motion.div>
    </motion.div>
  );
}

/* —— 删除记录二次确认（记录级，区别于字段级 DeleteConfirm） ——
 * 文案：要删掉这条记录吗？
 * 按钮：取消 / 删除
 * 确认删除 → onAbort（丢弃草稿，返回 recordHome，不进入完成页 / 不触发能量） */
function DeleteRecordConfirm({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center bg-ink/30 px-8 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease }}
        className="w-full max-w-[280px] rounded-2xl bg-white p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-[14px] font-medium text-ink">
          要删掉这条记录吗？
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-line bg-white px-4 py-2.5 text-[13px] font-medium text-ink"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-ink px-4 py-2.5 text-[13px] font-medium text-canvas"
          >
            删除
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
