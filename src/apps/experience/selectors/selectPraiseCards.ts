/* —— Selector：夸夸卡 ——
 *
 * 体验模式「夸夸自己」模块必须通过本 Selector 读取预置夸夸卡，
 * 不再默认读取空数组。
 *
 * 6 张预置卡片可追溯到统一时间线中的真实事件：
 *   - 7/4 凌晨呼吸练习
 *   - 7/9 撑到下课
 *   - 7/10 早上吃包子
 *   - 7/12 写下想问王医生的问题
 *   - 7/14 比昨天早躺下
 *   - 7/17 打开数学卷子 */
import type { PraiseCard } from "@/data/praise";
import { XIAOCHEN_PRAISE_CARDS } from "../data/xiaochen/praiseCards";

/* —— 返回预置夸夸卡（每次返回新数组，避免外部修改污染）—— */
export function getXiaochenPraiseCards(): PraiseCard[] {
  return XIAOCHEN_PRAISE_CARDS.map((c) => ({ ...c }));
}

/* —— 返回预置夸夸卡数量 —— */
export function getXiaochenPraiseCardCount(): number {
  return XIAOCHEN_PRAISE_CARDS.length;
}
