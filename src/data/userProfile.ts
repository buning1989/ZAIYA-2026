/* —— 全局 Mock 用户资料（Demo 阶段唯一数据源）——
 *
 * 定位：集中管理用户基础信息（昵称 / 出生日期 / 性别 / 身高 / 体重 等），
 *   供「回头看看」「我的隐私」「记一下」等模块统一读取。
 *
 * 年龄一致性：不再手工维护 age 字段，所有页面通过 calculateAge(birthDate) 从
 *   出生日期推导，避免生日与年龄冲突。Demo 阶段使用固定 DEMO_REFERENCE_DATE
 *   作为参考日期，保证展示稳定；上线后改为 new Date()。
 *
 * 数据持久化：localStorage，与 privacy.ts 一致的 mock 模式。
 *   - 首次访问返回 MOCK_USER_PROFILE（已填写）。
 *   - 在「我的隐私」编辑后覆盖保存，其他模块同步读到更新后的值。
 *   - 刷新后仍保留；不与任何后端 / 第三方同步。
 *
 * BMI 计算与备注：
 *   - calculateBMI(weightKg, heightCm) 只做纯数学计算，保留 1 位小数。
 *   - getBMIRemark(bmi) Demo 阶段直接按成人 4 档解读：
 *     < 18.5 → 偏瘦 / < 24   → 正常 / < 28 → 偏重 / ≥ 28 → 偏胖
 *   - 不使用「异常 / 达标 / 未达标 / 目标完成率」等强判断词；
 *   - 不使用红绿警示色。 */

export type Gender = "male" | "female" | "other";

/* —— Demo 参考日期 ——
 * Demo 的"当前"锚定在 2026-07-13（第一天案例 2026-07-12 之后），用于：
 *   - 年龄推导（calculateAge 默认参考日期）
 *   - 保证 Demo 展示不随真实系统日期漂移
 * 上线时改为 new Date() 即可。 */
export const DEMO_REFERENCE_DATE = new Date("2026-07-13T00:00:00+08:00");

/* —— 基础资料 ——
 * 注意：不再包含 age 字段。年龄统一由 calculateAge(birthDate) 推导，
 *   避免手工 age 与 birthDate 冲突。 */
export type BasicInfo = {
  nickname: string;
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
  grade: string;
  city: string;
  /** 头像：本地 dataURL 或空（UI 资产，不参与 BMI 计算） */
  avatar?: string;
};

/**
 * 根据出生日期计算年龄（周岁）。
 * - 默认参考日期为 DEMO_REFERENCE_DATE（Demo 阶段固定），保证展示稳定。
 * - 上线时将默认值改为 new Date()。
 * - 测试应传入固定 referenceDate 以避免随真实系统日期变化。
 *
 * 算法：周岁 = 参考年 - 出生年 - (今年生日是否已过 ? 0 : 1)
 */
export function calculateAge(
  birthDate: string,
  referenceDate: Date = DEMO_REFERENCE_DATE,
): number {
  const birth = new Date(birthDate + "T00:00:00+08:00");
  if (Number.isNaN(birth.getTime())) return 0;
  let age = referenceDate.getFullYear() - birth.getFullYear();
  const refMonth = referenceDate.getMonth();
  const refDay = referenceDate.getDate();
  const birthMonth = birth.getMonth();
  const birthDay = birth.getDate();
  // 今年生日尚未到达，年龄减 1
  if (
    refMonth < birthMonth ||
    (refMonth === birthMonth && refDay < birthDay)
  ) {
    age -= 1;
  }
  return age >= 0 ? age : 0;
}

/* —— 身体资料 —— */
export type BodyInfo = {
  heightCm: number;
  weightKg: number;
  heightUpdatedAt: string; // YYYY-MM-DD
  weightUpdatedAt: string; // YYYY-MM-DD
};

/* —— 全局用户资料 —— */
export type UserProfile = {
  id: string;
  profileCompleted: boolean;
  basicInfo: BasicInfo;
  bodyInfo: BodyInfo;
  /** 用户当前能量值（完整记录奖励累加，Demo mock） */
  energy?: number;
};

/* —— 便捷字段：从 basicInfo / bodyInfo 提升到顶层，便于直接读取 ——
 * 注意：age 为计算字段（由 birthDate 经 calculateAge 推导），不持久化。 */
export type UserProfileFlat = UserProfile & {
  nickname: string;
  birthDate: string;
  /** 由 birthDate 经 calculateAge 推导，不持久化 */
  age: number;
  gender: Gender;
  grade: string;
  city: string;
  heightCm: number;
  weightKg: number;
};

/* =========================================================
 * 默认资料解析（演示 / 体验各自独立实例，引用隔离）
 * =======================================================
 * 小晨：15 岁（2026-07 时由 birthDate 2010-09-12 推导得 15 周岁），高一
 * 演示模式与体验模式各自拥有独立的默认用户资料实例，
 * 由 App 调度器在挂载 Shell 前同步设置当前存储模式。
 * landing 模式不读取业务数据，回退到体验模式默认资料仅作兜底。
 * 后续「小晨 Mock 数据统一重构」在 apps/demo/data 与 apps/experience/data 各自演进。 */
import { getStorageMode, storageGetJSON, storageSetJSON } from "@/shared/storage/namespacedStorage";
import { DEMO_USER_PROFILE } from "@/apps/demo/data/demoUser";
import { EXPERIENCE_USER_PROFILE } from "@/apps/experience/data/experienceUser";

const PROFILE_STORAGE_NAME = "user_profile";

/** 当前模式对应的默认用户资料（引用隔离的独立实例）。 */
function defaultProfileForMode(): UserProfile {
  return getStorageMode() === "demo" ? DEMO_USER_PROFILE : EXPERIENCE_USER_PROFILE;
}

/* —— 通用读取 / 写入（容错，使用模式命名空间） —— */
function loadProfile(): UserProfile {
  if (typeof window === "undefined") return defaultProfileForMode();
  const parsed = storageGetJSON<UserProfile | null>(PROFILE_STORAGE_NAME, null);
  if (!parsed) return defaultProfileForMode();
  // 基本校验：必须有 id 与 basicInfo / bodyInfo
  if (!parsed?.id || !parsed?.basicInfo || !parsed?.bodyInfo) {
    return defaultProfileForMode();
  }
  return parsed;
}

function persistProfile(p: UserProfile): void {
  storageSetJSON(PROFILE_STORAGE_NAME, p);
}

/* =========================================================
 * 读取 / 保存接口
 * ======================================================= */

/** 获取当前用户资料（带便捷顶层字段）。
 *  age 由 birthDate 经 calculateAge 推导，不读取持久化的 age 字段。 */
export function getUserProfile(): UserProfileFlat {
  const p = loadProfile();
  return {
    ...p,
    nickname: p.basicInfo.nickname,
    birthDate: p.basicInfo.birthDate,
    age: calculateAge(p.basicInfo.birthDate),
    gender: p.basicInfo.gender,
    grade: p.basicInfo.grade,
    city: p.basicInfo.city,
    heightCm: p.bodyInfo.heightCm,
    weightKg: p.bodyInfo.weightKg,
  };
}

/** 保存用户资料（整体覆盖） */
function saveUserProfile(p: UserProfile): void {
  persistProfile(p);
}

/** 更新基础资料部分 */
export function saveBasicInfo(basic: BasicInfo): UserProfile {
  const cur = loadProfile();
  const next: UserProfile = { ...cur, basicInfo: basic, profileCompleted: true };
  persistProfile(next);
  return next;
}

/** 更新身体资料部分 */
export function saveBodyInfo(body: BodyInfo): UserProfile {
  const cur = loadProfile();
  const next: UserProfile = { ...cur, bodyInfo: body, profileCompleted: true };
  persistProfile(next);
  return next;
}

/* =========================================================
 * BMI 计算与备注
 * ======================================================= */

/**
 * 计算 BMI = 体重kg / (身高m)²，保留 1 位小数。
 * 示例：calculateBMI(51.4, 165) ≈ 18.9
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  if (heightM <= 0) return 0;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * 根据 BMI 返回解读文案（Demo 阶段 4 档）。
 *
 *   < 18.5 → 偏瘦
 *   < 24   → 正常
 *   < 28   → 偏重
 *   ≥ 28   → 明显偏高
 *
 * 不使用「异常 / 达标 / 未达标 / 目标完成率」等强判断词，
 * 也不再返回「需结合年龄身高看」。BMI 仅作体重辅助说明，不配警示色。
 */
export function getBMIRemark(bmi: number): string {
  if (bmi < 18.5) return "偏瘦";
  if (bmi < 24) return "正常";
  if (bmi < 28) return "偏重";
  return "明显偏高";
}

/* —— 性别标签 —— */
function genderLabel(g?: Gender): string {
  if (g === "male") return "男";
  if (g === "female") return "女";
  if (g === "other") return "其他";
  return "";
}

/* =========================================================
 * 能量值（Demo mock）
 * ======================================================= */

/** 完整记录奖励的能量值 */
export const FULL_RECORD_ENERGY_REWARD = 5;

/** 读取当前能量值（无字段时兜底 0） */
export function getEnergy(): number {
  return loadProfile().energy ?? 0;
}

/* —— 能量值订阅（跨模块同步）——
 * Demo 无独立状态库，能量值持久化在 localStorage。
 * 通过轻量发布订阅，让所有 useEnergy 实例在 addEnergy 后即时同步展示态。 */
type EnergyListener = (value: number) => void;
const energyListeners = new Set<EnergyListener>();

/** 订阅能量值变化，返回取消订阅函数 */
export function subscribeEnergy(listener: EnergyListener): () => void {
  energyListeners.add(listener);
  return () => {
    energyListeners.delete(listener);
  };
}

/** 累加能量并持久化，返回累加后的值；同时通知所有订阅者 */
export function addEnergy(delta: number): number {
  const p = loadProfile();
  const next: UserProfile = { ...p, energy: (p.energy ?? 0) + delta };
  persistProfile(next);
  const value = next.energy ?? 0;
  energyListeners.forEach((l) => l(value));
  return value;
}

/* =========================================================
 * 能量奖励规则与幂等发放
 * ======================================================= */

/** 夸夸卡创建奖励的能量值 */
export const PRAISE_CARD_ENERGY_REWARD = 3;

/** 呼吸练习完成奖励的能量值 */
export const BREATHING_EXERCISE_ENERGY_REWARD = 3;

/** 一起发呆结束奖励的能量值 */
export const SOCIAL_DAZE_ENERGY_REWARD = 3;

/** 一起吃饭结束奖励的能量值 */
export const SOCIAL_MEAL_ENERGY_REWARD = 3;

/** 能量奖励来源标识（用于幂等校验） */
export type EnergySource =
  | "praise_card_created"
  | "breathing_exercise_completed"
  | "record_completed"
  | "social_daze_completed"
  | "social_meal_completed";

/** 读取指定来源的奖励能量值 */
export function getEnergyReward(source: EnergySource): number {
  switch (source) {
    case "praise_card_created":
      return PRAISE_CARD_ENERGY_REWARD;
    case "breathing_exercise_completed":
      return BREATHING_EXERCISE_ENERGY_REWARD;
    case "record_completed":
      return FULL_RECORD_ENERGY_REWARD;
    case "social_daze_completed":
      return SOCIAL_DAZE_ENERGY_REWARD;
    case "social_meal_completed":
      return SOCIAL_MEAL_ENERGY_REWARD;
  }
}

/* —— 幂等发放记录（命名空间 localStorage）——
 * 记录已发放过的 `${source}:${sourceId}`，防止页面刷新、重复点击
 * 或组件重新挂载导致同一记录 / 同一次练习多次发放能量。 */
const ENERGY_GRANTS_NAME = "energy_grants";

function loadEnergyGrants(): string[] {
  const arr = storageGetJSON<string[] | null>(ENERGY_GRANTS_NAME, null);
  return Array.isArray(arr) ? arr : [];
}

function saveEnergyGrants(grants: string[]): void {
  storageSetJSON(ENERGY_GRANTS_NAME, grants);
}

export interface GrantEnergyResult {
  /** 是否实际发放（true=本次发放，false=已发放过被幂等拦截） */
  granted: boolean;
  /** 该来源的奖励能量值 */
  reward: number;
  /** 发放后的能量总值（未发放时为当前值） */
  newValue: number;
}

/** 幂等发放能量：同一 source + sourceId 只发放一次
 *  - 首次：累加能量并记录，返回 { granted: true, ... }
 *  - 重复：不累加，返回 { granted: false, ... } */
export function grantEnergy({
  source,
  sourceId,
}: {
  source: EnergySource;
  sourceId: string;
}): GrantEnergyResult {
  const key = `${source}:${sourceId}`;
  const grants = loadEnergyGrants();
  const reward = getEnergyReward(source);
  if (grants.includes(key)) {
    return { granted: false, reward, newValue: getEnergy() };
  }
  const newValue = addEnergy(reward);
  grants.push(key);
  saveEnergyGrants(grants);
  return { granted: true, reward, newValue };
}
