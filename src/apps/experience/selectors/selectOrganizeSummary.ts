/* —— Selector：帮我整理模块数据 ——
 *
 * 体验模式「帮我整理」模块必须通过本 Selector 读取：
 *   - 沟通对象（王医生）
 *   - 5 条沟通重点（evidence 全部来自统一常量）
 *   - 2 条高风险披露（仅真实深夜消极念头）
 *   - 统计数字（33/24/4/4/18/6/2/2）
 *   - 初始 session 构建器
 *
 * 不得继续调用 src/data/organize.ts 的 createMockTopics / createMockDisclosure。 */
import type {
  CommunicationContact,
  CommunicationSession,
  CommunicationTopic,
  SpecialDisclosure,
} from "@/data/organize";
import {
  XIAOCHEN_ORGANIZE_CONTACT,
  XIAOCHEN_ORGANIZE_RECORD_CATEGORIES,
  XIAOCHEN_ORGANIZE_RANGE,
  buildXiaochenOrganizeTopics,
  buildXiaochenOrganizeDisclosure,
} from "../data/xiaochen/organize";
import { STATS, TOTAL_DAYS, RECORDED_DAYS } from "../data/xiaochen/constants";

/* —— 沟通对象 —— */
export function getXiaochenOrganizeContact(): CommunicationContact {
  return XIAOCHEN_ORGANIZE_CONTACT;
}

/* —— 5 条沟通重点（每次返回新实例，避免外部修改污染）—— */
export function getXiaochenOrganizeTopics(): CommunicationTopic[] {
  return buildXiaochenOrganizeTopics();
}

/* —— 2 条高风险披露（每次返回新实例）—— */
export function getXiaochenOrganizeDisclosure(): SpecialDisclosure {
  return buildXiaochenOrganizeDisclosure();
}

/* —— 统计数字（来自 constants.STATS，供 UI 展示）—— */
export function getXiaochenOrganizeStats() {
  return {
    totalDays: TOTAL_DAYS,
    recordedDays: RECORDED_DAYS,
    unrecordedDays: STATS.unrecordedDays,
    missedMedCount: STATS.missedMedCount,
    noSchoolCount: STATS.noSchoolCount,
    daytimeDrowsinessDays: STATS.daytimeDrowsinessDays,
    familyConflictCount: STATS.familyConflictCount,
    weightRecordCount: STATS.weightRecordCount,
    negativeThoughtCount: STATS.negativeThoughtCount,
  };
}

/* —— 时间段与记录类型 —— */
export function getXiaochenOrganizeRange() {
  return XIAOCHEN_ORGANIZE_RANGE;
}

export function getXiaochenOrganizeRecordCategories(): string[] {
  return [...XIAOCHEN_ORGANIZE_RECORD_CATEGORIES];
}

/* —— 构建初始 organize session（替代 createInitialSession）——
 * 使用小晨统一数据，不调用 Math.random() 生成 id，保证幂等。 */
export function buildXiaochenInitialSession(): CommunicationSession {
  const contact = getXiaochenOrganizeContact();
  return buildXiaochenInitialSessionForContact(contact);
}

/* —— 为指定沟通对象构建小晨统一 session ——
 * 适用于体验模式下用户从 ContactStep 选中任意沟通对象（默认王医生 / 用户
 * 自行添加的医生联系人）的场景。contactSnapshot 来自传入 contact，但
 * communicationTopics / specialDisclosure / 时间段等核心数据始终来自
 * 小晨统一数据源，避免重新走 createMockTopics / createMockDisclosure。 */
export function buildXiaochenInitialSessionForContact(
  contact: CommunicationContact,
): CommunicationSession {
  const range = getXiaochenOrganizeRange();
  return {
    id: "xc-organize-session-default",
    contactId: contact.id,
    contactSnapshot: {
      displayName: contact.displayName,
      roleType: contact.roleType,
      roleLabel: contact.roleLabel,
    },
    rangeKey: range.rangeKey,
    startDate: range.startDate,
    endDate: range.endDate,
    totalDays: range.totalDays,
    recordedDays: range.recordedDays,
    recordCategories: getXiaochenOrganizeRecordCategories(),
    communicationTopics: getXiaochenOrganizeTopics(),
    specialDisclosure: getXiaochenOrganizeDisclosure(),
    status: "in_progress",
    createdAt: new Date(2026, 6, 17, 21, 30).getTime(),
  };
}
