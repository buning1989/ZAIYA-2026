/* —— 小晨体验模式统一数据源：跨模块数据校验 ——
 *
 * 基于 dailyRecords + timeConfig + timeline + conversations + praiseCards + organize
 * 进行跨模块一致性校验。
 *
 * 校验维度：
 *   1. 日期边界：所有已发生事件日期 ≤ XIAOCHEN_CURRENT_DATE（2026-07-15）
 *   2. 关键节点：6/26、7/9、7/11、7/13、7/14、7/15 的状态符合设定
 *   3. 跨模块一致性：对话、夸夸卡、整理证据日期可追溯到底层数据
 *   4. 药物设定：喹硫平 50mg、睡前服用；medication.evening 为实际服药状态
 *
 * 不再校验「不存在晚间舍曲林记录」（旧约束已废弃，喹硫平本身就是睡前服用）。
 * 不再校验旧 33 天/24 天记录/9 天无记录的硬编码统计。
 *
 * 开发环境检测到不一致时输出可定位的 console.error，不静默使用另一套数字。
 * 生产环境校验失败不抛异常，避免阻塞渲染。 */
import {
  XIAOCHEN_DAILY_ALL_DAYS,
  XIAOCHEN_DAILY_RECORDS,
} from "./dailyRecords";
import {
  XIAOCHEN_CURRENT_DATE,
  XIAOCHEN_START_DATE,
  XIAOCHEN_FOLLOWUP_DATE,
} from "./timeConfig";
import {
  TIMELINE_NO_SCHOOL_DATES,
  TIMELINE_BREATHING_EXERCISE_DATE,
  TIMELINE_BEFORE_MIDNIGHT_DATES,
  TIMELINE_LATEST_SLEEP_DATE,
  TIMELINE_WEIGHT_RECORDS,
  TIMELINE_MISSED_MED_DATES,
  TIMELINE_NEGATIVE_THOUGHT_DATES,
  XIAOCHEN_FAMILY_CONFLICT_DATES,
  XIAOCHEN_DROWSINESS_DATES,
} from "./timeline";
import {
  XIAOCHEN_PRAISE_CARDS,
  XIAOCHEN_PRAISE_CARD_SOURCE_DATES,
} from "./praiseCards";
import {
  XIAOCHEN_ORGANIZE_DISCLOSURE,
  XIAOCHEN_ORGANIZE_TOPICS,
  XIAOCHEN_ORGANIZE_RANGE,
  XIAOCHEN_ORGANIZE_SESSION_CREATED_AT,
} from "./organize";
import { EXPERIENCE_CONVERSATION } from "./conversations";
import { XIAOCHEN_MED_SCHEDULES } from "./contacts";
import {
  MEDICATION_NAME,
  MEDICATION_DOSE,
  MEDICATION_FREQUENCY,
  MEDICATION_TIME,
} from "./constants";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

/* —— 工具：从 ISO 字符串提取 YYYY-MM-DD —— */
function extractDate(iso: string): string {
  return iso.slice(0, 10);
}

/** 校验小晨体验模式统一数据源的跨模块一致性。
 *
 * 校验项：
 *  A. 日期边界（所有已发生事件 ≤ 2026-07-15）
 *  B. 关键节点状态符合设定
 *  C. 跨模块一致性（对话/夸夸卡/整理证据日期可追溯）
 *  D. 药物设定（喹硫平 50mg，睡前服用）
 *  E. 复诊日约束（7/18 只作为未来事件） */
export function validateXiaochenExperienceData(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  /* —— 预构建：日级事实集合（用于跨模块校验）—— */
  const dailyDatesSet = new Set<string>(XIAOCHEN_DAILY_ALL_DAYS.map((d) => d.date));
  const timelineEventDatesSet = new Set<string>([
    ...TIMELINE_NO_SCHOOL_DATES,
    TIMELINE_BREATHING_EXERCISE_DATE,
    ...TIMELINE_BEFORE_MIDNIGHT_DATES,
    TIMELINE_LATEST_SLEEP_DATE,
    ...TIMELINE_WEIGHT_RECORDS.map((w) => w.date),
    ...TIMELINE_MISSED_MED_DATES,
    ...TIMELINE_NEGATIVE_THOUGHT_DATES,
    ...XIAOCHEN_FAMILY_CONFLICT_DATES,
    ...XIAOCHEN_DROWSINESS_DATES,
  ]);
  /** 日期可追溯集合 = 日级事实 ∪ 时间线事件 ∪ 当前日（夸夸卡允许引用当前演示日） */
  const traceableDates = new Set<string>([
    ...dailyDatesSet,
    ...timelineEventDatesSet,
    XIAOCHEN_CURRENT_DATE,
  ]);

  /* =========================================================
   * A. 日期边界
   * ======================================================= */

  /* —— A1. dailyRecords 覆盖范围与日期边界 —— */
  if (XIAOCHEN_DAILY_ALL_DAYS.length === 0) {
    errors.push("[validators] XIAOCHEN_DAILY_ALL_DAYS 为空");
  } else {
    const firstDate = XIAOCHEN_DAILY_ALL_DAYS[0].date;
    const lastDate = XIAOCHEN_DAILY_ALL_DAYS[XIAOCHEN_DAILY_ALL_DAYS.length - 1].date;
    if (firstDate !== XIAOCHEN_START_DATE) {
      errors.push(
        `[validators] dailyRecords 起始日应为 ${XIAOCHEN_START_DATE}，实际为 ${firstDate}`,
      );
    }
    if (lastDate !== XIAOCHEN_CURRENT_DATE) {
      errors.push(
        `[validators] dailyRecords 结束日应为 ${XIAOCHEN_CURRENT_DATE}，实际为 ${lastDate}`,
      );
    }
    for (const day of XIAOCHEN_DAILY_ALL_DAYS) {
      if (day.date > XIAOCHEN_CURRENT_DATE) {
        errors.push(
          `[validators] dailyRecords 中 ${day.date} 晚于 XIAOCHEN_CURRENT_DATE=${XIAOCHEN_CURRENT_DATE}`,
        );
      }
      if (day.date === XIAOCHEN_FOLLOWUP_DATE) {
        errors.push(
          `[validators] dailyRecords 中 ${day.date} 等于复诊日 ${XIAOCHEN_FOLLOWUP_DATE}，复诊日不应进入记录周期`,
        );
      }
    }
  }

  /* —— A2. 对话线程日期 ≤ XIAOCHEN_CURRENT_DATE —— */
  for (const thread of EXPERIENCE_CONVERSATION.threads) {
    for (const item of thread) {
      const dateStr = extractDate(new Date(item.createdAt).toISOString());
      if (dateStr > XIAOCHEN_CURRENT_DATE) {
        errors.push(
          `[validators] 对话项 ${item.id} 日期 ${dateStr} 晚于 XIAOCHEN_CURRENT_DATE=${XIAOCHEN_CURRENT_DATE}`,
        );
      }
      if (dateStr === XIAOCHEN_FOLLOWUP_DATE) {
        errors.push(
          `[validators] 对话项 ${item.id} 日期等于复诊日 ${XIAOCHEN_FOLLOWUP_DATE}，复诊日不应作为已发生对话`,
        );
      }
    }
  }

  /* —— A3. 夸夸卡日期 ≤ XIAOCHEN_CURRENT_DATE —— */
  for (const [idx, card] of XIAOCHEN_PRAISE_CARDS.entries()) {
    const createdDate = extractDate(card.createdAt);
    if (createdDate > XIAOCHEN_CURRENT_DATE) {
      errors.push(
        `[validators] 夸夸卡 ${card.id} createdAt ${createdDate} 晚于 XIAOCHEN_CURRENT_DATE=${XIAOCHEN_CURRENT_DATE}`,
      );
    }
    const sourceDate = XIAOCHEN_PRAISE_CARD_SOURCE_DATES[idx];
    if (sourceDate > XIAOCHEN_CURRENT_DATE) {
      errors.push(
        `[validators] 夸夸卡 ${card.id} sourceDate ${sourceDate} 晚于 XIAOCHEN_CURRENT_DATE=${XIAOCHEN_CURRENT_DATE}`,
      );
    }
  }

  /* —— A4. 整理结果创建时间 ≤ XIAOCHEN_CURRENT_DATE —— */
  const organizeSessionDate = extractDate(
    new Date(XIAOCHEN_ORGANIZE_SESSION_CREATED_AT).toISOString(),
  );
  if (organizeSessionDate > XIAOCHEN_CURRENT_DATE) {
    errors.push(
      `[validators] 整理会话创建时间 ${organizeSessionDate} 晚于 XIAOCHEN_CURRENT_DATE=${XIAOCHEN_CURRENT_DATE}`,
    );
  }

  /* —— A5. 整理沟通重点 evidenceDates ≤ XIAOCHEN_CURRENT_DATE —— */
  for (const topic of XIAOCHEN_ORGANIZE_TOPICS) {
    if (!topic.evidenceDates || topic.evidenceDates.length === 0) {
      warnings.push(
        `[validators] 沟通重点 ${topic.id} 未提供 evidenceDates，建议补充以支持跨模块校验`,
      );
      continue;
    }
    for (const d of topic.evidenceDates) {
      if (d > XIAOCHEN_CURRENT_DATE) {
        errors.push(
          `[validators] 沟通重点 ${topic.id} evidenceDates 包含晚于 ${XIAOCHEN_CURRENT_DATE} 的日期 ${d}`,
        );
      }
    }
  }

  /* —— A6. 高风险披露 recordedAt ≤ XIAOCHEN_CURRENT_DATE —— */
  for (const rec of XIAOCHEN_ORGANIZE_DISCLOSURE.originalRecords) {
    const recDate = extractDate(rec.recordedAt);
    if (recDate > XIAOCHEN_CURRENT_DATE) {
      errors.push(
        `[validators] 高风险披露 ${rec.id} recordedAt ${recDate} 晚于 XIAOCHEN_CURRENT_DATE=${XIAOCHEN_CURRENT_DATE}`,
      );
    }
  }

  /* —— A7. timeline 事件日期 ≤ XIAOCHEN_CURRENT_DATE（除复诊日）—— */
  const allTimelineEventDates: string[] = [
    ...TIMELINE_NO_SCHOOL_DATES,
    TIMELINE_BREATHING_EXERCISE_DATE,
    ...TIMELINE_BEFORE_MIDNIGHT_DATES,
    TIMELINE_LATEST_SLEEP_DATE,
    ...TIMELINE_WEIGHT_RECORDS.map((w) => w.date),
    ...TIMELINE_MISSED_MED_DATES,
    ...TIMELINE_NEGATIVE_THOUGHT_DATES,
    ...XIAOCHEN_FAMILY_CONFLICT_DATES,
    ...XIAOCHEN_DROWSINESS_DATES,
  ];
  for (const d of allTimelineEventDates) {
    if (d > XIAOCHEN_CURRENT_DATE) {
      errors.push(
        `[validators] 时间线事件日期 ${d} 晚于 XIAOCHEN_CURRENT_DATE=${XIAOCHEN_CURRENT_DATE}`,
      );
    }
    if (d === XIAOCHEN_FOLLOWUP_DATE) {
      errors.push(
        `[validators] 时间线事件日期 ${d} 等于复诊日 ${XIAOCHEN_FOLLOWUP_DATE}，复诊日不应作为已发生事件`,
      );
    }
  }

  /* —— A8. 7 月 17 日不得继续被列为已记录日 —— */
  const recordedDateKeys = XIAOCHEN_DAILY_ALL_DAYS.filter(hasAnyRecord).map((d) => d.date);
  if (recordedDateKeys.includes("2026-07-17")) {
    errors.push(
      `[validators] 7 月 17 日不应出现在已记录日列表中（已迁移至 7-15 当前日）`,
    );
  }

  /* —— A9. 7 月 18 日只能以未来复诊日出现 —— */
  if (XIAOCHEN_FOLLOWUP_DATE !== "2026-07-18") {
    errors.push(
      `[validators] 复诊日应为 2026-07-18，实际为 ${XIAOCHEN_FOLLOWUP_DATE}`,
    );
  }
  // 7-18 不应在 dailyRecords、对话、夸夸卡、整理 evidence 中出现
  if (dailyDatesSet.has(XIAOCHEN_FOLLOWUP_DATE)) {
    errors.push(
      `[validators] 复诊日 ${XIAOCHEN_FOLLOWUP_DATE} 不应出现在 dailyRecords 中`,
    );
  }

  /* =========================================================
   * B. 关键节点
   * ======================================================= */

  /* —— B1. 6 月 26 日为明显低谷（mood ≤ 2，sleepTime ≥ 02:00）—— */
  {
    const day = XIAOCHEN_DAILY_RECORDS["2026-06-26"];
    if (!day) {
      errors.push("[validators] 6 月 26 日应在 dailyRecords 中存在");
    } else {
      const mood = day.moodEntries?.[0]?.mood ?? 0;
      if (mood > 2) {
        errors.push(
          `[validators] 6 月 26 日应为低谷日（mood ≤ 2），实际 mood=${mood}`,
        );
      }
      if (!day.sleepTime || day.sleepTime < "02:00") {
        errors.push(
          `[validators] 6 月 26 日 sleepTime 应 ≥ 02:00（低谷日入睡晚），实际 ${day.sleepTime ?? "null"}`,
        );
      }
    }
  }

  /* —— B2. 7 月 9 日为低谷且漏服 —— */
  {
    const day = XIAOCHEN_DAILY_RECORDS["2026-07-09"];
    if (!day) {
      errors.push("[validators] 7 月 9 日应在 dailyRecords 中存在");
    } else {
      const mood = day.moodEntries?.[0]?.mood ?? 0;
      if (mood > 2) {
        errors.push(
          `[validators] 7 月 9 日应为低谷日（mood ≤ 2），实际 mood=${mood}`,
        );
      }
      if (day.medication.evening !== "missed") {
        errors.push(
          `[validators] 7 月 9 日 medication.evening 应为 "missed"（漏服），实际 ${day.medication.evening}`,
        );
      }
    }
  }

  /* —— B3. 7 月 11 日为相对较好状态（mood ≥ 3）—— */
  {
    const day = XIAOCHEN_DAILY_RECORDS["2026-07-11"];
    if (!day) {
      errors.push("[validators] 7 月 11 日应在 dailyRecords 中存在");
    } else {
      const mood = day.moodEntries?.[0]?.mood ?? 0;
      if (mood < 3) {
        errors.push(
          `[validators] 7 月 11 日应为相对较好状态（mood ≥ 3），实际 mood=${mood}`,
        );
      }
    }
  }

  /* —— B4. 7 月 13 日存在早晚两次情绪记录 —— */
  {
    const day = XIAOCHEN_DAILY_RECORDS["2026-07-13"];
    if (!day) {
      errors.push("[validators] 7 月 13 日应在 dailyRecords 中存在");
    } else {
      const entries = day.moodEntries ?? [];
      if (entries.length !== 2) {
        errors.push(
          `[validators] 7 月 13 日应有 2 条 moodEntries（早晚两次），实际 ${entries.length} 条`,
        );
      } else {
        const morningTime = entries[0].time;
        const eveningTime = entries[1].time;
        if (morningTime >= "12:00" || eveningTime < "12:00") {
          errors.push(
            `[validators] 7 月 13 日 moodEntries 应为早/晚各一条，实际 time=[${morningTime}, ${eveningTime}]`,
          );
        }
      }
    }
  }

  /* —— B5. 7 月 14 日情绪未记录但其他维度有记录 —— */
  {
    const day = XIAOCHEN_DAILY_RECORDS["2026-07-14"];
    if (!day) {
      errors.push("[validators] 7 月 14 日应在 dailyRecords 中存在");
    } else {
      if (day.moodEntries !== null) {
        errors.push(
          `[validators] 7 月 14 日 moodEntries 应为 null（情绪未记录），实际非 null`,
        );
      }
      const hasOther =
        day.sleepTime !== null ||
        day.mealEntries !== null ||
        day.medEntries !== null ||
        day.activityLevel !== null ||
        day.weight !== null;
      if (!hasOther) {
        errors.push(
          `[validators] 7 月 14 日情绪未记录时，其他维度应至少有一项记录`,
        );
      }
      if (!recordedDateKeys.includes("2026-07-14")) {
        errors.push(
          `[validators] 7 月 14 日不应被识别为「完全未记录」（其他维度有记录）`,
        );
      }
    }
  }

  /* —— B6. 7 月 15 日存在当前日记录 —— */
  {
    const day = XIAOCHEN_DAILY_RECORDS["2026-07-15"];
    if (!day) {
      errors.push("[validators] 7 月 15 日应在 dailyRecords 中存在");
    } else {
      if (day.date !== XIAOCHEN_CURRENT_DATE) {
        errors.push(
          `[validators] 7 月 15 日应等于 XIAOCHEN_CURRENT_DATE=${XIAOCHEN_CURRENT_DATE}`,
        );
      }
      if (!recordedDateKeys.includes("2026-07-15")) {
        errors.push(
          `[validators] 7 月 15 日应被识别为有记录的当前日期`,
        );
      }
    }
  }

  /* =========================================================
   * C. 跨模块一致性
   * ======================================================= */

  /* —— C1. 对话线程日期必须存在于日级记录 —— */
  for (const thread of EXPERIENCE_CONVERSATION.threads) {
    for (const item of thread) {
      const dateStr = extractDate(new Date(item.createdAt).toISOString());
      if (!traceableDates.has(dateStr)) {
        errors.push(
          `[validators] 对话项 ${item.id} 日期 ${dateStr} 无法追溯到 dailyRecords 或 timeline 事件`,
        );
      }
    }
  }

  /* —— C2. 夸夸卡 sourceDate 必须存在于日级记录 —— */
  for (const [idx, card] of XIAOCHEN_PRAISE_CARDS.entries()) {
    const sourceDate = XIAOCHEN_PRAISE_CARD_SOURCE_DATES[idx];
    if (!traceableDates.has(sourceDate)) {
      errors.push(
        `[validators] 夸夸卡 ${card.id} sourceDate ${sourceDate} 无法追溯到 dailyRecords 或 timeline 事件`,
      );
    }
  }

  /* —— C3. 整理沟通重点 evidenceDates 必须存在于日级记录或事件标注 —— */
  for (const topic of XIAOCHEN_ORGANIZE_TOPICS) {
    if (!topic.evidenceDates) continue;
    for (const d of topic.evidenceDates) {
      if (!traceableDates.has(d)) {
        errors.push(
          `[validators] 沟通重点 ${topic.id} evidenceDates 包含 ${d}，无法追溯到 dailyRecords 或 timeline 事件`,
        );
      }
    }
  }

  /* —— C4. 高风险披露 recordedAt 日期必须对应 TIMELINE_NEGATIVE_THOUGHT_DATES —— */
  for (const rec of XIAOCHEN_ORGANIZE_DISCLOSURE.originalRecords) {
    const recDate = extractDate(rec.recordedAt);
    if (!TIMELINE_NEGATIVE_THOUGHT_DATES.includes(recDate)) {
      errors.push(
        `[validators] 高风险披露 ${rec.id} 日期 ${recDate} 不在 TIMELINE_NEGATIVE_THOUGHT_DATES 中`,
      );
    }
  }

  /* —— C5. 高风险披露 count 与 originalRecords 长度一致 —— */
  if (XIAOCHEN_ORGANIZE_DISCLOSURE.count !== XIAOCHEN_ORGANIZE_DISCLOSURE.originalRecords.length) {
    errors.push(
      `[validators] XIAOCHEN_ORGANIZE_DISCLOSURE.count=${XIAOCHEN_ORGANIZE_DISCLOSURE.count} 与 originalRecords 长度 ${XIAOCHEN_ORGANIZE_DISCLOSURE.originalRecords.length} 不一致`,
    );
  }
  if (XIAOCHEN_ORGANIZE_DISCLOSURE.originalRecords.length !== TIMELINE_NEGATIVE_THOUGHT_DATES.length) {
    errors.push(
      `[validators] 高风险披露 originalRecords 长度 ${XIAOCHEN_ORGANIZE_DISCLOSURE.originalRecords.length} 与 TIMELINE_NEGATIVE_THOUGHT_DATES 长度 ${TIMELINE_NEGATIVE_THOUGHT_DATES.length} 不一致`,
    );
  }

  /* —— C6. 整理范围与日级事实一致 —— */
  if (XIAOCHEN_ORGANIZE_RANGE.startDate !== XIAOCHEN_START_DATE) {
    errors.push(
      `[validators] XIAOCHEN_ORGANIZE_RANGE.startDate 应为 ${XIAOCHEN_START_DATE}，实际为 ${XIAOCHEN_ORGANIZE_RANGE.startDate}`,
    );
  }
  if (XIAOCHEN_ORGANIZE_RANGE.endDate !== XIAOCHEN_CURRENT_DATE) {
    errors.push(
      `[validators] XIAOCHEN_ORGANIZE_RANGE.endDate 应为 ${XIAOCHEN_CURRENT_DATE}，实际为 ${XIAOCHEN_ORGANIZE_RANGE.endDate}`,
    );
  }
  if (XIAOCHEN_ORGANIZE_RANGE.totalDays !== XIAOCHEN_DAILY_ALL_DAYS.length) {
    errors.push(
      `[validators] XIAOCHEN_ORGANIZE_RANGE.totalDays=${XIAOCHEN_ORGANIZE_RANGE.totalDays} 与 dailyRecords 长度 ${XIAOCHEN_DAILY_ALL_DAYS.length} 不一致`,
    );
  }

  /* =========================================================
   * D. 药物设定
   * ======================================================= */

  /* —— D1. constants 中的药物设定：喹硫平 50mg，每日一次，睡前服用 —— */
  if (MEDICATION_NAME !== "喹硫平") {
    errors.push(
      `[validators] MEDICATION_NAME 应为「喹硫平」，实际为「${MEDICATION_NAME}」`,
    );
  }
  if (MEDICATION_DOSE !== "50mg") {
    errors.push(
      `[validators] MEDICATION_DOSE 应为「50mg」，实际为「${MEDICATION_DOSE}」`,
    );
  }
  if (MEDICATION_FREQUENCY !== "每日一次") {
    errors.push(
      `[validators] MEDICATION_FREQUENCY 应为「每日一次」，实际为「${MEDICATION_FREQUENCY}」`,
    );
  }
  if (MEDICATION_TIME !== "睡前服用") {
    errors.push(
      `[validators] MEDICATION_TIME 应为「睡前服用」，实际为「${MEDICATION_TIME}」`,
    );
  }

  /* —— D2. 服用安排 contacts.ts 中的药物与 constants 一致 —— */
  if (XIAOCHEN_MED_SCHEDULES.length === 0) {
    errors.push("[validators] XIAOCHEN_MED_SCHEDULES 不应为空");
  } else {
    const med = XIAOCHEN_MED_SCHEDULES[0];
    if (med.name !== MEDICATION_NAME) {
      errors.push(
        `[validators] XIAOCHEN_MED_SCHEDULES[0].name 应为 ${MEDICATION_NAME}，实际为 ${med.name}`,
      );
    }
    if (med.dose !== MEDICATION_DOSE) {
      errors.push(
        `[validators] XIAOCHEN_MED_SCHEDULES[0].dose 应为 ${MEDICATION_DOSE}，实际为 ${med.dose}`,
      );
    }
  }

  /* —— D3. dailyRecords 中 medication.morning 应永远为 "unknown"
   *        （小晨不早晨服药；evening 才是实际服药状态字段，对应喹硫平睡前服用）—— */
  let morningTakenOrMissedCount = 0;
  for (const day of XIAOCHEN_DAILY_ALL_DAYS) {
    if (day.medication.morning === "taken" || day.medication.morning === "missed") {
      morningTakenOrMissedCount++;
    }
  }
  if (morningTakenOrMissedCount > 0) {
    errors.push(
      `[validators] dailyRecords 中 medication.morning 不应有 taken/missed 状态（共 ${morningTakenOrMissedCount} 条），喹硫平为睡前服用，morning 应永远为 "unknown"`,
    );
  }

  /* =========================================================
   * E. 复诊日约束（7/18 只作为未来事件）
   * ======================================================= */

  /* —— E1. 复诊日不应在 dailyRecords 中 —— */
  if (dailyDatesSet.has(XIAOCHEN_FOLLOWUP_DATE)) {
    errors.push(
      `[validators] 复诊日 ${XIAOCHEN_FOLLOWUP_DATE} 不应出现在 dailyRecords 中`,
    );
  }

  /* —— E2. 复诊日不应在 timeline 已发生事件中（独立标注除外）—— */
  // timeline.ts 的 buildTimeline() 会单独 push 复诊事件，类型为 "appointment"
  // 这里仅校验独立事件标注列表中不包含复诊日
  const independentEventDateLists: string[][] = [
    [...TIMELINE_NO_SCHOOL_DATES],
    [TIMELINE_BREATHING_EXERCISE_DATE],
    [...TIMELINE_BEFORE_MIDNIGHT_DATES],
    [...TIMELINE_WEIGHT_RECORDS.map((w) => w.date)],
    [...TIMELINE_MISSED_MED_DATES],
    [...TIMELINE_NEGATIVE_THOUGHT_DATES],
    [...XIAOCHEN_FAMILY_CONFLICT_DATES],
    [...XIAOCHEN_DROWSINESS_DATES],
  ];
  for (const list of independentEventDateLists) {
    if (list.includes(XIAOCHEN_FOLLOWUP_DATE)) {
      errors.push(
        `[validators] 独立事件标注列表中不应包含复诊日 ${XIAOCHEN_FOLLOWUP_DATE}`,
      );
    }
  }

  /* —— E3. 整理会话创建时间应在复诊前（≤ XIAOCHEN_CURRENT_DATE）—— */
  if (XIAOCHEN_ORGANIZE_SESSION_CREATED_AT >= new Date(`${XIAOCHEN_FOLLOWUP_DATE}T00:00:00+08:00`).getTime()) {
    errors.push(
      `[validators] 整理会话创建时间应在复诊日 ${XIAOCHEN_FOLLOWUP_DATE} 之前`,
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

/* —— 判定某日是否有任意生活记录 —— */
function hasAnyRecord(day: { moodEntries: unknown; sleepTime: unknown; mealEntries: unknown; medEntries: unknown; activityLevel: unknown; weight: unknown }): boolean {
  return (
    day.moodEntries !== null ||
    day.sleepTime !== null ||
    day.mealEntries !== null ||
    day.medEntries !== null ||
    day.activityLevel !== null ||
    day.weight !== null
  );
}

/* —— 开发环境自动校验（模块加载时执行一次）——
 * 仅在开发环境输出，不抛异常。 */
let _validated = false;
let _lastResult: ValidationResult | null = null;

export function runDevValidation(): ValidationResult {
  if (_validated) return _lastResult ?? { ok: true, errors: [], warnings: [] };
  _validated = true;
  _lastResult = validateXiaochenExperienceData();
  if (typeof console !== "undefined") {
    if (_lastResult.errors.length > 0) {
      console.error(
        "[XiaochenExperience] 数据校验失败：\n" +
          _lastResult.errors.join("\n"),
      );
    }
    if (_lastResult.warnings.length > 0) {
      console.warn(
        "[XiaochenExperience] 数据校验警告：\n" +
          _lastResult.warnings.join("\n"),
      );
    }
    if (_lastResult.ok && _lastResult.warnings.length === 0) {
      console.info("[XiaochenExperience] 数据校验通过");
    }
  }
  return _lastResult;
}
