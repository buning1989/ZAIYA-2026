/* —— 小晨自由体验模式：回头看看适配层 ——
 *
 * 本文件不再是日级事实数据的来源，而是「回头看看」模块的展示适配层。
 * 职责：
 *   - 保留周视图与月视图的开放范围配置；
 *   - 保留人物资料与用药信息的聚合视图；
 *   - 保留展示格式转换所需的派生逻辑；
 *   - 通过 re-export / 别名为旧调用方提供向后兼容。
 *
 * 数据来源（单一事实源）：
 *   - 时间常量 → ./timeConfig
 *   - 日级事实 → ./dailyRecords
 *
 * 不得在本文件中：
 *   - 再次硬编码 CURRENT_DATE / START_DATE / FOLLOWUP_DATE；
 *   - 保留独立的日级 Mock 数据副本；
 *   - 重新实现 buildDay 等生成逻辑。 */

import {
  XIAOCHEN_CURRENT_DATE,
  XIAOCHEN_FOLLOWUP_DATE,
  XIAOCHEN_START_DATE,
} from "./timeConfig";
import {
  XIAOCHEN_DAILY_ALL_DAYS,
  XIAOCHEN_DAILY_RECORDS,
} from "./dailyRecords";
import type { DailyLookbackData } from "@/data/lookback";

/* —— 时间常量：re-export 原始来源 —— */
export {
  XIAOCHEN_CURRENT_DATE,
  XIAOCHEN_START_DATE,
  XIAOCHEN_FOLLOWUP_DATE,
  XIAOCHEN_TIMEZONE,
  XIAOCHEN_CURRENT_DATETIME,
  XIAOCHEN_CURRENT_DATE_INSTANCE,
} from "./timeConfig";

/* —— 日级事实：re-export 原始来源 —— */
export {
  XIAOCHEN_DAILY_ALL_DAYS,
  XIAOCHEN_DAILY_RECORDS,
} from "./dailyRecords";
export type { XiaochenDailyRecord } from "./dailyRecords";

/* —— 兼容别名：旧调用方仍使用 XIAOCHEN_LOOKBACK_* 命名 ——
 * 必须引用新常量，不得再次赋值硬编码。 */
export const XIAOCHEN_LOOKBACK_CURRENT_DATE = XIAOCHEN_CURRENT_DATE;
export const XIAOCHEN_LOOKBACK_START = XIAOCHEN_START_DATE;
export const XIAOCHEN_LOOKBACK_APPOINTMENT_DATE = XIAOCHEN_FOLLOWUP_DATE;

export const XIAOCHEN_LOOKBACK_ALL_DAYS: DailyLookbackData[] = XIAOCHEN_DAILY_ALL_DAYS;
export const XIAOCHEN_LOOKBACK_DAILY_RECORDS: Record<string, DailyLookbackData> =
  XIAOCHEN_DAILY_RECORDS;

/* —— 周视图开放范围：最近四个自然周（周一为周起始）——
 * 与 src/data/lookback.ts 的 getWeekStart 保持一致。 */
export const XIAOCHEN_LOOKBACK_WEEK_STARTS = [
  "2026-06-22",
  "2026-06-29",
  "2026-07-06",
  "2026-07-13",
] as const;

/* —— 月视图开放范围：仅 2026 年 6 月与截至 7-15 的 7 月 ——
 * 5 月虽为开始使用月份，但仅有 5-16 起的半月数据，
 * 不开放月视图以避免空白月份进入页面。 */
export const XIAOCHEN_LOOKBACK_MONTHS = ["2026-06", "2026-07"] as const;

/* —— 人物资料只读视图（用于回头看看页面顶部展示）—— */
export const XIAOCHEN_LOOKBACK_PROFILE = {
  nickname: "小晨",
  age: 16,
  grade: "高二",
  diagnosis: "中度抑郁、重度焦虑",
};

/* —— 用药信息只读视图（用于回头看看页面与详情页展示）—— */
export const XIAOCHEN_LOOKBACK_MEDICATION = {
  name: "喹硫平",
  dose: "50mg",
  frequency: "每日一次",
  time: "睡前服用",
};

/* —— 聚合 Mock 数据：dailyRecords 字段引用统一事实源 —— */
export const XIAOCHEN_LOOKBACK_MOCK_DATA = {
  profile: XIAOCHEN_LOOKBACK_PROFILE,
  currentDate: XIAOCHEN_LOOKBACK_CURRENT_DATE,
  appointmentDate: XIAOCHEN_LOOKBACK_APPOINTMENT_DATE,
  medication: XIAOCHEN_LOOKBACK_MEDICATION,
  dailyRecords: XIAOCHEN_LOOKBACK_DAILY_RECORDS,
} as const;
