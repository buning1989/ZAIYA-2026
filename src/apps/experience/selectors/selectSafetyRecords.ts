/* —— Selector：安全记录（高风险记录）——
 *
 * 仅返回真实包含深夜消极念头的 2 条记录，用于：
 *   - 帮我整理模块的高风险披露
 *   - AI 对话的安全承接逻辑（展示紧急联系人 / 12356）
 *   - 数据校验
 *
 * 不得将「我又没去学校」「落了三张数学卷子」等非安全风险记录放入此处。
 * 这两类记录已分别归类为：
 *   - 学校功能受损记录
 *   - 行动启动与学习功能困难记录
 * 并纳入 organize 模块 topic-3 的 evidence。 */
import type { HighRiskOriginalRecord } from "@/data/organize";
import { XIAOCHEN_ORGANIZE_DISCLOSURE } from "../data/xiaochen/organize";
import { TIMELINE_NEGATIVE_THOUGHT_DATES } from "../data/xiaochen/timeline";

/* —— 返回 2 条高风险记录（每次返回新数组）—— */
export function getXiaochenSafetyRecords(): HighRiskOriginalRecord[] {
  return XIAOCHEN_ORGANIZE_DISCLOSURE.originalRecords.map((r) => ({ ...r }));
}

/* —— 返回高风险记录数量 —— */
export function getXiaochenSafetyRecordCount(): number {
  return XIAOCHEN_ORGANIZE_DISCLOSURE.originalRecords.length;
}

/* —— 返回消极念头日期列表 —— */
export function getXiaochenNegativeThoughtDates(): readonly string[] {
  return TIMELINE_NEGATIVE_THOUGHT_DATES;
}

/* —— 检测某日期是否为消极念头日 —— */
export function isNegativeThoughtDate(dateStr: string): boolean {
  return TIMELINE_NEGATIVE_THOUGHT_DATES.includes(dateStr);
}
