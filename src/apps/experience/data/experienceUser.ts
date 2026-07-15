/* —— 体验模式默认用户资料（小晨，统一事实基准）——
 * 引用隔离的独立实例，仅用于体验模式（zaiya-experience-* 命名空间）的首次访问回退。
 *
 * 统一事实基准：
 *   - 16 岁（birthDate 2009-09-12，参考日 2026-07-15 推导得 16 周岁）
 *   - 高二学生
 *   - 二线城市
 *   - 当前体重 50.4kg（更新于 2026-07-15）
 *   - 中度抑郁、重度焦虑（诊断信息不在 UserProfile 字段中，由 constants.ts 统一维护）
 *
 * 与演示模式（demoUser.ts）的关系：
 *   - 人物口径统一：姓名、性别、年龄、年级、诊断、药物设定一致；
 *   - 当前日期不同（自由体验 2026-07-15 vs 固定剧情 2026-05-30）；
 *   - weightKg 表示自由体验参考日前最近一次体重记录；
 *   - 引用隔离，互不影响。 */
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
    weightKg: 50.4,
    heightUpdatedAt: "2026-07-01",
    weightUpdatedAt: "2026-07-15",
  },
  energy: 0,
};
