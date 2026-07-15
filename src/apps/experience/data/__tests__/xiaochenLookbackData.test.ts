import { describe, expect, it } from "vitest";
import {
  getXiaochenMonthRange,
  getXiaochenReferenceDate,
  getXiaochenWeekRange,
} from "../../selectors/selectLookbackData";
import { XIAOCHEN_LOOKBACK_DAILY_RECORDS } from "../xiaochen";

function date(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00+08:00`);
}

function count<T>(items: T[], predicate: (item: T) => boolean): number {
  return items.filter(predicate).length;
}

describe("小晨自由体验回头看看两个月数据", () => {
  it("参考日固定为 2026-07-15，当前周只返回已发生日期", () => {
    expect(getXiaochenReferenceDate().getTime()).toBe(new Date("2026-07-15T00:00:00+08:00").getTime());
    const week = getXiaochenWeekRange(date("2026-07-13"));
    expect(week.map((day) => day.date)).toEqual([
      "2026-07-13",
      "2026-07-14",
      "2026-07-15",
    ]);
    expect(week.some((day) => day.date > "2026-07-15")).toBe(false);
  });

  it("关键日期记录与详情一致", () => {
    const june26 = XIAOCHEN_LOOKBACK_DAILY_RECORDS["2026-06-26"];
    expect(june26.mood).toBe(1);
    expect(june26.moodNote).toBe("感觉快撑不下去了");
    expect(june26.sleepTime).toBe("03:20");
    expect(june26.mealEntries?.map((entry) => entry.mealType)).toEqual(["晚餐"]);
    expect(june26.medication.evening).toBe("taken");
    expect(june26.activityLevel).toBe(0);
    expect(june26.weight).toBe(50.5);

    const july13 = XIAOCHEN_LOOKBACK_DAILY_RECORDS["2026-07-13"];
    expect(july13.moodEntries).toHaveLength(2);
    expect(july13.sleepTime).toBe("01:05");
    expect(july13.meals).toEqual({ breakfast: "yes", lunch: "yes", dinner: "yes" });
    expect(july13.weight).toBe(50.3);

    const july14 = XIAOCHEN_LOOKBACK_DAILY_RECORDS["2026-07-14"];
    expect(july14.moodEntries).toBeNull();
    expect(july14.sleepTime).toBe("00:55");
    expect(july14.mealEntries?.map((entry) => entry.mealType)).toEqual(["午餐", "晚餐"]);
    expect(july14.medication.evening).toBe("taken");
    expect(july14.activityLevel).toBe(0);

    const july15 = XIAOCHEN_LOOKBACK_DAILY_RECORDS["2026-07-15"];
    expect(july15.activityLevel).toBe(2);
    expect(july15.weight).toBe(50.4);
  });

  it("服药按喹硫平睡前一次记录，未记录不等于漏服", () => {
    const july9 = XIAOCHEN_LOOKBACK_DAILY_RECORDS["2026-07-09"];
    expect(july9.medication).toEqual({ morning: "unknown", evening: "missed" });
    expect(july9.medEntries?.[0].slot).toBe("睡前药");
    expect(july9.medEntries?.[0].note).toBe("明确漏服。");

    const june25 = XIAOCHEN_LOOKBACK_DAILY_RECORDS["2026-06-25"];
    expect(june25.medication.evening).toBe("unknown");
    expect(june25.medEntries).toBeNull();
  });

  it("最近四周基线符合任务要求", () => {
    const w0622 = getXiaochenWeekRange(date("2026-06-22"));
    expect(count(w0622, (day) => day.moodEntries !== null)).toBe(6);
    expect(count(w0622, (day) => day.meals.breakfast === "yes")).toBe(2);
    expect(count(w0622, (day) => day.medication.evening === "taken")).toBe(5);
    expect(count(w0622, (day) => day.medication.evening === "missed")).toBe(1);
    expect(count(w0622, (day) => day.medication.evening === "unknown")).toBe(1);
    expect(count(w0622, (day) => day.activityLevel !== null && day.activityLevel > 0)).toBe(3);
    expect(count(w0622, (day) => day.weight !== null)).toBe(2);

    const w0706 = getXiaochenWeekRange(date("2026-07-06"));
    expect(count(w0706, (day) => day.moodEntries !== null)).toBe(7);
    expect(w0706.find((day) => day.date === "2026-07-09")?.mood).toBe(1);
    expect(count(w0706, (day) => day.meals.breakfast === "yes")).toBe(4);
    expect(count(w0706, (day) => day.medication.evening === "taken")).toBe(6);
    expect(count(w0706, (day) => day.medication.evening === "missed")).toBe(1);
    expect(count(w0706, (day) => day.activityLevel !== null && day.activityLevel > 0)).toBe(5);
    expect(count(w0706, (day) => day.weight !== null)).toBe(2);

    const w0713 = getXiaochenWeekRange(date("2026-07-13"));
    expect(count(w0713, (day) => day.medication.evening === "taken")).toBe(3);
    expect(count(w0713, (day) => day.activityLevel !== null && day.activityLevel > 0)).toBe(2);
    expect(count(w0713, (day) => day.weight !== null)).toBe(2);
  });

  it("月视图只开放 2026 年 6 月和截至 7 月 15 日的 7 月", () => {
    expect(getXiaochenMonthRange(2026, 6)).toHaveLength(30);
    const july = getXiaochenMonthRange(2026, 7);
    expect(july.map((day) => day.date).at(-1)).toBe("2026-07-15");
    expect(count(july, (day) => day.weight !== null)).toBe(5);
    expect(getXiaochenMonthRange(2026, 5)).toEqual([]);
    expect(getXiaochenMonthRange(2026, 8)).toEqual([]);
  });
});
