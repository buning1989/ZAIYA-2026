/* —— 小晨第二周案例脚本（使用产品两周后的一天）——
 * 5 个节点串联"从被动看见到主动使用"的一天。
 *
 * 所有文案严格来自最新剧情文件：
 *   /Users/ning/Downloads/小晨DEMO演示第二周第一天剧情线.md
 *
 * 本轮只建立数据结构和占位场景，不开发各节点内部的具体产品界面。
 * 后续任务会逐个替换占位组件为真实产品场景。
 */

import type { GuidedScenario } from "../types";

/** 案例日期统一锚点（2026-07-26，距第一天约两周，周日，北京时间） */
const CASE_DATE = "2026-07-26";

function makeDate(hhmm: string): Date {
  return new Date(`${CASE_DATE}T${hhmm}:00+08:00`);
}

export const xiaochenDay2Scenario: GuidedScenario = {
  id: "xiaochen-day2",
  name: "小晨两周后",
  description:
    "使用产品两周后的一天。小晨从只能在崩溃时被动获得支持，转向主动使用在呀 ZÀIYA 记录、整理、回看和理解自己的生活状态。",
  intro:
    "变化还没有稳定发生。但在呀 ZÀIYA 已经不再只在她崩溃时出现。",
  steps: [
    {
      id: "day2-wake-look",
      order: 1,
      time: "06:40",
      title: "醒来，先看它一眼",
      narrative: [
        "周日不用上学，忘了关的闹钟还是响了。小晨关掉，没起，顺手点亮屏幕看了一眼在在——这个动作，两周前她不会有。",
        "打开在呀 ZÀIYA，一句话从在在身边飘过。她盯着看了几秒，有所触动。",
      ],
      principles: "微习惯形成 × 叙事性范例投喂",
      explanation: "从被动看见，到主动接住。",
      moduleTags: ["home"],
      demoState: {
        enabled: true,
        now: makeDate("06:40"),
        surfaceMode: "home",
        bubbleCopy: "根往下扎的时候是看不见的，等看见的时候，已经长挺高了。",
      },
    },
    {
      id: "day2-self-record",
      order: 2,
      time: "10:00",
      title: "主动记录自己",
      narrative: [
        "周日起得晚些。起来后，小晨自己点开\u201c记一下\u201d，记了此刻的情绪，也记了昨晚的睡眠。",
        "填的时候她才注意到：昨晚大约午夜就睡着了。两周前的这个时间，她还在凌晨一两点瞪着天花板。",
        "记录没有连续天数，也不会因为漏记被判定失败。它只是把散落的状态，轻轻留了下来。",
      ],
      principles: "自我监测 × 睡眠节律可视化",
      explanation: "把弥散的状态，变成可以看见的事实。",
      moduleTags: ["record"],
      demoState: {
        enabled: true,
        now: makeDate("10:00"),
        surfaceMode: "record",
      },
    },
    {
      id: "day2-organize",
      order: 3,
      time: "15:30",
      title: "把两周的自己，整理成一份",
      narrative: [
        "中午，妈妈提醒她明天复诊、已经跟学校请了假。请假意味着又缺一天课，也意味着离\u201c回去上学\u201d更近一点——这份矛盾，成了她一整天的底色。下午状态平稳时，小晨主动打开\u201c帮我整理\u201d，为明天和王医生的复诊做准备。在系统整理好的沟通重点之外，她补上了自己最想问的一句：\u201c我什么时候能回学校上课？\u201d",
      ],
      principles: "叙事重建 × 用户授权 × 结构化临床沟通 × 隐私边界",
      explanation: "把散落两周的自己收拢成一份能替她说话的东西，交给谁、说什么，都由她决定。",
      moduleTags: ["organize"],
      demoState: {
        enabled: true,
        now: makeDate("15:30"),
        surfaceMode: "organize",
      },
    },
    {
      id: "day2-praise",
      order: 4,
      time: "16:30",
      title: "写一张只给自己的卡片",
      narrative: [
        "材料整理好、确认下来，小晨没有立刻退出。",
        "她自己进了\u201c夸夸自己\u201d，对着一张空白卡片愣了一会儿，才写下一句。",
        "\u201c今天把这两周整理好了，还写下了最想问医生的那句话。\u201d",
        "这张卡片只有她能看到。在在也看不到。",
      ],
      principles: "叙事疗法·独特结果 × 自我肯定 × 正强化的自主化",
      explanation: "从被在在看见，到自己看见自己。",
      moduleTags: ["praise"],
      demoState: {
        enabled: true,
        now: makeDate("16:30"),
        surfaceMode: "praise",
      },
    },
    {
      id: "day2-lookback",
      order: 5,
      time: "21:00",
      title: "第一次，从外面看见自己这两周",
      narrative: [
        "睡前，小晨自己打开了“回头看看”。",
        "她看着入睡时间那条线，从两周前的凌晨一两点，一点点往午夜前挪；又看了三餐，这一周吃饭的记录，比上一周多了几笔。",
        "“原来我这两周是这么过的。有几天真的很糟——但看起来，并不是一直那么糟糕。”",
      ],
      principles: "认知重评 × 事实回顾 × 叙事整合 × 自我效能",
      explanation: "让零散的小变化，成为“我正在改变”的证据。",
      moduleTags: ["lookback"],
      demoState: {
        enabled: true,
        now: makeDate("21:00"),
        surfaceMode: "lookback",
      },
    },
  ],
};
