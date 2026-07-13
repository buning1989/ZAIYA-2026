/* —— 第二周 21:00 节点：回头看看 14 天 Demo 数据 ——
 *
 * 严格对齐剧情文件：
 *   /Users/ning/Downloads/小晨DEMO演示第二周第一天剧情线.md
 *
 * 时间值存储为「午夜后分钟数」：
 *   - 00:00 = 0
 *   - 00:20 = 20
 *   - 01:30 = 90
 *   - 02:05 = 125
 *
 * 显示时统一格式化为 HH:mm。
 *
 * 这些数据只用于 Guided Demo，不写入正式产品数据源。
 */

/** 单日睡眠趋势数据点 */
export interface SleepDataPoint {
  /** 日期 YYYY-MM-DD */
  date: string;
  /** 入睡时间（午夜后分钟数，0=00:00，90=01:30） */
  sleepTimeMinutes: number;
}

/** 14 天睡眠趋势 Demo 数据
 *
 * 周平均值：
 *   第一周（第1-7天）：约 01:32（92 分钟）
 *   第二周（第8-14天）：约 00:47（47 分钟）
 */
export const SLEEP_TREND_14_DAYS: SleepDataPoint[] = [
  { date: "2026-06-30", sleepTimeMinutes: 105 }, // 01:45
  { date: "2026-07-01", sleepTimeMinutes: 90 }, // 01:30
  { date: "2026-07-02", sleepTimeMinutes: 125 }, // 02:05
  { date: "2026-07-03", sleepTimeMinutes: 80 }, // 01:20
  { date: "2026-07-04", sleepTimeMinutes: 70 }, // 01:10
  { date: "2026-07-05", sleepTimeMinutes: 100 }, // 01:40
  { date: "2026-07-06", sleepTimeMinutes: 75 }, // 01:15
  { date: "2026-07-07", sleepTimeMinutes: 65 }, // 01:05
  { date: "2026-07-08", sleepTimeMinutes: 50 }, // 00:50
  { date: "2026-07-09", sleepTimeMinutes: 70 }, // 01:10
  { date: "2026-07-10", sleepTimeMinutes: 40 }, // 00:40
  { date: "2026-07-11", sleepTimeMinutes: 30 }, // 00:30
  { date: "2026-07-12", sleepTimeMinutes: 55 }, // 00:55
  { date: "2026-07-13", sleepTimeMinutes: 20 }, // 00:20
];

/** 饮食记录天数对比 */
export const MEAL_RECORD_DAYS = {
  firstWeek: 3,
  secondWeek: 5,
} as const;

/** 日期范围（用于标题展示） */
export const DATE_RANGE_LABEL = "6月30日—7月13日";

/** 周平均值（午夜后分钟数） */
export const WEEK_AVERAGES = {
  firstWeek: 92, // ~01:32
  secondWeek: 47, // ~00:47
} as const;

/** 将「午夜后分钟数」格式化为 HH:mm */
export function formatSleepTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** 计算指定天数范围的平均入睡时间（分钟数） */
export function averageSleepMinutes(
  data: SleepDataPoint[],
  startIdx: number,
  endIdx: number,
): number {
  const slice = data.slice(startIdx, endIdx + 1);
  const total = slice.reduce((sum, d) => sum + d.sleepTimeMinutes, 0);
  return Math.round(total / slice.length);
}
