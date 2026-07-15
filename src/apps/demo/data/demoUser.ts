/* —— 演示模式默认用户资料（小晨，案例人物）——
 * 引用隔离的独立实例，仅用于演示模式（zaiya-demo-* 命名空间）的首次访问回退。
 *
 * 人物口径统一（与自由体验模式 experienceUser.ts 一致）：
 *   - 16 岁（birthDate 2009-09-12，参考日 2026-05-30 推导得 16 周岁）
 *   - 高二学生
 *   - 二线城市
 *   - 中度抑郁、重度焦虑（诊断信息由 constants.ts 统一维护）
 *   - 当前仍在上学，但学习、作息、家庭互动和社会参与已经受到影响
 *
 * 与自由体验模式的差异：
 *   - 当前日期不同（固定剧情 2026-05-30 vs 自由体验 2026-07-15）；
 *   - 体重值与对应剧情日期的数据匹配，不要求与自由体验模式当前体重相同。
 *
 * 后续「小晨 Mock 数据统一重构」在本文件及 apps/demo/data/ 目录内进行，
 * 不影响体验模式。 */
import type { UserProfile } from "@/data/userProfile";

/** 固定剧情参考日期（Day 2 = 2026-05-30）。 */
export const DEMO_GUIDED_REFERENCE_DATE = "2026-05-30";

export const DEMO_USER_PROFILE: UserProfile = {
  id: "mock_user_001",
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
    /** 固定剧情参考日 2026-05-30 时的体重（与自由体验模式 2026-07-15 时的 48.7kg
     *  不同——具体体重应与对应剧情日期的数据匹配）。 */
    weightKg: 50.6,
    heightUpdatedAt: "2026-05-01",
    weightUpdatedAt: "2026-05-17",
  },
  energy: 0,
};
