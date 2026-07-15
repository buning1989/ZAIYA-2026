/* —— 小晨体验模式统一数据源：人物资料 ——
 *
 * 从 experienceUser.ts 派生人物资料视图，统一口径：
 *   - 16 岁（birthDate 2009-09-12，参考日 2026-07-15 推导得 16 周岁）
 *   - 高二学生
 *   - 二线城市
 *   - 当前体重 50.4kg（更新于 2026-07-15）
 *   - 中度抑郁、重度焦虑（诊断信息由 constants.ts 维护，不在 UserProfile 字段中）
 *
 * 实际 UserProfile 实例定义在 experienceUser.ts，本文件提供只读视图。
 * REFERENCE_DATE 来自 constants.ts（= XIAOCHEN_CURRENT_DATE = 2026-07-15）。 */
import { EXPERIENCE_USER_PROFILE } from "../experienceUser";
import { DIAGNOSIS, DOCTOR_NAME, MEDICATION_NAME, MEDICATION_DOSE, MEDICATION_FREQUENCY, MEDICATION_TIME, APPOINTMENT_DATE, REFERENCE_DATE } from "./constants";

/* —— 小晨人物资料只读视图 ——
 * 将 constants.ts 中的诊断/用药/复诊信息与 UserProfile 合并，
 * 供 Selector 与页面统一引用，避免各模块重新定义人物设定。 */
export interface XiaochenProfileView {
  /** UserProfile 原始字段 */
  id: string;
  nickname: string;
  birthDate: string;
  age: number;
  gender: "male" | "female" | "other";
  grade: string;
  city: string;
  heightCm: number;
  weightKg: number;
  weightUpdatedAt: string;
  /** 体验模式扩展字段（来自 constants.ts） */
  diagnosis: string;
  doctorName: string;
  medicationName: string;
  medicationDose: string;
  medicationFrequency: string;
  medicationTime: string;
  appointmentDate: string;
  referenceDate: string;
}

/* —— 计算年龄（参考日 2026-07-15）—— */
function calculateAgeAt(birthDate: string, referenceDate: string): number {
  const birth = new Date(birthDate + "T00:00:00+08:00");
  const ref = new Date(referenceDate + "T00:00:00+08:00");
  let age = ref.getFullYear() - birth.getFullYear();
  if (
    ref.getMonth() < birth.getMonth() ||
    (ref.getMonth() === birth.getMonth() && ref.getDate() < birth.getDate())
  ) {
    age -= 1;
  }
  return age >= 0 ? age : 0;
}

/** 小晨人物资料只读视图（统一口径，供所有模块引用） */
export const XIAOCHEN_PROFILE: XiaochenProfileView = {
  id: EXPERIENCE_USER_PROFILE.id,
  nickname: EXPERIENCE_USER_PROFILE.basicInfo.nickname,
  birthDate: EXPERIENCE_USER_PROFILE.basicInfo.birthDate,
  age: calculateAgeAt(EXPERIENCE_USER_PROFILE.basicInfo.birthDate, REFERENCE_DATE),
  gender: EXPERIENCE_USER_PROFILE.basicInfo.gender,
  grade: EXPERIENCE_USER_PROFILE.basicInfo.grade,
  city: EXPERIENCE_USER_PROFILE.basicInfo.city,
  heightCm: EXPERIENCE_USER_PROFILE.bodyInfo.heightCm,
  weightKg: EXPERIENCE_USER_PROFILE.bodyInfo.weightKg,
  weightUpdatedAt: EXPERIENCE_USER_PROFILE.bodyInfo.weightUpdatedAt,
  diagnosis: DIAGNOSIS,
  doctorName: DOCTOR_NAME,
  medicationName: MEDICATION_NAME,
  medicationDose: MEDICATION_DOSE,
  medicationFrequency: MEDICATION_FREQUENCY,
  medicationTime: MEDICATION_TIME,
  appointmentDate: APPOINTMENT_DATE,
  referenceDate: REFERENCE_DATE,
};

/* —— re-export experienceUser.ts 的原始 UserProfile —— */
export { EXPERIENCE_USER_PROFILE } from "../experienceUser";
