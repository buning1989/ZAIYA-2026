/* —— 情绪记录模块配置数据 ——
 * 数据源：《情绪记录模块_对应关系表.html》
 *
 * 层级关系（一页一个判断）：
 *   一级情绪（5 档卡片，绑定分值与极性）
 *     → 二级情绪词（按极性分组：负向 / 正向，chip 样式）
 *       → 三级追问（动态题干 + 多选选项，由二级所属分组决定）
 *   特殊情况（独立补充项，大类 → 展开具体表现，多选可跳过）
 *   自伤/危险想法（独立安全流程，不作为普通 mood 标签）
 *
 * 组件只读取本文件配置并渲染，不在此处写死 UI 逻辑。 */

/* —— 一级情绪 —— */
export type PrimaryMoodScore = 1 | 2 | 3 | 4 | 5;
export type PrimaryMoodPolarity = "negative" | "positive";

export type PrimaryMood = {
  label: string;
  score: PrimaryMoodScore;
  polarity: PrimaryMoodPolarity;
};

export const primaryMoods: PrimaryMood[] = [
  { label: "很糟", score: 1, polarity: "negative" },
  { label: "不太好", score: 2, polarity: "negative" },
  { label: "一般", score: 3, polarity: "positive" },
  { label: "还行", score: 4, polarity: "positive" },
  { label: "很好", score: 5, polarity: "positive" },
];

/* —— 二级情绪分组（含三级追问） ——
 * 每个分组包含：id、极性、二级词列表、三级题干、三级选项 */
export type SecondaryMoodGroup = {
  id: string;
  polarity: PrimaryMoodPolarity;
  words: string[];
  tertiaryPrompt: string;
  tertiaryOptions: string[];
};

export const secondaryMoodGroups: SecondaryMoodGroup[] = [
  {
    id: "anxiety",
    polarity: "negative",
    words: ["焦虑", "紧张", "害怕", "恐慌"],
    tertiaryPrompt: "在焦虑/害怕什么？",
    tertiaryOptions: [
      "上学/返校",
      "上班/实习",
      "考试/作业/论文",
      "项目/绩效/截止日期",
      "见人/社交",
      "被评价",
      "家人反应",
      "伴侣关系",
      "身体不舒服",
      "吃药/复诊",
      "未来会变糟",
      "钱/生活压力",
      "不知道怕什么",
    ],
  },
  {
    id: "anger",
    polarity: "negative",
    words: ["烦躁", "生气", "不服", "抗拒"],
    tertiaryPrompt: "什么让你烦/生气/抗拒？",
    tertiaryOptions: [
      "被催",
      "被控制",
      "被安排",
      "被打断",
      "被误解",
      "沟通不顺",
      "环境太吵",
      "任务太多",
      "规则/流程",
      "对方态度",
      "自己做不到",
      "不想配合",
      "说不上来",
    ],
  },
  {
    id: "sadness",
    polarity: "negative",
    words: ["难过", "失落", "绝望", "委屈", "羞耻", "自责", "没用", "失败"],
    tertiaryPrompt: "什么让你难过/委屈/自责？",
    tertiaryOptions: [
      "被误解",
      "被责备",
      "被比较",
      "没被支持",
      "关系变淡",
      "和家人冲突",
      "和朋友冲突",
      "和伴侣冲突",
      "做不到某件事",
      "觉得自己不够好",
      "想到过去",
      "一个人待着",
      "没人理解",
      "说不上来",
    ],
  },
  {
    id: "exhaustion",
    polarity: "negative",
    words: [
      "疲惫",
      "无力",
      "提不起劲",
      "困",
      "麻木",
      "空",
      "发呆",
      "想躲起来",
      "不想说话",
      "不想见人",
    ],
    tertiaryPrompt: "什么最消耗你/让你没感觉？",
    tertiaryOptions: [
      "起床",
      "洗漱",
      "吃饭",
      "出门",
      "上课/学习",
      "上班/工作",
      "做任务",
      "回消息",
      "跟人打交道",
      "维持关系",
      "怕让人失望",
      "被要求回应",
      "整理房间",
      "睡眠混乱",
      "身体没力",
      "手机停不下",
      "说不上来",
    ],
  },
  {
    id: "calm",
    polarity: "positive",
    words: ["平静", "普通", "还可以", "平稳", "说不上来"],
    tertiaryPrompt: "和什么有关？",
    tertiaryOptions: [
      "今天没什么特别的事",
      "作息还算稳定",
      "学习/工作正常推进",
      "和家人还行",
      "和别人接触不多",
      "身体感觉一般",
      "一个人待着",
      "手机/刷视频",
      "说不上来",
    ],
  },
  {
    id: "positive",
    polarity: "positive",
    words: ["轻松", "安心", "踏实", "开心", "满足", "有希望", "有动力", "自在"],
    tertiaryPrompt: "什么让你变好一些？",
    tertiaryOptions: [
      "睡得还行",
      "吃了饭",
      "完成了一点事",
      "出门/走动了",
      "有人陪",
      "被理解",
      "没吵架",
      "学习/工作推进了",
      "洗澡/收拾了",
      "独处很舒服",
      "按时吃药/复诊",
      "有一点掌控感",
      "说不上来",
    ],
  },
];

/* —— 特殊情况大类 ——
 * 独立于一级/二级/三级，随时可填，允许多选。
 * isSafetyFlow = true 的条目走独立安全流程，不设普通选项。 */
export type SpecialSituationCategory = {
  id: string;
  entry: string;
  options: string[];
  isSafetyFlow?: boolean;
};

export const specialSituationCategories: SpecialSituationCategory[] = [
  {
    id: "eating_weight",
    entry: "吃东西/体重这件事最近有变化",
    options: [
      "吃不下",
      "故意少吃",
      "很怕变胖",
      "觉得自己太胖",
      "吃完很后悔",
      "忍不住吃很多",
      "吃完想吐",
      "有催吐",
      "反复称体重",
      "吃完必须运动",
      "最近体重变很多",
      "家人很担心我吃饭",
    ],
  },
  {
    id: "unusual_perception",
    entry: "最近有没有一些很特别、很困扰的感觉",
    options: [
      "听到别人好像听不到的声音",
      "看到别人好像看不到的东西",
      "感觉有人在议论我",
      "感觉有人在盯着我",
      "感觉有人要伤害我",
      "感觉手机/网络不安全",
      "感觉别人知道我在想什么",
      "感觉自己的想法不像自己的",
      "觉得短视频/电视像在暗示我",
      "分不清是不是真的",
    ],
  },
  {
    id: "safety_paranoia",
    entry: "最近有没有特别不放心、觉得不安全的事",
    options: [
      "不太敢相信别人",
      "觉得别人故意针对我",
      "觉得同学/同事在排挤我",
      "觉得老师/上级针对我",
      "不敢吃别人给的东西",
      "怕被偷听",
      "怕被拍到/录下来",
      "反复检查门窗/隐私",
      "不敢出门",
      "总觉得会出事",
    ],
  },
  {
    id: "mood_shift",
    entry: "最近状态有没有和平时很不一样",
    options: [
      "睡很少也不困",
      "话突然变很多",
      "脑子停不下来",
      "特别兴奋",
      "特别容易发火",
      "花钱/下单停不住",
      "一下子想做很多事",
      "觉得自己特别厉害",
      "控制不住发消息",
      "家人说我和平时不一样",
    ],
  },
  {
    id: "obsessive",
    entry: "反复冒出来的想法/忍不住要做的事",
    options: [
      "脑子里反复冒出不想要的想法",
      "明知道没必要但停不下来想",
      "反复担心自己做错了什么",
      "反复担心东西不干净",
      "反复担心门窗/电器没关好",
      "反复担心会伤害别人",
      "反复确认一件事",
      "反复洗手/清洁",
      "反复数数/默念",
      "必须按某种顺序做事",
      "东西不对称/不整齐会很难受",
      "不做某个动作就很不安",
      "这些想法或动作花了很多时间",
      "这些事影响了上学/工作/生活",
    ],
  },
  {
    id: "trauma",
    entry: "过去的事突然又冒出来",
    options: [
      "过去不好的事突然闯进脑子里",
      "明明不想想但画面会自己出现",
      "像又回到当时一样",
      "做和过去事情有关的噩梦",
      "听到/看到某些东西会突然很难受",
      "身体突然紧绷或发抖",
      "突然心慌/胸闷/喘不上气",
      "会刻意避开某些地方/人/话题",
      "不太记得某些片段",
      "总觉得不安全",
      "容易被声音或动作吓到",
      "很难放松下来",
      "对别人很难信任",
      "这些情况影响了睡眠/出门/上学/工作",
    ],
  },
  {
    id: "self_harm",
    entry: "自伤/危险想法",
    options: [],
    isSafetyFlow: true,
  },
];

/* —— 辅助函数 —— */

/** 根据一级情绪极性获取对应的二级分组 */
export function getSecondaryGroupsForPolarity(
  polarity: PrimaryMoodPolarity,
): SecondaryMoodGroup[] {
  return secondaryMoodGroups.filter((g) => g.polarity === polarity);
}

/** 根据二级情绪词查找所属分组 */
export function findGroupByWord(word: string): SecondaryMoodGroup | null {
  return secondaryMoodGroups.find((g) => g.words.includes(word)) ?? null;
}

/** 根据 primaryMood label 获取 PrimaryMood 对象 */
export function findPrimaryMoodByLabel(label: string): PrimaryMood | null {
  return primaryMoods.find((m) => m.label === label) ?? null;
}

/* —— 结构化情绪记录数据 —— */
export type MoodRecord = {
  id: string;
  createdAt: string;
  primaryMood: {
    label: string;
    score: PrimaryMoodScore;
  };
  secondaryMood: {
    label: string;
    groupId: string;
  } | null;
  tertiaryCause: {
    prompt: string;
    selectedOptions: string[];
  } | null;
  specialSituations: Array<{
    entry: string;
    selectedOptions: string[];
  }>;
  note?: string;
};
