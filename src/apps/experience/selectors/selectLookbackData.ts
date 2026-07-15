/* —— Selector：回头看看数据切片 ——
 *
 * 体验模式回头看看模块必须通过本 Selector 读取数据，
 * 不得继续调用 src/data/lookback.ts 的 buildDayByDate / buildWeekRange / buildMonthRange。
 *
 * 本 Selector 直接从小晨回头看看日级固定数据读取，按周/月切片返回。
 * 周视图只开放最近四个自然周；月视图只开放 2026 年 6 月与截至
 * 2026-07-15 的 7 月，避免未来日期和空白月份进入页面。 */
import type { DailyLookbackData } from "@/data/lookback";
import {
  XIAOCHEN_LOOKBACK_ALL_DAYS,
  XIAOCHEN_LOOKBACK_CURRENT_DATE,
  XIAOCHEN_LOOKBACK_DAILY_RECORDS,
  XIAOCHEN_LOOKBACK_MONTHS,
  XIAOCHEN_LOOKBACK_START,
  XIAOCHEN_LOOKBACK_WEEK_STARTS,
} from "../data/xiaochen";

/* —— 参考日（固定 2026-07-15）—— */
export function getXiaochenReferenceDate(): Date {
  return new Date(XIAOCHEN_LOOKBACK_CURRENT_DATE + "T00:00:00+08:00");
}

/* —— 单日查询：返回某一天的 DailyLookbackData —— */
export function getXiaochenDailyRecord(dateStr: string): DailyLookbackData | null {
  return XIAOCHEN_LOOKBACK_DAILY_RECORDS[dateStr] ?? null;
}

/* —— 全部回头看看数据（升序）—— */
export function getXiaochenAllDays(): DailyLookbackData[] {
  return XIAOCHEN_LOOKBACK_ALL_DAYS;
}

/* —— 有任意记录的日期数据（升序）—— */
export function getXiaochenRecordedDays(): DailyLookbackData[] {
  return XIAOCHEN_LOOKBACK_ALL_DAYS.filter(hasAnyRecord);
}

/* —— 完全无记录的日期数据（升序）—— */
export function getXiaochenUnrecordedDays(): DailyLookbackData[] {
  return XIAOCHEN_LOOKBACK_ALL_DAYS.filter((d) => !hasAnyRecord(d));
}

/* —— 按周切片：从 weekStart（周一）开始，最多返回已发生日期 —— */
export function getXiaochenWeekRange(weekStart: Date): DailyLookbackData[] {
  const out: DailyLookbackData[] = [];
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  const current = getXiaochenReferenceDate();
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    if (d > current) break;
    const dateStr = formatDateStr(d);
    const record = XIAOCHEN_LOOKBACK_DAILY_RECORDS[dateStr];
    if (record) out.push(record);
  }
  return out;
}

/* —— 按月切片：仅 2026-06 与 2026-07，截至参考日 —— */
export function getXiaochenMonthRange(year: number, month: number): DailyLookbackData[] {
  const out: DailyLookbackData[] = [];
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  if (!(XIAOCHEN_LOOKBACK_MONTHS as readonly string[]).includes(monthKey)) return out;
  const daysInMonth = new Date(year, month, 0).getDate();
  const current = getXiaochenReferenceDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const d = new Date(`${dateStr}T00:00:00+08:00`);
    if (d > current) break;
    const record = XIAOCHEN_LOOKBACK_DAILY_RECORDS[dateStr];
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
    startDate: XIAOCHEN_LOOKBACK_START,
    endDate: XIAOCHEN_LOOKBACK_CURRENT_DATE,
    referenceDate: XIAOCHEN_LOOKBACK_CURRENT_DATE,
    totalDays: XIAOCHEN_LOOKBACK_ALL_DAYS.length,
    recordedDays: getXiaochenRecordedDays().length,
    unrecordedDays: getXiaochenUnrecordedDays().length,
  };
}

export function getXiaochenAllowedWeekStarts(): readonly string[] {
  return XIAOCHEN_LOOKBACK_WEEK_STARTS;
}

export function getXiaochenAllowedMonths(): readonly string[] {
  return XIAOCHEN_LOOKBACK_MONTHS;
}

/* —— 工具：格式化 Date 为 YYYY-MM-DD —— */
function formatDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function hasAnyRecord(day: DailyLookbackData): boolean {
  return (
    day.moodEntries !== null ||
    day.sleepTime !== null ||
    day.mealEntries !== null ||
    day.medEntries !== null ||
    day.activityLevel !== null ||
    day.weight !== null
  );
}
