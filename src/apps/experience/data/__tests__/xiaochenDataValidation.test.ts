/* —— 小晨体验模式统一数据源：跨模块一致性校验测试 ——
 *
 * 运行 `npm run test` 验证 18 项数据校验规则全部通过。
 * 任何校验失败都意味着统一数据源内部存在矛盾，必须修复。 */
import { describe, it, expect } from "vitest";
import { validateXiaochenExperienceData } from "../xiaochen/validators";
import {
  XIAOCHEN_RECORDED_DATE_KEYS,
  XIAOCHEN_UNRECORDED_DATE_KEYS,
  TOTAL_DAYS,
  RECORDED_DAYS,
  UNRECORDED_DAYS,
  MISSED_MED_DATES,
  NO_SCHOOL_DATES,
  WEIGHT_RECORDS,
  NEGATIVE_THOUGHT_DATES,
  APPOINTMENT_DATE,
  PERIOD_END,
  REFERENCE_DATE,
  STATS,
} from "../xiaochen/constants";
import { XIAOCHEN_CURRENT_DATE } from "../xiaochen/timeConfig";
import { XIAOCHEN_PRAISE_CARDS } from "../xiaochen/praiseCards";
import { EXPERIENCE_CONVERSATION } from "../xiaochen/conversations";

describe("小晨体验模式统一数据源校验", () => {
  const result = validateXiaochenExperienceData();

  it("数据校验全部通过（0 errors）", () => {
    expect(result.errors).toEqual([]);
  });

  it(`日期范围为 ${TOTAL_DAYS} 天`, () => {
    expect(XIAOCHEN_RECORDED_DATE_KEYS.length + XIAOCHEN_UNRECORDED_DATE_KEYS.length).toBe(TOTAL_DAYS);
  });

  it(`记录日为 ${RECORDED_DAYS} 天`, () => {
    expect(XIAOCHEN_RECORDED_DATE_KEYS.length).toBe(RECORDED_DAYS);
  });

  it(`无记录日为 ${UNRECORDED_DAYS} 天`, () => {
    expect(XIAOCHEN_UNRECORDED_DATE_KEYS.length).toBe(UNRECORDED_DAYS);
  });

  it("记录日与无记录日无交集", () => {
    const recordedSet = new Set<string>(XIAOCHEN_RECORDED_DATE_KEYS);
    for (const d of XIAOCHEN_UNRECORDED_DATE_KEYS) {
      expect(recordedSet.has(d)).toBe(false);
    }
  });

  it(`漏服 ${STATS.missedMedCount} 次`, () => {
    expect(MISSED_MED_DATES.length).toBe(STATS.missedMedCount);
  });

  it(`未到校 ${STATS.noSchoolCount} 天`, () => {
    expect(NO_SCHOOL_DATES.length).toBe(STATS.noSchoolCount);
  });

  it(`体重记录 ${STATS.weightRecordCount} 次`, () => {
    expect(WEIGHT_RECORDS.length).toBe(STATS.weightRecordCount);
  });

  it(`深夜消极念头 ${STATS.negativeThoughtCount} 次`, () => {
    expect(NEGATIVE_THOUGHT_DATES.length).toBe(STATS.negativeThoughtCount);
  });

  it("复诊日不在记录周期内", () => {
    expect(XIAOCHEN_RECORDED_DATE_KEYS).not.toContain(APPOINTMENT_DATE);
    expect(APPOINTMENT_DATE > PERIOD_END).toBe(true);
  });

  it("参考日 = 周期结束日", () => {
    expect(REFERENCE_DATE).toBe(PERIOD_END);
  });

  it("夸夸卡日期可追溯到时间线事件", () => {
    // 与 validators.ts 第 16 项保持一致：允许 RECORDED_DATE_KEYS + APPOINTMENT_DATE + CURRENT_DATE
    // CURRENT_DATE（2026-07-15）在 dailyRecords.ts 中有完整记录，但 constants.ts 旧逻辑列为无记录日
    const timelineDates = new Set<string>([
      ...XIAOCHEN_RECORDED_DATE_KEYS,
      APPOINTMENT_DATE,
      XIAOCHEN_CURRENT_DATE,
    ]);
    for (const card of XIAOCHEN_PRAISE_CARDS) {
      const cardDate = card.createdAt.slice(0, 10);
      expect(timelineDates.has(cardDate)).toBe(true);
    }
  });

  it("对话线程覆盖关键事件日期（7/4 呼吸练习、7/9 低谷、7/15 复诊前）", () => {
    // 对齐统一时间线（XIAOCHEN_CURRENT_DATE = 2026-07-15）
    // 不再要求 7/17 / 7/18 已发生对话（属于未来事件，已移除）
    const conversationDates = new Set<string>();
    for (const thread of EXPERIENCE_CONVERSATION.threads) {
      for (const item of thread) {
        const d = new Date(item.createdAt);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        conversationDates.add(dateStr);
      }
    }
    expect(conversationDates.has("2026-07-04")).toBe(true);
    expect(conversationDates.has("2026-07-09")).toBe(true);
    expect(conversationDates.has("2026-07-15")).toBe(true);
  });
});
