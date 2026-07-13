/* —— 小晨两周 mock summary 数据 ——
 * 用于第二天收束闭环演示：
 *   - Step 7 夸夸自己：把被忽视的真实行动还给用户
 *   - Step 8 回头看看：两周变化被看见
 *   - Step 9 帮我整理：变成可讨论材料
 *
 * 这份数据只用于案例演示，不影响真实用户数据。
 * 表达边界：不使用「治好/康复/诊断报告」，明确仍然困难但齿轮开始咬合。
 */

import {
  completeSession,
  createMockDisclosure,
  type CommunicationSession,
  type CommunicationTopic,
} from "@/data/organize";
import type {
  LookbackDemoConfig,
  OrganizeDemoConfig,
  PraiseDemoConfig,
} from "../types";

/** Step 7｜18:50 夸夸自己：被误解后，把做成的事还给她 */
export const day2PraiseDemo: PraiseDemoConfig = {
  guideText: "可以留下一句很小的夸夸。",
  energyValue: 672,
  readOnly: true,
  cards: [
    {
      id: "day2-school-card",
      text: "我今天下午去了学校，把作业交了。",
      dateLabel: "7月26日",
      gradientId: "g1",
    },
    {
      id: "day2-cloud-card",
      text: "今天的云彩很漂亮，狗子也很可爱",
      dateLabel: "7月25日",
      gradientId: "g2",
    },
    {
      id: "day2-bread-card",
      text: "中午主动吃了一个面包",
      dateLabel: "7月24日",
      gradientId: "g3",
    },
    {
      id: "day2-small-win-card",
      text: "真是每一次小胜",
      dateLabel: "7月23日",
      gradientId: "g4",
    },
    {
      id: "day2-paper-card",
      text: "把卷子按顺序码好了",
      dateLabel: "7月22日",
      gradientId: "g1",
    },
    {
      id: "day2-night-card",
      text: "今天好像没那么糟",
      dateLabel: "7月21日",
      gradientId: "g2",
    },
  ],
};

/** Step 8｜22:30 回头看看：用真实回头看看结构展示两周后当天的记录 */
export const day2LookbackDemo: LookbackDemoConfig = {
  referenceDate: "2026-07-26T22:30:00+08:00",
  initialTimeMode: "week",
  initialScene: "activity",
  readOnly: true,
  dataOverrides: {
    "2026-07-26": {
      activityLevel: 2,
      activityContent: "去学校交作业",
      activityDuration: "约 30 分钟",
      activityFeeling: "有点累，但还可以",
      activityRecordTime: "15:30",
      activityNote: "下午去了学校，把作业交了，往返约 30 分钟",
      meals: { breakfast: "unknown", lunch: "yes", dinner: "yes" },
      mealFeeling: "吃了一点 / 还可以",
      mealEntries: [
        {
          mealType: "午餐",
          food: "面包",
          feeling: "吃了一点 / 还可以",
          time: "12:30",
          note: "今天中午主动吃了一个面包",
        },
      ],
      mood: 4,
      moodWords: ["踏实", "松了一点"],
      moodTrigger: "睡前整理书桌",
      moodBody: "有点累",
      moodNote: "今天好像没那么糟",
      moodEntries: [
        {
          time: "22:30",
          mood: 4,
          moodWords: ["踏实", "松了一点"],
          moodTrigger: "睡前整理书桌",
          moodBody: "有点累",
          moodNote: "今天好像没那么糟",
          moodSpecial: null,
        },
      ],
    },
    "2026-07-25": {
      activityLevel: 1,
      activityContent: "整理书桌",
      activityDuration: "约 10 分钟",
      activityFeeling: "还可以",
      activityRecordTime: "21:20",
    },
    "2026-07-24": {
      meals: { breakfast: "unknown", lunch: "yes", dinner: "yes" },
      mealEntries: [
        {
          mealType: "午餐",
          food: "面包",
          feeling: "还可以",
          time: "12:40",
          note: "饭点主动回应了一次",
        },
      ],
    },
  },
};

const day2OrganizeTopics: CommunicationTopic[] = [
  {
    id: "day2-topic-morning",
    title: "早晨启动困难仍然明显，但入口前移了",
    content: "这两周早晨仍然很难起床，不过醒来后有几次会先看一眼在在。",
    sourceType: "system_summary",
    evidenceSummary: [
      "最近 14 天内多次记录早晨起床困难",
      "近几天醒来后开始主动打开应用",
      "7 月 26 日早晨没有返校，但能继续讨论一个替代目标",
    ],
    selected: true,
    edited: false,
    allowedInMaterial: true,
  },
  {
    id: "day2-topic-food-action",
    title: "饭点回应和现实行动开始出现",
    content: "她开始能在饭点主动说吃一点，也在 7 月 26 日下午去学校交了作业。",
    sourceType: "system_summary",
    evidenceSummary: [
      "7 月 26 日 12:30 记录：午餐吃了一个面包",
      "7 月 26 日 15:30 记录：去学校交作业，往返约 30 分钟",
      "这些行动仍然很小，但已经从讨论落到现实生活里",
    ],
    selected: true,
    edited: false,
    allowedInMaterial: true,
  },
  {
    id: "day2-topic-family",
    title: "家庭沟通里容易看不见已经完成的小行动",
    content: "家人可能仍然只看到她躺着，但这两周已经出现一些具体完成过的事。",
    sourceType: "system_summary",
    evidenceSummary: [
      "7 月 26 日傍晚因“家人没看见下午去学校”产生委屈",
      "冲突后她能更快回到应用里求助和整理事实",
      "下次沟通可讨论如何让小行动被看见，而不是只讨论没做到的部分",
    ],
    selected: true,
    edited: false,
    allowedInMaterial: true,
  },
];

const day2Disclosure = createMockDisclosure();
day2Disclosure.originalRecords = day2Disclosure.originalRecords.map((record) => ({
  ...record,
  selected: true,
}));
day2Disclosure.decision = "include";
day2Disclosure.confirmed = true;
day2Disclosure.allowedInMaterial = true;

const day2OrganizeSession: CommunicationSession = {
  id: "xiaochen-day2-organize",
  contactId: "contact-wang-doctor",
  contactSnapshot: {
    displayName: "王医生",
    roleType: "doctor",
    roleLabel: "精神科医生",
  },
  rangeKey: "14",
  startDate: "2026-07-13",
  endDate: "2026-07-26",
  totalDays: 14,
  recordedDays: 9,
  recordCategories: ["睡眠", "情绪", "饮食", "学校与家庭"],
  communicationTopics: day2OrganizeTopics,
  specialDisclosure: day2Disclosure,
  status: "completed",
  createdAt: Date.parse("2026-07-26T22:40:00+08:00"),
};

/** Step 9｜帮我整理：用真实整理材料详情展示用户确认后的沟通材料 */
export const day2OrganizeDemo: OrganizeDemoConfig = {
  view: "done",
  historyEntry: completeSession(day2OrganizeSession),
};

/**
 * 小晨两周汇总数据（结构化）。
 * 后续任务可复用此数据扩展真实回头看看 / 帮我整理模块。
 */
export const xiaochenTwoWeekSummary = {
  period: "使用在呀约 2 周",
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
