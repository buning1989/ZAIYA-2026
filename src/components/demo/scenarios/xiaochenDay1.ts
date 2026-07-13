/* —— 小晨首日案例脚本 ——
 * 7 个步骤串联首日关键生活断点：
 *   1. 06:40 起床失败：在呀不催促
 *   2. 7:35 崩溃开口：从"怎么办"里接住她
 *   3. 7:35 呼吸练习：从对话进入身体调节
 *   4. 12:00 拒绝吃饭：接住拒绝，而不是记录饮食
 *   5. 14:20 学习启动失败：把"不可能完成"拆到能动一下
 *   6. 20:00 一起发呆：低风险的平行陪伴
 *   7. 01:30 反刍失眠：把注意力带回身体，让这一天能够结束
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
  msg("s2-3", "zaizai", "一早上被问了好多'怎么办'呀。", step2Base),
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
  msg("s5-4", "zaizai", "那就先不碰'补三张'这件事，太重了，不搬。", step5Base),
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
  intro:
    "这一天，小晨几乎没有力气主动记录。在呀没有催她完成任务，只在几个关键时刻，先让下一步有可能发生。",
  outro:
    "她没有突然好起来。但情绪被接住了，第一个动作发生了，饭点没有消失，深夜也终于有了出口。",
  steps: [
    {
      id: "wake-up-failed",
      order: 1,
      time: "06:40",
      title: "起床失败",
      userState: "妈妈叫她起床，她翻身埋回枕头，没有回应。",
      zaiyaAction: "没有弹窗、没有响铃、没有继续催促，只保留安静的晨起场景。",
      resultLabel: "意义",
      result: "不用新的任务压力放大焦虑，也保留下一次行动的可能。",
      moduleTags: ["home"],
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
      userState: "面对'接下来怎么办'的追问，她崩溃大哭，说自己真的不知道。",
      zaiyaAction: "先接住她正在承受的压力，不追问原因，也不急着给方案。",
      resultLabel: "意义",
      result: "让她知道这里可以开口，说完不会更糟。",
      moduleTags: ["dialog"],
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
      userState: "她喘不上气，也无法继续表达。",
      zaiyaAction: "带她完成一轮呼气更长的呼吸练习，先把身体从情绪高峰带下来一点。",
      resultLabel: "意义",
      result: "情绪先落地，语言和思考才有可能回来。",
      moduleTags: ["relief"],
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
      userState: "她没有胃口，只说'不想吃'。",
      zaiyaAction: "接受拒绝，不劝、不批评，也不把这一餐标记为失败，只告诉她随时可以加入。",
      resultLabel: "意义",
      result: "拒绝没有变成争执，饭点也没有从这一天里彻底消失。",
      moduleTags: ["dialog"],
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
      title: "无法开始学习",
      userState: "她知道要补三张卷子，但一打开就难受。",
      zaiyaAction: "把任务缩成'看一眼第一题'，再缩成'只抄下已知条件'。",
      resultLabel: "意义",
      result: "不要求完成学习，只让第一个动作真正发生。",
      moduleTags: ["dialog"],
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
      userState: "她不想说话，也不想再向任何人解释。",
      zaiyaAction: "让她进入无需发言、无需回应的共同在场空间。",
      resultLabel: "意义",
      result: "陪伴不一定需要对话。看到还有别人也在这里，孤立感就少一点。",
      moduleTags: ["social"],
      demoState: {
        enabled: true,
        now: makeDate("20:00"),
        surfaceMode: "socialFlow",
        socialScene: "daze",
      },
    },
    {
      id: "rumination-insomnia",
      order: 7,
      time: "01:30",
      title: "反刍失眠",
      userState: "白天的争吵、哭泣和未完成的作业，在脑子里反复播放。",
      zaiyaAction: "没有让她'别想了'，而是把注意力带回被子、呼吸和身体。",
      resultLabel: "意义",
      result: "不是立刻解决所有问题，而是先让这一天能够结束。",
      moduleTags: ["relief"],
      demoState: {
        enabled: true,
        now: makeDate("01:30"),
        surfaceMode: "breathing",
      },
    },
  ],
};
