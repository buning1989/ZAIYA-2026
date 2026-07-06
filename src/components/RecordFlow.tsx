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
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";
import ZaizaiRive from "./ZaizaiRive";
import VoiceInputBar from "./VoiceInputBar";
import { PhoneStatusBar } from "./AppMainSurface";
import {
  CUSTOM_INPUT_VALUE,
  getNextStep,
  isCompleteCoreRecord,
  recordTypes,
  summaryLabels,
  type AnswerEntry,
  type Answers,
  type RecordEntry,
  type RecordType,
  type RecordTypeId,
  type Step,
} from "@/data/record";

const ease = [0.22, 1, 0.36, 1] as const;

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
 * 完成页在 mock 条件下（2–3 次完整记录）出现一次轻提示。
 *
 * 全程本地 mock，不接后端 / LLM / 真实数据写入。 */
type Layer = "home" | "wizard" | "result";

type Props = {
  /** 返回 more 侧边栏（recordHome 顶部返回） */
  onBack: () => void;
  /** 每次记录完成时回调，传递类型与是否完整，用于 AppMainSurface 历史记录与提示触发 */
  onRecordComplete?: (e: {
    typeId: RecordTypeId;
    isComplete: boolean;
  }) => void;
  /** 先保存：用户在 wizard 中途点击「先保存」，保存为 basic 记录并直接回首页
   *  不进入完成页、不展示能量、不触发快捷入口提示 */
  onSaveFirst?: (e: {
    typeId: RecordTypeId;
    answers: Answers;
  }) => void;
  /** 完成页低频提示：满足触发条件后由 AppMainSurface 控制 */
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
  showShortcutHint,
  onAcceptShortcut,
  onDismissShortcutHint,
  recordHistory = [],
}: Props) {
  const [layer, setLayer] = useState<Layer>("home");
  const [typeId, setTypeId] = useState<RecordTypeId | null>(null);

  // 保存反馈：基础记录 / 完整记录（含能量奖励）
  const [resultComplete, setResultComplete] = useState(false);

  // wizard 的 answers 上提：用于顶部「先记到这儿」入口的显示判断与触发
  const [wizardAnswers, setWizardAnswers] = useState<Answers>({});

  const type = typeId
    ? recordTypes.find((t) => t.id === typeId) ?? null
    : null;

  const goHome = () => setLayer("home");

  const goWizard = (id: RecordTypeId) => {
    setTypeId(id);
    setWizardAnswers({});
    setLayer("wizard");
  };

  // wizard 完成时调用：判断是否完整核心记录 + 进入 result 层 + 回调 AppMainSurface
  const handleSave = (answers: Answers) => {
    const complete = typeId ? isCompleteCoreRecord(typeId, answers) : false;
    setResultComplete(complete);
    setLayer("result");
    if (typeId) onRecordComplete?.({ typeId, isComplete: complete });
  };

  // 先记到这儿：低能量退出，保存为 basic 记录，不进入完成页，直接回首页
  const handleSaveFirst = () => {
    if (!typeId) return;
    onSaveFirst?.({ typeId, answers: wizardAnswers });
  };

  const handleBack = () => {
    if (layer === "home") onBack();
    else if (layer === "wizard") goHome();
    // result 层无返回，只能通过完成按钮离开
  };

  const backToRecordHome = () => {
    setLayer("home");
    setTypeId(null);
    setResultComplete(false);
    setWizardAnswers({});
  };

  const title =
    layer === "home"
      ? "记一下"
      : layer === "wizard"
        ? type?.name ?? "记一下"
        : "";

  // 顶部「先记到这儿」显示条件：wizard 层 + 已有至少 1 项有效输入
  const hasAnyAnswer = Object.values(wizardAnswers).some(
    (a) => a && (a.label?.trim() || a.value.trim()),
  );
  const canSaveFirst = layer === "wizard" && hasAnyAnswer;

  return (
    <div className="relative flex h-full flex-col bg-canvas">
      <PhoneStatusBar />

      {/* 顶部返回 + 标题 + 右上角「先记到这儿」弱入口（result 页不显示） */}
      {layer !== "result" && (
        <div className="flex items-center gap-3 px-5 pt-14 pb-2">
          <button
            onClick={handleBack}
            aria-label="返回"
            className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="flex-1 text-[17px] font-semibold tracking-tight text-ink">
            {title}
          </h2>
          {canSaveFirst && (
            <button
              onClick={handleSaveFirst}
              className="text-[12px] text-ink-faint underline-offset-4 transition-colors hover:text-ink-soft hover:underline"
            >
              先记到这儿
            </button>
          )}
        </div>
      )}

      {/* 层级内容 */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={layer}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.28, ease }}
            className="absolute inset-0"
          >
            {layer === "home" && (
              <RecordHome onPick={goWizard} recordHistory={recordHistory} />
            )}
            {layer === "wizard" && type && (
              <RecordWizard
                type={type}
                answers={wizardAnswers}
                setAnswers={setWizardAnswers}
                onSave={handleSave}
                onAbort={backToRecordHome}
              />
            )}
            {layer === "result" && (
              <RecordResult
                complete={resultComplete}
                onBackHome={backToRecordHome}
                showShortcutHint={showShortcutHint}
                onAcceptShortcut={onAcceptShortcut}
                onDismissShortcutHint={onDismissShortcutHint}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
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
}: {
  onPick: (id: RecordTypeId) => void;
  recordHistory?: RecordEntry[];
}) {
  // 从 recordHistory 提取最近 1-3 条气泡摘要
  const bubbles = buildRecentBubbles(recordHistory);

  return (
    <div className="flex h-full flex-col overflow-y-auto px-5 pb-8">
      {/* 在在 + 最近记录气泡 */}
      {bubbles.length > 0 ? (
        // 有记录：左右结构，在在在左，气泡在右
        <div className="flex items-start justify-center gap-3 py-4">
          <ZaizaiRive className="h-20 w-20 shrink-0" />
          <RecentBubbles items={bubbles} />
        </div>
      ) : (
        // 无记录：居中显示在在
        <div className="flex justify-center py-4">
          <ZaizaiRive className="h-28 w-28" />
        </div>
      )}

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
              strokeWidth={1.6}
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
          <div className="relative rounded-lg bg-line-soft px-4 py-2.5">
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
                className="text-line-soft"
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

  return recent.map((entry) => {
    const type = recordTypes.find((t) => t.id === entry.type);

    // 根据 completedAt 计算相对时间
    const now = Date.now();
    const diff = now - entry.completedAt;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    let timePrefix: string;
    if (days === 0) {
      if (hours === 0) timePrefix = "刚才你留下过";
      else if (hours === 1) timePrefix = "一小时前你留下过";
      else timePrefix = "今天你留下过";
    } else if (days === 1) {
      timePrefix = "昨天你留下过";
    } else if (days === 2) {
      timePrefix = "前天你记到";
    } else {
      timePrefix = "前几天你记到";
    }

    // 摘要：使用 mockRecentSummary 的 text 字段（本地 mock 阶段）
    const summary = type?.mockRecentSummary?.text ?? "一条记录";

    return `${timePrefix}：${summary}`;
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
  onAbort,
}: {
  type: RecordType;
  answers: Answers;
  setAnswers: Dispatch<SetStateAction<Answers>>;
  onSave: (answers: Answers) => void;
  onAbort: () => void;
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

  const currentAnswer: AnswerEntry | undefined = answers[current.field];

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

  // 自由输入发送 → 写入 custom 答案 + 停留 400ms + 自动进入下一项
  // 最后一项（补一句）：发送后直接完成，不延迟
  const sendInput = () => {
    const text = inputText.trim();
    if (!text || advancing) return;
    writeAnswer(current.field, { type: "custom", value: text });
    setInputText("");
    setEditingCustom(false);
    setRevealedStepId(null);
    if (current.isLast) {
      onSave({ ...answers, [current.field]: { type: "custom", value: text } });
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
    if (currentAnswer?.type !== "custom") return;
    setInputText(currentAnswer.value);
    setEditingCustom(true);
    setCustomOpen(true);
    setRevealedStepId(null);
  };

  // 确认删除 custom 答案
  const confirmDelete = () => {
    clearAnswer(current.field);
    setInputText("");
    setEditingCustom(false);
    setCustomOpen(false);
    setDeleteConfirmOpen(false);
    setRevealedStepId(null);
  };

  // 最后一项完成（补一句）：空输入也允许完成
  const finishLast = () => {
    const text = inputText.trim();
    const finalAnswers = text
      ? { ...answers, [current.field]: { type: "custom" as const, value: text } }
      : answers;
    onSave(finalAnswers);
  };

  const isLast = current.isLast;
  const isSegmented = current.inputType === "segmented";
  const hasCustom = currentAnswer?.type === "custom";

  // 输入框是否展示：最后一项默认展示；其他项点击弱入口后展示
  const showInputBox = isLast || customOpen;
  // 是否已达到完整记录标准（最后一项时用于判断是否进入记录确认页）
  const isCompleteRecord = isCompleteCoreRecord(type.id, answers);
  // 最后一项且达到完整记录标准 → 进入记录确认页（不再作为必答题）
  const showConfirmPage = isLast && isCompleteRecord;

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

  return (
    <div className="relative flex h-full flex-col">
      {/* 在在（较小） */}
      <div className="flex justify-center py-2">
        <ZaizaiRive className="h-20 w-20" />
      </div>

      {/* 顶部进度条（轻量，不显示数字/百分比文案，仅细线） */}
      <div className="px-5 pb-3">
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
          onComplete={onSave}
          onAbort={onAbort}
        />
      ) : (
        <>
          {/* 当前问题 + 选项卡（单页单项，可滚动）
              右滑返回上一项的触发区域：仅此主体内容区。
              排除区域（input/textarea/button/[data-no-swipe]）在 isExcludedTarget 中过滤。 */}
          <div
            className="flex flex-1 flex-col overflow-y-auto px-5"
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

                {/* 纵向选项卡列表（segmented 项：结构化选项 + 自定义选项卡同层级） */}
                {isSegmented && (
                  <div className="mt-5 flex flex-col gap-2.5">
                    {current.options?.map((opt) => {
                      const active =
                        currentAnswer?.type === "option" &&
                        currentAnswer.value === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => selectOption(opt.value, opt.label)}
                          disabled={advancing}
                          className={`flex h-14 items-center gap-3 rounded-2xl border px-5 text-left transition-colors ${
                            active
                              ? "border-ink bg-ink text-canvas"
                              : "border-line bg-white text-ink hover:border-ink-faint"
                          } ${advancing ? "opacity-60" : ""}`}
                        >
                          {/* 左侧点状符号 */}
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              active ? "bg-canvas" : "bg-ink-faint"
                            }`}
                          />
                          <span className="text-[15px] font-medium tracking-tight">
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}

                    {/* 自定义选项卡：与结构化选项同层级，selected 态，右滑露出 修改/删除 */}
                    {hasCustom && (
                      <CustomAnswerCard
                        text={currentAnswer.value}
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
                        className="mt-2 self-center rounded-full border border-line bg-line-soft px-4 py-1.5 text-[12px] text-ink-faint transition-colors hover:border-ink-faint hover:text-ink-soft"
                      >
                        没有合适的？自己写一句
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

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
          className="grid h-14 w-[70px] place-items-center rounded-2xl bg-line-soft text-ink-soft transition-colors hover:text-ink"
        >
          <Pencil className="h-4 w-4" strokeWidth={1.6} />
        </button>
        <button
          onClick={onDelete}
          aria-label="删除"
          className="grid h-14 w-[70px] place-items-center rounded-2xl bg-ink/10 text-ink-soft transition-colors hover:text-ink"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.6} />
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
        <span className="h-2 w-2 shrink-0 rounded-full bg-canvas" />
        <span className="line-clamp-1 flex-1 text-[15px] font-medium tracking-tight">
          {text}
        </span>
        <span className="shrink-0 rounded-full bg-canvas/15 px-2 py-0.5 text-[10px] text-canvas/80">
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
            className="flex-1 rounded-lg border border-line bg-canvas px-4 py-2.5 text-[13px] font-medium text-ink"
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
 * 点击「完成记录」→ onComplete(finalAnswers) → handleSave 判断 isComplete → 进入 result 层
 * 补充内容写入最后一项的 field（note），不影响 isCompleteCoreRecord 判断。 */
function RecordConfirmPage({
  type,
  answers,
  setAnswers,
  onComplete,
  onAbort,
}: {
  type: RecordType;
  answers: Answers;
  setAnswers: Dispatch<SetStateAction<Answers>>;
  onComplete: (answers: Answers) => void;
  onAbort: () => void;
}) {
  const [supplement, setSupplement] = useState("");

  // 修改 / 删除相关状态
  const [editing, setEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleComplete = () => {
    const text = supplement.trim();
    const lastStep = type.steps[type.steps.length - 1];
    const finalAnswers = text
      ? {
          ...answers,
          [lastStep.field]: { type: "custom" as const, value: text },
        }
      : answers;
    onComplete(finalAnswers);
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
    }));

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

  const now = new Date();
  const timeStr = `今天 ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5">
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
                  className="grid h-7 w-7 place-items-center rounded-full text-ink-faint transition-colors hover:bg-line-soft hover:text-ink"
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
                          className="flex w-full items-center gap-2 px-2 py-3 text-left text-[13px] text-ink-soft transition-colors hover:bg-line-soft"
                        >
                          <Pencil className="h-3.5 w-3.5 shrink-0" strokeWidth={1.6} />
                          修改
                        </button>
                        <button
                          onClick={openDeleteConfirm}
                          className="flex w-full items-center gap-2 px-2 py-3 text-left text-[13px] text-ink-soft transition-colors hover:bg-line-soft"
                        >
                          <Trash2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.6} />
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
                className="flex w-full items-center gap-2 rounded-lg border border-line bg-line-soft/40 px-3 py-2 text-left transition-colors hover:border-ink-faint hover:bg-line-soft"
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
                <span className="text-ink">{item.value}</span>
              </div>
            ),
          )}
          {/* 时间字段（仅展示，不可编辑） */}
          <div className="flex gap-2 text-[13px] leading-relaxed">
            <span className="shrink-0 text-ink-faint">时间：</span>
            <span className="text-ink">{timeStr}</span>
          </div>
        </div>
      </div>

      {/* 可选补充区 */}
      <div className="mt-5">
        <p className="text-[13px] text-ink-faint">想补一句也可以。</p>
        <div className="mt-2">
          <VoiceInputBar
            value={supplement}
            onChange={setSupplement}
            onSend={handleComplete}
            canSend={true}
            placeholder="自己写一句…"
          />
        </div>
      </div>

      {/* 底部主按钮：完成记录（始终可点） */}
      <div className="mt-auto pb-6 pt-4">
        <button
          onClick={handleComplete}
          className="w-full rounded-xl bg-accent px-4 py-3 text-[14px] font-medium text-canvas transition-opacity hover:opacity-90"
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
 *   - 枚举字段：纵向选项列表（点击立即写回 + 关闭浮层）
 *   - 自由输入字段 / 枚举字段自定义覆盖：底部文本输入框 + 发送按钮
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
  };
  onPickOption: (value: string, label: string) => void;
  onSaveCustom: (text: string) => void;
  onClose: () => void;
}) {
  const options = item.step.options ?? [];
  const currentOptionValue =
    item.answer.type === "option" ? item.answer.value : null;
  // 自定义文本初始值：当前已是 custom 答案时回填，否则空
  const [customText, setCustomText] = useState(
    item.answer.type === "custom" ? item.answer.value : "",
  );

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
              const active = currentOptionValue === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onPickOption(opt.value, opt.label)}
                  className={`flex h-12 items-center gap-3 rounded-xl border px-4 text-left transition-colors ${
                    active
                      ? "border-ink bg-ink text-canvas"
                      : "border-line bg-white text-ink hover:border-ink-faint"
                  }`}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      active ? "bg-canvas" : "bg-ink-faint"
                    }`}
                  />
                  <span className="text-[14px] font-medium tracking-tight">
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 自定义文本输入：用于自由输入字段，或对枚举字段自定义覆盖 */}
        <VoiceInputBar
          value={customText}
          onChange={setCustomText}
          onSend={() => onSaveCustom(customText)}
          canSend={customText.trim().length > 0}
          placeholder="或自己写一句…"
          sendButtonClassName="bg-accent text-canvas"
          className="mt-3 rounded-xl border border-line bg-white p-2"
        />
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
            className="flex-1 rounded-lg border border-line bg-canvas px-4 py-2.5 text-[13px] font-medium text-ink"
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

/* —— 第三层：recordResult ——
 * 基础记录：已记下。
 * 完整记录：这条记录完整了，获得 5 点能量。
 * 能量用途占位文案：可用于兑换在在装扮、房间小物件、轻社交礼物。
 * 不显示：还差几条 / 连续天数 / 分数 / 趋势 / 评价性反馈。
 *
 * 主按钮只有「返回记一下」，不再有并列的「回到首页」。
 *
 * 快捷入口提示：满足触发条件后在主按钮下方低优先级展示
 *   文案：「最近经常用到「记一下」，要不要放到首页？」
 *   操作：放到首页 / 暂不（7 天内不再提示）
 *   点击「放到首页」→ 开启快捷入口 + 显示「已放到首页」轻反馈 */
function RecordResult({
  complete,
  onBackHome,
  showShortcutHint,
  onAcceptShortcut,
  onDismissShortcutHint,
}: {
  complete: boolean;
  onBackHome: () => void;
  showShortcutHint: boolean;
  onAcceptShortcut: () => void;
  onDismissShortcutHint: () => void;
}) {
  // 「已放到首页」轻反馈
  const [placed, setPlaced] = useState(false);

  const handlePlace = () => {
    onAcceptShortcut();
    setPlaced(true);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-8">
      <ZaizaiRive className="h-28 w-28" />

      {complete ? (
        <>
          <h2 className="text-[17px] font-semibold tracking-tight text-ink">
            这条记录完整了
          </h2>
          <div className="flex items-center gap-2 rounded-full bg-line-soft px-5 py-2">
            <Sparkles className="h-4 w-4 text-ink-soft" strokeWidth={1.6} />
            <span className="text-[14px] font-medium text-ink">
              获得 5 点能量
            </span>
          </div>
          <p className="text-center text-[12px] leading-relaxed text-ink-faint">
            可用于兑换在在装扮、房间小物件、轻社交礼物。
          </p>
        </>
      ) : (
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">
          已记下
        </h2>
      )}

      {/* 主按钮：只有「返回记一下」 */}
      <button
        onClick={onBackHome}
        className="w-full rounded-lg bg-accent px-4 py-3 text-[13px] font-medium text-canvas"
      >
        返回"记一下"
      </button>

      {/* 已放到首页轻反馈（点击后短暂展示） */}
      <AnimatePresence>
        {placed && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease }}
            className="text-[12px] text-ink-faint"
          >
            已放到首页
          </motion.p>
        )}
      </AnimatePresence>

      {/* 快捷入口提示：低优先级，在主按钮下方 */}
      <AnimatePresence>
        {showShortcutHint && !placed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.28, ease }}
            className="w-full rounded-2xl border border-line bg-line-soft px-5 py-4"
          >
            <p className="text-center text-[13px] leading-relaxed text-ink-soft">
              最近经常用到「记一下」，要不要放到首页？
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handlePlace}
                className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-[13px] font-medium text-canvas"
              >
                放到首页
              </button>
              <button
                onClick={onDismissShortcutHint}
                className="flex-1 rounded-lg border border-line bg-canvas px-4 py-2.5 text-[13px] font-medium text-ink"
              >
                暂不
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
