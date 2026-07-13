/* —— 小晨第二天案例脚本（使用产品 2 周后的一天）——
 * 8 个步骤串联"齿轮开始咬合"的一天：
 *   1. 06:40 还是起不来，但主动看了一眼在在（入口前移）
 *   2. 06:50 自己顺手做了一轮练习（技能内化）
 *   3. 07:30 去不了学校，但提出下午交作业（可执行小目标）
 *   4. 12:30 主动说吃个面包（生活状态开始留下来）
 *   5. 14:30 崩溃前就来求助（预防性求助）
 *   6. 15:30 真的出门去学校交作业（现实行动发生）
 *   7. 18:50 被爸爸误解后，把做成的事还给她（冲突修复变快）
 *   8. 22:30 睡前收尾与两周整理（睡前自我评价出现）
 *
 * 核心表达：她仍然起不来、仍然请假、仍然会崩溃、仍然会被家人误解；
 * 但几个关键齿轮已经开始咬合。
 *
 * Step 1/2/3/5/7 已接入原生 demoState（首页 / 缓解 / 对话）；
 * Step 4/6 已接入「记一下」完成态预览（饮食 / 活动）；
 * Step 7 已接入「夸夸自己」完成态预览；
 * Step 8 已接入「回头看看」两周变化预览；
 * Step 9（新增）已接入「帮我整理」材料预览。
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
  day2OrganizeDemo,
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
  msg("d2-s3-5", "zaizai", "你刚说“应该去”——是心里想去，还是觉得不去不行？", step3Base),
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

// —— Step 7 原对话内容（18:50 被误解后事实归还）——
// 已切换为「夸夸自己」完成态预览。对话上下文保留在 story panel summary/detail 中。
// 如后续需要恢复对话展示，可重新启用此数组。
// const step7Base = makeDate("18:50");
// const step7Dialog: DialogItem[] = [
//   timeLabel("d2-s7-t", "今天 18:50", step7Base),
//   msg("d2-s7-1", "user", "我爸说我一天到晚就知道在家躺着。", step7Base),
//   msg("d2-s7-2", "user", "他根本不知道我下午其实去学校了。", step7Base),
//   msg("d2-s7-3", "zaizai", "你早上说想去，下午真的去了。", step7Base),
//   msg("d2-s7-4", "zaizai", "这件事是真的。他不知道，不等于它没发生。", step7Base),
//   msg("d2-s7-5", "user", "那有什么用，他又看不见。", step7Base),
//   msg("d2-s7-6", "zaizai", "嗯，他现在看不见。", step7Base),
//   msg("d2-s7-7", "zaizai", "可你的这一趟不是走给他看的。作业交了，是你自己的事落了地。", step7Base),
//   msg("d2-s7-8", "zaizai", "风摸起来什么样？", step7Base),
//   msg("d2-s7-9", "user", "……挺凉的。还行。", step7Base),
// ];

export const xiaochenDay2Scenario: GuidedScenario = {
  id: "xiaochen-day2",
  name: "小晨两周后",
  description:
    "使用产品 2 周后的一天。她仍然困难，但几个关键齿轮开始咬合：入口前移、主动报告、预防性求助、现实行动发生、冲突修复变快、睡前自我评价出现。",
  steps: [
    {
      id: "day2-morning-look",
      order: 1,
      time: "06:40",
      title: "还是起不来，但主动看了一眼",
      summary: "小晨仍然没有立刻起床，但醒来后第一件事，是主动看了一眼在在。",
      detail:
        "这不是起床成功，而是入口前移：在在已经从崩溃后的求助对象，变成了早晨可以靠近的生活锚点。",
      moduleTags: ["home"],
      contrast: {
        label: "和第一天相比",
        text: "第一天她没有碰手机；第二天，她先看了一眼在在。",
      },
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
      title: "不用重新解释，她自己做了一轮练习",
      summary: "她没有等到崩溃后才求助，而是顺手做了一轮已经熟悉的练习。",
      detail:
        "这里展示的不是新功能，而是技能开始内化：同样是缓解能力，第一天需要在呀带着做，第二天她可以自己启动。",
      moduleTags: ["relief"],
      contrast: {
        label: "和第一天相比",
        text: "第一天是崩溃后被带进呼吸；第二天是她自己提前做。",
      },
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
      title: "还是去不了学校，但出现了一个替代目标",
      summary: "小晨承认今天还是去不了学校，但自己提出：下午可以去学校交个作业。",
      detail:
        "在呀没有劝她必须去学校，而是帮她把“想去”“必须去”“没力气去”拆开，让一个够得着的小目标浮出来。",
      moduleTags: ["dialog"],
      contrast: {
        label: "和第一天相比",
        text: "第一天她被问“怎么办”后崩溃；第二天她自己说出了一个可执行的小目标。",
      },
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
      title: "从拒绝吃饭，到主动说吃个面包",
      summary: "饭点到了，小晨主动说：我吃个面包吧。",
      detail:
        "「记一下」不是打卡要求，而是把已经发生的生活事实轻轻留下来。这一步接入饮食记录完成态。",
      moduleTags: ["record"],
      contrast: {
        label: "和第一天相比",
        text: "第一天她拒绝吃饭；第二天她开始主动回应饭点。",
      },
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
      title: "还没崩溃，她先来求助",
      summary: "整理数学作业前，她感觉很难受，但这次是在崩溃前打开了在呀。",
      detail:
        "在呀只说“老规矩？”小晨自己说出第一步：先把卷子按顺序码好。任务拆解开始从外部提示变成她自己的方法。",
      moduleTags: ["dialog"],
      contrast: {
        label: "和第一天相比",
        text: "第一天是在呀教她拆到第一步；第二天是她自己说出第一步。",
      },
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
      title: "一个小目标真的落到了现实里",
      summary: "她真的出门去了学校，半小时后，作业交了，人也回来了。",
      detail:
        "这一路没有 App 交互。在呀没有定位、没有跟随。产品的目标不是把用户留在产品里，而是支持她走回现实生活。回来后，这件事被轻轻记下来。",
      moduleTags: ["record", "privacy"],
      contrast: {
        label: "和第一天相比",
        text: "第一天学习任务停在房间里；第二天，一个小目标真的落到了现实里。",
      },
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
      title: "没人看见，但这件事发生了",
      summary: "爸爸说她一天到晚躺着。她委屈地打开在呀：他根本不知道我下午其实去学校了。",
      detail:
        "夸夸自己不是空泛鼓励，而是把被忽视的真实行动重新还给用户：把“我今天真的去学校交了作业”做成一张夸夸卡。",
      moduleTags: ["dialog", "praise"],
      contrast: {
        label: "和第一天相比",
        text: "第一天冲突后她被情绪淹没；第二天她能更快回来修复。",
      },
      demoState: {
        enabled: true,
        now: makeDate("18:50"),
        surfaceMode: "praise",
        praiseDemo: day2PraiseDemo,
      },
    },
    {
      id: "day2-night-review",
      order: 8,
      time: "22:30",
      title: "睡前，她能说出今天好像没那么糟",
      summary: "她整理了书桌，睡前点开在在，说：今天好像没那么糟。",
      detail:
        "这一次，变化不是靠回忆拼出来的。两周里的饭点、出门、情绪修复和睡前收尾，都开始有迹可循。",
      moduleTags: ["lookback"],
      contrast: {
        label: "和第一天相比",
        text: "第一天深夜是反刍和求救；第二天深夜是收尾和自我评价。",
      },
      demoState: {
        enabled: true,
        now: makeDate("22:30"),
        surfaceMode: "lookback",
        lookbackDemo: day2LookbackDemo,
      },
    },
    {
      id: "day2-organize-summary",
      order: 9,
      time: "整理",
      title: "两周碎片，整理成给王医生的沟通材料",
      summary:
        "在呀把这两周零散留下来的生活事实，整理成小晨确认后可以带给王医生讨论的材料。",
      detail:
        "这不是诊断报告，也不是监控清单，而是帮助一次具体沟通更容易开始：她仍然困难，但已经出现了哪些具体变化，哪些问题仍然需要继续支持。",
      moduleTags: ["organize", "privacy"],
      contrast: {
        label: "和第一天相比",
        text: "第一天只能看到当天的混乱；两周后，零散变化可以被整理出来。",
      },
      demoState: {
        enabled: true,
        now: makeDate("22:40"),
        surfaceMode: "organize",
        organizeDemo: day2OrganizeDemo,
      },
    },
  ],
};
