/* —— 体验模式默认用户资料 ——
 * 引用隔离的独立实例，仅用于体验模式（zaiya-experience-* 命名空间）的首次访问回退。
 * 本轮保持与演示模式相同的内容（小晨），后续可在本文件独立演进为
 * 「体验用户默认资料」，不影响演示模式的案例人物数据。 */
import type { UserProfile } from "@/data/userProfile";

export const EXPERIENCE_USER_PROFILE: UserProfile = {
  id: "mock_user_001",
  profileCompleted: true,
  basicInfo: {
    nickname: "小晨",
    birthDate: "2010-09-12",
    gender: "female",
    grade: "高一",
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
