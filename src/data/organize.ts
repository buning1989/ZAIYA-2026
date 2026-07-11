/* —— 「帮我整理」沟通材料整理模块（本地 mock，不接后端 / LLM）——
 *
 * 定位：把用户已有记录整理成需要向他人说明的重点信息，
 *   并由用户确认哪些内容可以被对方看见。沟通材料仅作为流程完成后的结果。
 *
 * 核心原则：
 *   - 不做诊断、治疗建议、用药建议、因果解释或风险等级判断
 *   - 所有进入最终材料的沟通重点和特殊情况都必须由用户确认
 *   - 未选择、已删除或未授权的信息不进入最终材料
 *   - 通用 communicationTarget 结构，不写死医生
 *
 * 数据源：本文件内统一 Mock（小晨数据），不分散硬编码。
 * 不再依赖 lookbackData，避免两套数据模型冲突。 */

/* =========================================================
 * 数据模型
 * ======================================================= */

/** 沟通对象类型（可扩展：医生、家长、学校、心理咨询师等） */
export type CommunicationTargetType =
  | "doctor"
  | "parent"
  | "school"
  | "counselor";

/** 沟通对象配置 */
export interface CommunicationTargetConfig {
  targetType: CommunicationTargetType;
  targetLabel: string;
  desc: string;
  /** Demo 阶段是否可选 */
  available: boolean;
}

/** 沟通重点来源类型 */
export type TopicSourceType = "system_summary" | "user_added";

/** 沟通重点（一条系统整理结果或用户补充） */
export interface CommunicationTopic {
  id: string;
  title: string;
  content: string;
  sourceType: TopicSourceType;
  /** 依据摘要条目（系统整理结果用）；用户补充为 ["用户主动表达的问题"] */
  evidenceSummary: string[];
  selected: boolean;
  edited: boolean;
  deleted: boolean;
  /** 是否允许进入最终材料（未选择 / 已删除 / 未授权 = false） */
  allowedInMaterial: boolean;
}

/** 特殊情况披露决定 */
export type DisclosureDecision = "pending" | "include" | "exclude";

/** 特殊情况披露 */
export interface SpecialDisclosure {
  exists: boolean;
  count: number;
  /** 概要说明（只陈述事实） */
  summary: string;
  /** 详情条目（用户主动展开后显示） */
  detailRecords: string[];
  decision: DisclosureDecision;
  /** 是否经过二次确认 */
  confirmed: boolean;
  allowedInMaterial: boolean;
}

/** 沟通整理会话 */
export interface CommunicationSession {
  id: string;
  targetType: CommunicationTargetType;
  targetLabel: string;
  /** 时间段选择 key */
  rangeKey: RangeKey;
  /** 自定义开始日期（YYYY-MM-DD） */
  startDate: string;
  endDate: string;
  totalDays: number;
  recordedDays: number;
  /** 已覆盖的记录类型 */
  recordCategories: string[];
  communicationTopics: CommunicationTopic[];
  specialDisclosure: SpecialDisclosure;
  status: "in_progress" | "completed";
  createdAt: number;
}

/** 时间段选项 key */
export type RangeKey = "7" | "14" | "30" | "custom";

/** 历史条目：完成的会话持久化形式 */
export interface OrganizeHistoryEntry {
  id: string;
  targetType: CommunicationTargetType;
  targetLabel: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  recordedDays: number;
  /** 已确认沟通重点数量 */
  topicCount: number;
  /** 特殊情况是否纳入 */
  disclosureIncluded: boolean;
  /** 完成的会话快照（用于详情页 / 完整材料渲染） */
  session: CommunicationSession;
  createdAt: number;
}

/* =========================================================
 * 沟通对象配置（Demo 仅开放医生）
 * ======================================================= */

export const COMMUNICATION_TARGETS: CommunicationTargetConfig[] = [
  {
    targetType: "doctor",
    targetLabel: "精神科医生",
    desc: "用于就诊或复诊时说明近期情况",
    available: true,
  },
  {
    targetType: "parent",
    targetLabel: "家长或支持者",
    desc: "向家人或支持者说明近况",
    available: false,
  },
  {
    targetType: "school",
    targetLabel: "学校或老师",
    desc: "与学校或老师沟通时使用",
    available: false,
  },
  {
    targetType: "counselor",
    targetLabel: "心理咨询师",
    desc: "与心理咨询师沟通时使用",
    available: false,
  },
];

/* =========================================================
 * 时间段选项与覆盖信息
 * ======================================================= */

export const RANGE_OPTIONS: {
  value: RangeKey;
  label: string;
}[] = [
  { value: "7", label: "最近 7 天" },
  { value: "14", label: "最近 14 天" },
  { value: "30", label: "最近 30 天" },
  { value: "custom", label: "自定义时间" },
];

/** 默认自定义时间段（Demo 主路径预填） */
export const DEFAULT_CUSTOM_RANGE = {
  startDate: "2026-06-15",
  endDate: "2026-07-17",
};

/** 记录类型覆盖（统一 Mock 源） */
export const RECORD_CATEGORIES = [
  "睡眠",
  "情绪",
  "饮食",
  "用药",
  "身体感受",
  "学校与家庭",
];

/** 获取时间段的覆盖信息 */
export function getCoverage(rangeKey: RangeKey): {
  totalDays: number;
  recordedDays: number;
  startDate: string;
  endDate: string;
} {
  switch (rangeKey) {
    case "custom":
      return {
        totalDays: 33,
        recordedDays: 24,
        startDate: DEFAULT_CUSTOM_RANGE.startDate,
        endDate: DEFAULT_CUSTOM_RANGE.endDate,
      };
    case "7":
      return {
        totalDays: 7,
        recordedDays: 7,
        startDate: "2026-07-11",
        endDate: "2026-07-17",
      };
    case "14":
      return {
        totalDays: 14,
        recordedDays: 12,
        startDate: "2026-07-04",
        endDate: "2026-07-17",
      };
    case "30":
      return {
        totalDays: 30,
        recordedDays: 22,
        startDate: "2026-06-18",
        endDate: "2026-07-17",
      };
  }
}

/* =========================================================
 * 沟通重点 Mock 数据（5 条系统整理结果，来自小晨记录）
 * ======================================================= */

export function createMockTopics(): CommunicationTopic[] {
  return [
    {
      id: "topic-1",
      title: "吃药之后白天特别困",
      content: "上午第二三节课基本撑不住，趴过好几次。不知道是不是药的原因。",
      sourceType: "system_summary",
      evidenceSummary: [
        "33 天内有 18 天记录白天困倦",
        "相关记录主要集中在上午",
        "当前记录用药为舍曲林 50mg，每日一次",
        "24 个记录日中漏服 4 次",
      ],
      selected: false,
      edited: false,
      deleted: false,
      allowedInMaterial: false,
    },
    {
      id: "topic-2",
      title: "最近还是很难睡着",
      content: "基本都要一两点，脑子停不下来。有一天试了数呼吸的方法，好像有一点点用。",
      sourceType: "system_summary",
      evidenceSummary: [
        "多数记录日在 00:30—02:00 入睡",
        "最晚一次为 03:10",
        "11 天存在深夜反复思考相关记录",
        "7 月 4 日完成一次呼吸/接地练习",
      ],
      selected: false,
      edited: false,
      deleted: false,
      allowedInMaterial: false,
    },
    {
      id: "topic-3",
      title: "有几天早上没去成学校",
      content: "不是不想去，是出门前那种难受劲儿上来，动不了。",
      sourceType: "system_summary",
      evidenceSummary: [
        "33 天内有 4 天未到校",
        "日期为 6 月 22 日、6 月 29 日、7 月 8 日、7 月 13 日",
        "4 个未到校日均有晨起困难相关记录",
      ],
      selected: false,
      edited: false,
      deleted: false,
      allowedInMaterial: false,
    },
    {
      id: "topic-4",
      title: "和爸妈一说上学的事就容易吵",
      content: "尤其是关于上学的事。他们觉得我在找借口。",
      sourceType: "system_summary",
      evidenceSummary: [
        "33 天内有 6 次与父母冲突记录",
        "内容主要与是否到校、是否在找借口有关",
        "多数发生在晚间",
      ],
      selected: false,
      edited: false,
      deleted: false,
      allowedInMaterial: false,
    },
    {
      id: "topic-5",
      title: "想问医生：我这样算是在变好吗？",
      content: "自己感觉不出来。有的地方好像松了一点，有的地方还是老样子。",
      sourceType: "system_summary",
      evidenceSummary: ["用户主动表达的问题"],
      selected: false,
      edited: false,
      deleted: false,
      allowedInMaterial: false,
    },
  ];
}

/* =========================================================
 * 特殊情况披露 Mock 数据
 * ======================================================= */

export function createMockDisclosure(): SpecialDisclosure {
  return {
    exists: true,
    count: 2,
    summary:
      "所选时间段内有 2 条深夜记录包含消极念头表达。请确认是否将相关内容纳入本次沟通材料。",
    detailRecords: [
      "2026 年 6 月 24 日凌晨出现“撑不下去”类表达",
      "2026 年 7 月 6 日凌晨出现“撑不下去”类表达",
      "两次记录中均无自伤行为或计划",
      "33 天内无自伤相关记录",
      "2026 年 7 月 4 日凌晨主动完成一次呼吸/接地练习，记录为“还是睡不着，但好一点点”",
    ],
    decision: "pending",
    confirmed: false,
    allowedInMaterial: false,
  };
}

/* =========================================================
 * 其他记录概览 Mock 数据（完整材料用）
 * ======================================================= */

export interface OtherRecordSection {
  id: string;
  title: string;
  items: string[];
}

export const OTHER_RECORD_SECTIONS: OtherRecordSection[] = [
  {
    id: "medication",
    title: "用药与身体感受",
    items: [
      "舍曲林 50mg，每日一次",
      "24 个记录日中规律服用 20 天",
      "漏服 4 次：6/19、6/28、7/3、7/11",
      "白天困倦记录 18 天",
      "头晕记录 2 次：6/20、7/5",
    ],
  },
  {
    id: "sleep",
    title: "睡眠",
    items: [
      "多数入睡时间为 00:30—02:00",
      "最晚为 03:10",
      "7/9、7/10、7/14 在 0 点前入睡",
      "11 天存在深夜反复思考记录",
      "起床困难记录贯穿整个时间段",
    ],
  },
  {
    id: "diet-weight",
    title: "饮食与体重",
    items: [
      "体重：49.5kg（6/16）→ 48.7kg（7/12）",
      "24 个记录日中仅 3 天有早餐记录",
      "6 月下旬连续 4 天仅一餐",
      "7 月以来进食记录频次略有回升",
      "33 天内有 9 次含糖或含咖啡因饮品记录",
    ],
  },
  {
    id: "mood-behavior",
    title: "情绪与行为",
    items: [
      "记录内容以疲惫、低落、烦躁为主",
      "晚 9 点后至凌晨的记录密度高于白天",
      "期末考试前后记录密度上升",
      "5 天打开应用但未产生记录",
    ],
  },
  {
    id: "school-family",
    title: "学校与家庭",
    items: [
      "4 天未到校：6/22、6/29、7/8、7/13",
      "6 次与父母冲突记录",
      "仅 1 条同伴相关记录",
      "除上学外共有 2 次出门记录",
    ],
  },
];

/** 完整材料中的相关记录范围（确认沟通内容页用） */
export const RECORD_SCOPE_LABELS = [
  "用药与身体感受",
  "睡眠",
  "情绪与行为",
  "学校与家庭",
  "饮食与体重",
];

/** 材料说明文案 */
export const MATERIAL_DESCRIPTION =
  "本材料整理自 2026 年 6 月 15 日至 7 月 17 日共 33 天的应用内自我记录，其中 24 天存在记录。";

/** 免责声明 */
export const DISCLAIMER =
  "本材料由『在呀』应用根据用户自我记录整理生成，经用户本人确认后导出。内容为用户主观记录与应用使用状态数据，未经临床核实，不构成任何诊断或治疗建议。";

/* =========================================================
 * 会话与历史构建
 * ======================================================= */

/** 创建初始会话（开始整理时调用） */
export function createInitialSession(): CommunicationSession {
  const cov = getCoverage("30");
  return {
    id: Math.random().toString(36).slice(2),
    targetType: "doctor",
    targetLabel: "",
    rangeKey: "30",
    startDate: cov.startDate,
    endDate: cov.endDate,
    totalDays: cov.totalDays,
    recordedDays: cov.recordedDays,
    recordCategories: [...RECORD_CATEGORIES],
    communicationTopics: createMockTopics(),
    specialDisclosure: createMockDisclosure(),
    status: "in_progress",
    createdAt: Date.now(),
  };
}

/** 重新计算 allowedInMaterial：只有 selected 且未 deleted 的才允许进入材料 */
export function recomputeTopicPermissions(topics: CommunicationTopic[]): CommunicationTopic[] {
  return topics.map((t) => ({
    ...t,
    allowedInMaterial: t.selected && !t.deleted,
  }));
}

/** 获取进入最终材料的沟通重点 */
export function getMaterialTopics(session: CommunicationSession): CommunicationTopic[] {
  return session.communicationTopics.filter(
    (t) => t.allowedInMaterial && !t.deleted,
  );
}

/** 完成会话：固化状态并生成历史条目 */
export function completeSession(session: CommunicationSession): OrganizeHistoryEntry {
  const topics = recomputeTopicPermissions(session.communicationTopics);
  const topicCount = topics.filter((t) => t.allowedInMaterial).length;
  const disclosureIncluded =
    session.specialDisclosure.decision === "include" &&
    session.specialDisclosure.confirmed;
  const completed: CommunicationSession = {
    ...session,
    communicationTopics: topics,
    specialDisclosure: {
      ...session.specialDisclosure,
      allowedInMaterial: disclosureIncluded,
    },
    status: "completed",
  };
  return {
    id: completed.id,
    targetType: completed.targetType,
    targetLabel: completed.targetLabel,
    startDate: completed.startDate,
    endDate: completed.endDate,
    totalDays: completed.totalDays,
    recordedDays: completed.recordedDays,
    topicCount,
    disclosureIncluded,
    session: completed,
    createdAt: completed.createdAt,
  };
}

/* =========================================================
 * 完整材料构建（详情页 / 完整内容视图 / 导出共用）
 * ======================================================= */

export interface MaterialSection {
  id: string;
  title: string;
  /** 段落文本（材料说明 / 免责声明） */
  paragraph?: string;
  /** 沟通重点列表（仅"本次希望讨论的问题"用） */
  topics?: { title: string; content: string; sourceType: TopicSourceType }[];
  /** 相关记录事实（按沟通重点关联） */
  facts?: { topicTitle: string; evidence: string[] }[];
  /** 经确认的特殊情况 */
  disclosure?: { summary: string; detailRecords: string[] };
  /** 其他记录概览 */
  otherRecords?: { title: string; items: string[] }[];
}

/** 构建完整材料结构 */
export function buildFullMaterial(session: CommunicationSession): MaterialSection[] {
  const sections: MaterialSection[] = [];

  // 1. 材料说明
  sections.push({
    id: "description",
    title: "材料说明",
    paragraph: MATERIAL_DESCRIPTION,
  });

  // 2. 本次希望讨论的问题
  const materialTopics = getMaterialTopics(session);
  if (materialTopics.length > 0) {
    sections.push({
      id: "topics",
      title: "本次希望和医生讨论的问题",
      topics: materialTopics.map((t) => ({
        title: t.title,
        content: t.content,
        sourceType: t.sourceType,
      })),
    });
  }

  // 3. 与所选问题相关的记录事实
  if (materialTopics.length > 0) {
    sections.push({
      id: "facts",
      title: "与所选问题相关的记录事实",
      facts: materialTopics.map((t) => ({
        topicTitle: t.title,
        evidence: t.evidenceSummary,
      })),
    });
  }

  // 4. 经用户确认纳入的特殊情况
  if (session.specialDisclosure.allowedInMaterial) {
    sections.push({
      id: "disclosure",
      title: "经用户确认纳入的特殊情况",
      disclosure: {
        summary: session.specialDisclosure.summary,
        detailRecords: session.specialDisclosure.detailRecords,
      },
    });
  }

  // 5. 其他记录概览
  sections.push({
    id: "other-records",
    title: "其他记录概览",
    otherRecords: OTHER_RECORD_SECTIONS.map((s) => ({
      title: s.title,
      items: s.items,
    })),
  });

  // 6. 免责声明
  sections.push({
    id: "disclaimer",
    title: "免责声明",
    paragraph: DISCLAIMER,
  });

  return sections;
}

/** 构建可分享/复制的纯文本 */
export function buildShareText(session: CommunicationSession): string {
  const lines: string[] = [];
  lines.push(`沟通材料（给${session.targetLabel}）`);
  lines.push(
    `时间范围：${formatDateRange(session.startDate, session.endDate)}（共 ${session.totalDays} 天，${session.recordedDays} 天有记录）`,
  );
  lines.push("");

  const materialTopics = getMaterialTopics(session);
  if (materialTopics.length > 0) {
    lines.push("本次希望讨论的问题：");
    materialTopics.forEach((t, i) => {
      lines.push(`${i + 1}. ${t.title}`);
      lines.push(`   ${t.content}`);
    });
    lines.push("");
  }

  if (session.specialDisclosure.allowedInMaterial) {
    lines.push("经确认纳入的特殊情况：");
    lines.push(`包含 ${session.specialDisclosure.count} 条经本人确认的深夜记录`);
    lines.push("");
  }

  lines.push(MATERIAL_DESCRIPTION);
  lines.push("");
  lines.push(DISCLAIMER);
  return lines.join("\n");
}

/* =========================================================
 * 日期格式化
 * ======================================================= */

/** YYYY-MM-DD → YYYY.MM.DD */
export function formatDateDotted(dateStr: string): string {
  return dateStr.replace(/-/g, ".");
}

/** 时间段格式化：2026-06-15 ~ 2026-07-17 → 2026.06.15—2026.07.17 */
export function formatDateRange(start: string, end: string): string {
  return `${formatDateDotted(start)}—${formatDateDotted(end)}`;
}

/** 时间戳 → 创建于 YYYY.MM.DD */
export function formatCreatedAt(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

/* =========================================================
 * localStorage 持久化
 * ======================================================= */

const SESSION_KEY = "zaiya_organize_session";
const HISTORY_KEY = "zaiya_organize_history";

/** 保存进行中的会话 */
export function saveSession(session: CommunicationSession): void {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // 忽略写入失败
  }
}

/** 加载进行中的会话（刷新恢复） */
export function loadSession(): CommunicationSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CommunicationSession;
    if (parsed.status === "completed") return null;
    return parsed;
  } catch {
    return null;
  }
}

/** 清除进行中的会话 */
export function clearSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // 忽略
  }
}

/** 加载历史（localStorage，跨刷新持久） */
export function loadHistory(): OrganizeHistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OrganizeHistoryEntry[];
  } catch {
    return [];
  }
}

/** 保存历史（全量写入） */
export function saveHistory(history: OrganizeHistoryEntry[]): void {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // 忽略
  }
}

/** 追加一条历史 */
export function appendHistory(
  history: OrganizeHistoryEntry[],
  entry: OrganizeHistoryEntry,
): OrganizeHistoryEntry[] {
  const next = [entry, ...history];
  saveHistory(next);
  return next;
}

/** 删除一条历史 */
export function removeHistory(
  history: OrganizeHistoryEntry[],
  id: string,
): OrganizeHistoryEntry[] {
  const next = history.filter((e) => e.id !== id);
  saveHistory(next);
  return next;
}
