/* —— 小晨体验模式预置联系人与服用安排 ——
 *
 * 预填数据使用固定 id（xc- 前缀），不在模块级调用 genId，
 * 保证体验模式数据跨刷新 / 跨设备一致，便于复现与回归。
 *
 * 联系人 createdAt 为 ISO 字符串（与 Contact 类型定义一致）。
 * 服用安排与 constants.ts 中的当前用药保持一致：
 *   MEDICATION_NAME = "舍曲林" / MEDICATION_DOSE = "50mg"
 *   / MEDICATION_FREQUENCY = "每日一次" / MEDICATION_TIME = "早晨服用"。 */

import type { Contact, MedSchedule } from "@/data/privacy";

/* —— 预置联系人（家长 + 老师）
 * 统一使用固定 id（xc- 前缀），不调用 genId，保证跨刷新一致。 */
export const XIAOCHEN_CONTACTS: Contact[] = [
  {
    id: "xc-contact-mom",
    type: "guardian",
    name: "妈妈",
    relationship: "妈妈",
    phone: "138-0000-0001",
    isEmergencyContact: true,
    createdAt: "2026-06-15T08:00:00+08:00",
  },
  {
    id: "xc-contact-dad",
    type: "guardian",
    name: "爸爸",
    relationship: "爸爸",
    phone: "139-0000-0002",
    isEmergencyContact: true,
    createdAt: "2026-06-15T08:00:00+08:00",
  },
  {
    id: "xc-contact-teacher",
    type: "teacher",
    name: "李老师",
    teacherRole: "headTeacher",
    phone: "136-0000-0003",
    isEmergencyContact: false,
    createdAt: "2026-06-15T08:00:00+08:00",
  },
];

/* —— 预置服用安排 —— */
export const XIAOCHEN_MED_SCHEDULES: MedSchedule[] = [
  {
    id: "xc-med-sertraline",
    name: "舍曲林",
    dose: "50mg",
    frequency: "每日一次",
    time: "早晨服用",
    note: undefined,
  },
];

/* —— 体验模式隐私权限状态 ——
 * 默认全部为「最保守 / 用户主控」的安全值：
 *   - 家长不可默认看到情绪记录与 AI 对话原文
 *   - 医生不可默认实时获取全部数据
 *   - 任何对外沟通材料必须由用户预览并确认后才能发送
 *   - 高风险记录不默认公开 */
export interface ExperiencePrivacyState {
  /** 家长可见范围：默认不可见全部情绪记录 */
  parentCanSeeMoodRecords: boolean;
  /** 家长可见范围：默认不可见全部AI对话 */
  parentCanSeeConversations: boolean;
  /** 医生不可默认实时获取全部数据 */
  doctorRealtimeAccess: boolean;
  /** 沟通材料必须由用户预览并确认后发送 */
  materialRequiresConfirmation: boolean;
  /** 高风险记录不默认公开 */
  highRiskDefaultPrivate: boolean;
}

export const XIAOCHEN_PRIVACY_STATE: ExperiencePrivacyState = {
  parentCanSeeMoodRecords: false,
  parentCanSeeConversations: false,
  doctorRealtimeAccess: false,
  materialRequiresConfirmation: true,
  highRiskDefaultPrivate: true,
};
