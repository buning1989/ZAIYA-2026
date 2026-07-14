/* —— Selector：回头看看数据切片 ——
 *
 * 体验模式回头看看模块必须通过本 Selector 读取数据，
 * 不得继续调用 src/data/lookback.ts 的 buildDayByDate / buildWeekRange / buildMonthRange。
 *
 * 本 Selector 直接从 XIAOCHEN_DAILY_RECORDS 读取固定 33 天数据，
 * 按周/月切片返回，保证日期、事件、统计数字与 constants.ts 一致。 */
import type { DailyLookbackData } from "@/data/lookback";
import {
  XIAOCHEN_DAILY_RECORDS,
  XIAOCHEN_ALL_DAYS,
  REFERENCE_DATE,
  PERIOD_START,
  PERIOD_END,
  XIAOCHEN_RECORDED_DATE_KEYS,
} from "../data/xiaochen";

/* —— 参考日（固定 2026-07-17）—— */
export function getXiaochenReferenceDate(): Date {
  return new Date(REFERENCE_DATE + "T00:00:00+08:00");
}

/* —— 单日查询：返回某一天的 DailyLookbackData ——
 * 不在 33 天周期内的日期返回 null。 */
export function getXiaochenDailyRecord(dateStr: string): DailyLookbackData | null {
  return XIAOCHEN_DAILY_RECORDS[dateStr] ?? null;
}

/* —— 全部 33 天数据（升序）—— */
export function getXiaochenAllDays(): DailyLookbackData[] {
  return XIAOCHEN_ALL_DAYS;
}

/* —— 24 个有记录日数据（升序）—— */
export function getXiaochenRecordedDays(): DailyLookbackData[] {
  return XIAOCHEN_ALL_DAYS.filter((d) =>
    (XIAOCHEN_RECORDED_DATE_KEYS as readonly string[]).includes(d.date),
  );
}

/* —— 9 个无记录日数据（升序）—— */
export function getXiaochenUnrecordedDays(): DailyLookbackData[] {
  return XIAOCHEN_ALL_DAYS.filter(
    (d) => !(XIAOCHEN_RECORDED_DATE_KEYS as readonly string[]).includes(d.date),
  );
}

/* —— 按周切片：从 weekStart（周一）开始 7 天 ——
 * 不在 33 天周期内的日期跳过（不返回未来日期的随机数据）。
 * 与 src/data/lookback.ts 的 buildWeekRange 行为对齐，但数据源为 XIAOCHEN_DAILY_RECORDS。 */
export function getXiaochenWeekRange(weekStart: Date): DailyLookbackData[] {
  const out: DailyLookbackData[] = [];
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = formatDateStr(d);
    const record = XIAOCHEN_DAILY_RECORDS[dateStr];
    if (record) out.push(record);
  }
  return out;
}

/* —— 按月切片：返回某年某月所有在 33 天周期内的日期 ——
 * 与 src/data/lookback.ts 的 buildMonthRange 行为对齐，但数据源为 XIAOCHEN_DAILY_RECORDS。 */
export function getXiaochenMonthRange(year: number, month: number): DailyLookbackData[] {
  const out: DailyLookbackData[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const record = XIAOCHEN_DAILY_RECORDS[dateStr];
    if (record) out.push(record);
  }
  return out;
}

/* —— 周一计算（与 src/data/lookback.ts 的 getWeekStart 对齐）—— */
export function getXiaochenWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

/* —— 周期信息 —— */
export function getXiaochenPeriodInfo() {
  return {
    startDate: PERIOD_START,
    endDate: PERIOD_END,
    referenceDate: REFERENCE_DATE,
    totalDays: XIAOCHEN_ALL_DAYS.length,
    recordedDays: getXiaochenRecordedDays().length,
    unrecordedDays: getXiaochenUnrecordedDays().length,
  };
}

/* —— 工具：格式化 Date 为 YYYY-MM-DD —— */
function formatDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
