/* —— Selector 层统一入口 ——
 *
 * 体验模式 5 个模块必须通过本入口消费统一数据源：
 *   - 回头看看 → selectLookbackData
 *   - 帮我整理 → selectOrganizeSummary
 *   - 夸夸自己 → selectPraiseCards
 *   - 我的隐私 → selectPrivacySeed
 *   - AI 对话  → selectConversationThreads + selectSafetyRecords */

export {
  getXiaochenReferenceDate,
  getXiaochenDailyRecord,
  getXiaochenAllDays,
  getXiaochenRecordedDays,
  getXiaochenUnrecordedDays,
  getXiaochenWeekRange,
  getXiaochenMonthRange,
  getXiaochenWeekStart,
  getXiaochenPeriodInfo,
} from "./selectLookbackData";

export {
  getXiaochenOrganizeContact,
  getXiaochenOrganizeTopics,
  getXiaochenOrganizeDisclosure,
  getXiaochenOrganizeStats,
  getXiaochenOrganizeRange,
  getXiaochenOrganizeRecordCategories,
  buildXiaochenInitialSession,
} from "./selectOrganizeSummary";

export {
  getXiaochenPraiseCards,
  getXiaochenPraiseCardCount,
} from "./selectPraiseCards";

export {
  getXiaochenContacts,
  getXiaochenMedSchedules,
  getXiaochenPrivacyState,
  getXiaochenEmergencyContacts,
} from "./selectPrivacySeed";

export {
  getXiaochenInitialDialog,
  getXiaochenConversationThreads,
  buildXiaochenReply,
  shouldTriggerSafetyResponse,
} from "./selectConversationThreads";

export {
  getXiaochenSafetyRecords,
  getXiaochenSafetyRecordCount,
  getXiaochenNegativeThoughtDates,
  isNegativeThoughtDate,
} from "./selectSafetyRecords";
