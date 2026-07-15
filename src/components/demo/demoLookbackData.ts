/* —— 第二周 21:00 节点：回头看看 14 天 Demo 数据 ——
 *
 * 严格对齐固定剧情时间配置：
 *   src/components/demo/scenarios/xiaochenGuidedTimeConfig.ts
 *
 * 数据范围统一为 2026-05-16 ~ 2026-05-29（Day 1 ~ Day 2 前一天），
 * 不出现 6-30 ~ 7-13 等自由体验模式日期。
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

import type { DailyLookbackData } from "@/data/lookback";

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
  { date: "2026-05-16", sleepTimeMinutes: 105 }, // 01:45
  { date: "2026-05-17", sleepTimeMinutes: 90 }, // 01:30
  { date: "2026-05-18", sleepTimeMinutes: 125 }, // 02:05
  { date: "2026-05-19", sleepTimeMinutes: 80 }, // 01:20
  { date: "2026-05-20", sleepTimeMinutes: 70 }, // 01:10
  { date: "2026-05-21", sleepTimeMinutes: 100 }, // 01:40
  { date: "2026-05-22", sleepTimeMinutes: 75 }, // 01:15
  { date: "2026-05-23", sleepTimeMinutes: 65 }, // 01:05
  { date: "2026-05-24", sleepTimeMinutes: 50 }, // 00:50
  { date: "2026-05-25", sleepTimeMinutes: 70 }, // 01:10
  { date: "2026-05-26", sleepTimeMinutes: 40 }, // 00:40
  { date: "2026-05-27", sleepTimeMinutes: 30 }, // 00:30
  { date: "2026-05-28", sleepTimeMinutes: 55 }, // 00:55
  { date: "2026-05-29", sleepTimeMinutes: 20 }, // 00:20
];

/** 饮食记录天数对比 */
const MEAL_RECORD_DAYS = {
  firstWeek: 3,
  secondWeek: 5,
} as const;

/** 日期范围（用于标题展示） */
export const DATE_RANGE_LABEL = "5月16日—5月29日";

/** 周平均值（午夜后分钟数） */
const WEEK_AVERAGES = {
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
function averageSleepMinutes(
  data: SleepDataPoint[],
  startIdx: number,
  endIdx: number,
): number {
  const slice = data.slice(startIdx, endIdx + 1);
  const total = slice.reduce((sum, d) => sum + d.sleepTimeMinutes, 0);
  return Math.round(total / slice.length);
}

/** 将 Demo 睡眠数据转换为 DailyLookbackData 格式
 *
 *  供正式 LookbackPage 的 TrendArea / SleepTrend 组件直接消费。
 *  仅填充 sleepTime 与日期字段，其余场景字段全部置空 / unknown，
 *  确保 Demo 数据不混入正式产品数据源。
 */
export function toDailyLookbackData(data: SleepDataPoint[]): DailyLookbackData[] {
  return data.map((point) => {
    const [, m, d] = point.date.split("-").map(Number);
    return {
      date: point.date,
      displayDate: `${m}月${d}日`,
      mood: null,
      moodWords: null,
      moodTrigger: null,
      moodBody: null,
      moodNote: null,
      moodEntries: null,
      sleepTime: formatSleepTime(point.sleepTimeMinutes),
      wakeTime: null,
      sleepDurationMin: null,
      nightWake: null,
      wakeFeeling: null,
      sleepLevel: null,
      sleepBedTime: null,
      sleepNote: null,
      sleepRecordTime: null,
      meals: { breakfast: "unknown", lunch: "unknown", dinner: "unknown" },
      mealFeeling: null,
      mealEntries: null,
      medication: { morning: "unknown", evening: "unknown" },
      medChangeNote: null,
      medEntries: null,
      activityLevel: null,
      activityContent: null,
      activityNote: null,
      activityDuration: null,
      activityFeeling: null,
      activityRecordTime: null,
      weight: null,
      weightMeasureContext: null,
      weightNote: null,
      weightRecordTime: null,
    } satisfies DailyLookbackData;
  });
}
