/* —— 「帮我整理」数据与生成逻辑（本地 mock，不接后端 / LLM）——
 *
 * 定位：把用户已有记录 + 本次主动补充整理成一份可检查、可删改、可选择分享的沟通准备单。
 *   - 不是诊断报告，不是 AI 心理分析
 *   - 整理单内容只来自三类来源：日常记录、本次补充、简单统计
 *   - 所有对外版本必须经过用户预览确认
 *   - 用户可决定给谁看、看哪些、隐藏哪些
 *
 * 数据源：复用 lookback.ts 的 mock 数据（不另造一套字段）。
 * 不在 mock 数据中强行加入学习、出勤、家庭、社交、考试、返校等结构化字段。 */

import { lookbackData, type DailyLookbackData } from "./lookback";

/* —— 整理对象 —— */
export type OrganizeAudience = "self" | "professional" | "parent" | "school";

/* —— 整理内容区块 —— */
export type OrganizeSectionId =
  | "mood"
  | "sleep"
  | "diet"
  | "medication"
  | "bodyFeeling"
  | "weight"
  | "freeText"
  | "dataCompleteness";

/* —— 自由文本展示模式 ——
 * original: 显示原文
 * summary:  仅显示摘要
 * hidden:   不包含 */
export type FreeTextMode = "original" | "summary" | "hidden";

/* —— 时间范围（天）—— */
export type OrganizeRange = 7 | 14 | 30;

/* —— 受众配置：默认勾选区块 + 自由文本模式 ——
 * 字段名按产品逻辑保持一致；实际取值由本文件统一管理。 */
export const ORGANIZE_AUDIENCE_CONFIG: Record<
  OrganizeAudience,
  {
    label: string;
    desc: string;
    defaultSections: OrganizeSectionId[];
    freeTextMode: FreeTextMode;
  }
> = {
  self: {
    label: "给自己看",
    desc: "先帮自己看清这段时间发生了什么。",
    defaultSections: [
      "mood",
      "sleep",
      "diet",
      "medication",
      "bodyFeeling",
      "weight",
      "freeText",
      "dataCompleteness",
    ],
    freeTextMode: "original",
  },
  professional: {
    label: "给专业人士看",
    desc: "适合复诊、咨询或其他专业沟通前使用。",
    defaultSections: [
      "mood",
      "sleep",
      "diet",
      "medication",
      "bodyFeeling",
      "weight",
      "freeText",
      "dataCompleteness",
    ],
    freeTextMode: "summary",
  },
  parent: {
    label: "给家长看",
    desc: "只整理你愿意让家人理解的部分。",
    defaultSections: ["mood", "sleep", "diet", "dataCompleteness"],
    freeTextMode: "hidden",
  },
  school: {
    label: "给老师 / 学校看",
    desc: "只整理和学校沟通必要相关的内容。",
    defaultSections: ["dataCompleteness"],
    freeTextMode: "hidden",
  },
};

/* —— 区块展示信息 —— */
export const SECTION_META: Record<
  OrganizeSectionId,
  { label: string; hint: string }
> = {
  mood: { label: "情绪波动", hint: "情绪强度与情绪词记录" },
  sleep: { label: "睡眠情况", hint: "入睡时间与醒后感受" },
  diet: { label: "饮食记录", hint: "三餐与饭后感受" },
  medication: { label: "服用记录", hint: "服用状态与改动说明" },
  bodyFeeling: { label: "身体感受", hint: "情绪或饭后的身体反应" },
  weight: { label: "体重变化", hint: "体重记录波动" },
  freeText: { label: "自由文本", hint: "日常记录中写下的补充" },
  dataCompleteness: { label: "数据完整度", hint: "各类记录的覆盖情况" },
};

/* —— 「补充未记录信息」步骤文案（按受众）——
 * 该步骤是可选补充，不是必填问卷：让用户在生成整理单前，
 * 补一句"日常记录里没有，但这次沟通可能需要带上的话"。 */
export const SUPPLEMENT_STEP_CONFIG: Record<
  OrganizeAudience,
  { title: string; desc: string; placeholder: string }
> = {
  self: {
    title: "有没有想补给自己看的话？",
    desc: "可以补一句这段时间你不想漏掉的事。",
    placeholder: "写一句就可以，也可以不写",
  },
  professional: {
    title: "有没有想带去说的一句话？",
    desc: "日常记录里不一定都有。这里可以补一句你想让对方知道的事。",
    placeholder: "比如：最近最困扰的事、想问的问题、当面不太好说的话",
  },
  parent: {
    title: "有没有希望家人先知道的一句话？",
    desc: "可以写你愿意让家人理解的部分，不需要把所有事都写出来。",
    placeholder: "比如：最近哪里比较难、希望家人少追问什么",
  },
  school: {
    title: "有没有需要老师知道的一点情况？",
    desc: "只写和学校沟通必要相关的内容。私密内容可以不写。",
    placeholder: "比如：请假、作业、返校中需要说明的一点情况",
  },
};

/* —— 时间范围选项 —— */
export const RANGE_OPTIONS: {
  value: OrganizeRange;
  label: string;
  default?: boolean;
}[] = [
  { value: 7, label: "最近 7 天" },
  { value: 14, label: "最近 14 天", default: true },
  { value: 30, label: "最近 30 天" },
];

/* —— 风险关键词检测（用于敏感内容提醒，不会自动剔除）—— */
const RISK_PATTERN =
  /自杀|自残|自伤|割腕|跳楼|不想活|想死|死掉|结束生命|活不下去|伤害自己|了结/;

export function hasSensitiveContent(text: string): boolean {
  return RISK_PATTERN.test(text);
}

/* —— 数据统计：基于 lookbackData 生成结构化统计 ——
 * 只统计已有记录的字段，不做推断。 */
export type RangeStats = {
  totalDays: number;
  recordedDays: number; // 至少有一类记录的天数
  mood: {
    lowDays: number; // mood <= 2
    midDays: number; // mood === 3
    highDays: number; // mood >= 4
    noRecordDays: number;
    topWords: { word: string; count: number }[];
    triggers: { trigger: string; count: number }[];
  };
  sleep: {
    lateDays: number; // 入睡在 23:00 之后
    veryLateDays: number; // 入睡在 01:00 之后
    noRecordDays: number;
    nightWakeDays: number;
    avgSleepTimeLabel: string | null; // 中位入睡时间段文案
  };
  diet: {
    missedBreakfast: number;
    missedLunch: number;
    missedDinner: number;
    noRecordDays: number; // 三餐全未记录的天数
    afterFeelingDays: number;
  };
  medication: {
    takenDays: number; // 早或晚至少一次 taken
    missedDays: number;
    changedDays: number;
    noRecordDays: number;
  };
  bodyFeeling: {
    mentionedDays: number; // 有身体感受记录的天数
    topFeelings: { feeling: string; count: number }[];
  };
  weight: {
    recordedDays: number;
    values: { date: string; displayDate: string; weight: number }[];
    delta: number | null; // 末值 - 首值
  };
  freeText: {
    items: { date: string; displayDate: string; text: string; kind: "mood" | "activity" | "meal" }[];
  };
};

export function computeRangeStats(range: OrganizeRange): RangeStats {
  const data: DailyLookbackData[] = lookbackData[range];
  const totalDays = data.length;

  let moodLow = 0,
    moodMid = 0,
    moodHigh = 0,
    moodNone = 0;
  const wordCount: Record<string, number> = {};
  const triggerCount: Record<string, number> = {};

  let sleepLate = 0,
    sleepVeryLate = 0,
    sleepNone = 0,
    nightWakeDays = 0;
  const sleepHourBuckets: Record<string, number> = {};

  let missedB = 0,
    missedL = 0,
    missedD = 0,
    dietNone = 0,
    afterFeelingDays = 0;

  let medTaken = 0,
    medMissed = 0,
    medChanged = 0,
    medNone = 0;

  let bodyMentioned = 0;
  const bodyCount: Record<string, number> = {};

  let weightRecorded = 0;
  const weightValues: RangeStats["weight"]["values"] = [];
  const weightDeltas: number[] = [];

  const freeTextItems: RangeStats["freeText"]["items"] = [];

  let recordedDays = 0;

  for (const d of data) {
    let dayHasRecord = false;

    // 情绪
    if (d.mood === null) {
      moodNone++;
    } else {
      dayHasRecord = true;
      if (d.mood <= 2) moodLow++;
      else if (d.mood === 3) moodMid++;
      else moodHigh++;
      if (d.moodWords) {
        for (const w of d.moodWords) {
          wordCount[w] = (wordCount[w] ?? 0) + 1;
        }
      }
      if (d.moodTrigger) {
        triggerCount[d.moodTrigger] = (triggerCount[d.moodTrigger] ?? 0) + 1;
      }
    }

    // 睡眠
    if (d.sleepTime === null) {
      sleepNone++;
    } else {
      dayHasRecord = true;
      const [h] = d.sleepTime.split(":").map(Number);
      if (h >= 1 && h < 6) {
        sleepVeryLate++;
        sleepLate++;
      } else if (h >= 23 || h === 0) {
        sleepLate++;
      }
      const bucket =
        h >= 1 && h < 6
          ? "1 点后"
          : h === 0
            ? "0–1 点"
            : h === 23
              ? "23–24 点"
              : "23 点前";
      sleepHourBuckets[bucket] = (sleepHourBuckets[bucket] ?? 0) + 1;
      if (d.nightWake) nightWakeDays++;
    }

    // 饮食
    const dietAllUnknown =
      d.meals.breakfast === "unknown" &&
      d.meals.lunch === "unknown" &&
      d.meals.dinner === "unknown";
    if (dietAllUnknown) {
      dietNone++;
    } else {
      dayHasRecord = true;
      if (d.meals.breakfast === "no") missedB++;
      if (d.meals.lunch === "no") missedL++;
      if (d.meals.dinner === "no") missedD++;
      if (d.mealFeeling) afterFeelingDays++;
    }

    // 服用
    const medAllUnknown =
      d.medication.morning === "unknown" && d.medication.evening === "unknown";
    if (medAllUnknown) {
      medNone++;
    } else {
      dayHasRecord = true;
      if (
        d.medication.morning === "taken" ||
        d.medication.evening === "taken"
      )
        medTaken++;
      if (
        d.medication.morning === "missed" ||
        d.medication.evening === "missed"
      )
        medMissed++;
      if (
        d.medication.morning === "changed" ||
        d.medication.evening === "changed"
      )
        medChanged++;
    }

    // 身体感受（来自情绪和饮食记录）
    const feelings: string[] = [];
    if (d.moodBody) feelings.push(d.moodBody);
    if (d.mealFeeling && d.mealFeeling !== "还好" && d.mealFeeling !== "没什么特别")
      feelings.push(d.mealFeeling);
    if (feelings.length > 0) {
      bodyMentioned++;
      for (const f of feelings) {
        bodyCount[f] = (bodyCount[f] ?? 0) + 1;
      }
    }

    // 体重
    if (d.weight !== null) {
      dayHasRecord = true;
      weightRecorded++;
      weightValues.push({
        date: d.date,
        displayDate: d.displayDate,
        weight: d.weight,
      });
      weightDeltas.push(d.weight);
    }

    // 自由文本（日常记录中的补充说明）
    if (d.moodNote) {
      freeTextItems.push({
        date: d.date,
        displayDate: d.displayDate,
        text: d.moodNote,
        kind: "mood",
      });
    }
    if (d.activityContent) {
      freeTextItems.push({
        date: d.date,
        displayDate: d.displayDate,
        text: d.activityContent,
        kind: "activity",
      });
    }
    if (d.activityNote) {
      freeTextItems.push({
        date: d.date,
        displayDate: d.displayDate,
        text: d.activityNote,
        kind: "activity",
      });
    }

    if (dayHasRecord) recordedDays++;
  }

  // 中位入睡时间段
  let avgSleepTimeLabel: string | null = null;
  const bucketOrder = ["23 点前", "23–24 点", "0–1 点", "1 点后"];
  let maxBucket = 0;
  for (const b of bucketOrder) {
    if ((sleepHourBuckets[b] ?? 0) > maxBucket) {
      maxBucket = sleepHourBuckets[b] ?? 0;
      avgSleepTimeLabel = b;
    }
  }
  if (maxBucket === 0) avgSleepTimeLabel = null;

  // 体重 delta
  let weightDelta: number | null = null;
  if (weightDeltas.length >= 2) {
    weightDelta =
      Math.round((weightDeltas[weightDeltas.length - 1] - weightDeltas[0]) * 10) /
      10;
  }

  return {
    totalDays,
    recordedDays,
    mood: {
      lowDays: moodLow,
      midDays: moodMid,
      highDays: moodHigh,
      noRecordDays: moodNone,
      topWords: Object.entries(wordCount)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),
      triggers: Object.entries(triggerCount)
        .map(([trigger, count]) => ({ trigger, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),
    },
    sleep: {
      lateDays: sleepLate,
      veryLateDays: sleepVeryLate,
      noRecordDays: sleepNone,
      nightWakeDays,
      avgSleepTimeLabel,
    },
    diet: {
      missedBreakfast: missedB,
      missedLunch: missedL,
      missedDinner: missedD,
      noRecordDays: dietNone,
      afterFeelingDays,
    },
    medication: {
      takenDays: medTaken,
      missedDays: medMissed,
      changedDays: medChanged,
      noRecordDays: medNone,
    },
    bodyFeeling: {
      mentionedDays: bodyMentioned,
      topFeelings: Object.entries(bodyCount)
        .map(([feeling, count]) => ({ feeling, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),
    },
    weight: {
      recordedDays: weightRecorded,
      values: weightValues,
      delta: weightDelta,
    },
    freeText: { items: freeTextItems },
  };
}

/* —— 重点卡片 —— */
export type GeneratedCard = {
  id: string;
  title: string;
  text: string;
  source: "daily" | "supplement";
};

/* —— 详细摘要区块 ——
 * id 用于区块标识；"supplement" 为本次补充独立区块，不在 defaultSections 配置中。 */
export type SectionDetail = {
  id: OrganizeSectionId | "supplement";
  title: string;
  source: "daily" | "supplement" | "insufficient";
  text: string;
  /** freeText 区块使用：原文条目（仅 original 模式展示） */
  rawItems?: { date: string; displayDate: string; text: string; kind: string }[];
  /** freeText 区块使用：摘要文案（仅 summary 模式展示） */
  summaryText?: string;
  /** 是否含敏感词，需用户确认 */
  sensitive?: boolean;
};

/* —— 整理单生成结果 —— */
export type GeneratedSummary = {
  overview: string;
  cards: GeneratedCard[];
  sections: SectionDetail[];
};

/* —— 生成整理单预览 ——
 * 输入：受众、范围、已选区块、补充文本、自由文本模式
 * 输出：一句话总览 + 重点卡片 + 详细摘要
 *
 * 规则：
 *   - 没有数据的区块显示「记录不足」提示，不隐藏到完全看不见
 *   - 不使用诊断 / 治疗建议 / 用药建议等表达
 *   - 补充内容标注为「本次补充」
 *   - 涉及自伤 / 危机表达时不自动放入，标记 sensitive 让用户确认
 */
export function generateSummary(params: {
  audience: OrganizeAudience;
  range: OrganizeRange;
  selectedSections: OrganizeSectionId[];
  supplementText: string;
  freeTextMode: FreeTextMode;
}): GeneratedSummary {
  const { audience, range, selectedSections, supplementText, freeTextMode } =
    params;
  const stats = computeRangeStats(range);
  const rangeLabel = `最近 ${range} 天`;

  /* —— 第一层：一句话总览 —— */
  const overviewParts: string[] = [];
  overviewParts.push(
    `${rangeLabel}中，共有 ${stats.recordedDays} 天记录`,
  );
  if (selectedSections.includes("mood") && stats.mood.lowDays > 0) {
    overviewParts.push(`情绪低分集中在 ${stats.mood.lowDays} 天`);
  }
  if (selectedSections.includes("sleep") && stats.sleep.lateDays > 0) {
    overviewParts.push(`睡眠记录显示有 ${stats.sleep.lateDays} 天入睡较晚`);
  }
  if (
    selectedSections.includes("medication") &&
    stats.medication.takenDays > 0
  ) {
    overviewParts.push(`服用记录有 ${stats.medication.takenDays} 天确认`);
  }
  const overview =
    overviewParts.join("；") + "。";

  /* —— 第二层：重点卡片（最多 3–5 张） —— */
  const cards: GeneratedCard[] = [];

  // 优先级 1：持续多日出现（睡眠晚、情绪低）
  if (
    selectedSections.includes("sleep") &&
    stats.sleep.lateDays >= 3 &&
    stats.sleep.noRecordDays < stats.totalDays
  ) {
    cards.push({
      id: "sleep-rhythm",
      title: "睡眠节律",
      text: `记录显示，这 ${range} 天中有 ${stats.sleep.lateDays} 天入睡较晚。`,
      source: "daily",
    });
  }

  if (
    selectedSections.includes("mood") &&
    stats.mood.lowDays >= 2 &&
    stats.mood.noRecordDays < stats.totalDays
  ) {
    cards.push({
      id: "mood-low",
      title: "情绪波动",
      text: `记录显示，有 ${stats.mood.lowDays} 天出现较低情绪记录。`,
      source: "daily",
    });
  }

  // 优先级 2：饮食缺失（影响生活节律）
  if (
    selectedSections.includes("diet") &&
    stats.diet.missedBreakfast + stats.diet.missedLunch + stats.diet.missedDinner >=
      3
  ) {
    const missedTotal =
      stats.diet.missedBreakfast + stats.diet.missedLunch + stats.diet.missedDinner;
    cards.push({
      id: "diet-missed",
      title: "饮食节律",
      text: `记录显示，这 ${range} 天中共有 ${missedTotal} 餐次记录为未吃。`,
      source: "daily",
    });
  }

  // 优先级 3：本次补充
  const supplementTrim = supplementText.trim();
  if (selectedSections.includes("freeText") && supplementTrim) {
    const sensitive = hasSensitiveContent(supplementTrim);
    cards.push({
      id: "supplement",
      title: audience === "professional" ? "想带去沟通的内容" : "本次补充",
      text: sensitive
        ? "用户在本次补充中写下了 1 条比较敏感的内容，需要先确认是否放入当前版本。"
        : `用户在本次补充中写下了 ${countSentences(supplementTrim)} 条想沟通的内容。`,
      source: "supplement",
    });
  }

  // 优先级 4：服药确认（仅 self / professional 默认展示）
  if (
    selectedSections.includes("medication") &&
    stats.medication.takenDays > 0 &&
    cards.length < 4
  ) {
    cards.push({
      id: "med-taken",
      title: "服用记录",
      text: `记录显示，这 ${range} 天中有 ${stats.medication.takenDays} 天确认服药。`,
      source: "daily",
    });
  }

  /* —— 第三层：详细摘要 —— */
  const sections: SectionDetail[] = [];

  if (selectedSections.includes("mood")) {
    if (stats.mood.noRecordDays === stats.totalDays) {
      sections.push({
        id: "mood",
        title: SECTION_META.mood.label,
        source: "insufficient",
        text: "这段时间没有足够的情绪记录，暂不整理这一项。",
      });
    } else {
      const parts: string[] = [];
      parts.push(
        `记录显示，这 ${range} 天中有 ${stats.mood.lowDays} 天情绪偏低、${stats.mood.midDays} 天一般、${stats.mood.highDays} 天偏稳。`,
      );
      if (stats.mood.topWords.length > 0) {
        parts.push(
          `较常出现的情绪词：${stats.mood.topWords.map((w) => w.word).join("、")}。`,
        );
      }
      if (stats.mood.triggers.length > 0) {
        parts.push(
          `较常提到的触发事件：${stats.mood.triggers.map((t) => t.trigger).join("、")}。`,
        );
      }
      sections.push({
        id: "mood",
        title: SECTION_META.mood.label,
        source: "daily",
        text: parts.join(""),
      });
    }
  }

  if (selectedSections.includes("sleep")) {
    if (stats.sleep.noRecordDays === stats.totalDays) {
      sections.push({
        id: "sleep",
        title: SECTION_META.sleep.label,
        source: "insufficient",
        text: "这段时间没有足够的睡眠记录，暂不整理这一项。",
      });
    } else {
      const parts: string[] = [];
      parts.push(
        `记录显示，这 ${range} 天中有 ${stats.sleep.lateDays} 天入睡较晚，其中 ${stats.sleep.veryLateDays} 天入睡在 1 点后。`,
      );
      if (stats.sleep.avgSleepTimeLabel) {
        parts.push(`较常出现的入睡时间段：${stats.sleep.avgSleepTimeLabel}。`);
      }
      if (stats.sleep.nightWakeDays > 0) {
        parts.push(`有 ${stats.sleep.nightWakeDays} 天记录到夜醒。`);
      }
      sections.push({
        id: "sleep",
        title: SECTION_META.sleep.label,
        source: "daily",
        text: parts.join(""),
      });
    }
  }

  if (selectedSections.includes("diet")) {
    if (stats.diet.noRecordDays === stats.totalDays) {
      sections.push({
        id: "diet",
        title: SECTION_META.diet.label,
        source: "insufficient",
        text: "这段时间没有足够的饮食记录，暂不整理这一项。",
      });
    } else {
      const parts: string[] = [];
      parts.push(
        `记录显示，早餐缺失 ${stats.diet.missedBreakfast} 天，午餐缺失 ${stats.diet.missedLunch} 天，晚餐缺失 ${stats.diet.missedDinner} 天。`,
      );
      if (stats.diet.afterFeelingDays > 0) {
        parts.push(`有 ${stats.diet.afterFeelingDays} 天记录了饭后感受。`);
      }
      sections.push({
        id: "diet",
        title: SECTION_META.diet.label,
        source: "daily",
        text: parts.join(""),
      });
    }
  }

  if (selectedSections.includes("medication")) {
    if (stats.medication.noRecordDays === stats.totalDays) {
      sections.push({
        id: "medication",
        title: SECTION_META.medication.label,
        source: "insufficient",
        text: "这段时间没有足够的服用记录，暂不整理这一项。",
      });
    } else {
      const parts: string[] = [];
      parts.push(
        `记录显示，这 ${range} 天中有 ${stats.medication.takenDays} 天确认服药。`,
      );
      if (stats.medication.missedDays > 0) {
        parts.push(`有 ${stats.medication.missedDays} 天记录到漏服。`);
      }
      if (stats.medication.changedDays > 0) {
        parts.push(`有 ${stats.medication.changedDays} 天记录到方案改动。`);
      }
      sections.push({
        id: "medication",
        title: SECTION_META.medication.label,
        source: "daily",
        text: parts.join(""),
      });
    }
  }

  if (selectedSections.includes("bodyFeeling")) {
    if (stats.bodyFeeling.mentionedDays === 0) {
      sections.push({
        id: "bodyFeeling",
        title: SECTION_META.bodyFeeling.label,
        source: "insufficient",
        text: "这段时间没有足够的身体感受记录，暂不整理这一项。",
      });
    } else {
      const parts: string[] = [];
      parts.push(
        `记录显示，有 ${stats.bodyFeeling.mentionedDays} 天提到了身体感受。`,
      );
      if (stats.bodyFeeling.topFeelings.length > 0) {
        parts.push(
          `较常出现的身体感受：${stats.bodyFeeling.topFeelings.map((f) => f.feeling).join("、")}。`,
        );
      }
      sections.push({
        id: "bodyFeeling",
        title: SECTION_META.bodyFeeling.label,
        source: "daily",
        text: parts.join(""),
      });
    }
  }

  if (selectedSections.includes("weight")) {
    if (stats.weight.recordedDays === 0) {
      sections.push({
        id: "weight",
        title: SECTION_META.weight.label,
        source: "insufficient",
        text: "这段时间没有体重记录，暂不整理这一项。",
      });
    } else {
      const parts: string[] = [];
      parts.push(`记录显示，有 ${stats.weight.recordedDays} 天记录了体重。`);
      if (
        stats.weight.delta !== null &&
        stats.weight.values.length >= 2
      ) {
        const first = stats.weight.values[0].weight;
        const last = stats.weight.values[stats.weight.values.length - 1].weight;
        parts.push(
          `记录范围内体重从 ${first} kg 变化到 ${last} kg。`,
        );
      }
      sections.push({
        id: "weight",
        title: SECTION_META.weight.label,
        source: "daily",
        text: parts.join(""),
      });
    }
  }

  if (selectedSections.includes("freeText")) {
    if (freeTextMode === "hidden") {
      // 不包含 — 不展示该区块，但占位提示
      sections.push({
        id: "freeText",
        title: SECTION_META.freeText.label,
        source: "insufficient",
        text: "当前版本未包含自由文本内容。",
      });
    } else if (freeTextMode === "summary") {
      const items = stats.freeText.items;
      if (items.length === 0) {
        sections.push({
          id: "freeText",
          title: SECTION_META.freeText.label,
          source: "insufficient",
          text: "这段时间没有自由文本记录，暂不整理这一项。",
        });
      } else {
        const summary = `记录显示，这段时间共写下 ${items.length} 条自由文本补充，较常涉及日常活动与情绪说明。`;
        sections.push({
          id: "freeText",
          title: SECTION_META.freeText.label,
          source: "daily",
          text: summary,
          summaryText: summary,
        });
      }
    } else {
      // original
      const items = stats.freeText.items;
      if (items.length === 0) {
        sections.push({
          id: "freeText",
          title: SECTION_META.freeText.label,
          source: "insufficient",
          text: "这段时间没有自由文本记录，暂不整理这一项。",
        });
      } else {
        const sensitive = items.some((i) => hasSensitiveContent(i.text));
        sections.push({
          id: "freeText",
          title: SECTION_META.freeText.label,
          source: "daily",
          text: `记录显示，这段时间共写下 ${items.length} 条自由文本补充。`,
          rawItems: items.map((i) => ({
            date: i.date,
            displayDate: i.displayDate,
            text: i.text,
            kind: i.kind,
          })),
          sensitive,
        });
      }
    }
  }

  if (selectedSections.includes("dataCompleteness")) {
    const totalSlots = stats.totalDays * 5; // 5 类核心记录
    const filledSlots =
      (stats.totalDays - stats.mood.noRecordDays) +
      (stats.totalDays - stats.sleep.noRecordDays) +
      (stats.totalDays - stats.diet.noRecordDays) +
      (stats.totalDays - stats.medication.noRecordDays) +
      stats.weight.recordedDays;
    const ratio = totalSlots === 0 ? 0 : Math.round((filledSlots / totalSlots) * 100);
    sections.push({
      id: "dataCompleteness",
      title: SECTION_META.dataCompleteness.label,
      source: "daily",
      text: `这段时间各类记录覆盖度约 ${ratio}%。其中情绪记录 ${stats.totalDays - stats.mood.noRecordDays} 天、睡眠记录 ${stats.totalDays - stats.sleep.noRecordDays} 天、饮食记录 ${stats.totalDays - stats.diet.noRecordDays} 天、服用记录 ${stats.totalDays - stats.medication.noRecordDays} 天、体重记录 ${stats.weight.recordedDays} 天。`,
    });
  }

  // 本次补充作为独立区块（如果用户填了补充内容）
  if (supplementTrim) {
    const sensitive = hasSensitiveContent(supplementTrim);
    sections.push({
      id: "supplement",
      title: "本次补充",
      source: "supplement",
      text: supplementTrim,
      sensitive,
    });
  }

  return { overview, cards: cards.slice(0, 5), sections };
}

/* —— 简单句数统计（用于补充内容条数描述）—— */
function countSentences(text: string): number {
  const parts = text
    .split(/[。\n！？!?]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return Math.max(1, parts.length);
}

/* —— 复制简版文字 ——
 * 一段克制、可粘贴的纯文本摘要。
 * 始终附上免责说明：仅来自用户已有记录和本次主动补充，不包含诊断或治疗建议。 */
export function buildPlainText(params: {
  range: OrganizeRange;
  summary: GeneratedSummary;
}): string {
  const { range, summary } = params;
  const lines: string[] = [];
  lines.push(`最近 ${range} 天整理：${summary.overview}`);
  if (summary.cards.length > 0) {
    for (const c of summary.cards) {
      lines.push(c.text);
    }
  }
  lines.push(
    "本整理仅来自用户已有记录和本次主动补充，不包含诊断或治疗建议。",
  );
  return lines.join("\n");
}

/* —— 历史记录条目 —— */
export type OrganizeHistoryEntry = {
  id: string;
  audience: OrganizeAudience;
  audienceLabel: string;
  range: OrganizeRange;
  selectedSections: OrganizeSectionId[];
  freeTextMode: FreeTextMode;
  supplementText: string;
  generatedSummary: GeneratedSummary;
  createdAt: number;
};
