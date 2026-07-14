/* —— 演示模式默认用户资料（小晨，案例人物）——
 * 引用隔离的独立实例，仅用于演示模式（zaiya-demo-* 命名空间）的首次访问回退。
 * 后续「小晨 Mock 数据统一重构」在此文件及 apps/demo/data/ 目录内进行，
 * 不影响体验模式。 */
import type { UserProfile } from "@/data/userProfile";

export const DEMO_USER_PROFILE: UserProfile = {
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
