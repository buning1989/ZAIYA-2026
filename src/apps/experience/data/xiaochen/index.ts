/* —— 小晨体验模式统一数据源：统一入口 ——
 *
 * 所有体验模式模块必须通过本入口或 Selector 层消费数据，
 * 不得直接 import 子文件，避免数据源分散。
 *
 * 子文件职责：
 *   - timeConfig.ts    统一时间配置（当前日/开始日/复诊日/时区）← 单一事实源
 *   - dailyRecords.ts  统一日级事实数据（情绪/入睡/三餐/服药/活动/体重）← 单一事实源
 *   - lookbackRecords.ts 回头看看适配层（周/月视图配置 + 兼容别名）
 *   - constants.ts     兼容常量层（业务配置 + 旧名桥接到统一事实源）
 *   - profile.ts       人物资料只读视图（年龄/体重/诊断/复诊）
 *   - timeline.ts      时间线事件汇总（独立事件标注 + 从 dailyRecords 派生）
 *   - records.ts       旧 33 天每日 DailyLookbackData 兼容适配层（@deprecated）
 *   - praiseCards.ts   预置夸夸卡（6 张，可追溯时间线）
 *   - contacts.ts      预置联系人与服用安排
 *   - privacyState.ts  隐私权限状态（re-export from contacts.ts）
 *   - conversations.ts 预置对话线程与确定性 Mock 回复
 *   - organize.ts      帮我整理模块数据（5 条沟通重点 + 2 条高风险披露）
 *   - validators.ts    跨模块数据校验
 *
 * 数据来源单向依赖：
 *   timeConfig → dailyRecords → timeline → constants → selectors
 *   records.ts 作为旧调用方的兼容适配层，桥接到 dailyRecords.ts。 */

/* —— 内部导入：供下方统一数据结构与实例引用 ——
 * re-export 不会将标识符引入当前作用域，因此此处需要单独 import。 */
import { XIAOCHEN_PROFILE } from "./profile";
import { XIAOCHEN_TIMELINE } from "./timeline";
import { XIAOCHEN_RECORDED_DATE_KEYS } from "./constants";
import {
  XIAOCHEN_DAILY_RECORDS,
  XIAOCHEN_DAILY_ALL_DAYS,
} from "./dailyRecords";
import { XIAOCHEN_PRAISE_CARDS } from "./praiseCards";
import {
  XIAOCHEN_CONTACTS,
  XIAOCHEN_MED_SCHEDULES,
  XIAOCHEN_PRIVACY_STATE,
} from "./contacts";
import { EXPERIENCE_CONVERSATION } from "./conversations";
import {
  XIAOCHEN_ORGANIZE_CONTACT,
  XIAOCHEN_ORGANIZE_TOPICS,
  XIAOCHEN_ORGANIZE_DISCLOSURE,
  XIAOCHEN_ORGANIZE_RANGE,
  XIAOCHEN_ORGANIZE_RECORD_CATEGORIES,
} from "./organize";

/* —— 统一时间配置（单一事实源）—— */
export {
  XIAOCHEN_CURRENT_DATE,
  XIAOCHEN_START_DATE,
  XIAOCHEN_FOLLOWUP_DATE,
  XIAOCHEN_TIMEZONE,
  XIAOCHEN_CURRENT_DATETIME,
  XIAOCHEN_CURRENT_DATE_INSTANCE,
} from "./timeConfig";

/* —— 统一日级事实数据（单一事实源）——
 * XIAOCHEN_DAILY_RECORDS 直接从 dailyRecords.ts 导出，
 * 不再从 records.ts 适配层再次导出，避免新旧同名变量指向不同数据源。 */
export { XIAOCHEN_DAILY_ALL_DAYS, XIAOCHEN_DAILY_RECORDS } from "./dailyRecords";
export type { XiaochenDailyRecord } from "./dailyRecords";

/* —— 常量（兼容层，旧调用方仍可使用，新代码应直接引用事实源）—— */
export {
  EXPERIENCE_MOCK_DATA_VERSION,
  /** @deprecated 使用 XIAOCHEN_START_DATE */
  PERIOD_START,
  /** @deprecated 使用 XIAOCHEN_CURRENT_DATE */
  PERIOD_END,
  /** @deprecated 使用 XIAOCHEN_CURRENT_DATE */
  REFERENCE_DATE,
  APPOINTMENT_DATE,
  /** @deprecated 使用 XIAOCHEN_DAILY_ALL_DAYS.length */
  TOTAL_DAYS,
  /** @deprecated 使用 XIAOCHEN_RECORDED_DATE_KEYS.length */
  RECORDED_DAYS,
  /** @deprecated 使用 XIAOCHEN_UNRECORDED_DATE_KEYS.length */
  UNRECORDED_DAYS,
  XIAOCHEN_RECORDED_DATE_KEYS,
  XIAOCHEN_UNRECORDED_DATE_KEYS,
  /** @deprecated 使用 TIMELINE_MISSED_MED_DATES from "./timeline" */
  MISSED_MED_DATES,
  /** @deprecated 使用 TIMELINE_NO_SCHOOL_DATES from "./timeline" */
  NO_SCHOOL_DATES,
  /** @deprecated 使用 TIMELINE_BEFORE_MIDNIGHT_DATES from "./timeline" */
  BEFORE_MIDNIGHT_SLEEP_DATES,
  /** @deprecated 使用 TIMELINE_LATEST_SLEEP_DATE from "./timeline" */
  LATEST_SLEEP_DATE,
  /** @deprecated 使用 TIMELINE_LATEST_SLEEP_TIME from "./timeline" */
  LATEST_SLEEP_TIME,
  /** @deprecated 使用 TIMELINE_WEIGHT_RECORDS from "./timeline" */
  WEIGHT_RECORDS,
  /** @deprecated 使用 TIMELINE_BREATHING_EXERCISE_DATE from "./timeline" */
  BREATHING_EXERCISE_DATE,
  /** @deprecated 使用 TIMELINE_NEGATIVE_THOUGHT_DATES from "./timeline" */
  NEGATIVE_THOUGHT_DATES,
  /** @deprecated 统计应从 dailyRecords 实时派生，使用 getXiaochenDerivedStats() */
  STATS,
  getXiaochenDerivedStats,
  DOCTOR_NAME,
  DOCTOR_ROLE,
  DIAGNOSIS,
  MEDICATION_NAME,
  MEDICATION_DOSE,
  MEDICATION_FREQUENCY,
  MEDICATION_TIME,
  WEIGHT_RECORD_COUNT,
} from "./constants";

/* —— 人物资料 —— */
export { XIAOCHEN_PROFILE, EXPERIENCE_USER_PROFILE } from "./profile";
export type { XiaochenProfileView } from "./profile";

/* —— 时间线（独立事件标注 + 派生导出）—— */
export {
  XIAOCHEN_DROWSINESS_DATES,
  XIAOCHEN_FAMILY_CONFLICT_DATES,
  XIAOCHEN_TIMELINE,
  APPOINTMENT_NOT_IN_PERIOD,
  getTimelineEventsByDate,
  getAllTimelineDates,
  TIMELINE_MISSED_MED_DATES,
  TIMELINE_NO_SCHOOL_DATES,
  TIMELINE_BEFORE_MIDNIGHT_DATES,
  TIMELINE_WEIGHT_RECORDS,
  TIMELINE_NEGATIVE_THOUGHT_DATES,
  TIMELINE_BREATHING_EXERCISE_DATE,
  TIMELINE_LATEST_SLEEP_DATE,
  TIMELINE_LATEST_SLEEP_TIME,
} from "./timeline";
export type { TimelineEvent, TimelineEventType } from "./timeline";

/* —— 旧 33 天每日记录（兼容适配层，桥接到 dailyRecords.ts）——
 * @deprecated 新代码应直接使用 dailyRecords.ts 的 XIAOCHEN_DAILY_ALL_DAYS。
 *  XIAOCHEN_DAILY_RECORDS 已直接从 dailyRecords.ts 导出（见上方），不再从此处导出。 */
export {
  /** @deprecated 使用 XIAOCHEN_DAILY_ALL_DAYS.filter(hasAnyRecord) from "./dailyRecords" */
  XIAOCHEN_RECORDED_DAYS,
  /** @deprecated 使用 XIAOCHEN_DAILY_ALL_DAYS.filter(d => !hasAnyRecord(d)) from "./dailyRecords" */
  XIAOCHEN_UNRECORDED_DAYS,
  /** @deprecated 使用 XIAOCHEN_DAILY_ALL_DAYS from "./dailyRecords" */
  XIAOCHEN_ALL_DAYS,
} from "./records";

/* —— 回头看看两个月固定日级记录 —— */
export {
  XIAOCHEN_LOOKBACK_ALL_DAYS,
  XIAOCHEN_LOOKBACK_APPOINTMENT_DATE,
  XIAOCHEN_LOOKBACK_CURRENT_DATE,
  XIAOCHEN_LOOKBACK_DAILY_RECORDS,
  XIAOCHEN_LOOKBACK_MEDICATION,
  XIAOCHEN_LOOKBACK_MOCK_DATA,
  XIAOCHEN_LOOKBACK_MONTHS,
  XIAOCHEN_LOOKBACK_PROFILE,
  XIAOCHEN_LOOKBACK_START,
  XIAOCHEN_LOOKBACK_WEEK_STARTS,
} from "./lookbackRecords";

/* —— 夸夸卡 —— */
export { XIAOCHEN_PRAISE_CARDS } from "./praiseCards";

/* —— 联系人与服用安排 —— */
export {
  XIAOCHEN_CONTACTS,
  XIAOCHEN_MED_SCHEDULES,
  XIAOCHEN_PRIVACY_STATE,
} from "./contacts";
export type { ExperiencePrivacyState } from "./contacts";

/* —— 隐私状态（re-export）—— */
export type { ExperiencePrivacyState as ExperiencePrivacyStateType } from "./privacyState";

/* —— 对话 ——
 * 仅包含日期 ≤ XIAOCHEN_CURRENT_DATE（2026-07-15）的线程。
 * 原 CONVERSATION_THREAD_0717 / 0718 已移除（未来事件）。 */
export {
  CONVERSATION_THREAD_0701,
  CONVERSATION_THREAD_0704,
  CONVERSATION_THREAD_0706,
  CONVERSATION_THREAD_0709,
  CONVERSATION_THREAD_0710,
  CONVERSATION_THREAD_0715,
  createExperienceDialogItems,
  buildExperienceReply,
  EXPERIENCE_CONVERSATION,
} from "./conversations";
export type { ExperienceConversationData } from "./conversations";

/* —— 帮我整理 —— */
export {
  XIAOCHEN_ORGANIZE_CONTACT,
  buildXiaochenOrganizeTopics,
  buildXiaochenOrganizeDisclosure,
  XIAOCHEN_ORGANIZE_TOPICS,
  XIAOCHEN_ORGANIZE_DISCLOSURE,
  XIAOCHEN_ORGANIZE_RECORD_CATEGORIES,
  XIAOCHEN_ORGANIZE_RANGE,
} from "./organize";

/* —— 校验 —— */
export {
  validateXiaochenExperienceData,
  runDevValidation,
} from "./validators";
export type { ValidationResult } from "./validators";

/* —— 统一数据结构（供校验与外部消费）—— */
export interface XiaochenExperienceData {
  version: number;
  profile: typeof XIAOCHEN_PROFILE;
  timeline: typeof XIAOCHEN_TIMELINE;
  recordedDateKeys: typeof XIAOCHEN_RECORDED_DATE_KEYS;
  /** 唯一日级事实数据源（来自 dailyRecords.ts） */
  dailyRecords: typeof XIAOCHEN_DAILY_RECORDS;
  dailyAllDays: typeof XIAOCHEN_DAILY_ALL_DAYS;
  praiseCards: typeof XIAOCHEN_PRAISE_CARDS;
  contacts: typeof XIAOCHEN_CONTACTS;
  medicationSchedules: typeof XIAOCHEN_MED_SCHEDULES;
  privacyState: typeof XIAOCHEN_PRIVACY_STATE;
  conversationThreads: typeof EXPERIENCE_CONVERSATION.threads;
  organizeSession: {
    contact: typeof XIAOCHEN_ORGANIZE_CONTACT;
    topics: typeof XIAOCHEN_ORGANIZE_TOPICS;
    disclosure: typeof XIAOCHEN_ORGANIZE_DISCLOSURE;
    range: typeof XIAOCHEN_ORGANIZE_RANGE;
    recordCategories: typeof XIAOCHEN_ORGANIZE_RECORD_CATEGORIES;
  };
}

/* —— 统一数据实例（只读）—— */
export const XIAOCHEN_EXPERIENCE_DATA: XiaochenExperienceData = {
  version: 2, // 与 EXPERIENCE_MOCK_DATA_VERSION 保持一致
  profile: XIAOCHEN_PROFILE,
  timeline: XIAOCHEN_TIMELINE,
  recordedDateKeys: XIAOCHEN_RECORDED_DATE_KEYS,
  dailyRecords: XIAOCHEN_DAILY_RECORDS,
  dailyAllDays: XIAOCHEN_DAILY_ALL_DAYS,
  praiseCards: XIAOCHEN_PRAISE_CARDS,
  contacts: XIAOCHEN_CONTACTS,
  medicationSchedules: XIAOCHEN_MED_SCHEDULES,
  privacyState: XIAOCHEN_PRIVACY_STATE,
  conversationThreads: EXPERIENCE_CONVERSATION.threads,
  organizeSession: {
    contact: XIAOCHEN_ORGANIZE_CONTACT,
    topics: XIAOCHEN_ORGANIZE_TOPICS,
    disclosure: XIAOCHEN_ORGANIZE_DISCLOSURE,
    range: XIAOCHEN_ORGANIZE_RANGE,
    recordCategories: XIAOCHEN_ORGANIZE_RECORD_CATEGORIES,
  },
};
