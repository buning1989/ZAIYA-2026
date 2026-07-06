/**
 * 「共同在场式陪做」mock 用户角色数据。
 *
 * 仅用于示意，不接真实用户、不接后端、不接 LLM。
 * 四个场景（一起睡 / 一起吃饭 / 一起学习 / 一起上课）暂时都复用同一组 6 个角色。
 *
 * 昵称从 nicknamePool 中随机抽取：模块加载时一次性打乱并分配，
 * 之后 render 期间保持稳定，不会每次重渲染抖动变化（满足「固定分配均可」）。
 * 不出现疾病 / 诊断标签、真实姓名、手机号、社交账号。
 */

/** 场内昵称池：自然、简短、无标签。进入房间时从中随机抽取 */
export const nicknamePool = [
  "小林",
  "阿北",
  "木木",
  "小雨",
  "橙子",
  "安安",
  "小满",
  "十一",
  "南瓜",
  "小鱼",
  "山竹",
  "米粒",
  "小周",
  "阿言",
  "可可",
  "团子",
  "栗子",
  "小禾",
];

/** Fisher–Yates 一次性打乱（模块加载时执行一次，render 期间结果稳定） */
function shuffleOnce<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 模块加载时一次性分配 5 个不重复昵称给其他用户（自己固定为「我」）
const assignedNicknames = shuffleOnce(nicknamePool).slice(0, 5);

export type PresenceCharacter = {
  id: string;
  nickname: string;
  status: string;
  src: string;
  /** 是否为当前用户自己（用于高亮） */
  isSelf?: boolean;
};

export const presenceCharacters: PresenceCharacter[] = [
  {
    id: "me",
    nickname: "我",
    status: "准备中",
    src: "/presence-characters/assistant_character.riv",
    isSelf: true,
  },
  {
    id: "u1",
    nickname: assignedNicknames[0],
    status: "在场",
    src: "/presence-characters/cool_monkey_vibes.riv",
  },
  {
    id: "u2",
    nickname: assignedNicknames[1],
    status: "已开始",
    src: "/presence-characters/orbix.riv",
  },
  {
    id: "u3",
    nickname: assignedNicknames[2],
    status: "在场",
    src: "/presence-characters/round_to_dino.riv",
  },
  {
    id: "u4",
    nickname: assignedNicknames[3],
    status: "准备中",
    src: "/presence-characters/lion_cursor_tracking.riv",
  },
  {
    id: "u5",
    nickname: assignedNicknames[4],
    status: "在场",
    src: "/presence-characters/interactions_test.riv",
  },
];
