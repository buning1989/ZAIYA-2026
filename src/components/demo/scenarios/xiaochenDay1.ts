/* —— 小晨首日案例脚本 ——
 * 7 个步骤串联首日关键生活断点：
 *   1. 06:40 起床失败
 *   2. 07:35 情绪失控——对话画面
 *   3. 07:35 情绪失控——缓解画面
 *   4. 12:00 拒绝吃饭
 *   5. 14:20 无法开始学习
 *   6. 20:00 一起发呆
 *   7. 01:30 反刍失眠
 *
 * 所有文案严格来自最新 Word 文档原文，不做自行概括或改写。
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

// —— Step 2 对话：07:35 情绪失控——对话画面 ——
const step2Base = makeDate("07:35");
const step2Dialog: DialogItem[] = [
  timeLabel("s2-t", "今天 07:35", step2Base),
  msg("s2-1", "user", "我又没去学校。", step2Base),
  msg("s2-2", "user", "我妈一直问我怎么办，我不知道，我真的不知道。", step2Base),
  msg("s2-3", "zaizai", "一早上被问了好多怎么办呀。", step2Base),
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

// —— Step 5 对话：14:20 无法开始学习 ——
const step5Base = makeDate("14:20");
const step5Dialog: DialogItem[] = [
  timeLabel("s5-t", "今天 14:20", step5Base),
  msg("s5-1", "user", "落了三张数学卷子，刚才想补，打开三分钟就受不了了。", step5Base),
  msg("s5-2", "user", "我知道我该学，但我真的动不了。", step5Base),
  msg("s5-3", "zaizai", "三张堆在一起，看着是挺吓人的。", step5Base),
  msg("s5-4", "zaizai", "那就先不碰补三张这件事，太重了，不搬。", step5Base),
  msg("s5-5", "zaizai", "先干一件小的：翻开，就看一眼第 1 题长什么样。不用做。", step5Base),
  msg("s5-6", "user", "……是函数题。", step5Base),
  msg("s5-7", "zaizai", "那再把已知条件抄下来。就抄，解不解的先不管。", step5Base),
  msg("s5-8", "user", "抄完了，顺手写了两行。", step5Base),
  msg("s5-9", "zaizai", "欸？都写上两行了？今天到这儿也行，再来一题也行，你说了算。我就在这儿。", step5Base),
];

// —— Step 7 对话：01:30 反刍失眠（低刺激深夜对话） ——
const step7Base = makeDate("01:30");
const step7Dialog: DialogItem[] = [
  timeLabel("s7-t", "今天 01:30", step7Base),
  msg("s7-1", "user", "在在……你睡了吗。", step7Base),
  msg("s7-2", "zaizai", "嗯，醒了。怎么了。", step7Base),
  msg("s7-3", "user", "脑子停不下来，一直在想白天那些事。", step7Base),
  msg("s7-4", "zaizai", "像一台关不掉的电视是吧。", step7Base),
  msg("s7-5", "zaizai", "我们不去跟它较劲。先不去看它。", step7Base),
  msg("s7-6", "zaizai", "感觉一下被子，是暖的吗。", step7Base),
  msg("s7-7", "user", "……暖的。", step7Base),
  msg("s7-8", "zaizai", "再跟我慢慢呼一口气。呼气长一点。", step7Base),
  msg("s7-9", "zaizai", "电视还在响也没关系，我们先把注意力放在被子和呼吸上。", step7Base),
];

export const xiaochenDay1Scenario: GuidedScenario = {
  id: "xiaochen-day1",
  name: "小晨第一天",
  description:
    "首日的小晨状态很差，演示重点是在呀如何通过稳定在场、克制响应、轻对话、呼吸练习、任务最小化拆解和低压力陪伴，接住几个真实生活中的崩溃点。",
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
      narrative: [
        "妈妈叫起床，小晨翻身埋回枕头，没有碰手机。",
        "小晨打开在呀 ZÀIYA，看到在在拉开了窗帘，象征新一天的开始。",
        "它没有弹窗、没有响铃、没有催小晨起床。",
        "稳定出现的晨起画面，成为不施压的生活节律参照。",
      ],
      principles: "替代性示范 × 最小行为启动 × 非对峙原则 × 昼夜节律锚定",
      explanation: "降低启动压力，也保留下一次行动的可能。",
      moduleTags: ["home"],
      demoState: {
        enabled: true,
        now: makeDate("06:40"),
        surfaceMode: "home",
        bubbleCopy: "我只把窗帘拉开了一条小缝，光就自己挤进来了。",
      },
    },
    {
      id: "breakdown-dialog",
      order: 2,
      time: "07:35",
      title: "情绪失控",
      narrative: [
        "面对父母不断追问“接下来怎么办”，小晨崩溃大哭，喘不上气。",
        "她主动打开在呀 ZÀIYA，说自己真的不知道怎么办。",
        "在在先复述她正在承受的压力，再带她进入一次呼气更长的呼吸练习。",
      ],
      principles: "DBT 情绪验证 × 痛苦耐受 × 呼吸减压 × 自主选择",
      explanation: "识别情绪危机，匹配调节工具，帮助基本功能恢复。",
      moduleTags: ["dialog"],
      demoState: {
        enabled: true,
        now: makeDate("07:35"),
        surfaceMode: "dialog",
        dialogItems: step2Dialog,
      },
    },
    {
      id: "breakdown-relief",
      order: 3,
      time: "07:35",
      title: "情绪失控",
      narrative: [
        "在在先复述她正在承受的压力，再带她进入一次呼气更长的呼吸练习。",
        "几轮呼吸后，小晨从无法表达，恢复到可以继续说话和思考。",
      ],
      principles: "DBT 情绪验证 × 痛苦耐受 × 呼吸减压 × 自主选择",
      explanation: "识别情绪危机，匹配调节工具，帮助基本功能恢复。",
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
      narrative: [
        "小晨中午才起床，没有胃口，只喝了一杯奶茶。",
        "在呀 ZÀIYA 在饭点邀请她一起吃饭，小晨回复“不想吃”。",
        "在在接受她的拒绝，并没有劝她不吃饭不行，它安静地继续吃自己的午饭，并告诉她随时可以加入。",
        "拒绝没有变成争执，饭点也没有从这一天里彻底消失。",
      ],
      principles:
        "动机性访谈·与阻抗同行 × 替代性示范 × 替代性强化 × 进食节律锚定",
      explanation: "降低进食阻力，保留与饮食节律重新连接的入口。",
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
      narrative: [
        "小晨告诉在在：“我知道我该学，但我真的动不了。”",
        "在呀 ZÀIYA 把“补完三张卷子”拆成“先看一眼第一题”，再拆成“只抄下已知条件”。",
        "小晨最终写下两行，从完全无法开始，变成完成了第一个动作。",
        "这两行也成为“我不是完全做不到”的真实证据。",
      ],
      principles: "CBT 行为激活 × 任务分级 × 行为实验 × 事实性肯定",
      explanation: "把任务缩小到行动能够发生，重新启动执行功能和掌控感。",
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
      narrative: [
        "小晨不想说话，也不想再向任何人解释。",
        "她进入在呀 ZÀIYA 的“一起发呆”场景。",
        "无需发言、无需回应，在在和其他用户的虚拟形象只是安静地待在她身边。",
        "看到许多人也只是躺着、坐着、发呆，小晨第一次感到：原来不止我一个人撑不住。",
      ],
      principles: "团体治疗·普遍性 × 平行陪伴 × 无条件积极关注 × 去羞耻化",
      explanation: "在用户无力表达时，降低孤立感，让情绪在共同在场中回落。",
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
      narrative: [
        "小晨身体已经很累，脑子仍反复播放白天的哭泣、争吵和未完成的作业。",
        "她点开在呀 ZÀIYA，把已经睡着的在在叫醒。",
        "在在启动低刺激的深夜对话，没有让她“别想了”，而是把念头比作关不掉的电视，引导她暂时不去看，再把注意力带回被子、呼吸和身体。",
        "对话结束后，在在重新躺下，小晨也逐渐从反刍回到休息状态。",
      ],
      principles: "ACT 接纳与认知去融合 × CBT-I 担忧推迟 × 刺激控制 × 正念锚定",
      explanation: "减少睡前反刍，帮助大脑重新建立“床用于休息”的联结。",
      moduleTags: ["dialog"],
      demoState: {
        enabled: true,
        now: makeDate("01:30"),
        surfaceMode: "dialog",
        dialogItems: step7Dialog,
      },
    },
  ],
};
