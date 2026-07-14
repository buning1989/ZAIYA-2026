/* —— Selector：隐私模块预填数据 ——
 *
 * 体验模式「我的隐私」模块必须通过本 Selector 读取预填数据：
 *   - 3 个联系人（妈妈、爸爸、李老师）
 *   - 1 个服用安排（舍曲林 50mg 每日一次 早晨服用）
 *   - 隐私权限状态（家长不可默认查看全部情绪记录/AI对话，医生不可默认实时获取全部数据）
 *
 * 不再默认读取空联系人和空服用安排。
 *
 * 注意：王医生不在此处预填，由「帮我整理」模块独立管理
 * （因现有 Contact Schema 仅支持 guardian/teacher，不支持 doctor 类型）。 */
import type { Contact, MedSchedule } from "@/data/privacy";
import {
  XIAOCHEN_CONTACTS,
  XIAOCHEN_MED_SCHEDULES,
  XIAOCHEN_PRIVACY_STATE,
} from "../data/xiaochen/contacts";
import type { ExperiencePrivacyState } from "../data/xiaochen/contacts";

/* —— 返回预置联系人（每次返回新数组）—— */
export function getXiaochenContacts(): Contact[] {
  return XIAOCHEN_CONTACTS.map((c) => ({ ...c }));
}

/* —— 返回预置服用安排（每次返回新数组）—— */
export function getXiaochenMedSchedules(): MedSchedule[] {
  return XIAOCHEN_MED_SCHEDULES.map((m) => ({ ...m }));
}

/* —— 返回隐私权限状态 —— */
export function getXiaochenPrivacyState(): ExperiencePrivacyState {
  return { ...XIAOCHEN_PRIVACY_STATE };
}

/* —— 紧急联系人 —— */
export function getXiaochenEmergencyContacts(): Contact[] {
  return XIAOCHEN_CONTACTS.filter((c) => c.isEmergencyContact).map((c) => ({ ...c }));
}
