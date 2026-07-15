/* —— 小晨体验模式：时间线事件标注 ——
 *
 * 本文件维护两类数据：
 *
 * 1. 独立事件标注（不能从日级事实直接推导）
 *    - 家庭冲突
 *    - 未到校
 *    - 呼吸/接地练习
 *    - 深夜消极念头
 *    这些是产品场景事件，与当天日级记录不矛盾，但不是基础生活记录。
 *
 * 2. 从 dailyRecords 派生的事件（兼容旧接口）
 *    - 漏服日期
 *    - 零点前入睡日期
 *    - 体重记录日期
 *    - 最晚入睡日期/时间
 *
 * 依赖方向：timeline → dailyRecords + timeConfig（单向，不依赖 constants）。
 * constants.ts 反向引用本文件获取独立事件标注。 */
import {
  XIAOCHEN_CURRENT_DATE,
  XIAOCHEN_FOLLOWUP_DATE,
  XIAOCHEN_START_DATE,
} from "./timeConfig";
import { XIAOCHEN_DAILY_ALL_DAYS } from "./dailyRecords";

/* =========================================================
 * 独立事件标注（原始定义，不来自日级事实）
 * ======================================================= */

/* —— 家庭冲突日期（6 次）——
 * 产品场景事件：与父母发生争执，通常与上学话题相关。
 * 当天日级记录中可能有对应的 moodTrigger="和家庭争吵"，
 * 但"家庭冲突"本身是场景事件，不是基础生活记录。 */
export const XIAOCHEN_FAMILY_CONFLICT_DATES = [
  "2026-06-22",
  "2026-06-23",
  "2026-06-29",
  "2026-07-06",
  "2026-07-08",
  "2026-07-13",
] as const;

/* —— 未到校日期（4 天）——
 * 产品场景事件：早上因情绪/身体原因未能到校。
 * 与当天日级记录中的低 mood 或低 activityLevel 呼应。 */
export const TIMELINE_NO_SCHOOL_DATES: readonly string[] = [
  "2026-06-22",
  "2026-06-29",
  "2026-07-08",
  "2026-07-13",
];

/* —— 呼吸/接地练习日期 ——
 * 产品场景事件：凌晨主动请求呼吸练习。
 * 与对话线程 CONVERSATION_THREAD_0704 印证。 */
export const TIMELINE_BREATHING_EXERCISE_DATE = "2026-07-04";

/* —— 深夜消极念头记录日期（2 次）——
 * 产品场景事件：深夜写下消极念头，触发安全承接。
 * 与 organize 高风险披露的 2 条 originalRecords 一致。 */
export const TIMELINE_NEGATIVE_THOUGHT_DATES: readonly string[] = [
  "2026-06-24",
  "2026-07-06",
];

/* —— 白天困倦日期（独立事件标注）——
 * 产品场景事件：用户在白天（主要上午第二、三节课）记录到困倦。
 * dailyRecords 不含 drowsiness 字段，因此不能从日级事实派生，
 * 作为独立事件标注维护，与 organize 模块 topic-1 的 evidence 对齐。
 * 所有日期 ≤ 2026-07-15 且存在于 dailyRecords.ts。 */
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

/* =========================================================
 * 从 dailyRecords 派生的兼容导出
 * ======================================================= */

/** 漏服日期（从 dailyRecords 派生：medication.evening === "missed"） */
export const TIMELINE_MISSED_MED_DATES: readonly string[] = XIAOCHEN_DAILY_ALL_DAYS
  .filter((d) => d.medication.evening === "missed")
  .map((d) => d.date);

/** 零点前入睡日期（从 dailyRecords 派生：sleepTime 在 20:00—23:59） */
export const TIMELINE_BEFORE_MIDNIGHT_DATES: readonly string[] = XIAOCHEN_DAILY_ALL_DAYS
  .filter((d) => {
    if (!d.sleepTime) return false;
    const [h] = d.sleepTime.split(":").map(Number);
    return h >= 20 && h <= 23;
  })
  .map((d) => d.date);

/** 体重记录（从 dailyRecords 派生） */
export const TIMELINE_WEIGHT_RECORDS: readonly { date: string; weightKg: number }[] =
  XIAOCHEN_DAILY_ALL_DAYS
    .filter((d) => d.weight !== null)
    .map((d) => ({ date: d.date, weightKg: d.weight! }));

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

export const TIMELINE_LATEST_SLEEP_DATE: string = _latestSleep?.date ?? XIAOCHEN_CURRENT_DATE;
export const TIMELINE_LATEST_SLEEP_TIME: string = _latestSleep?.time ?? "00:00";

/* =========================================================
 * 时间线事件类型与列表
 * ======================================================= */

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

export interface TimelineEvent {
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM（可选）
  type: TimelineEventType;
  title: string;
  description?: string;
}

/* —— 关键时间线事件（升序）——
 * 仅列出有结构性意义的事件；普通记录日不在此列出。
 * 复诊日（XIAOCHEN_FOLLOWUP_DATE）不属于记录周期，单独列出。 */
function buildTimeline(): TimelineEvent[] {
  const events: TimelineEvent[] = [
    { date: XIAOCHEN_START_DATE, type: "record_start", title: "记录开始" },
  ];

  // 体重记录
  for (const wr of TIMELINE_WEIGHT_RECORDS) {
    events.push({
      date: wr.date,
      type: "weight_record",
      title: `体重记录 ${wr.weightKg}kg`,
    });
  }

  // 漏服
  for (const d of TIMELINE_MISSED_MED_DATES) {
    events.push({ date: d, type: "missed_med", title: "漏服喹硫平" });
  }

  // 未到校
  for (const d of TIMELINE_NO_SCHOOL_DATES) {
    events.push({ date: d, type: "no_school", title: "未到校" });
  }

  // 家庭冲突
  for (const d of XIAOCHEN_FAMILY_CONFLICT_DATES) {
    events.push({ date: d, type: "family_conflict", title: "家庭冲突" });
  }

  // 消极念头
  const negativeThoughtMap: Record<string, { time: string; desc: string }> = {
    "2026-06-24": { time: "01:32", desc: "情绪记录：好像怎么都撑不下去" },
    "2026-07-06": { time: "01:48", desc: "情绪记录：那种感觉又上来了" },
  };
  for (const d of TIMELINE_NEGATIVE_THOUGHT_DATES) {
    const info = negativeThoughtMap[d];
    events.push({
      date: d,
      time: info?.time,
      type: "negative_thought",
      title: "深夜消极念头",
      description: info?.desc,
    });
  }

  // 最晚入睡
  if (_latestSleep) {
    events.push({
      date: _latestSleep.date,
      time: _latestSleep.time,
      type: "latest_sleep",
      title: `最晚入睡 ${_latestSleep.time}`,
    });
  }

  // 呼吸练习
  events.push({
    date: TIMELINE_BREATHING_EXERCISE_DATE,
    time: "01:20",
    type: "breathing_exercise",
    title: "主动请求呼吸/接地练习",
    description: "完成后表达「还是睡不着，但好一点点」",
  });

  // 零点前入睡
  for (const d of TIMELINE_BEFORE_MIDNIGHT_DATES) {
    events.push({ date: d, type: "before_midnight_sleep", title: "零点前入睡" });
  }

  // 参考日
  events.push({
    date: XIAOCHEN_CURRENT_DATE,
    type: "reference_date",
    title: "数据查看参考日",
  });

  // 记录结束
  events.push({
    date: XIAOCHEN_CURRENT_DATE,
    type: "record_end",
    title: "记录结束",
  });

  // 复诊
  events.push({
    date: XIAOCHEN_FOLLOWUP_DATE,
    type: "appointment",
    title: "复诊（不属于记录周期）",
    description: "与王医生复诊",
  });

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export const XIAOCHEN_TIMELINE: TimelineEvent[] = buildTimeline();

/* —— 7 月 18 日复诊不属于记录日，仅作为时间线后续节点 —— */
export const APPOINTMENT_NOT_IN_PERIOD = XIAOCHEN_FOLLOWUP_DATE;

/* —— 按日期查询时间线事件 —— */
export function getTimelineEventsByDate(date: string): TimelineEvent[] {
  return XIAOCHEN_TIMELINE.filter((e) => e.date === date);
}

/* —— 校验用：所有时间线事件的日期集合 —— */
export function getAllTimelineDates(): Set<string> {
  const set = new Set<string>();
  for (const e of XIAOCHEN_TIMELINE) set.add(e.date);
  return set;
}
