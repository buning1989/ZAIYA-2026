/* —— Selector：夸夸卡 ——
 *
 * 体验模式「夸夸自己」模块必须通过本 Selector 读取预置夸夸卡，
 * 不再默认读取空数组。
 *
 * 6 张预置卡片可追溯到 dailyRecords.ts 中的真实事件（日期 ≤ 2026-07-15）：
 *   - 7/4 凌晨呼吸练习
 *   - 7/9 状态很糟但仍记下这一天
 *   - 7/10 早上吃包子
 *   - 7/11 三餐都吃了、出门走 25 分钟
 *   - 7/13 早上低落、晚上仍再次记录
 *   - 7/15 复诊前把这段时间的记录都看了一遍
 *
 * 不存在 7-16 之后的卡片。不使用真实系统时间创建卡片。 */
import type { PraiseCard } from "@/data/praise";
import {
  XIAOCHEN_PRAISE_CARDS,
  XIAOCHEN_PRAISE_CARD_SOURCE_DATES,
} from "../data/xiaochen/praiseCards";

/* —— 返回预置夸夸卡（按 createdAt 倒序，最近优先）—— */
export function getXiaochenPraiseCards(): PraiseCard[] {
  return [...XIAOCHEN_PRAISE_CARDS]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((c) => ({ ...c }));
}

/* —— 返回预置夸夸卡数量 —— */
export function getXiaochenPraiseCardCount(): number {
  return XIAOCHEN_PRAISE_CARDS.length;
}

/* —— 返回卡片对应的源日期列表（升序，用于事实校验）——
 * 每个日期都应在 dailyRecords.ts 中存在且对应记录可验证。 */
export function getXiaochenPraiseCardSourceDates(): readonly string[] {
  return XIAOCHEN_PRAISE_CARD_SOURCE_DATES;
}
