/* —— 小晨第二天案例脚本（使用产品 2 周后的一天）——
 * 9 个步骤串联"齿轮开始咬合"的一天：
 *   1. 06:40 主动看一眼：支持入口前移
 *   2. 06:50 主动调节自己：技能开始内化
 *   3. 07:30 把返校缩小一步：可执行小目标
 *   4. 12:30 主动回应饭点：生活节律重新连接
 *   5. 14:30 崩溃前先求助：预防性求助
 *   6. 15:30 真的去了学校：现实行动发生
 *   7. 18:50 让进步不被抹掉：冲突修复变快
 *   8. 22:30 一起做点收尾：睡前收尾
 *   9. 00:40 今天好像没那么糟：自我评价出现
 *
 * 核心表达：她仍然起不来、仍然请假、仍然会崩溃、仍然会被家人误解；
 * 但几个关键齿轮已经开始咬合。
 */

import type {
  DialogItem,
  DialogMessageItem,
  DialogTimeItem,
  GuidedScenario,
} from "../types";
import { day2FoodRecord, day2ActivityRecord } from "./xiaochenDay2Records";
import {
  day2PraiseDemo,
  day2LookbackDemo,
} from "./xiaochenTwoWeekSummary";

/** 案例日期统一锚点（2026-07-26，距第一天约两周，北京时间） */
const CASE_DATE = "2026-07-26";

function makeDate(hhmm: string): Date {
  return new Date(`${CASE_DATE}T${hhmm}:00+08:00`);
}

function msg(
  id: string,
  role: DialogMessageItem["role"],
  text: string,
  date: Date,
): DialogMessageItem {
  return { kind: "message", id, role, text, createdAt: date.getTime() };
}

function timeLabel(
  id: string,
  label: string,
  date: Date,
): DialogTimeItem {
  return { kind: "time", id, label, createdAt: date.getTime() };
}

// —— Step 3 对话：7:30 替代目标出现 ——
const step3Base = makeDate("07:30");
const step3Dialog: DialogItem[] = [
  timeLabel("d2-s3-t", "今天 07:30", step3Base),
  msg("d2-s3-1", "user", "我今天还是去不了学校。", step3Base),
  msg("d2-s3-2", "zaizai", "嗯，知道啦。今天先不去。", step3Base),
  msg("d2-s3-3", "user", "你不劝我？我觉得我还是应该去的。", step3Base),
  msg("d2-s3-4", "zaizai", "劝啥呀，你自己不是都在想这事嘛。", step3Base),
  msg("d2-s3-5", "zaizai", "你刚说\u201c应该去\u201d——是心里想去，还是觉得不去不行？", step3Base),
  msg("d2-s3-6", "user", "都有吧，想去，也觉得不去不行，但是没力气去……", step3Base),
  msg("d2-s3-7", "zaizai", "没力气是真的。想去也是真的。都是真的。", step3Base),
  msg("d2-s3-8", "user", "我觉得我可以下午去学校交个作业。", step3Base),
  msg("d2-s3-9", "zaizai", "下午去交个作业。这个听着不累——去一趟，交了，就回来。", step3Base),
];

// —— Step 5 对话：14:30 崩溃前求助 ——
const step5Base = makeDate("14:30");
const step5Dialog: DialogItem[] = [
  timeLabel("d2-s5-t", "今天 14:30", step5Base),
  msg("d2-s5-1", "user", "我得把要交的数学理出来，但有点不想开始，感觉很难受。", step5Base),
  msg("d2-s5-2", "zaizai", "嗯，又是件有点重的活儿。", step5Base),
  msg("d2-s5-3", "zaizai", "老规矩？", step5Base),
  msg("d2-s5-4", "user", "先把卷子按顺序码好，就干这一件。", step5Base),
  msg("d2-s5-5", "zaizai", "行。你码，我在。", step5Base),
  msg("d2-s5-6", "user", "码完了，顺便把错题夹了个条。", step5Base),
  msg("d2-s5-7", "zaizai", "比码卷子还多干了一件。", step5Base),
];

export const xiaochenDay2Scenario: GuidedScenario = {
  id: "xiaochen-day2",
  name: "小晨两周后",
  description:
    "使用产品 2 周后的一天。她仍然困难，但几个关键齿轮开始咬合：入口前移、主动报告、预防性求助、现实行动发生、冲突修复变快、睡前自我评价出现。",
  intro:
    "她仍然困难，但几个关键齿轮开始咬合：支持入口前移，熟悉的方法开始变成自己的能力，小行动也真正落进现实。",
  steps: [
    {
      id: "day2-morning-look",
      order: 1,
      time: "06:40",
      title: "主动看一眼",
      userState: "她还是起不来，但醒来后先看了一眼在在。",
      zaiyaAction: "像往常一样慢慢开始早晨，没有催她。",
      resultLabel: "变化",
      result: "支持入口从崩溃之后，前移到一天刚开始。",
      moduleTags: ["home"],
      demoState: {
        enabled: true,
        now: makeDate("06:40"),
        surfaceMode: "home",
        bubbleCopy: "今天是全世界谁都没有过过的、崭新的一天。",
      },
    },
    {
      id: "day2-self-relief",
      order: 2,
      time: "06:50",
      title: "主动调节自己",
      userState: "她躺在床上，主动做了一轮已经熟悉的呼吸练习。",
      zaiyaAction: "不再重复解释，只陪她按节奏完成。",
      resultLabel: "变化",
      result: "调节工具开始从\u201c被带着用\u201d，变成\u201c自己会用\u201d。",
      moduleTags: ["relief"],
      demoState: {
        enabled: true,
        now: makeDate("06:50"),
        surfaceMode: "breathing",
      },
    },
    {
      id: "day2-school-alternative",
      order: 3,
      time: "07:30",
      title: "把返校缩小一步",
      userState: "她承认今天还是去不了学校，但提出下午去交作业。",
      zaiyaAction: "不要求完整返校，只把目标缩成\u201c去学校、交作业、再回来\u201d。",
      resultLabel: "变化",
      result: "从\u201c必须恢复正常\u201d，变成今天够得着的一步。",
      moduleTags: ["dialog"],
      demoState: {
        enabled: true,
        now: makeDate("07:30"),
        surfaceMode: "dialog",
        dialogItems: step3Dialog,
      },
    },
    {
      id: "day2-lunch-bread",
      order: 4,
      time: "12:30",
      title: "主动回应饭点",
      userState: "饭点到了，她主动说：\u201c我吃个面包吧。\u201d",
      zaiyaAction: "接住这次回应，并把已经发生的进食轻轻留下。",
      resultLabel: "变化",
      result: "从拒绝饮食，到重新连接生活节律。",
      moduleTags: ["record"],
      demoState: {
        enabled: true,
        now: makeDate("12:30"),
        surfaceMode: "record",
        recordPreset: day2FoodRecord,
      },
    },
    {
      id: "day2-before-collapse",
      order: 5,
      time: "14:30",
      title: "崩溃前先求助",
      userState: "整理数学作业前，她刚开始难受，就主动打开了在呀。",
      zaiyaAction: "只说\u201c老规矩？\u201d，让她自己说出第一步：先把卷子按顺序码好。",
      resultLabel: "变化",
      result: "求助从事后补救，前移到失控之前。",
      moduleTags: ["dialog"],
      demoState: {
        enabled: true,
        now: makeDate("14:30"),
        surfaceMode: "dialog",
        dialogItems: step5Dialog,
      },
    },
    {
      id: "day2-submit-homework",
      order: 6,
      time: "15:30",
      title: "真的去了学校",
      userState: "她真的出了门，交完作业，半小时后回到家。",
      zaiyaAction: "没有定位、跟随或打扰，只在她回来后把这件事留下。",
      resultLabel: "变化",
      result: "产品不是把她留在屏幕里，而是支持她重新走回现实生活。",
      moduleTags: ["record", "privacy"],
      demoState: {
        enabled: true,
        now: makeDate("15:30"),
        surfaceMode: "record",
        recordPreset: day2ActivityRecord,
      },
    },
    {
      id: "day2-after-conflict",
      order: 7,
      time: "18:50",
      title: "让进步不被抹掉",
      userState: "爸爸说她\u201c一天到晚躺着\u201d，她委屈地说自己下午其实去过学校。",
      zaiyaAction: "把\u201c我今天真的去学校交了作业\u201d做成一张夸夸卡。",
      resultLabel: "变化",
      result: "一次争吵，不再覆盖这一天已经发生的努力。",
      moduleTags: ["dialog", "praise"],
      demoState: {
        enabled: true,
        now: makeDate("18:50"),
        surfaceMode: "praise",
        praiseDemo: day2PraiseDemo,
      },
    },
    {
      id: "day2-night-tidy",
      order: 8,
      time: "22:30",
      title: "一起做点收尾",
      userState: "她跟着在在，把书桌整理出一小块空间。",
      zaiyaAction: "同步洗漱、拉伸、调暗灯光，陪她慢慢退出任务状态。",
      resultLabel: "变化",
      result: "外部环境开始有序，身体也更容易进入休息。",
      moduleTags: ["lookback"],
      demoState: {
        enabled: true,
        now: makeDate("22:30"),
        surfaceMode: "lookback",
        lookbackDemo: day2LookbackDemo,
      },
    },
    {
      id: "day2-night-review",
      order: 9,
      time: "00:40",
      title: "今天好像没那么糟",
      userState: "她点醒在在，说：\u201c今天……好像没那么糟。\u201d",
      zaiyaAction: "陪她回看吃面包、提前求助、交作业和整理书桌这些具体事实。",
      resultLabel: "变化",
      result: "零散的小行动，开始成为\u201c我正在改变\u201d的证据。",
      moduleTags: ["lookback"],
      demoState: {
        enabled: true,
        now: makeDate("00:40"),
        surfaceMode: "lookback",
        lookbackDemo: day2LookbackDemo,
      },
    },
  ],
};
