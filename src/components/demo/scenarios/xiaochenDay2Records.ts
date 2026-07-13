/* —— 小晨第二天「记一下」mock 记录数据 ——
 * 用于第二天 Step 4（饮食）和 Step 6（活动）的演示预览。
 * 后续「回头看看」和「帮我整理」任务可复用此数据。
 *
 * 这些记录不是真实用户输入，而是演示脚本中"已经发生过的生活事实"。
 * 表达重点：不是为了打卡完成，而是让今天真实发生过的事留下来。
 */

import type { RecordDemoPreset } from "../types";

/** Step 4｜12:30 饮食记录：主动说吃个面包 */
export const day2FoodRecord: RecordDemoPreset = {
  type: "food",
  title: "饮食",
  energyValue: 672,
  rows: [
    { label: "餐次", value: "午餐" },
    { label: "吃了什么", value: "面包" },
    { label: "感受", value: "吃了一点 / 还可以" },
    { label: "时间", value: "刚刚" },
  ],
  note: "今天中午主动吃了一个面包。",
  primaryButtonText: "保存记录",
};

/** Step 6｜15:30 活动记录：去学校交作业 */
export const day2ActivityRecord: RecordDemoPreset = {
  type: "activity",
  title: "活动",
  energyValue: 672,
  rows: [
    { label: "活动", value: "去学校交作业" },
    { label: "时长", value: "约 30 分钟" },
    { label: "感受", value: "有点累，但还可以" },
    { label: "时间", value: "刚刚" },
  ],
  note: "下午去了学校，把作业交了。",
  primaryButtonText: "保存记录",
};

/**
 * 小晨第二天所有「记一下」记录汇总。
 * 后续「回头看看」「帮我整理」可复用此数据作为两周 mock 数据的一部分。
 */
export const xiaochenDay2Records = [
  {
    type: "food" as const,
    time: "12:30",
    title: "午餐吃了面包",
    fields: {
      meal: "午餐",
      food: "面包",
      feeling: "吃了一点 / 还可以",
      note: "今天中午主动吃了一个面包",
    },
  },
  {
    type: "activity" as const,
    time: "15:30",
    title: "去学校交作业",
    fields: {
      activity: "去学校交作业",
      duration: "约 30 分钟",
      note: "下午去了学校，把作业交了",
    },
  },
];
