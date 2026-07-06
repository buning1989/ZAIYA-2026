/* —— 「回头看看」本地 mock 数据 ——
 * 仅前端 Demo 使用，不接后端 / 不做登录态 / 不做存储。
 *
 * 三组数据（7 / 14 / 30 天）由同一个确定性生成器按日期偏移产生，
 * 7 天是 14 天的子集，14 天是 30 天的子集，保证切换范围时数据连续。
 *
 * 生成器用基于日期的简单 hash 产生稳定伪随机，避免每次刷新数据漂移。
 * 不模拟真实医疗数据，只构造接近生活痕迹的合理波动。 */

export type Mood = 1 | 2 | 3 | 4 | 5;

export type MealState = "yes" | "no" | "unknown";

export type MedState = "taken" | "missed" | "changed" | "unknown";

export type ActivityLevel = 0 | 1 | 2 | 3;

export type DailyLookbackData = {
  date: string; // YYYY-MM-DD
  displayDate: string; // 7月1日
  mood: Mood | null;
  moodWords: string[] | null; // 情绪词：烦躁、疲惫 …（仅当 mood 非 null 时可能有）
  moodTrigger: string | null; // 触发事件
  moodBody: string | null; // 身体感受
  moodNote: string | null; // 补充说明
  sleepTime: string | null; // "23:10" / "00:40" / "01:30"
  wakeTime: string | null; // "08:10"
  sleepDurationMin: number | null; // 睡眠时长（分钟）
  nightWake: string | null; // 夜醒
  wakeFeeling: string | null; // 醒后感受
  meals: {
    breakfast: MealState;
    lunch: MealState;
    dinner: MealState;
  };
  mealFeeling: string | null; // 饭后感受
  medication: {
    morning: MedState;
    evening: MedState;
  };
  medChangeNote: string | null; // 改动说明
  activityLevel: ActivityLevel | null;
  activityContent: string | null; // 活动内容
  activityNote: string | null; // 补充说明
  weight: number | null; // kg
};

export type LookbackRange = 7 | 14 | 30;

/* —— 基于日期的确定性 hash（同一日期永远产出同一组值）—— */
function dayHash(date: Date): number {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  // 简单线性同余，足够稳定
  let h = seed * 2654435761;
  h = (h ^ (h >>> 15)) >>> 0;
  h = (h * 2246822519) >>> 0;
  h = (h ^ (h >>> 13)) >>> 0;
  return h;
}

// 从 hash 派生 0..1 的若干独立分量
function derive(hash: number, salt: number): number {
  const x = (hash ^ (salt * 2654435761)) >>> 0;
  return (x % 10000) / 10000;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toDisplayDate(d: Date): string {
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function buildDay(offset: number): DailyLookbackData {
  // 以「今天」为 offset=0，往回取 offset 天
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  base.setDate(base.getDate() - offset);
  const h = dayHash(base);

  // 情绪：约 12% 概率未记录，否则 1-5，多数集中在 2-4
  const moodRoll = derive(h, 1);
  let mood: Mood | null;
  if (moodRoll < 0.12) {
    mood = null;
  } else if (moodRoll < 0.2) {
    mood = 1;
  } else if (moodRoll < 0.45) {
    mood = 2;
  } else if (moodRoll < 0.78) {
    mood = 3;
  } else if (moodRoll < 0.95) {
    mood = 4;
  } else {
    mood = 5;
  }

  // 入睡：约 15% 概率未记录，否则在 22:30 - 02:00 之间波动
  const sleepRoll = derive(h, 2);
  let sleepTime: string | null;
  if (sleepRoll < 0.15) {
    sleepTime = null;
  } else {
    // 22:30 = 1350 分钟，02:00 = 1560 分钟（跨日按当日小时显示）
    const minutes = 1350 + Math.floor(derive(h, 3) * 210);
    const hh = Math.floor(minutes / 60) % 24;
    const mm = minutes % 60;
    sleepTime = `${pad(hh)}:${pad(mm)}`;
  }

  // 三餐：早餐缺失较多，午餐晚餐相对稳定
  const breakfast: MealState =
    derive(h, 4) < 0.4 ? "no" : derive(h, 4) < 0.5 ? "unknown" : "yes";
  const lunch: MealState =
    derive(h, 5) < 0.18 ? "no" : derive(h, 5) < 0.25 ? "unknown" : "yes";
  const dinner: MealState =
    derive(h, 6) < 0.15 ? "no" : derive(h, 6) < 0.22 ? "unknown" : "yes";

  // 服药：早 / 晚，taken 为主，偶有 missed / changed / unknown
  const medRoll = (salt: number): MedState => {
    const r = derive(h, salt);
    if (r < 0.78) return "taken";
    if (r < 0.88) return "missed";
    if (r < 0.95) return "changed";
    return "unknown";
  };

  // 活动：约 18% 概率未记录，否则 0-3，多数 1-2
  const actRoll = derive(h, 7);
  let activityLevel: ActivityLevel | null;
  if (actRoll < 0.18) {
    activityLevel = null;
  } else if (actRoll < 0.42) {
    activityLevel = 0;
  } else if (actRoll < 0.74) {
    activityLevel = 1;
  } else if (actRoll < 0.93) {
    activityLevel = 2;
  } else {
    activityLevel = 3;
  }

  // 体重：约 20% 概率未记录，否则在 50.5 - 52.5 之间缓慢波动
  const weightRoll = derive(h, 8);
  let weight: number | null;
  if (weightRoll < 0.2) {
    weight = null;
  } else {
    // 用 offset 做一个缓慢的周期波动，再加微小噪声
    const wave = Math.sin(offset / 6) * 0.6;
    const noise = (derive(h, 9) - 0.5) * 0.4;
    weight = Math.round((51.5 + wave + noise) * 10) / 10;
  }

  /* —— 详情抽屉补充字段 —— */
  const moodWordPool = ["烦躁", "疲惫", "低落", "平静", "踏实", "紧绷", "松弛", "空虚", "安稳", "易怒"];
  const moodTriggerPool = ["和家人争吵", "工作压力大", "睡眠不好", "无特别原因", "和朋友聊天", "天气阴沉", "完成任务后", "身体不适"];
  const moodBodyPool = ["胸闷", "头胀", "肩膀紧", "无特别感受", "乏力", "心悸", "放松"];
  const moodNotePool = ["下午稍微好转", "整天都比较闷", "晚上散步后好一些", "记录时已平静", ""];

  // 情绪详情：仅当 mood 非 null 时填充，部分字段可空
  let moodWords: string[] | null = null;
  let moodTrigger: string | null = null;
  let moodBody: string | null = null;
  let moodNote: string | null = null;
  if (mood !== null) {
    // 选 1-2 个情绪词
    const w1 = Math.floor(derive(h, 20) * moodWordPool.length);
    const w2 = Math.floor(derive(h, 21) * moodWordPool.length);
    moodWords = w1 === w2
      ? [moodWordPool[w1]]
      : [moodWordPool[w1], moodWordPool[w2]];
    // 约 60% 概率有触发事件
    moodTrigger = derive(h, 22) < 0.6 ? moodTriggerPool[w1 % moodTriggerPool.length] : null;
    // 约 50% 概率有身体感受
    moodBody = derive(h, 23) < 0.5 ? moodBodyPool[w2 % moodBodyPool.length] : null;
    // 约 40% 概率有补充说明
    moodNote = derive(h, 24) < 0.4 ? moodNotePool[w1 % moodNotePool.length] : null;
  }

  // 入睡详情：仅当 sleepTime 非 null 时填充
  let wakeTime: string | null = null;
  let sleepDurationMin: number | null = null;
  let nightWake: string | null = null;
  let wakeFeeling: string | null = null;
  if (sleepTime !== null) {
    // 醒来时间 06:30 - 09:30
    const wakeMin = 390 + Math.floor(derive(h, 30) * 180);
    wakeTime = `${pad(Math.floor(wakeMin / 60) % 24)}:${pad(wakeMin % 60)}`;
    // 时长 = 醒来 - 入睡（处理跨日）
    const [sh, sm] = sleepTime.split(":").map(Number);
    let sMin = sh * 60 + sm;
    if (sMin < 6 * 60) sMin += 24 * 60; // 凌晨入睡视为前一晚延续
    sleepDurationMin = wakeMin + 24 * 60 - sMin;
    if (sleepDurationMin > 12 * 60) sleepDurationMin -= 24 * 60;
    // 夜醒：约 30% 概率有
    nightWake = derive(h, 31) < 0.3 ? "1 次" : null;
    // 醒后感受：约 40% 概率有
    const wakeFeelPool = ["还行", "有点累", "没睡够", "精神不错", ""];
    const wf = wakeFeelPool[Math.floor(derive(h, 32) * wakeFeelPool.length)];
    wakeFeeling = wf || null;
  }

  // 三餐详情：饭后感受约 25% 概率有
  const mealFeelPool = ["还好", "有点撑", "想吃更多", "没什么特别", ""];
  const mealFeeling: string | null = derive(h, 40) < 0.25
    ? mealFeelPool[Math.floor(derive(h, 41) * mealFeelPool.length)]
    : null;

  // 服药详情：改动说明仅当存在 changed 状态时可能填充
  const medMorning = medRoll(10);
  const medEvening = medRoll(11);
  const hasChanged = medMorning === "changed" || medEvening === "changed";
  const medChangePool = ["剂量调整", "时间改动", "种类调整", ""];
  const medChangeNote: string | null = hasChanged && derive(h, 50) < 0.7
    ? medChangePool[Math.floor(derive(h, 51) * medChangePool.length)]
    : null;

  // 活动详情：仅当 activityLevel 非 null 且 > 0 时可能有活动内容
  let activityContent: string | null = null;
  let activityNote: string | null = null;
  if (activityLevel !== null && activityLevel > 0) {
    const contentPool = [
      "出门买东西", "散步", "和朋友吃饭", "做了家务", "去公园走走",
      "处理了一件小事", "参加了聚会", "完成了一项任务", "去医院复诊", "看了场电影",
    ];
    activityContent = contentPool[Math.floor(derive(h, 60) * contentPool.length)];
    // 约 30% 概率有补充说明
    const notePool = ["感觉还不错", "有点累但完成了", "", "", ""];
    const an = notePool[Math.floor(derive(h, 61) * notePool.length)];
    activityNote = an || null;
  }

  return {
    date: toDate(base),
    displayDate: toDisplayDate(base),
    mood,
    moodWords,
    moodTrigger,
    moodBody,
    moodNote,
    sleepTime,
    wakeTime,
    sleepDurationMin,
    nightWake,
    wakeFeeling,
    meals: { breakfast, lunch, dinner },
    mealFeeling,
    medication: { morning: medMorning, evening: medEvening },
    medChangeNote,
    activityLevel,
    activityContent,
    activityNote,
    weight,
  };
}

function buildRange(days: number): DailyLookbackData[] {
  // 按日期升序排列：最早 → 最近（左 → 右）
  const out: DailyLookbackData[] = [];
  for (let i = days - 1; i >= 0; i--) {
    out.push(buildDay(i));
  }
  return out;
}

export const lookbackData: Record<LookbackRange, DailyLookbackData[]> = {
  7: buildRange(7),
  14: buildRange(14),
  30: buildRange(30),
};

/* —— 文案映射：用于底部浮层展示当天事实值 —— */
export const moodLabel: Record<Mood, string> = {
  1: "1/5",
  2: "2/5",
  3: "3/5",
  4: "4/5",
  5: "5/5",
};

export const mealLabel: Record<MealState, string> = {
  yes: "有",
  no: "无",
  unknown: "未记录",
};

export const medLabel: Record<MedState, string> = {
  taken: "已服用",
  missed: "漏服",
  changed: "改动",
  unknown: "未记录",
};

export const activityLabel: Record<ActivityLevel, string> = {
  0: "无明显活动",
  1: "轻微活动",
  2: "完成一件事",
  3: "参与较多",
};
