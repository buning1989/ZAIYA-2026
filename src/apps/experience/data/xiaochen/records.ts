/* —— 小晨体验模式：旧 33 天每日记录适配层 ——
 *
 * @deprecated 本文件不再是日级事实数据的来源。
 *   请直接引用：
 *     - XIAOCHEN_DAILY_ALL_DAYS / XIAOCHEN_DAILY_RECORDS from "./dailyRecords"
 *     - XIAOCHEN_CURRENT_DATE / XIAOCHEN_START_DATE from "./timeConfig"
 *
 * 本文件仅保留为兼容适配层，将旧导出名桥接到统一事实源：
 *   - XIAOCHEN_RECORDED_DAYS → dailyRecords 中有记录的日期
 *   - XIAOCHEN_UNRECORDED_DAYS → dailyRecords 中无记录的日期
 *   - XIAOCHEN_ALL_DAYS → XIAOCHEN_DAILY_ALL_DAYS
 *   - XIAOCHEN_DAILY_RECORDS → XIAOCHEN_DAILY_RECORDS from dailyRecords
 *
 * 不再维护独立的日期循环、情绪/睡眠/三餐/服药和活动数据。
 * 不再包含 7 月 16、17 日的旧记录。 */
import type { DailyLookbackData } from "@/data/lookback";
import {
  XIAOCHEN_DAILY_ALL_DAYS,
  XIAOCHEN_DAILY_RECORDS as XIAOCHEN_DAILY_RECORDS_SOURCE,
} from "./dailyRecords";

/* —— 判定某日是否有任意生活记录 —— */
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

/** @deprecated 使用 XIAOCHEN_DAILY_ALL_DAYS.filter(hasAnyRecord) */
export const XIAOCHEN_RECORDED_DAYS: DailyLookbackData[] =
  XIAOCHEN_DAILY_ALL_DAYS.filter(hasAnyRecord);

/** @deprecated 使用 XIAOCHEN_DAILY_ALL_DAYS.filter(d => !hasAnyRecord(d)) */
export const XIAOCHEN_UNRECORDED_DAYS: DailyLookbackData[] =
  XIAOCHEN_DAILY_ALL_DAYS.filter((d) => !hasAnyRecord(d));

/** @deprecated 使用 XIAOCHEN_DAILY_ALL_DAYS from "./dailyRecords" */
export const XIAOCHEN_ALL_DAYS: DailyLookbackData[] = XIAOCHEN_DAILY_ALL_DAYS;

/** @deprecated 使用 XIAOCHEN_DAILY_RECORDS from "./dailyRecords" */
export const XIAOCHEN_DAILY_RECORDS: Record<string, DailyLookbackData> =
  XIAOCHEN_DAILY_RECORDS_SOURCE;
