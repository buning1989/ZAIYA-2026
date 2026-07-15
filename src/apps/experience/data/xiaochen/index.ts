/* —— 小晨体验模式统一数据源：统一入口 ——
 *
 * 所有体验模式模块必须通过本入口或 Selector 层消费数据，
 * 不得直接 import 子文件，避免数据源分散。
 *
 * 子文件职责：
 *   - timeConfig.ts    统一时间配置（当前日/开始日/复诊日/时区）← 单一事实源
 *   - dailyRecords.ts  统一日级事实数据（情绪/入睡/三餐/服药/活动/体重）← 单一事实源
 *   - lookbackRecords.ts 回头看看适配层（周/月视图配置 + 兼容别名）
 *   - constants.ts     旧统一常量（日期/统计/用药/诊断）— 待后续轮次迁移
 *   - profile.ts       人物资料只读视图（年龄/体重/诊断/复诊）
 *   - timeline.ts      时间线事件汇总（供校验与 organize 派生）
 *   - records.ts       旧 33 天每日 DailyLookbackData — 待后续轮次迁移
 *   - praiseCards.ts   预置夸夸卡（6 张，可追溯时间线）
 *   - contacts.ts      预置联系人与服用安排
 *   - privacyState.ts  隐私权限状态（re-export from contacts.ts）
 *   - conversations.ts 预置对话线程与确定性 Mock 回复
 *   - organize.ts      帮我整理模块数据（5 条沟通重点 + 2 条高风险披露）
 *   - validators.ts    跨模块数据校验 */

/* —— 内部导入：供下方统一数据结构与实例引用 ——
 * re-export 不会将标识符引入当前作用域，因此此处需要单独 import。 */
import { XIAOCHEN_PROFILE } from "./profile";
import { XIAOCHEN_TIMELINE } from "./timeline";
import { XIAOCHEN_RECORDED_DATE_KEYS } from "./constants";
import { XIAOCHEN_DAILY_RECORDS } from "./records";
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

/* —— 统一时间配置（单一事实源，下一轮迁移目标）—— */
export {
  XIAOCHEN_CURRENT_DATE,
  XIAOCHEN_START_DATE,
  XIAOCHEN_FOLLOWUP_DATE,
  XIAOCHEN_TIMEZONE,
  XIAOCHEN_CURRENT_DATETIME,
  XIAOCHEN_CURRENT_DATE_INSTANCE,
} from "./timeConfig";

/* —— 统一日级事实数据（单一事实源，下一轮迁移目标）——
 * 注：XIAOCHEN_DAILY_RECORDS 与旧 records.ts 的同名导出冲突，
 * 因此本入口仅 re-export 数组形态 XIAOCHEN_DAILY_ALL_DAYS 与类型。
 * 需要 Record<string, DailyLookbackData> 形态时，
 * 请通过 lookbackRecords.ts 的 XIAOCHEN_LOOKBACK_DAILY_RECORDS 别名访问，
 * 该别名直接引用本数据源。 */
export { XIAOCHEN_DAILY_ALL_DAYS } from "./dailyRecords";
export type { XiaochenDailyRecord } from "./dailyRecords";

/* —— 常量 —— */
export {
  EXPERIENCE_MOCK_DATA_VERSION,
  PERIOD_START,
  PERIOD_END,
  REFERENCE_DATE,
  APPOINTMENT_DATE,
  TOTAL_DAYS,
  RECORDED_DAYS,
  UNRECORDED_DAYS,
  XIAOCHEN_RECORDED_DATE_KEYS,
  XIAOCHEN_UNRECORDED_DATE_KEYS,
  MISSED_MED_DATES,
  NO_SCHOOL_DATES,
  BEFORE_MIDNIGHT_SLEEP_DATES,
  LATEST_SLEEP_DATE,
  LATEST_SLEEP_TIME,
  WEIGHT_RECORDS,
  BREATHING_EXERCISE_DATE,
  NEGATIVE_THOUGHT_DATES,
  STATS,
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

/* —— 时间线 —— */
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

/* —— 33 天每日记录 —— */
export {
  XIAOCHEN_RECORDED_DAYS,
  XIAOCHEN_UNRECORDED_DAYS,
  XIAOCHEN_ALL_DAYS,
  XIAOCHEN_DAILY_RECORDS,
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
  dailyRecords: typeof XIAOCHEN_DAILY_RECORDS;
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
