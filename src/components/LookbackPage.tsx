import { useState, useMemo, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  lookbackData,
  moodLabel,
  mealLabel,
  medLabel,
  activityLabel,
  type DailyLookbackData,
  type LookbackRange,
  type Mood,
  type ActivityLevel,
  type MedState,
  type MealState,
} from "@/data/lookback";

const ease = [0.22, 1, 0.36, 1] as const;

/* —— 页面背景：安静米白 —— */
const PAGE_BG = "#F7F5F2";

/* —— 6 场景独立主题色（低饱和、生活记录感）—— */
type Theme = {
  bg: string; // 场景面板底色（柔色卡片，不铺满）
  mark: string; // 主图形色：点、线、格、选中
  text: string; // 文字深色
  soft: string; // 辅助色：弱网格、未选中
  softer: string; // 更弱：选中态浅背景
};

const themes: Record<SceneKey, Theme> = {
  mood: {
    bg: "#e6e2f2",
    mark: "#8B7FB8",
    text: "#3B3360",
    soft: "rgba(139,127,184,0.16)",
    softer: "rgba(139,127,184,0.10)",
  },
  sleep: {
    bg: "#e7ecff",
    mark: "#6472B8",
    text: "#2A2F58",
    soft: "rgba(100,114,184,0.18)",
    softer: "rgba(100,114,184,0.10)",
  },
  meals: {
    bg: "#ffd9d1",
    mark: "#B7583F",
    text: "#4A1D12",
    soft: "rgba(183,88,63,0.18)",
    softer: "rgba(183,88,63,0.10)",
  },
  med: {
    bg: "#ffe7bd",
    mark: "#B88A3A",
    text: "#4A3514",
    soft: "rgba(184,138,58,0.18)",
    softer: "rgba(184,138,58,0.10)",
  },
  activity: {
    bg: "#d8ebe8",
    mark: "#5F8F8A",
    text: "#233B39",
    soft: "rgba(95,143,138,0.18)",
    softer: "rgba(95,143,138,0.10)",
  },
  weight: {
    bg: "#cfe3c4",
    mark: "#6B8E5A",
    text: "#2E3D24",
    soft: "rgba(107,142,90,0.18)",
    softer: "rgba(107,142,90,0.10)",
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

/* —— 每日记录行高度：不低于 48px —— */
const ROW_H = 52;

/* —— 横滑场景切换 variants —— */
const sceneVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0.4 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0.4 }),
};

/* =========================================================
 * LookbackPage —— 单屏单场景 + 横滑切换
 * ======================================================= */
export default function LookbackPage({ onBack }: { onBack: () => void }) {
  const [range, setRange] = useState<LookbackRange>(14);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [direction, setDirection] = useState(0);
  // 详情抽屉：点某天打开；null = 关闭
  const [detailIdx, setDetailIdx] = useState<number | null>(null);
  // 编辑表单：null = 关闭
  const [editIdx, setEditIdx] = useState<number | null>(null);

  // 本地覆盖：按 date 维度记录被删除/被编辑后的数据
  // 删除：将该日期对应场景字段置空；编辑：覆盖该日期数据
  const [overrides, setOverrides] = useState<Record<string, Partial<DailyLookbackData>>>({});

  const baseData = useMemo(() => lookbackData[range], [range]);
  const data = useMemo(
    () => baseData.map((d) => (overrides[d.date] ? { ...d, ...overrides[d.date] } : d)),
    [baseData, overrides],
  );
  const days = data.length;
  const first = data[0];
  const last = data[days - 1];
  const rangeText = `${first.displayDate} - ${last.displayDate}`;

  const currentScene = scenes[sceneIdx];
  const detailDay = detailIdx !== null ? data[detailIdx] : null;
  const editDay = editIdx !== null ? data[editIdx] : null;

  const goScene = (idx: number) => {
    if (idx < 0 || idx >= scenes.length || idx === sceneIdx) return;
    setDirection(idx > sceneIdx ? 1 : -1);
    setSceneIdx(idx);
    setDetailIdx(null);
  };

  const changeRange = (r: LookbackRange) => {
    setRange(r);
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
      {/* 顶部：返回 + 标题 */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-3">
        <button
          onClick={onBack}
          aria-label="返回更多"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">
          回头看看
        </h2>
      </div>

      {/* 时间范围切换 + 日期区间 */}
      <div className="px-5 pb-2.5">
        <RangeTabs value={range} onChange={changeRange} />
        <p className="mt-2 text-[12px] text-ink-faint">{rangeText}</p>
      </div>

      {/* 场景标签栏 */}
      <SceneTabs
        scenes={scenes}
        activeIdx={sceneIdx}
        onSelect={goScene}
        theme={theme}
      />

      {/* 主体：单场景横滑区 */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={sceneIdx}
            custom={direction}
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
              if (offset < -60 || velocity < -500) {
                if (sceneIdx < scenes.length - 1) goScene(sceneIdx + 1);
              } else if (offset > 60 || velocity > 500) {
                if (sceneIdx > 0) goScene(sceneIdx - 1);
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
          className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-line-soft disabled:opacity-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-[10px]">{currentScene.label}</span>
        <button
          onClick={() => goScene(sceneIdx + 1)}
          disabled={sceneIdx === scenes.length - 1}
          aria-label="下一场景"
          className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-line-soft disabled:opacity-0"
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
            onClose={() => setDetailIdx(null)}
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
    </div>
  );
}

/* =========================================================
 * RangeTabs
 * ======================================================= */
function RangeTabs({
  value,
  onChange,
}: {
  value: LookbackRange;
  onChange: (r: LookbackRange) => void;
}) {
  const tabs: { key: LookbackRange; label: string }[] = [
    { key: 7, label: "近 7 天" },
    { key: 14, label: "近 14 天" },
    { key: 30, label: "近 30 天" },
  ];
  return (
    <div className="flex gap-1 rounded-lg bg-line-soft p-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`flex-1 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
            value === t.key
              ? "bg-canvas text-ink shadow-sm"
              : "text-ink-soft hover:text-ink"
          }`}
        >
          {t.label}
        </button>
      ))}
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
              className="text-[12px] font-medium transition-colors"
              style={{
                color: active ? theme.text : "#9B9A97",
              }}
            >
              {s.label}
            </span>
            <span
              className="h-[3px] w-5 rounded-full transition-all duration-200"
              style={{
                backgroundColor: active ? theme.mark : "transparent",
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
  onOpenDetail,
}: {
  sceneKey: SceneKey;
  data: DailyLookbackData[];
  onOpenDetail: (i: number) => void;
}) {
  // 降序展示：最近一天在顶部
  const reversed = [...data].reverse();
  // reversed[i] 对应原 data[days-1-i]
  const days = data.length;

  return (
    <div className="h-full overflow-y-auto px-4 pb-4 pt-1">
      {/* 趋势区：非卡片，轻量信息区块（浅背景区分，不再套卡） */}
      <TrendArea sceneKey={sceneKey} data={data} />

      {/* 详情列表主卡：白底，分隔线区分行 */}
      <div className="mt-4 overflow-hidden rounded-[20px] border border-line-soft bg-white shadow-[0_1px_3px_-1px_rgba(0,0,0,0.04)]">
        {reversed.map((d, ri) => {
          const originalIdx = days - 1 - ri;
          return (
            <DayRow
              key={d.date}
              sceneKey={sceneKey}
              day={d}
              onClick={() => onOpenDetail(originalIdx)}
              isLast={ri === reversed.length - 1}
            />
          );
        })}
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
    <div className="rounded-[18px] px-4 py-3.5" style={{ backgroundColor: theme.softer }}>
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
        <span className="text-[10px]" style={{ color: theme.text, opacity: 0.5 }}>
          {compactDate(first.displayDate)}
        </span>
        <span className="text-[10px]" style={{ color: theme.text, opacity: 0.5 }}>
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
  const padY = 10;
  const usable = H - padY * 2;

  const points = data.map((d, i) => {
    if (d.mood === null) return null;
    const x = ((i + 0.5) / days) * 100;
    const y = padY + (1 - (d.mood - 1) / 4) * usable;
    return { x, y };
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
      {/* 两端弱提示：早/晚 */}
      <span className="absolute left-0 top-0 text-[8px]" style={{ color: theme.text, opacity: 0.35 }}>早</span>
      <span className="absolute left-0 bottom-0 text-[8px]" style={{ color: theme.text, opacity: 0.35 }}>晚</span>
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

/* —— 4. 服药趋势：早/晚药盒矩阵带 —— */
function MedTrend({ data }: { data: DailyLookbackData[] }) {
  const theme = themes.med;
  const days = data.length;

  const cellStyle = (s: MedState): React.CSSProperties => {
    if (s === "taken") return { backgroundColor: theme.mark, opacity: 0.85 };
    if (s === "missed") return { borderColor: theme.mark, borderWidth: 1, borderStyle: "solid", backgroundColor: "transparent", opacity: 0.5 };
    if (s === "changed") return { backgroundColor: theme.mark, opacity: 0.4 };
    return { backgroundColor: theme.soft, opacity: 0.5 };
  };

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

/* —— 5. 活动趋势：0-3 等级圆滑曲线 —— */
function ActivityTrend({ data }: { data: DailyLookbackData[] }) {
  const theme = themes.activity;
  const days = data.length;
  const H = 80;
  const padY = 10;
  const usable = H - padY * 2;

  const points = data.map((d, i) => {
    if (d.activityLevel === null) return null;
    const x = ((i + 0.5) / days) * 100;
    const y = padY + (1 - d.activityLevel / 3) * usable;
    return { x, y };
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
      className="group flex w-full items-center gap-3 px-4 transition-colors hover:bg-line-soft/60"
      style={{
        height: ROW_H,
        borderBottom: isLast ? "none" : "1px solid var(--color-line, #EEEAE4)",
      }}
    >
      {/* 左：日期 + 星期 */}
      <div className="w-12 shrink-0 text-left">
        <div className="text-[12px] font-medium text-ink">
          {day.displayDate.replace("月", "/").replace("日", "")}
        </div>
        <div className="text-[9px] text-ink-faint">
          {weekday(day.date)}
        </div>
      </div>

      {/* 中：场景可视化 */}
      <div className="flex-1">
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
 * 1. MoodRow —— 每日情绪刻度（细轨道，静态信息，非 slider）
 * ======================================================= */
function MoodRow({ day }: { day: DailyLookbackData }) {
  const theme = themes.mood;
  if (day.mood === null) {
    return <EmptyRow text="未记录" />;
  }
  // 1-5 刻度，细轨道 + 静态点
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-[2px] flex-1 rounded-full" style={{ backgroundColor: theme.soft }}>
        {/* 5 个刻度位：极淡静态标记 */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute top-1/2 h-[3px] w-[3px] -translate-y-1/2 rounded-full"
            style={{
              left: `${(i / 4) * 100}%`,
              transform: "translate(-50%, -50%)",
              backgroundColor: theme.text,
              opacity: 0.18,
            }}
          />
        ))}
        {/* 当前点位：小而克制，无光晕 */}
        <div
          className="absolute top-1/2 h-[8px] w-[8px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${((day.mood! - 1) / 4) * 100}%`,
            backgroundColor: theme.mark,
            opacity: 0.85,
          }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-[11px] font-medium" style={{ color: theme.text, opacity: 0.7 }}>
        {moodLabel[day.mood as Mood]}
      </span>
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
      <span className="text-[9px]" style={{ color: theme.text, opacity: 0.4 }}>早</span>
      <div className="relative h-[2px] flex-1 rounded-full" style={{ backgroundColor: theme.soft }}>
        <div
          className="absolute top-1/2 h-[8px] w-[8px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${ratio * 100}%`,
            backgroundColor: theme.mark,
            opacity: 0.85,
          }}
        />
      </div>
      <span className="text-[9px]" style={{ color: theme.text, opacity: 0.4 }}>晚</span>
      <span className="w-12 shrink-0 text-right text-[11px] font-medium" style={{ color: theme.text, opacity: 0.7 }}>
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
            <span className="text-[10px]" style={{ color: theme.text, opacity: 0.5 }}>{it.label}</span>
            <div className="h-[9px] w-[9px] rounded-full" style={style} />
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
 * 4. MedRow —— 每日药盒状态（早/晚 两块）
 * ======================================================= */
function MedRow({ day }: { day: DailyLookbackData }) {
  const theme = themes.med;
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
            <span className="text-[10px]" style={{ color: theme.text, opacity: 0.5 }}>{it.label}</span>
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
      <span className="text-[11px]" style={{ color: theme.text, opacity: 0.7 }}>
        {activityLabel[lvl]}
      </span>
    </div>
  );
}

/* =========================================================
 * 6. WeightRow —— 每日体重记录
 * ======================================================= */
function WeightRow({ day }: { day: DailyLookbackData }) {
  const theme = themes.weight;
  if (day.weight === null) {
    return <EmptyRow text="未记录" />;
  }
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-[14px] font-medium" style={{ color: theme.text }}>
        {day.weight}
      </span>
      <span className="text-[10px]" style={{ color: theme.text, opacity: 0.5 }}>kg</span>
    </div>
  );
}

/* —— 空状态行：淡化占位，不等同于 0 —— */
function EmptyRow({ text }: { text: string }) {
  return (
    <span className="text-[11px] text-ink-faint/40">{text}</span>
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
  onClose,
  onEdit,
  onDelete,
}: {
  day: DailyLookbackData;
  sceneKey: SceneKey;
  theme: Theme;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
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
    onEdit();
  };

  const handleDeleteClick = () => {
    setMenuOpen(false);
    setConfirmOpen(true);
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
      {/* 抽屉：支持下拉关闭 */}
      <motion.div
        className="absolute inset-x-0 bottom-0 z-50 rounded-t-[24px] bg-white px-6 pb-8 pt-3 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.15)]"
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
        <div className="mx-auto mb-4 h-1 w-9 rounded-full" style={{ backgroundColor: theme.soft }} />

        {/* 标题区：左 日期+星期 / 右 仅 ··· */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold" style={{ color: theme.text }}>
              {day.displayDate}
            </span>
            <span className="text-[11px]" style={{ color: theme.text, opacity: 0.5 }}>
              {weekday(day.date)}
            </span>
          </div>

          <div className="relative" ref={menuRef}>
            {/* 更多菜单入口 */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="更多操作"
              aria-expanded={menuOpen}
              className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-line-soft"
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
                    className="flex w-full items-center px-3 py-2 text-left text-[13px] text-ink transition-colors hover:bg-line-soft"
                  >
                    修改记录
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="flex w-full items-center px-3 py-2 text-left text-[13px] text-ink transition-colors hover:bg-line-soft"
                  >
                    删除记录
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 字段列表 */}
        <div className="flex flex-col divide-y" style={{ borderColor: theme.softer }}>
          {rows.map((r, i) => (
            <div
              key={i}
              className="flex items-baseline justify-between gap-4 py-3"
              style={{ borderTop: i === 0 ? "none" : `1px solid ${theme.softer}` }}
            >
              <span className="text-[13px]" style={{ color: theme.text, opacity: 0.6 }}>
                {r.k}
              </span>
              <span className="text-right text-[14px]" style={{ color: theme.text }}>
                {r.v}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 删除二次确认：底部确认层 */}
      <AnimatePresence>
        {confirmOpen && (
          <DeleteConfirm
            onCancel={() => setConfirmOpen(false)}
            onConfirm={() => {
              setConfirmOpen(false);
              onDelete();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* —— 删除二次确认：底部确认层 —— */
function DeleteConfirm({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <motion.div
        className="absolute inset-0 z-[60] bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease }}
        onClick={onCancel}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 z-[61] rounded-t-[20px] bg-white px-6 pb-8 pt-5"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
      >
        <div className="mb-5">
          <div className="text-[16px] font-semibold text-ink">删除这条记录？</div>
          <div className="mt-2 text-[13px] leading-relaxed text-ink-faint">
            删除后，这一天的对应记录将不再显示。
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onConfirm}
            className="w-full rounded-xl py-3 text-[15px] font-medium text-white transition-transform active:scale-[0.98]"
            style={{ backgroundColor: "#C9A0A0" }}
          >
            删除
          </button>
          <button
            onClick={onCancel}
            className="w-full rounded-xl bg-line-soft py-3 text-[15px] text-ink-soft transition-colors hover:bg-line"
          >
            取消
          </button>
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
          style={{ borderBottom: `1px solid ${theme.softer}` }}
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
            style={{ color: theme.mark }}
          >
            保存修改
          </button>
        </div>

        {/* 表单内容区：可滚动 */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
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

function initForm(sceneKey: SceneKey, day: DailyLookbackData): EditFormState {
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
    case "mood":
      return {
        mood: form.mood,
        moodWords: form.moodWords ? form.moodWords.split(/[、,，]/).map((s) => s.trim()).filter(Boolean) : null,
        moodTrigger: form.moodTrigger || null,
        moodBody: form.moodBody || null,
        moodNote: form.moodNote || null,
      };
    case "sleep": {
      const sleepTime = form.sleepTime || null;
      const wakeTime = form.wakeTime || null;
      let sleepDurationMin: number | null = null;
      if (sleepTime && wakeTime) {
        const [sh, sm] = sleepTime.split(":").map(Number);
        const [wh, wm] = wakeTime.split(":").map(Number);
        let sMin = sh * 60 + sm;
        if (sMin < 6 * 60) sMin += 24 * 60;
        let wMin = wh * 60 + wm;
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
      <div className="mb-2 text-[13px] font-medium text-ink">{label}</div>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  theme,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  theme: Theme;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border bg-white px-3 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-current"
      style={{ borderColor: theme.softer, color: theme.text }}
    />
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
      style={{ borderColor: theme.softer, color: theme.text }}
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
              backgroundColor: active ? theme.mark : "transparent",
              color: active ? "#fff" : theme.text,
              border: `1px solid ${active ? theme.mark : theme.softer}`,
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
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  theme: Theme;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full resize-none rounded-xl border bg-white px-3 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-current"
      style={{ borderColor: theme.softer, color: theme.text }}
    />
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
        />
      </FormField>
      <FormField label="触发事件">
        <TextInput
          value={form.moodTrigger}
          onChange={(v) => setField("moodTrigger", v)}
          placeholder="如：和家人争吵"
          theme={theme}
        />
      </FormField>
      <FormField label="身体感受">
        <TextInput
          value={form.moodBody}
          onChange={(v) => setField("moodBody", v)}
          placeholder="如：胸闷"
          theme={theme}
        />
      </FormField>
      <FormField label="补充说明">
        <TextArea
          value={form.moodNote}
          onChange={(v) => setField("moodNote", v)}
          placeholder="可补充"
          theme={theme}
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
        />
      </FormField>
      <FormField label="补充说明">
        <TextArea
          value={form.activityNote}
          onChange={(v) => setField("activityNote", v)}
          placeholder="可补充"
          theme={theme}
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

/* —— 详情抽屉字段：按场景构建 —— */
function buildDetailRows(
  sceneKey: SceneKey,
  day: DailyLookbackData,
): { k: string; v: string }[] {
  switch (sceneKey) {
    case "mood":
      return [
        { k: "情绪", v: day.mood !== null ? moodLabel[day.mood as Mood] : "未记录" },
        { k: "情绪词", v: day.moodWords?.join("、") ?? "未记录" },
        { k: "触发事件", v: day.moodTrigger ?? "未记录" },
        { k: "身体感受", v: day.moodBody ?? "未记录" },
        { k: "补充说明", v: day.moodNote ?? "—" },
      ];
    case "sleep": {
      const duration =
        day.sleepDurationMin !== null
          ? `${Math.floor(day.sleepDurationMin / 60)}小时${day.sleepDurationMin % 60}分钟`
          : "未记录";
      return [
        { k: "入睡", v: day.sleepTime ?? "未记录" },
        { k: "醒来", v: day.wakeTime ?? "未记录" },
        { k: "睡眠时长", v: duration },
        { k: "夜醒", v: day.nightWake ?? "未记录" },
        { k: "醒后感受", v: day.wakeFeeling ?? "未记录" },
      ];
    }
    case "meals":
      return [
        { k: "早餐", v: mealLabel[day.meals.breakfast] },
        { k: "午餐", v: mealLabel[day.meals.lunch] },
        { k: "晚餐", v: mealLabel[day.meals.dinner] },
        { k: "饭后感受", v: day.mealFeeling ?? "未记录" },
      ];
    case "med":
      return [
        { k: "早", v: medLabel[day.medication.morning] },
        { k: "晚", v: medLabel[day.medication.evening] },
        { k: "改动说明", v: day.medChangeNote ?? "无" },
      ];
    case "activity":
      return [
        { k: "活动等级", v: day.activityLevel !== null ? activityLabel[day.activityLevel] : "未记录" },
        { k: "活动内容", v: day.activityContent ?? "—" },
        { k: "补充说明", v: day.activityNote ?? "—" },
      ];
    case "weight":
      return [
        { k: "体重", v: day.weight !== null ? `${day.weight} kg` : "未记录" },
      ];
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
