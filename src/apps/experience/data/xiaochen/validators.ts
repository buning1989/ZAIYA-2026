/* —— 小晨体验模式统一数据源：跨模块数据校验 ——
 *
 * 校验所有统计数字、日期、事件计数与 constants.STATS 一致，
 * 以及夸夸卡 / 对话日期能追溯到时间线事件。
 *
 * 开发环境检测到不一致时输出可定位的 console.error，不静默使用另一套数字。
 * 生产环境校验失败不抛异常，避免阻塞渲染。 */
import {
  TOTAL_DAYS,
  RECORDED_DAYS,
  UNRECORDED_DAYS,
  STATS,
  PERIOD_START,
  PERIOD_END,
  REFERENCE_DATE,
  APPOINTMENT_DATE,
  XIAOCHEN_RECORDED_DATE_KEYS,
  XIAOCHEN_UNRECORDED_DATE_KEYS,
  MISSED_MED_DATES,
  NO_SCHOOL_DATES,
  WEIGHT_RECORDS,
  NEGATIVE_THOUGHT_DATES,
} from "./constants";
import { XIAOCHEN_DAILY_RECORDS, XIAOCHEN_ALL_DAYS } from "./records";
import { XIAOCHEN_DROWSINESS_DATES, XIAOCHEN_FAMILY_CONFLICT_DATES } from "./timeline";
import { XIAOCHEN_PRAISE_CARDS } from "./praiseCards";
import { XIAOCHEN_ORGANIZE_DISCLOSURE } from "./organize";
import { EXPERIENCE_CONVERSATION } from "./conversations";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

/* —— 工具：日期差天数 —— */
function daysBetween(start: string, end: string): number {
  const s = new Date(start + "T00:00:00+08:00");
  const e = new Date(end + "T00:00:00+08:00");
  return Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
}

/* —— 工具：从 ISO 字符串提取 YYYY-MM-DD —— */
function extractDate(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * 校验小晨体验模式统一数据源的跨模块一致性。
 *
 * 校验项：
 *   1. 日期范围为 33 天
 *   2. 记录日期为 24 天
 *   3. 无记录日期为 9 天
 *   4. 漏服 4 次（与 records.ts 中 medMorning=missed 一致）
 *   5. 未到校 4 天
 *   6. 困倦记录 18 天
 *   7. 家庭冲突 6 次
 *   8. 体重记录恰好 2 次
 *   9. 深夜消极念头记录恰好 2 次
 *  10. 不存在晚间舍曲林记录
 *  11. 复诊日（7/18）不在 24 个记录日内
 *  12. 所有夸夸卡日期能追溯到时间线事件
 *  13. organize 高风险披露恰好 2 条
 *  14. 对话线程覆盖关键事件日期
 */
export function validateXiaochenExperienceData(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  /* —— 1. 日期范围 33 天 —— */
  const periodDays = daysBetween(PERIOD_START, PERIOD_END);
  if (periodDays !== TOTAL_DAYS) {
    errors.push(
      `[validators] 日期范围应为 ${TOTAL_DAYS} 天，实际 ${periodDays} 天（${PERIOD_START} → ${PERIOD_END}）`,
    );
  }

  /* —— 2. 记录日 24 天 —— */
  if (XIAOCHEN_RECORDED_DATE_KEYS.length !== RECORDED_DAYS) {
    errors.push(
      `[validators] XIAOCHEN_RECORDED_DATE_KEYS 应为 ${RECORDED_DAYS} 项，实际 ${XIAOCHEN_RECORDED_DATE_KEYS.length} 项`,
    );
  }

  /* —— 3. 无记录日 9 天 —— */
  if (XIAOCHEN_UNRECORDED_DATE_KEYS.length !== UNRECORDED_DAYS) {
    errors.push(
      `[validators] XIAOCHEN_UNRECORDED_DATE_KEYS 应为 ${UNRECORDED_DAYS} 项，实际 ${XIAOCHEN_UNRECORDED_DATE_KEYS.length} 项`,
    );
  }

  /* —— 4. 漏服 4 次 —— */
  let missedMedCount = 0;
  for (const dateKey of XIAOCHEN_RECORDED_DATE_KEYS) {
    const day = XIAOCHEN_DAILY_RECORDS[dateKey];
    if (day?.medication?.morning === "missed") missedMedCount++;
  }
  if (missedMedCount !== STATS.missedMedCount) {
    errors.push(
      `[validators] 漏服次数应为 ${STATS.missedMedCount} 次，实际 ${missedMedCount} 次（MISSED_MED_DATES=${MISSED_MED_DATES.join(",")}）`,
    );
  }
  if (MISSED_MED_DATES.length !== STATS.missedMedCount) {
    errors.push(
      `[validators] MISSED_MED_DATES 长度 ${MISSED_MED_DATES.length} 与 STATS.missedMedCount=${STATS.missedMedCount} 不一致`,
    );
  }

  /* —— 5. 未到校 4 天 —— */
  if (NO_SCHOOL_DATES.length !== STATS.noSchoolCount) {
    errors.push(
      `[validators] NO_SCHOOL_DATES 长度 ${NO_SCHOOL_DATES.length} 与 STATS.noSchoolCount=${STATS.noSchoolCount} 不一致`,
    );
  }

  /* —— 6. 困倦 18 天 —— */
  if (XIAOCHEN_DROWSINESS_DATES.length !== STATS.daytimeDrowsinessDays) {
    errors.push(
      `[validators] XIAOCHEN_DROWSINESS_DATES 长度 ${XIAOCHEN_DROWSINESS_DATES.length} 与 STATS.daytimeDrowsinessDays=${STATS.daytimeDrowsinessDays} 不一致`,
    );
  }

  /* —— 7. 家庭冲突 6 次 —— */
  if (XIAOCHEN_FAMILY_CONFLICT_DATES.length !== STATS.familyConflictCount) {
    errors.push(
      `[validators] XIAOCHEN_FAMILY_CONFLICT_DATES 长度 ${XIAOCHEN_FAMILY_CONFLICT_DATES.length} 与 STATS.familyConflictCount=${STATS.familyConflictCount} 不一致`,
    );
  }

  /* —— 8. 体重记录 2 次 —— */
  if (WEIGHT_RECORDS.length !== STATS.weightRecordCount) {
    errors.push(
      `[validators] WEIGHT_RECORDS 长度 ${WEIGHT_RECORDS.length} 与 STATS.weightRecordCount=${STATS.weightRecordCount} 不一致`,
    );
  }
  let weightInRecords = 0;
  for (const dateKey of XIAOCHEN_RECORDED_DATE_KEYS) {
    const day = XIAOCHEN_DAILY_RECORDS[dateKey];
    if (day?.weight != null) weightInRecords++;
  }
  if (weightInRecords !== STATS.weightRecordCount) {
    errors.push(
      `[validators] XIAOCHEN_DAILY_RECORDS 中 weight 非 null 的天数为 ${weightInRecords}，与 STATS.weightRecordCount=${STATS.weightRecordCount} 不一致`,
    );
  }

  /* —— 9. 深夜消极念头 2 次 —— */
  if (NEGATIVE_THOUGHT_DATES.length !== STATS.negativeThoughtCount) {
    errors.push(
      `[validators] NEGATIVE_THOUGHT_DATES 长度 ${NEGATIVE_THOUGHT_DATES.length} 与 STATS.negativeThoughtCount=${STATS.negativeThoughtCount} 不一致`,
    );
  }
  if (XIAOCHEN_ORGANIZE_DISCLOSURE.count !== STATS.negativeThoughtCount) {
    errors.push(
      `[validators] XIAOCHEN_ORGANIZE_DISCLOSURE.count=${XIAOCHEN_ORGANIZE_DISCLOSURE.count} 与 STATS.negativeThoughtCount=${STATS.negativeThoughtCount} 不一致`,
    );
  }
  if (XIAOCHEN_ORGANIZE_DISCLOSURE.originalRecords.length !== STATS.negativeThoughtCount) {
    errors.push(
      `[validators] XIAOCHEN_ORGANIZE_DISCLOSURE.originalRecords 长度 ${XIAOCHEN_ORGANIZE_DISCLOSURE.originalRecords.length} 与 STATS.negativeThoughtCount=${STATS.negativeThoughtCount} 不一致`,
    );
  }

  /* —— 10. 不存在晚间舍曲林记录 —— */
  for (const dateKey of XIAOCHEN_RECORDED_DATE_KEYS) {
    const day = XIAOCHEN_DAILY_RECORDS[dateKey];
    if (day?.medication?.evening && day.medication.evening !== "unknown") {
      errors.push(
        `[validators] ${dateKey} 存在晚间舍曲林记录（evening=${day.medication.evening}），违反「仅早晨服药」约束`,
      );
    }
  }

  /* —— 11. 复诊日不在 24 个记录日内 —— */
  if ((XIAOCHEN_RECORDED_DATE_KEYS as readonly string[]).includes(APPOINTMENT_DATE)) {
    errors.push(
      `[validators] 复诊日 ${APPOINTMENT_DATE} 不应出现在 XIAOCHEN_RECORDED_DATE_KEYS 中`,
    );
  }

  /* —— 12. 复诊日必须在记录周期外 —— */
  if (
    APPOINTMENT_DATE >= PERIOD_START &&
    APPOINTMENT_DATE <= PERIOD_END
  ) {
    errors.push(
      `[validators] 复诊日 ${APPOINTMENT_DATE} 不应在记录周期 ${PERIOD_START}~${PERIOD_END} 内`,
    );
  }

  /* —— 13. 参考日必须是周期结束日 —— */
  if (REFERENCE_DATE !== PERIOD_END) {
    errors.push(
      `[validators] REFERENCE_DATE=${REFERENCE_DATE} 应与 PERIOD_END=${PERIOD_END} 一致`,
    );
  }

  /* —— 14. 24 个记录日 + 9 个无记录日 = 33 天，且无交集 —— */
  const recordedSet = new Set<string>(XIAOCHEN_RECORDED_DATE_KEYS);
  const unrecordedSet = new Set<string>(XIAOCHEN_UNRECORDED_DATE_KEYS);
  for (const d of XIAOCHEN_UNRECORDED_DATE_KEYS) {
    if (recordedSet.has(d)) {
      errors.push(`[validators] ${d} 同时出现在记录日与无记录日列表中`);
    }
  }
  if (recordedSet.size + unrecordedSet.size !== TOTAL_DAYS) {
    errors.push(
      `[validators] 记录日(${recordedSet.size}) + 无记录日(${unrecordedSet.size}) ≠ 总天数(${TOTAL_DAYS})`,
    );
  }

  /* —— 15. XIAOCHEN_ALL_DAYS 长度 = 33 —— */
  if (XIAOCHEN_ALL_DAYS.length !== TOTAL_DAYS) {
    errors.push(
      `[validators] XIAOCHEN_ALL_DAYS 长度 ${XIAOCHEN_ALL_DAYS.length} ≠ TOTAL_DAYS=${TOTAL_DAYS}`,
    );
  }

  /* —— 16. 夸夸卡日期必须能追溯到时间线事件 —— */
  const timelineDates = new Set<string>([
    ...XIAOCHEN_RECORDED_DATE_KEYS,
    APPOINTMENT_DATE,
  ]);
  for (const card of XIAOCHEN_PRAISE_CARDS) {
    const cardDate = extractDate(card.createdAt);
    if (!timelineDates.has(cardDate)) {
      errors.push(
        `[validators] 夸夸卡 ${card.id} 日期 ${cardDate} 无法追溯到时间线事件`,
      );
    }
  }

  /* —— 17. 对话线程覆盖关键事件日期 —— */
  const requiredConversationDates = ["2026-07-04", "2026-07-17", "2026-07-18"];
  const conversationDates = new Set<string>();
  for (const thread of EXPERIENCE_CONVERSATION.threads) {
    for (const item of thread) {
      const d = new Date(item.createdAt);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      conversationDates.add(dateStr);
    }
  }
  for (const required of requiredConversationDates) {
    if (!conversationDates.has(required)) {
      warnings.push(
        `[validators] 对话线程未覆盖关键日期 ${required}（7/4 呼吸练习 / 7/17 复诊准备 / 7/18 复诊）`,
      );
    }
  }

  /* —— 18. organize 高风险披露的 recordedAt 日期必须对应 NEGATIVE_THOUGHT_DATES —— */
  for (const rec of XIAOCHEN_ORGANIZE_DISCLOSURE.originalRecords) {
    const recDate = extractDate(rec.recordedAt);
    if (!(NEGATIVE_THOUGHT_DATES as readonly string[]).includes(recDate)) {
      errors.push(
        `[validators] 高风险披露 ${rec.id} 日期 ${recDate} 不在 NEGATIVE_THOUGHT_DATES 中`,
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
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
