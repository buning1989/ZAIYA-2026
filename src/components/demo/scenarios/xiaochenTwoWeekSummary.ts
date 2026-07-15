/* —— 小晨两周 mock summary 数据 ——
 * 用于第二天收束闭环演示：
 *   - Step 7 夸夸自己：把被忽视的真实行动还给用户
 *   - Step 8 回头看看：两周变化被看见
 *   - Step 9 帮我整理：变成可讨论材料
 *
 * 这份数据只用于案例演示，不影响真实用户数据。
 * 表达边界：不使用「治好/康复/诊断报告」，明确仍然困难但齿轮开始咬合。
 *
 * 日期统一锚点为 2026-05-30（Day 2），夸夸卡日期为 5-16 ~ 5-30 之间的快照。
 * 不出现 7 月 18、26、27 等未来或穿越日期。
 */

import type { PraiseDemoConfig } from "../types";

/** Step 7｜18:50 夸夸自己：被误解后，把做成的事还给她 */
export const day2PraiseDemo: PraiseDemoConfig = {
  guideText: "可以留下一句很小的夸夸。",
  energyValue: 672,
  readOnly: true,
  cards: [
    {
      id: "day2-organize-card",
      text: "今天把这两周整理好了，还写下了最想问医生的那句话。",
      dateLabel: "5月30日",
      gradientId: "g4",
    },
    {
      id: "day2-school-card",
      text: "我今天下午去了学校，把作业交了。",
      dateLabel: "5月30日",
      gradientId: "g1",
    },
    {
      id: "day2-cloud-card",
      text: "今天的云彩很漂亮，狗子也很可爱",
      dateLabel: "5月29日",
      gradientId: "g2",
    },
    {
      id: "day2-bread-card",
      text: "中午主动吃了一个面包",
      dateLabel: "5月28日",
      gradientId: "g3",
    },
    {
      id: "day2-small-win-card",
      text: "真是每一次小胜",
      dateLabel: "5月27日",
      gradientId: "g4",
    },
    {
      id: "day2-paper-card",
      text: "把卷子按顺序码好了",
      dateLabel: "5月26日",
      gradientId: "g1",
    },
    {
      id: "day2-night-card",
      text: "今天好像没那么糟",
      dateLabel: "5月25日",
      gradientId: "g2",
    },
  ],
};

/**
 * 小晨两周汇总数据（结构化）。
 * 后续任务可复用此数据扩展真实回头看看 / 帮我整理模块。
 */
export const xiaochenTwoWeekSummary = {
  period: "使用在呀 ZÀIYA 约 2 周",
  records: [
    {
      type: "food" as const,
      time: "12:30",
      title: "午餐吃了面包",
      note: "今天中午主动吃了一个面包",
    },
    {
      type: "activity" as const,
      time: "15:30",
      title: "去学校交作业",
      note: "下午去了学校，把作业交了，往返约 30 分钟",
    },
  ],
  changes: [
    {
      title: "早晨入口前移",
      detail: "从完全不碰手机，到醒来后会主动看一眼在在。",
    },
    {
      title: "饭点开始回应",
      detail: "从拒绝吃饭，到能主动说“我吃个面包吧”。",
    },
    {
      title: "行动开始落地",
      detail: "从作业一打开就崩溃，到下午真的去学校交了作业。",
    },
    {
      title: "冲突后修复变快",
      detail: "从被情绪淹没，到 20 分钟内能回来找在在。",
    },
  ],
  discussionPoints: [
    "早晨起床困难仍然明显。",
    "返校压力仍然存在，但已经出现可执行的小目标。",
    "家庭成员容易忽略她已经完成的小行动。",
    "可以继续观察饭点回应、出门行动和睡前收尾是否稳定出现。",
  ],
};
