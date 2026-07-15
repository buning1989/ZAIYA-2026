/* —— 小晨体验模式预置夸夸卡 ——
 *
 * 预置卡片可追溯到 dailyRecords.ts 中的真实事件，每张卡的行为都在对应
 * 日期的日级事实中可验证：
 *   - 2026-07-04 凌晨呼吸/接地练习（对话线程 0704 印证）
 *   - 2026-07-09 状态很糟但晚上仍把这一天记下来了
 *     （moodNote="今天又掉下去了，但记录完就先放在这里。"）
 *   - 2026-07-10 早上吃了一口包子（meals.breakfast="yes"）
 *   - 2026-07-11 完成三餐和 25 分钟步行（meals 全 yes、activityLevel=2）
 *   - 2026-07-13 早上很低落、晚上仍再次记录了自己的状态（moodEntries 有 2 条）
 *   - 2026-07-15 复诊前把这段时间的记录都看了一遍
 *     （moodNote="复诊前把这几周看了一遍，还是有点紧张。"）
 *
 * 时间基准：所有卡片 createdAt ≤ XIAOCHEN_CURRENT_DATE（2026-07-15）。
 * 不使用真实系统时间，不出现 7-16 之后的卡片。
 *
 * 语气遵循 16 岁高中生口吻，避免「战胜抑郁」「完全恢复」「越来越好了」等夸张表达，
 * 只记录具体、微小、真实发生的事。不将漏服或未记录包装成正向行为。 */

import type { PraiseCard } from "@/data/praise";
import { PRAISE_GUIDE_TEXTS } from "@/data/praise";
import { XIAOCHEN_CURRENT_DATE } from "./timeConfig";

/* —— 原始卡片数据（不含派生字段）——
 * 每张卡通过 sourceDate 显式引用 dailyRecords 中的对应日期，便于事实校验。
 * 6 张卡按时间升序排列，Selector 层负责按 createdAt 倒序展示。 */
const RAW_CARDS: ReadonlyArray<{
  text: string;
  createdAt: string;
  sourceDate: string;
}> = [
  {
    createdAt: "2026-07-04T01:45:00+08:00",
    sourceDate: "2026-07-04",
    text: "凌晨很难受的时候，跟着在在做了一次呼吸练习",
  },
  {
    createdAt: "2026-07-09T22:45:00+08:00",
    sourceDate: "2026-07-09",
    text: "今天状态很糟，但还是把这一天的事记下来了",
  },
  {
    createdAt: "2026-07-10T07:50:00+08:00",
    sourceDate: "2026-07-10",
    text: "早上吃了一口包子",
  },
  {
    createdAt: "2026-07-11T21:10:00+08:00",
    sourceDate: "2026-07-11",
    text: "今天三餐都吃了，还出门走了 25 分钟",
  },
  {
    createdAt: "2026-07-13T21:15:00+08:00",
    sourceDate: "2026-07-13",
    text: "早上很低落，晚上还是又记了一次自己的状态",
  },
  {
    createdAt: "2026-07-15T21:00:00+08:00",
    sourceDate: "2026-07-15",
    text: "复诊前把这段时间的记录都看了一遍",
  },
];

/* —— 渐变 ID 总数（g1..g8）—— */
const GRADIENT_COUNT = 8;

/* —— 预置夸夸卡
 * gradientId 按索引取模确定性分配（g1..g8），保证刷新与跨设备一致；
 * guideText 统一使用 PRAISE_GUIDE_TEXTS[0]；
 * isPrivate 固定为 true（当前版本不开发家长端查看 / 公开分享）。
 * sourceDate 为模块内部字段，不进入 PraiseCard 类型，仅用于事实校验。 */
export const XIAOCHEN_PRAISE_CARDS: PraiseCard[] = RAW_CARDS.map((c, i) => ({
  id: `xc-praise-${i + 1}`,
  text: c.text,
  createdAt: c.createdAt,
  isPrivate: true,
  gradientId: `g${(i % GRADIENT_COUNT) + 1}`,
  guideText: PRAISE_GUIDE_TEXTS[0],
}));

/* —— 卡片对应的源日期列表（升序，用于事实校验）——
 * 每个日期都必须在 dailyRecords.ts 中存在且对应记录可验证。 */
export const XIAOCHEN_PRAISE_CARD_SOURCE_DATES: readonly string[] =
  RAW_CARDS.map((c) => c.sourceDate);

/* —— 当前演示日期（re-export 自 timeConfig，便于夸夸卡模块内部引用）—— */
export { XIAOCHEN_CURRENT_DATE };
