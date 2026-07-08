/* —— 「我的隐私」数据与本地持久化（不接后端 / LLM / 真实数据写入）——
 *
 * 定位：集中管理用户主动保存的联系人、服用安排等隐私信息。
 *   - 基础资料 / 身体资料已迁移至 @/data/userProfile（全局统一数据源）
 *   - 不加入额外解释性文案
 *
 * 数据持久化：localStorage，与 praise.ts 一致的 mock 模式。
 * 刷新后仍保留；不与任何后端 / 第三方同步。 */

/* —— 联系人类型：家长 / 老师统一存储 —— */
export type ContactType = "guardian" | "teacher";

/* —— 老师身份选项 —— */
export type TeacherRole =
  | "headTeacher"
  | "psychology"
  | "subject"
  | "grade"
  | "other";

export const TEACHER_ROLE_LABEL: Record<TeacherRole, string> = {
  headTeacher: "班主任",
  psychology: "心理老师",
  subject: "任课老师",
  grade: "年级老师",
  other: "其他",
};

export const TEACHER_ROLE_OPTIONS: TeacherRole[] = [
  "headTeacher",
  "psychology",
  "subject",
  "grade",
  "other",
];

/* —— 统一联系人结构 ——
 * relationship 仅家长联系人使用（如 妈妈 / 爸爸 / 姐姐 / 其他亲属）。
 * teacherRole 仅老师联系人使用。 */
export type Contact = {
  id: string;
  type: ContactType;
  name: string;
  /** 关系：仅家长使用 */
  relationship?: string;
  /** 老师身份：仅老师使用 */
  teacherRole?: TeacherRole;
  phone: string;
  note?: string;
  /** 是否紧急联系人：跨家长 / 老师全局最多 3 位 */
  isEmergencyContact: boolean;
  createdAt: string;
  updatedAt?: string;
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

/* —— localStorage keys —— */
const KEYS = {
  contacts: "zaiya_privacy_contacts",
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

/* —— 联系人（家长 + 老师统一存储）—— */
export function loadContacts(): Contact[] {
  const arr = loadJSON<Contact[]>(KEYS.contacts, []);
  return Array.isArray(arr) ? arr : [];
}
export function saveContacts(list: Contact[]): void {
  saveJSON(KEYS.contacts, list);
}

/* —— 服用安排 —— */
export function loadMedSchedules(): MedSchedule[] {
  const arr = loadJSON<MedSchedule[]>(KEYS.meds, []);
  return Array.isArray(arr) ? arr : [];
}
export function saveMedSchedules(list: MedSchedule[]): void {
  saveJSON(KEYS.meds, list);
}

/* —— 紧急联系人全局上限（家长 + 老师合并计算）—— */
export const EMERGENCY_CONTACT_MAX = 3;

/* —— 生成 id —— */
export function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* —— 一级页状态计算 —— */

/** 家长联系人文案 */
export function guardianStatusLabel(list: Contact[]): string {
  const n = list.filter((c) => c.type === "guardian").length;
  return n > 0 ? `已设置 ${n} 人` : "未设置";
}

/** 老师联系人文案 */
export function teacherStatusLabel(list: Contact[]): string {
  const n = list.filter((c) => c.type === "teacher").length;
  return n > 0 ? `已设置 ${n} 人` : "未设置";
}

/** 服用安排文案 */
export function medsStatusLabel(list: MedSchedule[]): string {
  return list.length > 0 ? `已设置 ${list.length} 项` : "未设置";
}

/* —— 紧急联系人计数 —— */
export function countEmergencyContacts(list: Contact[]): number {
  return list.filter((c) => c.isEmergencyContact).length;
}

/** 是否还能再设置紧急联系人 */
export function canAddEmergencyContact(list: Contact[]): boolean {
  return countEmergencyContacts(list) < EMERGENCY_CONTACT_MAX;
}
