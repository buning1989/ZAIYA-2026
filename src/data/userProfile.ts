/* —— 全局 Mock 用户资料（Demo 阶段唯一数据源）——
 *
 * 定位：集中管理用户基础信息（昵称 / 出生日期 / 年龄 / 性别 / 身高 / 体重 等），
 *   供「回头看看」「我的隐私」「记一下」等模块统一读取。
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

/* —— 基础资料 —— */
export type BasicInfo = {
  nickname: string;
  birthDate: string; // YYYY-MM-DD
  age: number;
  gender: Gender;
  grade: string;
  city: string;
  /** 头像：本地 dataURL 或空（UI 资产，不参与 BMI 计算） */
  avatar?: string;
};

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

/* —— 便捷字段：从 basicInfo / bodyInfo 提升到顶层，便于直接读取 —— */
export type UserProfileFlat = UserProfile & {
  nickname: string;
  birthDate: string;
  age: number;
  gender: Gender;
  grade: string;
  city: string;
  heightCm: number;
  weightKg: number;
};

/* =========================================================
 * Mock 默认资料（已填写）
 * ======================================================= */
export const MOCK_USER_PROFILE: UserProfile = {
  id: "mock_user_001",
  profileCompleted: true,
  basicInfo: {
    nickname: "小晨",
    birthDate: "2010-04-12",
    age: 15,
    gender: "female",
    grade: "初三",
    city: "北京",
    avatar: undefined,
  },
  bodyInfo: {
    heightCm: 165,
    weightKg: 51.4,
    heightUpdatedAt: "2026-07-01",
    weightUpdatedAt: "2026-07-08",
  },
  energy: 0,
};

/* —— localStorage key —— */
const STORAGE_KEY = "zaiya_user_profile";

/* —— 通用读取 / 写入（容错） —— */
function loadProfile(): UserProfile {
  if (typeof window === "undefined") return MOCK_USER_PROFILE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_USER_PROFILE;
    const parsed = JSON.parse(raw) as UserProfile;
    // 基本校验：必须有 id 与 basicInfo / bodyInfo
    if (!parsed?.id || !parsed?.basicInfo || !parsed?.bodyInfo) {
      return MOCK_USER_PROFILE;
    }
    return parsed;
  } catch {
    return MOCK_USER_PROFILE;
  }
}

function persistProfile(p: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // 忽略写入失败（隐私模式 / 配额满）
  }
}

/* =========================================================
 * 读取 / 保存接口
 * ======================================================= */

/** 获取当前用户资料（带便捷顶层字段） */
export function getUserProfile(): UserProfileFlat {
  const p = loadProfile();
  return {
    ...p,
    nickname: p.basicInfo.nickname,
    birthDate: p.basicInfo.birthDate,
    age: p.basicInfo.age,
    gender: p.basicInfo.gender,
    grade: p.basicInfo.grade,
    city: p.basicInfo.city,
    heightCm: p.bodyInfo.heightCm,
    weightKg: p.bodyInfo.weightKg,
  };
}

/** 保存用户资料（整体覆盖） */
export function saveUserProfile(p: UserProfile): void {
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
export function genderLabel(g?: Gender): string {
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

/** 能量奖励来源标识（用于幂等校验） */
export type EnergySource =
  | "praise_card_created"
  | "breathing_exercise_completed";

/** 读取指定来源的奖励能量值 */
export function getEnergyReward(source: EnergySource): number {
  switch (source) {
    case "praise_card_created":
      return PRAISE_CARD_ENERGY_REWARD;
    case "breathing_exercise_completed":
      return BREATHING_EXERCISE_ENERGY_REWARD;
  }
}

/* —— 幂等发放记录（localStorage）——
 * 记录已发放过的 `${source}:${sourceId}`，防止页面刷新、重复点击
 * 或组件重新挂载导致同一记录 / 同一次练习多次发放能量。 */
const ENERGY_GRANTS_KEY = "zaiya_energy_grants";

function loadEnergyGrants(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ENERGY_GRANTS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveEnergyGrants(grants: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ENERGY_GRANTS_KEY, JSON.stringify(grants));
  } catch {
    // 忽略写入失败（隐私模式 / 配额满）
  }
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
