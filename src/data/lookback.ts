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

/* —— 单条情绪记录（日内可有多条）—— */
export type MoodEntry = {
  time: string; // "HH:MM"
  mood: Mood;
  moodWords: string[] | null;
  moodTrigger: string | null;
  moodBody: string | null;
  moodNote: string | null;
  // 特殊情况（与「记一下」情绪保存态字段对齐）：如「吃东西/体重这件事最近有变化：吃不下」
  moodSpecial: string | null;
};

/* —— 单条饮食记录（日内可有多条，与「记一下」饮食保存态字段对齐）—— */
export type MealEntry = {
  mealType: string; // 早餐 / 午餐 / 晚餐 / 加餐
  food: string | null; // 吃了什么
  feeling: string | null; // 吃完后的感受
  time: string; // "HH:MM" 记录时间
  note: string | null; // 补充说明
};

/* —— 单条服用记录（日内可有多条，与「记一下」服用保存态字段对齐）—— */
export type MedEntry = {
  slot: string; // 早上的药 / 晚上的药（时段）
  slotTime: string; // "HH:MM" 服药时间
  effectTime: string | null; // 起效
  feeling: string | null; // 感受
  time: string; // "HH:MM" 记录时间
  note: string | null; // 补充说明
};

export type DailyLookbackData = {
  date: string; // YYYY-MM-DD
  displayDate: string; // 7月1日
  mood: Mood | null;
  moodWords: string[] | null; // 情绪词：烦躁、疲惫 …（仅当 mood 非 null 时可能有）
  moodTrigger: string | null; // 触发事件
  moodBody: string | null; // 身体感受（详情态不再展示，保留用于汇总聚合）
  moodNote: string | null; // 补充说明
  moodEntries: MoodEntry[] | null; // 日内多条情绪记录；null = 当天无记录
  sleepTime: string | null; // "23:10" / "00:40" / "01:30"（入睡，HH:MM）
  wakeTime: string | null; // "08:10"（醒来/起床，HH:MM）
  sleepDurationMin: number | null; // 睡眠时长（分钟）
  nightWake: string | null; // 夜醒
  wakeFeeling: string | null; // 醒后感受
  sleepLevel: 1 | 2 | 3 | null; // 睡眠情况：3 好 / 2 一般 / 1 不好
  sleepBedTime: string | null; // 上床（口语化 label，与「记一下」对齐）
  sleepNote: string | null; // 补充说明
  sleepRecordTime: string | null; // "HH:MM" 记录时间
  meals: {
    breakfast: MealState;
    lunch: MealState;
    dinner: MealState;
  };
  mealFeeling: string | null; // 饭后感受
  mealEntries: MealEntry[] | null; // 日内多条饮食记录；null = 当天无记录
  medication: {
    morning: MedState;
    evening: MedState;
  };
  medChangeNote: string | null; // 改动说明
  medEntries: MedEntry[] | null; // 日内多条服用记录；null = 当天无记录
  activityLevel: ActivityLevel | null;
  activityContent: string | null; // 活动内容
  activityNote: string | null; // 补充说明
  activityDuration: string | null; // 活动时长 / 强度
  activityFeeling: string | null; // 活动后的感受
  activityRecordTime: string | null; // "HH:MM" 记录时间
  weight: number | null; // kg
  weightMeasureContext: string | null; // 场景
  weightNote: string | null; // 补充说明
  weightRecordTime: string | null; // "HH:MM" 记录时间
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

/* —— 由 hash 派生一个稳定的 "HH:MM" 时间字符串（分钟区间内）—— */
function genTimeStr(hash: number, salt: number, minMin: number, maxMin: number): string {
  const t = minMin + Math.floor(derive(hash, salt) * (maxMin - minMin));
  return `${pad(Math.floor(t / 60) % 24)}:${pad(t % 60)}`;
}

function buildDayByDate(base: Date): DailyLookbackData {
  base = new Date(base);
  base.setHours(0, 0, 0, 0);
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
    // 用距今天数做一个缓慢的周期波动，再加微小噪声
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOffset = Math.round((today.getTime() - base.getTime()) / 86400000);
    const wave = Math.sin(dayOffset / 6) * 0.6;
    const noise = (derive(h, 9) - 0.5) * 0.4;
    weight = Math.round((51.5 + wave + noise) * 10) / 10;
  }

  /* —— 详情抽屉补充字段 —— */
  const moodWordPool = ["烦躁", "疲惫", "低落", "平静", "踏实", "紧绷", "松弛", "空虚", "安稳", "易怒"];
  const moodTriggerPool = ["和家人争吵", "工作压力大", "睡眠不好", "无特别原因", "和朋友聊天", "天气阴沉", "完成任务后", "身体不适"];
  const moodBodyPool = ["胸闷", "头胀", "肩膀紧", "无特别感受", "乏力", "心悸", "放松"];
  const moodNotePool = ["下午稍微好转", "整天都比较闷", "晚上散步后好一些", "记录时已平静", ""];
  // 特殊情况（与「记一下」specialSituationCategories 对齐，组合成「大类：细项」）
  const moodSpecialPool = [
    "吃东西/体重这件事最近有变化：吃不下",
    "吃东西/体重这件事最近有变化：很怕变胖",
    "最近状态和平时很不一样：睡很少也不困",
    "最近状态和平时很不一样：特别容易发火",
    "反复冒出来的想法/忍不住要做的事：脑子反复冒出不想要的想法",
  ];

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

  // 日内多条情绪记录：仅当 mood 非 null 时生成 1-3 条
  let moodEntries: MoodEntry[] | null = null;
  if (mood !== null) {
    // 约 30% 概率只有 1 条，其余 2-3 条
    const countRoll = derive(h, 25);
    const entryCount = countRoll < 0.30 ? 1 : countRoll < 0.75 ? 2 : 3;
    const timeSlots = [
      // 早 / 午 / 晚三个时段的基础分钟数
      [540, 660],   // 09:00-11:00
      [780, 900],   // 13:00-15:00
      [1200, 1320], // 20:00-22:00
    ];
    const entries: MoodEntry[] = [];
    for (let ei = 0; ei < entryCount; ei++) {
      const [tMin, tMax] = timeSlots[ei];
      const t = tMin + Math.floor(derive(h, 70 + ei) * (tMax - tMin));
      const ehh = Math.floor(t / 60);
      const emm = t % 60;
      const time = `${pad(ehh)}:${pad(emm)}`;
      // 情绪值：围绕当天主 mood 小幅波动
      const drift = Math.floor(derive(h, 80 + ei) * 3) - 1; // -1..1
      const eMood = Math.max(1, Math.min(5, (mood as number) + drift)) as Mood;
      // 情绪词
      const ew1 = Math.floor(derive(h, 90 + ei * 2) * moodWordPool.length);
      const ew2 = Math.floor(derive(h, 91 + ei * 2) * moodWordPool.length);
      const eMoodWords = ew1 === ew2
        ? [moodWordPool[ew1]]
        : [moodWordPool[ew1], moodWordPool[ew2]];
      // 触发事件 / 身体感受 / 补充说明（概率递减）
      const eTrigger = derive(h, 100 + ei) < 0.5 ? moodTriggerPool[ew1 % moodTriggerPool.length] : null;
      const eBody = derive(h, 110 + ei) < 0.4 ? moodBodyPool[ew2 % moodBodyPool.length] : null;
      const eNote = derive(h, 120 + ei) < 0.3 ? moodNotePool[ew1 % moodNotePool.length] : null;
      // 特殊情况：约 25% 概率有（与「记一下」字段对齐）
      const eSpecial = derive(h, 130 + ei) < 0.25 ? moodSpecialPool[ew1 % moodSpecialPool.length] : null;
      entries.push({
        time,
        mood: eMood,
        moodWords: eMoodWords,
        moodTrigger: eTrigger,
        moodBody: eBody,
        moodNote: eNote || null,
        moodSpecial: eSpecial,
      });
    }
    // 按时间升序
    entries.sort((a, b) => a.time.localeCompare(b.time));
    moodEntries = entries;
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

  /* —— 睡眠单条记录字段（与「记一下」睡眠保存态对齐）—— */
  let sleepLevel: 1 | 2 | 3 | null = null;
  let sleepBedTime: string | null = null;
  let sleepNote: string | null = null;
  let sleepRecordTime: string | null = null;
  if (sleepTime !== null) {
    // 睡眠情况：3 好 / 2 一般 / 1 不好，与时长轻度相关
    const durRoll = derive(h, 33);
    if (sleepDurationMin !== null && sleepDurationMin >= 7 * 60) sleepLevel = durRoll < 0.3 ? 2 : 3;
    else if (sleepDurationMin !== null && sleepDurationMin < 5 * 60) sleepLevel = durRoll < 0.3 ? 2 : 1;
    else sleepLevel = durRoll < 0.45 ? 3 : durRoll < 0.85 ? 2 : 1;
    // 上床时间（口语化 label，略早于入睡）
    const bedPool = ["晚上9点多", "晚上10点多", "晚上11点多", "凌晨0点多"];
    sleepBedTime = bedPool[Math.floor(derive(h, 34) * bedPool.length)];
    // 补充说明：约 25% 概率有
    const sleepNotePool = ["做了个梦", "中途醒过一次", "睡前看了很久手机", ""];
    sleepNote = derive(h, 35) < 0.25 ? sleepNotePool[Math.floor(derive(h, 36) * sleepNotePool.length)] || null : null;
    // 记录时间：醒来后不久
    sleepRecordTime = genTimeStr(h, 37, 390, 480);
  }

  /* —— 饮食单条记录（日内多条，与「记一下」饮食保存态对齐）—— */
  const mealFoodPool: Record<"breakfast" | "lunch" | "dinner", string[]> = {
    breakfast: ["粥、鸡蛋", "面包、牛奶", "包子、豆浆", "面条"],
    lunch: ["米饭配菜", "面食", "食堂套餐", "轻食"],
    dinner: ["家常菜", "清淡少油", "粥", "吃得很少"],
  };
  const mealFeelPool2 = ["舒服", "满足", "吃撑了", "胃胀", "没什么感觉"];
  const mealTypeLabels: Record<"breakfast" | "lunch" | "dinner", string> = {
    breakfast: "早餐", lunch: "午餐", dinner: "晚餐",
  };
  const mealTimeRange: Record<"breakfast" | "lunch" | "dinner", [number, number]> = {
    breakfast: [450, 510], lunch: [720, 780], dinner: [1080, 1140],
  };
  const mealEntries: MealEntry[] = [];
  (["breakfast", "lunch", "dinner"] as const).forEach((mt, mi) => {
    const state = mt === "breakfast" ? breakfast : mt === "lunch" ? lunch : dinner;
    if (state !== "yes") return;
    const food = mealFoodPool[mt][Math.floor(derive(h, 200 + mi) * mealFoodPool[mt].length)];
    const hasFeeling = derive(h, 210 + mi) < 0.5;
    const feeling = hasFeeling ? mealFeelPool2[Math.floor(derive(h, 220 + mi) * mealFeelPool2.length)] : null;
    const [tMin, tMax] = mealTimeRange[mt];
    const time = genTimeStr(h, 230 + mi, tMin, tMax);
    const hasNote = derive(h, 240 + mi) < 0.2;
    const note = hasNote ? "吃得有点急" : null;
    mealEntries.push({ mealType: mealTypeLabels[mt], food, feeling, time, note });
  });
  const mealEntriesFinal: MealEntry[] | null = mealEntries.length > 0 ? mealEntries : null;

  /* —— 服用单条记录（日内多条，与「记一下」服用保存态对齐）—— */
  const effectTimePool = ["半小时", "1 小时", "1.5 小时", "2 小时", "没感觉"];
  const medFeelPool = ["嗜睡", "口干", "头晕", "恶心", "没有感受"];
  const medSlotLabels: Record<"morning" | "evening", { label: string; time: string }> = {
    morning: { label: "早上的药", time: "08:00" },
    evening: { label: "晚上的药", time: "20:00" },
  };
  const medEntries: MedEntry[] = [];
  (["morning", "evening"] as const).forEach((sl, si) => {
    const st = sl === "morning" ? medMorning : medEvening;
    if (st === "unknown") return;
    const cfg = medSlotLabels[sl];
    let effectTime: string | null = null;
    let feeling: string | null = null;
    let note: string | null = null;
    if (st === "taken" || st === "changed") {
      effectTime = derive(h, 300 + si) < 0.7 ? effectTimePool[Math.floor(derive(h, 310 + si) * effectTimePool.length)] : null;
      feeling = derive(h, 320 + si) < 0.6 ? medFeelPool[Math.floor(derive(h, 330 + si) * medFeelPool.length)] : null;
      note = derive(h, 340 + si) < 0.25 ? "吃完稍微有点困" : null;
    } else {
      // 漏服：无起效 / 感受
      note = derive(h, 340 + si) < 0.5 ? "漏服了" : null;
    }
    // 记录时间：服药后不久
    const baseMin = sl === "morning" ? 480 : 1200;
    const time = genTimeStr(h, 350 + si, baseMin, baseMin + 60);
    medEntries.push({ slot: cfg.label, slotTime: cfg.time, effectTime, feeling, time, note });
  });
  const medEntriesFinal: MedEntry[] | null = medEntries.length > 0 ? medEntries : null;

  /* —— 活动单条记录补充字段（与「记一下」活动保存态对齐）—— */
  let activityDuration: string | null = null;
  let activityFeeling: string | null = null;
  let activityRecordTime: string | null = null;
  if (activityLevel !== null && activityLevel > 0) {
    const durationPool = ["不到 10 分钟", "10–30 分钟", "30–60 分钟", "1 小时以上"];
    activityDuration = durationPool[Math.floor(derive(h, 62) * durationPool.length)];
    const actFeelPool = ["轻松了一点", "还可以", "有点累", "没什么感觉"];
    activityFeeling = derive(h, 63) < 0.7 ? actFeelPool[Math.floor(derive(h, 64) * actFeelPool.length)] : null;
    activityRecordTime = genTimeStr(h, 65, 840, 1080); // 下午 14:00-18:00
  }

  /* —— 体重单条记录补充字段（与「记一下」体重保存态对齐）—— */
  let weightMeasureContext: string | null = null;
  let weightNote: string | null = null;
  let weightRecordTime: string | null = null;
  if (weight !== null) {
    const ctxPool = ["起床后", "饭前", "饭后", "晚上", "随手称的"];
    weightMeasureContext = ctxPool[Math.floor(derive(h, 90) * ctxPool.length)];
    weightNote = derive(h, 91) < 0.2 ? "穿着外套称的" : null;
    weightRecordTime = genTimeStr(h, 92, 450, 540); // 早上 07:30-09:00
  }

  return {
    date: toDate(base),
    displayDate: toDisplayDate(base),
    mood,
    moodWords,
    moodTrigger,
    moodBody,
    moodNote,
    moodEntries,
    sleepTime,
    wakeTime,
    sleepDurationMin,
    nightWake,
    wakeFeeling,
    sleepLevel,
    sleepBedTime,
    sleepNote,
    sleepRecordTime,
    meals: { breakfast, lunch, dinner },
    mealFeeling,
    mealEntries: mealEntriesFinal,
    medication: { morning: medMorning, evening: medEvening },
    medChangeNote,
    medEntries: medEntriesFinal,
    activityLevel,
    activityContent,
    activityNote,
    activityDuration,
    activityFeeling,
    activityRecordTime,
    weight,
    weightMeasureContext,
    weightNote,
    weightRecordTime,
  };
}

function buildRange(days: number, referenceDate = new Date()): DailyLookbackData[] {
  // 按日期升序排列：最早 → 最近（左 → 右）
  const out: DailyLookbackData[] = [];
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push(buildDayByDate(d));
  }
  return out;
}

/* —— 按月生成数据：生成指定 year/month 的所有日期（升序）——
 * 未来日期（晚于今天）不生成，避免出现「未来记录」。
 * 当月只生成到今天；历史月份生成整月。 */
export function buildMonthRange(
  year: number,
  month: number,
  referenceDate = new Date(),
): DailyLookbackData[] {
  // month: 1-12
  const out: DailyLookbackData[] = [];
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  const daysInMonth = new Date(year, month, 0).getDate(); // month 是 1-based，day=0 取上月末
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    if (d > today) break; // 未来日期不生成
    out.push(buildDayByDate(d));
  }
  return out;
}

/* —— 判断某月是否有记录（至少一条 DailyLookbackData 有任意记录字段）——
 * 用于「按月回看」空状态判断。Demo 阶段只要该月有生成日期即视为有记录，
 * 因为 buildDayByDate 会按概率产生未记录项，但仍属于「有记录的日期」。 */
function monthHasRecords(year: number, month: number): boolean {
  const data = buildMonthRange(year, month);
  return data.length > 0;
}

/* —— 按周生成数据：从 weekStart（周一）开始生成 7 天（升序）——
 * 未来日期（晚于今天）不生成。当前周只生成到今天。 */
export function buildWeekRange(
  weekStart: Date,
  referenceDate = new Date(),
): DailyLookbackData[] {
  const out: DailyLookbackData[] = [];
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    if (d > today) break; // 未来日期不生成
    out.push(buildDayByDate(d));
  }
  return out;
}

/* —— 计算某日期所在周的周一（中国习惯：周一开始）—— */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=周日, 1=周一 ... 6=周六
  const diff = day === 0 ? -6 : 1 - day; // 周日回到上个周一
  d.setDate(d.getDate() + diff);
  return d;
}

export const lookbackData: Record<LookbackRange, DailyLookbackData[]> = {
  7: buildRange(7),
  14: buildRange(14),
  30: buildRange(30),
};

/* —— 文案映射：用于底部浮层展示当天事实值 —— */
const moodLabel: Record<Mood, string> = {
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

const medLabel: Record<MedState, string> = {
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

/* —— 睡眠情况 label：3 好 / 2 一般 / 1 不好（与「记一下」sleepLevelLabel 对齐）—— */
export const sleepLevelLabel: Record<1 | 2 | 3, string> = {
  3: "好",
  2: "一般",
  1: "不好",
};
