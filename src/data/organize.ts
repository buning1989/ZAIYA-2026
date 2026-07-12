/* —— 「帮我整理」沟通准备模块（本地 mock，不接后端 / LLM）——
 *
 * 定位：用户在与现实中的某个具体人物进行重要沟通前，完成：
 *   1. 选择这次要和谁沟通；
 *   2. 确认这次想沟通什么；
 *   3. 选择准备采用什么沟通方式；
 *   4. 确认哪些信息可以让对方看到。
 *
 * 报告或沟通材料只是其中一种输出方式，不是模块的核心目标。
 *
 * 核心原则：
 *   - 不做诊断、治疗建议、用药建议、因果解释或风险等级判断
 *   - 所有进入最终材料的沟通重点和特殊情况都必须由用户确认
 *   - 未选择或未授权的信息不进入最终材料
 *   - 沟通对象为具体人物（王医生），不写死"医生"
 *   - 沟通对象与「我的隐私」可信联系人分开建模
 *
 * 数据源：本文件内统一 Mock（小晨数据），不分散硬编码。 */

/* =========================================================
 * 沟通对象与可信联系人
 * ======================================================= */

/** 沟通对象角色分类（可扩展） */
export type CommunicationRoleType =
  | "doctor"
  | "parent"
  | "school"
  | "counselor"
  | "other";

/** 沟通对象：具体的人，用于本次沟通准备 */
export interface CommunicationContact {
  id: string;
  /** 用户看到的具体称呼 */
  displayName: string;
  /** 系统内部角色分类 */
  roleType: CommunicationRoleType;
  /** 用户可读的角色名称 */
  roleLabel: string;
  /** 来源 */
  source: "trusted_contact" | "organize_added";
  /** 来源于可信联系人时保存弱关联，不复制联系方式 */
  trustedContactId?: string;
  createdAt: number;
  lastUsedAt?: number;
}

/** Demo Mock 沟通对象 */
export const MOCK_COMMUNICATION_CONTACTS: CommunicationContact[] = [
  {
    id: "contact-wang-doctor",
    displayName: "王医生",
    roleType: "doctor",
    roleLabel: "精神科医生",
    source: "organize_added",
    createdAt: Date.now(),
    lastUsedAt: Date.now(),
  },
];

/** Demo Mock 可信联系人候选（用于"从可信联系人添加"） */
export const MOCK_TRUSTED_CONTACT_CANDIDATES: {
  id: string;
  displayName: string;
  roleType: CommunicationRoleType;
  roleLabel: string;
}[] = [
  {
    id: "trusted-dad",
    displayName: "我爸爸",
    roleType: "parent",
    roleLabel: "家长或支持者",
  },
];

/** 角色选项（新增沟通对象时选择） */
export const ROLE_OPTIONS: {
  value: CommunicationRoleType;
  label: string;
  /** Demo 阶段该角色是否开放完整流程 */
  available: boolean;
}[] = [
  { value: "doctor", label: "医生", available: true },
  { value: "parent", label: "家长或支持者", available: false },
  { value: "school", label: "学校或老师", available: false },
  { value: "counselor", label: "心理咨询师", available: false },
  { value: "other", label: "其他", available: false },
];

/* =========================================================
 * 沟通重点 / 特殊情况 / 沟通方式
 * ======================================================= */

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
  /** 是否允许进入最终材料（未选择 = false） */
  allowedInMaterial: boolean;
}

/** 特殊情况披露决定 */
export type DisclosureDecision = "pending" | "include" | "exclude";

/** 敏感表达分类（仅内部用，UI 不直接展示） */
export type SensitiveCategory =
  | "self_harm_expression"
  | "suicidal_ideation_expression"
  | "severe_conflict"
  | "loss_of_control"
  | "other_sensitive";

/** 特殊记录原文（展示用户当时填写的真实内容，不做系统摘要） */
export interface SensitiveOriginalRecord {
  id: string;
  /** ISO 时间，用于展示「6 月 24 日 01:32」 */
  recordedAt: string;
  /** 记录类型，如「情绪记录」 */
  recordType: string;
  /** 用户当时填写的原文，不做改写、不做摘要、不做风险判断 */
  originalText: string;
  /** 为什么需要单独确认（UI 展示用，克制描述，不做诊断/风险判断） */
  confirmReason: string;
  /** 敏感表达分类（仅内部用，UI 不直接展示） */
  sensitiveCategory: SensitiveCategory;
}

/** 特殊情况披露 */
export interface SpecialDisclosure {
  exists: boolean;
  count: number;
  /** 真实原始记录（用户原文） */
  originalRecords: SensitiveOriginalRecord[];
  decision: DisclosureDecision;
  /** 是否经过确认（点击任一按钮即为确认） */
  confirmed: boolean;
  allowedInMaterial: boolean;
}

/* =========================================================
 * 时间段
 * ======================================================= */

export type RangeKey = "7" | "14" | "30" | "custom";

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
 * 会话与历史
 * ======================================================= */

/** 沟通对象快照（保存入会话/历史，不随后续修改而变化） */
export interface ContactSnapshot {
  displayName: string;
  roleType: CommunicationRoleType;
  roleLabel: string;
}

/** 沟通整理会话 */
export interface CommunicationSession {
  id: string;
  /** 所选沟通对象 ID */
  contactId: string;
  /** 沟通对象快照（创建当时的信息） */
  contactSnapshot: ContactSnapshot;
  /** 时间段选择 key */
  rangeKey: RangeKey;
  startDate: string;
  endDate: string;
  totalDays: number;
  recordedDays: number;
  recordCategories: string[];
  communicationTopics: CommunicationTopic[];
  specialDisclosure: SpecialDisclosure;
  status: "in_progress" | "completed";
  createdAt: number;
}

/** 历史条目：完成的会话持久化形式 */
export interface OrganizeHistoryEntry {
  id: string;
  contactId: string;
  contactSnapshot: ContactSnapshot;
  startDate: string;
  endDate: string;
  totalDays: number;
  recordedDays: number;
  topicCount: number;
  /** 特殊情况是否纳入 */
  disclosureIncluded: boolean;
  /** 完成的会话快照 */
  session: CommunicationSession;
  createdAt: number;
}

/* =========================================================
 * Mock 数据（小晨）
 * ======================================================= */

/** 创建 5 条 Mock 沟通重点（默认全部选中） */
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
      selected: true,
      edited: false,
      allowedInMaterial: true,
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
      selected: true,
      edited: false,
      allowedInMaterial: true,
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
      selected: true,
      edited: false,
      allowedInMaterial: true,
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
      selected: true,
      edited: false,
      allowedInMaterial: true,
    },
    {
      id: "topic-5",
      title: "想问王医生：我这样算是在变好吗？",
      content: "自己感觉不出来。有的地方好像松了一点，有的地方还是老样子。",
      sourceType: "system_summary",
      evidenceSummary: ["用户主动表达的问题"],
      selected: true,
      edited: false,
      allowedInMaterial: true,
    },
  ];
}

/** 创建 Mock 特殊情况披露（小晨 2 条深夜情绪记录原文） */
export function createMockDisclosure(): SpecialDisclosure {
  return {
    exists: true,
    count: 2,
    originalRecords: [
      {
        id: "sensitive-1",
        recordedAt: "2026-06-24T01:32",
        recordType: "情绪记录",
        originalText:
          "又到一点多了还是睡不着。脑子里全是明天的课，作业也没写完。躺着躺着突然觉得特别没意思，好像怎么都撑不下去，但又说不上来撑不下去是什么意思。就是很累。",
        confirmReason: "涉及：撑不下去、无力感相关表达",
        sensitiveCategory: "self_harm_expression",
      },
      {
        id: "sensitive-2",
        recordedAt: "2026-07-06T01:48",
        recordType: "情绪记录",
        originalText:
          "睡不着。晚上又和妈妈因为上学的事吵了一架，她说我就是在找借口。我不想跟她吵，心里堵得慌。那种感觉又上来了，好像再怎么努力也没用。",
        confirmReason: "涉及：强烈焦虑、冲突后失控感",
        sensitiveCategory: "loss_of_control",
      },
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

/** 完整材料中的相关记录范围（确认页用） */
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

/** 创建初始会话（选定沟通对象后调用） */
export function createInitialSession(contact: CommunicationContact): CommunicationSession {
  const cov = getCoverage("custom");
  return {
    id: Math.random().toString(36).slice(2),
    contactId: contact.id,
    contactSnapshot: {
      displayName: contact.displayName,
      roleType: contact.roleType,
      roleLabel: contact.roleLabel,
    },
    rangeKey: "custom",
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

/** 重新计算 allowedInMaterial：只有 selected 的才允许进入材料 */
export function recomputeTopicPermissions(topics: CommunicationTopic[]): CommunicationTopic[] {
  return topics.map((t) => ({
    ...t,
    allowedInMaterial: t.selected,
  }));
}

/** 获取进入最终材料的沟通重点 */
export function getMaterialTopics(session: CommunicationSession): CommunicationTopic[] {
  return session.communicationTopics.filter((t) => t.allowedInMaterial && t.selected);
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
    contactId: completed.contactId,
    contactSnapshot: completed.contactSnapshot,
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
 * 沟通清单 / 完整材料构建
 * ======================================================= */

/** 沟通清单结构（简洁，用于现场查看） */
export interface ChecklistData {
  contactName: string;
  dateRange: string;
  topics: { title: string; content: string }[];
  /** 单独确认的特殊记录（仅当用户选择告诉对方时存在） */
  disclosure?: { records: SensitiveOriginalRecord[] };
}

/** 构建沟通清单 */
export function buildChecklist(session: CommunicationSession): ChecklistData {
  const topics = getMaterialTopics(session);
  const data: ChecklistData = {
    contactName: session.contactSnapshot.displayName,
    dateRange: formatDateRange(session.startDate, session.endDate),
    topics: topics.map((t) => ({ title: t.title, content: t.content })),
  };
  if (session.specialDisclosure.allowedInMaterial) {
    data.disclosure = {
      records: session.specialDisclosure.originalRecords,
    };
  }
  return data;
}

export interface MaterialSection {
  id: string;
  title: string;
  paragraph?: string;
  topics?: { title: string; content: string; sourceType: TopicSourceType }[];
  facts?: { topicTitle: string; evidence: string[] }[];
  /** 经用户确认纳入的特殊记录原文（仅当用户选择告诉对方时存在） */
  disclosureRecords?: SensitiveOriginalRecord[];
  otherRecords?: { title: string; items: string[] }[];
}

/** 构建完整材料结构 */
export function buildFullMaterial(session: CommunicationSession): MaterialSection[] {
  const sections: MaterialSection[] = [];
  const name = session.contactSnapshot.displayName;

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
      title: `本次希望和${name}讨论的问题`,
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

  // 4. 经用户确认纳入的特殊记录（仅当用户选择告诉对方时展示原文）
  if (session.specialDisclosure.allowedInMaterial) {
    sections.push({
      id: "disclosure",
      title: "经用户确认纳入的特殊记录",
      paragraph: "该记录经用户确认后纳入。",
      disclosureRecords: session.specialDisclosure.originalRecords,
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
  const name = session.contactSnapshot.displayName;
  const lines: string[] = [];
  lines.push(`给${name}的沟通材料`);
  lines.push(
    `时间范围：${formatDateRange(session.startDate, session.endDate)}（共 ${session.totalDays} 天，${session.recordedDays} 天有记录）`,
  );
  lines.push("");

  const materialTopics = getMaterialTopics(session);
  if (materialTopics.length > 0) {
    lines.push(`本次希望和${name}讨论的问题：`);
    materialTopics.forEach((t, i) => {
      lines.push(`${i + 1}. ${t.title}`);
      lines.push(`   ${t.content}`);
    });
    lines.push("");
  }

  if (session.specialDisclosure.allowedInMaterial) {
    lines.push("经确认纳入的特殊记录（该记录经用户确认后纳入）：");
    session.specialDisclosure.originalRecords.forEach((r) => {
      lines.push(`- ${formatSensitiveRecordTime(r.recordedAt)} ${r.recordType}`);
      lines.push(`  ${r.originalText}`);
    });
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

/** 时间段格式化为中文：2026-06-15 ~ 2026-07-17 → 6 月 15 日—7 月 17 日 */
export function formatDateRangeChinese(start: string, end: string): string {
  const fmt = (s: string) => {
    const parts = s.split("-");
    return `${Number(parts[1])} 月 ${Number(parts[2])} 日`;
  };
  return `${fmt(start)}—${fmt(end)}`;
}

/** 时间戳 → 创建于 YYYY.MM.DD */
export function formatCreatedAt(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

/** 特殊记录时间格式化：2026-06-24T01:32 → 6 月 24 日 01:32 */
export function formatSensitiveRecordTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* =========================================================
 * localStorage 持久化
 * ======================================================= */

const SESSION_KEY = "zaiya_organize_session";
const HISTORY_KEY = "zaiya_organize_history";
const CONTACTS_KEY = "zaiya_organize_contacts";

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
    const parsed = JSON.parse(raw);
    if (!isRestorableSession(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isRestorableSession(value: unknown): value is CommunicationSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<CommunicationSession>;
  return (
    session.status === "in_progress" &&
    typeof session.id === "string" &&
    typeof session.contactId === "string" &&
    !!session.contactSnapshot &&
    typeof session.contactSnapshot.displayName === "string" &&
    typeof session.startDate === "string" &&
    typeof session.endDate === "string" &&
    typeof session.totalDays === "number" &&
    typeof session.recordedDays === "number" &&
    Array.isArray(session.recordCategories) &&
    Array.isArray(session.communicationTopics) &&
    session.communicationTopics.length > 0 &&
    session.communicationTopics.every(
      (topic) =>
        !!topic &&
        typeof topic.id === "string" &&
        typeof topic.title === "string" &&
        typeof topic.content === "string" &&
        typeof topic.selected === "boolean" &&
        Array.isArray(topic.evidenceSummary),
    ) &&
    !!session.specialDisclosure
  );
}

/** 清除进行中的会话 */
export function clearSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // 忽略
  }
}

/** 加载沟通对象列表（localStorage + Mock 默认） */
export function loadContacts(): CommunicationContact[] {
  try {
    const raw = window.localStorage.getItem(CONTACTS_KEY);
    if (!raw) return [...MOCK_COMMUNICATION_CONTACTS];
    return JSON.parse(raw) as CommunicationContact[];
  } catch {
    return [...MOCK_COMMUNICATION_CONTACTS];
  }
}

/** 保存沟通对象列表 */
export function saveContacts(contacts: CommunicationContact[]): void {
  try {
    window.localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  } catch {
    // 忽略
  }
}

/** 新增沟通对象 */
export function addContact(contact: CommunicationContact): CommunicationContact[] {
  const next = [...loadContacts(), contact];
  saveContacts(next);
  return next;
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
