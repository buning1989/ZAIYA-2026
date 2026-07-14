/* —— 小晨首日案例脚本 ——
 * 5 个步骤串联首日关键生活断点：
 *   1. 06:40 起床失败
 *   2. 07:35 情绪失控（对话 + 呼吸练习，合并为一个节点）
 *   3. 12:00 拒绝吃饭
 *   4. 20:00 一起发呆
 *   5. 01:30 反刍失眠
 *
 * 所有文案严格来自最新剧情线文档，不做自行概括或改写。
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

// —— Step 2 对话：07:35 情绪失控 ——
const step2Base = makeDate("07:35");
const step2Dialog: DialogItem[] = [
  timeLabel("s2-t", "今天 07:35", step2Base),
  msg("s2-1", "user", "我又没办法去学校。", step2Base),
  msg("s2-2", "user", "我妈一直问我怎么办？我爸也是，我不知道，我真的不知道。", step2Base),
  msg("s2-3", "zaizai", "一早上被问了好多“怎么办”呀。", step2Base),
  msg("s2-4", "zaizai", "这么大的事，哪能马上知道。你现在还好吗？", step2Base),
  msg("s2-5", "user", "很烦，刚哭了一场，感觉喘不上气。", step2Base),
  msg("s2-6", "zaizai", "喘不上气的时候，我会把气吐得长一点，要不要一起。", step2Base),
  msg("s2-7", "user", "……怎么弄。", step2Base),
  msg("s2-8", "zaizai", "跟我来。吸————呼————呼的时候长一点，像给气球慢慢放气。", step2Base),
];

// —— Step 5 对话：01:30 反刍失眠 ——
// 注：原剧情最后引向"一起睡觉"场景，按最新产品决策不进入该路径，
// 只修改最后一句对白使其收束到身体和休息，不再出现"一起睡觉"入口。
const step5Base = makeDate("01:30");
const step5Dialog: DialogItem[] = [
  timeLabel("s5-t", "今天 01:30", step5Base),
  msg("s5-1", "zaizai", "……嗯？我在……", step5Base),
  msg("s5-2", "user", "睡不着。", step5Base),
  msg("s5-3", "zaizai", "这个点了呀……你还好吗？", step5Base),
  msg("s5-4", "user", "一躺下就开始想 我爸那张暴怒的脸 没写完的卷子 同学一直在上学 我去不了学校成绩就一直下滑 各种乱七八糟的。", step5Base),
  msg("s5-5", "zaizai", "脑子里在放电视啊，循环播放那种，最烦了。", step5Base),
  msg("s5-6", "zaizai", "那些事让它们先在门口等等，天亮了再说，现在不是它们的时间。", step5Base),
  msg("s5-7", "user", "……我感觉我做不到。", step5Base),
  msg("s5-8", "zaizai", "不用做到的。睡着这件事急不来，我自己也是躺着躺着才睡着的，从来不是努力来的。", step5Base),
  msg("s5-9", "zaizai", "眼睛闭着，身体歇着，就挺好的。", step5Base),
  msg("s5-10", "user", "可我一闭眼睛脑袋里就放电视。", step5Base),
  msg("s5-11", "zaizai", "那我们先不关电视。只把声音调小一点，先感觉一下被子、枕头和呼吸。", step5Base),
];

export const xiaochenDay1Scenario: GuidedScenario = {
  id: "xiaochen-day1",
  name: "小晨第一天",
  description:
    "首日的小晨状态很差，演示重点是在呀 ZÀIYA 如何通过稳定在场、克制响应、轻对话、呼吸练习、任务最小化拆解和低压力陪伴，接住几个真实生活中的崩溃点。",
  intro:
    "这一天，小晨几乎没有力气主动记录。在呀 ZÀIYA 没有催她完成任务，只在几个关键时刻，先让下一步有可能发生。",
  outro:
    "她没有突然好起来。但情绪被接住了，第一个动作发生了，饭点没有消失，深夜也终于有了出口。",
  steps: [
    {
      id: "wake-up-failed",
      order: 1,
      time: "06:40",
      title: "起不来床",
      narrative: [
        "妈妈叫她起床。小晨翻身，埋回枕头。",
        "过了一会儿，她摸到手机想看几点。屏幕亮起来，在在正在拉开自己的窗帘。",
        "没有弹窗，没有响铃，没有一句\"该起床了\"。",
        "在在只是在过它自己的早晨。",
      ],
      principles: "替代性示范 × 最小行为启动 × 非对峙原则 × 昼夜节律锚定",
      explanation: "降低启动压力，也保留下一次行动的可能。",
      moduleTags: ["widget"],
      demoState: {
        enabled: true,
        now: makeDate("06:40"),
        surfaceMode: "home",
        bubbleCopy: "我把窗帘拉开了一点，光会自己进来。",
      },
    },
    {
      id: "breakdown",
      order: 2,
      time: "07:35",
      title: "喘不上气",
      narrative: [
        "上学没去成。父母一直在问\"接下来怎么办\"。小晨哭到喘不上气。",
        "她自己点开了桌面小组件。打字：\"我真的不知道怎么办。\"",
        "在没有追问，也没有解释。它说：喘不上气的时候，我会把气吐得长一点。要不要一起。",
        "小晨点了。几轮之后，她能重新说出完整的句子。",
      ],
      principles: "DBT 情绪验证 × 痛苦耐受 × 呼吸减压 × 自主选择",
      explanation: "不解决问题，先让她能重新说话。",
      moduleTags: ["dialog", "relief"],
      // 主场景：对话界面
      demoState: {
        enabled: true,
        now: makeDate("07:35"),
        surfaceMode: "dialog",
        dialogItems: step2Dialog,
      },
      // 次要场景：呼吸练习（同节点内，结构已建立，UI 切换待后续实现）
      secondaryDemoState: {
        enabled: true,
        now: makeDate("07:35"),
        surfaceMode: "breathing",
      },
    },
    {
      id: "reject-meal",
      order: 3,
      time: "12:00",
      title: "只喝了一杯奶茶",
      narrative: [
        "早上那阵之后，小晨又睡回去了。中午醒来，没胃口，倒了杯奶茶。",
        "抬手看时间，表盘上在在正在吃午饭。它有它的饭点。",
        "小晨打了三个字：\u201c不想吃。\u201d",
        "在在说：好。我先吃了。",
        "它没有劝，也没有再问。饭点这件事，没有从这一天里消失。",
      ],
      principles:
        "动机性访谈·与阻抗同行 × 替代性示范 × 进食节律锚定",
      explanation: "拒绝不需要成本，饭点才不会被彻底关掉。",
      moduleTags: ["watch"],
      demoState: {
        enabled: true,
        now: makeDate("12:00"),
        surfaceMode: "home",
        bubbleCopy: "到饭点啦，今天吃点什么呀？",
      },
    },
    {
      id: "daze-together",
      order: 4,
      time: "20:00",
      title: "待了四十分钟",
      narrative: [
        "晚上家里又吵了一次。小晨没有力气开口，也不想再解释什么。",
        "她没跟任何人说，自己点进了\u201c一起发呆\u201d。",
        "屏幕上是一片黄昏的草坡。上面躺着、坐着、打着盹的，是别人。没有人说话，没有人需要她回应。",
        "她挑了\u201c安静躺着\u201d。然后什么也没做，待了四十分钟。",
      ],
      principles: "普遍性（Yalom） × 平行陪伴 × 无条件积极关注 × 去羞耻化",
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
      order: 5,
      time: "01:30",
      title: "还没睡",
      narrative: [
        "夜已经很深，身体累到瘫软，脑子却仍在反复播放白天的哭泣、争吵和没写完的作业。",
        "小晨点开在呀 ZÀIYA，把已经睡着的在在叫醒。",
        "在在没有让她“别想了”，而是把念头比作一台关不掉的电视，引导她暂时不去看，",
        "屏幕在 01:52 暗下去。她没有说晚安。",
      ],
      narrativeLeads: [
        "夜已经很深",
        "小晨点开在呀 ZÀIYA",
        "在在没有让她",
      ],
      principles: "ACT 接纳与认知去融合 × CBT-I 担忧推迟 × 正念锚定",
      plainExplanation:
        "不是要求小晨立刻停止思考，而是先允许念头存在，再把注意力从反刍带回身体和当下。",
      explanation: "减少睡前反刍，重新建立“床用于休息”的联结。",
      moduleTags: ["dialog"],
      demoState: {
        enabled: true,
        now: makeDate("01:30"),
        surfaceMode: "dialog",
        dialogItems: step5Dialog,
      },
    },
  ],
};
