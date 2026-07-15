/* —— 小晨体验模式统一数据源：兼容常量层 ——
 *
 * 本文件不再是事实数据的来源，而是面向旧调用方的兼容层。
 *
 * 数据来源（单一事实源）：
 *   - 时间常量 → ./timeConfig
 *   - 日级事实 → ./dailyRecords
 *   - 独立事件标注 → ./timeline（家庭冲突、未到校、呼吸练习、消极念头）
 *
 * 本文件通过派生函数 / 兼容别名，将旧调用方仍依赖的常量名
 * 桥接到统一事实源，不再独立维护日级事实或事件日期列表。
 *
 * @deprecated 新代码应直接引用 timeConfig / dailyRecords / timeline，
 *             不要再引用本文件中的常量。 */
import type { DailyLookbackData } from "@/data/lookback";
import {
  XIAOCHEN_CURRENT_DATE,
  XIAOCHEN_FOLLOWUP_DATE,
  XIAOCHEN_START_DATE,
} from "./timeConfig";
import { XIAOCHEN_DAILY_ALL_DAYS } from "./dailyRecords";
import {
  TIMELINE_NO_SCHOOL_DATES,
  TIMELINE_BREATHING_EXERCISE_DATE,
  TIMELINE_NEGATIVE_THOUGHT_DATES,
} from "./timeline";

/** 体验模式 Mock 数据版本号 */
export const EXPERIENCE_MOCK_DATA_VERSION = 4;

/* =========================================================
 * 日期常量（来自 timeConfig，不再硬编码）
 * ======================================================= */

/** @deprecated 使用 XIAOCHEN_START_DATE */
export const PERIOD_START = XIAOCHEN_START_DATE;

/** @deprecated 使用 XIAOCHEN_CURRENT_DATE */
export const PERIOD_END = XIAOCHEN_CURRENT_DATE;

/** @deprecated 使用 XIAOCHEN_CURRENT_DATE */
export const REFERENCE_DATE = XIAOCHEN_CURRENT_DATE;

/** 复诊日期（YYYY-MM-DD，不属于记录周期） */
export const APPOINTMENT_DATE = XIAOCHEN_FOLLOWUP_DATE;

/* =========================================================
 * 天数统计（从 dailyRecords 派生，不再硬编码 33 / 24 / 9）
 * ======================================================= */

/** 总天数（从开始日到当前日的完整日级记录数） */
export const TOTAL_DAYS = XIAOCHEN_DAILY_ALL_DAYS.length;

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

/** 有任意生活记录的日期（YYYY-MM-DD，升序） */
export const XIAOCHEN_RECORDED_DATE_KEYS: readonly string[] = XIAOCHEN_DAILY_ALL_DAYS
  .filter(hasAnyRecord)
  .map((d) => d.date);

/** 完全无生活记录的日期（YYYY-MM-DD，升序） */
export const XIAOCHEN_UNRECORDED_DATE_KEYS: readonly string[] = XIAOCHEN_DAILY_ALL_DAYS
  .filter((d) => !hasAnyRecord(d))
  .map((d) => d.date);

/** 有记录天数 */
export const RECORDED_DAYS = XIAOCHEN_RECORDED_DATE_KEYS.length;

/** 无记录天数 */
export const UNRECORDED_DAYS = XIAOCHEN_UNRECORDED_DATE_KEYS.length;

/* =========================================================
 * 可从日级事实派生的事件日期列表
 * ======================================================= */

/** 漏服喹硫平日期（medication.evening === "missed"） */
export const MISSED_MED_DATES: readonly string[] = XIAOCHEN_DAILY_ALL_DAYS
  .filter((d) => d.medication.evening === "missed")
  .map((d) => d.date);

/** 零点前入睡日期（sleepTime 在 20:00—23:59 之间） */
export const BEFORE_MIDNIGHT_SLEEP_DATES: readonly string[] = XIAOCHEN_DAILY_ALL_DAYS
  .filter((d) => {
  if (!d.sleepTime) return false;
  const [h] = d.sleepTime.split(":").map(Number);
  return h >= 20 && h <= 23;
  })
  .map((d) => d.date);

/** 最晚入睡日期与时间（从 dailyRecords 派生） */
const _latestSleep = XIAOCHEN_DAILY_ALL_DAYS
  .filter((d) => d.sleepTime !== null)
  .reduce(
    (latest, d) => {
      if (!latest || d.sleepTime! > latest.time) {
        return { date: d.date, time: d.sleepTime! };
      }
      return latest;
    },
    null as null | { date: string; time: string },
  );

export const LATEST_SLEEP_DATE: string = _latestSleep?.date ?? XIAOCHEN_CURRENT_DATE;
export const LATEST_SLEEP_TIME: string = _latestSleep?.time ?? "00:00";

/** 体重记录点（从 dailyRecords 派生） */
export const WEIGHT_RECORDS: readonly { date: string; weightKg: number }[] =
  XIAOCHEN_DAILY_ALL_DAYS
    .filter((d) => d.weight !== null)
    .map((d) => ({ date: d.date, weightKg: d.weight! }));

/* =========================================================
 * 独立事件标注（不能从日级事实直接推导）
 *
 * 以下事件为「产品场景事件」，不属于基础生活记录（情绪/睡眠/三餐/服药/活动/体重），
 * 但与当天日级记录不矛盾。来源为 timeline.ts 中的事件标注（见文件顶部 import）。
 *
 * 新代码应从 timeline.ts 获取这些事件，不要引用本处的兼容别名。
 * ======================================================= */

/** 未到校日期（独立事件标注，非基础生活记录） */
export const NO_SCHOOL_DATES: readonly string[] = TIMELINE_NO_SCHOOL_DATES;

/** 呼吸/接地练习日期（独立事件标注） */
export const BREATHING_EXERCISE_DATE: string = TIMELINE_BREATHING_EXERCISE_DATE;

/** 深夜消极念头记录日期（独立事件标注） */
export const NEGATIVE_THOUGHT_DATES: readonly string[] = TIMELINE_NEGATIVE_THOUGHT_DATES;

/* =========================================================
 * 统计数字（从 dailyRecords 派生）
 * ======================================================= */

/** 从日级事实实时派生的统计数字 */
function deriveStats() {
  const allDays = XIAOCHEN_DAILY_ALL_DAYS;
  const totalDays = allDays.length;
  const recordedDays = XIAOCHEN_RECORDED_DATE_KEYS.length;
  const unrecordedDays = XIAOCHEN_UNRECORDED_DATE_KEYS.length;
  const missedMedCount = MISSED_MED_DATES.length;
  const noSchoolCount = NO_SCHOOL_DATES.length;
  const weightRecordCount = WEIGHT_RECORDS.length;
  const negativeThoughtCount = NEGATIVE_THOUGHT_DATES.length;
  const breakfastRecordDays = allDays.filter((d) => d.meals.breakfast === "yes").length;
  const lunchRecordDays = allDays.filter((d) => d.meals.lunch === "yes").length;
  const dinnerRecordDays = allDays.filter((d) => d.meals.dinner === "yes").length;
  const activityDays = allDays.filter(
    (d) => d.activityLevel !== null && d.activityLevel > 0,
  ).length;
  const beforeMidnightSleepDays = BEFORE_MIDNIGHT_SLEEP_DATES.length;
  const moodRecordDays = allDays.filter(
    (d) => d.moodEntries !== null && d.moodEntries.length > 0,
  ).length;

  return {
    totalDays,
    recordedDays,
    unrecordedDays,
    missedMedCount,
    noSchoolCount,
    daytimeDrowsinessDays: 0, // dailyRecords 不含 drowsiness 字段，已废弃
    familyConflictCount: 0, // 已迁移到 timeline 事件标注，见 TIMELINE_FAMILY_CONFLICT_DATES
    weightRecordCount,
    negativeThoughtCount,
    breakfastRecordDays,
    lunchRecordDays,
    dinnerRecordDays,
    activityDays,
    beforeMidnightSleepDays,
    moodRecordDays,
    consecutiveOneMealDays: 0, // 旧统计项，dailyRecords 不提供此维度
  };
}

/** @deprecated 统计数字应从 dailyRecords 派生，不要引用此静态对象。
 *  新代码请调用 getXiaochenDerivedStats() 获取实时派生值。 */
export const STATS = deriveStats();

/** 从 dailyRecords 实时派生的统计数字（供 organize 等模块使用） */
export function getXiaochenDerivedStats() {
  return deriveStats();
}

/* =========================================================
 * 人物设定常量（业务配置，非日级事实）
 * ======================================================= */

/** 沟通医生 */
export const DOCTOR_NAME = "王医生";
export const DOCTOR_ROLE = "精神科医生";

/** 诊断信息 */
export const DIAGNOSIS = "中度抑郁、重度焦虑";

/** 当前用药（喹硫平 50mg，睡前服用） */
export const MEDICATION_NAME = "喹硫平";
export const MEDICATION_DOSE = "50mg";
export const MEDICATION_FREQUENCY = "每日一次";
export const MEDICATION_TIME = "睡前服用";

/** 体重记录点数量 */
export const WEIGHT_RECORD_COUNT = WEIGHT_RECORDS.length;
