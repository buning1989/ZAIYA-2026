/* —— 情绪记录模块配置数据 ——
 *
 * 层级关系（一页一个判断）：
 *   一级情绪状态（5 档卡片，单选自动进入）
 *     → 更接近的感受（胶囊单选，按一级动态展示 6–8 个候选项）
 *       → 可能相关原因（胶囊多选，通用原因 + "无明确原因"互斥）
 *   特殊情况大类（卡片单选 → 进入细项页 / "暂不补充"直接确认）
 *     → 特殊情况细项（胶囊多选）
 *   自伤/危险想法（独立安全流程，不作为普通 mood 标签）
 *
 * 组件只读取本文件配置并渲染，不在此处写死 UI 逻辑。 */

/* —— 一级情绪状态 —— */
export type PrimaryMoodScore = 1 | 2 | 3 | 4 | 5;
export type PrimaryMoodPolarity = "negative" | "positive";

export type PrimaryMood = {
  label: string;
  score: PrimaryMoodScore;
  polarity: PrimaryMoodPolarity;
};

export const primaryMoods: PrimaryMood[] = [
  { label: "很低", score: 1, polarity: "negative" },
  { label: "偏低", score: 2, polarity: "negative" },
  { label: "一般", score: 3, polarity: "positive" },
  { label: "偏高", score: 4, polarity: "positive" },
  { label: "很高", score: 5, polarity: "positive" },
];

/* —— 第二步：更接近的感受（按一级分数动态展示 6–8 个候选项） —— */
export const feelingOptionsByScore: Record<PrimaryMoodScore, string[]> = {
  1: ["很累", "空掉了", "委屈", "害怕", "烦躁", "不想动", "说不上来"],
  2: ["低落", "疲惫", "烦", "紧绷", "委屈", "还可以", "说不上来"],
  3: ["普通", "平静", "还可以", "没什么特别", "有点乱", "说不上来"],
  4: ["有精神", "轻松", "期待", "兴奋", "有点躁", "停不下来", "说不上来"],
  5: ["很好", "轻松", "安心", "开心", "有力量", "想做点事", "说不上来"],
};

/* —— 第三步：可能相关的原因（通用多选，"无明确原因"与其他互斥） —— */
export const reasonOptions: string[] = [
  "睡眠",
  "身体",
  "学习/工作",
  "人际",
  "家庭",
  "突发事情",
  "无明确原因",
];

export const MUTUALLY_EXCLUSIVE_REASON = "无明确原因";

/* —— 特殊情况大类 ——
 * 独立于前三步，大类单选 → 进入细项页。
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

/** 根据 primaryMood label 获取 PrimaryMood 对象 */
export function findPrimaryMoodByLabel(label: string): PrimaryMood | null {
  return primaryMoods.find((m) => m.label === label) ?? null;
}

/** 根据 specialCategory id 获取大类对象 */
export function findSpecialCategoryById(
  id: string,
): SpecialSituationCategory | null {
  return specialSituationCategories.find((c) => c.id === id) ?? null;
}

/* —— 结构化情绪记录数据 —— */
export type MoodRecord = {
  id: string;
  createdAt: string;
  primaryMood: {
    label: string;
    score: PrimaryMoodScore;
  };
  feeling: {
    label: string | null;
    customText: string | null;
  } | null;
  reasons: {
    selected: string[];
    customText: string | null;
  } | null;
  specialCategory: {
    entry: string;
    categoryId: string;
  } | null;
  specialDetails: string[];
  isPartial?: boolean;
};
