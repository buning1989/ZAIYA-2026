/* —— 小晨自由体验模式：统一日级事实数据源 ——
 *
 * 本文件是体验模式所有"日级生活事实"的单一来源（Single Source of Truth）。
 * 包含情绪、入睡、三餐、服药、活动、体重六个维度的固定 Mock 数据，
 * 覆盖 2026-05-16 至 2026-07-15（约两个月）。
 *
 * 数据迁移自原 lookbackRecords.ts，内容原样保留，不做任何值修改：
 *   - 不改变任何日期的数据值；
 *   - 不改变情绪等级；
 *   - 不改变入睡时间归属；
 *   - 不改变服药状态；
 *   - 不补齐原本缺失的数据；
 *   - 不删除合理的未记录状态；
 *   - 不使用随机生成。
 *
 * 数据链路：
 *   dailyRecords.ts（事实源）
 *     → lookbackRecords.ts（适配层，保留周/月视图配置与展示格式）
 *       → selectLookbackData.ts（切片选择器）
 *         → 周视图、月视图、趋势图、日期列表、日期详情
 *
 * 下一轮迁移（AI 对话 / 帮我整理 / 夸夸自己 / 我的隐私 / 能量获取）
 * 应改为消费本文件，逐步消除各模块独立的日级数据副本。 */

import type {
  ActivityLevel,
  DailyLookbackData,
  MealEntry,
  MealState,
  MedEntry,
  MedState,
  Mood,
  MoodEntry,
} from "@/data/lookback";
import { XIAOCHEN_CURRENT_DATE, XIAOCHEN_START_DATE } from "./timeConfig";

/* —— 类型复用：直接引用项目现有类型，不重新设计字段 ——
 * XiaochenDailyRecord 仅作为语义别名，便于未来在不污染 DailyLookbackData 的前提下扩展。 */
export type XiaochenDailyRecord = DailyLookbackData;

type MealPatch = Partial<Record<"breakfast" | "lunch" | "dinner", MealState>>;

type ActivityPatch =
  | { level: ActivityLevel; content?: string | null; duration?: string | null; feeling?: string | null }
  | null;

type DayPatch = {
  mood?: MoodEntry[] | null;
  sleepTime?: string | null;
  wakeTime?: string | null;
  sleepNote?: string | null;
  meals?: MealPatch;
  mealFeeling?: string | null;
  med?: MedState;
  medTime?: string;
  medNote?: string | null;
  medFeeling?: string | null;
  activity?: ActivityPatch;
  weight?: number | null;
  weightNote?: string | null;
};

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toDisplayDate(dateStr: string): string {
  const [, month, day] = dateStr.split("-").map(Number);
  return `${month}月${day}日`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00+08:00`);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

function daysBetween(start: string, end: string): number {
  const s = new Date(`${start}T00:00:00+08:00`);
  const e = new Date(`${end}T00:00:00+08:00`);
  return Math.round((e.getTime() - s.getTime()) / 86400000);
}

function dateRange(start: string, end: string): string[] {
  const days = daysBetween(start, end);
  return Array.from({ length: days + 1 }, (_, idx) => addDays(start, idx));
}

function calcSleepDuration(sleepTime: string, wakeTime: string): number {
  const [sh, sm] = sleepTime.split(":").map(Number);
  const [wh, wm] = wakeTime.split(":").map(Number);
  let start = sh * 60 + sm;
  let end = wh * 60 + wm;
  if (start < 12 * 60) start += 24 * 60;
  if (end < 12 * 60) end += 24 * 60;
  const duration = end - start;
  return duration > 0 ? duration : duration + 24 * 60;
}

function deriveSleepLevel(durationMin: number, sleepTime: string): 1 | 2 | 3 {
  const [h, m] = sleepTime.split(":").map(Number);
  const sleepMinute = (h < 12 ? h + 24 : h) * 60 + m;
  if (sleepMinute >= 2 * 60 + 24 * 60 + 30 || durationMin < 5 * 60) return 1;
  if (sleepMinute <= 1 * 60 + 24 * 60 && durationMin >= 6 * 60 + 15) return 3;
  return 2;
}

function toColloquialBedTime(sleepTime: string): string {
  const [hour] = sleepTime.split(":").map(Number);
  if (hour >= 23) return "晚上11点多";
  if (hour === 0) return "凌晨0点多";
  if (hour >= 1 && hour <= 3) return `凌晨${hour}点多`;
  return "晚上10点多";
}

function timeFromMinute(total: number): string {
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}

function oneMood(
  time: string,
  mood: Mood,
  words: string[],
  note?: string | null,
  trigger?: string | null,
): MoodEntry {
  return {
    time,
    mood,
    moodWords: words,
    moodTrigger: trigger ?? null,
    moodBody: mood <= 2 ? "胸口发紧" : null,
    moodNote: note ?? null,
    moodSpecial: null,
  };
}

function defaultMood(dateStr: string, idx: number): MoodEntry[] | null {
  const day = Number(dateStr.slice(-2));
  if ([18, 25].includes(day) || (idx > 15 && idx % 11 === 0)) return null;
  const phase = idx < 18 ? 0 : idx < 39 ? 1 : 2;
  const cycle = [2, 3, 2, 3, 2, 4, 3][idx % 7] as Mood;
  const mood = (phase === 0 ? Math.min(cycle, 3) : phase === 1 ? cycle : Math.min(cycle + (idx % 13 === 0 ? 1 : 0), 4)) as Mood;
  const words =
    mood <= 2 ? ["低落", "疲惫"] : mood === 3 ? ["一般", "平静"] : ["还可以", "松了一点"];
  return [oneMood(idx % 3 === 0 ? "08:10" : "21:20", mood, words)];
}

function defaultSleepTime(idx: number): string | null {
  if ([7, 19, 35, 47].includes(idx)) return null;
  const base = 132 - Math.min(52, Math.floor(idx * 0.85));
  const offsets = [8, -12, 18, -5, 26, -18, 4];
  return timeFromMinute(24 * 60 + base + offsets[idx % offsets.length]);
}

function defaultMeals(idx: number): { breakfast: MealState; lunch: MealState; dinner: MealState } {
  const breakfast: MealState =
    idx % 4 === 0 || idx % 5 === 0 || idx % 7 === 2 ? "yes" : idx % 17 === 0 ? "unknown" : "no";
  const lunch: MealState = idx % 13 === 4 ? "unknown" : idx % 19 === 9 ? "no" : "yes";
  const dinner: MealState = idx % 16 === 6 ? "no" : "yes";
  return { breakfast, lunch, dinner };
}

function defaultMedication(idx: number): MedState {
  if ([12, 31, 42, 55].includes(idx)) return "missed";
  if ([6, 22, 44].includes(idx)) return "unknown";
  return "taken";
}

function defaultActivity(idx: number): ActivityPatch {
  if ([4, 9, 16, 23, 30, 43, 51].includes(idx)) return null;
  const late = idx >= 40;
  if (!late && idx % 3 !== 0) return { level: 0 };
  if (late && idx % 7 !== 3 && idx % 7 !== 6) {
    return {
      level: 1,
      content: idx % 2 === 0 ? "下楼走动 10 分钟" : "放学后慢走",
      duration: idx % 2 === 0 ? "8–15 分钟" : "10–20 分钟",
      feeling: "有点累但还可以",
    };
  }
  return idx % 5 === 0
    ? { level: 1, content: "拉伸 8 分钟", duration: "不到 10 分钟", feeling: "稍微松了一点" }
    : { level: 0 };
}

const WEIGHTS: Record<string, number> = {
  "2026-05-17": 50.6,
  "2026-05-23": 50.5,
  "2026-05-30": 50.7,
  "2026-06-03": 50.4,
  "2026-06-10": 50.5,
  "2026-06-16": 50.4,
  "2026-06-20": 50.6,
  "2026-06-23": 50.4,
  "2026-06-26": 50.5,
  "2026-06-30": 50.3,
  "2026-07-05": 50.4,
  "2026-07-09": 50.6,
  "2026-07-12": 50.4,
  "2026-07-13": 50.3,
  "2026-07-15": 50.4,
};

const OVERRIDES: Record<string, DayPatch> = {
  "2026-06-22": {
    mood: [oneMood("21:40", 2, ["低落", "紧绷"], "早上没有去成学校，晚上又说到这件事。", "上学")],
    sleepTime: "02:05",
    meals: { breakfast: "no", lunch: "yes", dinner: "yes" },
    med: "taken",
    activity: { level: 0 },
  },
  "2026-06-23": {
    mood: [oneMood("20:50", 2, ["疲惫", "低落"])],
    sleepTime: "01:40",
    meals: { breakfast: "no", lunch: "yes", dinner: "yes" },
    med: "taken",
    activity: { level: 1, content: "下楼走动 10 分钟", duration: "8–15 分钟", feeling: "有点累" },
  },
  "2026-06-24": {
    mood: [oneMood("22:05", 3, ["一般", "麻木"])],
    sleepTime: "02:15",
    meals: { breakfast: "yes", lunch: "yes", dinner: "yes" },
    med: "taken",
    activity: { level: 0 },
  },
  "2026-06-25": {
    mood: null,
    sleepTime: "01:30",
    meals: { breakfast: "no", lunch: "yes", dinner: "yes" },
    med: "unknown",
    activity: { level: 1, content: "拉伸 8 分钟", duration: "不到 10 分钟", feeling: "肩膀松了一点" },
  },
  "2026-06-26": {
    mood: [oneMood("23:18", 1, ["很糟", "空掉"], "感觉快撑不下去了", "深夜反刍")],
    sleepTime: "03:20",
    sleepNote: "躺了很久，脑子停不下来。",
    meals: { breakfast: "no", lunch: "no", dinner: "yes" },
    med: "taken",
    medTime: "23:45",
    medNote: "今天吃得很晚。",
    activity: { level: 0 },
    weight: 50.5,
  },
  "2026-06-27": {
    mood: [oneMood("18:30", 2, ["低落", "累"])],
    sleepTime: null,
    meals: { breakfast: "no", lunch: "yes", dinner: "yes" },
    med: "taken",
    activity: null,
  },
  "2026-06-28": {
    mood: [oneMood("21:10", 2, ["低落", "烦躁"])],
    sleepTime: "01:00",
    meals: { breakfast: "yes", lunch: "yes", dinner: "yes" },
    med: "missed",
    medNote: "想起来的时候已经很晚了。",
    activity: { level: 1, content: "步行去便利店", duration: "10–15 分钟", feeling: "没那么闷" },
  },
  "2026-06-29": {
    mood: [oneMood("20:30", 3, ["一般", "疲惫"])],
    sleepTime: "01:45",
    meals: { breakfast: "no", lunch: "yes", dinner: "yes" },
    med: "taken",
    activity: { level: 0 },
  },
  "2026-06-30": {
    mood: [oneMood("21:15", 2, ["低落", "累"])],
    sleepTime: "01:25",
    meals: { breakfast: "yes", lunch: "yes", dinner: "yes" },
    med: "taken",
    activity: { level: 1, content: "放学后慢走", duration: "10–20 分钟", feeling: "还可以" },
    weight: 50.3,
  },
  "2026-07-01": {
    mood: [oneMood("19:40", 3, ["一般"])],
    sleepTime: "01:20",
    meals: { breakfast: "no", lunch: "yes", dinner: "yes" },
    med: "missed",
    activity: { level: 1, content: "拉伸 10 分钟", duration: "10 分钟", feeling: "肩膀松了一点" },
  },
  "2026-07-02": {
    mood: null,
    sleepTime: null,
    meals: { breakfast: "yes", lunch: "yes", dinner: "yes" },
    med: "taken",
    activity: { level: 1, content: "放学后慢走", duration: "15 分钟", feeling: "有点累" },
  },
  "2026-07-03": {
    mood: [oneMood("22:00", 3, ["一般", "烦躁"])],
    sleepTime: "01:10",
    meals: { breakfast: "no", lunch: "yes", dinner: "yes" },
    med: "taken",
    activity: { level: 0 },
  },
  "2026-07-04": {
    mood: [oneMood("21:50", 2, ["低落", "委屈"], "晚上又吵了一会儿，只想躲起来。", "家庭冲突")],
    sleepTime: "02:10",
    meals: { breakfast: "no", lunch: "no", dinner: "yes" },
    med: "taken",
    activity: { level: 0 },
  },
  "2026-07-05": {
    mood: [oneMood("20:10", 3, ["一般", "平静"])],
    sleepTime: "01:25",
    meals: { breakfast: "yes", lunch: "yes", dinner: "yes" },
    med: "taken",
    activity: { level: 2, content: "周末步行 20 分钟", duration: "20 分钟", feeling: "有点累但能接受" },
    weight: 50.4,
  },
  "2026-07-06": {
    mood: [oneMood("21:15", 3, ["一般", "疲惫"])],
    sleepTime: "01:40",
    meals: { breakfast: "yes", lunch: "yes", dinner: "yes" },
    med: "taken",
    activity: { level: 1, content: "拉伸 8 分钟", duration: "不到 10 分钟", feeling: "稍微松一点" },
  },
  "2026-07-07": {
    mood: [oneMood("20:45", 2, ["低落", "累"])],
    sleepTime: "01:15",
    meals: { breakfast: "no", lunch: "yes", dinner: "yes" },
    med: "taken",
    activity: { level: 1, content: "下楼走动 12 分钟", duration: "8–15 分钟", feeling: "还可以" },
  },
  "2026-07-08": {
    mood: [oneMood("22:05", 3, ["一般", "紧绷"])],
    sleepTime: "01:30",
    meals: { breakfast: "yes", lunch: "yes", dinner: "yes" },
    med: "taken",
    activity: { level: 1, content: "步行去便利店", duration: "15 分钟", feeling: "没那么闷" },
  },
  "2026-07-09": {
    mood: [oneMood("22:40", 1, ["很糟", "空掉"], "今天又掉下去了，但记录完就先放在这里。", "状态反复")],
    sleepTime: "02:50",
    sleepNote: "很晚才睡着。",
    meals: { breakfast: "no", lunch: "no", dinner: "yes" },
    med: "missed",
    medNote: "明确漏服。",
    activity: { level: 0 },
    weight: 50.6,
  },
  "2026-07-10": {
    mood: [oneMood("20:35", 3, ["一般", "疲惫"])],
    sleepTime: "00:50",
    meals: { breakfast: "no", lunch: "yes", dinner: "yes" },
    med: "taken",
    activity: { level: 1, content: "步行去便利店", duration: "15 分钟", feeling: "有点累" },
  },
  "2026-07-11": {
    mood: [oneMood("21:00", 4, ["还可以", "轻一点"], "今天没有突然很好，但确实没那么沉。")],
    sleepTime: "00:45",
    meals: { breakfast: "yes", lunch: "yes", dinner: "yes" },
    med: "taken",
    activity: { level: 2, content: "步行 25 分钟", duration: "20–25 分钟", feeling: "走完有点累，但还可以" },
  },
  "2026-07-12": {
    mood: [oneMood("20:20", 3, ["一般", "平静"])],
    sleepTime: "00:35",
    meals: { breakfast: "yes", lunch: "yes", dinner: "yes" },
    med: "taken",
    activity: { level: 0 },
    weight: 50.4,
  },
  "2026-07-13": {
    mood: [
      oneMood("08:20", 2, ["低落", "紧绷"], "早上醒来还是很不想去学校。"),
      oneMood("21:10", 3, ["一般", "累"], "晚上比早上平一点。"),
    ],
    sleepTime: "01:05",
    meals: { breakfast: "yes", lunch: "yes", dinner: "yes" },
    med: "taken",
    activity: { level: 1, content: "步行 15 分钟", duration: "15 分钟", feeling: "有点累但还可以" },
    weight: 50.3,
  },
  "2026-07-14": {
    mood: null,
    sleepTime: "00:55",
    meals: { breakfast: "no", lunch: "yes", dinner: "yes" },
    med: "taken",
    activity: { level: 0 },
  },
  "2026-07-15": {
    mood: [oneMood("20:50", 4, ["还可以", "松了一点"], "复诊前把这几周看了一遍，还是有点紧张。")],
    sleepTime: "00:40",
    meals: { breakfast: "yes", lunch: "yes", dinner: "yes" },
    med: "taken",
    activity: { level: 2, content: "步行 20 分钟", duration: "20 分钟", feeling: "还可以" },
  },
};

function buildMealEntries(dateStr: string, meals: DailyLookbackData["meals"], feeling: string | null): MealEntry[] | null {
  const entries: MealEntry[] = [];
  if (meals.breakfast === "yes") {
    entries.push({
      mealType: "早餐",
      food: "包子和豆浆",
      feeling,
      time: "07:20",
      note: null,
    });
  }
  if (meals.lunch === "yes") {
    entries.push({
      mealType: "午餐",
      food: "食堂套餐",
      feeling: null,
      time: "12:15",
      note: null,
    });
  }
  if (meals.dinner === "yes") {
    entries.push({
      mealType: "晚餐",
      food: dateStr === "2026-06-26" || dateStr === "2026-07-09" ? "粥和一点菜" : "家常菜",
      feeling: null,
      time: "18:40",
      note: null,
    });
  }
  return entries.length > 0 ? entries : null;
}

function buildMedEntries(state: MedState, time: string, note: string | null, feeling: string | null): MedEntry[] | null {
  if (state === "unknown") return null;
  return [
    {
      slot: "睡前药",
      slotTime: "21:30",
      effectTime: state === "taken" ? "1 小时" : null,
      feeling: state === "taken" ? feeling : null,
      time: state === "taken" ? time : "23:00",
      note: state === "missed" ? note ?? "漏服了" : note,
    },
  ];
}

function buildDay(dateStr: string): XiaochenDailyRecord {
  const idx = daysBetween(XIAOCHEN_START_DATE, dateStr);
  const patch = OVERRIDES[dateStr] ?? {};
  const moodEntries = patch.mood !== undefined ? patch.mood : defaultMood(dateStr, idx);
  const lastMood = moodEntries && moodEntries.length > 0 ? moodEntries[moodEntries.length - 1] : null;
  const sleepTime = patch.sleepTime !== undefined ? patch.sleepTime : defaultSleepTime(idx);
  const wakeTime = sleepTime ? patch.wakeTime ?? (dateStr.endsWith("-06") || dateStr.endsWith("-07") ? "08:30" : "07:05") : null;
  const sleepDurationMin = sleepTime && wakeTime ? calcSleepDuration(sleepTime, wakeTime) : null;
  const sleepLevel = sleepTime && sleepDurationMin !== null ? deriveSleepLevel(sleepDurationMin, sleepTime) : null;
  const defaultMealState = defaultMeals(idx);
  const meals = {
    ...defaultMealState,
    ...(patch.meals ?? {}),
  };
  const med = patch.med ?? defaultMedication(idx);
  const activity = patch.activity !== undefined ? patch.activity : defaultActivity(idx);
  const weight = patch.weight !== undefined ? patch.weight : WEIGHTS[dateStr] ?? null;
  const mealFeeling = patch.mealFeeling ?? null;

  return {
    date: dateStr,
    displayDate: toDisplayDate(dateStr),
    mood: lastMood?.mood ?? null,
    moodWords: lastMood?.moodWords ?? null,
    moodTrigger: lastMood?.moodTrigger ?? null,
    moodBody: lastMood?.moodBody ?? null,
    moodNote: lastMood?.moodNote ?? null,
    moodEntries,
    sleepTime,
    wakeTime,
    sleepDurationMin,
    nightWake: sleepTime && sleepLevel === 1 ? "1 次" : null,
    wakeFeeling: sleepLevel === 3 ? "还行" : sleepLevel === 2 ? "没睡够" : sleepLevel === 1 ? "很累" : null,
    sleepLevel,
    sleepBedTime: sleepTime ? toColloquialBedTime(sleepTime) : null,
    sleepNote: patch.sleepNote ?? null,
    sleepRecordTime: wakeTime,
    meals,
    mealFeeling,
    mealEntries: buildMealEntries(dateStr, meals, mealFeeling),
    medication: { morning: "unknown", evening: med },
    medChangeNote: null,
    medEntries: buildMedEntries(med, patch.medTime ?? "21:40", patch.medNote ?? null, patch.medFeeling ?? null),
    activityLevel: activity ? activity.level : null,
    activityContent: activity?.content ?? null,
    activityNote: null,
    activityDuration: activity ? activity.duration ?? (activity.level > 0 ? "8–15 分钟" : null) : null,
    activityFeeling: activity?.feeling ?? null,
    activityRecordTime: activity ? "21:20" : null,
    weight,
    weightMeasureContext: weight !== null ? "起床后" : null,
    weightNote: patch.weightNote ?? null,
    weightRecordTime: weight !== null ? "07:30" : null,
  };
}

/** 全部日级事实记录（升序，从 XIAOCHEN_START_DATE 到 XIAOCHEN_CURRENT_DATE）。 */
export const XIAOCHEN_DAILY_ALL_DAYS: XiaochenDailyRecord[] = dateRange(
  XIAOCHEN_START_DATE,
  XIAOCHEN_CURRENT_DATE,
).map(buildDay);

/** 按日期索引的日级事实记录，键为 YYYY-MM-DD。 */
export const XIAOCHEN_DAILY_RECORDS: Record<string, XiaochenDailyRecord> = Object.fromEntries(
  XIAOCHEN_DAILY_ALL_DAYS.map((day) => [day.date, day]),
);
