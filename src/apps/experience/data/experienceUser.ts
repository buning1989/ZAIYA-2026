/* —— 体验模式默认用户资料（小晨，统一事实基准）——
 * 引用隔离的独立实例，仅用于体验模式（zaiya-experience-* 命名空间）的首次访问回退。
 *
 * 统一事实基准：
 *   - 16 岁（birthDate 2009-09-12，参考日 2026-07-17 推导得 16 周岁）
 *   - 高二学生
 *   - 二线城市
 *   - 当前体重 48.7kg（更新于 2026-07-12）
 *   - 中度抑郁、重度焦虑（诊断信息不在 UserProfile 字段中，由 constants.ts 统一维护）
 *
 * 与演示模式（demoUser.ts）完全独立，互不影响。 */
import type { UserProfile } from "@/data/userProfile";

export const EXPERIENCE_USER_PROFILE: UserProfile = {
  id: "experience_xiaochen",
  profileCompleted: true,
  basicInfo: {
    nickname: "小晨",
    birthDate: "2009-09-12",
    gender: "female",
    grade: "高二",
    city: "二线城市",
    avatar: undefined,
  },
  bodyInfo: {
    heightCm: 165,
    weightKg: 48.7,
    heightUpdatedAt: "2026-07-01",
    weightUpdatedAt: "2026-07-12",
  },
  energy: 0,
};
