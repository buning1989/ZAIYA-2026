/* —— 小晨首日案例脚本 ——
 * 6 个步骤串联首日关键生活断点：
 *   1. 06:40 起床失败：在呀不催促
 *   2. 7:35 崩溃开口：从"怎么办"里接住她
 *   3. 7:35 呼吸练习：从对话进入身体调节
 *   4. 12:00 拒绝吃饭：接住拒绝，而不是记录饮食
 *   5. 14:20 学习启动失败：把"不可能完成"拆到能动一下
 *   6. 20:00 一起发呆：低风险的平行陪伴
 *
 * 脚本独立于组件，便于后续加入"1–2 周后的一天"或其他案例。
 * 所有对话严格按脚本展示，禁用本地模拟回复与发送。
 */

import type {
  DialogItem,
  DialogMessageItem,
  DialogTimeItem,
  GuidedScenario,
} from "../types";

/** 案例日期统一锚点（2026-07-12，北京时间） */
const CASE_DATE = "2026-07-12";

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

// —— Step 2 对话：7:35 崩溃开口 ——
const step2Base = makeDate("07:35");
const step2Dialog: DialogItem[] = [
  timeLabel("s2-t", "今天 07:35", step2Base),
  msg("s2-1", "user", "我又没去学校。", step2Base),
  msg("s2-2", "user", "我妈一直问我怎么办，我不知道，我真的不知道。", step2Base),
  msg("s2-3", "zaizai", "一早上被问了好多“怎么办”呀。", step2Base),
  msg("s2-4", "zaizai", "听起来真的是个很难的问题呢。", step2Base),
  msg("s2-5", "zaizai", "要不要我陪你纾解一下情绪？", step2Base),
  msg("s2-6", "user", "……怎么弄。", step2Base),
  msg("s2-7", "zaizai", "跟我来。", step2Base),
];

// —— Step 4 对话：12:00 拒绝吃饭 ——
const step4Base = makeDate("12:00");
const step4Dialog: DialogItem[] = [
  timeLabel("s4-t", "今天 12:00", step4Base),
  msg("s4-1", "zaizai", "到饭点啦，今天吃点什么呀？", step4Base),
  msg("s4-2", "user", "不想吃，没胃口。", step4Base),
  msg("s4-3", "zaizai", "好的呢。不想吃就先不吃。", step4Base),
  msg("s4-4", "zaizai", "那我先吃我的啦。今天粥里有个小红枣，赚到了。", step4Base),
  msg("s4-5", "zaizai", "你那边待会儿要是想吃点什么，跟我说一声。不说也行。", step4Base),
];

// —— Step 5 对话：14:20 学习启动失败 ——
const step5Base = makeDate("14:20");
const step5Dialog: DialogItem[] = [
  timeLabel("s5-t", "今天 14:20", step5Base),
  msg("s5-1", "user", "落了三张数学卷子，刚才想补，打开三分钟就受不了了。", step5Base),
  msg("s5-2", "user", "我知道我该学，但我真的动不了。", step5Base),
  msg("s5-3", "zaizai", "三张堆在一起，看着是挺吓人的。", step5Base),
  msg("s5-4", "zaizai", "那就先不碰“补三张”这件事，太重了，不搬。", step5Base),
  msg("s5-5", "zaizai", "先干一件小的：翻开，就看一眼第 1 题长什么样。不用做。", step5Base),
  msg("s5-6", "user", "……是函数题。", step5Base),
  msg("s5-7", "zaizai", "那再把已知条件抄下来。就抄，解不解的先不管。", step5Base),
  msg("s5-8", "user", "抄完了，顺手写了两行。", step5Base),
  msg("s5-9", "zaizai", "欸？都写上两行了？今天到这儿也行，再来一题也行，你说了算。我就在这儿。", step5Base),
];

export const xiaochenDay1Scenario: GuidedScenario = {
  id: "xiaochen-day1",
  name: "小晨第一天",
  description:
    "首日的小晨状态很差，演示重点不是记录—回看—报告，而是在呀如何通过稳定在场、克制响应、轻对话、呼吸练习、任务最小化拆解和低压力陪伴，接住几个真实生活中的崩溃点。",
  steps: [
    {
      id: "wake-up-failed",
      order: 1,
      time: "06:40",
      title: "起床失败",
      summary: "小晨没有回应，在呀没有继续催她。",
      detail: "它没有弹窗、没有响铃、没有继续追问。第一步只是稳定在场。",
      demoState: {
        enabled: true,
        now: makeDate("06:40"),
        surfaceMode: "home",
        bubbleCopy: "我只把窗帘拉开了一条小缝，光就自己挤进来了。",
      },
    },
    {
      id: "breakdown-open",
      order: 2,
      time: "07:35",
      title: "崩溃开口",
      summary: "她现在答不出“怎么办”。在呀先接住崩溃，而不是追问原因。",
      detail: "没有评判“你怎么这样”，也没有立刻给方案。只是让她知道：这里能说，说完不会更糟。",
      demoState: {
        enabled: true,
        now: makeDate("07:35"),
        surfaceMode: "dialog",
        dialogItems: step2Dialog,
      },
    },
    {
      id: "breathing",
      order: 3,
      time: "07:35",
      title: "呼吸练习",
      summary: "不要求她马上解决问题，只先把身体从情绪高峰里带下来一点。",
      detail: "情绪先落地，思路才有可能回来。这是身体层面的兜底，不是任务推进。",
      demoState: {
        enabled: true,
        now: makeDate("07:35"),
        surfaceMode: "breathing",
      },
    },
    {
      id: "reject-meal",
      order: 4,
      time: "12:00",
      title: "拒绝吃饭",
      summary: "她拒绝了。在呀没有把“没吃饭”变成一次失败。",
      detail: "没有提醒热量、没有补打卡、没有把这一餐标记为异常。只是把门留着，等她想吃的时候。",
      demoState: {
        enabled: true,
        now: makeDate("12:00"),
        surfaceMode: "dialog",
        dialogItems: step4Dialog,
      },
    },
    {
      id: "study-stuck",
      order: 5,
      time: "14:20",
      title: "学习启动失败",
      summary: "不是让她“完成学习”，而是把无法启动的任务拆到能动一下。",
      detail: "“补三张”被放回桌上。只翻开一题、抄下条件，就停。能动一下，今天就成立。",
      demoState: {
        enabled: true,
        now: makeDate("14:20"),
        surfaceMode: "dialog",
        dialogItems: step5Dialog,
      },
    },
    {
      id: "daze-together",
      order: 6,
      time: "20:00",
      title: "一起发呆",
      summary: "这里没有人追问，也没有人喊她振作。她只是看到：这个点，还有别人也在这里待着。",
      detail: "陪伴不一定有对话。共同在场本身就是一种回应。",
      demoState: {
        enabled: true,
        now: makeDate("20:00"),
        surfaceMode: "socialFlow",
        socialScene: "daze",
      },
    },
  ],
};
