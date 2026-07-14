/* —— 小晨体验模式统一数据源：时间线事件汇总 ——
 *
 * 集中维护 33 天记录周期内的关键事件，供：
 *   - validators.ts 校验事件计数与 constants.STATS 一致
 *   - organize.ts 派生沟通重点与高风险披露的依据
 *   - 各 Selector 在需要时回溯事件原文
 *
 * 所有日期必须与 constants.ts / records.ts 一致，不得在此处新增或删除事件。 */
import {
  PERIOD_START,
  PERIOD_END,
  REFERENCE_DATE,
  APPOINTMENT_DATE,
  MISSED_MED_DATES,
  NO_SCHOOL_DATES,
  BEFORE_MIDNIGHT_SLEEP_DATES,
  LATEST_SLEEP_DATE,
  LATEST_SLEEP_TIME,
  WEIGHT_RECORDS,
  BREATHING_EXERCISE_DATE,
  NEGATIVE_THOUGHT_DATES,
} from "./constants";

/* —— 白天困倦日期（18 天）——
 * 来自 records.ts 中 drowsiness: true 的记录日。 */
export const XIAOCHEN_DROWSINESS_DATES = [
  "2026-06-15",
  "2026-06-16",
  "2026-06-17",
  "2026-06-19",
  "2026-06-22",
  "2026-06-23",
  "2026-06-24",
  "2026-06-26",
  "2026-06-28",
  "2026-06-29",
  "2026-07-01",
  "2026-07-02",
  "2026-07-03",
  "2026-07-06",
  "2026-07-08",
  "2026-07-10",
  "2026-07-11",
  "2026-07-13",
] as const;

/* —— 家庭冲突日期（6 次）——
 * 来自 records.ts 中 familyConflict: true 的记录日。 */
export const XIAOCHEN_FAMILY_CONFLICT_DATES = [
  "2026-06-22",
  "2026-06-23",
  "2026-06-29",
  "2026-07-06",
  "2026-07-08",
  "2026-07-13",
] as const;

/* —— 时间线事件类型 —— */
export type TimelineEventType =
  | "record_start"
  | "record_end"
  | "reference_date"
  | "missed_med"
  | "no_school"
  | "before_midnight_sleep"
  | "latest_sleep"
  | "weight_record"
  | "breathing_exercise"
  | "negative_thought"
  | "family_conflict"
  | "drowsiness"
  | "appointment";

/* —— 单条时间线事件 —— */
export interface TimelineEvent {
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM（可选）
  type: TimelineEventType;
  title: string;
  description?: string;
}

/* —— 33 天记录周期关键时间线（升序）——
 * 仅列出有结构性意义的事件；普通记录日不在此列出。
 * 复诊日（2026-07-18）不属于记录周期，单独列出。 */
export const XIAOCHEN_TIMELINE: TimelineEvent[] = [
  { date: PERIOD_START, type: "record_start", title: "记录开始" },
  { date: "2026-06-16", type: "weight_record", title: "体重记录 49.5kg", description: "首次体重记录" },
  { date: "2026-06-19", type: "missed_med", title: "漏服舍曲林" },
  { date: "2026-06-22", type: "no_school", title: "未到校", description: "首次未到校" },
  { date: "2026-06-22", type: "family_conflict", title: "家庭冲突" },
  { date: "2026-06-23", type: "family_conflict", title: "家庭冲突" },
  { date: "2026-06-24", time: "01:32", type: "negative_thought", title: "深夜消极念头 #1", description: "情绪记录：好像怎么都撑不下去" },
  { date: "2026-06-28", type: "missed_med", title: "漏服舍曲林" },
  { date: "2026-06-29", type: "no_school", title: "未到校" },
  { date: "2026-06-29", type: "family_conflict", title: "家庭冲突" },
  { date: "2026-07-02", time: LATEST_SLEEP_TIME, type: "latest_sleep", title: `最晚入睡 ${LATEST_SLEEP_TIME}` },
  { date: "2026-07-03", type: "missed_med", title: "漏服舍曲林" },
  { date: "2026-07-04", time: "01:20", type: "breathing_exercise", title: "主动请求呼吸/接地练习", description: "完成后表达「还是睡不着，但好一点点」" },
  { date: "2026-07-06", time: "01:48", type: "negative_thought", title: "深夜消极念头 #2", description: "情绪记录：那种感觉又上来了" },
  { date: "2026-07-06", type: "family_conflict", title: "家庭冲突" },
  { date: "2026-07-08", type: "no_school", title: "未到校" },
  { date: "2026-07-08", type: "family_conflict", title: "家庭冲突" },
  { date: "2026-07-09", type: "before_midnight_sleep", title: "零点前入睡" },
  { date: "2026-07-10", type: "before_midnight_sleep", title: "零点前入睡" },
  { date: "2026-07-11", type: "missed_med", title: "漏服舍曲林" },
  { date: "2026-07-12", type: "weight_record", title: "体重记录 48.7kg", description: "当前体重，更新于参考日" },
  { date: "2026-07-13", type: "no_school", title: "未到校" },
  { date: "2026-07-13", type: "family_conflict", title: "家庭冲突" },
  { date: "2026-07-14", type: "before_midnight_sleep", title: "零点前入睡" },
  { date: REFERENCE_DATE, type: "reference_date", title: "数据查看参考日" },
  { date: PERIOD_END, type: "record_end", title: "记录结束" },
  { date: APPOINTMENT_DATE, type: "appointment", title: "复诊（不属于记录周期）", description: "与王医生复诊" },
];

/* —— 7 月 18 日复诊不属于 24 个记录日，仅作为时间线后续节点 —— */
export const APPOINTMENT_NOT_IN_PERIOD = APPOINTMENT_DATE;

/* —— 按日期查询时间线事件 —— */
export function getTimelineEventsByDate(date: string): TimelineEvent[] {
  return XIAOCHEN_TIMELINE.filter((e) => e.date === date);
}

/* —— 校验用：所有时间线事件的日期集合（用于回溯）—— */
export function getAllTimelineDates(): Set<string> {
  const set = new Set<string>();
  for (const e of XIAOCHEN_TIMELINE) set.add(e.date);
  return set;
}

/* —— 复用：MISSED_MED / NO_SCHOOL / 等只读视图，便于 Selector —— */
export const TIMELINE_MISSED_MED_DATES: readonly string[] = MISSED_MED_DATES;
export const TIMELINE_NO_SCHOOL_DATES: readonly string[] = NO_SCHOOL_DATES;
export const TIMELINE_BEFORE_MIDNIGHT_DATES: readonly string[] = BEFORE_MIDNIGHT_SLEEP_DATES;
export const TIMELINE_WEIGHT_RECORDS = WEIGHT_RECORDS;
export const TIMELINE_NEGATIVE_THOUGHT_DATES: readonly string[] = NEGATIVE_THOUGHT_DATES;
export const TIMELINE_BREATHING_EXERCISE_DATE = BREATHING_EXERCISE_DATE;
export const TIMELINE_LATEST_SLEEP_DATE = LATEST_SLEEP_DATE;
export const TIMELINE_LATEST_SLEEP_TIME = LATEST_SLEEP_TIME;
