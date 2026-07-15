/* —— 小晨体验模式统一数据源：帮我整理模块数据 ——
 *
 * 替代 src/data/organize.ts 中 createMockTopics / createMockDisclosure 在
 * 体验模式下的兜底行为。所有时间基准来自 ./timeConfig，所有日级事实来自
 * ./dailyRecords，沟通重点 evidence 中的日期与事件可在 dailyRecords 中验证。
 *
 * 时间基准（来自 timeConfig，不在本文件中重新硬编码）：
 *   - 数据周期：XIAOCHEN_START_DATE（2026-05-16）~ XIAOCHEN_CURRENT_DATE（2026-07-15）
 *   - 创建时间：2026-07-15T21:30:00+08:00（复诊前 3 天，整理阶段）
 *   - 复诊日期：XIAOCHEN_FOLLOWUP_DATE（2026-07-18，未来，不得作为已发生事件）
 *
 * 高风险分类修正（任务规范第 B 节）：
 *   - 仅保留 2 条真实包含深夜消极念头的情绪记录放入高风险披露
 *   - 「我又没去学校」不再标记为「被他人伤害」，作为学校功能受损记录
 *     纳入沟通重点 topic-3 的 evidence
 *   - 「落了三张数学卷子」不再标记为「药物过量或药物滥用」，作为行动
 *     启动与学习功能困难记录纳入沟通重点 topic-3 的 evidence
 *
 * 不得为丰富高风险列表而扩大安全风险判定范围。 */
import type {
  CommunicationContact,
  CommunicationTopic,
  SpecialDisclosure,
} from "@/data/organize";
import {
  DOCTOR_NAME,
  DOCTOR_ROLE,
  MEDICATION_NAME,
  MEDICATION_DOSE,
  MEDICATION_FREQUENCY,
  NO_SCHOOL_DATES,
  BEFORE_MIDNIGHT_SLEEP_DATES,
  LATEST_SLEEP_DATE,
  LATEST_SLEEP_TIME,
  BREATHING_EXERCISE_DATE,
  WEIGHT_RECORDS,
  STATS,
} from "./constants";
import {
  XIAOCHEN_CURRENT_DATE,
  XIAOCHEN_START_DATE,
} from "./timeConfig";
import { XIAOCHEN_DAILY_ALL_DAYS } from "./dailyRecords";

/* =========================================================
 * 沟通对象：王医生（与 constants.ts 一致）
 * ======================================================= */

/** 整理会话创建时间（复诊前 3 天，2026-07-15 21:30 CST）。
 *  不使用 Date.now() 或浏览器真实时间。 */
const ORGANIZE_SESSION_CREATED_AT = new Date(
  "2026-07-15T21:30:00+08:00",
).getTime();

/** 体验模式沟通对象：王医生。
 *  使用固定 id（xc- 前缀），保证跨刷新一致。
 *  createdAt = XIAOCHEN_START_DATE（开始使用日）。
 *  lastUsedAt = ORGANIZE_SESSION_CREATED_AT（最近一次整理会话）。 */
export const XIAOCHEN_ORGANIZE_CONTACT: CommunicationContact = {
  id: "xc-org-wang-doctor",
  displayName: DOCTOR_NAME,
  roleType: "doctor",
  roleLabel: DOCTOR_ROLE,
  source: "organize_added",
  createdAt: new Date(`${XIAOCHEN_START_DATE}T08:00:00+08:00`).getTime(),
  lastUsedAt: ORGANIZE_SESSION_CREATED_AT,
};

/* =========================================================
 * 沟通重点（5 条，evidence 全部来自统一常量与 dailyRecords）
 * ======================================================= */

function formatMedDates(dates: readonly string[]): string {
  return dates
    .map((d) => {
      const [, m, day] = d.split("-").map(Number);
      return `${m}/${day}`;
    })
    .join("、");
}

/** 从 dailyRecords 派生的实际统计数字（替代旧 STATS 的固定值）。
 *  保证与日级事实完全一致。 */
function deriveStatsFromDailyRecords() {
  const allDays = XIAOCHEN_DAILY_ALL_DAYS;
  const totalDays = allDays.length;
  const recordedDays = allDays.filter(
    (d) =>
      d.moodEntries !== null ||
      d.sleepTime !== null ||
      d.mealEntries !== null ||
      d.medEntries !== null ||
      d.activityLevel !== null ||
      d.weight !== null,
  ).length;
  const missedMedCount = allDays.filter(
    (d) => d.medication.evening === "missed",
  ).length;
  const breakfastYesDays = allDays.filter(
    (d) => d.meals.breakfast === "yes",
  ).length;
  const lunchYesDays = allDays.filter((d) => d.meals.lunch === "yes").length;
  const dinnerYesDays = allDays.filter(
    (d) => d.meals.dinner === "yes",
  ).length;
  return {
    totalDays,
    recordedDays,
    unrecordedDays: totalDays - recordedDays,
    missedMedCount,
    breakfastYesDays,
    lunchYesDays,
    dinnerYesDays,
  };
}

/** 体验模式 5 条沟通重点（默认全部选中）。
 *  evidenceSummary 中的所有数字与日期均派生自 dailyRecords 或 constants.ts，
 *  不重复硬编码日级事实。 */
export function buildXiaochenOrganizeTopics(): CommunicationTopic[] {
  const noSchoolLabel = formatMedDates(NO_SCHOOL_DATES);
  const derived = deriveStatsFromDailyRecords();
  const weightTrend = `${WEIGHT_RECORDS[0].weightKg}kg（${formatMedDates([
    WEIGHT_RECORDS[0].date,
  ])}) → ${WEIGHT_RECORDS[1].weightKg}kg（${formatMedDates([
    WEIGHT_RECORDS[1].date,
  ])})`;

  return [
    {
      id: "xc-topic-1",
      title: "吃药之后白天特别困",
      content: "上午第二三节课基本撑不住，趴过好几次。不知道是不是药的原因。",
      sourceType: "system_summary",
      evidenceSummary: [
        `${derived.totalDays} 天内有 ${STATS.daytimeDrowsinessDays} 天记录白天困倦`,
        "相关记录主要集中在上午第二、三节课",
        `当前记录用药为${MEDICATION_NAME} ${MEDICATION_DOSE}，${MEDICATION_FREQUENCY}`,
        `${derived.recordedDays} 个记录日中漏服 ${derived.missedMedCount} 次`,
        "产品只表达「服药期间记录到白天困倦」，不判断困倦由药物导致",
      ],
      selected: true,
      edited: false,
      allowedInMaterial: true,
    },
    {
      id: "xc-topic-2",
      title: "最近还是很难睡着",
      content: "基本都要一两点，脑子停不下来。有一天试了数呼吸的方法，好像有一点点用。",
      sourceType: "system_summary",
      evidenceSummary: [
        "多数记录日在 00:30—02:00 入睡",
        `最晚一次为 ${LATEST_SLEEP_TIME}（${formatMedDates([LATEST_SLEEP_DATE])}）`,
        `${formatMedDates(BEFORE_MIDNIGHT_SLEEP_DATES)} 在零点前入睡`,
        `${BREATHING_EXERCISE_DATE} 完成一次呼吸/接地练习`,
        "后期只呈现少数较早入睡的日期，不形成持续向好的曲线",
      ],
      selected: true,
      edited: false,
      allowedInMaterial: true,
    },
    {
      id: "xc-topic-3",
      title: "有几天早上没去成学校",
      content: "不是不想去，是出门前那种难受劲儿上来，动不了。",
      sourceType: "system_summary",
      evidenceSummary: [
        `${derived.totalDays} 天内有 ${STATS.noSchoolCount} 天未到校`,
        `日期为 ${noSchoolLabel}`,
        "4 个未到校日均有晨起困难相关记录",
        "部分到校日存在打开作业后难以启动学习的情况（如「落了三张数学卷子，打开三分钟就受不了了」）",
        "到校日仍可能出现迟到、趴在桌上、作业未完成、与同学互动减少",
      ],
      selected: true,
      edited: false,
      allowedInMaterial: true,
    },
    {
      id: "xc-topic-4",
      title: "和爸妈一说上学的事就容易吵",
      content: "尤其是关于上学的事。他们觉得我在找借口。",
      sourceType: "system_summary",
      evidenceSummary: [
        `${derived.totalDays} 天内有 ${STATS.familyConflictCount} 次与父母冲突记录`,
        "内容主要与是否到校、是否在找借口有关",
        "多数发生在晚间",
        "父母不是反派，也不被表现为完全理解或始终支持",
        "家庭冲突不被全部归类为安全风险事件",
      ],
      selected: true,
      edited: false,
      allowedInMaterial: true,
    },
    {
      id: "xc-topic-5",
      title: "想问王医生：我这样算是在变好吗？",
      content: "自己感觉不出来。有的地方好像松了一点，有的地方还是老样子。",
      sourceType: "system_summary",
      evidenceSummary: [
        "用户主动表达的问题",
        `体重记录：${weightTrend}（仅有 2 个记录点，趋势不确定）`,
        "后期只呈现有限变化，不形成持续上升曲线",
        `早餐记录 ${derived.breakfastYesDays} 天，午餐 ${derived.lunchYesDays} 天，晚餐 ${derived.dinnerYesDays} 天（早餐更易缺失）`,
      ],
      selected: true,
      edited: false,
      allowedInMaterial: true,
    },
  ];
}

/* =========================================================
 * 高风险披露（仅 2 条真实深夜消极念头）
 * ======================================================= */

/** 体验模式高风险披露。
 *  仅包含 2 条真实包含深夜消极念头的情绪记录，对应 timeline.ts 中
 *  NEGATIVE_THOUGHT_DATES 的两个日期。
 *
 *  「我又没去学校」与「落了三张数学卷子」不再放入高风险披露：
 *    - 前者作为学校功能受损记录纳入 topic-3 evidence
 *    - 后者作为行动启动与学习功能困难记录纳入 topic-3 evidence
 *
 *  所有原话不改写、不摘要、不合并，完整展示用户原文。
 *  recordedAt 使用 +08:00 时区字符串，不依赖本地时区。 */
export function buildXiaochenOrganizeDisclosure(): SpecialDisclosure {
  return {
    exists: true,
    count: 2,
    originalRecords: [
      {
        id: "xc-highrisk-1",
        sourceType: "emotion_record",
        sourceLabel: "情绪记录",
        recordedAt: "2026-06-24T01:32:00+08:00",
        originalText:
          "又到一点多了还是睡不着。脑子里全是明天的课，作业也没写完。躺着躺着突然觉得特别没意思，好像怎么都撑不下去，但又说不上来撑不下去是什么意思。就是很累。",
        selected: false,
        riskCategory: "suicidal_ideation_or_behavior",
      },
      {
        id: "xc-highrisk-2",
        sourceType: "emotion_record",
        sourceLabel: "情绪记录",
        recordedAt: "2026-07-06T01:48:00+08:00",
        originalText:
          "睡不着。晚上又和妈妈因为上学的事吵了一架，她说我就是在找借口。我不想跟她吵，心里堵得慌。那种感觉又上来了，好像再怎么努力也没用。",
        selected: false,
        riskCategory: "self_harm",
      },
    ],
    decision: "pending",
    confirmed: false,
    allowedInMaterial: false,
  };
}

/* —— 静态导出（供 Selector 与校验使用）—— */
export const XIAOCHEN_ORGANIZE_TOPICS: CommunicationTopic[] = buildXiaochenOrganizeTopics();
export const XIAOCHEN_ORGANIZE_DISCLOSURE: SpecialDisclosure = buildXiaochenOrganizeDisclosure();

/* —— 完整材料范围（与 src/data/organize.ts 的 RECORD_CATEGORIES 对齐）—— */
export const XIAOCHEN_ORGANIZE_RECORD_CATEGORIES = [
  "睡眠",
  "情绪",
  "饮食",
  "用药",
  "身体感受",
  "学校与家庭",
];

/* —— 时间段（与 timeConfig + dailyRecords 一致，5-16 ~ 7-15 共 61 天）——
 * 不再使用旧 constants.PERIOD_START / PERIOD_END（6-15 ~ 7-17，含未来日期）。
 * totalDays / recordedDays 从 dailyRecords 派生，保证与日级事实一致。 */
export const XIAOCHEN_ORGANIZE_RANGE = (() => {
  const derived = deriveStatsFromDailyRecords();
  return {
    rangeKey: "custom" as const,
    startDate: XIAOCHEN_START_DATE,
    endDate: XIAOCHEN_CURRENT_DATE,
    totalDays: derived.totalDays,
    recordedDays: derived.recordedDays,
  };
})();

/* —— 整理会话创建时间（re-export，供 Selector 使用）—— */
export const XIAOCHEN_ORGANIZE_SESSION_CREATED_AT = ORGANIZE_SESSION_CREATED_AT;
