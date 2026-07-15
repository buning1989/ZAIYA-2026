/* —— 小晨自由体验模式：统一时间配置 ——
 *
 * 本文件是体验模式所有日期的单一来源（Single Source of Truth）。
 * 任何模块不得在其他文件中再次硬编码下面四个值。
 *
 * 设计要点：
 *   - 不调用 new Date() 获取真实系统时间；
 *   - 不使用 UTC 字符串截断日期；
 *   - 所有时间字符串明确使用 +08:00（中国标准时间 Asia/Shanghai）。
 *
 * 下一轮迁移（AI 对话 / 帮我整理 / 夸夸自己 / 能量记录 / 首页时间逻辑）
 * 应统一引用本文件，逐步消除各模块独立的日期硬编码。 */

/** 中国标准时区标识，用于toISOString / Intl 等场景的显式标注。 */
export const XIAOCHEN_TIMEZONE = "Asia/Shanghai" as const;

/** 当前演示日期：所有体验模式模块统一视为"今天"。 */
export const XIAOCHEN_CURRENT_DATE = "2026-07-15" as const;

/** 小晨开始使用在呀的日期：用于计算使用时长与历史数据起点。 */
export const XIAOCHEN_START_DATE = "2026-05-16" as const;

/** 精神科复诊日期：当前为复诊前 3 天，复诊当日不得展示为已完成。 */
export const XIAOCHEN_FOLLOWUP_DATE = "2026-07-18" as const;

/** 当前时刻（带时区），用于需要精确到秒的时间锚点场景（如首页 now 注入）。 */
export const XIAOCHEN_CURRENT_DATETIME = "2026-07-15T23:59:59+08:00" as const;

/** 当前演示日期对应的 Date 实例（基于 +08:00 构造，避免本地时区偏移）。 */
export const XIAOCHEN_CURRENT_DATE_INSTANCE = new Date(
  `${XIAOCHEN_CURRENT_DATE}T00:00:00+08:00`,
);
