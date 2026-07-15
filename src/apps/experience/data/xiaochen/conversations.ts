/* —— 小晨体验模式：AI 对话预置数据与确定性 Mock 回复 ——
 *
 * 本文件提供小晨专属的预置对话历史（按日期分线程）和上下文感知的
 * 确定性 Mock 回复生成器，替代 AppMainSurface 中通用的 buildDemoReply /
 * createMockDialogItems，用于体验模式进入对话页时的初始展示与新消息回复。
 *
 * 设计约束：
 *   - 严格遵循 DialogItem 类型（kind: "time" | "message"）
 *   - 时间条目使用 label 字段承载人类可读时间串，createdAt 承载确定性时间戳
 *   - 消息条目仅含 kind / id / role / text / createdAt，不引入额外字段
 *   - 所有回复为确定性输出（正则优先级匹配），不依赖随机数或网络
 *   - 所有线程日期 ≤ XIAOCHEN_CURRENT_DATE（2026-07-15）
 *
 * 时间基准：来自 ./timeConfig 的 XIAOCHEN_CURRENT_DATE，不在本文件中重新硬编码。 */
import type { DialogItem } from "@/components/demo/types";
import { XIAOCHEN_CURRENT_DATE } from "./timeConfig";

/** 构造 YYYY-MM-DD HH:mm 格式的本地可读时间串（用于 time 条目的 label）。 */
function formatTimeLabel(month: number, day: number, hour: number, minute: number): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${month}月${day}日 ${pad(hour)}:${pad(minute)}`;
}

/** 构造带 +08:00 时区的确定性时间戳（避免本地时区偏移）。
 *  不使用 new Date(本地参数) 或 Date.now()。 */
const ts = (month: number, day: number, hour: number, minute: number): number => {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return new Date(
    `2026-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00+08:00`,
  ).getTime();
};

/* ——————————————————————————————————————————————————————————————
 * 线程1：7月1日深夜 - 脑子停不下来
 * —————————————————————————————————————————————————————————————— */
export const CONVERSATION_THREAD_0701: DialogItem[] = [
  { kind: "time", id: "xc-0701-time", label: "7月1日 23:45", createdAt: ts(7, 1, 23, 45) },
  { kind: "message", id: "xc-0701-u1", role: "user", text: "睡不着，脑子里全是明天的课", createdAt: ts(7, 1, 23, 46) },
  { kind: "message", id: "xc-0701-z1", role: "zaizai", text: "嗯，我在。脑子转个不停的时候挺难受的。", createdAt: ts(7, 1, 23, 47) },
  { kind: "message", id: "xc-0701-u2", role: "user", text: "作业也没写完，老觉得跟不上", createdAt: ts(7, 1, 23, 48) },
  { kind: "message", id: "xc-0701-z2", role: "zaizai", text: "先不想着跟上的事。现在已经很晚了，能先躺舒服吗？", createdAt: ts(7, 1, 23, 49) },
];

/* ——————————————————————————————————————————————————————————————
 * 线程2：7月4日凌晨 - 主动请求呼吸练习
 * —————————————————————————————————————————————————————————————— */
export const CONVERSATION_THREAD_0704: DialogItem[] = [
  { kind: "time", id: "xc-0704-time", label: "7月4日 01:20", createdAt: ts(7, 4, 1, 20) },
  { kind: "message", id: "xc-0704-u1", role: "user", text: "又睡不着……能不能带我做个呼吸的", createdAt: ts(7, 4, 1, 21) },
  { kind: "message", id: "xc-0704-z1", role: "zaizai", text: "好。跟我来。吸————呼————呼的时候长一点，像给气球慢慢放气。", createdAt: ts(7, 4, 1, 22) },
  { kind: "message", id: "xc-0704-u2", role: "user", text: "……好一点点。还是睡不着，但没那么慌了", createdAt: ts(7, 4, 1, 24) },
  { kind: "message", id: "xc-0704-z2", role: "zaizai", text: "睡不着也没关系。你已经做了一件很不容易的事。", createdAt: ts(7, 4, 1, 25) },
];

/* ——————————————————————————————————————————————————————————————
 * 线程3：7月6日深夜 - 和父母争吵后
 * —————————————————————————————————————————————————————————————— */
export const CONVERSATION_THREAD_0706: DialogItem[] = [
  { kind: "time", id: "xc-0706-time", label: "7月6日 01:48", createdAt: ts(7, 6, 1, 48) },
  { kind: "message", id: "xc-0706-u1", role: "user", text: "又和妈妈吵了。她说我就是找借口。", createdAt: ts(7, 6, 1, 49) },
  { kind: "message", id: "xc-0706-z1", role: "zaizai", text: "被这么说的时候，心里特别堵吧。", createdAt: ts(7, 6, 1, 50) },
  { kind: "message", id: "xc-0706-u2", role: "user", text: "我不想跟她吵的。但那种感觉又上来了，好像怎么努力都没用。", createdAt: ts(7, 6, 1, 51) },
  { kind: "message", id: "xc-0706-z2", role: "zaizai", text: "我在这里。你现在是在安全的地方吗？", createdAt: ts(7, 6, 1, 52) },
  { kind: "message", id: "xc-0706-u3", role: "user", text: "嗯……在自己的房间。", createdAt: ts(7, 6, 1, 53) },
  { kind: "message", id: "xc-0706-z3", role: "zaizai", text: "好。先不用想明天的事。如果你愿意，可以把刚才发生的一件小事告诉我，我来帮你记着。", createdAt: ts(7, 6, 1, 54) },
];

/* ——————————————————————————————————————————————————————————————
 * 线程4：7月9日早上 - 起不来不想去学校
 * 事实基准（dailyRecords.ts 2026-07-09）：mood=1（很糟）、漏服、仅晚餐、无活动、入睡 02:50。
 * —————————————————————————————————————————————————————————————— */
export const CONVERSATION_THREAD_0709: DialogItem[] = [
  { kind: "time", id: "xc-0709-time", label: "7月9日 06:50", createdAt: ts(7, 9, 6, 50) },
  { kind: "message", id: "xc-0709-u1", role: "user", text: "根本起不来。一想到要去学校就难受。", createdAt: ts(7, 9, 6, 51) },
  { kind: "message", id: "xc-0709-z1", role: "zaizai", text: "嗯，我在。不用把今天都想完，只试一个很小的动作：坐起来，把水杯放到手边。", createdAt: ts(7, 9, 6, 52) },
  { kind: "message", id: "xc-0709-u2", role: "user", text: "……好，坐起来了。", createdAt: ts(7, 9, 6, 53) },
  { kind: "message", id: "xc-0709-z2", role: "zaizai", text: "这就够了。今天的第一个动作已经完成了。", createdAt: ts(7, 9, 6, 54) },
];

/* ——————————————————————————————————————————————————————————————
 * 线程5：7月10日上午 - 上课特别困
 * —————————————————————————————————————————————————————————————— */
export const CONVERSATION_THREAD_0710: DialogItem[] = [
  { kind: "time", id: "xc-0710-time", label: "7月10日 10:15", createdAt: ts(7, 10, 10, 15) },
  { kind: "message", id: "xc-0710-u1", role: "user", text: "第二节课了，困得不行，完全听不进去", createdAt: ts(7, 10, 10, 16) },
  { kind: "message", id: "xc-0710-z1", role: "zaizai", text: "上午这个时段确实最难撑。能去洗个脸或者站一下吗？", createdAt: ts(7, 10, 10, 17) },
  { kind: "message", id: "xc-0710-u2", role: "user", text: "试了，还是困", createdAt: ts(7, 10, 10, 18) },
  { kind: "message", id: "xc-0710-z2", role: "zaizai", text: "困的时候硬撑效率也不高。先不责怪自己，下课趴几分钟也行。", createdAt: ts(7, 10, 10, 19) },
];

/* ——————————————————————————————————————————————————————————————
 * 线程6：7月15日晚 - 复诊前不知道怎么向医生表达
 * 事实基准（dailyRecords.ts 2026-07-15）：mood=4（还可以），moodNote="复诊前把这几周看了一遍，还是有点紧张。"
 * 当前日期 = XIAOCHEN_CURRENT_DATE = 2026-07-15，复诊日 7-18，复诊前 3 天。
 * 原 7-17 线程已迁移为 7-15，以匹配统一时间线（不再有 7-16 之后的已发生对话）。
 * —————————————————————————————————————————————————————————————— */
export const CONVERSATION_THREAD_0715: DialogItem[] = [
  { kind: "time", id: "xc-0715-time", label: formatTimeLabel(7, 15, 21, 30), createdAt: ts(7, 15, 21, 30) },
  { kind: "message", id: "xc-0715-u1", role: "user", text: "过几天要复诊了，不知道该跟王医生说什么", createdAt: ts(7, 15, 21, 31) },
  { kind: "message", id: "xc-0715-z1", role: "zaizai", text: "嗯。要不先说一件你最想让她知道的事？", createdAt: ts(7, 15, 21, 32) },
  { kind: "message", id: "xc-0715-u2", role: "user", text: "就是……我不知道我算不算在变好。有的地方好像松了一点，有的地方还是老样子。", createdAt: ts(7, 15, 21, 33) },
  { kind: "message", id: "xc-0715-z2", role: "zaizai", text: "这句话本身就很重要。你愿意的话，我可以帮你把这段时间的事情整理一下，方便你带过去。", createdAt: ts(7, 15, 21, 34) },
  { kind: "message", id: "xc-0715-u3", role: "user", text: "好。", createdAt: ts(7, 15, 21, 35) },
  { kind: "message", id: "xc-0715-z3", role: "zaizai", text: "我已经准备好了。你可以去「帮我整理」里看看，有不想要的可以删掉。", createdAt: ts(7, 15, 21, 36) },
];

/**
 * 体验模式进入对话页时的初始对话历史。
 * 使用最近的线程（7月15日复诊前）作为上下文，与 XIAOCHEN_CURRENT_DATE 一致。 */
export function createExperienceDialogItems(): DialogItem[] {
  return [...CONVERSATION_THREAD_0715];
}

/**
 * 上下文感知的确定性 Mock 回复生成器，替代 AppMainSurface 中的 buildDemoReply。
 * 按优先级正则匹配，命中即返回；全部未命中时返回兜底文案。 */
export function buildExperienceReply(text: string): string {
  if (/起不来|不想动|没力气|没劲|躺着|不想去学校|不想出门/.test(text)) {
    return "我在。先不用把今天都想完，只试一个很小的动作：坐起来，把水杯放到手边。";
  }

  if (/困|犯困|撑不住|听不进去|趴/.test(text)) {
    return "上午这个时段确实最难撑。先不责怪自己，能趴一会儿就趴一会儿。";
  }

  if (/吵|吵架|妈妈说|爸爸说|找借口|争执/.test(text)) {
    return "被这么说的时候心里特别堵吧。我在这里，不用急着原谅谁。";
  }

  if (/睡不着|停不下来|脑子|反刍|想太多/.test(text)) {
    return "脑子转个不停的时候挺难受的。先不想着解决，能先躺舒服吗？";
  }

  if (/呼吸|练习|稳定|接地|做点什么/.test(text)) {
    return "好。跟我来。吸————呼————呼的时候长一点，像给气球慢慢放气。";
  }

  if (/复诊|王医生|医生|怎么说明天/.test(text)) {
    return "要不先说一件你最想让她知道的事？我也可以帮你整理一下这段时间的事。";
  }

  if (/没用|撑不下去|没意思|不想活|不想存在|不想醒来|消失/.test(text)) {
    // 安全承接：确认当前是否处于即时危险 → 建议联系现实支持者（已配置紧急联系人）
    // → 展示 12356 心理援助热线 → 必要时建议紧急医疗或报警
    return "我在。你说出来的这一刻我听到了。你现在是在安全的地方吗？如果你愿意，可以联系妈妈或爸爸——他们在你的紧急联系人里。也可以拨打 12356 心理援助热线。如果你觉得自己有紧急危险，请直接拨打 120 或 110。";
  }

  return "我先记下来了。今天不用一次解决全部问题，只选一个最小动作就行。";
}

/** 体验模式对话数据汇总结构。 */
export interface ExperienceConversationData {
  threads: DialogItem[][];
  initialDialog: DialogItem[];
  replyBuilder: (text: string) => string;
}

/**
 * 小晨体验模式对话数据汇总导出。
 *
 * 仅包含日期 ≤ XIAOCHEN_CURRENT_DATE（2026-07-15）的线程。
 * 原 CONVERSATION_THREAD_0717 / 0718 已移除：
 *   - 0717（7-17 复诊前）迁移为 0715（7-15 复诊前），与统一时间线对齐；
 *   - 0718（7-18 复诊后）属于未来事件，不得展示为已发生对话。 */
export const EXPERIENCE_CONVERSATION: ExperienceConversationData = {
  threads: [
    CONVERSATION_THREAD_0701,
    CONVERSATION_THREAD_0704,
    CONVERSATION_THREAD_0706,
    CONVERSATION_THREAD_0709,
    CONVERSATION_THREAD_0710,
    CONVERSATION_THREAD_0715,
  ],
  initialDialog: createExperienceDialogItems(),
  replyBuilder: buildExperienceReply,
};

/* —— 当前演示日期（re-export 自 timeConfig，便于对话模块内部引用）—— */
export { XIAOCHEN_CURRENT_DATE };
