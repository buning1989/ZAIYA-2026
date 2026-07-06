/* —— 「我的隐私」数据与本地持久化（不接后端 / LLM / 真实数据写入）——
 *
 * 定位：集中管理用户主动保存的个人敏感信息。
 *   - 只管理资料本身，不做权限说明，不承载"谁能看到"的逻辑
 *   - 不加入额外解释性文案
 *
 * 数据持久化：localStorage，与 praise.ts 一致的 mock 模式。
 * 刷新后仍保留；不与任何后端 / 第三方同步。 */

/* —— 基础资料 —— */
export type Gender = "male" | "female" | "other";

export type BasicProfile = {
  /** 头像：本地 dataURL 或空 */
  avatar?: string;
  /** 昵称 */
  nickname?: string;
  /** 性别 */
  gender?: Gender;
  /** 年龄 */
  age?: number;
};

/* —— 身体资料（本期仅身高；体重相关不在本期）—— */
export type BodyData = {
  /** 身高 cm */
  height?: number;
};

/* —— 家人信息 —— */
export type FamilyMember = {
  id: string;
  name: string;
  /** 关系：自由文本，如 妈妈 / 爸爸 / 姐姐 */
  relation: string;
  /** 联系方式：手机号或其它 */
  contact?: string;
};

/* —— 紧急联系人（最多 3 位）—— */
export type EmergencyContact = {
  id: string;
  name: string;
  /** 电话 */
  phone: string;
  /** 关系 */
  relation: string;
};

/* —— 服用安排 —— */
export type MedSchedule = {
  id: string;
  /** 名称 */
  name: string;
  /** 剂量 */
  dose?: string;
  /** 频次，如 每日一次 / 每日两次 */
  frequency?: string;
  /** 服用时间，如 早 8:00 */
  time?: string;
  /** 备注 */
  note?: string;
};

/* —— 隐私数据集合（仅用于类型组合，不整体持久化）—— */
export type PrivacyData = {
  basicProfile: BasicProfile;
  bodyData: BodyData;
  familyMembers: FamilyMember[];
  emergencyContacts: EmergencyContact[];
  medSchedules: MedSchedule[];
};

/* —— localStorage keys —— */
const KEYS = {
  basicProfile: "zaiya_privacy_basic_profile",
  bodyData: "zaiya_privacy_body_data",
  family: "zaiya_privacy_family",
  emergency: "zaiya_privacy_emergency_contacts",
  meds: "zaiya_privacy_med_schedules",
} as const;

/* —— 通用读取 / 写入（容错，与 praise.ts 一致） —— */
function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 忽略写入失败（隐私模式 / 配额满）
  }
}

/* —— 基础资料 —— */
export function loadBasicProfile(): BasicProfile {
  return loadJSON<BasicProfile>(KEYS.basicProfile, {});
}
export function saveBasicProfile(p: BasicProfile): void {
  saveJSON(KEYS.basicProfile, p);
}

/* —— 身体资料 —— */
export function loadBodyData(): BodyData {
  return loadJSON<BodyData>(KEYS.bodyData, {});
}
export function saveBodyData(b: BodyData): void {
  saveJSON(KEYS.bodyData, b);
}

/* —— 家人信息 —— */
export function loadFamilyMembers(): FamilyMember[] {
  const arr = loadJSON<FamilyMember[]>(KEYS.family, []);
  return Array.isArray(arr) ? arr : [];
}
export function saveFamilyMembers(list: FamilyMember[]): void {
  saveJSON(KEYS.family, list);
}

/* —— 紧急联系人 —— */
export function loadEmergencyContacts(): EmergencyContact[] {
  const arr = loadJSON<EmergencyContact[]>(KEYS.emergency, []);
  return Array.isArray(arr) ? arr : [];
}
export function saveEmergencyContacts(list: EmergencyContact[]): void {
  saveJSON(KEYS.emergency, list);
}

/* —— 服用安排 —— */
export function loadMedSchedules(): MedSchedule[] {
  const arr = loadJSON<MedSchedule[]>(KEYS.meds, []);
  return Array.isArray(arr) ? arr : [];
}
export function saveMedSchedules(list: MedSchedule[]): void {
  saveJSON(KEYS.meds, list);
}

/* —— 紧急联系人上限 —— */
export const EMERGENCY_CONTACT_MAX = 3;

/* —— 生成 id —— */
export function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* —— 一级页状态计算 —— */

/** 基础资料填写状态：4 字段（头像 / 昵称 / 性别 / 年龄） */
export type FillStatus = "filled" | "partial" | "empty";

export function basicProfileStatus(p: BasicProfile): FillStatus {
  const fields = [p.avatar, p.nickname, p.gender, p.age];
  const filledCount = fields.filter((v) => v !== undefined && v !== "").length;
  if (filledCount === 0) return "empty";
  if (filledCount === fields.length) return "filled";
  return "partial";
}

/** 身体资料填写状态：1 字段（身高） */
export function bodyDataStatus(b: BodyData): FillStatus {
  return b.height !== undefined && b.height > 0 ? "filled" : "empty";
}

/** 状态文案：基础资料 / 身体资料 */
export function fillStatusLabel(s: FillStatus): string {
  return s === "filled" ? "已填写" : s === "partial" ? "部分填写" : "未填写";
}

/** 家人信息文案 */
export function familyStatusLabel(list: FamilyMember[]): string {
  return list.length > 0 ? `已设置 ${list.length} 人` : "未设置";
}

/** 紧急联系人文案 */
export function emergencyStatusLabel(list: EmergencyContact[]): string {
  return list.length > 0 ? `已设置 ${list.length} 人` : "未设置";
}

/** 服用安排文案 */
export function medsStatusLabel(list: MedSchedule[]): string {
  return list.length > 0 ? `已设置 ${list.length} 项` : "未设置";
}

/* —— 性别标签 —— */
export function genderLabel(g?: Gender): string {
  if (g === "male") return "男";
  if (g === "female") return "女";
  if (g === "other") return "其他";
  return "";
}
