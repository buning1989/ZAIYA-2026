import { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUp,
  MessageCircle,
  BookOpen,
  Users,
  Wind,
  Wifi,
  X,
  Waves,
  Hand,
  Leaf,
  HandHeart,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import VoiceInputBar from "./VoiceInputBar";
import type { SceneId } from "./PresenceRoom";
import FeaturePageTransition from "./FeaturePageTransition";
import {
  BreathingCarousel,
  BREATHING_METHODS,
} from "./BreathingCarousel";
import {
  MoreContent,
  MoreDetailContent,
  type MoreItemId,
} from "./MoreMenu";
import HomeTimeAnchor from "./HomeTimeAnchor";
import HomeBubbleCopy from "./HomeBubbleCopy";
import ZaizaiHomeScene from "./ZaizaiHomeScene";
import DialogueZaiyaAnimation, {
  type DialogueAnimState,
} from "./DialogueZaiyaAnimation";
import {
  getHomeTimePhase,
  getNextHomePhase,
  type HomeTimePhase,
} from "@/lib/homeTimePhase";
import { getHomePhaseBubbleText } from "@/shared/config/homeAnimationRegistry";
import EnergyRewardFeedback, {
  type EnergyRewardEvent,
} from "./EnergyRewardFeedback";
import EnergyBadge from "./EnergyBadge";
import type { Answers, RecordEntry, RecordTypeId } from "@/data/record";
import type { OrganizeHistoryEntry } from "@/data/organize";
import { grantEnergy } from "@/data/userProfile";
import { getStorageMode } from "@/shared/storage/namespacedStorage";
import {
  getXiaochenInitialDialog,
  buildXiaochenReply,
  shouldTriggerSafetyResponse,
} from "@/apps/experience/selectors/selectConversationThreads";
import type {
  AppMainSurfaceDemoState,
  DialogItem,
  DialogMessageItem,
  DialogTimeItem,
} from "./demo/types";

/* —— 体验模式数据源切换（仅切换数据注入，不改变 UI/布局/交互）——
 * 体验模式 AI 对话使用小晨统一对话历史与确定性 Mock 回复，
 * 演示模式保持原有 createMockDialogItems / buildDemoReply 行为。 */
const IS_EXPERIENCE_MODE = getStorageMode() === "experience";

/* 性能优化（2026-07-13）：按功能模块拆包，落地页 / 首页首屏不加载以下重型模块。
 * 预加载优化（2026-07-13）：所有 loader 复用集中式 moduleLoaders，
 * 确保 React.lazy 和预加载（preloadModule）使用同一个 Promise。 */
import {
  presenceRoomLoader,
  breathingFlowLoader,
  demoRecordPreviewLoader,
  demoPraisePreviewLoader,
  lookbackPageLoader,
  materialDetailViewLoader,
  doneStepLoader,
  loadBreathingFlow,
  loadPresenceRoom,
} from "@/lib/moduleLoaders";
import { preloadVideo } from "@/lib/mediaPreloader";
import { usePrefetch } from "@/lib/usePrefetch";
import { storageGet, storageSet } from "@/shared/storage/namespacedStorage";

const SocialSceneSelectContent = lazy(() =>
  presenceRoomLoader().then((m) => ({ default: m.SocialSceneSelectContent })),
);
const DazeFlow = lazy(() =>
  presenceRoomLoader().then((m) => ({ default: m.DazeFlow })),
);
const EatFlow = lazy(() =>
  presenceRoomLoader().then((m) => ({ default: m.EatFlow })),
);
const BreathingFlow = lazy(breathingFlowLoader);
const DemoRecordPreview = lazy(demoRecordPreviewLoader);
const DemoPraisePreview = lazy(demoPraisePreviewLoader);
const LookbackPage = lazy(lookbackPageLoader);
const MaterialDetailView = lazy(materialDetailViewLoader);
const DoneStep = lazy(doneStepLoader);

const ease = [0.22, 1, 0.36, 1] as const;

function createSocialSessionId(scene: SceneId): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `${scene}-${window.crypto.randomUUID()}`;
  }
  return `${scene}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/* —— 应用锁受保护入口 ——
 * 仅这 4 个入口被应用锁保护；首页 / 记一下的新建入口 / 帮助与反馈 /
 * 设置首页 / 应用隐私条款 / 用户协议 均不触发验证 */
const APP_LOCK_PROTECTED_ITEMS: MoreItemId[] = [
  "review",
  "organize",
  "praise",
  "privacy",
];

/* —— 首页内缓解模式：4 个能力项 ——
 * 当前 demo 阶段仅开放「呼吸法」；其余卡片弱化并标识「暂未开放」标签，点击无反馈。
 * 与轻社交模块未开放状态视觉规则一致。 */
type ReliefMethodId = "breathing" | "grounding" | "mindfulness" | "butterfly";

const reliefMethods: {
  id: ReliefMethodId;
  label: string;
  Icon: typeof Waves;
  enabled: boolean;
}[] = [
  { id: "breathing", label: "呼吸法", Icon: Waves, enabled: true },
  { id: "grounding", label: "五感接地", Icon: Hand, enabled: false },
  { id: "mindfulness", label: "正念", Icon: Leaf, enabled: false },
  { id: "butterfly", label: "蝴蝶拍", Icon: HandHeart, enabled: false },
];

function buildDemoReply(text: string) {
  if (/起不来|不想动|没力气|没劲|躺着/.test(text)) {
    return "我在。先不用把今天都想完，只试一个很小的动作：坐起来，把水杯放到手边。做完就算这一轮已经开始了。";
  }

  if (/不想出门|出门|上学|见人/.test(text)) {
    return "先不把目标定成出门。我们只确认下一步：换到门口附近，或者把要带的东西放进包里。能做到哪一步，就停在哪一步。";
  }

  return "我先记下来了。今天不用一次解决全部问题，只选一个最小动作：喝一口水、坐起来两分钟，或告诉身边的人“我现在需要慢一点”。";
}

const WEEKDAY_CHARS = ["日", "一", "二", "三", "四", "五", "六"];

function HomeBreathingMenuIcon({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const lines = [
    { y: 6.8, x2: 18.2, grow: 0.7, delay: 0 },
    { y: 12, x2: 15.2, grow: 0.45, delay: 0.45 },
    { y: 17.2, x2: 19.2, grow: 0.55, delay: 0.9 },
  ];

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {lines.map((line, index) => (
        <motion.line
          key={index}
          x1={4.5}
          x2={line.x2}
          y1={line.y}
          y2={line.y}
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ transformOrigin: "12px 12px" }}
          animate={
            reduceMotion
              ? undefined
              : {
                  x2: [line.x2, line.x2 + line.grow, line.x2],
                  opacity: [0.82, 1, 0.86, 0.82],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 3.8 + index * 0.35,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: line.delay,
                }
          }
        />
      ))}
    </svg>
  );
}

function formatHHMM(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(date: Date, reference: Date): boolean {
  const yesterday = new Date(reference);
  yesterday.setDate(reference.getDate() - 1);
  return isSameCalendarDay(date, yesterday);
}

function formatDialogTime(date: Date, reference = new Date()): string {
  const hhmm = formatHHMM(date);

  if (isSameCalendarDay(date, reference)) {
    return `今天 ${hhmm}`;
  }

  if (isYesterday(date, reference)) {
    return `昨天 ${hhmm}`;
  }

  return `周${WEEKDAY_CHARS[date.getDay()]} ${hhmm}`;
}

function dialogTimeItem(
  id: string,
  date: Date,
  reference?: Date,
): DialogTimeItem {
  return {
    kind: "time",
    id,
    label: formatDialogTime(date, reference),
    createdAt: date.getTime(),
  };
}

function dialogMessageItem(
  id: string,
  role: DialogMessageItem["role"],
  text: string,
  date: Date,
): DialogMessageItem {
  return {
    kind: "message",
    id,
    role,
    text,
    createdAt: date.getTime(),
  };
}

function createMockDialogItems(now: Date): DialogItem[] {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  yesterday.setHours(21, 30, 0, 0);

  const yesterdayUser = new Date(yesterday.getTime() + 60 * 1000);
  const yesterdayReply = new Date(yesterday.getTime() + 2 * 60 * 1000);
  const today = new Date(now.getTime() - 18 * 60 * 1000);
  const todayReply = new Date(today.getTime() + 2 * 60 * 1000);

  return [
    dialogTimeItem("mock-time-yesterday", yesterday, now),
    dialogMessageItem(
      "mock-zaizai-yesterday-open",
      "zaizai",
      "嘿，我在。今晚怎么样？有什么想聊的，还是只是想先放松一下？",
      yesterday,
    ),
    dialogMessageItem(
      "mock-user-yesterday",
      "user",
      "有点累，脑子停不下来。",
      yesterdayUser,
    ),
    dialogMessageItem(
      "mock-zaizai-yesterday-reply",
      "zaizai",
      "那我们不急着解决。先把今天放小一点：喝口水，靠一下，等身体知道你已经停下来了。",
      yesterdayReply,
    ),
    dialogTimeItem("mock-time-today", today, now),
    dialogMessageItem(
      "mock-user-today",
      "user",
      "刚刚又有点卡住。",
      today,
    ),
    dialogMessageItem(
      "mock-zaizai-today-reply",
      "zaizai",
      "我在。我们只看下一步，不看整座山。你可以先在这里说一句最小的话，哪怕只是“我有点乱”。",
      todayReply,
    ),
  ];
}

function shouldInsertTimeMarker(items: DialogItem[], now: Date): boolean {
  const lastTimeItem = [...items]
    .reverse()
    .find((item): item is DialogTimeItem => item.kind === "time");

  if (!lastTimeItem) return true;

  const lastTime = new Date(lastTimeItem.createdAt);

  if (!isSameCalendarDay(lastTime, now)) return true;

  const lastMinute = Math.floor(lastTimeItem.createdAt / 60000);
  const currentMinute = Math.floor(now.getTime() / 60000);
  return lastMinute !== currentMinute;
}

/* —— iOS 风格手机状态栏（抽象绘制，仅增强真实感，不承担功能） ——
 * 左：时间；右：信号 / Wi-Fi / 电池。颜色 text-ink，接近真实状态栏。
 * 可选关闭按钮（非首页用），位于状态栏右侧之外，不挤占信号区。
 */
export function PhoneStatusBar({
  showClose = false,
  onClose,
  now,
}: {
  showClose?: boolean;
  onClose?: () => void;
  now?: Date;
}) {
  const [fallbackNow, setFallbackNow] = useState<Date>(() => new Date());

  useEffect(() => {
    if (now) return;

    const iv = window.setInterval(() => setFallbackNow(new Date()), 20000);
    return () => window.clearInterval(iv);
  }, [now]);

  const displayNow = now ?? fallbackNow;

  return (
    <>
      <div className="absolute left-0 right-0 top-0 z-[30] flex items-center justify-between px-6 pt-3.5 pb-1 text-ink">
        {/* 左：时间 */}
        <span className="text-[12px] font-semibold tracking-wide">
          {formatHHMM(displayNow)}
        </span>
        {/* 右：信号 / Wi-Fi / 电池 */}
        <div className="flex items-center gap-1.5">
          {/* 信号条：4 条递增 */}
          <div className="flex items-end gap-[2px]">
            <div className="h-1 w-1 rounded-[1px] bg-ink" />
            <div className="h-1.5 w-1 rounded-[1px] bg-ink" />
            <div className="h-2 w-1 rounded-[1px] bg-ink" />
            <div className="h-2.5 w-1 rounded-[1px] bg-ink" />
          </div>
          {/* Wi-Fi */}
          <Wifi className="h-3.5 w-3.5" strokeWidth={1.8} />
          {/* 电池 */}
          <div className="relative ml-0.5 h-3 w-6 rounded-[3px] border border-ink/55 p-[1.5px]">
            <div className="absolute -right-[3px] top-1/2 h-1.5 w-[2px] -translate-y-1/2 rounded-r bg-ink/55" />
            <div className="h-full w-3/4 rounded-[1px] bg-ink" />
          </div>
        </div>
      </div>
      {/* 关闭按钮：非首页用，位于状态栏下方右上角，不挤占状态栏信号区 */}
      {showClose && onClose && (
        <button
          onClick={onClose}
          aria-label="关闭 Demo"
          className="absolute right-5 top-12 z-[80] grid h-7 w-7 place-items-center rounded-full bg-white/50 backdrop-blur-xl border border-white/30 shadow-sm text-ink-faint transition-colors hover:text-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </>
  );
}

/* —— 首页内模式：均在首页内部展开，非独立页面 / 不跳转路由 ——
 * home：默认首页结构（在在居中 + 四角图标）
 * dialog：在在上移到中上部并固定，下方展开对话内容区，底部出现输入区
 * reliefSelect：在在上移，首页 icon 弱化，下方出现 2×2 缓解能力项选择区
 * breathing：呼吸法选择 / 练习 / 完成流程（独立全屏覆盖层，自管理在在形象）
 * socialSelect：在在上移到中上部并保留气泡，下方出现 2×2 轻社交场景卡片
 * socialFlow：选中场景后的流程页（一起发呆 / 一起吃饭），全屏覆盖，在在退出 */
/* AppMainSurface 内部模式：与 demo/types.ts 的 DemoSurfaceMode 一致，
 * 但扩展了 more / moreDetail / verify 三个仅自由体验使用的内部模式。 */
type SurfaceMode =
  | "home"
  | "dialog"
  | "reliefSelect"
  | "breathing"
  | "socialSelect"
  | "socialFlow"
  | "record"
  | "praise"
  | "lookback"
  | "organize"
  | "more"
  | "moreDetail"
  | "verify";

type Props = {
  /** 预览态：仅瞬时视觉反馈，不触发任何回调（首页 Hero 使用） */
  previewMode?: boolean;
  /** 可交互态：点击触发回调（沉浸式 Demo 使用）。previewMode 优先 */
  interactive?: boolean;
  /** 形态：hero（首页轮播）/ immersive（沉浸式 Demo 首页） */
  variant?: "hero" | "immersive";
  /** 其他核心按钮点击回调：Users=2（陪做）。
   *  Wind(id=1) 已内置为进入首页内缓解模式，不再向上回调；
   *  AI对话(id=0) 已内置为进入首页内对话模式。 */
  onButtonClick?: (id: number) => void;
  /** 在在动画尺寸类名。不传时按 variant 取默认值 */
  zaizaiClassName?: string;
  /** 案例演示状态注入。enabled !== true 时组件完全保持自由体验逻辑；
   *  enabled === true 时允许外部覆盖内部模式 / 时间 / 气泡 / 对话 / 轻社交场景。 */
  demoState?: AppMainSurfaceDemoState;
  /** 对话流末尾行动卡片：用于演示模式下承接下一步动作，不进入脚本数据。 */
  dialogActionCard?: {
    title: string;
    description: string;
    actionLabel: string;
    onClick: () => void;
  };
  /** 首页气泡点击回调：用于第二周 06:40 节点星星反馈 */
  onDemoBubbleClick?: () => void;
};

/**
 * 手机 App 主界面内部内容（共享组件）。
 *
 * 主页信息架构：5 类核心元素，非列表/工具栏。
 * - 顶部：iOS 风格状态栏（时间 / 信号 / Wi-Fi / 电池）
 * - 在在居中，体量明显大于任何图标（视觉主体与交互主体）
 * - 在在附近：气泡（首页唯一文字承载位，占位符，紧贴在在上方）
 * - 左上：菜单入口（汉堡菜单，低频收纳，位于状态栏下方）
 * - 右上：默认空置
 * - 左下：陪做类入口（Users）
 * - 右下：两个高频即时入口横向排列 —— Wind（降压/稳定）+ AI对话（表达/对话，略大，最右下角）
 * - 所有图标为裸符号：无背景容器、无边框、无文字标签
 *
 * 首页 Hero 预览与沉浸式 Demo 的 HomeScreen 复用同一组件，
 * 视觉结构一致；通过 variant / 交互 props 区分。
 *
 * 沉浸式 Demo 下，点击右下角 AI对话 icon 不再跳转下一屏，
 * 而是在首页内部切换为 dialog 模式（在在上移 + 对话区 + 输入区），
 * 关闭后回到 home。当前阶段对话回复为本地模拟，不接 LLM / API。
 */
export default function AppMainSurface({
  previewMode = false,
  interactive = false,
  variant = "hero",
  onButtonClick,
  demoState,
  dialogActionCard,
  onDemoBubbleClick,
}: Props) {
  const [active, setActive] = useState<number | null>(null);

  // —— 演示状态：enabled !== true 时所有派生值回落到内部状态 ——
  const demoEnabled = demoState?.enabled === true;

  // —— 首页环境节律：当前时间（每 20s 刷新，保证分钟及时更新）+ 派生时间段 ——
  // 仅用于 home 模式下的环境信息行 / 在在场景 / 状态文案；非 home 模式不消费。
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    if (demoEnabled) return; // 演示模式使用固定时间，不刷新
    const iv = window.setInterval(() => setNow(new Date()), 20000);
    return () => window.clearInterval(iv);
  }, [demoEnabled]);
  // 演示模式下使用 demoState.now；否则使用系统时间
  const effectiveNow = demoEnabled && demoState?.now ? demoState.now : now;
  const homePhase = getHomeTimePhase(effectiveNow);

  // —— 自由体验模式首页轮播：从真实时间对应的 phase 起步，自动循环播放 7 个时间段 ——
  // 仅在 immersive + 非 demo 模式下启用，让体验者在短时间内能感知到全部 7 段动画+文案。
  // 案例演示模式（demoEnabled）使用 demoState.now 注入的固定 phase，不受轮播影响。
  // 落地页 Hero 固定 morning，也不受影响。
  const isFreeImmersive = variant === "immersive" && !demoEnabled;
  const [carouselPhase, setCarouselPhase] =
    useState<HomeTimePhase>(homePhase);
  useEffect(() => {
    if (!isFreeImmersive) return;
    // 单段时长 = 当前文案打字机时长 + 停留时间
    // 打字机每字 80ms（与 HomeBubbleCopy 一致），最少 1s；停留 7s 让动画与文案被充分感知。
    const text = getHomePhaseBubbleText()[carouselPhase];
    const typingMs = Math.max(Array.from(text).length * 80, 1000);
    const holdMs = 7000;
    const timer = window.setTimeout(() => {
      setCarouselPhase((prev) => getNextHomePhase(prev));
    }, typingMs + holdMs);
    return () => window.clearTimeout(timer);
  }, [isFreeImmersive, carouselPhase]);
  const effectiveHomePhase = isFreeImmersive ? carouselPhase : homePhase;

  // —— 首页内模式状态（仅 interactive/immersive 下由对应 icon 触发）——
  const [mode, setMode] = useState<SurfaceMode>("home");
  // 体验模式：使用小晨统一对话历史（7/17 复诊前线程）作为初始对话
  // 演示模式：使用通用 createMockDialogItems（昨日 + 今日 mock）
  const [messages, setMessages] = useState<DialogItem[]>(() =>
    IS_EXPERIENCE_MODE ? getXiaochenInitialDialog() : createMockDialogItems(now),
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  // 回复刚出现：sending 由 true→false 时置 true，短窗口后自动清除
  const [replyJustAppeared, setReplyJustAppeared] = useState(false);
  const prevSendingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // —— 缓解模式状态 ——
  // 未开放能力项已在卡片上标识「暂未开放」标签，不再使用 Toast 提醒。
  // 呼吸法 inline 选择状态机：collapsed → expanded → countingDown → navigating
  // collapsed：呼吸法卡片收起，底部空白（页面返回由左上角 ← 负责）
  // expanded：原地展开 BreathingCarousel，底部切换为"开始"按钮
  // countingDown：倒计时期间锁定 carousel 与收起，按钮原位显示 3/2/1
  // navigating：倒计时结束，进入 breathing 模式（由 BreathingFlow 接管）
  type BreathingEntryState = "collapsed" | "expanded" | "countingDown" | "navigating";
  const [breathingEntryState, setBreathingEntryState] = useState<BreathingEntryState>("collapsed");
  const [breathingActiveCard, setBreathingActiveCard] = useState(0);
  const [breathingCountdown, setBreathingCountdown] = useState<number | null>(null);
  const breathingCountdownTimerRef = useRef<number | null>(null);
  // 倒计时结束时锁定的呼吸法索引，传递给 BreathingFlow 直接进入练习
  const [pendingBreathingMethod, setPendingBreathingMethod] = useState(0);
  // 标记是否从 inline 入口进入（控制 BreathingFlow 初始子视图）
  const [breathingEntryInline, setBreathingEntryInline] = useState(false);

  // —— 轻社交状态 ——
  const [socialScene, setSocialScene] = useState<SceneId | null>(null);

  // —— 演示状态派生值：覆盖内部 mode / socialScene / messages ——
  // demoEnabled 时外部 demoState 优先；否则回落到内部状态。
  // 内部状态仍可被用户交互修改，但在演示模式下不会影响渲染结果。
  const effectiveMode: SurfaceMode =
    demoEnabled && demoState?.surfaceMode ? demoState.surfaceMode : mode;
  const effectiveSocialScene: SceneId | null =
    demoEnabled && demoState?.socialScene != null
      ? (demoState.socialScene as SceneId)
      : socialScene;
  // 演示模式下注入固定对话脚本；否则使用本地 mock 消息
  const dialogMessages: DialogItem[] =
    demoEnabled && demoState?.dialogItems ? demoState.dialogItems : messages;
  // 演示模式且注入了对话脚本时，隐藏底部输入区
  const hideInputDialog =
    demoEnabled && !!(demoState?.dialogItems && demoState.dialogItems.length > 0);

  // —— 轻社交光反馈（底层仍沿用能量奖励数据）——
  const [socialEnergyReward, setSocialEnergyReward] =
    useState<EnergyRewardEvent | null>(null);
  const [socialEnergyPulse, setSocialEnergyPulse] = useState(false);
  const socialEnergyBtnRef = useRef<HTMLButtonElement | null>(null);
  const socialEnergyPulseTimer = useRef<number | null>(null);
  const socialEnergyRewardIdRef = useRef(0);
  const socialSessionIdRef = useRef<string>("");

  // 发呆结束 → 底层发放能量，前台只触发当下光反馈
  // 演示模式下不触发能量奖励与状态变更，避免评委误触长按结束导致脚本偏移
  const handleDazeFinish = () => {
    if (demoEnabled) return;
    const sourceId = socialSessionIdRef.current || createSocialSessionId("daze");
    socialSessionIdRef.current = sourceId;
    const result = grantEnergy({
      source: "social_daze_completed",
      sourceId,
    });
    if (result.granted) {
      socialEnergyRewardIdRef.current += 1;
      setSocialEnergyReward({
        id: socialEnergyRewardIdRef.current,
        occurredAt: Date.now(),
      });
    }
    setMode("socialSelect");
  };

  // 一起吃饭结束 → 底层发放能量，前台只触发当下光反馈
  // 演示模式下不触发能量奖励与状态变更
  const handleEatFinish = () => {
    if (demoEnabled) return;
    const sourceId = socialSessionIdRef.current || createSocialSessionId("eat");
    socialSessionIdRef.current = sourceId;
    const result = grantEnergy({
      source: "social_meal_completed",
      sourceId,
    });
    if (result.granted) {
      socialEnergyRewardIdRef.current += 1;
      setSocialEnergyReward({
        id: socialEnergyRewardIdRef.current,
        occurredAt: Date.now(),
      });
    }
    setMode("socialSelect");
  };

  const handleSocialEnergyArrive = useCallback(() => {
    setSocialEnergyPulse(true);
    if (socialEnergyPulseTimer.current)
      window.clearTimeout(socialEnergyPulseTimer.current);
    socialEnergyPulseTimer.current = window.setTimeout(() => {
      setSocialEnergyPulse(false);
      socialEnergyPulseTimer.current = null;
    }, 420);
  }, []);

  // toast 整段动画结束：清空 event
  const handleSocialEnergyDone = useCallback(() => {
    setSocialEnergyReward(null);
  }, []);

  useEffect(() => {
    return () => {
      if (socialEnergyPulseTimer.current)
        window.clearTimeout(socialEnergyPulseTimer.current);
    };
  }, []);

  // —— 更多状态 ——
  const [moreDetailId, setMoreDetailId] = useState<MoreItemId | null>(null);

  // —— 侧边栏「暂未开放」统一提示（沿用全局未开放功能的统一提示方式）——
  const [moreToastMsg, setMoreToastMsg] = useState<string | null>(null);
  const moreToastTimer = useRef<number | null>(null);
  const showMoreToast = useCallback((msg: string) => {
    setMoreToastMsg(msg);
    if (moreToastTimer.current) window.clearTimeout(moreToastTimer.current);
    moreToastTimer.current = window.setTimeout(() => {
      setMoreToastMsg(null);
      moreToastTimer.current = null;
    }, 1600);
  }, []);
  useEffect(() => {
    return () => {
      if (moreToastTimer.current) window.clearTimeout(moreToastTimer.current);
    };
  }, []);

  // —— 首页快捷入口开关 ——
  // 默认关闭：首页右上角保持空置；开启后显示「记一下」快捷入口。
  // 主控在「更多 → 设置 → 首页与快捷入口 → 记一下」；不在记录页主体常驻。
  const [homeShortcut, setHomeShortcut] = useState(false);

  // —— 应用锁 ——
  // appLock：是否开启应用锁，命名空间 localStorage 持久化（zaiya-<mode>-app_lock）
  // sessionVerified：本会话内是否已通过验证；不持久化，刷新页面后重置为 false
  // pendingProtectedItem：受保护入口被拦截时暂存目标 id，验证通过后进入该页
  // 受保护入口：回头看看 / 帮我整理 / 我的隐私 / 夸夸自己
  // 不保护：首页 / 记一下的新建入口 / 帮助与反馈 / 设置首页 / 隐私条款 / 用户协议
  const [appLock, setAppLockState] = useState<boolean>(() => storageGet("app_lock") === "true");
  const [sessionVerified, setSessionVerified] = useState(false);
  const [pendingProtectedItem, setPendingProtectedItem] =
    useState<MoreItemId | null>(null);
  const setAppLock = (v: boolean) => {
    setAppLockState(v);
    storageSet("app_lock", v ? "true" : "false");
  };

  // —— 记录历史 + 快捷入口提示（本地 mock） ——
  // recordHistory 追踪每次记录的类型/时间/是否完整/来源
  // shortcutPromptDismissedAt 记录「暂不」时间戳，7 天内不再提示
  // hintVisibleForResult 控制当前完成页是否展示提示（满足条件时置 true）
  // 初始含一条 mock 体重历史记录（55.0 KG），用于「记一下 - 体重」页调节器默认值
  const [recordHistory, setRecordHistory] = useState<RecordEntry[]>(() => [
    {
      id: "mock-weight-history",
      type: "weight",
      weight: 55.0,
      completedAt: Date.parse("2026-07-07T20:00:00+08:00"),
      isComplete: true,
      entrySource: "more",
      status: "complete",
      savedBy: "wizard",
    },
  ]);
  // —— 「帮我整理」历史记录（跨页面持久，AppMainSurface 持有） ——
  const [organizeHistory, setOrganizeHistory] = useState<
    OrganizeHistoryEntry[]
  >([]);
  const [shortcutPromptDismissedAt, setShortcutPromptDismissedAt] = useState<
    number | null
  >(null);
  const [hintVisibleForResult, setHintVisibleForResult] = useState(false);
  // 当前进入 RecordFlow 的来源（more 侧边栏 vs 首页快捷入口）
  const [recordEntrySource, setRecordEntrySource] = useState<
    "more" | "homeShortcut"
  >("more");

  // —— 首页轻反馈（先保存回首页后由在在展示，几秒后自动清除） ——
  // 项目记忆约束：对话文本浮动展示，不使用气泡容器；不做 toast 通知。
  const [homeFeedback, setHomeFeedback] = useState<string | null>(null);
  const homeFeedbackTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (homeFeedbackTimer.current)
        window.clearTimeout(homeFeedbackTimer.current);
    };
  }, []);

  const showHomeFeedback = (text: string) => {
    setHomeFeedback(text);
    if (homeFeedbackTimer.current)
      window.clearTimeout(homeFeedbackTimer.current);
    homeFeedbackTimer.current = window.setTimeout(() => {
      setHomeFeedback(null);
      homeFeedbackTimer.current = null;
    }, 4000);
  };

  // 7 天冷却（毫秒）
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

  // 判断是否满足快捷入口提示触发条件（基于历史含本次新条目）
  const checkShortcutPrompt = (
    history: RecordEntry[],
  ): boolean => {
    // 已开启 → 不提示
    if (homeShortcut) return false;
    // 7 天内点过「暂不」→ 不提示
    if (
      shortcutPromptDismissedAt &&
      Date.now() - shortcutPromptDismissedAt < SEVEN_DAYS
    )
      return false;

    const complete = history.filter((r) => r.isComplete);
    if (complete.length === 0) return false;

    // 条件 1：连续 3 个自然日内每天至少 1 条完整记录
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayMs = 24 * 60 * 60 * 1000;
    const d1Start = today.getTime();
    const d2Start = d1Start - dayMs;
    const d3Start = d2Start - dayMs;
    const hasD1 = complete.some(
      (r) => r.completedAt >= d1Start,
    );
    const hasD2 = complete.some(
      (r) => r.completedAt >= d2Start && r.completedAt < d1Start,
    );
    const hasD3 = complete.some(
      (r) => r.completedAt >= d3Start && r.completedAt < d2Start,
    );
    if (hasD1 && hasD2 && hasD3) return true;

    // 条件 2：过去 7 天内累计 ≥ 5 条完整记录
    const sevenDaysAgo = Date.now() - SEVEN_DAYS;
    if (complete.filter((r) => r.completedAt >= sevenDaysAgo).length >= 5)
      return true;

    // 条件 3：同一核心记录类型累计 ≥ 3 次完整记录
    const byType: Record<string, number> = {};
    for (const r of complete) {
      byType[r.type] = (byType[r.type] ?? 0) + 1;
      if (byType[r.type] >= 3) return true;
    }

    // 条件 4：连续 2 次从「更多」进入并完成完整记录
    const last2 = complete.slice(-2);
    if (
      last2.length === 2 &&
      last2.every((r) => r.entrySource === "more")
    )
      return true;

    return false;
  };

  // 由 RecordFlow 在每次完成时回调
  // weightValue：体重记录专用，保存当前体重值（KG），用于下次进入体重页的默认值
  // sleep：同一天只保留一条睡眠记录，保存新记录时覆盖当天已有睡眠记录
  const handleRecordComplete = (e: {
    typeId: RecordTypeId;
    isComplete: boolean;
    weightValue?: number;
  }) => {
    const entry: RecordEntry = {
      id: Math.random().toString(36).slice(2),
      type: e.typeId,
      completedAt: Date.now(),
      isComplete: e.isComplete,
      entrySource: recordEntrySource,
      status: "complete",
      savedBy: "wizard",
      ...(e.typeId === "weight" && typeof e.weightValue === "number"
        ? { weight: e.weightValue }
        : {}),
    };
    // 睡眠：同自然日覆盖，而非追加多条
    const newHistory =
      e.typeId === "sleep"
        ? ((): RecordEntry[] => {
            const todayKey = new Date(entry.completedAt).toDateString();
            const filtered = recordHistory.filter(
              (r) =>
                !(
                  r.type === "sleep" &&
                  new Date(r.completedAt).toDateString() === todayKey
                ),
            );
            return [...filtered, entry];
          })()
        : [...recordHistory, entry];
    setRecordHistory(newHistory);

    // 基于新历史（含本次）判断是否在完成页展示提示
    if (e.isComplete && checkShortcutPrompt(newHistory)) {
      setHintVisibleForResult(true);
    } else {
      setHintVisibleForResult(false);
    }
  };

  // 先记到这儿：低能量退出，保存为 basic 记录
  // 不进入完成页、不展示能量、不触发快捷入口提示；直接回首页 + 轻反馈
  const handleSaveFirst = (e: {
    typeId: RecordTypeId;
    answers: Answers;
  }) => {
    const entry: RecordEntry = {
      id: Math.random().toString(36).slice(2),
      type: e.typeId,
      completedAt: Date.now(),
      isComplete: false,
      entrySource: recordEntrySource,
      status: "basic",
      savedBy: "saveFirst",
    };
    setRecordHistory((prev) => [...prev, entry]);
    // 不调用 checkShortcutPrompt：basic 记录不计入完整记录触发条件
    setHintVisibleForResult(false);
    // 退出 moreDetail 层回首页
    setMode("home");
    // 在在展示轻反馈气泡
    showHomeFeedback("已经帮你保存了。");
  };

  // 安全承接页：退出记录流程，打开 ZAIYA 对话并预填 starter 文案
  // 不保存任何记录、不回首页、不展示轻反馈；直接进入对话模式
  const handleOpenZaiyaDialog = (starterText: string) => {
    setMoreDetailId(null);
    setInput(starterText);
    setMode("dialog");
  };

  const acceptShortcut = () => {
    setHomeShortcut(true);
    setHintVisibleForResult(false);
  };
  const dismissShortcutHint = () => {
    setShortcutPromptDismissedAt(Date.now());
    setHintVisibleForResult(false);
  };

  // 进入 RecordFlow 时记录来源
  const enterRecordFromMore = () => {
    setRecordEntrySource("more");
    setMoreDetailId("note");
    setMode("moreDetail");
  };
  const enterRecordFromShortcut = () => {
    setRecordEntrySource("homeShortcut");
    setMoreDetailId("note");
    setMode("moreDetail");
  };

  // —— 应用锁拦截：从「更多」侧边栏选择某项时统一走此处理 ——
  // 「记一下」始终不拦截；其余受保护入口在 appLock 开启且本会话未验证时进入 verify 模式，
  // 验证通过后 sessionVerified 置 true，本会话内不再弹验证。
  const handleMoreItemSelect = (id: MoreItemId) => {
    if (id === "note") {
      enterRecordFromMore();
      return;
    }
    // 「我的光」入口暂未开放，不执行路由跳转（正常由 MoreContent 拦截，此处兜底）
    if (id === "energy") return;
    if (
      appLock &&
      !sessionVerified &&
      APP_LOCK_PROTECTED_ITEMS.includes(id)
    ) {
      setPendingProtectedItem(id);
      setMode("verify");
      return;
    }
    setMoreDetailId(id);
    setMode("moreDetail");
  };

  // 验证页：点击「验证并进入」→ 本会话标记已验证 → 进入目标受保护页
  const confirmAppLockVerify = () => {
    if (!pendingProtectedItem) return;
    setSessionVerified(true);
    setMoreDetailId(pendingProtectedItem);
    setPendingProtectedItem(null);
    setMode("moreDetail");
  };
  // 验证页：返回 → 回到更多侧边栏
  const cancelAppLockVerify = () => {
    setPendingProtectedItem(null);
    setMode("more");
  };

  // 进入对话或新消息到达时滚动到底部，确保 mock 历史打开后展示最新上下文。
  // 演示模式下 dialogMessages 由 demoState 注入，步骤切换时同样滚到底部。
  useEffect(() => {
    if (effectiveMode !== "dialog") return;
    const el = scrollRef.current;
    if (!el) return;

    const timer = window.setTimeout(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [dialogMessages, effectiveMode]);

  // 本地模拟发送：不接 LLM / API，仅样式与反馈
  // 演示模式下禁用（输入区已隐藏），保险起见早退
  const send = () => {
    if (demoEnabled) return;
    const text = input.trim();
    if (!text || sending) return;
    const sentAt = new Date();
    setMessages((items) => {
      const nextItems = shouldInsertTimeMarker(items, sentAt)
        ? [
            ...items,
            dialogTimeItem(`time-${sentAt.getTime()}`, sentAt),
          ]
        : [...items];

      return [
        ...nextItems,
        dialogMessageItem(
          `user-${sentAt.getTime()}`,
          "user",
          text,
          sentAt,
        ),
      ];
    });
    setInput("");
    setSending(true);
    // 体验模式：安全承接回复内容较长，给予更长延迟让用户充分阅读
    // 普通回复保持 300–600ms；安全承接回复 800–1100ms
    const isSafetyTrigger =
      IS_EXPERIENCE_MODE && shouldTriggerSafetyResponse(text);
    const delay = isSafetyTrigger
      ? 800 + Math.random() * 300
      : 300 + Math.random() * 300;
    setTimeout(() => {
      const replyAt = new Date();
      // 体验模式：使用小晨统一确定性 Mock 回复（含安全承接逻辑）
      // 演示模式：使用通用 buildDemoReply
      const replyText = IS_EXPERIENCE_MODE
        ? buildXiaochenReply(text)
        : buildDemoReply(text);
      setMessages((m) => [
        ...m,
        dialogMessageItem(
          `zaizai-${replyAt.getTime()}`,
          "zaizai",
          replyText,
          replyAt,
        ),
      ]);
      setSending(false);
    }, delay);
  };

  const closeDialog = () => setMode("home");

  // —— 对话顶部在在动画状态机 ——
  // 检测 sending 由 true→false（回复到达），触发 responding 短窗口
  useEffect(() => {
    const wasSending = prevSendingRef.current;
    prevSendingRef.current = sending;
    if (wasSending && !sending) {
      setReplyJustAppeared(true);
      const t = window.setTimeout(() => setReplyJustAppeared(false), 1200);
      return () => window.clearTimeout(t);
    }
  }, [sending]);

  // 状态优先级：thinking(等待回复) > responding(回复刚出现且未在输入) > listening(聚焦/输入) > idle
  const dialogueAnimState: DialogueAnimState = sending
    ? "thinking"
    : replyJustAppeared && input.trim().length === 0
      ? "responding"
      : inputFocused || input.trim().length > 0
        ? "listening"
        : "idle";

  // 选择缓解能力项：仅「呼吸法」可进入；未开放卡片已标识「暂未开放」标签，点击无反馈。
  // 呼吸法卡片点击：原地展开/收起（不再跳转 breathing 模式）
  const selectRelief = (m: { id: ReliefMethodId; enabled: boolean }) => {
    if (!m.enabled) return;
    if (m.id === "breathing") {
      // countingDown/navigating 状态下不响应，避免干扰倒计时
      setBreathingEntryState((s) =>
        s === "collapsed" ? "expanded" : s === "expanded" ? "collapsed" : s,
      );
    }
  };

  // —— 呼吸法 inline 倒计时 ——
  // 单一 setInterval，可统一清理；倒计时期间锁定 carousel 与收起
  const startBreathingCountdown = () => {
    if (breathingEntryState !== "expanded") return;
    if (breathingCountdownTimerRef.current) return; // 防止重复触发

    // 锁定当前选择的呼吸法
    setPendingBreathingMethod(breathingActiveCard);
    setBreathingEntryState("countingDown");
    // 倒计时开始时预加载 BreathingFlow 资源，避免进入时白屏
    loadBreathingFlow();

    let next = 3;
    setBreathingCountdown(next);
    breathingCountdownTimerRef.current = window.setInterval(() => {
      next -= 1;
      if (next <= 0) {
        if (breathingCountdownTimerRef.current) {
          window.clearInterval(breathingCountdownTimerRef.current);
          breathingCountdownTimerRef.current = null;
        }
        setBreathingEntryState("navigating");
        setBreathingEntryInline(true);
        setBreathingCountdown(null);
        // 进入呼吸练习页（BreathingFlow 用 pendingBreathingMethod + practice 初始化）
        setMode("breathing");
        return;
      }
      setBreathingCountdown(next);
    }, 1000);
  };

  // 从呼吸页返回时重置 inline 状态（避免残留 countingDown/navigating）
  const resetBreathingEntry = () => {
    setBreathingEntryInline(false);
    setBreathingEntryState("collapsed");
    setBreathingCountdown(null);
    if (breathingCountdownTimerRef.current) {
      window.clearInterval(breathingCountdownTimerRef.current);
      breathingCountdownTimerRef.current = null;
    }
  };

  // 缓解主页左上角返回：始终可用，不依赖浏览器历史，倒计时期间也保证退出路径。
  // 必须先停掉倒计时 timer + 重置 inline 状态，再切回 home，避免后台继续倒计时自动跳呼吸页。
  // 再次进入「缓解」时恢复默认收起状态（resetBreathingEntry 已置 collapsed），不恢复上次展开态。
  const handleReliefBackToHome = () => {
    if (breathingCountdownTimerRef.current) {
      window.clearInterval(breathingCountdownTimerRef.current);
      breathingCountdownTimerRef.current = null;
    }
    resetBreathingEntry();
    setMode("home");
  };

  // 练习中长按结束 / 停止确认退出：回到缓解主页，呼吸法保持展开并保留所选方法。
  // 不收起、不回到旧选择页；状态式切换天然「replace」，浏览器返回不会重回练习页。
  const returnToReliefExpanded = (methodIdx: number) => {
    setBreathingEntryInline(false);
    setBreathingActiveCard(methodIdx);
    setBreathingEntryState("expanded");
    setBreathingCountdown(null);
    if (breathingCountdownTimerRef.current) {
      window.clearInterval(breathingCountdownTimerRef.current);
      breathingCountdownTimerRef.current = null;
    }
    setMode("reliefSelect");
  };

  // 组件卸载时清理倒计时 timer
  useEffect(() => {
    return () => {
      if (breathingCountdownTimerRef.current) {
        window.clearInterval(breathingCountdownTimerRef.current);
        breathingCountdownTimerRef.current = null;
      }
    };
  }, []);

  // —— Intent Prefetch：首页核心 icon hover/focus 时预加载对应模块 ——
  const prefetchBreathing = usePrefetch(() => {
    loadBreathingFlow();
  });
  const prefetchPresenceRoom = usePrefetch(() => {
    loadPresenceRoom();
    // 一起发呆入口：预加载场景背景视频（仅背景，不预加载姿势动画）
    preloadVideo("./assets/social/daze/scene-together-15s.webm");
  });

  // 核心按钮：preview 仅瞬时反馈；interactive 触发回调
  // id 0 = AI对话 → 进入首页内对话模式（不跳转下一屏）
  // id 1 = Wind → 进入首页内缓解选择态（不触发 onNext / 不向上回调）
  // id 2 = Users → 瞬时按压反馈 + 可选回调
  const coreHandlers = (i: number) => {
    if (previewMode || !interactive) {
      return {
        onPointerDown: () => setActive(i),
        onPointerUp: () => setActive(null),
        onPointerLeave: () => setActive(null),
      };
    }
    // 预加载映射：i=1 → BreathingFlow，i=2 → PresenceRoom
    const prefetch =
      i === 1 ? prefetchBreathing : i === 2 ? prefetchPresenceRoom : undefined;
    return {
      onClick: () => {
        if (i === 0) {
          // AI对话：进入首页内对话模式（不再触发 onNext）
          setMode("dialog");
          return;
        }
        if (i === 1) {
          // Wind（快速缓解压力）：进入首页内缓解选择态（不跳转下一屏）
          setMode("reliefSelect");
          return;
        }
        if (i === 2) {
          // Users（陪做）：进入首页内轻社交场景选择态（不跳转下一屏）
          setMode("socialSelect");
          return;
        }
        // 其他按钮：瞬时按压反馈，可选回调
        setActive(i);
        setTimeout(() => setActive(null), 300);
        onButtonClick?.(i);
      },
      ...(prefetch
        ? {
            onPointerEnter: prefetch,
            onFocus: prefetch,
            onTouchStart: prefetch,
            onPointerDown: prefetch,
          }
        : {}),
    };
  };

  // icon 默认色：略深于 ink-soft，用 ink/80 保持克制；active 用 ink
  const iconColor = (i: number) =>
    active === i ? "text-ink" : "text-ink/80";

  // 是否处于任一缓解模式（用于背景降噪与首页 icon 弱化）
  const inRelief = effectiveMode === "reliefSelect" || effectiveMode === "breathing";

  return (
    <div className="relative h-full w-full bg-white">
      {/* iOS 风格状态栏
          z-[30] 高于内容模块(z-10)和渐变遮罩(z-25)，但低于全屏覆盖层
          （侧边栏 z-40/41、moreDetail z-60、verify z-70、关闭按钮 z-80），
          使侧边栏等全屏覆盖时状态栏被正确遮挡。
          socialFlow 为暗色沉浸场景（一起发呆 / 一起吃饭），隐藏状态栏。 */}
      {effectiveMode !== "socialFlow" && <PhoneStatusBar now={effectiveNow} />}

      {/* 缓解模式背景降噪：浅柔灰覆盖，不使用强色。pointer-events-none 不阻断交互 */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-surface-muted"
        initial={false}
        animate={{ opacity: inRelief ? 0.5 : 0 }}
        transition={{ duration: 0.4, ease }}
      />

      {/* 在在 + 气泡：home 居中(top 38%)；非 home 上移到中上部并固定。
          dialog 模式按「动画主体」而非 GIF 画布外框定位：
          GIF 画布 9:16，主体只占 y=27%~67%，上下大片透明留白，
          若直接按画布外框上移，移动的是容器而非主体，主体视觉仍偏下。
          dialog 使用 ZaiyaWakeAnimation 的专用主体 slot，压缩无效透明留白。
          渐隐过渡层放在对话页面内部，以消息区上缘为定位基准，
          不绑定 GIF wrapper 边界，避免覆盖主体。
          其余非 home 模式(reliefSelect / socialSelect)保持 top 15%。
          socialFlow / breathing 下在在完全退出（不渲染）。 */}
      <motion.div
        className={`absolute inset-x-0 z-10 flex flex-col items-center ${
          effectiveMode === "dialog" ? "h-[220px]" : ""
        }`}
        initial={false}
        animate={{
          top:
            effectiveMode === "home"
              ? variant === "immersive"
                ? "39%"
                : "34%"
              : effectiveMode === "dialog"
                ? "4%"
                : "15%",
          scale: effectiveMode === "home" ? 1 : 0.65,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      >
        {effectiveMode !== "socialFlow" &&
          effectiveMode !== "breathing" &&
          effectiveMode !== "reliefSelect" &&
          effectiveMode !== "record" &&
          effectiveMode !== "praise" &&
          effectiveMode !== "lookback" &&
          effectiveMode !== "organize" && (
          <div className="relative">
            {effectiveMode === "home" && variant === "immersive" ? (
              <ZaizaiHomeScene
                phase={effectiveHomePhase}
                preloadAll
                guide={
                  onDemoBubbleClick && demoEnabled ? (
                    <motion.button
                      type="button"
                      onClick={onDemoBubbleClick}
                      whileTap={{ scale: 1.02 }}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2, ease }}
                      className="pointer-events-auto block cursor-pointer rounded-lg text-center"
                    >
                      <HomeBubbleCopy
                        phase={effectiveHomePhase}
                        overrideCopy={
                          demoEnabled ? demoState?.bubbleCopy : undefined
                        }
                        emphasisText={
                          demoEnabled ? demoState?.bubbleEmphasis : undefined
                        }
                      />
                    </motion.button>
                  ) : (
                    <HomeBubbleCopy
                      phase={effectiveHomePhase}
                      overrideCopy={
                        demoEnabled ? demoState?.bubbleCopy : undefined
                      }
                      emphasisText={
                        demoEnabled ? demoState?.bubbleEmphasis : undefined
                      }
                    />
                  )
                }
              />
            ) : effectiveMode === "home" && variant === "hero" ? (
              // 落地页 Hero 预览：固定 morning 时段拉开窗帘动画，与 Demo 主页视觉结构一致（不接入实时）
              <ZaizaiHomeScene
                phase="morning"
                guide={<HomeBubbleCopy phase="morning" />}
              />
            ) : effectiveMode === "dialog" ? (
              <DialogueZaiyaAnimation
                state={dialogueAnimState}
                onRespondingEnd={() => setReplyJustAppeared(false)}
              />
            ) : (
              <video
                src="./assets/zaiya/zaizai-eating.webm"
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                className="block h-[338px] w-[190px] max-w-none select-none object-contain"
                style={{
                  transform: "translateY(10px) scale(1.12)",
                  transformOrigin: "center center",
                }}
              />
            )}
          </div>
        )}
      </motion.div>

      {/* 首页时间锚点：时段+时间（主）/ 日期·周几（次），放在在在动画上方。
          仅 immersive 首页；由 AnimatePresence 控制挂载/卸载——每次回到 home 重新交错入场，
          进入底部三个功能模块时轻上移淡出。动效复用全局 softReveal 语言（与「更多」菜单一致）。 */}
      <AnimatePresence>
        {effectiveMode === "home" && (variant === "immersive" || variant === "hero") && (
          <HomeTimeAnchor key="home-time-anchor" now={effectiveNow} />
        )}
      </AnimatePresence>

      {/* 首页轻反馈：先保存回首页后由在在展示，纯文字浮动（无气泡容器），几秒后自动消失。
          仅在 home 模式且 homeFeedback 有值时显示。 */}
      <AnimatePresence>
        {effectiveMode === "home" && homeFeedback && (
          <motion.div
            key="home-feedback"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3, ease }}
            className="pointer-events-none absolute inset-x-0 z-20 flex justify-center px-8"
            style={{ top: "62%" }}
          >
            <p className="text-center text-[13px] leading-relaxed text-ink-soft">
              {homeFeedback}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* home 模式：四角图标；非 home 模式（dialog / reliefSelect / breathing）淡出并禁用点击 */}
      <div
        className={`absolute inset-0 bg-white transition-opacity duration-300 ${
          effectiveMode === "home" ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* 左上：菜单入口（汉堡菜单）—— 位于状态栏下方，低频收纳。interactive 下点击进入更多 */}
        <button
          aria-label="菜单"
          onClick={() => {
            if (interactive) {
              setMode("more");
            } else {
              setActive(10);
              setTimeout(() => setActive(null), 300);
            }
          }}
          onPointerDown={() => {
            if (!interactive) setActive(10);
          }}
          onPointerUp={() => {
            if (!interactive) setActive(null);
          }}
          onPointerLeave={() => {
            if (!interactive) setActive(null);
          }}
          className={`absolute left-6 top-14 p-1 transition-colors ${
            active === 10 ? "text-ink" : "text-ink/80"
          }`}
        >
          <HomeBreathingMenuIcon className="h-6 w-6" />
        </button>

        {/* 右上：默认空置；homeShortcut 开启后显示「记一下」快捷入口。
            点击直接进入 RecordFlow（绕过 more 侧边栏）。 */}
        {homeShortcut && (
          <button
            aria-label="记一下"
            onClick={enterRecordFromShortcut}
            className="absolute right-6 top-14 p-1 transition-colors hover:text-ink text-ink/80"
          >
            <BookOpen className="h-5 w-5" strokeWidth={1.8} />
          </button>
        )}

        {/* 左下：陪做类入口 */}
        <button
          aria-label="陪做"
          {...coreHandlers(2)}
          className={`absolute bottom-8 left-6 p-1 transition-colors ${iconColor(2)}`}
        >
          <Users className="h-6 w-6" strokeWidth={1.8} />
        </button>

        {/* 右下：两个高频即时入口横向排列 —— Wind（左）+ AI对话（右，最右下角，略大） */}
        <div className="absolute bottom-8 right-6 flex flex-row items-end gap-4">
          <button
            aria-label="快速缓解压力"
            {...coreHandlers(1)}
            className={`p-1 transition-colors ${iconColor(1)}`}
          >
            <Wind className="h-6 w-6" strokeWidth={1.8} />
          </button>

          <button
            aria-label="AI对话"
            {...coreHandlers(0)}
            className={`p-1 transition-colors ${iconColor(0)}`}
          >
            <MessageCircle className="h-7 w-7" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* dialog 模式：对话内容区 + 输入区（首页内展开，非独立页面） */}
      <AnimatePresence>
        {effectiveMode === "dialog" && (
          <FeaturePageTransition
            key="dialog-layer"
            pageKey="dialog"
            onExit={closeDialog}
            enableDragExit={!demoEnabled}
          >
            {/* 消息区顶部渐变蒙层：只覆盖消息列表顶端，让上滑内容自然淡出。 */}
            <div
              className="pointer-events-none absolute inset-x-0 z-[25] h-16 bg-gradient-to-b from-white/95 via-white/70 to-white/0"
              style={{ top: "33%" }}
            />

            {/* 对话内容区：独立容器，位于在在动画下方、输入区上方，可滚动。
                正常展示 mock 历史记录；dialogMessages 为空时保留轻量引导文案作为兜底。
                top 33% 确保在在动画固定陪伴区（260px 高 + top 7%）下方，保留明确间距不重叠；
                bottom 92px 让出底部输入区，最后一条气泡不被遮挡。
                演示模式注入对话脚本时（hideInputDialog）输入区隐藏，bottom 收到 24px 让消息区下扩。 */}
            <motion.div
              ref={scrollRef}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35, ease, delay: 0.05 }}
              className="no-scrollbar absolute inset-x-0 z-20 overflow-y-auto px-6 pt-2"
              style={{ top: "33%", bottom: hideInputDialog ? "24px" : "92px" }}
            >
              {dialogMessages.length === 0 ? (
                <p className="text-[13px] leading-relaxed text-ink-faint">
                  在这里说一句话试试。
                </p>
              ) : (
                <div className="flex flex-col pb-6">
                  {dialogMessages.map((m, i) => {
                    if (m.kind === "time") {
                      return (
                        <motion.div
                          key={m.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, ease }}
                          className={[
                            "w-fit self-center text-[11px] font-medium leading-[16px] text-[var(--chat-text-muted)]",
                            i === 0 ? "" : "mt-4",
                            i === dialogMessages.length - 1 ? "" : "mb-2",
                          ].join(" ")}
                        >
                          {m.label}
                        </motion.div>
                      );
                    }

                    const isUser = m.role === "user";
                    const prev = i > 0 ? dialogMessages[i - 1] : null;
                    const sameAsPrev =
                      prev?.kind === "message" && prev.role === m.role;
                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease }}
                        className={[
                          "w-fit max-w-[78%] rounded-[18px] py-[11px] px-[15px] text-[14px] leading-[1.65]",
                          isUser
                            ? "self-end bg-[#F2F2F0] text-[var(--chat-text-primary)]"
                            : "self-start border border-[#E7E7E3] bg-white text-[var(--chat-text-secondary)]",
                          i === 0 ? "" : sameAsPrev ? "mt-1.5" : "mt-4",
                        ].join(" ")}
                      >
                        {m.text}
                      </motion.div>
                    );
                  })}
                  {sending && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 w-fit max-w-[78%] self-start rounded-[18px] border border-[#E7E7E3] bg-white py-[11px] px-[15px] text-[13px] text-[var(--chat-text-muted)]"
                    >
                      在在正在听…
                    </motion.div>
                  )}
                  {dialogActionCard && (
                    <motion.button
                      type="button"
                      onClick={dialogActionCard.onClick}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease }}
                      className="mt-4 w-full rounded-2xl border border-line-soft bg-white px-4 py-3 text-left shadow-[0_4px_18px_-12px_rgba(39,51,31,0.22)] transition-colors hover:border-line focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
                    >
                      <p className="text-[14px] font-semibold leading-[1.4] text-ink">
                        {dialogActionCard.title}
                      </p>
                      <p className="mt-1 text-[12px] leading-[1.5] text-ink-soft">
                        {dialogActionCard.description}
                      </p>
                      <div className="mt-2.5 flex justify-end">
                        <span className="rounded-full bg-action-primary px-3.5 py-1 text-[12px] font-medium text-ink">
                          {dialogActionCard.actionLabel}
                        </span>
                      </div>
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>

            {/* 输入区：文字输入 + 语音 + 关闭/发送状态切换
                - 未输入态（input.trim() 为空）：右侧显示关闭按钮（深色圆形 + 白×），点击退出对话
                - 输入态（input.trim() 非空）：右侧显示发送按钮（accent 圆形 + 白↑），点击发送
                - 两种状态互斥，不会同时出现；发送后清空输入自动回到关闭态
                - 演示模式注入对话脚本时整个输入区隐藏，避免评委误触发送导致脚本偏移 */}
            {!hideInputDialog && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.35, ease }}
                className="absolute inset-x-0 bottom-0 px-4 pb-6"
              >
                <div className="flex items-center gap-2 rounded-xl border border-line bg-white p-2">
                  {/* 文本输入：始终可输入，min-w-0 防止被右侧按钮挤压溢出 */}
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (input.trim().length > 0 && !sending) send();
                      }
                    }}
                    placeholder="说点什么…"
                    rows={1}
                    className="min-w-0 flex-1 resize-none bg-transparent p-0 text-[14px] leading-[20px] text-ink placeholder:text-ink-faint focus:outline-none"
                  />
                  {/* 语音入口：compact 轻量 mic 按钮，转录完成后填入输入框 */}
                  <div className="shrink-0">
                    <VoiceInputBar
                      value={input}
                      onChange={setInput}
                      onSend={send}
                      canSend={input.trim().length > 0 && !sending}
                      compact
                      size="sm"
                    />
                  </div>
                  {/* 右侧状态按钮：关闭 / 发送互斥，依据 input.trim() 切换，二者不会同时出现 */}
                  {input.trim().length > 0 ? (
                    <button
                      onClick={send}
                      aria-label="发送"
                      disabled={sending}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-white transition-transform active:scale-95 disabled:opacity-50"
                    >
                      <ArrowUp className="h-4 w-4" strokeWidth={1.8} />
                    </button>
                  ) : (
                    <button
                      onClick={closeDialog}
                      aria-label="关闭对话"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-action-deep text-white transition-transform active:scale-95"
                    >
                      <X className="h-4 w-4" strokeWidth={1.8} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </FeaturePageTransition>
        )}
      </AnimatePresence>

      {/* reliefSelect 模式：缓解能力项选择区（首页内展开，非独立页面）
          * 三层结构：顶部在在透明动画（无文案）→ 当前可用（呼吸法主卡片）→ 更多方式（3 个预告）。
          * 顶部只承担“在在安静存在”的作用，不增加任何文案、提示或行动引导。
          * 用不透明 bg-white z-20 层覆盖底下的 zaizai-eating 视频，避免视觉冲突。 */}
      <AnimatePresence>
        {effectiveMode === "reliefSelect" && (
          <FeaturePageTransition
            key="relief-select"
            pageKey="reliefSelect"
            onExit={() => setMode("home")}
            enableDragExit={!demoEnabled}
          >
            {/* 右上角我的光入口：统一组件（floating），与记一下 / 轻社交同一位置规则 */}
            <EnergyBadge position="floating" />
            {/* 左上角固定返回入口：与二级页返回按钮同款（left-5 top-12），
                收起 / 展开 / 倒计时各状态下始终显示且可点击，直接回产品主页。
                z-50 高于 FeaturePageTransition 拖拽手柄(z-30)，保证退出路径不被拦截。 */}
            <button
              type="button"
              onClick={handleReliefBackToHome}
              aria-label="返回主页"
              className="absolute left-5 top-12 z-50 grid h-8 w-8 place-items-center rounded-full text-ink-soft outline-none transition-colors hover:bg-line-soft hover:text-ink focus-visible:outline-none"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={1.8} />
            </button>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease }}
              className="absolute inset-0 z-20 flex flex-col bg-white px-6"
            >
              {/* 顶部在在透明动画 + 气泡引导 */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease, delay: 0.05 }}
                className="flex flex-col items-center"
                style={{ paddingTop: 68 }}
              >
                <video
                  src="./assets/zaiya/zaiya-transparent.webm"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="block h-[152px] w-[152px] select-none object-contain"
                  style={{ transform: "scale(1.12)", transformOrigin: "center center" }}
                />
                <p className="mt-1 text-[13px] leading-relaxed text-ink-soft/80">
                  不着急，先让自己慢下来。
                </p>
              </motion.div>

              {/* 当前可用：呼吸法主卡片 */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease, delay: 0.1 }}
                style={{ marginTop: 28 }}
              >
                <div className="mb-[10px] text-[13px] font-medium leading-5 text-[#7B8376]">
                  当前可用
                </div>
                <button
                  onClick={() => selectRelief({ id: "breathing", enabled: true })}
                  onPointerEnter={prefetchBreathing}
                  onFocus={prefetchBreathing}
                  onTouchStart={prefetchBreathing}
                  onPointerDown={prefetchBreathing}
                  disabled={
                    breathingEntryState === "countingDown" ||
                    breathingEntryState === "navigating"
                  }
                  className="flex w-full items-center gap-[14px] rounded-2xl bg-white p-[16px_18px] text-left transition-colors hover:border-[#C7CCBF] disabled:cursor-default"
                  style={{ border: "1px solid #D8DDD3", boxShadow: "none", minHeight: 88 }}
                >
                  <Waves className="h-7 w-7 text-ink-soft" strokeWidth={1.8} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[16px] font-semibold leading-6 text-[#2F392B]">
                      呼吸法
                    </div>
                    <div className="mt-[3px] text-[13px] font-normal leading-5 text-[#737A70]">
                      {breathingEntryState === "collapsed"
                        ? "四种节奏可选"
                        : "选择一种适合现在的节奏"}
                    </div>
                  </div>
                  {breathingEntryState === "collapsed" ? (
                    <ChevronRight className="h-5 w-5 text-ink-faint" strokeWidth={1.8} />
                  ) : (
                    <ChevronUp className="h-5 w-5 text-ink-faint" strokeWidth={1.8} />
                  )}
                </button>
              </motion.div>

              {/* 呼吸法 inline 展开区域：原地展开 BreathingCarousel（不跳转路由） */}
              <AnimatePresence initial={false}>
                {breathingEntryState !== "collapsed" && (
                  <motion.div
                    key="breathing-inline"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6">
                      <BreathingCarousel
                        methods={BREATHING_METHODS}
                        activeIndex={breathingActiveCard}
                        locked={breathingEntryState !== "expanded"}
                        onActiveChange={(i) => {
                          // countingDown/navigating 状态下锁定 carousel
                          if (breathingEntryState === "expanded") {
                            setBreathingActiveCard(i);
                          }
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 更多方式：3 个紧凑预告（不可点击）；展开时隐藏 */}
              <AnimatePresence initial={false}>
                {breathingEntryState === "collapsed" && (
                  <motion.div
                    key="more-methods"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div style={{ marginTop: 22 }}>
                      <div className="mb-[10px] text-[13px] font-medium leading-5 text-[#7B8376]">
                        更多方式
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {reliefMethods
                          .filter((m) => !m.enabled)
                          .map((m) => (
                            <div
                              key={m.id}
                              className="flex min-h-[86px] flex-col items-center justify-center rounded-[14px] bg-white p-[12px_8px]"
                              style={{
                                border: "1px solid #E5E6E2",
                                boxShadow: "none",
                                cursor: "default",
                              }}
                            >
                              <m.Icon className="h-6 w-6 text-[#858B82]" strokeWidth={1.8} />
                              <div className="mt-[7px] text-[13px] font-medium leading-[19px] text-[#858B82]">
                                {m.label}
                              </div>
                              <div className="mt-[2px] text-[10px] leading-[15px] text-[#A0A49D]">
                                即将开放
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 底部按钮：仅承担本页主操作。
                呼吸法收起时底部空白（页面返回已由左上角 ← 负责）；
                展开 / 倒计时时显示「开始」按钮（原位倒计时）。 */}
            {breathingEntryState !== "collapsed" && (
              <div className="absolute inset-x-0 bottom-6 z-40 mx-auto flex justify-center px-6">
                <button
                  onClick={startBreathingCountdown}
                  disabled={breathingEntryState !== "expanded"}
                  aria-label={breathingCountdown === null ? "开始呼吸练习" : `倒计时 ${breathingCountdown}`}
                  className="grid min-w-[104px] place-items-center rounded-full bg-action-primary px-12 py-3 text-[15px] font-medium tracking-wide text-action-primary-text transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-80"
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={breathingCountdown ?? "start"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {breathingCountdown === null ? "开始" : `${breathingCountdown}`}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </div>
            )}
          </FeaturePageTransition>
        )}
      </AnimatePresence>

      {/* breathing 模式：呼吸法选择 / 练习 / 完成全流程（独立全屏覆盖层）
          * 从缓解首页 inline 入口进入时（breathingEntryInline=true）直接传 practice 子视图 + 锁定的呼吸法；
          * 其他入口（如演示模式）走默认 select 子视图。旧 select 子视图代码保留，仅正常入口不再跳转到它。 */}
      <AnimatePresence>
        {effectiveMode === "breathing" && (
          <Suspense fallback={null}>
            <BreathingFlow
              onBackToRelief={() => {
                resetBreathingEntry();
                setMode("reliefSelect");
              }}
              onGoHome={() => {
                resetBreathingEntry();
                setMode("home");
              }}
              onExitToRelief={returnToReliefExpanded}
              initialMethodIndex={
                breathingEntryInline ? pendingBreathingMethod : 0
              }
              initialSubView={
                breathingEntryInline ? "practice" : "select"
              }
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* socialSelect 模式：轻社交场景选择（首页内展开，在在已上移并保留气泡） */}
      <AnimatePresence>
        {effectiveMode === "socialSelect" && (
          <>
            <Suspense fallback={null}>
              <SocialSceneSelectContent
                onSelect={(s) => {
                  setSocialScene(s);
                  socialSessionIdRef.current = createSocialSessionId(s);
                  setMode("socialFlow");
                }}
                onClose={() => setMode("home")}
              />
            </Suspense>
            {/* 右上角我的光入口：统一组件（floating），top-14 与记一下 pt-14 一致 */}
            <EnergyBadge
              pulse={socialEnergyPulse}
              buttonRef={socialEnergyBtnRef}
              position="floating"
            />
            {/* 光反馈：完成有效行动后飞向右上角入口 */}
            <EnergyRewardFeedback
              event={socialEnergyReward}
              targetRef={socialEnergyBtnRef}
              onArrive={handleSocialEnergyArrive}
              onDone={handleSocialEnergyDone}
            />
          </>
        )}
      </AnimatePresence>

      {/* socialFlow 模式：选中场景后的流程页（一起发呆 / 一起吃饭）。
          全屏覆盖，在在退出；退出后回到轻社交场景选择页。
          一起发呆：onExit=准备态返回（无奖励），onFinish=长按结束（触发当下光反馈并回主页）
          演示模式下 socialScene 由 demoState 注入；onExit/onFinish 在演示模式下不会触发状态变更。 */}
      <AnimatePresence>
        {effectiveMode === "socialFlow" && effectiveSocialScene && (
          <>
            {effectiveSocialScene === "daze" && (
              <Suspense fallback={null}>
                <DazeFlow
                  onExit={() => setMode("socialSelect")}
                  onFinish={handleDazeFinish}
                />
              </Suspense>
            )}
            {effectiveSocialScene === "eat" && (
              <Suspense fallback={null}>
                <EatFlow
                  onExit={() => setMode("socialSelect")}
                  onFinish={handleEatFinish}
                />
              </Suspense>
            )}
          </>
        )}
      </AnimatePresence>

      {/* record 模式：演示用「记一下」完成态预览。
          仅 demoState.recordPreset 驱动，不走真实记录流程。
          全屏白底覆盖，在在退出；复用 RecordSummaryCard 展示字段 + 已保存盖章。 */}
      <AnimatePresence>
        {effectiveMode === "record" && demoState?.recordPreset && (
          <Suspense fallback={null}>
            <DemoRecordPreview preset={demoState.recordPreset} />
          </Suspense>
        )}
      </AnimatePresence>

      {/* praise 模式：演示用真实结构「夸夸自己」首页 feed。
          仅 demoState.praiseDemo 驱动，不写入 localStorage、不触发能量奖励。 */}
      <AnimatePresence>
        {effectiveMode === "praise" && demoState?.praiseDemo && (
          <Suspense fallback={null}>
            <DemoPraisePreview preset={demoState.praiseDemo} />
          </Suspense>
        )}
      </AnimatePresence>

      {/* lookback 模式：演示用真实「回头看看」受控只读结果态。
          复用 LookbackPage 的周/月、分类标签和记录详情结构，不走旁路总结卡。 */}
      <AnimatePresence>
        {effectiveMode === "lookback" && demoState?.lookbackDemo && (
          <motion.div
            key="demo-lookback"
            className="absolute inset-0 z-30 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease }}
          >
            <Suspense fallback={null}>
              <LookbackPage
                onBack={() => {
                  /* 演示预览：由外部 story panel 导航控制 */
                }}
                demoOptions={{
                  referenceDate: new Date(demoState.lookbackDemo.referenceDate),
                  initialTimeMode: demoState.lookbackDemo.initialTimeMode,
                  initialScene: demoState.lookbackDemo.initialScene,
                  dataOverrides: demoState.lookbackDemo.dataOverrides,
                  readOnly: demoState.lookbackDemo.readOnly,
                }}
              />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {/* organize 模式：演示用真实「帮我整理」结果态。
          view="done" 展示完成页；保留 materialDetail 作为后续演示可选详情态。 */}
      <AnimatePresence>
        {effectiveMode === "organize" && demoState?.organizeDemo && (
          <motion.div
            key="demo-organize"
            className="absolute inset-0 z-30 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease }}
          >
            {demoState.organizeDemo.view === "materialDetail" ? (
              <Suspense fallback={null}>
                <MaterialDetailView
                  session={demoState.organizeDemo.historyEntry.session}
                  title="沟通材料详情"
                  onBack={() => {
                    /* 演示预览：由外部 story panel 导航控制 */
                  }}
                />
              </Suspense>
            ) : (
              <Suspense fallback={null}>
                <DoneStep
                  session={demoState.organizeDemo.historyEntry.session}
                  onBack={() => {
                    /* 演示预览：由外部 story panel 导航控制 */
                  }}
                  onHome={() => {
                    /* 演示预览：由外部 story panel 导航控制 */
                  }}
                  onViewMaterial={() => {
                    /* 演示预览：由外部 story panel 导航控制 */
                  }}
                  readOnly
                />
              </Suspense>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* more 模式：侧边栏从左侧滑入，右侧遮罩弱化主页，点击遮罩关闭。
          演示模式下 effectiveMode 由 demoState 控制，不会进入 more。 */}
      <AnimatePresence>
        {effectiveMode === "more" && (
          <>
            {/* 右侧遮罩：压暗主页背景，点击关闭 */}
            <motion.div
              key="more-overlay"
              className="absolute inset-0 z-[40] bg-ink/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease }}
              onClick={() => setMode("home")}
            />
            {/* 侧边栏面板：左侧贴边，宽度 78%，右侧大圆角 */}
            <motion.div
              key="more-layer"
              className="absolute inset-y-0 left-0 z-[41] w-[78%] rounded-r-[32px] overflow-hidden shadow-[8px_0_30px_-12px_rgba(0,0,0,0.18)]"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.32, ease }}
            >
              <MoreContent
                onSelect={handleMoreItemSelect}
                onClose={() => setMode("home")}
                onUnavailable={showMoreToast}
              />
            </motion.div>

            {/* 「暂未开放」统一提示：居中于手机屏幕底部，与回头看看等模块一致 */}
            <AnimatePresence>
              {moreToastMsg && (
                <motion.div
                  key="more-toast"
                  className="pointer-events-none absolute bottom-24 left-1/2 z-[42] -translate-x-1/2 max-w-[calc(100%-48px)] whitespace-nowrap rounded-full bg-ink/85 px-4 py-2 text-[12px] text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)]"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2, ease }}
                >
                  {moreToastMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>

      {/* moreDetail 模式：完整二级页面，从右侧滑入，完全铺满手机屏幕 */}
      <AnimatePresence>
        {effectiveMode === "moreDetail" && moreDetailId && (
          <motion.div
            key="more-detail-layer"
            className="absolute inset-0 z-[60] bg-white"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease }}
          >
            <MoreDetailContent
              itemId={moreDetailId}
              onBack={() => {
                // 「记一下」返回目标按 entrySource 决定：
                // 从首页快捷入口进入 → 回首页；从更多进入 → 回更多
                if (moreDetailId === "note") {
                  setMode(recordEntrySource === "homeShortcut" ? "home" : "more");
                } else {
                  setMode("more");
                }
              }}
              homeShortcut={homeShortcut}
              setHomeShortcut={setHomeShortcut}
              appLock={appLock}
              setAppLock={setAppLock}
              showShortcutHint={hintVisibleForResult}
              onAcceptShortcut={acceptShortcut}
              onDismissShortcutHint={dismissShortcutHint}
              onRecordComplete={handleRecordComplete}
              onSaveFirst={handleSaveFirst}
              onOpenZaiyaDialog={handleOpenZaiyaDialog}
              recordHistory={recordHistory}
              organizeHistory={organizeHistory}
              onSaveOrganizeToHistory={(entry) =>
                setOrganizeHistory((prev) => [...prev, entry])
              }
              onDeleteOrganizeHistory={(id) =>
                setOrganizeHistory((prev) =>
                  prev.filter((e) => e.id !== id),
                )
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* verify 模式：应用锁模拟验证页（受保护入口被拦截时显示）
          * 全屏覆盖，z-[70] 盖在 moreDetail (z-60)、侧边栏 (z-41) 与状态栏 (z-30) 之上
          * 标题「验证后查看」+ 说明「此内容受应用锁保护。」+ 按钮「验证并进入」
          * 点击验证 → 本会话标记已验证 → 进入目标受保护页；返回 → 回到更多侧边栏 */}
      <AnimatePresence>
        {effectiveMode === "verify" && pendingProtectedItem && (
          <motion.div
            key="verify-layer"
            className="absolute inset-0 z-[70] bg-white"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease }}
          >
            <div className="relative flex h-full flex-col bg-white">
              {/* 顶部：返回 + 标题 */}
              <div className="flex items-center gap-3 px-5 pt-14 pb-2">
                <button
                  onClick={cancelAppLockVerify}
                  aria-label="返回更多"
                  className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-soft"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <h2 className="text-[17px] font-semibold tracking-tight text-ink">
                  验证后查看
                </h2>
              </div>

              {/* 中部：说明 + 验证按钮 */}
              <div className="flex flex-1 flex-col items-center justify-center px-8">
                <p className="text-center text-[14px] leading-relaxed text-ink-soft">
                  此内容受应用锁保护。
                </p>
                <button
                  onClick={confirmAppLockVerify}
                  className="mt-8 rounded-xl bg-action-primary px-6 py-3 text-[14px] font-medium text-action-primary-text transition-opacity hover:opacity-90"
                >
                  验证并进入
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
