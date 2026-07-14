/* —— 小晨体验模式预置夸夸卡 ——
 *
 * 预置卡片可追溯到统一时间线（见 ./constants.ts）中的真实事件：
 *   - 2026-07-04 凌晨呼吸/接地练习（BREATHING_EXERCISE_DATE）
 *   - 2026-07-09 零点前入睡（BEFORE_MIDNIGHT_SLEEP_DATES），上午困倦仍撑到下课
 *   - 2026-07-10 零点前入睡，早上吃了一口包子（早餐记录）
 *   - 2026-07-12 写下想问王医生的问题（DOCTOR_NAME = "王医生"，复诊前准备）
 *   - 2026-07-14 零点前入睡（BEFORE_MIDNIGHT_SLEEP_DATES），比前一天早躺下
 *   - 2026-07-17 参考日（REFERENCE_DATE），打开数学卷子
 *
 * 语气遵循 16 岁高中生口吻，避免「战胜抑郁」「完全恢复」「越来越好了」等夸张表达，
 * 只记录具体、微小、真实发生的事。 */

import type { PraiseCard } from "@/data/praise";
import { PRAISE_GUIDE_TEXTS } from "@/data/praise";

/* —— 原始卡片数据（不含派生字段）—— */
const RAW_CARDS: ReadonlyArray<{ text: string; createdAt: string }> = [
  {
    createdAt: "2026-07-04T01:45:00+08:00",
    text: "凌晨很难受的时候，跟着在在做了一次呼吸练习",
  },
  {
    createdAt: "2026-07-09T12:20:00+08:00",
    text: "今天上午虽然很困，但还是撑到了下课",
  },
  {
    createdAt: "2026-07-10T07:50:00+08:00",
    text: "早上吃了一口包子",
  },
  {
    createdAt: "2026-07-12T21:00:00+08:00",
    text: "把想问王医生的问题写下来了",
  },
  {
    createdAt: "2026-07-14T22:10:00+08:00",
    text: "今天比昨天早躺下了一会儿",
  },
  {
    createdAt: "2026-07-17T20:30:00+08:00",
    text: "打开了一直没看的数学卷子，虽然只做了两道题",
  },
];

/* —— 渐变 ID 总数（g1..g8）—— */
const GRADIENT_COUNT = 8;

/* —— 预置夸夸卡
 * gradientId 按索引取模确定性分配（g1..g8），保证刷新与跨设备一致；
 * guideText 统一使用 PRAISE_GUIDE_TEXTS[0]；
 * isPrivate 固定为 true（当前版本不开发家长端查看 / 公开分享）。 */
export const XIAOCHEN_PRAISE_CARDS: PraiseCard[] = RAW_CARDS.map((c, i) => ({
  id: `xc-praise-${i + 1}`,
  text: c.text,
  createdAt: c.createdAt,
  isPrivate: true,
  gradientId: `g${(i % GRADIENT_COUNT) + 1}`,
  guideText: PRAISE_GUIDE_TEXTS[0],
}));
