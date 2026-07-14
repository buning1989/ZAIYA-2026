/* —— 小晨体验模式统一数据源：33 天每日记录 ——
 *
 * 24 个有有效记录的日期，每个日期包含六类数据（情绪/睡眠/饮食/用药/活动/体重）
 * 的子集。不是每天都有六类完整数据。
 *
 * 9 个无有效记录的日期由 buildUnrecordedDay() 生成空记录。
 *
 * 所有日期、事件和统计数字必须与 constants.ts 保持一致。 */
import type { DailyLookbackData, Mood, MealState, MedState, ActivityLevel, MoodEntry, MealEntry, MedEntry } from "@/data/lookback";
import {
  PERIOD_START,
  PERIOD_END,
  XIAOCHEN_RECORDED_DATE_KEYS,
  MISSED_MED_DATES,
  NO_SCHOOL_DATES,
  WEIGHT_RECORDS,
} from "./constants";

/* —— 辅助函数 —— */

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toDisplayDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-").map(Number);
  return `${m}月${d}日`;
}

function isMissedMed(dateStr: string): boolean {
  return (MISSED_MED_DATES as readonly string[]).includes(dateStr);
}

function isNoSchool(dateStr: string): boolean {
  return (NO_SCHOOL_DATES as readonly string[]).includes(dateStr);
}

function getWeightForDate(dateStr: string): number | null {
  const rec = WEIGHT_RECORDS.find((r) => r.date === dateStr);
  return rec ? rec.weightKg : null;
}

/** 计算睡眠时长（分钟） */
function calcSleepDuration(sleepTime: string, wakeTime: string): number {
  const [sh, sm] = sleepTime.split(":").map(Number);
  const [wh, wm] = wakeTime.split(":").map(Number);
  let sMin = sh * 60 + sm;
  const wMin = wh * 60 + wm;
  if (sMin > 12 * 60) sMin -= 24 * 60; // 凌晨入睡视为前一日
  let dur = wMin - sMin;
  if (dur < 0) dur += 24 * 60;
  return dur;
}

/** 根据睡眠时长推导 sleepLevel */
function deriveSleepLevel(durationMin: number): 1 | 2 | 3 {
  if (durationMin >= 7 * 60) return 3;
  if (durationMin >= 5 * 60) return 2;
  return 1;
}

/* —— 紧凑日记录入参 —— */
interface DayInput {
  date: string;
  mood: Mood;
  moodWords: string[];
  moodTrigger?: string | null;
  moodNote?: string | null;
  sleepTime: string | null;
  wakeTime?: string | null;
  sleepNote?: string | null;
  breakfast?: MealState;
  lunch?: MealState;
  dinner?: MealState;
  mealFeeling?: string | null;
  medMorning?: MedState; // 默认 taken，漏服日为 missed
  activityLevel?: ActivityLevel | null;
  activityContent?: string | null;
  activityFeeling?: string | null;
  weightNote?: string | null;
  // 标记字段（不直接进入 DailyLookbackData，但用于构建 moodEntries 等）
  drowsiness?: boolean;
  familyConflict?: boolean;
  negativeThought?: boolean;
  breathingExercise?: boolean;
}

/** 构建单日完整 DailyLookbackData */
function buildRecordedDay(input: DayInput): DailyLookbackData {
  const dateStr = input.date;
  const medMorning: MedState = input.medMorning ?? (isMissedMed(dateStr) ? "missed" : "taken");
  const medEvening: MedState = "unknown"; // 小晨仅早晨服药，晚间始终 unknown

  const breakfast: MealState = input.breakfast ?? "no";
  const lunch: MealState = input.lunch ?? "yes";
  const dinner: MealState = input.dinner ?? "yes";

  const weight = getWeightForDate(dateStr);

  // 睡眠派生字段
  let wakeTime: string | null = input.wakeTime ?? null;
  let sleepDurationMin: number | null = null;
  let sleepLevel: 1 | 2 | 3 | null = null;
  let sleepBedTime: string | null = null;
  let sleepRecordTime: string | null = null;

  if (input.sleepTime) {
    wakeTime = wakeTime ?? (isNoSchool(dateStr) ? "10:30" : "07:00");
    sleepDurationMin = calcSleepDuration(input.sleepTime, wakeTime);
    sleepLevel = deriveSleepLevel(sleepDurationMin);
    // 上床时间口语化
    const [sh] = input.sleepTime.split(":").map(Number);
    if (sh >= 23 || sh === 0) sleepBedTime = sh >= 23 ? "晚上11点多" : "凌晨0点多";
    else if (sh >= 1 && sh < 3) sleepBedTime = `凌晨${sh}点多`;
    else sleepBedTime = "晚上10点多";
    sleepRecordTime = wakeTime;
  }

  // 情绪条目（仅关键日生成详细条目）
  let moodEntries: MoodEntry[] | null = null;
  if (input.negativeThought) {
    moodEntries = [
      {
        time: dateStr === "2026-06-24" ? "01:32" : "01:48",
        mood: 1,
        moodWords: input.moodWords,
        moodTrigger: input.moodTrigger ?? null,
        moodBody: "胸闷",
        moodNote: input.moodNote ?? null,
        moodSpecial: null,
      },
    ];
  } else if (input.breathingExercise) {
    moodEntries = [
      {
        time: "01:20",
        mood: 2,
        moodWords: ["紧张", "疲惫"],
        moodTrigger: "睡不着",
        moodBody: "心悸",
        moodNote: "还是睡不着，但好一点点",
        moodSpecial: null,
      },
    ];
  }

  // 饮食条目（仅有一天一餐或早餐日生成详细条目）
  let mealEntries: MealEntry[] | null = null;
  const mealEntriesArr: MealEntry[] = [];
  if (breakfast === "yes") {
    mealEntriesArr.push({
      mealType: "早餐",
      food: "包子",
      feeling: input.mealFeeling ?? null,
      time: "07:20",
      note: null,
    });
  }
  if (lunch === "yes") {
    mealEntriesArr.push({
      mealType: "午餐",
      food: input.dinner === "no" ? "食堂套餐" : "米饭配菜",
      feeling: null,
      time: isNoSchool(dateStr) ? "13:00" : "12:10",
      note: null,
    });
  }
  if (dinner === "yes") {
    mealEntriesArr.push({
      mealType: "晚餐",
      food: "家常菜",
      feeling: null,
      time: "18:30",
      note: null,
    });
  }
  mealEntries = mealEntriesArr.length > 0 ? mealEntriesArr : null;

  // 服药条目
  let medEntries: MedEntry[] | null = null;
  if (medMorning !== "unknown") {
    const medEntry: MedEntry = {
      slot: "早上的药",
      slotTime: isNoSchool(dateStr) ? "10:00" : "07:00",
      effectTime: medMorning === "taken" ? "1 小时" : null,
      feeling: medMorning === "taken" ? (input.drowsiness ? "嗜睡" : null) : null,
      time: medMorning === "taken" ? (isNoSchool(dateStr) ? "10:05" : "07:05") : "12:00",
      note: medMorning === "missed" ? "漏服了" : null,
    };
    medEntries = [medEntry];
  }

  // 活动详情
  let activityDuration: string | null = null;
  let activityRecordTime: string | null = null;
  if (input.activityLevel != null && input.activityLevel > 0) {
    activityDuration = input.breathingExercise ? "10–30 分钟" : "不到 10 分钟";
    activityRecordTime = input.breathingExercise ? "01:25" : "16:00";
  }

  // 体重详情
  let weightMeasureContext: string | null = null;
  let weightRecordTime: string | null = null;
  if (weight !== null) {
    weightMeasureContext = "起床后";
    weightRecordTime = "07:30";
  }

  return {
    date: dateStr,
    displayDate: toDisplayDate(dateStr),
    mood: input.mood,
    moodWords: input.moodWords,
    moodTrigger: input.moodTrigger ?? null,
    moodBody: input.drowsiness ? "乏力" : null,
    moodNote: input.moodNote ?? null,
    moodEntries,
    sleepTime: input.sleepTime,
    wakeTime,
    sleepDurationMin,
    nightWake: null,
    wakeFeeling: sleepLevel === 3 ? "还行" : sleepLevel === 2 ? "没睡够" : "很累",
    sleepLevel,
    sleepBedTime,
    sleepNote: input.sleepNote ?? null,
    sleepRecordTime,
    meals: { breakfast, lunch, dinner },
    mealFeeling: input.mealFeeling ?? null,
    mealEntries,
    medication: { morning: medMorning, evening: medEvening },
    medChangeNote: null,
    medEntries,
    activityLevel: input.activityLevel ?? null,
    activityContent: input.activityContent ?? null,
    activityNote: null,
    activityDuration,
    activityFeeling: input.activityFeeling ?? null,
    activityRecordTime,
    weight,
    weightMeasureContext,
    weightNote: input.weightNote ?? null,
    weightRecordTime,
  };
}

/** 构建无有效记录日 */
function buildUnrecordedDay(dateStr: string): DailyLookbackData {
  return {
    date: dateStr,
    displayDate: toDisplayDate(dateStr),
    mood: null,
    moodWords: null,
    moodTrigger: null,
    moodBody: null,
    moodNote: null,
    moodEntries: null,
    sleepTime: null,
    wakeTime: null,
    sleepDurationMin: null,
    nightWake: null,
    wakeFeeling: null,
    sleepLevel: null,
    sleepBedTime: null,
    sleepNote: null,
    sleepRecordTime: null,
    meals: { breakfast: "unknown" as MealState, lunch: "unknown" as MealState, dinner: "unknown" as MealState },
    mealFeeling: null,
    mealEntries: null,
    medication: { morning: "unknown" as MedState, evening: "unknown" as MedState },
    medChangeNote: null,
    medEntries: null,
    activityLevel: null,
    activityContent: null,
    activityNote: null,
    activityDuration: null,
    activityFeeling: null,
    activityRecordTime: null,
    weight: null,
    weightMeasureContext: null,
    weightNote: null,
    weightRecordTime: null,
  };
}

/* —— 24 个有有效记录的日期数据 —— */

const dayInputs: DayInput[] = [
  // 6/15 周一 — 记录开始
  {
    date: "2026-06-15",
    mood: 3,
    moodWords: ["平静"],
    moodNote: "开始记一下",
    sleepTime: "01:20",
    drowsiness: true,
  },
  // 6/16 周二 — 体重记录 49.5kg
  {
    date: "2026-06-16",
    mood: 2,
    moodWords: ["疲惫", "低落"],
    moodTrigger: "睡眠不好",
    sleepTime: "01:45",
    activityLevel: 1,
    activityContent: "下楼取了个快递",
    weightNote: "最近好像轻了",
    drowsiness: true,
  },
  // 6/17 周三
  {
    date: "2026-06-17",
    mood: 2,
    moodWords: ["疲惫"],
    moodTrigger: "上课听不进去",
    sleepTime: "00:50",
    drowsiness: true,
  },
  // 6/19 周五 — 漏服
  {
    date: "2026-06-19",
    mood: 2,
    moodWords: ["烦躁", "疲惫"],
    moodTrigger: "作业没写完",
    sleepTime: "02:00",
    dinner: "no",
    medMorning: "missed",
    moodNote: "忘了吃药",
    drowsiness: true,
  },
  // 6/21 周日
  {
    date: "2026-06-21",
    mood: 3,
    moodWords: ["平静"],
    sleepTime: "01:30",
    activityLevel: 1,
    activityContent: "在家待着",
    drowsiness: false,
  },
  // 6/22 周一 — 未到校 + 家庭冲突 + 仅一餐
  {
    date: "2026-06-22",
    mood: 1,
    moodWords: ["低落", "紧绷"],
    moodTrigger: "和家人争吵",
    moodNote: "没去学校，妈妈很生气",
    sleepTime: "02:00",
    breakfast: "no",
    lunch: "yes",
    dinner: "no",
    activityLevel: 0,
    familyConflict: true,
    drowsiness: true,
  },
  // 6/23 周二 — 仅一餐 + 家庭冲突
  {
    date: "2026-06-23",
    mood: 2,
    moodWords: ["烦躁", "空虚"],
    moodTrigger: "和家人争吵",
    moodNote: "爸爸说我在找借口",
    sleepTime: "01:40",
    breakfast: "no",
    lunch: "yes",
    dinner: "no",
    activityLevel: 0,
    familyConflict: true,
    drowsiness: true,
  },
  // 6/24 周三 — 消极念头 #1 + 仅一餐
  {
    date: "2026-06-24",
    mood: 1,
    moodWords: ["低落", "空虚"],
    moodTrigger: "深夜反刍",
    moodNote: "好像怎么都撑不下去，但又说不上来撑不下去是什么意思",
    sleepTime: "02:10",
    breakfast: "no",
    lunch: "yes",
    dinner: "no",
    activityLevel: 0,
    negativeThought: true,
    drowsiness: true,
    sleepNote: "脑子里全是明天的课",
  },
  // 6/26 周五 — 仅一餐
  {
    date: "2026-06-26",
    mood: 2,
    moodWords: ["疲惫"],
    sleepTime: "01:30",
    breakfast: "no",
    lunch: "yes",
    dinner: "no",
    activityLevel: 0,
    drowsiness: true,
  },
  // 6/28 周日 — 漏服
  {
    date: "2026-06-28",
    mood: 2,
    moodWords: ["低落"],
    sleepTime: "01:50",
    medMorning: "missed",
    moodNote: "又忘了吃药",
    drowsiness: true,
  },
  // 6/29 周一 — 未到校 + 家庭冲突
  {
    date: "2026-06-29",
    mood: 1,
    moodWords: ["低落", "紧绷"],
    moodTrigger: "和家人争吵",
    moodNote: "又没去成学校",
    sleepTime: "02:00",
    dinner: "no",
    activityLevel: 0,
    familyConflict: true,
    drowsiness: true,
  },
  // 7/1 周三
  {
    date: "2026-07-01",
    mood: 2,
    moodWords: ["疲惫", "烦躁"],
    moodTrigger: "考试压力",
    sleepTime: "01:15",
    drowsiness: true,
  },
  // 7/2 周四 — 最晚入睡 03:10
  {
    date: "2026-07-02",
    mood: 1,
    moodWords: ["低落", "紧绷"],
    moodTrigger: "深夜反刍",
    moodNote: "脑子停不下来",
    sleepTime: "03:10",
    drowsiness: true,
    sleepNote: "落下的课程越想越焦虑",
  },
  // 7/3 周五 — 漏服
  {
    date: "2026-07-03",
    mood: 2,
    moodWords: ["疲惫"],
    sleepTime: "01:40",
    dinner: "no",
    medMorning: "missed",
    drowsiness: true,
  },
  // 7/4 周六 — 呼吸练习
  {
    date: "2026-07-04",
    mood: 2,
    moodWords: ["紧张", "疲惫"],
    moodTrigger: "睡不着",
    moodNote: "还是睡不着，但好一点点",
    sleepTime: "01:30",
    activityLevel: 1,
    activityContent: "跟着在在做了一次呼吸练习",
    activityFeeling: "稍微平静了一点",
    breathingExercise: true,
    drowsiness: false,
  },
  // 7/6 周一 — 消极念头 #2 + 家庭冲突
  {
    date: "2026-07-06",
    mood: 1,
    moodWords: ["低落", "烦躁"],
    moodTrigger: "和家人争吵",
    moodNote: "她说我就是在找借口，那种感觉又上来了",
    sleepTime: "02:00",
    dinner: "no",
    activityLevel: 0,
    familyConflict: true,
    negativeThought: true,
    drowsiness: true,
    sleepNote: "晚上又和妈妈因为上学的事吵了一架",
  },
  // 7/8 周三 — 未到校 + 家庭冲突
  {
    date: "2026-07-08",
    mood: 2,
    moodWords: ["低落", "紧绷"],
    moodTrigger: "和家人争吵",
    moodNote: "出门前动不了",
    sleepTime: "01:45",
    activityLevel: 0,
    familyConflict: true,
    drowsiness: true,
  },
  // 7/9 周四 — 零点前入睡 + 早餐
  {
    date: "2026-07-09",
    mood: 3,
    moodWords: ["平静"],
    moodNote: "稍微早了一点",
    sleepTime: "23:50",
    breakfast: "yes",
    lunch: "yes",
    dinner: "yes",
    activityLevel: 1,
    activityContent: "撑过了上午的课",
    activityFeeling: "还可以",
    drowsiness: false,
  },
  // 7/10 周五 — 零点前入睡 + 早餐 + 困倦
  {
    date: "2026-07-10",
    mood: 3,
    moodWords: ["踏实"],
    sleepTime: "23:35",
    breakfast: "yes",
    lunch: "yes",
    dinner: "yes",
    activityLevel: 1,
    activityContent: "上课",
    drowsiness: true,
    moodTrigger: "第二节课又困了",
  },
  // 7/11 周六 — 漏服
  {
    date: "2026-07-11",
    mood: 2,
    moodWords: ["疲惫"],
    sleepTime: "01:00",
    medMorning: "missed",
    drowsiness: true,
  },
  // 7/12 周日 — 体重记录 48.7kg
  {
    date: "2026-07-12",
    mood: 3,
    moodWords: ["平静"],
    moodNote: "把想问王医生的问题写下来了",
    sleepTime: "00:30",
    activityLevel: 1,
    activityContent: "整理了要问医生的问题",
    weightNote: "比上次轻了一点",
    drowsiness: false,
  },
  // 7/13 周一 — 未到校 + 家庭冲突
  {
    date: "2026-07-13",
    mood: 2,
    moodWords: ["低落", "烦躁"],
    moodTrigger: "和家人争吵",
    moodNote: "又没去成",
    sleepTime: "01:20",
    dinner: "no",
    activityLevel: 0,
    familyConflict: true,
    drowsiness: true,
  },
  // 7/14 周二 — 零点前入睡 + 早餐
  {
    date: "2026-07-14",
    mood: 3,
    moodWords: ["踏实", "松了一点"],
    moodNote: "今天好像没那么糟",
    sleepTime: "23:45",
    breakfast: "yes",
    lunch: "yes",
    dinner: "yes",
    activityLevel: 1,
    activityContent: "在学校待了一整天",
    activityFeeling: "有点累但还可以",
    drowsiness: false,
  },
  // 7/17 周五 — 参考日 + 复诊准备
  {
    date: "2026-07-17",
    mood: 3,
    moodWords: ["紧张", "平静"],
    moodNote: "明天复诊，不知道该说什么",
    sleepTime: "00:50",
    activityLevel: 1,
    activityContent: "打开了一直没看的数学卷子",
    activityFeeling: "只做了两道题",
    drowsiness: false,
  },
];

/* —— 构建 33 天完整数据 —— */

/** 24 个有有效记录的日期数据（按日期升序） */
export const XIAOCHEN_RECORDED_DAYS: DailyLookbackData[] = dayInputs.map(buildRecordedDay);

/** 9 个无有效记录的日期数据（按日期升序） */
export const XIAOCHEN_UNRECORDED_DAYS: DailyLookbackData[] = [];

// 生成无记录日
{
  const start = new Date(PERIOD_START + "T00:00:00+08:00");
  const end = new Date(PERIOD_END + "T00:00:00+08:00");
  const recordedSet = new Set<string>(XIAOCHEN_RECORDED_DATE_KEYS);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = toDateStr(d);
    if (!recordedSet.has(dateStr)) {
      XIAOCHEN_UNRECORDED_DAYS.push(buildUnrecordedDay(dateStr));
    }
  }
}

/** 33 天完整数据（按日期升序，有记录 + 无记录） */
export const XIAOCHEN_ALL_DAYS: DailyLookbackData[] = [...XIAOCHEN_RECORDED_DAYS, ...XIAOCHEN_UNRECORDED_DAYS].sort(
  (a, b) => a.date.localeCompare(b.date),
);

/** 按日期索引的记录数据（供 Selector 快速查找） */
export const XIAOCHEN_DAILY_RECORDS: Record<string, DailyLookbackData> = Object.fromEntries(
  XIAOCHEN_ALL_DAYS.map((d) => [d.date, d]),
);
