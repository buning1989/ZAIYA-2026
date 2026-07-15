import { useState, useMemo, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { MoonPhaseIcon } from "./MoonPhaseIcon";
import VoiceInputBar from "./VoiceInputBar";
import PhoneStatusBar from "./PhoneStatusBar";
import {
  buildMonthRange,
  buildWeekRange,
  getWeekStart,
  activityLabel,
  sleepLevelLabel,
  type DailyLookbackData,
  type Mood,
  type MoodEntry,
  type ActivityLevel,
  type MedState,
  type MealState,
} from "@/data/lookback";
import { calculateBMI, getBMIRemark, getUserProfile } from "@/data/userProfile";
import { getStorageMode } from "@/shared/storage/namespacedStorage";
import {
  getXiaochenAllowedMonths,
  getXiaochenAllowedWeekStarts,
  getXiaochenReferenceDate,
  getXiaochenWeekRange,
  getXiaochenMonthRange,
} from "@/apps/experience/selectors/selectLookbackData";

/* —— 体验模式数据源切换（仅调整数据注入，不改变 UI/布局/交互）——
 * 体验模式使用小晨统一数据源（固定 33 天 / 24 记录日），
 * 演示模式保持原有 buildWeekRange / buildMonthRange 行为。 */
function isExperienceModeActive(): boolean {
  return getStorageMode() === "experience";
}

const ease = [0.22, 1, 0.36, 1] as const;

/* —— 页面背景：纯净白 —— */
const PAGE_BG = "#FFFFFF";

/* —— 字段对齐统一口径（与「记一下」保存态共用同一套字段 schema）——
 * EMPTY：所有模块空值统一显示为「未记录」，不再出现「无」「—」「其余字段未记录」。
 * moodWordLabel：情绪文字等级，与「记一下」primaryMoods 对齐（很糟/不太好/一般/还行/很好）。
 * moodDisplay：情绪字段统一口径「一般（3/5）」，兼容趋势数字与语义。 */
const EMPTY = "未记录";

const moodWordLabel: Record<Mood, string> = {
  1: "很糟",
  2: "不太好",
  3: "一般",
  4: "还行",
  5: "很好",
};

function moodDisplay(mood: Mood): string {
  return `${moodWordLabel[mood]}（${mood}/5）`;
}

/* 时间字段统一口径：「M月D日 HH:MM」（如 7月10日 14:19），与「记一下」的「今天 HH:MM」
 * 仅在日期前缀上按历史/今日语境区分，字段名「时间」保持一致。 */
function formatRecordTime(displayDate: string, time: string | null): string {
  return time ? `${displayDate} ${time}` : EMPTY;
}

/* HH:MM → 口语化时间段（如 23:10 → 晚上11点多），与「记一下」睡眠上床/入睡/起床 label 口径对齐。 */
function toColloquialTime(hhmm: string | null): string {
  if (!hhmm) return EMPTY;
  const [h] = hhmm.split(":").map(Number);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  let period: string;
  if (h >= 5 && h < 12) period = "早上";
  else if (h === 12) period = "中午";
  else if (h >= 13 && h < 18) period = "下午";
  else if (h >= 18) period = "晚上";
  else period = "凌晨";
  return `${period}${hour12}点多`;
}

/* —— 6 场景独立主题色（低饱和、生活记录感）——
 * 分类状态色作为「数据可视化例外」保留：不同类别使用不同颜色帮助用户快速识别数据类型。
 * 所有颜色通过 CSS 变量（--z-status-xxx / --z-status-xxx-rgb / --z-status-xxx-bg）集中管理，
 * 不得在组件内硬编码类别色。
 *
 * 使用边界：
 *   允许 —— 数据点、趋势线、柱形图、月相标记、图例、分类小图标、分类卡片辅助标识
 *   禁止 —— 页面主按钮、返回按钮、通用选中态、Tab 激活态、输入框焦点、通用进度条、弹窗确认按钮
 * 通用交互继续使用 action-primary / accent / neutral 等通用 Token。
 * 分类色在白底页面中仅承担「识别」而非「大面积装饰」，不因 Token 化而扩大彩色区域。 */
type Theme = {
  bg: string; // 场景面板底色（柔色卡片，不铺满）
  mark: string; // 主图形色：点、线、格、选中
  text: string; // 文字深色
  soft: string; // 辅助色：弱网格、未选中
  softer: string; // 更弱：选中态浅背景
};

/* —— 记录类别 → 状态 Token 唯一映射 ——
 * 全项目唯一的分类色映射，LookbackPage / 卡片组件 / 图表组件均从此处取色。 */
const RECORD_CATEGORY_COLOR: Record<SceneKey, string> = {
  mood: "var(--z-status-mood)",
  sleep: "var(--z-status-sleep)",
  med: "var(--z-status-medication)",
  meals: "var(--z-status-meal)",
  activity: "var(--z-status-activity)",
  weight: "var(--z-status-weight)",
} as const;

const themes: Record<SceneKey, Theme> = {
  mood: {
    bg: "var(--z-status-mood-bg)",
    mark: RECORD_CATEGORY_COLOR.mood,
    text: "var(--z-text-main)",
    soft: "rgb(var(--z-status-mood-rgb) / 0.16)",
    softer: "rgb(var(--z-status-mood-rgb) / 0.10)",
  },
  sleep: {
    bg: "var(--z-status-sleep-bg)",
    mark: RECORD_CATEGORY_COLOR.sleep,
    text: "var(--z-text-main)",
    soft: "rgb(var(--z-status-sleep-rgb) / 0.18)",
    softer: "rgb(var(--z-status-sleep-rgb) / 0.10)",
  },
  meals: {
    bg: "var(--z-status-meal-bg)",
    mark: RECORD_CATEGORY_COLOR.meals,
    text: "var(--z-text-main)",
    soft: "rgb(var(--z-status-meal-rgb) / 0.18)",
    softer: "rgb(var(--z-status-meal-rgb) / 0.10)",
  },
  med: {
    bg: "var(--z-status-medication-bg)",
    mark: RECORD_CATEGORY_COLOR.med,
    text: "var(--z-text-main)",
    soft: "rgb(var(--z-status-medication-rgb) / 0.20)",
    softer: "rgb(var(--z-status-medication-rgb) / 0.12)",
  },
  activity: {
    bg: "var(--z-status-activity-bg)",
    mark: RECORD_CATEGORY_COLOR.activity,
    text: "var(--z-text-main)",
    soft: "rgb(var(--z-status-activity-rgb) / 0.20)",
    softer: "rgb(var(--z-status-activity-rgb) / 0.12)",
  },
  weight: {
    bg: "var(--z-status-weight-bg)",
    mark: RECORD_CATEGORY_COLOR.weight,
    text: "var(--z-text-main)",
    soft: "rgb(var(--z-status-weight-rgb) / 0.18)",
    softer: "rgb(var(--z-status-weight-rgb) / 0.10)",
  },
};

type SceneKey = "mood" | "sleep" | "meals" | "med" | "activity" | "weight";

const scenes: { key: SceneKey; label: string }[] = [
  { key: "mood", label: "情绪" },
  { key: "sleep", label: "入睡" },
  { key: "meals", label: "三餐" },
  { key: "med", label: "服药" },
  { key: "activity", label: "活动" },
  { key: "weight", label: "体重" },
];

/* —— 统一字号规则：与「记一下」完成页对齐，正文不低于 14px ——
 * cardTitle: 卡片标题/日期主信息 16px
 * cardMeta: 极弱辅助（底部提示）12px
 * chartAxisLabel: 图表坐标/单位 12px（不低于 11px）
 * listDate: 列表日期 14px
 * listWeekday: 星期等次级 12px
 * listContent: 记录摘要主信息 14px
 * listSecondary: BMI 解读/服药状态等次级 12px */
const reviewTypography = {
  cardTitle: 16,
  cardMeta: 12,
  chartAxisLabel: 12,
  listDate: 14,
  listWeekday: 12,
  listContent: 14,
  listSecondary: 12,
} as const;

const tx = reviewTypography;

/* —— 每日记录行高度：不低于 48px —— */
const ROW_H = 52;

/* —— 横滑场景切换 variants —— */
const sceneVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0.4 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0.4 }),
};

/* —— 时间模式：按周查看 / 按月查看 —— */
type TimeMode = "week" | "month";
type LookbackSceneKey = SceneKey;

export type LookbackDemoOptions = {
  referenceDate: Date;
  initialTimeMode?: TimeMode;
  initialScene?: LookbackSceneKey;
  dataOverrides?: Record<string, Partial<DailyLookbackData>>;
  readOnly?: boolean;
};

/* —— 月份 key：YYYY-MM（用于状态与比较）—— */
function toMonthKey(year: number, month: number): string {
  return `${year}-${month < 10 ? `0${month}` : `${month}`}`;
}
function parseMonthKey(key: string): { year: number; month: number } {
  const [y, m] = key.split("-").map(Number);
  return { year: y, month: m };
}
function monthRangeLabelCN(key: string): string {
  const { year, month } = parseMonthKey(key);
  return `${year} 年 ${month} 月`;
}

/* —— 日期 key：YYYY-MM-DD（用于周状态）—— */
function toDateKey(d: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
/* —— 周范围文案：7.6 - 7.12 —— */
function weekRangeLabel(weekStartKey: string): string {
  const start = parseDateKey(weekStartKey);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.getMonth() + 1}.${start.getDate()} - ${end.getMonth() + 1}.${end.getDate()}`;
}

function canGoTime(
  delta: number,
  timeMode: TimeMode,
  weekStartKey: string,
  monthKey: string,
  referenceDate: Date,
): boolean {
  if (timeMode === "week") {
    const start = parseDateKey(weekStartKey);
    const next = new Date(start);
    next.setDate(next.getDate() + delta * 7);
    const key = toDateKey(next);
    return getXiaochenAllowedWeekStarts().includes(key);
  }
  const { year, month } = parseMonthKey(monthKey);
  const next = new Date(year, month - 1 + delta, 1);
  const key = toMonthKey(next.getFullYear(), next.getMonth() + 1);
  const nowKey = toMonthKey(referenceDate.getFullYear(), referenceDate.getMonth() + 1);
  return key <= nowKey && getXiaochenAllowedMonths().includes(key);
}

/* =========================================================
 * LookbackPage —— 单屏单场景 + 横滑切换
 * ======================================================= */
export default function LookbackPage({
  onBack,
  demoOptions,
}: {
  onBack: () => void;
  demoOptions?: LookbackDemoOptions;
}) {
  const isExperienceMode = isExperienceModeActive();
  const [fallbackReferenceDate] = useState(() =>
    isExperienceModeActive() ? getXiaochenReferenceDate() : new Date(),
  );
  const referenceDate = demoOptions?.referenceDate ?? fallbackReferenceDate;
  // 自由体验默认展示月视图；固定剧情演示继续由 demoOptions 显式控制。
  const [timeMode, setTimeMode] = useState<TimeMode>(
    () =>
      demoOptions
        ? demoOptions.initialTimeMode ?? "week"
        : isExperienceMode
          ? "month"
          : "week",
  );
  // 当前周起始（周一），默认本周
  const [currentWeekStart, setCurrentWeekStart] = useState<string>(() => {
    const fallback = toDateKey(getWeekStart(referenceDate));
    if (!isExperienceMode || demoOptions) return fallback;
    const allowed = getXiaochenAllowedWeekStarts();
    return allowed.includes(fallback) ? fallback : allowed[allowed.length - 1] ?? fallback;
  });
  // 当前月份 key，默认本月
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = referenceDate;
    const fallback = toMonthKey(now.getFullYear(), now.getMonth() + 1);
    if (!isExperienceMode || demoOptions) return fallback;
    const allowed = getXiaochenAllowedMonths();
    return allowed.includes(fallback) ? fallback : allowed[allowed.length - 1] ?? fallback;
  });
  const timeModeTabOrder: TimeMode[] = isExperienceMode && !demoOptions
    ? ["month", "week"]
    : ["week", "month"];
  const [timeDirection, setTimeDirection] = useState(0);

  const [sceneIdx, setSceneIdx] = useState(() => {
    const initialScene = demoOptions?.initialScene;
    if (!initialScene) return 0;
    return Math.max(0, scenes.findIndex((scene) => scene.key === initialScene));
  });
  // 详情抽屉：点某天打开；null = 关闭
  const [detailIdx, setDetailIdx] = useState<number | null>(null);
  // 编辑表单：null = 关闭
  const [editIdx, setEditIdx] = useState<number | null>(null);
  // 全局 toast：挂载在手机内容区根节点，避免跟随 bottom sheet / 按钮局部布局漂移
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 1600);
  };
  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  // 本地覆盖：按 date 维度记录被删除/被编辑后的数据
  // 删除：将该日期对应场景字段置空；编辑：覆盖该日期数据
  const [overrides, setOverrides] = useState<Record<string, Partial<DailyLookbackData>>>(
    () => demoOptions?.dataOverrides ?? {},
  );

  // 按时间模式派生数据：按周用 buildWeekRange；按月用 buildMonthRange
  // 体验模式从小晨统一数据源（XIAOCHEN_DAILY_RECORDS）读取，不再走 dayHash 随机生成
  const baseData = useMemo(() => {
    if (timeMode === "month") {
      const { year, month } = parseMonthKey(currentMonth);
      if (isExperienceMode) {
        return getXiaochenMonthRange(year, month);
      }
      return buildMonthRange(year, month, referenceDate);
    }
    if (isExperienceMode) {
      return getXiaochenWeekRange(parseDateKey(currentWeekStart));
    }
    return buildWeekRange(parseDateKey(currentWeekStart), referenceDate);
  }, [timeMode, currentWeekStart, currentMonth, referenceDate, isExperienceMode]);
  const data = useMemo(
    () => baseData.map((d) => (overrides[d.date] ? { ...d, ...overrides[d.date] } : d)),
    [baseData, overrides],
  );

  const currentScene = scenes[sceneIdx];
  const detailDay = detailIdx !== null ? data[detailIdx] : null;
  const editDay = editIdx !== null ? data[editIdx] : null;

  const goScene = (idx: number) => {
    if (idx < 0 || idx >= scenes.length || idx === sceneIdx) return;
    setSceneIdx(idx);
    setDetailIdx(null);
  };

  // 切换时间模式：保留当前分类，重置详情/编辑态
  const changeTimeMode = (m: TimeMode) => {
    if (m === timeMode) return;
    if (m === "week") {
      if (isExperienceMode && !demoOptions) {
        const allowed = getXiaochenAllowedWeekStarts();
        const referenceWeek = toDateKey(getWeekStart(referenceDate));
        const monthWeek = allowed.find((weekStart) => weekStart.startsWith(currentMonth));
        setCurrentWeekStart(
          currentMonth === toMonthKey(referenceDate.getFullYear(), referenceDate.getMonth() + 1)
            ? referenceWeek
            : monthWeek ?? allowed[allowed.length - 1] ?? referenceWeek,
        );
      } else {
        setCurrentWeekStart(toDateKey(getWeekStart(referenceDate)));
      }
    } else {
      const weekStart = parseDateKey(currentWeekStart);
      setCurrentMonth(toMonthKey(weekStart.getFullYear(), weekStart.getMonth() + 1));
    }
    setTimeMode(m);
    setDetailIdx(null);
    setEditIdx(null);
  };

  // 时间切换：按周左/右移 7 天；按月左/右移 1 月。不能超过当前时间。
  const goTime = (delta: number) => {
    setTimeDirection(delta);
    if (timeMode === "week") {
      const start = parseDateKey(currentWeekStart);
      const newStart = new Date(start);
      newStart.setDate(newStart.getDate() + delta * 7);
      // 不能超过本周（未来周）
      const thisWeekStart = getWeekStart(referenceDate);
      if (newStart > thisWeekStart) return;
      if (isExperienceMode && !demoOptions) {
        const newKey = toDateKey(newStart);
        if (!getXiaochenAllowedWeekStarts().includes(newKey)) return;
      }
      setCurrentWeekStart(toDateKey(newStart));
    } else {
      const { year, month } = parseMonthKey(currentMonth);
      const d = new Date(year, month - 1 + delta, 1);
      const now = referenceDate;
      const nowKey = toMonthKey(now.getFullYear(), now.getMonth() + 1);
      const newKey = toMonthKey(d.getFullYear(), d.getMonth() + 1);
      if (newKey > nowKey) return; // 不能超过当前月
      if (isExperienceMode && !demoOptions && !getXiaochenAllowedMonths().includes(newKey)) return;
      setCurrentMonth(newKey);
    }
    setDetailIdx(null);
    setEditIdx(null);
  };

  // 删除：将该日期对应场景字段置空
  const handleDelete = (date: string, sceneKey: SceneKey) => {
    const patch: Partial<DailyLookbackData> = {};
    switch (sceneKey) {
      case "mood":
        patch.mood = null;
        patch.moodWords = null;
        patch.moodTrigger = null;
        patch.moodBody = null;
        patch.moodNote = null;
        patch.moodEntries = null;
        break;
      case "sleep":
        patch.sleepTime = null;
        patch.wakeTime = null;
        patch.sleepDurationMin = null;
        patch.nightWake = null;
        patch.wakeFeeling = null;
        break;
      case "meals":
        patch.meals = { breakfast: "unknown", lunch: "unknown", dinner: "unknown" };
        patch.mealFeeling = null;
        break;
      case "med":
        patch.medication = { morning: "unknown", evening: "unknown" };
        patch.medChangeNote = null;
        break;
      case "activity":
        patch.activityLevel = null;
        patch.activityContent = null;
        patch.activityNote = null;
        break;
      case "weight":
        patch.weight = null;
        break;
    }
    setOverrides((prev) => ({
      ...prev,
      [date]: { ...prev[date], ...patch },
    }));
  };

  // 编辑：覆盖该日期数据（mock 保存）
  const handleSaveEdit = (date: string, patch: Partial<DailyLookbackData>) => {
    setOverrides((prev) => ({
      ...prev,
      [date]: { ...prev[date], ...patch },
    }));
  };

  const theme = themes[currentScene.key];

  return (
    <div
      className="relative flex h-full w-full flex-col"
      style={{ backgroundColor: PAGE_BG }}
    >
      <PhoneStatusBar />

      {/* 顶部：返回 + 标题 */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-3">
        <button
          onClick={onBack}
          aria-label="返回更多"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">
          回头看看
        </h2>
      </div>

      {/* 时间模式切换：按周查看 / 按月查看 */}
      <div className="px-5 pb-2">
        <TimeModeTabs value={timeMode} onChange={changeTimeMode} order={timeModeTabOrder} />
      </div>

      {/* 具体时间范围：按周显示 7.6 - 7.12；按月显示 2026 年 7 月，左右箭头切换 */}
      <div className="px-5 pb-2.5">
        <TimeRangeSwitcher
          timeMode={timeMode}
          weekStartKey={currentWeekStart}
          monthKey={currentMonth}
          referenceDate={referenceDate}
          onPrev={() => goTime(-1)}
          onNext={() => goTime(1)}
          canGoPrev={isExperienceMode && !demoOptions ? canGoTime(-1, timeMode, currentWeekStart, currentMonth, referenceDate) : undefined}
          canGoNext={isExperienceMode && !demoOptions ? canGoTime(1, timeMode, currentWeekStart, currentMonth, referenceDate) : undefined}
        />
      </div>

      {/* 场景标签栏 */}
      <SceneTabs
        scenes={scenes}
        activeIdx={sceneIdx}
        onSelect={goScene}
        theme={theme}
      />

      {/* 主体：横滑切换时间（周/月）；分类通过上方标签栏切换 */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={timeDirection}>
          <motion.div
            key={`${sceneIdx}-${timeMode}-${currentWeekStart}-${currentMonth}`}
            custom={timeDirection}
            variants={sceneVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              const offset = info.offset.x;
              const velocity = info.velocity.x;
              // 左滑 → 下一周/月；右滑 → 上一周/月
              if (offset < -60 || velocity < -500) {
                goTime(1);
              } else if (offset > 60 || velocity > 500) {
                goTime(-1);
              }
            }}
            transition={{
              x: { type: "spring", stiffness: 320, damping: 34 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0"
          >
            <ScenePanel
              sceneKey={currentScene.key}
              data={data}
              timeMode={timeMode}
              onOpenDetail={setDetailIdx}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 底部场景切换提示（弱）—— 非首尾场景显示方向箭头 */}
      <div className="flex items-center justify-center gap-4 pb-3 text-ink-faint/50">
        <button
          onClick={() => goScene(sceneIdx - 1)}
          disabled={sceneIdx === 0}
          aria-label="上一场景"
          className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-surface-soft disabled:opacity-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-[12px]">{currentScene.label}</span>
        <button
          onClick={() => goScene(sceneIdx + 1)}
          disabled={sceneIdx === scenes.length - 1}
          aria-label="下一场景"
          className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-surface-soft disabled:opacity-0"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* 详情抽屉 */}
      <AnimatePresence>
        {detailDay && (
          <DetailSheet
            day={detailDay}
            sceneKey={currentScene.key}
            theme={theme}
            readOnly={demoOptions?.readOnly === true}
            onClose={() => setDetailIdx(null)}
            onToast={showToast}
            onEdit={() => {
              setEditIdx(detailIdx);
              setDetailIdx(null);
            }}
            onDelete={() => {
              handleDelete(detailDay.date, currentScene.key);
              setDetailIdx(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* 编辑表单 */}
      <AnimatePresence>
        {editDay && (
          <EditSheet
            day={editDay}
            sceneKey={currentScene.key}
            theme={theme}
            onCancel={() => setEditIdx(null)}
            onSave={(patch) => {
              handleSaveEdit(editDay.date, patch);
              setEditIdx(null);
              // 回到详情抽屉并刷新
              setDetailIdx(editIdx);
            }}
          />
        )}
      </AnimatePresence>

      {/* 全局 toast layer：挂载在手机内容区根节点，水平居中基于整个手机内容区，
       * 不跟随 bottom sheet / 按钮局部容器；bottom-sheet 场景下 bottom 留出圆角安全距离。 */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease }}
            className="pointer-events-none absolute bottom-24 left-1/2 z-[9999] -translate-x-1/2 max-w-[calc(100%-48px)] whitespace-nowrap rounded-full bg-ink/85 px-4 py-2 text-[12px] text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)]"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
 * TimeModeTabs —— 时间模式 segmented control（按周查看 / 按月查看）
 * 轻量胶囊分段，不喧宾夺主
 * ======================================================= */
function TimeModeTabs({
  value,
  onChange,
  order = ["week", "month"],
}: {
  value: TimeMode;
  onChange: (m: TimeMode) => void;
  order?: TimeMode[];
}) {
  const labels: Record<TimeMode, string> = {
    month: "按月查看",
    week: "按周查看",
  };
  const tabs = order.map((key) => ({ key, label: labels[key] }));
  return (
    <div
      className="flex gap-1 rounded-lg p-1"
      style={{ backgroundColor: "#F3F3F1" }}
    >
      {tabs.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
              active
                ? "bg-white text-ink shadow-sm"
                : "text-ink-faint hover:text-ink-soft"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
 * TimeRangeSwitcher —— 时间范围切换器（‹ 7.6 - 7.12 › / ‹ 2026年7月 ›）
 * 按周显示周范围，按月显示月份；左右箭头切换，不超过当前时间
 * ======================================================= */
function TimeRangeSwitcher({
  timeMode,
  weekStartKey,
  monthKey,
  referenceDate,
  onPrev,
  onNext,
  canGoPrev = true,
  canGoNext,
  label: labelOverride,
  disableNav = false,
}: {
  timeMode: TimeMode;
  weekStartKey: string;
  monthKey: string;
  referenceDate: Date;
  onPrev: () => void;
  onNext: () => void;
  canGoPrev?: boolean;
  canGoNext?: boolean;
  /** 覆盖默认日期范围文案（Guided Demo 固定近两周时使用） */
  label?: string;
  /** 禁用左右切换箭头（Guided Demo 固定时间段时使用） */
  disableNav?: boolean;
}) {
  const now = referenceDate;
  // 判断是否已到当前时间（右箭头禁用）
  const isCurrent = timeMode === "week"
    ? weekStartKey === toDateKey(getWeekStart(now))
    : monthKey === toMonthKey(now.getFullYear(), now.getMonth() + 1);
  const nextDisabled = canGoNext ?? isCurrent;
  const label = labelOverride ?? (timeMode === "week"
    ? weekRangeLabel(weekStartKey)
    : monthRangeLabelCN(monthKey));
  const navDisabled = disableNav;
  return (
    <div className="flex items-center justify-between py-0.5">
      <button
        onClick={onPrev}
        disabled={navDisabled || !canGoPrev}
        aria-label={timeMode === "week" ? "上一周" : "上个月"}
        className="grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-soft active:scale-95 disabled:opacity-25 disabled:hover:bg-transparent"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <span className="flex-1 text-center text-[15px] font-medium text-ink">
        {label}
      </span>
      <button
        onClick={onNext}
        disabled={navDisabled || nextDisabled}
        aria-label={timeMode === "week" ? "下一周" : "下个月"}
        className="grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-soft active:scale-95 disabled:opacity-25 disabled:hover:bg-transparent"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

/* =========================================================
 * SceneTabs —— 场景标签栏，当前场景使用主题色高亮
 * ======================================================= */
function SceneTabs({
  scenes: sceneList,
  activeIdx,
  onSelect,
  theme,
}: {
  scenes: { key: SceneKey; label: string }[];
  activeIdx: number;
  onSelect: (i: number) => void;
  theme: Theme;
}) {
  return (
    <div className="flex items-center gap-1 px-5 pb-2.5">
      {sceneList.map((s, i) => {
        const active = i === activeIdx;
        return (
          <button
            key={s.key}
            onClick={() => onSelect(i)}
            className="relative flex flex-1 flex-col items-center gap-1.5 py-1"
            aria-label={s.label}
          >
            <span
              className="text-[13px] font-medium transition-colors"
              style={{
                color: active ? theme.text : "#8B947D",
              }}
            >
              {s.label}
            </span>
            <span
              className="h-[3px] w-5 rounded-full transition-all duration-200"
              style={{
                backgroundColor: active ? "var(--z-action-primary)" : "transparent",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
 * ScenePanel —— 场景面板（趋势区 + 详情列表主卡）
 * 数据按日期降序（最近 → 最早），符合「先看到最近的」阅读习惯
 * ======================================================= */
function ScenePanel({
  sceneKey,
  data,
  timeMode,
  onOpenDetail,
}: {
  sceneKey: SceneKey;
  data: DailyLookbackData[];
  timeMode: TimeMode;
  onOpenDetail: (i: number) => void;
}) {
  // 降序展示：最近一天在顶部
  const reversed = [...data].reverse();
  const days = data.length;

  // 空状态：按周/按月分别显示不同文案
  if (days === 0) {
    return (
      <div className="no-scrollbar h-full overflow-y-auto px-4 pb-4 pt-1">
        <div className="flex h-[60vh] flex-col items-center justify-center">
          <p className="text-[14px] text-ink-faint">
            {timeMode === "week" ? "这一周还没有记录" : "这个月还没有记录"}
          </p>
        </div>
      </div>
    );
  }

  // 按月份分组：reversed 已是降序，按 year-month 分组保持顺序
  // 跨月时显示月份标题；同月不重复标题
  const groups: { monthKey: string; label: string; items: { day: DailyLookbackData; originalIdx: number }[] }[] = [];
  reversed.forEach((d) => {
    const ri = reversed.indexOf(d);
    const originalIdx = days - 1 - ri;
    const [y, m] = d.date.split("-").map(Number);
    const mk = toMonthKey(y, m);
    const label = `${y}年${m}月`;
    let g = groups.find((gg) => gg.monthKey === mk);
    if (!g) {
      g = { monthKey: mk, label, items: [] };
      groups.push(g);
    }
    g.items.push({ day: d, originalIdx });
  });

  return (
    <div className="no-scrollbar h-full overflow-y-auto px-4 pb-4 pt-1">
      {/* 趋势区：非卡片，轻量信息区块（浅背景区分，不再套卡） */}
      <TrendArea sceneKey={sceneKey} data={data} />

      {/* 详情列表：按月份分组，每组一个白底卡 */}
      <div className="mt-4 flex flex-col gap-3">
        {groups.map((g) => (
          <div key={g.monthKey}>
            {/* 月份分组标题 */}
            <div className="mb-1.5 px-1 text-[12px] font-medium text-ink-faint">
              {g.label}
            </div>
            {/* 当月详情卡 */}
            <div className="overflow-hidden rounded-[20px] border border-line-soft bg-white shadow-[0_1px_3px_-1px_rgba(0,0,0,0.04)]">
              {g.items.map((it, ii) => (
                <DayRow
                  key={it.day.date}
                  sceneKey={sceneKey}
                  day={it.day}
                  onClick={() => onOpenDetail(it.originalIdx)}
                  isLast={ii === g.items.length - 1}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
 * TrendArea —— 趋势区（非卡片，轻量信息区块）
 * 浅场景色背景与页面区分，但不形成卡片包裹感
 * 不可交互，只显示起止日期
 * ======================================================= */
function TrendArea({
  sceneKey,
  data,
}: {
  sceneKey: SceneKey;
  data: DailyLookbackData[];
}) {
  const theme = themes[sceneKey];
  const days = data.length;
  const first = data[0];
  const last = data[days - 1];

  return (
    <div className="rounded-[18px] px-4 py-3.5" style={{ backgroundColor: "var(--z-surface-soft)" }}>
      {/* 趋势图：直接绘于浅背景上，不再内嵌小卡 */}
      <div style={{ height: 80 }}>
        {sceneKey === "mood" && <MoodTrend data={data} />}
        {sceneKey === "sleep" && <SleepTrend data={data} />}
        {sceneKey === "meals" && <MealsTrend data={data} />}
        {sceneKey === "med" && <MedTrend data={data} />}
        {sceneKey === "activity" && <ActivityTrend data={data} />}
        {sceneKey === "weight" && <WeightTrend data={data} />}
      </div>

      {/* 起止日期：仅显示开始与结束 */}
      <div className="mt-2 flex items-center justify-between">
        <span style={{ fontSize: tx.chartAxisLabel, color: theme.text, opacity: 0.5 }}>
          {compactDate(first.displayDate)}
        </span>
        <span style={{ fontSize: tx.chartAxisLabel, color: theme.text, opacity: 0.5 }}>
          {compactDate(last.displayDate)}
        </span>
      </div>
    </div>
  );
}

/* —— 通用：折线段构建（跳过 null）—— */
function trendSegments(
  points: ({ x: number; y: number } | null)[],
): { x: number; y: number }[][] {
  const segments: { x: number; y: number }[][] = [];
  let cur: { x: number; y: number }[] = [];
  for (const p of points) {
    if (p) cur.push({ x: p.x, y: p.y });
    else {
      if (cur.length) segments.push(cur);
      cur = [];
    }
  }
  if (cur.length) segments.push(cur);
  return segments;
}

/* —— 通用：Catmull-Rom 转 Bezier 平滑路径（圆滑曲线）——
 * 将折线段转为平滑的 SVG path，端点与连接处自然圆润
 * tension 越大越平缓，0.5 为默认 */
function smoothPath(pts: { x: number; y: number }[], tension = 0.5): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;
  if (pts.length === 2) return `M ${pts[0].x},${pts[0].y} L ${pts[1].x},${pts[1].y}`;

  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension * 2;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension * 2;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension * 2;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension * 2;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

/* —— 1. 情绪趋势：圆滑曲线 —— */
function MoodTrend({ data }: { data: DailyLookbackData[] }) {
  const theme = themes.mood;
  const days = data.length;
  const H = 80;
  // 上下保留 20px 呼吸空间，避免曲线贴近卡片边缘，视觉重心居中
  const padY = 20;
  const usable = H - padY * 2;

  const points = data.flatMap((d, i) => {
    const entries = d.moodEntries && d.moodEntries.length > 0
      ? d.moodEntries
      : d.mood !== null
        ? [{ mood: d.mood }]
        : null;
    if (!entries) return [null];
    return entries.map((entry, entryIdx) => {
      const x = ((i + (entryIdx + 1) / (entries.length + 1)) / days) * 100;
      const y = padY + (1 - (entry.mood - 1) / 4) * usable;
      return { x, y };
    });
  });
  const segments = trendSegments(points);
  const dotR = days <= 7 ? 2.8 : days <= 14 ? 2.2 : 1.6;

  return (
    <div className="relative h-full w-full">
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 100 ${H}`} preserveAspectRatio="none">
        {segments.map((seg, si) => (
          <path
            key={si}
            d={smoothPath(seg)}
            fill="none"
            stroke={theme.mark}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.55}
          />
        ))}
      </svg>
      {points.map(
        (p, i) =>
          p && (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: p.y,
                width: dotR * 2,
                height: dotR * 2,
                transform: "translate(-50%, -50%)",
                backgroundColor: theme.mark,
                opacity: 0.7,
              }}
            />
          ),
      )}
    </div>
  );
}

/* —— 2. 入睡趋势：节律型圆滑曲线（早→晚 Y 轴）—— */
function SleepTrend({ data }: { data: DailyLookbackData[] }) {
  const theme = themes.sleep;
  const days = data.length;
  const H = 80;
  const padY = 10;
  const usable = H - padY * 2;

  const points = data.map((d, i) => {
    if (d.sleepTime === null) return null;
    const ratio = sleepToRatio(d.sleepTime);
    const x = ((i + 0.5) / days) * 100;
    const y = padY + ratio * usable; // ratio 0=早(上) 1=晚(下)
    return { x, y };
  });
  const segments = trendSegments(points);
  const dotR = days <= 7 ? 2.8 : days <= 14 ? 2.2 : 1.6;

  return (
    <div className="relative h-full w-full">
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 100 ${H}`} preserveAspectRatio="none">
        {/* 早/晚参考线：浅色横线，不抢主趋势线 */}
        <line x1="0" y1={padY} x2="100" y2={padY} stroke={theme.mark} strokeWidth="1" vectorEffect="non-scaling-stroke" opacity={0.12} />
        <line x1="0" y1={H - padY} x2="100" y2={H - padY} stroke={theme.mark} strokeWidth="1" vectorEffect="non-scaling-stroke" opacity={0.12} />
        {segments.map((seg, si) => (
          <path
            key={si}
            d={smoothPath(seg)}
            fill="none"
            stroke={theme.mark}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.55}
          />
        ))}
      </svg>
      {points.map(
        (p, i) =>
          p && (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: p.y,
                width: dotR * 2,
                height: dotR * 2,
                transform: "translate(-50%, -50%)",
                backgroundColor: theme.mark,
                opacity: 0.7,
              }}
            />
          ),
      )}
      {/* 两端弱提示：早/晚（对齐参考线高度） */}
      <span className="absolute left-0 -translate-y-1/2" style={{ top: padY, fontSize: tx.chartAxisLabel, color: theme.text, opacity: 0.35 }}>早</span>
      <span className="absolute left-0 -translate-y-1/2" style={{ top: H - padY, fontSize: tx.chartAxisLabel, color: theme.text, opacity: 0.35 }}>晚</span>
    </div>
  );
}

/* —— 3. 三餐趋势：每日三格条带 —— */
function MealsTrend({ data }: { data: DailyLookbackData[] }) {
  const theme = themes.meals;
  const days = data.length;

  const cellStyle = (s: MealState): React.CSSProperties => {
    if (s === "yes") return { backgroundColor: theme.mark, opacity: 0.85 };
    if (s === "no") return { borderColor: theme.mark, borderWidth: 1, borderStyle: "solid", backgroundColor: "transparent", opacity: 0.5 };
    return { backgroundColor: theme.soft, opacity: 0.5 };
  };

  return (
    <div
      className="grid h-full w-full"
      style={{ gridTemplateColumns: `repeat(${days}, minmax(0, 1fr))`, gap: 2 }}
    >
      {data.map((d, i) => (
        <div key={i} className="flex flex-col justify-center gap-[2px]">
          <div className="h-[5px] w-full rounded-full" style={cellStyle(d.meals.breakfast)} />
          <div className="h-[5px] w-full rounded-full" style={cellStyle(d.meals.lunch)} />
          <div className="h-[5px] w-full rounded-full" style={cellStyle(d.meals.dinner)} />
        </div>
      ))}
    </div>
  );
}

/* —— 4. 服药趋势：体验模式单剂量；演示模式保留早/晚药盒矩阵 —— */
function MedTrend({ data }: { data: DailyLookbackData[] }) {
  const theme = themes.med;
  const days = data.length;

  const cellStyle = (s: MedState): React.CSSProperties => {
    if (s === "taken") return { backgroundColor: theme.mark, opacity: 0.85 };
    if (s === "missed") return { borderColor: theme.mark, borderWidth: 1, borderStyle: "solid", backgroundColor: "transparent", opacity: 0.5 };
    if (s === "changed") return { backgroundColor: theme.mark, opacity: 0.4 };
    return { backgroundColor: theme.soft, opacity: 0.5 };
  };

  if (isExperienceModeActive()) {
    return (
      <div
        className="grid h-full w-full"
        style={{ gridTemplateColumns: `repeat(${days}, minmax(0, 1fr))`, gap: 2 }}
      >
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-center">
            <div className="h-[12px] w-[12px] rounded-[4px]" style={cellStyle(d.medication.evening)} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid h-full w-full"
      style={{ gridTemplateColumns: `repeat(${days}, minmax(0, 1fr))`, gap: 2 }}
    >
      {data.map((d, i) => (
        <div key={i} className="flex flex-col justify-center gap-[2px]">
          <div className="h-[8px] w-full rounded-[2px]" style={cellStyle(d.medication.morning)} />
          <div className="h-[8px] w-full rounded-[2px]" style={cellStyle(d.medication.evening)} />
        </div>
      ))}
    </div>
  );
}

/* —— 5. 活动趋势：大小圆点表达活动量 —— */
function ActivityTrend({ data }: { data: DailyLookbackData[] }) {
  const theme = themes.activity;
  const days = data.length;
  const sizeForLevel: Record<ActivityLevel, number> = {
    0: days <= 7 ? 8 : days <= 15 ? 6 : 4,
    1: days <= 7 ? 12 : days <= 15 ? 9 : 6,
    2: days <= 7 ? 16 : days <= 15 ? 12 : 8,
    3: days <= 7 ? 20 : days <= 15 ? 15 : 10,
  };

  return (
    <div
      className="grid h-full w-full"
      style={{ gridTemplateColumns: `repeat(${days}, minmax(0, 1fr))`, gap: 2 }}
    >
      {data.map((d, i) => {
        const lvl = d.activityLevel;
        return (
          <div key={i} className="flex items-center justify-center">
            {lvl !== null && (
              <div
                className="rounded-full"
                style={{
                  width: sizeForLevel[lvl],
                  height: sizeForLevel[lvl],
                  backgroundColor: lvl === 0 ? "transparent" : theme.mark,
                  border: lvl === 0 ? `1px solid ${theme.mark}` : "none",
                  opacity: lvl === 0 ? 0.34 : 0.46 + lvl * 0.16,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* —— 6. 体重趋势：迷你圆滑曲线 —— */
function WeightTrend({ data }: { data: DailyLookbackData[] }) {
  const theme = themes.weight;
  const days = data.length;
  const H = 80;
  const padY = 10;
  const usable = H - padY * 2;

  const values = data.map((d) => d.weight);
  const valid = values.filter((v): v is number => v !== null);
  const min = valid.length ? Math.min(...valid) : 0;
  const max = valid.length ? Math.max(...valid) : 1;
  const span = Math.max(0.4, max - min);

  const points = data.map((d, i) => {
    if (d.weight === null) return null;
    const x = ((i + 0.5) / days) * 100;
    const y = padY + (1 - (d.weight - min) / span) * usable;
    return { x, y };
  });
  const segments = trendSegments(points);
  const dotR = days <= 7 ? 2.2 : days <= 14 ? 1.8 : 1.3;

  return (
    <div className="relative h-full w-full">
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 100 ${H}`} preserveAspectRatio="none">
        {segments.map((seg, si) => (
          <path
            key={si}
            d={smoothPath(seg)}
            fill="none"
            stroke={theme.mark}
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.6}
          />
        ))}
      </svg>
      {points.map(
        (p, i) =>
          p && (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: p.y,
                width: dotR * 2,
                height: dotR * 2,
                transform: "translate(-50%, -50%)",
                backgroundColor: theme.mark,
                opacity: 0.6,
              }}
            />
          ),
      )}
    </div>
  );
}

/* =========================================================
 * DayRow —— 每日记录行（统一外壳，高度 ≥48px）
 * 左：日期；中：场景可视化；右：弱箭头
 * ======================================================= */
function DayRow({
  sceneKey,
  day,
  onClick,
  isLast,
}: {
  sceneKey: SceneKey;
  day: DailyLookbackData;
  onClick: () => void;
  isLast: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`查看 ${day.displayDate} 的${sceneLabel(sceneKey)}详情`}
      className="group flex w-full items-center gap-3 px-4 transition-colors hover:bg-surface-soft/60"
      style={{
        height: ROW_H,
        borderBottom: isLast ? "none" : "1px solid var(--color-line, #D8E0CA)",
      }}
    >
      {/* 左：日期 + 星期 */}
      <div className="w-12 shrink-0 text-left">
        <div className="font-medium text-ink" style={{ fontSize: tx.listDate }}>
          {day.displayDate.replace("月", "/").replace("日", "")}
        </div>
        <div className="text-ink-faint" style={{ fontSize: tx.listWeekday }}>
          {weekday(day.date)}
        </div>
      </div>

      {/* 中：场景可视化 */}
      <div className="flex h-full flex-1 items-center">
        {sceneKey === "mood" && <MoodRow day={day} />}
        {sceneKey === "sleep" && <SleepRow day={day} />}
        {sceneKey === "meals" && <MealsRow day={day} />}
        {sceneKey === "med" && <MedRow day={day} />}
        {sceneKey === "activity" && <ActivityRow day={day} />}
        {sceneKey === "weight" && <WeightRow day={day} />}
      </div>

      {/* 右：弱箭头 */}
      <ChevronRight
        className="h-3.5 w-3.5 shrink-0 text-ink-faint/40 transition-opacity group-hover:text-ink-faint/70"
      />
    </button>
  );
}

function sceneLabel(k: SceneKey): string {
  return scenes.find((s) => s.key === k)?.label ?? "";
}

/* —— 工具：YYYY-MM-DD → 星期 —— */
function weekday(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()];
}

/* —— 工具：displayDate "7月4日" → "6/23" 紧凑格式 —— */
function compactDate(display: string): string {
  const m = display.match(/(\d+)月(\d+)日/);
  if (!m) return display;
  return `${m[1]}/${m[2]}`;
}

/* =========================================================
 * 1. MoodRow —— 日内情绪珠串（月相式点列）
 * - 每次记录用一个圆点，从左到右表示当天从早到晚
 * - 圆点填充程度表达情绪值 1-5（月相式）
 * - 靠左对齐，与其他模块列表行信息起点一致
 * - 未记录：显示「未记录」
 * ======================================================= */
function MoodRow({ day }: { day: DailyLookbackData }) {
  const theme = themes.mood;
  const entries = day.moodEntries;

  if (day.mood === null || !entries || entries.length === 0) {
    return <EmptyRow text="未记录" />;
  }

  return (
    <div className="flex h-full min-h-[44px] w-full items-center">
      <MoodBeadRail
        entries={entries}
        theme={theme}
        size={14}
        gap={8}
      />
    </div>
  );
}

/* —— 月相式情绪圆点：1-5 用真实月相轮廓表达 —— */
function MoodBead({ mood, theme, size = 10 }: { mood: Mood; theme: Theme; size?: number }) {
  return <MoonPhaseIcon level={mood} color={theme.mark} size={size} />;
}

function MoodBeadRail({
  entries,
  theme,
  size,
  gap,
  className,
  showTime = false,
}: {
  entries: MoodEntry[];
  theme: Theme;
  size: number;
  gap: number;
  className?: string;
  showTime?: boolean;
}) {
  return (
    <div className={`relative flex items-start justify-center ${className ?? ""}`} style={{ gap }}>
      {entries.length > 1 && (
        <div
          className="absolute h-[1px]"
          style={{
            left: size / 2,
            right: size / 2,
            top: size / 2,
            backgroundColor: theme.text,
            opacity: 0.08,
          }}
        />
      )}
      {entries.map((e, i) => (
        <div key={i} className="relative z-[1] flex min-w-[34px] flex-col items-center gap-1.5">
          <span className="grid rounded-full bg-white" style={{ padding: 2 }}>
            <MoodBead mood={e.mood} theme={theme} size={size} />
          </span>
          {showTime && (
            <span className="text-[12px]" style={{ color: theme.text, opacity: 0.45 }}>
              {e.time}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* =========================================================
 * 2. SleepRow —— 每日入睡节律条（细轨道，静态信息）
 * ======================================================= */
function SleepRow({ day }: { day: DailyLookbackData }) {
  const theme = themes.sleep;
  if (day.sleepTime === null) {
    return <EmptyRow text="未记录" />;
  }
  const ratio = sleepToRatio(day.sleepTime);
  return (
    <div className="flex items-center gap-2.5">
      <span style={{ fontSize: tx.chartAxisLabel, color: theme.text, opacity: 0.4 }}>早</span>
      <div className="relative h-[2px] flex-1 rounded-full" style={{ backgroundColor: "var(--z-line-soft)" }}>
        <div
          className="absolute top-1/2 h-[8px] w-[8px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${ratio * 100}%`,
            backgroundColor: theme.mark,
            opacity: 0.85,
          }}
        />
      </div>
      <span style={{ fontSize: tx.chartAxisLabel, color: theme.text, opacity: 0.4 }}>晚</span>
      <span className="w-12 shrink-0 text-right font-medium" style={{ fontSize: tx.listContent, color: theme.text, opacity: 0.7 }}>
        {day.sleepTime}
      </span>
    </div>
  );
}

/* =========================================================
 * 3. MealsRow —— 每日三餐状态（早/午/晚 三点）
 * ======================================================= */
function MealsRow({ day }: { day: DailyLookbackData }) {
  const theme = themes.meals;
  const items: { label: string; state: MealState }[] = [
    { label: "早", state: day.meals.breakfast },
    { label: "午", state: day.meals.lunch },
    { label: "晚", state: day.meals.dinner },
  ];
  return (
    <div className="flex items-center gap-3">
      {items.map((it) => {
        const style: React.CSSProperties =
          it.state === "yes"
            ? { backgroundColor: theme.mark }
            : it.state === "no"
              ? { borderColor: theme.mark, borderWidth: 1, borderStyle: "solid", backgroundColor: "transparent" }
              : { backgroundColor: theme.soft };
        return (
          <div key={it.label} className="flex items-center gap-1.5">
            <span style={{ fontSize: tx.chartAxisLabel, color: theme.text, opacity: 0.5 }}>{it.label}</span>
            <div className="h-[9px] w-[9px] rounded-full" style={style} />
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
 * 4. MedRow —— 体验模式单剂量；演示模式保留早/晚两块
 * ======================================================= */
function MedRow({ day }: { day: DailyLookbackData }) {
  const theme = themes.med;
  if (isExperienceModeActive()) {
    const state = day.medication.evening;
    const style: React.CSSProperties =
      state === "taken"
        ? { backgroundColor: theme.mark }
        : state === "missed"
          ? { borderColor: theme.mark, borderWidth: 1, borderStyle: "solid", backgroundColor: "transparent" }
          : state === "changed"
            ? { backgroundColor: theme.soft }
            : { backgroundColor: theme.softer };
    const label =
      state === "taken" ? "已服用" : state === "missed" ? "漏服" : state === "changed" ? "有改动" : "未记录";
    return (
      <div className="flex items-center gap-2">
        <span style={{ fontSize: tx.chartAxisLabel, color: theme.text, opacity: 0.5 }}>睡前</span>
        <div className="h-[12px] w-[12px] rounded-[3px]" style={style} />
        <span style={{ fontSize: tx.listContent, color: theme.text, opacity: 0.7 }}>
          {label}
        </span>
      </div>
    );
  }

  const items: { label: string; state: MedState }[] = [
    { label: "早", state: day.medication.morning },
    { label: "晚", state: day.medication.evening },
  ];
  return (
    <div className="flex items-center gap-3">
      {items.map((it) => {
        const style: React.CSSProperties =
          it.state === "taken"
            ? { backgroundColor: theme.mark }
            : it.state === "missed"
              ? { borderColor: theme.mark, borderWidth: 1, borderStyle: "solid", backgroundColor: "transparent" }
              : it.state === "changed"
                ? { backgroundColor: theme.soft }
                : { backgroundColor: theme.softer };
        return (
          <div key={it.label} className="flex items-center gap-1.5">
            <span style={{ fontSize: tx.chartAxisLabel, color: theme.text, opacity: 0.5 }}>{it.label}</span>
            <div className="h-[12px] w-[12px] rounded-[3px]" style={style} />
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
 * 5. ActivityRow —— 每日活动等级（圆点大小+透明度）
 * ======================================================= */
function ActivityRow({ day }: { day: DailyLookbackData }) {
  const theme = themes.activity;
  const lvl = day.activityLevel;
  if (lvl === null) {
    return <EmptyRow text="未记录" />;
  }
  const sizes = [7, 11, 15, 19];
  const opacities = [0.35, 0.55, 0.78, 1];
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-[20px] w-[20px] items-center justify-center">
        <div
          className="rounded-full"
          style={{
            width: sizes[lvl],
            height: sizes[lvl],
            backgroundColor: theme.mark,
            opacity: opacities[lvl],
          }}
        />
      </div>
      <span style={{ fontSize: tx.listContent, color: theme.text, opacity: 0.7 }}>
        {activityLabel[lvl]}
      </span>
    </div>
  );
}

/* =========================================================
 * 6. WeightRow —— 每日体重记录 + BMI
 * ======================================================= */
function WeightRow({ day }: { day: DailyLookbackData }) {
  const theme = themes.weight;
  if (day.weight === null) {
    return <span className="sr-only">未称重</span>;
  }
  const profile = getUserProfile();
  const bmi = calculateBMI(day.weight, profile.heightCm);
  const annotation = getBMIRemark(bmi);
  return (
    <div className="flex items-baseline gap-1">
      <span className="font-medium" style={{ fontSize: tx.listContent, color: theme.text }}>
        {day.weight}
      </span>
      <span style={{ fontSize: tx.chartAxisLabel, color: theme.text, opacity: 0.5 }}>kg</span>
      <span style={{ fontSize: tx.chartAxisLabel, color: theme.text, opacity: 0.3 }}>·</span>
      <span style={{ fontSize: tx.listSecondary, color: theme.text, opacity: 0.6 }}>
        BMI {bmi}（{annotation}）
      </span>
    </div>
  );
}

/* —— 空状态行：淡化占位，不等同于 0 —— */
function EmptyRow({ text }: { text: string }) {
  return (
    <span className="text-ink-faint/40" style={{ fontSize: tx.cardMeta }}>{text}</span>
  );
}

/* =========================================================
 * MoodDetailContent —— 情绪单日详情内容（折叠项列表）
 * - 顶部：轻量情绪珠串概览（非卡片图表）
 * - 每条记录：折叠项（收起态显示时间/情绪值/情绪词，展开态显示详情）
 * - 默认展开最新一条
 * - 空字段不逐行显示「未记录」，底部统一提示
 * ======================================================= */
function MoodDetailContent({
  day,
  theme,
}: {
  day: DailyLookbackData;
  theme: Theme;
}) {
  const entries = day.moodEntries;
  // 默认展开最后一条（最新）
  const [expandedIdx, setExpandedIdx] = useState<number | null>(
    entries && entries.length > 0 ? entries.length - 1 : null,
  );

  if (!entries || entries.length === 0) {
    return (
      <div className="py-8 text-center text-[14px]" style={{ color: theme.text, opacity: 0.4 }}>
        未记录
      </div>
    );
  }

  return (
    <div>
      {/* 当天情绪走势：放大并居中，突出日内月相变化 */}
      <div className="mb-5">
        <div className="text-center text-[12px] font-medium" style={{ color: theme.text, opacity: 0.62 }}>
          情绪走势
        </div>
        <div className="relative mt-3 flex min-h-[54px] items-center justify-center">
          <MoodBeadRail entries={entries} theme={theme} size={28} gap={20} showTime />
        </div>
      </div>

      {/* 折叠记录列表 */}
      <div className="flex flex-col" style={{ gap: 0 }}>
        {entries.map((entry, idx) => (
          <MoodRecordAccordion
            key={idx}
            entry={entry}
            theme={theme}
            displayDate={day.displayDate}
            isExpanded={expandedIdx === idx}
            onToggle={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
            isLast={idx === entries.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

/* —— 情绪记录折叠项 ——
 * 字段与「记一下」情绪保存态完全一致：情绪 / 感受 / 原因 / 特殊情况 / 时间 / 补充说明。
 * 不再出现「情绪词 / 触发事件 / 身体感受」旧名，也不再出现「其余字段未记录」伪字段。
 * 情绪口径统一为「一般（3/5）」，空值统一为「未记录」。 */
function MoodRecordAccordion({
  entry,
  theme,
  displayDate,
  isExpanded,
  onToggle,
  isLast,
}: {
  entry: MoodEntry;
  theme: Theme;
  displayDate: string;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  // 固定字段顺序，与「记一下」情绪保存态一致
  const fields: { label: string; value: string }[] = [
    { label: "情绪", value: moodDisplay(entry.mood) },
    { label: "感受", value: entry.moodWords?.join("、") ?? EMPTY },
    { label: "原因", value: entry.moodTrigger ?? EMPTY },
    { label: "特殊情况", value: entry.moodSpecial ?? EMPTY },
    { label: "时间", value: formatRecordTime(displayDate, entry.time) },
    { label: "补充说明", value: entry.moodNote ?? EMPTY },
  ];

  return (
    <div
      style={{
        borderBottom: isLast ? "none" : `1px solid var(--z-line-soft)`,
      }}
    >
      {/* 收起态/头部：时间 + 情绪值 + 情绪词 + 展开箭头 */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-surface-soft/40"
      >
        {/* 时间 */}
        <span className="w-12 shrink-0 text-[14px] font-medium" style={{ color: theme.text, opacity: 0.7 }}>
          {entry.time}
        </span>
        {/* 情绪值 */}
        <span className="shrink-0 text-[14px] font-medium" style={{ color: theme.text }}>
          {moodDisplay(entry.mood)}
        </span>
        {/* 情绪词（收起态显示，展开态隐藏） */}
        {!isExpanded && entry.moodWords && entry.moodWords.length > 0 && (
          <span className="flex-1 truncate text-[13px]" style={{ color: theme.text, opacity: 0.5 }}>
            {entry.moodWords.join("、")}
          </span>
        )}
        {/* 展开箭头 */}
        <ChevronRight
          className="ml-auto h-3.5 w-3.5 shrink-0 transition-transform"
          style={{
            color: theme.text,
            opacity: 0.4,
            transform: isExpanded ? "rotate(90deg)" : "none",
          }}
        />
      </button>

      {/* 展开态：详情字段 */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease }}
            className="overflow-hidden"
          >
            <div className="pb-3 pl-[60px]">
              <div className="flex flex-col gap-2">
                {fields.map((f, i) => (
                  <div key={i} className="flex flex-col gap-0.5">
                    <span className="text-[13px]" style={{ color: theme.text, opacity: 0.5 }}>
                      {f.label}
                    </span>
                    <span className="text-[14px]" style={{ color: theme.text }}>
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* —— 饮食详情：按餐次分组展示 ——
 * 三餐完整时按餐次独立小分组，组间 16px 间距；每组内字段 row 样式统一，
 * 字段值允许换行不撑破弹层。字段与「记一下」饮食保存态一致：
 * 吃了什么 / 吃完感受 / 时间 / 补充说明。 */
function MealDetailGroups({
  day,
  theme,
}: {
  day: DailyLookbackData;
  theme: Theme;
}) {
  const entries = day.mealEntries;
  if (!entries || entries.length === 0) {
    return (
      <div className="py-8 text-center text-[14px]" style={{ color: theme.text, opacity: 0.4 }}>
        未记录
      </div>
    );
  }
  const rowCls = "flex items-start justify-between gap-3 py-2";
  const labelCls = "w-[72px] shrink-0 text-[14px]";
  const labelStyle = { color: theme.text, opacity: 0.6 } as const;
  const valueCls = "min-w-0 flex-1 text-right text-[14px] break-words [overflow-wrap:anywhere]";
  const valueStyle = { color: theme.text } as const;
  return (
    <div className="flex flex-col" style={{ gap: "16px" }}>
      {entries.map((entry, idx) => (
        <div key={idx} className="flex flex-col">
          <div
            className="pb-1 text-[14px] font-medium"
            style={{ color: theme.text, opacity: 0.85 }}
          >
            {entry.mealType}
          </div>
          <div className={rowCls}>
            <span className={labelCls} style={labelStyle}>吃了什么</span>
            <span className={valueCls} style={valueStyle}>{entry.food ?? EMPTY}</span>
          </div>
          <div className={rowCls}>
            <span className={labelCls} style={labelStyle}>吃完感受</span>
            <span className={valueCls} style={valueStyle}>{entry.feeling ?? EMPTY}</span>
          </div>
          <div className={rowCls}>
            <span className={labelCls} style={labelStyle}>时间</span>
            <span className={valueCls} style={valueStyle}>{formatRecordTime(day.displayDate, entry.time)}</span>
          </div>
          <div className={rowCls}>
            <span className={labelCls} style={labelStyle}>补充说明</span>
            <span className={valueCls} style={valueStyle}>{entry.note ?? EMPTY}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
 * DetailSheet —— 底部详情抽屉（查看态 + 更多菜单）
 * 关闭方式：点击遮罩 / 向下滑动
 * ======================================================= */
function DetailSheet({
  day,
  sceneKey,
  theme,
  readOnly = false,
  onClose,
  onToast,
}: {
  day: DailyLookbackData;
  sceneKey: SceneKey;
  theme: Theme;
  readOnly?: boolean;
  onClose: () => void;
  /* onToast：轻量提示回调，由 LookbackPage 根节点统一挂载到手机内容区全局 toast layer，
   * 避免在 bottom sheet / 按钮局部容器内渲染导致水平居中漂移。 */
  onToast: (msg: string) => void;
  /* onEdit / onDelete：Demo 阶段暂未开放真实修改 / 删除。
   * 保留菜单入口仅为表明详情卡未来支持管理操作；点击仅给轻量提示，不触发任何流程。 */
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const rows = buildDetailRows(sceneKey, day);

  // 点击外部关闭更多菜单
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleEdit = () => {
    setMenuOpen(false);
    onToast("Demo 阶段暂未开放");
  };

  const handleDeleteClick = () => {
    setMenuOpen(false);
    onToast("Demo 阶段暂未开放");
  };

  return (
    <>
      {/* 遮罩：点击关闭 */}
      <motion.div
        className="absolute inset-0 z-40 bg-black/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease }}
        onClick={onClose}
      />
      {/* 抽屉：高度受控 + 内部滚动 + 下拉关闭；max-h 控制在手机内容区 76%，避免被内容撑满 */}
      <motion.div
        className="absolute inset-x-0 bottom-0 z-50 flex max-h-[76%] flex-col rounded-t-[24px] bg-white shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.15)]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        drag="y"
        dragDirectionLock
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          // 向下滑动超过 80px 或速度足够 → 关闭
          if (info.offset.y > 80 || info.velocity.y > 500) {
            onClose();
          }
        }}
      >
        {/* 把手：仅顶部拖拽短条 */}
        <div className="mx-auto mt-3 mb-3 h-1 w-9 shrink-0 rounded-full" style={{ backgroundColor: "var(--z-line-soft)" }} />

        {/* 标题区：左 日期+星期+摘要 / 右 仅 ··· */}
        <div className="mb-3 flex shrink-0 items-start justify-between px-6">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[16px] font-semibold" style={{ color: theme.text }}>
                {day.displayDate}
              </span>
              <span className="text-[12px]" style={{ color: theme.text, opacity: 0.5 }}>
                {weekday(day.date)}
              </span>
            </div>
            {/* 情绪场景：当天记录次数摘要 */}
            {sceneKey === "mood" && (
              <div className="mt-1 text-[12px]" style={{ color: theme.text, opacity: 0.45 }}>
                {day.moodEntries && day.moodEntries.length > 0
                  ? `当天共 ${day.moodEntries.length} 次记录`
                  : "未记录"}
              </div>
            )}
          </div>

          {!readOnly && (
          <div className="relative" ref={menuRef}>
            {/* 更多菜单入口 */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="更多操作"
              aria-expanded={menuOpen}
              className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-surface-soft"
              style={{ color: theme.text, opacity: 0.5 }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {/* 小菜单：贴近右上角，不遮挡主要内容 */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -4 }}
                  transition={{ duration: 0.15, ease }}
                  className="absolute right-0 top-8 z-10 w-28 overflow-hidden rounded-xl border border-black/5 bg-white py-1 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)]"
                >
                  <button
                    onClick={handleEdit}
                    className="flex w-full items-center px-3 py-2 text-left text-[14px] text-ink transition-colors hover:bg-surface-soft"
                  >
                    修改记录
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="flex w-full items-center px-3 py-2 text-left text-[14px] text-ink transition-colors hover:bg-surface-soft"
                  >
                    删除记录
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          )}
        </div>

        {/* 内容区：可滚动；min-h-0 保证 flex 子项内部 overflow 生效，不被内容撑满 */}
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pb-8">
          {sceneKey === "mood" ? (
            <MoodDetailContent day={day} theme={theme} />
          ) : sceneKey === "meals" ? (
            /* 饮食详情：按餐次分组展示，每餐独立小分组，组间留白 */
            <MealDetailGroups day={day} theme={theme} />
          ) : (
            /* 字段列表（非情绪 / 非饮食场景） */
            <div className="flex flex-col divide-y" style={{ borderColor: "var(--z-line-soft)" }}>
              {rows.map((r, i) =>
                r.spacer ? (
                  /* 多条记录之间的间隔（不渲染字段，仅留白） */
                  <div key={i} className="h-3" />
                ) : (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-3 py-3"
                    style={{ borderTop: i === 0 ? "none" : `1px solid var(--z-line-soft)` }}
                  >
                    <span
                      className="w-[72px] shrink-0 text-[14px]"
                      style={{ color: theme.text, opacity: 0.6 }}
                    >
                      {r.k}
                    </span>
                    <span
                      className="min-w-0 flex-1 text-right text-[14px] break-words [overflow-wrap:anywhere]"
                      style={{ color: theme.text }}
                    >
                      {r.v}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

/* =========================================================
 * EditSheet —— 修改记录（编辑表单，全屏覆盖）
 * 字段与「记一下」模块该场景记录表单一致
 * ======================================================= */
function EditSheet({
  day,
  sceneKey,
  theme,
  onCancel,
  onSave,
}: {
  day: DailyLookbackData;
  sceneKey: SceneKey;
  theme: Theme;
  onCancel: () => void;
  onSave: (patch: Partial<DailyLookbackData>) => void;
}) {
  // 标题：修改情绪记录 / 修改入睡记录 / ...
  const sceneName = sceneLabel(sceneKey);
  const title = `修改${sceneName}记录`;

  // 根据场景初始化表单状态
  const [form, setForm] = useState(() => initForm(sceneKey, day));

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(buildPatch(sceneKey, form));
  };

  return (
    <>
      <motion.div
        className="absolute inset-0 z-[70] bg-black/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease }}
        onClick={onCancel}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 top-0 z-[71] flex flex-col bg-white"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
      >
        {/* 顶部：取消 / 标题 / 保存 */}
        <div
          className="flex items-center justify-between px-5 pt-14 pb-3"
          style={{ borderBottom: `1px solid var(--z-line-soft)` }}
        >
          <button
            onClick={onCancel}
            className="text-[14px] text-ink-soft transition-colors hover:text-ink"
          >
            取消
          </button>
          <span className="text-[15px] font-semibold" style={{ color: theme.text }}>
            {title}
          </span>
          <button
            onClick={handleSave}
            className="text-[14px] font-medium transition-opacity hover:opacity-80"
            style={{ color: "var(--z-action-pressed)" }}
          >
            保存修改
          </button>
        </div>

        {/* 表单内容区：可滚动 */}
        <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-4">
          {sceneKey === "mood" && (
            <MoodEditForm form={form} setField={setField} theme={theme} day={day} />
          )}
          {sceneKey === "sleep" && (
            <SleepEditForm form={form} setField={setField} theme={theme} day={day} />
          )}
          {sceneKey === "meals" && (
            <MealsEditForm form={form} setField={setField} theme={theme} day={day} />
          )}
          {sceneKey === "med" && (
            <MedEditForm form={form} setField={setField} theme={theme} day={day} />
          )}
          {sceneKey === "activity" && (
            <ActivityEditForm form={form} setField={setField} theme={theme} day={day} />
          )}
          {sceneKey === "weight" && (
            <WeightEditForm form={form} setField={setField} theme={theme} day={day} />
          )}
        </div>
      </motion.div>
    </>
  );
}

/* —— 表单状态类型 —— */
type EditFormState = {
  // mood
  mood: Mood | null;
  moodWords: string;
  moodTrigger: string;
  moodBody: string;
  moodNote: string;
  // sleep
  sleepTime: string;
  wakeTime: string;
  nightWake: string;
  wakeFeeling: string;
  // meals
  breakfast: MealState;
  lunch: MealState;
  dinner: MealState;
  mealFeeling: string;
  // med
  medMorning: MedState;
  medEvening: MedState;
  medChangeNote: string;
  // activity
  activityLevel: ActivityLevel | null;
  activityContent: string;
  activityNote: string;
  // weight
  weight: string;
};

function initForm(_sceneKey: SceneKey, day: DailyLookbackData): EditFormState {
  return {
    mood: day.mood,
    moodWords: day.moodWords?.join("、") ?? "",
    moodTrigger: day.moodTrigger ?? "",
    moodBody: day.moodBody ?? "",
    moodNote: day.moodNote ?? "",
    sleepTime: day.sleepTime ?? "",
    wakeTime: day.wakeTime ?? "",
    nightWake: day.nightWake ?? "",
    wakeFeeling: day.wakeFeeling ?? "",
    breakfast: day.meals.breakfast,
    lunch: day.meals.lunch,
    dinner: day.meals.dinner,
    mealFeeling: day.mealFeeling ?? "",
    medMorning: day.medication.morning,
    medEvening: day.medication.evening,
    medChangeNote: day.medChangeNote ?? "",
    activityLevel: day.activityLevel,
    activityContent: day.activityContent ?? "",
    activityNote: day.activityNote ?? "",
    weight: day.weight !== null ? String(day.weight) : "",
  };
}

/* —— 根据场景构建保存 patch —— */
function buildPatch(
  sceneKey: SceneKey,
  form: EditFormState,
): Partial<DailyLookbackData> {
  switch (sceneKey) {
    case "mood": {
      const moodPatch: Partial<DailyLookbackData> = {
        mood: form.mood,
        moodWords: form.moodWords ? form.moodWords.split(/[、,，]/).map((s) => s.trim()).filter(Boolean) : null,
        moodTrigger: form.moodTrigger || null,
        moodBody: form.moodBody || null,
        moodNote: form.moodNote || null,
      };
      // 同步更新 moodEntries：编辑时重建为单条记录（简化处理）
      if (form.mood !== null) {
        const words = form.moodWords ? form.moodWords.split(/[、,，]/).map((s) => s.trim()).filter(Boolean) : null;
        moodPatch.moodEntries = [{
          time: "12:00",
          mood: form.mood,
          moodWords: words,
          moodTrigger: form.moodTrigger || null,
          moodBody: form.moodBody || null,
          moodNote: form.moodNote || null,
          moodSpecial: null,
        }];
      } else {
        moodPatch.moodEntries = null;
      }
      return moodPatch;
    }
    case "sleep": {
      const sleepTime = form.sleepTime || null;
      const wakeTime = form.wakeTime || null;
      let sleepDurationMin: number | null = null;
      if (sleepTime && wakeTime) {
        const [sh, sm] = sleepTime.split(":").map(Number);
        const [wh, wm] = wakeTime.split(":").map(Number);
        let sMin = sh * 60 + sm;
        if (sMin < 6 * 60) sMin += 24 * 60;
        const wMin = wh * 60 + wm;
        sleepDurationMin = wMin + 24 * 60 - sMin;
        if (sleepDurationMin > 12 * 60) sleepDurationMin -= 24 * 60;
      }
      return {
        sleepTime,
        wakeTime,
        sleepDurationMin,
        nightWake: form.nightWake || null,
        wakeFeeling: form.wakeFeeling || null,
      };
    }
    case "meals":
      return {
        meals: {
          breakfast: form.breakfast,
          lunch: form.lunch,
          dinner: form.dinner,
        },
        mealFeeling: form.mealFeeling || null,
      };
    case "med":
      return {
        medication: {
          morning: form.medMorning,
          evening: form.medEvening,
        },
        medChangeNote: form.medChangeNote || null,
      };
    case "activity":
      return {
        activityLevel: form.activityLevel,
        activityContent: form.activityContent || null,
        activityNote: form.activityNote || null,
      };
    case "weight": {
      const w = parseFloat(form.weight);
      return {
        weight: isNaN(w) ? null : Math.round(w * 10) / 10,
      };
    }
  }
}

/* —— 通用表单小组件 —— */
function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 text-[14px] font-medium text-ink">{label}</div>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  theme,
  enableVoice = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  theme: Theme;
  enableVoice?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-current ${
          enableVoice ? "pl-3 pr-11" : "px-3"
        }`}
        style={{ borderColor: "var(--z-line-soft)", color: theme.text }}
      />
      {enableVoice && (
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
          <VoiceInputBar
            compact
            size="sm"
            tint={theme.mark}
            value={value}
            onChange={onChange}
            onSend={() => {}}
            canSend={false}
          />
        </div>
      )}
    </div>
  );
}

function TimeInput({
  value,
  onChange,
  theme,
}: {
  value: string;
  onChange: (v: string) => void;
  theme: Theme;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border bg-white px-3 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-current"
      style={{ borderColor: "var(--z-line-soft)", color: theme.text }}
    />
  );
}

function SegmentedOptions<T extends string | number>({
  options,
  value,
  onChange,
  theme,
}: {
  options: { label: string; value: T }[];
  value: T | null;
  onChange: (v: T) => void;
  theme: Theme;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className="rounded-full px-4 py-2 text-[13px] transition-all"
            style={{
              backgroundColor: active ? "var(--z-action-primary)" : "transparent",
              color: active ? "var(--z-action-primary-text)" : theme.text,
              border: `1px solid ${active ? "var(--z-action-primary)" : "var(--z-line-soft)"}`,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  theme,
  enableVoice = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  theme: Theme;
  enableVoice?: boolean;
}) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={`w-full resize-none rounded-xl border bg-white py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-current ${
          enableVoice ? "pl-3 pr-3 pb-9" : "px-3 py-2.5"
        }`}
        style={{ borderColor: "var(--z-line-soft)", color: theme.text }}
      />
      {enableVoice && (
        <div className="absolute bottom-1.5 right-1.5">
          <VoiceInputBar
            compact
            size="sm"
            tint={theme.mark}
            value={value}
            onChange={onChange}
            onSend={() => {}}
            canSend={false}
          />
        </div>
      )}
    </div>
  );
}

/* —— 各场景编辑表单 —— */
function MoodEditForm({
  form,
  setField,
  theme,
}: {
  form: EditFormState;
  setField: <K extends keyof EditFormState>(key: K, value: EditFormState[K]) => void;
  theme: Theme;
  day: DailyLookbackData;
}) {
  const moodOptions: { label: string; value: Mood }[] = [
    { label: "1 很低", value: 1 },
    { label: "2", value: 2 },
    { label: "3 一般", value: 3 },
    { label: "4", value: 4 },
    { label: "5 很高", value: 5 },
  ];
  return (
    <>
      <FormField label="情绪强度">
        <SegmentedOptions
          options={moodOptions}
          value={form.mood}
          onChange={(v) => setField("mood", v)}
          theme={theme}
        />
      </FormField>
      <FormField label="情绪词">
        <TextInput
          value={form.moodWords}
          onChange={(v) => setField("moodWords", v)}
          placeholder="如：烦躁、疲惫"
          theme={theme}
          enableVoice
        />
      </FormField>
      <FormField label="触发事件">
        <TextInput
          value={form.moodTrigger}
          onChange={(v) => setField("moodTrigger", v)}
          placeholder="如：和家人争吵"
          theme={theme}
          enableVoice
        />
      </FormField>
      <FormField label="身体感受">
        <TextInput
          value={form.moodBody}
          onChange={(v) => setField("moodBody", v)}
          placeholder="如：胸闷"
          theme={theme}
          enableVoice
        />
      </FormField>
      <FormField label="补充说明">
        <TextArea
          value={form.moodNote}
          onChange={(v) => setField("moodNote", v)}
          placeholder="可补充"
          theme={theme}
          enableVoice
        />
      </FormField>
    </>
  );
}

function SleepEditForm({
  form,
  setField,
  theme,
}: {
  form: EditFormState;
  setField: <K extends keyof EditFormState>(key: K, value: EditFormState[K]) => void;
  theme: Theme;
  day: DailyLookbackData;
}) {
  return (
    <>
      <FormField label="入睡时间">
        <TimeInput
          value={form.sleepTime}
          onChange={(v) => setField("sleepTime", v)}
          theme={theme}
        />
      </FormField>
      <FormField label="醒来时间">
        <TimeInput
          value={form.wakeTime}
          onChange={(v) => setField("wakeTime", v)}
          theme={theme}
        />
      </FormField>
      <FormField label="夜醒">
        <TextInput
          value={form.nightWake}
          onChange={(v) => setField("nightWake", v)}
          placeholder="如：1 次"
          theme={theme}
        />
      </FormField>
      <FormField label="醒后感受">
        <TextInput
          value={form.wakeFeeling}
          onChange={(v) => setField("wakeFeeling", v)}
          placeholder="如：还行"
          theme={theme}
          enableVoice
        />
      </FormField>
    </>
  );
}

function MealsEditForm({
  form,
  setField,
  theme,
}: {
  form: EditFormState;
  setField: <K extends keyof EditFormState>(key: K, value: EditFormState[K]) => void;
  theme: Theme;
  day: DailyLookbackData;
}) {
  const mealOptions: { label: string; value: MealState }[] = [
    { label: "有", value: "yes" },
    { label: "无", value: "no" },
    { label: "未记录", value: "unknown" },
  ];
  return (
    <>
      <FormField label="早餐">
        <SegmentedOptions
          options={mealOptions}
          value={form.breakfast}
          onChange={(v) => setField("breakfast", v)}
          theme={theme}
        />
      </FormField>
      <FormField label="午餐">
        <SegmentedOptions
          options={mealOptions}
          value={form.lunch}
          onChange={(v) => setField("lunch", v)}
          theme={theme}
        />
      </FormField>
      <FormField label="晚餐">
        <SegmentedOptions
          options={mealOptions}
          value={form.dinner}
          onChange={(v) => setField("dinner", v)}
          theme={theme}
        />
      </FormField>
      <FormField label="饭后感受">
        <TextInput
          value={form.mealFeeling}
          onChange={(v) => setField("mealFeeling", v)}
          placeholder="如：还好"
          theme={theme}
          enableVoice
        />
      </FormField>
    </>
  );
}

function MedEditForm({
  form,
  setField,
  theme,
}: {
  form: EditFormState;
  setField: <K extends keyof EditFormState>(key: K, value: EditFormState[K]) => void;
  theme: Theme;
  day: DailyLookbackData;
}) {
  const medOptions: { label: string; value: MedState }[] = [
    { label: "已服用", value: "taken" },
    { label: "漏服", value: "missed" },
    { label: "改动", value: "changed" },
    { label: "未记录", value: "unknown" },
  ];
  return (
    <>
      <FormField label="早">
        <SegmentedOptions
          options={medOptions}
          value={form.medMorning}
          onChange={(v) => setField("medMorning", v)}
          theme={theme}
        />
      </FormField>
      <FormField label="晚">
        <SegmentedOptions
          options={medOptions}
          value={form.medEvening}
          onChange={(v) => setField("medEvening", v)}
          theme={theme}
        />
      </FormField>
      <FormField label="改动说明">
        <TextArea
          value={form.medChangeNote}
          onChange={(v) => setField("medChangeNote", v)}
          placeholder="如：剂量调整"
          theme={theme}
          enableVoice
        />
      </FormField>
    </>
  );
}

function ActivityEditForm({
  form,
  setField,
  theme,
}: {
  form: EditFormState;
  setField: <K extends keyof EditFormState>(key: K, value: EditFormState[K]) => void;
  theme: Theme;
  day: DailyLookbackData;
}) {
  const actOptions: { label: string; value: ActivityLevel }[] = [
    { label: "0 无明显活动", value: 0 },
    { label: "1 轻微活动", value: 1 },
    { label: "2 完成一件事", value: 2 },
    { label: "3 参与较多", value: 3 },
  ];
  return (
    <>
      <FormField label="活动等级">
        <SegmentedOptions
          options={actOptions}
          value={form.activityLevel}
          onChange={(v) => setField("activityLevel", v)}
          theme={theme}
        />
      </FormField>
      <FormField label="活动内容">
        <TextInput
          value={form.activityContent}
          onChange={(v) => setField("activityContent", v)}
          placeholder="如：出门买东西"
          theme={theme}
          enableVoice
        />
      </FormField>
      <FormField label="补充说明">
        <TextArea
          value={form.activityNote}
          onChange={(v) => setField("activityNote", v)}
          placeholder="可补充"
          theme={theme}
          enableVoice
        />
      </FormField>
    </>
  );
}

function WeightEditForm({
  form,
  setField,
  theme,
}: {
  form: EditFormState;
  setField: <K extends keyof EditFormState>(key: K, value: EditFormState[K]) => void;
  theme: Theme;
  day: DailyLookbackData;
}) {
  return (
    <FormField label="体重 (kg)">
      <TextInput
        value={form.weight}
        onChange={(v) => setField("weight", v)}
        placeholder="如：51.8"
        theme={theme}
      />
    </FormField>
  );
}

/* —— 详情抽屉字段：按场景构建（与「记一下」保存态共用同一套字段 schema）
 * 字段名称 / 字段顺序 / 空值口径均以「记一下」保存态为基准：
 *   - 空值统一显示「未记录」（EMPTY）
 *   - 多条记录之间用 spacer 行留白，不再用空字符串占位
 *   - 数字 + 文案字段统一口径：情绪「一般（3/5）」、BMI「21.3（正常）」、体重「52.4 kg」
 * 列表层（日汇总）由 ScenePanel 负责，本函数只产出单条记录详情字段。 —— */
function buildDetailRows(
  sceneKey: SceneKey,
  day: DailyLookbackData,
): { k: string; v: string; spacer?: boolean }[] {
  switch (sceneKey) {
    case "mood": {
      // 情绪详情实际由 MoodDetailContent 渲染（折叠列表），此分支保留与
      // 「记一下」保存态一致的字段配置，供统一口径校验。
      // 基准：情绪 / 感受 / 原因 / 特殊情况 / 时间 / 补充说明
      const entries = day.moodEntries;
      if (!entries || entries.length === 0) {
        return [{ k: "情绪", v: EMPTY }];
      }
      const rows: { k: string; v: string; spacer?: boolean }[] = [];
      entries.forEach((entry, idx) => {
        rows.push({ k: "情绪", v: moodDisplay(entry.mood) });
        rows.push({ k: "感受", v: entry.moodWords?.join("、") ?? EMPTY });
        rows.push({ k: "原因", v: entry.moodTrigger ?? EMPTY });
        rows.push({ k: "特殊情况", v: entry.moodSpecial ?? EMPTY });
        rows.push({ k: "时间", v: formatRecordTime(day.displayDate, entry.time) });
        rows.push({ k: "补充说明", v: entry.moodNote ?? EMPTY });
        if (idx < entries.length - 1) rows.push({ k: "", v: "", spacer: true });
      });
      return rows;
    }
    case "sleep": {
      // 基准：睡眠 / 感受 / 上床 / 入睡 / 起床 / 夜醒 / 时间 / 补充说明
      const level = day.sleepLevel;
      return [
        { k: "睡眠", v: level !== null ? (sleepLevelLabel[level] ?? EMPTY) : EMPTY },
        { k: "感受", v: day.wakeFeeling ?? EMPTY },
        { k: "上床", v: day.sleepBedTime ?? EMPTY },
        { k: "入睡", v: toColloquialTime(day.sleepTime) },
        { k: "起床", v: toColloquialTime(day.wakeTime) },
        { k: "夜醒", v: day.nightWake ?? EMPTY },
        { k: "时间", v: formatRecordTime(day.displayDate, day.sleepRecordTime) },
        { k: "补充说明", v: day.sleepNote ?? EMPTY },
      ];
    }
    case "meals": {
      // 单条饮食记录：餐次 / 吃了什么 / 吃完感受 / 时间 / 补充说明
      const entries = day.mealEntries;
      if (!entries || entries.length === 0) {
        return [{ k: "餐次", v: EMPTY }];
      }
      const rows: { k: string; v: string; spacer?: boolean }[] = [];
      entries.forEach((entry, idx) => {
        rows.push({ k: "餐次", v: entry.mealType });
        rows.push({ k: "吃了什么", v: entry.food ?? EMPTY });
        rows.push({ k: "吃完感受", v: entry.feeling ?? EMPTY });
        rows.push({ k: "时间", v: formatRecordTime(day.displayDate, entry.time) });
        rows.push({ k: "补充说明", v: entry.note ?? EMPTY });
        if (idx < entries.length - 1) rows.push({ k: "", v: "", spacer: true });
      });
      return rows;
    }
    case "med": {
      // 单条服用记录：时段 / 起效 / 感受 / 时间 / 补充说明
      const entries = day.medEntries;
      if (!entries || entries.length === 0) {
        return [{ k: "时段", v: EMPTY }];
      }
      const rows: { k: string; v: string; spacer?: boolean }[] = [];
      entries.forEach((entry, idx) => {
        rows.push({
          k: "时段",
          v: `${entry.slot}${entry.slotTime ? ` ${entry.slotTime}` : ""}`,
        });
        rows.push({ k: "起效", v: entry.effectTime ?? EMPTY });
        rows.push({ k: "感受", v: entry.feeling ?? EMPTY });
        rows.push({ k: "时间", v: formatRecordTime(day.displayDate, entry.time) });
        rows.push({ k: "补充说明", v: entry.note ?? EMPTY });
        if (idx < entries.length - 1) rows.push({ k: "", v: "", spacer: true });
      });
      return rows;
    }
    case "activity": {
      // 基准：活动 / 具体活动 / 时长 / 感受 / 时间 / 补充说明
      return [
        { k: "活动", v: day.activityLevel !== null ? activityLabel[day.activityLevel] : EMPTY },
        { k: "具体活动", v: day.activityContent ?? EMPTY },
        { k: "时长", v: day.activityDuration ?? EMPTY },
        { k: "感受", v: day.activityFeeling ?? EMPTY },
        { k: "时间", v: formatRecordTime(day.displayDate, day.activityRecordTime) },
        { k: "补充说明", v: day.activityNote ?? EMPTY },
      ];
    }
    case "weight": {
      // 基准：体重 / BMI / 场景 / 时间 / 补充说明
      if (day.weight === null) {
        return [{ k: "体重", v: EMPTY }];
      }
      const profile = getUserProfile();
      const bmi = calculateBMI(day.weight, profile.heightCm);
      const annotation = getBMIRemark(bmi);
      return [
        { k: "体重", v: `${day.weight} kg` },
        { k: "BMI", v: `${bmi}（${annotation}）` },
        { k: "场景", v: day.weightMeasureContext ?? EMPTY },
        { k: "时间", v: formatRecordTime(day.displayDate, day.weightRecordTime) },
        { k: "补充说明", v: day.weightNote ?? EMPTY },
      ];
    }
  }
}

/* —— 入睡时间 → 0..1 比例（0=早 22:30，1=晚 02:00）—— */
const SLEEP_MIN = 22 * 60 + 30;
const SLEEP_MAX = 26 * 60;
function sleepToRatio(t: string): number {
  const [h, m] = t.split(":").map(Number);
  let total = h * 60 + m;
  if (total < 6 * 60) total += 24 * 60;
  return (
    (Math.max(SLEEP_MIN, Math.min(SLEEP_MAX, total)) - SLEEP_MIN) /
    (SLEEP_MAX - SLEEP_MIN)
  );
}

/* =========================================================
 * 共享导出 —— 供 Guided Demo 复用正式「回头看看」UI 组件
 * 不改变正式页面行为，仅暴露内部组件供 Demo 引用
 * ======================================================= */
export { TimeModeTabs, TimeRangeSwitcher, SceneTabs, TrendArea };
export { themes, scenes, reviewTypography as tx, PAGE_BG, ease };
export type { Theme, SceneKey, TimeMode };
export { SleepRow };
