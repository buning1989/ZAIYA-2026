/* —— 固定剧情演示模式｜独立时间配置 ——
 *
 * 固定剧情（Day 1 / Day 2 / 两周后开场页 / 总结页）必须使用本文件的时间常量，
 * 不得读取浏览器真实时间，也不得直接使用自由体验模式的 timeConfig.ts。
 *
 * 与自由体验模式的关系：
 *   - 自由体验模式开始使用日期仍为 2026-05-16，本文件复用此日期作为 Day 1；
 *   - 自由体验模式当前日期为 2026-07-15，本文件不依赖；
 *   - 复诊日 2026-07-18 只属于自由体验模式，固定剧情不出现「明天复诊」。
 *
 * 时间线总览（小晨使用在呀的历史前传）：
 *   2026-05-16  固定剧情 Day 1｜开始使用在呀
 *   2026-05-30  固定剧情 Day 2｜使用两周后
 *   2026-07-15  自由体验模式｜使用约两个月后的当前状态
 *   2026-07-18  未来精神科复诊（仅自由体验模式可见）
 *
 * 所有时间戳使用 +08:00 时区，避免 UTC 转换导致日期偏移一天。 */

/** 自由体验模式开始使用日期（与 timeConfig.ts 的 XIAOCHEN_START_DATE 一致）。
 *  固定剧情 Day 1 复用此日期，作为「小晨开始使用在呀的第一天」。 */
export const XIAOCHEN_GUIDED_DAY1_DATE = "2026-05-16";

/** 固定剧情 Day 2 日期（使用两周后的一天，周六）。 */
export const XIAOCHEN_GUIDED_DAY2_DATE = "2026-05-30";

/** Day 1 与 Day 2 的间隔天数。 */
export const XIAOCHEN_GUIDED_INTERVAL_DAYS = 14;

/** 固定剧情数据范围起始日（含），与 Day 1 一致。 */
export const XIAOCHEN_GUIDED_DATA_START = XIAOCHEN_GUIDED_DAY1_DATE;

/** 固定剧情数据范围截止日（含），与 Day 2 一致。
 *  数据跨度为 15 个自然日（5-16 ~ 5-30），间隔为 14 天。 */
export const XIAOCHEN_GUIDED_DATA_END = XIAOCHEN_GUIDED_DAY2_DATE;

/** 固定剧情自然日跨度（含首尾）。 */
export const XIAOCHEN_GUIDED_DATA_TOTAL_DAYS = 15;

/** 构造 +08:00 时区的 Date 对象。
 *  不调用 new Date() 真实时间。 */
export function makeGuidedDate(dateStr: string, hhmm: string): Date {
  return new Date(`${dateStr}T${hhmm}:00+08:00`);
}

/** 构造 Day 1 某时刻的 Date。 */
export function makeDay1Date(hhmm: string): Date {
  return makeGuidedDate(XIAOCHEN_GUIDED_DAY1_DATE, hhmm);
}

/** 构造 Day 2 某时刻的 Date。 */
export function makeDay2Date(hhmm: string): Date {
  return makeGuidedDate(XIAOCHEN_GUIDED_DAY2_DATE, hhmm);
}

/** 校验 Day 2 与 Day 1 相隔 14 天（开发期自检，不抛异常）。 */
export function assertGuidedInterval(): void {
  if (typeof console === "undefined") return;
  const d1 = new Date(`${XIAOCHEN_GUIDED_DAY1_DATE}T00:00:00+08:00`).getTime();
  const d2 = new Date(`${XIAOCHEN_GUIDED_DAY2_DATE}T00:00:00+08:00`).getTime();
  const days = Math.round((d2 - d1) / 86400000);
  if (days !== XIAOCHEN_GUIDED_INTERVAL_DAYS) {
    console.error(
      `[xiaochenGuidedTimeConfig] Day 2 与 Day 1 间隔应为 ${XIAOCHEN_GUIDED_INTERVAL_DAYS} 天，实际为 ${days} 天`,
    );
  }
}

assertGuidedInterval();
