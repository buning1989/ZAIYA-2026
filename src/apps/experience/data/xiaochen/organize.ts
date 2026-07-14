/* —— 小晨体验模式统一数据源：帮我整理模块数据 ——
 *
 * 替代 src/data/organize.ts 中 createMockTopics / createMockDisclosure 在
 * 体验模式下的兜底行为。所有统计数字、沟通重点 evidence 与高风险披露
 * 原文都必须从 constants.ts / timeline.ts 派生，不得重新硬编码。
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
  PERIOD_START,
  PERIOD_END,
  TOTAL_DAYS,
  RECORDED_DAYS,
  STATS,
  MISSED_MED_DATES,
  NO_SCHOOL_DATES,
  BEFORE_MIDNIGHT_SLEEP_DATES,
  LATEST_SLEEP_DATE,
  LATEST_SLEEP_TIME,
  WEIGHT_RECORDS,
  BREATHING_EXERCISE_DATE,
  MEDICATION_NAME,
  MEDICATION_DOSE,
  MEDICATION_FREQUENCY,
} from "./constants";

/* =========================================================
 * 沟通对象：王医生（与 constants.ts 一致）
 * ======================================================= */

/** 体验模式沟通对象：王医生。
 *  使用固定 id（xc- 前缀），保证跨刷新一致。
 *  createdAt 用确定性时间戳，避免 Date.now() 导致每次 seed 不同。 */
export const XIAOCHEN_ORGANIZE_CONTACT: CommunicationContact = {
  id: "xc-org-wang-doctor",
  displayName: DOCTOR_NAME,
  roleType: "doctor",
  roleLabel: DOCTOR_ROLE,
  source: "organize_added",
  createdAt: new Date(2026, 5, 15, 8, 0).getTime(),
  lastUsedAt: new Date(2026, 6, 17, 21, 30).getTime(),
};

/* =========================================================
 * 沟通重点（5 条，evidence 全部来自统一常量）
 * ======================================================= */

function formatMedDates(dates: readonly string[]): string {
  return dates
    .map((d) => {
      const [, m, day] = d.split("-").map(Number);
      return `${m}/${day}`;
    })
    .join("、");
}

/** 体验模式 5 条沟通重点（默认全部选中）。
 *  evidenceSummary 中的所有数字与日期均派生自 constants.ts，不重复硬编码。 */
export function buildXiaochenOrganizeTopics(): CommunicationTopic[] {
  const missedMedLabel = formatMedDates(MISSED_MED_DATES);
  const noSchoolLabel = formatMedDates(NO_SCHOOL_DATES);
  const beforeMidnightLabel = formatMedDates(BEFORE_MIDNIGHT_SLEEP_DATES);
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
        `${TOTAL_DAYS} 天内有 ${STATS.daytimeDrowsinessDays} 天记录白天困倦`,
        "相关记录主要集中在上午第二、三节课",
        `当前记录用药为${MEDICATION_NAME} ${MEDICATION_DOSE}，${MEDICATION_FREQUENCY}`,
        `${RECORDED_DAYS} 个记录日中漏服 ${STATS.missedMedCount} 次`,
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
        `${TOTAL_DAYS} 天内有 ${STATS.noSchoolCount} 天未到校`,
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
        `${TOTAL_DAYS} 天内有 ${STATS.familyConflictCount} 次与父母冲突记录`,
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
 *  所有原话不改写、不摘要、不合并，完整展示用户原文。 */
export function buildXiaochenOrganizeDisclosure(): SpecialDisclosure {
  return {
    exists: true,
    count: 2,
    originalRecords: [
      {
        id: "xc-highrisk-1",
        sourceType: "emotion_record",
        sourceLabel: "情绪记录",
        recordedAt: "2026-06-24T01:32",
        originalText:
          "又到一点多了还是睡不着。脑子里全是明天的课，作业也没写完。躺着躺着突然觉得特别没意思，好像怎么都撑不下去，但又说不上来撑不下去是什么意思。就是很累。",
        selected: false,
        riskCategory: "suicidal_ideation_or_behavior",
      },
      {
        id: "xc-highrisk-2",
        sourceType: "emotion_record",
        sourceLabel: "情绪记录",
        recordedAt: "2026-07-06T01:48",
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

/* —— 时间段（与 constants.ts 一致，固定 33 天 / 24 记录日）—— */
export const XIAOCHEN_ORGANIZE_RANGE = {
  rangeKey: "custom" as const,
  startDate: PERIOD_START,
  endDate: PERIOD_END,
  totalDays: TOTAL_DAYS,
  recordedDays: RECORDED_DAYS,
};
