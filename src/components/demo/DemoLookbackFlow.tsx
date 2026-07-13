import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  SLEEP_TREND_14_DAYS,
  MEAL_RECORD_DAYS,
  DATE_RANGE_LABEL,
  formatSleepTime,
  averageSleepMinutes,
  type SleepDataPoint,
} from "./demoLookbackData";

/* —— 第二周 21:00 节点：回头看看 近两周趋势 演示页 ——
 *
 * 核心表达：
 *   小晨第一次不只依靠当下感受判断自己，而是通过连续记录，
 *   从外部看见这两周真实发生的变化。
 *
 * 展示两个事实：
 *   1. 入睡时间整体有所提前，但仍存在波动；
 *   2. 第二周留下饮食记录的天数比第一周增加。
 *
 * 视觉对齐：复用 LookbackPage 的标题结构、Theme 体系、字号规则、卡片规范。
 *
 * 数据隔离：所有数据为组件内固定 Demo 数据，不写入 localStorage、
 * 不读取真实记录、不影响自由体验模式。
 *
 * 状态重置：组件卸载（离开节点）后重新挂载时，tooltip 自动关闭、滚动恢复顶部。
 */

const ease = [0.22, 1, 0.36, 1] as const;

/* 复用 LookbackPage 的 Theme 体系 */
const sleepTheme = {
  bg: "var(--z-status-sleep-bg)",
  mark: "var(--z-status-sleep)",
  text: "var(--z-text-main)",
  soft: "rgb(var(--z-status-sleep-rgb) / 0.18)",
  softer: "rgb(var(--z-status-sleep-rgb) / 0.10)",
} as const;

const mealTheme = {
  bg: "var(--z-status-meal-bg)",
  mark: "var(--z-status-meal)",
  text: "var(--z-text-main)",
  soft: "rgb(var(--z-status-meal-rgb) / 0.18)",
  softer: "rgb(var(--z-status-meal-rgb) / 0.10)",
} as const;

/* —— 图表参数 ——
 * 纵轴反向：00:00 在上方（更早入睡向上），02:00 在下方
 * 数据范围：20 分钟（00:20）到 125 分钟（02:05）
 * 纵轴展示：00:00 / 01:00 / 02:00 三个刻度
 */
const Y_MIN_MINUTES = 0; // 00:00
const Y_MAX_MINUTES = 120; // 02:00
const Y_TICKS = [0, 60, 120]; // 00:00 / 01:00 / 02:00

const CHART_HEIGHT = 160;
const CHART_PAD_TOP = 16;
const CHART_PAD_BOTTOM = 28;
const CHART_USABLE_HEIGHT = CHART_HEIGHT - CHART_PAD_TOP - CHART_PAD_BOTTOM;

/* Catmull-Rom 平滑路径 */
function smoothPath(pts: { x: number; y: number }[], tension = 0.5): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;
  if (pts.length === 2)
    return `M ${pts[0].x},${pts[0].y} L ${pts[1].x},${pts[1].y}`;
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

/* 将入睡分钟数映射为 Y 坐标（反向：越早越上） */
function minutesToY(minutes: number): number {
  const ratio = (minutes - Y_MIN_MINUTES) / (Y_MAX_MINUTES - Y_MIN_MINUTES);
  // 反向：ratio=0（00:00）在顶部，ratio=1（02:00）在底部
  return CHART_PAD_TOP + ratio * CHART_USABLE_HEIGHT;
}

/* 紧凑日期：6/30、7/2 等 */
function compactDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-").map(Number);
  return `${m}/${d}`;
}

export default function DemoLookbackFlow() {
  const prefersReducedMotion = useReducedMotion();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const data = SLEEP_TREND_14_DAYS;
  const days = data.length;

  /* 周平均值 */
  const firstWeekAvg = useMemo(
    () => averageSleepMinutes(data, 0, 6),
    [data],
  );
  const secondWeekAvg = useMemo(
    () => averageSleepMinutes(data, 7, 13),
    [data],
  );

  /* 折线点：x 按天均匀分布，y 按入睡时间反向映射 */
  const points = useMemo<{ x: number; y: number; point: SleepDataPoint }[]>(
    () =>
      data.map((point, i) => {
        const x = ((i + 0.5) / days) * 100;
        const y = minutesToY(point.sleepTimeMinutes);
        return { x, y, point };
      }),
    [data, days],
  );

  /* x 轴标签：每 2 天显示一个，避免拥挤 */
  const xLabels = useMemo(
    () =>
      data.map((d, i) => ({
        idx: i,
        x: ((i + 0.5) / days) * 100,
        label: i % 2 === 0 ? compactDate(d.date) : "",
      })),
    [data, days],
  );

  /* 周分界线位置：第 7 天与第 8 天之间 */
  const weekDividerX = (7 / days) * 100;

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease }}
    >
      {/* 状态栏占位 */}
      <div className="h-11 shrink-0" />

      {/* 顶部标题 */}
      <div className="flex items-center gap-3 px-5 pt-3 pb-2">
        <h1 className="text-[17px] font-semibold tracking-tight text-ink">
          回头看看
        </h1>
      </div>

      {/* 时间范围：近两周 */}
      <div className="px-5 pb-3">
        <div className="text-[13px] text-ink-soft">
          <span className="text-ink-faint">近两周</span>
          <span className="ml-3">{DATE_RANGE_LABEL}</span>
        </div>
      </div>

      {/* 内容区：可滚动 */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        {/* === 睡眠趋势区 === */}
        <section>
          <h2 className="text-[14px] font-medium text-ink">睡眠</h2>
          <div className="text-[13px] text-ink-faint">入睡时间趋势</div>

          {/* 图表卡片 */}
          <div
            className="mt-3 rounded-2xl px-4 py-4"
            style={{ backgroundColor: sleepTheme.softer }}
          >
            {/* aria-label：文字摘要供屏幕阅读器 */}
            <div
              aria-label={`近两周入睡时间趋势。第一周平均约凌晨 1 点 32 分，第二周平均约凌晨 0 点 47 分，整体有所提前，但仍有波动。`}
              className="relative w-full"
              style={{ height: CHART_HEIGHT }}
            >
              {/* 纵轴刻度 + 横向参考线 */}
              {Y_TICKS.map((tick) => {
                const y = minutesToY(tick);
                return (
                  <div
                    key={tick}
                    className="absolute left-0 right-0 flex items-center"
                    style={{ top: y }}
                  >
                    <span
                      className="w-10 shrink-0 text-[11px] text-ink-faint"
                      style={{ opacity: 0.6 }}
                    >
                      {formatSleepTime(tick)}
                    </span>
                    <div
                      className="ml-1 flex-1"
                      style={{
                        borderTop: `1px solid ${sleepTheme.soft}`,
                        opacity: 0.5,
                      }}
                    />
                  </div>
                );
              })}

              {/* 周分界虚线 */}
              <div
                className="absolute top-0 bottom-0"
                style={{
                  left: `${weekDividerX}%`,
                  borderLeft: `1px dashed ${sleepTheme.mark}`,
                  opacity: 0.4,
                }}
              />

              {/* 折线 SVG */}
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox={`0 0 100 ${CHART_HEIGHT}`}
                preserveAspectRatio="none"
              >
                <path
                  d={smoothPath(points.map((p) => ({ x: p.x, y: p.y })))}
                  fill="none"
                  stroke={sleepTheme.mark}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  opacity={0.7}
                />
              </svg>

              {/* 数据点 + tooltip 触发区 */}
              {points.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className="absolute rounded-full"
                  style={{
                    left: `${p.x}%`,
                    top: p.y,
                    width: 8,
                    height: 8,
                    transform: "translate(-50%, -50%)",
                    backgroundColor: sleepTheme.mark,
                    opacity: hoveredIdx === i ? 1 : 0.7,
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() =>
                    setHoveredIdx((prev) => (prev === i ? null : i))
                  }
                  aria-label={`${compactDate(p.point.date)} 入睡时间 ${formatSleepTime(p.point.sleepTimeMinutes)}`}
                />
              ))}

              {/* tooltip：悬停或点击时显示 */}
              {hoveredIdx !== null && (
                <div
                  className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg bg-ink/85 px-2.5 py-1.5 text-[11px] text-white shadow-sm"
                  style={{
                    left: `${points[hoveredIdx].x}%`,
                    top: points[hoveredIdx].y - 36,
                  }}
                >
                  <div className="whitespace-nowrap">
                    {compactDate(points[hoveredIdx].point.date)}
                  </div>
                  <div className="whitespace-nowrap font-medium">
                    {formatSleepTime(points[hoveredIdx].point.sleepTimeMinutes)}
                  </div>
                </div>
              )}
            </div>

            {/* x 轴标签 */}
            <div className="relative mt-1 h-4">
              {xLabels.map((label) =>
                label.label ? (
                  <span
                    key={label.idx}
                    className="absolute -translate-x-1/2 text-[10px] text-ink-faint"
                    style={{ left: `${label.x}%`, opacity: 0.7 }}
                  >
                    {label.label}
                  </span>
                ) : null,
              )}
            </div>

            {/* 周分界标签 */}
            <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-ink-faint">
              <span style={{ opacity: 0.7 }}>第一周</span>
              <span style={{ opacity: 0.4 }}>|</span>
              <span style={{ opacity: 0.7 }}>第二周</span>
            </div>
          </div>

          {/* 周平均值 */}
          <div className="mt-3 flex gap-3">
            <div className="flex-1 rounded-xl border border-line bg-white px-3 py-2.5">
              <div className="text-[11px] text-ink-faint">第一周平均</div>
              <div className="mt-0.5 text-[15px] font-medium text-ink">
                {formatSleepTime(firstWeekAvg)}
              </div>
            </div>
            <div className="flex-1 rounded-xl border border-line bg-white px-3 py-2.5">
              <div className="text-[11px] text-ink-faint">第二周平均</div>
              <div className="mt-0.5 text-[15px] font-medium text-ink">
                {formatSleepTime(secondWeekAvg)}
              </div>
            </div>
          </div>

          {/* 系统摘要 */}
          <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
            入睡时间整体有所提前，但仍有波动。
          </p>
        </section>

        {/* === 饮食辅助摘要卡 === */}
        <section className="mt-6">
          <h2 className="text-[14px] font-medium text-ink">饮食记录</h2>
          <div
            className="mt-3 rounded-2xl px-4 py-4"
            style={{ backgroundColor: mealTheme.softer }}
          >
            <div className="text-[13px] text-ink-soft">
              留下饮食记录的天数
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <div>
                <div className="text-[11px] text-ink-faint">第一周</div>
                <div className="text-[16px] font-medium text-ink">
                  {MEAL_RECORD_DAYS.firstWeek} 天
                </div>
              </div>
              <span className="text-[16px] text-ink-faint">→</span>
              <div>
                <div className="text-[11px] text-ink-faint">第二周</div>
                <div className="text-[16px] font-medium text-ink">
                  {MEAL_RECORD_DAYS.secondWeek} 天
                </div>
              </div>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-ink-faint">
              第二周比第一周多留下了 {MEAL_RECORD_DAYS.secondWeek - MEAL_RECORD_DAYS.firstWeek} 天记录。
            </p>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
