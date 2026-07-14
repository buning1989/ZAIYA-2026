/* —— 小晨体验模式统一数据源：常量 ——
 *
 * 所有模块必须引用此处的常量，不得自行重新定义日期、统计数字或人物设定。
 * 修改此处的值会自动影响所有消费该常量的模块和 Selector。 */

/** 体验模式 Mock 数据版本号 */
export const EXPERIENCE_MOCK_DATA_VERSION = 2;

/** 数据周期开始日期（YYYY-MM-DD） */
export const PERIOD_START = "2026-06-15";

/** 数据周期结束日期（YYYY-MM-DD） */
export const PERIOD_END = "2026-07-17";

/** 数据查看参考日（YYYY-MM-DD） */
export const REFERENCE_DATE = "2026-07-17";

/** 复诊日期（YYYY-MM-DD，不属于记录周期） */
export const APPOINTMENT_DATE = "2026-07-18";

/** 总天数 */
export const TOTAL_DAYS = 33;

/** 有有效记录的天数 */
export const RECORDED_DAYS = 24;

/** 无有效记录的天数 */
export const UNRECORDED_DAYS = 9;

/** 24 个有有效记录的日期（YYYY-MM-DD） */
export const XIAOCHEN_RECORDED_DATE_KEYS = [
  "2026-06-15",
  "2026-06-16",
  "2026-06-17",
  "2026-06-19",
  "2026-06-21",
  "2026-06-22",
  "2026-06-23",
  "2026-06-24",
  "2026-06-26",
  "2026-06-28",
  "2026-06-29",
  "2026-07-01",
  "2026-07-02",
  "2026-07-03",
  "2026-07-04",
  "2026-07-06",
  "2026-07-08",
  "2026-07-09",
  "2026-07-10",
  "2026-07-11",
  "2026-07-12",
  "2026-07-13",
  "2026-07-14",
  "2026-07-17",
] as const;

/** 9 个无有效记录的日期（YYYY-MM-DD） */
export const XIAOCHEN_UNRECORDED_DATE_KEYS = [
  "2026-06-18",
  "2026-06-20",
  "2026-06-25",
  "2026-06-27",
  "2026-06-30",
  "2026-07-05",
  "2026-07-07",
  "2026-07-15",
  "2026-07-16",
] as const;

/** 漏服舍曲林日期 */
export const MISSED_MED_DATES = [
  "2026-06-19",
  "2026-06-28",
  "2026-07-03",
  "2026-07-11",
] as const;

/** 未到校日期 */
export const NO_SCHOOL_DATES = [
  "2026-06-22",
  "2026-06-29",
  "2026-07-08",
  "2026-07-13",
] as const;

/** 零点前入睡日期 */
export const BEFORE_MIDNIGHT_SLEEP_DATES = [
  "2026-07-09",
  "2026-07-10",
  "2026-07-14",
] as const;

/** 最晚入睡日期（03:10） */
export const LATEST_SLEEP_DATE = "2026-07-02";
export const LATEST_SLEEP_TIME = "03:10";

/** 体重记录 */
export const WEIGHT_RECORDS = [
  { date: "2026-06-16", weightKg: 49.5 },
  { date: "2026-07-12", weightKg: 48.7 },
] as const;

/** 呼吸/接地练习日期 */
export const BREATHING_EXERCISE_DATE = "2026-07-04";

/** 深夜消极念头记录日期 */
export const NEGATIVE_THOUGHT_DATES = [
  "2026-06-24",
  "2026-07-06",
] as const;

/** 统计数字 */
export const STATS = {
  totalDays: TOTAL_DAYS,
  recordedDays: RECORDED_DAYS,
  unrecordedDays: UNRECORDED_DAYS,
  missedMedCount: 4,
  noSchoolCount: 4,
  daytimeDrowsinessDays: 18,
  familyConflictCount: 6,
  weightRecordCount: 2,
  negativeThoughtCount: 2,
  breakfastRecordDays: 3,
  consecutiveOneMealDays: 4, // 6 月下旬连续 4 天仅一餐
} as const;

/** 沟通医生 */
export const DOCTOR_NAME = "王医生";
export const DOCTOR_ROLE = "精神科医生";

/** 诊断信息 */
export const DIAGNOSIS = "中度抑郁、重度焦虑";

/** 当前用药 */
export const MEDICATION_NAME = "舍曲林";
export const MEDICATION_DOSE = "50mg";
export const MEDICATION_FREQUENCY = "每日一次";
export const MEDICATION_TIME = "早晨服用";

/** 体重记录点数量 */
export const WEIGHT_RECORD_COUNT = WEIGHT_RECORDS.length;
