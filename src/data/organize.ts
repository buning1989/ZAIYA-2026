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
 * 完整材料 vs 沟通清单：
 *   - 沟通清单：给用户自己看，简短可扫读，聚焦本次沟通内容
 *   - 完整材料：给专业人士看，信息完整、结构严谨、事实可追溯
 *   - 完整材料包含 11 个结构化段落，区分记录事实 / 用户主观表达 /
 *     系统整理摘要 / 待专业人士判断的问题，不将系统推断写成确定事实
 *
 * 数据源：本文件内统一 Mock（小晨数据），不分散硬编码。
 *   用户基本信息（昵称 / 年龄 / 年级）从 userProfile 统一读取，不在此处重复维护。 */

import { calculateAge, MOCK_USER_PROFILE } from "@/data/userProfile";

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

/** 高风险记录披露决定 */
export type DisclosureDecision = "pending" | "include" | "exclude";

/**
 * 高风险内部识别分类（仅用于内部筛选，不在 UI 展示）。
 * 产品不在此处评定用户具体属于哪类行为，只做「高风险原话是否披露」的确认。
 */
export type RiskCategory =
  | "self_harm"
  | "od_or_medication_abuse"
  | "suicidal_ideation_or_behavior"
  | "harmed_by_others";

/** 高风险记录来源场景（仅这两种，UI 展示为「情绪记录」/「对话模式」） */
export type HighRiskSourceType = "emotion_record" | "conversation";

/**
 * 高风险原话记录：完整展示用户原话，不改写、不摘要、不提取关键词、
 * 不合并、不展示 AI 解释或总结。对话来源只展示用户自己的原话。
 * 默认不选；用户主动勾选后该条才进入材料。
 */
export interface HighRiskOriginalRecord {
  id: string;
  sourceType: HighRiskSourceType;
  /** 来源场景可读标签（UI 唯一展示的来源信息） */
  sourceLabel: "情绪记录" | "对话模式";
  /** ISO 时间，用于展示「6 月 24 日 01:32」 */
  recordedAt: string;
  /** 用户原话，完整展示 */
  originalText: string;
  /** 是否被用户勾选放入材料（默认 false） */
  selected: boolean;
  /** 内部高风险分类，不在 UI 展示 */
  riskCategory: RiskCategory;
}

/** 高风险记录披露决策容器 */
export interface SpecialDisclosure {
  exists: boolean;
  count: number;
  /** 高风险原话记录（完整展示用户原文） */
  originalRecords: HighRiskOriginalRecord[];
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

/** 创建 Mock 高风险记录披露
 * 4 条高风险原话，覆盖情绪记录 / 对话模式两种来源，
 * 内部 riskCategory 覆盖自我伤害、OD/药物滥用、自杀倾向、被他人伤害四类（仅内部，不在 UI 展示）。
 * 全部默认 selected: false，用户需逐条勾选才放入材料。
 * originalText 均使用小晨 Demo 中已有的真实记录或对话原文，不改写、不摘要。 */
export function createMockDisclosure(): SpecialDisclosure {
  return {
    exists: true,
    count: 4,
    originalRecords: [
      {
        id: "highrisk-1",
        sourceType: "emotion_record",
        sourceLabel: "情绪记录",
        recordedAt: "2026-06-24T01:32",
        originalText:
          "又到一点多了还是睡不着。脑子里全是明天的课，作业也没写完。躺着躺着突然觉得特别没意思，好像怎么都撑不下去，但又说不上来撑不下去是什么意思。就是很累。",
        selected: false,
        // 内部分类，不在 UI 展示
        riskCategory: "suicidal_ideation_or_behavior",
      },
      {
        id: "highrisk-2",
        sourceType: "emotion_record",
        sourceLabel: "情绪记录",
        recordedAt: "2026-07-06T01:48",
        originalText:
          "睡不着。晚上又和妈妈因为上学的事吵了一架，她说我就是在找借口。我不想跟她吵，心里堵得慌。那种感觉又上来了，好像再怎么努力也没用。",
        selected: false,
        // 内部分类，不在 UI 展示
        riskCategory: "self_harm",
      },
      {
        id: "highrisk-3",
        sourceType: "conversation",
        sourceLabel: "对话模式",
        recordedAt: "2026-07-12T07:35",
        originalText:
          "我又没去学校。我妈一直问我怎么办，我不知道，我真的不知道。",
        selected: false,
        // 内部分类，不在 UI 展示
        riskCategory: "harmed_by_others",
      },
      {
        id: "highrisk-4",
        sourceType: "conversation",
        sourceLabel: "对话模式",
        recordedAt: "2026-07-12T14:20",
        originalText:
          "落了三张数学卷子，刚才想补，打开三分钟就受不了了。我知道我该学，但我真的动不了。",
        selected: false,
        // 内部分类，不在 UI 展示
        riskCategory: "od_or_medication_abuse",
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

/** 按当前会话生成材料说明，避免 demo/历史材料与固定 mock 日期不一致 */
export function buildMaterialDescription(session: CommunicationSession): string {
  return `本材料整理自 ${formatDateRangeChinese(session.startDate, session.endDate)} 共 ${session.totalDays} 天的应用内自我记录，其中 ${session.recordedDays} 天存在记录。`;
}

/** 免责声明 */
export const DISCLAIMER =
  "本材料由『在呀』应用根据用户自我记录整理生成，经用户本人确认后导出。内容为用户主观记录与应用使用状态数据，未经临床核实，不构成任何诊断或治疗建议。";

/* =========================================================
 * 完整材料补充数据（Mock）
 * 以下数据为 Demo 阶段固定 Mock，用于完整材料中
 * 「本阶段主要变化」「关键时间节点」「异常变化」「信息缺失」等段落。
 * 语言遵循事实分层原则：记录事实 / 用户主观表达 / 系统整理摘要 /
 * 待专业人士判断的问题，不将系统推断写成确定事实。
 * ======================================================= */

/** 本阶段主要变化（系统整理摘要，非临床结论） */
export const MAIN_CHANGES: { title: string; items: string[] }[] = [
  {
    title: "体重",
    items: [
      "6 月 16 日记录 49.5kg，7 月 12 日记录 48.7kg，下降 0.8kg",
      "仅有 2 个体重记录点，趋势需更多数据确认",
    ],
  },
  {
    title: "睡眠",
    items: [
      "多数记录日入睡时间在 00:30—02:00",
      "7 月 9 日、10 日、14 日在 0 点前入睡",
      "起床困难记录贯穿整个时间段",
    ],
  },
  {
    title: "用药",
    items: [
      "舍曲林 50mg 每日一次，24 个记录日中规律服用 20 天",
      "漏服 4 次：6/19、6/28、7/3、7/11",
    ],
  },
  {
    title: "到校",
    items: [
      "33 天内 4 天未到校：6/22、6/29、7/8、7/13",
      "4 个未到校日均有晨起困难相关记录",
    ],
  },
];

/** 关键时间节点（可核对的记录事实） */
export const KEY_TIME_POINTS: { title: string; items: string[] }[] = [
  {
    title: "记录时间线",
    items: [
      "6/15 记录开始",
      "6/22 首次未到校",
      "6/29 第二次未到校",
      "7/4 完成一次呼吸/接地练习",
      "7/8 第三次未到校",
      "7/13 第四次未到校",
      "7/17 记录结束",
    ],
  },
];

/** 异常变化或特殊情况（系统整理，具体临床意义需由专业人士判断） */
export const ABNORMAL_CHANGES: { title: string; items: string[] }[] = [
  {
    title: "记录中出现的异常变化",
    items: [
      "体重在 26 天内下降 0.8kg，记录点较少，趋势不确定",
      "漏服药物 4 次，分布在不同月份",
      "11 天存在深夜反复思考相关记录",
      "白天困倦记录 18 天，与服药时间的相关性需由专业人士判断",
      "6 次与父母冲突记录，多数发生在晚间",
    ],
  },
];

/** 信息缺失或不确定项 */
export const MISSING_INFO: { title: string; items: string[] }[] = [
  {
    title: "记录覆盖与缺失",
    items: [
      "33 天中 9 天无记录，无法确认状态",
      "5 天打开应用但未产生记录",
      "体重记录仅有 2 个时间点，无法判断完整趋势",
      "仅 1 条同伴相关记录，社交情况信息不足",
      "白天困倦是否与药物相关，记录中无法确认因果关系",
    ],
  },
];

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
  /** 用户确认放入材料的高风险记录（仅当用户选择告诉对方时存在） */
  disclosure?: { records: HighRiskOriginalRecord[] };
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
    const selectedRecords = session.specialDisclosure.originalRecords.filter(
      (r) => r.selected,
    );
    if (selectedRecords.length > 0) {
      data.disclosure = { records: selectedRecords };
    }
  }
  return data;
}

export interface MaterialSection {
  id: string;
  title: string;
  paragraph?: string;
  topics?: { title: string; content: string; sourceType: TopicSourceType }[];
  facts?: { topicTitle: string; evidence: string[] }[];
  /** 用户确认放入材料的高风险记录原文（仅当用户选择告诉对方时存在） */
  disclosureRecords?: HighRiskOriginalRecord[];
  otherRecords?: { title: string; items: string[] }[];
}

/** 构建完整材料结构（11 段，给专业人士查看）
 *
 * 与沟通清单的差异：
 *   - 沟通清单只列出本次要讨论的问题 + 高风险记录
 *   - 完整材料包含基本信息、时间范围、主要变化、记录概况、关键时间节点、
 *     异常变化、用户主观感受、可核对事实、待判断问题、信息缺失、免责声明
 *   - 事实分层：记录事实 / 用户主观表达 / 系统整理摘要 / 待专业人士判断的问题
 *   - 不将系统推断写成确定事实
 *   - 不增加诊断、治疗、用药建议 */
export function buildFullMaterial(session: CommunicationSession): MaterialSection[] {
  const sections: MaterialSection[] = [];
  const name = session.contactSnapshot.displayName;
  const materialTopics = getMaterialTopics(session);
  const { nickname, birthDate, grade } = MOCK_USER_PROFILE.basicInfo;
  const age = calculateAge(birthDate);

  // 1. 基本信息
  sections.push({
    id: "basic-info",
    title: "基本信息",
    otherRecords: [
      {
        title: "用户信息",
        items: [
          `昵称：${nickname}`,
          `年龄：${age} 岁（由出生日期推算）`,
          `年级：${grade}`,
          `沟通对象：${name}（${session.contactSnapshot.roleLabel}）`,
          `材料创建日期：${formatCreatedAt(session.createdAt)}`,
        ],
      },
    ],
  });

  // 2. 材料时间范围
  sections.push({
    id: "time-range",
    title: "材料时间范围",
    paragraph: `${formatDateRangeChinese(session.startDate, session.endDate)}，共 ${session.totalDays} 天，其中 ${session.recordedDays} 天有记录。记录类型覆盖：${session.recordCategories.join("、")}。`,
  });

  // 3. 本阶段主要变化（系统整理摘要，非临床结论）
  sections.push({
    id: "main-changes",
    title: "本阶段主要变化",
    paragraph: "以下为应用内记录的系统整理摘要，不构成临床判断。",
    otherRecords: MAIN_CHANGES,
  });

  // 4. 记录概况（按类别分组的可核对事实）
  sections.push({
    id: "record-overview",
    title: "记录概况",
    paragraph: "以下为各记录类别的概况，数据均来自应用内用户自我记录。",
    otherRecords: OTHER_RECORD_SECTIONS.map((s) => ({
      title: s.title,
      items: s.items,
    })),
  });

  // 5. 关键时间节点（可核对的记录事实）
  sections.push({
    id: "key-time-points",
    title: "关键时间节点",
    otherRecords: KEY_TIME_POINTS,
  });

  // 6. 异常变化或特殊情况（系统整理，具体临床意义需由专业人士判断）
  sections.push({
    id: "abnormal-changes",
    title: "异常变化或特殊情况",
    paragraph: "以下为记录中出现的异常变化或特殊情况。具体原因及临床意义需由专业人士进一步判断。",
    otherRecords: ABNORMAL_CHANGES,
  });

  // 7. 用户主观感受（用户原话，仅展示经确认纳入的高风险记录）
  if (session.specialDisclosure.allowedInMaterial) {
    const selectedRecords = session.specialDisclosure.originalRecords.filter(
      (r) => r.selected,
    );
    if (selectedRecords.length > 0) {
      sections.push({
        id: "subjective-feelings",
        title: "用户主观感受",
        paragraph: "以下为用户在应用内记录的原话，经用户确认后纳入材料。内容为用户主观表达，未经核实。",
        disclosureRecords: selectedRecords,
      });
    }
  }

  // 8. 可核对的记录事实（与沟通重点相关的证据摘要）
  if (materialTopics.length > 0) {
    sections.push({
      id: "verifiable-facts",
      title: "可核对的记录事实",
      paragraph: "以下为与本次沟通重点相关的记录事实摘要，均可在应用内对应记录中溯源。",
      facts: materialTopics.map((t) => ({
        topicTitle: t.title,
        evidence: t.evidenceSummary,
      })),
    });
  }

  // 9. 希望专业人士协助判断的问题
  if (materialTopics.length > 0) {
    sections.push({
      id: "questions-for-professional",
      title: `希望和${name}协助判断的问题`,
      paragraph: "以下为用户希望与专业人士讨论的问题，由用户确认后纳入材料。",
      topics: materialTopics.map((t) => ({
        title: t.title,
        content: t.content,
        sourceType: t.sourceType,
      })),
    });
  }

  // 10. 信息缺失或不确定项
  sections.push({
    id: "missing-info",
    title: "信息缺失或不确定项",
    paragraph: "以下为记录中信息不完整或无法确认的部分，供专业人士参考。",
    otherRecords: MISSING_INFO,
  });

  // 11. 免责声明
  sections.push({
    id: "disclaimer",
    title: "免责声明",
    paragraph: DISCLAIMER,
  });

  return sections;
}

/** 构建可分享/复制的纯文本（与完整材料结构一致） */
export function buildShareText(session: CommunicationSession): string {
  const name = session.contactSnapshot.displayName;
  const lines: string[] = [];
  const { nickname, birthDate, grade } = MOCK_USER_PROFILE.basicInfo;
  const age = calculateAge(birthDate);
  const materialTopics = getMaterialTopics(session);

  lines.push(`给${name}的沟通材料`);
  lines.push("");

  // 1. 基本信息
  lines.push("【基本信息】");
  lines.push(`用户：${nickname}，${age} 岁，${grade}`);
  lines.push(`沟通对象：${name}（${session.contactSnapshot.roleLabel}）`);
  lines.push(`材料创建日期：${formatCreatedAt(session.createdAt)}`);
  lines.push("");

  // 2. 材料时间范围
  lines.push("【材料时间范围】");
  lines.push(
    `${formatDateRangeChinese(session.startDate, session.endDate)}，共 ${session.totalDays} 天，其中 ${session.recordedDays} 天有记录`,
  );
  lines.push(`记录类型：${session.recordCategories.join("、")}`);
  lines.push("");

  // 3. 本阶段主要变化
  lines.push("【本阶段主要变化】");
  MAIN_CHANGES.forEach((s) => {
    lines.push(s.title);
    s.items.forEach((it) => lines.push(`  - ${it}`));
  });
  lines.push("");

  // 4. 记录概况
  lines.push("【记录概况】");
  OTHER_RECORD_SECTIONS.forEach((s) => {
    lines.push(s.title);
    s.items.forEach((it) => lines.push(`  - ${it}`));
  });
  lines.push("");

  // 5. 关键时间节点
  lines.push("【关键时间节点】");
  KEY_TIME_POINTS.forEach((s) => {
    s.items.forEach((it) => lines.push(`  - ${it}`));
  });
  lines.push("");

  // 6. 异常变化或特殊情况
  lines.push("【异常变化或特殊情况】");
  lines.push("具体原因及临床意义需由专业人士进一步判断。");
  ABNORMAL_CHANGES.forEach((s) => {
    s.items.forEach((it) => lines.push(`  - ${it}`));
  });
  lines.push("");

  // 7. 用户主观感受
  if (session.specialDisclosure.allowedInMaterial) {
    const selectedRecords = session.specialDisclosure.originalRecords.filter(
      (r) => r.selected,
    );
    if (selectedRecords.length > 0) {
      lines.push("【用户主观感受】");
      lines.push("以下为用户原话，经确认后纳入材料。");
      selectedRecords.forEach((r) => {
        lines.push(`- 来源：${r.sourceLabel} · ${formatHighRiskRecordTime(r.recordedAt)}`);
        lines.push(`  ${r.originalText}`);
      });
      lines.push("");
    }
  }

  // 8. 可核对的记录事实
  if (materialTopics.length > 0) {
    lines.push("【可核对的记录事实】");
    materialTopics.forEach((t) => {
      lines.push(t.title);
      t.evidenceSummary.forEach((e) => lines.push(`  - ${e}`));
    });
    lines.push("");
  }

  // 9. 希望专业人士协助判断的问题
  if (materialTopics.length > 0) {
    lines.push(`【希望和${name}协助判断的问题】`);
    materialTopics.forEach((t, i) => {
      lines.push(`${i + 1}. ${t.title}`);
      lines.push(`   ${t.content}`);
    });
    lines.push("");
  }

  // 10. 信息缺失或不确定项
  lines.push("【信息缺失或不确定项】");
  MISSING_INFO.forEach((s) => {
    s.items.forEach((it) => lines.push(`  - ${it}`));
  });
  lines.push("");

  // 11. 免责声明
  lines.push("【免责声明】");
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

/** 高风险记录时间格式化：2026-06-24T01:32 → 6 月 24 日 01:32 */
export function formatHighRiskRecordTime(iso: string): string {
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
