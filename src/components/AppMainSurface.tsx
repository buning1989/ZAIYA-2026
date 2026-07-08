import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import {
  Menu,
  MessageCircle,
  Pause,
  BookOpen,
  Users,
  Wind,
  Wifi,
  X,
  Waves,
  Hand,
  Leaf,
  ChevronLeft,
} from "lucide-react";
import VoiceInputBar from "./VoiceInputBar";
import {
  PresenceSelectContent,
  PresenceRoomContent,
  type SceneId,
} from "./PresenceRoom";
import FeaturePageTransition, { CollapseButton } from "./FeaturePageTransition";
import {
  MoreContent,
  MoreDetailContent,
  type MoreItemId,
} from "./MoreMenu";
import ZaizaiVideo, { ZAIZAI_RELIEF_VIDEO_SRC } from "./ZaizaiVideo";
import ZaiyaWakeAnimation from "./ZaiyaWakeAnimation";
import type { Answers, RecordEntry, RecordTypeId } from "@/data/record";
import type { OrganizeHistoryEntry } from "@/data/organize";

const ease = [0.22, 1, 0.36, 1] as const;

/* —— 应用锁受保护入口 ——
 * 仅这 4 个入口被应用锁保护；首页 / 记一下的新建入口 / 帮助与反馈 /
 * 设置首页 / 应用隐私条款 / 用户协议 均不触发验证 */
const APP_LOCK_PROTECTED_ITEMS: MoreItemId[] = [
  "review",
  "organize",
  "praise",
  "privacy",
];

/* —— 首页内缓解模式：3 个核心方法，结构预留扩展到 6 个 ——
 * 仅样式与点击反馈，不含真实心理干预内容。 */
type ReliefMethodId = "breathing" | "grounding" | "mindfulness";

const reliefMethods: {
  id: ReliefMethodId;
  label: string;
  Icon: typeof Waves;
}[] = [
  { id: "breathing", label: "呼吸法", Icon: Waves },
  { id: "grounding", label: "五感接地", Icon: Hand },
  { id: "mindfulness", label: "正念", Icon: Leaf },
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

/* —— iOS 风格手机状态栏（抽象绘制，仅增强真实感，不承担功能） ——
 * 左：时间；右：信号 / Wi-Fi / 电池。颜色 text-ink，接近真实状态栏。
 * 可选关闭按钮（非首页用），位于状态栏右侧之外，不挤占信号区。
 */
export function PhoneStatusBar({
  showClose = false,
  onClose,
}: {
  showClose?: boolean;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-6 pt-3.5 pb-1 text-ink">
        {/* 左：时间 */}
        <span className="text-[12px] font-semibold tracking-wide">9:41</span>
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
          <Wifi className="h-3.5 w-3.5" strokeWidth={2.2} />
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
          className="absolute right-5 top-12 z-20 grid h-7 w-7 place-items-center rounded-full bg-white/50 backdrop-blur-xl border border-white/30 shadow-sm text-ink-faint transition-colors hover:text-ink"
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
 * reliefSelect：在在上移，首页 icon 弱化，下方出现 2×3 缓解方法选择区
 * reliefPractice：在在保留，中部出现节奏动画，底部仅一个暂停按钮；暂停态展开继续 / 回主页
 * presenceSelect：在在上移到中上部并保留气泡，下方出现 4 个场景卡片（共同在场）
 * presenceRoom：在在缩小保留在顶部，下方出现 6 个角色位 + 轻互动按钮 */
type SurfaceMode =
  | "home"
  | "dialog"
  | "reliefSelect"
  | "reliefPractice"
  | "presenceSelect"
  | "presenceRoom"
  | "more"
  | "moreDetail"
  | "verify";

type DialogMessage = { id: number; role: "user" | "zaizai"; text: string };

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
  zaizaiClassName,
}: Props) {
  const [active, setActive] = useState<number | null>(null);

  // —— 首页内模式状态（仅 interactive/immersive 下由对应 icon 触发）——
  const [mode, setMode] = useState<SurfaceMode>("home");
  const [messages, setMessages] = useState<DialogMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // —— 缓解模式状态 ——
  const [reliefMethod, setReliefMethod] = useState<ReliefMethodId | null>(null);
  const [paused, setPaused] = useState(false);
  const rhythmControls = useAnimationControls();
  // —— 一次性下滑提示：首次进入练习态时短暂显示，淡出后不再强提示 ——
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  // —— 共同在场状态 ——
  const [presenceScene, setPresenceScene] = useState<SceneId | null>(null);

  // —— 更多状态 ——
  const [moreDetailId, setMoreDetailId] = useState<MoreItemId | null>(null);

  // —— 首页快捷入口开关 ——
  // 默认关闭：首页右上角保持空置；开启后显示「记一下」快捷入口。
  // 主控在「更多 → 设置 → 首页与快捷入口 → 记一下」；不在记录页主体常驻。
  const [homeShortcut, setHomeShortcut] = useState(false);

  // —— 应用锁 ——
  // appLock：是否开启应用锁，localStorage 持久化（zaiya_app_lock）
  // sessionVerified：本会话内是否已通过验证；不持久化，刷新页面后重置为 false
  // pendingProtectedItem：受保护入口被拦截时暂存目标 id，验证通过后进入该页
  // 受保护入口：回头看看 / 帮我整理 / 我的隐私 / 夸夸自己
  // 不保护：首页 / 记一下的新建入口 / 帮助与反馈 / 设置首页 / 隐私条款 / 用户协议
  const [appLock, setAppLockState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem("zaiya_app_lock") === "true";
    } catch {
      return false;
    }
  });
  const [sessionVerified, setSessionVerified] = useState(false);
  const [pendingProtectedItem, setPendingProtectedItem] =
    useState<MoreItemId | null>(null);
  const setAppLock = (v: boolean) => {
    setAppLockState(v);
    try {
      window.localStorage.setItem("zaiya_app_lock", v ? "true" : "false");
    } catch {
      // 忽略写入失败（隐私模式 / 配额满）
    }
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
    const newHistory = [...recordHistory, entry];
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

  // 新消息进入时滚动到底部
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // 进入练习态时启动节奏动画；离开时停止。不接真实算法，仅 CSS 节奏反馈。
  useEffect(() => {
    if (mode === "reliefPractice") {
      setPaused(false);
      rhythmControls.start({
        scale: [0.9, 1.15, 0.9],
        transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
      });
    }
    return () => {
      rhythmControls.stop();
    };
  }, [mode, rhythmControls]);

  // 一次性下滑提示：仅首次进入练习态时显示 1.5s，localStorage 持久化「已展示」标记。
  // 不每次强提示，避免成为页面噪音。
  useEffect(() => {
    if (mode !== "reliefPractice") return;
    let shown = false;
    try {
      shown =
        window.localStorage.getItem("zaiya_relief_swipe_hint_shown") === "true";
    } catch {
      // 忽略读取失败
    }
    if (shown) return;
    setShowSwipeHint(true);
    try {
      window.localStorage.setItem("zaiya_relief_swipe_hint_shown", "true");
    } catch {
      // 忽略写入失败
    }
    const t = window.setTimeout(() => setShowSwipeHint(false), 1500);
    return () => window.clearTimeout(t);
  }, [mode]);

  // 本地模拟发送：不接 LLM / API，仅样式与反馈
  const send = () => {
    const text = input.trim();
    if (!text || sending) return;
    setMessages((m) => [...m, { id: Date.now(), role: "user", text }]);
    setInput("");
    setSending(true);
    const delay = 300 + Math.random() * 300; // 300–600ms
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, role: "zaizai", text: buildDemoReply(text) },
      ]);
      setSending(false);
    }, delay);
  };

  const closeDialog = () => setMode("home");

  const selectRelief = (id: ReliefMethodId) => {
    setReliefMethod(id);
    setMode("reliefPractice");
  };

  // 退出缓解（练习态 / 选择态均可调用），回到首页并复位
  const exitRelief = () => {
    setMode("home");
    setReliefMethod(null);
    setPaused(false);
  };

  // 进入暂停态：停止节奏动画，展示暂停态操作（继续练习 / 回到主页）。
  // 不直接退出页面，也不在主练习页同时出现多个退出按钮。
  const enterPause = () => {
    setPaused(true);
    rhythmControls.stop();
  };

  // 继续练习：关闭暂停态，恢复节奏动画。
  const resumePractice = () => {
    setPaused(false);
    rhythmControls.start({
      scale: [0.9, 1.15, 0.9],
      transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
    });
  };

  // 在在尺寸：必须给出明确宽高，否则 Rive canvas 会塌陷为 0
  // 父容器是 absolute inset-x-0（无明确高度），不能用百分比，必须用 vh 或 px
  // immersive（Demo 手机 ~390×780）：h-[22vh] w-[22vh] ≈ 172px，占屏幕高度 ~22%
  // hero 用 h-64 w-64
  // presenceRoom 下在在已退出不渲染，无需尺寸
  const resolvedZaizaiClassName =
    zaizaiClassName ??
    (variant === "immersive" ? "h-[22vh] w-[22vh]" : "h-64 w-64");

  // 正念练习页主视觉在在尺寸（与隐私页装饰视频分离，独立管理）
  // 容器 120px → ZaizaiVideo 内部 video h-[170%] ≈ 204px，配合 scale 1 显示约 200px
  // 满足"容器宽度 190–210px"要求；不超过内容宽度 58%（390×0.58≈226px）
  const mindfulnessZaizaiClassName = "h-[120px] w-[120px]";

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
          // Users（陪做）：进入首页内共同在场选择态（不跳转下一屏）
          setMode("presenceSelect");
          return;
        }
        // 其他按钮：瞬时按压反馈，可选回调
        setActive(i);
        setTimeout(() => setActive(null), 300);
        onButtonClick?.(i);
      },
    };
  };

  // icon 默认色：略深于 ink-soft，用 ink/80 保持克制；active 用 ink
  const iconColor = (i: number) =>
    active === i ? "text-ink" : "text-ink/80";

  // 是否处于任一缓解模式（用于背景降噪与首页 icon 弱化）
  const inRelief = mode === "reliefSelect" || mode === "reliefPractice";

  return (
    <div className="relative h-full w-full bg-white">
      {/* iOS 风格状态栏 */}
      <PhoneStatusBar />

      {/* 缓解模式背景降噪：浅柔灰覆盖，不使用强色。pointer-events-none 不阻断交互 */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-line-soft"
        initial={false}
        animate={{ opacity: inRelief ? 0.5 : 0 }}
        transition={{ duration: 0.4, ease }}
      />

      {/* 在在 + 气泡：home 居中(top 38%)；非 home 上移到中上部(top 15%)并固定。
          presenceRoom 下在在完全退出（不渲染），让共同场成为唯一视觉主体，
          避免“AI 陪着看别人”的双中心感。inset-x-0 让容器撑满宽度
          reliefPractice 模式：top 16% + scale 1，主视觉在在尺寸独立管理，
          不与 reliefSelect 共用 scale 0.65，避免压缩练习圆形空间 */}
      <motion.div
        className="absolute inset-x-0 z-10 flex flex-col items-center"
        initial={false}
        animate={{
          top:
            mode === "home"
              ? "38%"
              : mode === "reliefPractice"
                ? "16%"
                : "15%",
          scale: mode === "home" ? 1 : mode === "reliefPractice" ? 1 : 0.65,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      >
        {mode !== "presenceRoom" && (
          <div className="relative">
            {mode === "reliefPractice" ? (
              <ZaizaiVideo
                className={mindfulnessZaizaiClassName}
                src={ZAIZAI_RELIEF_VIDEO_SRC}
                shadow={false}
              />
            ) : (
              <ZaiyaWakeAnimation variant="phone-app" />
            )}
          </div>
        )}
      </motion.div>

      {/* 首页轻反馈：先保存回首页后由在在展示，纯文字浮动（无气泡容器），几秒后自动消失。
          仅在 home 模式且 homeFeedback 有值时显示。 */}
      <AnimatePresence>
        {mode === "home" && homeFeedback && (
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

      {/* home 模式：四角图标；非 home 模式（dialog / reliefSelect / reliefPractice）淡出并禁用点击 */}
      <div
        className={`absolute inset-0 bg-white transition-opacity duration-300 ${
          mode === "home" ? "opacity-100" : "pointer-events-none opacity-0"
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
          <Menu className="h-5 w-5" />
        </button>

        {/* 右上：默认空置；homeShortcut 开启后显示「记一下」快捷入口。
            点击直接进入 RecordFlow（绕过 more 侧边栏）。 */}
        {homeShortcut && (
          <button
            aria-label="记一下"
            onClick={enterRecordFromShortcut}
            className="absolute right-6 top-14 p-1 transition-colors hover:text-ink text-ink/80"
          >
            <BookOpen className="h-5 w-5" strokeWidth={1.6} />
          </button>
        )}

        {/* 左下：陪做类入口 */}
        <button
          aria-label="陪做"
          {...coreHandlers(2)}
          className={`absolute bottom-8 left-6 p-1 transition-colors ${iconColor(2)}`}
        >
          <Users className="h-6 w-6" />
        </button>

        {/* 右下：两个高频即时入口横向排列 —— Wind（左）+ AI对话（右，最右下角，略大） */}
        <div className="absolute bottom-8 right-6 flex flex-row items-end gap-4">
          <button
            aria-label="快速缓解压力"
            {...coreHandlers(1)}
            className={`p-1 transition-colors ${iconColor(1)}`}
          >
            <Wind className="h-6 w-6" />
          </button>

          <button
            aria-label="AI对话"
            {...coreHandlers(0)}
            className={`p-1 transition-colors ${iconColor(0)}`}
          >
            <MessageCircle className="h-7 w-7" />
          </button>
        </div>
      </div>

      {/* dialog 模式：对话内容区 + 输入区（首页内展开，非独立页面） */}
      <AnimatePresence>
        {mode === "dialog" && (
          <FeaturePageTransition
            key="dialog-layer"
            pageKey="dialog"
            onExit={closeDialog}
          >
            {/* 对话内容区：位于在在下方、输入区上方，可滚动 */}
            <motion.div
              ref={scrollRef}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35, ease, delay: 0.05 }}
              className="no-scrollbar absolute inset-x-0 overflow-y-auto px-6"
              style={{ top: "44%", bottom: "92px" }}
            >
              {messages.length === 0 ? (
                <p className="text-[13px] leading-relaxed text-ink-faint">
                  在这里说一句话试试。
                </p>
              ) : (
                <div className="flex flex-col gap-3 pb-4">
                  {messages.map((m) => (
                    <motion.p
                      key={m.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease }}
                      className={`max-w-[78%] text-[14px] leading-relaxed ${
                        m.role === "user"
                          ? "self-end text-ink"
                          : "self-start text-ink-soft"
                      }`}
                    >
                      {m.text}
                    </motion.p>
                  ))}
                  {sending && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="self-start text-[13px] text-ink-faint"
                    >
                      在在正在听…
                    </motion.p>
                  )}
                </div>
              )}
            </motion.div>

            {/* 输入区：收起按钮 + 文字输入 / 语音 / 发送 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.35, ease }}
              className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 px-4 pb-6"
            >
              {/* 左侧收起按钮：独立圆形，向下箭头 */}
              <button
                onClick={closeDialog}
                aria-label="收起对话"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-white text-ink-faint transition-colors hover:text-ink-soft active:bg-line-soft"
              >
                <svg
                  width="16"
                  height="10"
                  viewBox="0 0 18 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 2l7 6 7-6" />
                </svg>
              </button>
              <div className="flex-1">
                <VoiceInputBar
                  value={input}
                  onChange={setInput}
                  onSend={send}
                  canSend={input.trim().length > 0 && !sending}
                  placeholder="说点什么…"
                  sendButtonClassName="bg-action-primary text-action-primary-text"
                  className="rounded-xl border border-line bg-white p-2"
                />
              </div>
            </motion.div>
          </FeaturePageTransition>
        )}
      </AnimatePresence>

      {/* reliefSelect 模式：缓解方法选择区（首页内展开，非独立页面） */}
      <AnimatePresence>
        {mode === "reliefSelect" && (
          <FeaturePageTransition
            key="relief-select"
            pageKey="reliefSelect"
            onExit={() => setMode("home")}
          >
            {/* 选择区：2×3 网格，3 启用 + 3 占位（结构预留扩展到 6 个） */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.35, ease, delay: 0.05 }}
              className="absolute inset-x-0 px-6"
              style={{ top: "54%" }}
            >
              <div className="grid grid-cols-2 gap-3">
                {reliefMethods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => selectRelief(m.id)}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-white py-5 transition-colors hover:border-ink-faint"
                  >
                    <m.Icon className="h-7 w-7 text-ink-soft" strokeWidth={1.6} />
                    <span className="text-[13px] text-ink">{m.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* 底部中央收起按钮 */}
            <CollapseButton onClick={() => setMode("home")} ariaLabel="收起缓解" />
          </FeaturePageTransition>
        )}
      </AnimatePresence>

      {/* reliefPractice 模式：练习节奏区 + 底部单一暂停控件（首页内展开，非独立页面）
          * 信息层级精简：主练习页只保留一个暂停按钮；
          * 退出/收起入口统一收进「暂停态」处理；下滑手势返回主页（语义为「收起练习」）。 */}
      <AnimatePresence>
        {mode === "reliefPractice" && (
          <FeaturePageTransition
            key="relief-practice"
            pageKey="reliefPractice"
            onExit={exitRelief}
          >
            {/* 中部练习节奏区域：在在下方，圆形轻微放大缩小（非真实呼吸算法）。
                中心练习圆形保持视觉主体地位，标题 / 圆形 / 引导文案 / 暂停按钮之间留出呼吸感。
                top 35%：在在底部（约 295px）与圆形顶部（约 309px）保持 ~14-22px 间距，
                圆形中心（约 373px）接近页面视觉中心（390px）。 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.35, ease, delay: 0.05 }}
              className="absolute inset-x-0 flex flex-col items-center"
              style={{ top: "35%" }}
            >
              {/* 标题：当前方法名（极简，仅标示所选方法） */}
              {reliefMethod && (
                <span className="mb-5 text-[13px] tracking-wide text-ink-soft">
                  {reliefMethods.find((m) => m.id === reliefMethod)?.label}
                </span>
              )}
              {/* 中心区域：正念练习视觉圆形 */}
              <motion.div
                animate={rhythmControls}
                className="h-32 w-32 rounded-full border border-line bg-white/60"
              />
              {/* 引导文案：一句当前练习提示，圆形下方 32px 呼吸感 */}
              <p className="mt-8 max-w-[220px] text-center text-[13px] leading-relaxed text-ink-soft">
                跟着圆慢一点。能停下来，就已经够了。
              </p>
            </motion.div>

            {/* 一次性轻提示：首次进入时显示「下滑可以回到主页」，1.5s 后自动淡出，不常驻。
                字号小、颜色浅，不占据主要视觉层级。 */}
            <AnimatePresence>
              {showSwipeHint && (
                <motion.div
                  key="swipe-hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease }}
                  className="pointer-events-none absolute inset-x-0 z-20 flex justify-center px-8"
                  style={{ bottom: "120px" }}
                >
                  <p className="text-[12px] text-ink-faint">下滑可以回到主页</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 底部控制区：练习中仅一个暂停按钮；暂停态展开「继续练习 / 回到主页」。
                不在主练习页同时出现多个退出按钮。 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.35, ease }}
              className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-8"
            >
              {!paused ? (
                /* 练习中：唯一可见控件——暂停按钮（圆形，44px，不强主色）。
                   点击后进入暂停态，不直接退出页面。 */
                <button
                  onClick={enterPause}
                  aria-label="暂停"
                  className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
                >
                  <Pause className="h-5 w-5" />
                </button>
              ) : (
                /* 暂停态：底部轻量面板。
                   「继续练习」为主操作，视觉权重最高；「回到主页」为次级操作，语义为收起练习页。
                   不使用「关闭」「退出」这类偏工具化文案。 */
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease }}
                  className="flex flex-col items-center gap-3"
                >
                  <button
                    onClick={resumePractice}
                    className="h-11 w-40 rounded-full bg-ink text-canvas text-[14px] font-medium tracking-wide transition-opacity hover:opacity-90"
                  >
                    继续练习
                  </button>
                  <button
                    onClick={exitRelief}
                    className="text-[13px] text-ink-faint underline-offset-4 transition-colors hover:text-ink-soft hover:underline"
                  >
                    回到主页
                  </button>
                </motion.div>
              )}
            </motion.div>
          </FeaturePageTransition>
        )}
      </AnimatePresence>

      {/* presenceSelect 模式：场景选择（首页内展开，在在已上移并保留气泡） */}
      <AnimatePresence>
        {mode === "presenceSelect" && (
          <PresenceSelectContent
            onSelect={(s) => {
              setPresenceScene(s);
              setMode("presenceRoom");
            }}
            onClose={() => setMode("home")}
          />
        )}
      </AnimatePresence>

      {/* presenceRoom 模式：6 个角色位 + 轻互动（首页内展开，在在缩小保留在顶部） */}
      <AnimatePresence>
        {mode === "presenceRoom" && presenceScene && (
          <FeaturePageTransition
            key="presence-room"
            pageKey="presenceRoom"
            onExit={() => setMode("home")}
          >
            <PresenceRoomContent
              scene={presenceScene}
              onClose={() => setMode("home")}
            />
          </FeaturePageTransition>
        )}
      </AnimatePresence>

      {/* more 模式：侧边栏从左侧滑入，右侧遮罩弱化主页，点击遮罩关闭 */}
      <AnimatePresence>
        {mode === "more" && (
          <>
            {/* 右侧遮罩：压暗主页背景，点击关闭 */}
            <motion.div
              key="more-overlay"
              className="absolute inset-0 z-40 bg-ink/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease }}
              onClick={() => setMode("home")}
            />
            {/* 侧边栏面板：左侧贴边，宽度 78%，右侧大圆角 */}
            <motion.div
              key="more-layer"
              className="absolute inset-y-0 left-0 z-50 w-[78%] rounded-r-[32px] overflow-hidden shadow-[8px_0_30px_-12px_rgba(0,0,0,0.18)]"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.32, ease }}
            >
              <MoreContent
                onSelect={handleMoreItemSelect}
                onClose={() => setMode("home")}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* moreDetail 模式：完整二级页面，从右侧滑入，完全铺满手机屏幕 */}
      <AnimatePresence>
        {mode === "moreDetail" && moreDetailId && (
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
          * 全屏覆盖，z-[70] 盖在 moreDetail (z-60) 与 more 侧边栏 (z-50) 之上
          * 标题「验证后查看」+ 说明「此内容受应用锁保护。」+ 按钮「验证并进入」
          * 点击验证 → 本会话标记已验证 → 进入目标受保护页；返回 → 回到更多侧边栏 */}
      <AnimatePresence>
        {mode === "verify" && pendingProtectedItem && (
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
                  className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
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
