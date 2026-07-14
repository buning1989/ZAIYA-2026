/* —— 情绪记录模块配置数据 ——
 *
 * 严格按照《mood三级映射关系_开发查阅版》建立层级关系：
 *   1. 一级情绪（5 个）→ 决定 polarity（负向 / 中性 / 正向）
 *      1-2 分 → negative / 3 分 → neutral / 4-5 分 → positive
 *   2. 二级词分组（4 负向 + 1 中性 + 2 正向）→ 由 polarity 决定展示哪些分组
 *      二级只负责记录感受，并决定三级题干。
 *   3. 三级选项池收敛为两套统一池：
 *        - 负向统一池（36 项，按 4 个展示小标题分组）
 *        - 正向统一池（16 项，不分小标题）
 *      三级选项不再跟随每个二级分组独立变化，变的只有三级题干。
 *      中性（neutral）在三级池选择上与正向同池，因为用户不处于负向状态。
 *   4. 特殊情况大类 → 独立于前三层，不受前面选择影响
 *
 * 组件只读取本文件配置并渲染，不在此处写死 UI 逻辑。
 * 不允许自行增删、改写词语。 */

/* —— 一级情绪状态 —— */
export type PrimaryMoodScore = 1 | 2 | 3 | 4 | 5;
export type MoodPolarity = "negative" | "neutral" | "positive";
/** @deprecated 旧别名，等价于 MoodPolarity，保留以兼容旧引用。 */
type PrimaryMoodPolarity = MoodPolarity;

export type PrimaryMood = {
  label: string;
  score: PrimaryMoodScore;
  polarity: MoodPolarity;
};

export const primaryMoods: PrimaryMood[] = [
  { label: "很糟", score: 1, polarity: "negative" },
  { label: "不太好", score: 2, polarity: "negative" },
  { label: "一般", score: 3, polarity: "neutral" },
  { label: "还行", score: 4, polarity: "positive" },
  { label: "很好", score: 5, polarity: "positive" },
];

/**
 * 由一级情绪分数推导极性（用于报告 / 趋势 / 回头看看等不直接读取 PrimaryMolarity 的位置）。
 * 与 primaryMoods 配置中的 polarity 保持一致，二者只维护一套真实数据源
 * （primaryMoods），此函数仅作便捷派生。
 */
export function getMoodPolarity(score: PrimaryMoodScore): MoodPolarity {
  if (score <= 2) return "negative";
  if (score === 3) return "neutral";
  return "positive";
}

/* —— 二级感受分组 ——
 * 每个分组只包含：polarity、二级词、单组选择时的专属题干（prompt）。
 * 二级分组不再保存独立的三级选项；三级选项由负向/正向统一池提供。
 * 同一 polarity 下多个分组的二级词会合并展示在 Step 2，
 * 用户选中的二级词决定三级题干，但三级选项统一来自池。 */
export type SecondaryMoodGroup = {
  id: string;
  polarity: MoodPolarity;
  words: string[];
  prompt: string;
};

export const secondaryMoodGroups: SecondaryMoodGroup[] = [
  {
    id: "anxiety_fear",
    polarity: "negative",
    words: ["焦虑/紧张", "害怕", "恐慌"],
    prompt: "在焦虑/害怕哪些事？",
  },
  {
    id: "anger_resistance",
    polarity: "negative",
    words: ["烦躁", "生气", "抗拒"],
    prompt: "哪些事让你烦/生气/抗拒？",
  },
  {
    id: "sadness_self",
    polarity: "negative",
    words: ["难过", "绝望", "委屈", "羞耻", "自责", "觉得自己没用"],
    prompt: "哪些事让你难过/委屈/自责？",
  },
  {
    id: "exhaustion_numbness",
    polarity: "negative",
    words: [
      "累",
      "提不起劲",
      "困",
      "麻木/发呆",
      "空",
      "想躲起来",
      "说不上来",
    ],
    prompt: "哪些事最消耗你/让你没感觉？",
  },
  {
    id: "neutral_ok",
    polarity: "neutral",
    words: ["平静", "还可以"],
    prompt: "和哪些有关？",
  },
  {
    id: "positive_better",
    polarity: "positive",
    words: ["轻松", "安心", "开心", "满足", "有希望", "有动力"],
    prompt: "和哪些有关？",
  },
  {
    id: "unsure_positive",
    polarity: "positive",
    words: ["说不上来"],
    prompt: "和哪些有关？",
  },
];

/* —— 三级负向统一池 ——
 * 共 36 项，展示时按 4 个小标题分组。
 * 这 4 个小标题只是展示层分组，数据层仍可视为一个负向池。
 * 「说不上来」固定在负向池最末位。 */
export type TertiaryOptionGroup = {
  title: string;
  options: string[];
};

export const negativeTertiaryPool: TertiaryOptionGroup[] = [
  {
    title: "学习/工作",
    options: [
      "上学/上课",
      "上班/工作",
      "考试/作业/论文",
      "项目/绩效/截止日期",
      "任务太多",
      "做不到某件事",
      "规则/流程",
    ],
  },
  {
    title: "人和关系",
    options: [
      "和身边的人起了冲突",
      "担心身边人的反应",
      "被责备",
      "被比较",
      "被误解/没人理解",
      "被评价",
      "见人/跟人打交道",
      "被催",
      "被控制/被安排",
      "关系变淡/难维持",
      "没被支持",
      "怕让人失望",
      "回消息/被要求回应",
    ],
  },
  {
    title: "身体和日常",
    options: [
      "起床",
      "洗漱/吃饭",
      "出门",
      "整理房间",
      "睡眠混乱",
      "身体不舒服/没力气",
      "吃药/复诊",
      "手机停不下",
      "环境太吵",
    ],
  },
  {
    title: "心里的感觉",
    options: [
      "觉得自己不够好",
      "想到过去",
      "一个人待着",
      "未来会变糟",
      "钱/生活压力",
      "不知道怕什么",
      "说不上来",
    ],
  },
];

/* —— 三级正向统一池 ——
 * 共 16 项，不分小标题，平铺展示。
 * 「说不上来」固定在正向池最末位。 */
export const positiveTertiaryPool: string[] = [
  "今天没什么特别的事",
  "睡得还行/作息稳定",
  "吃了饭",
  "完成了一点事",
  "学习/工作推进了",
  "出门/走动了",
  "有人陪",
  "被理解",
  "和家人还行/没吵架",
  "和别人接触不多",
  "一个人待着很舒服",
  "洗澡/收拾了",
  "按时吃药/复诊",
  "身体感觉一般",
  "有一点掌控感",
  "说不上来",
];

/* —— 特殊情况大类 ——
 * 独立于一级/二级/三级，不受前面选择影响。
 * 大类与细项拆成两页：Step 4 选大类，Step 5 选细项。
 * 自伤/危险想法不展示普通细项，点击后走独立安全流程，
 * 不作为普通记录选项保存。 */
export type SpecialSituationCategory = {
  id: string;
  entry: string;
  options: string[];
  isSafetyFlow?: boolean;
};

export const specialSituationCategories: SpecialSituationCategory[] = [
  {
    id: "eating",
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
    id: "peculiar",
    entry: "最近有一些很特别、很困扰的感觉",
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
    id: "unsafe",
    entry: "最近特别不放心、觉得不安全",
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
    id: "mood-shift",
    entry: "最近状态和平时很不一样",
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
    id: "self-harm",
    entry: "自伤/危险想法",
    options: [],
    isSafetyFlow: true,
  },
];

/* —— 查询方法 —— */

/** 根据一级情绪 polarity 返回对应二级分组。 */
export function getSecondaryGroupsForPolarity(
  polarity: MoodPolarity,
): SecondaryMoodGroup[] {
  return secondaryMoodGroups.filter((group) => group.polarity === polarity);
}

/** 根据二级词查找所属分组。
 *  注意：「说不上来」同时存在于负向/正向词库末位，作为跨极性兜底词；
 *  此函数对它返回 null，polarity 判断由上层函数按其他已选词推断。 */
export function findGroupByWord(word: string): SecondaryMoodGroup | null {
  if (word === "说不上来") return null;
  return (
    secondaryMoodGroups.find((group) => group.words.includes(word)) ?? null
  );
}

/** 将某 polarity 下所有分组的二级词按分组顺序合并（用于 Step 2 展示）。 */
function getSecondaryWordsForPolarity(
  polarity: MoodPolarity,
): string[] {
  return getSecondaryGroupsForPolarity(polarity).flatMap((g) => g.words);
}

/**
 * 根据已选二级词计算三级题干。
 * - 无分组命中：返回通用兜底
 * - 负向+（中性或正向）混选：返回「这些感觉和哪些有关？」
 * - 仅中性或正向：返回「和哪些有关？」
 * - 仅负向且命中单一分组：返回该分组专属题干
 * - 仅负向且跨组：返回「这些感觉和哪些有关？」
 *
 * 中性（neutral）在题干上与正向同口径，因为用户不处于负向状态。
 */
export function getTertiaryPromptBySelectedSecondaryWords(
  selectedWords: string[],
): string {
  const groups = selectedWords
    .map(findGroupByWord)
    .filter((group): group is SecondaryMoodGroup => Boolean(group));

  const uniqueGroups = Array.from(
    new Map(groups.map((g) => [g.id, g])).values(),
  );

  if (uniqueGroups.length === 0) return "可能和哪些有关？";

  const hasNegative = uniqueGroups.some((g) => g.polarity === "negative");
  // 中性在三级题干上与正向同口径
  const hasNonNegative = uniqueGroups.some((g) => g.polarity !== "negative");

  if (hasNegative && hasNonNegative) return "这些感觉和哪些有关？";

  if (hasNonNegative) return "和哪些有关？";

  if (hasNegative && uniqueGroups.length === 1) {
    return uniqueGroups[0].prompt;
  }

  return "这些感觉和哪些有关？";
}

/** 将负向池 flatten 为一维选项数组（保留分组顺序，末位为「说不上来」）。 */
export function flattenNegativeTertiaryPool(): string[] {
  return negativeTertiaryPool.flatMap((group) => group.options);
}

/** 根据已选二级词返回的三级选项池结果。 */
export type TertiaryPoolResult =
  | {
      mode: "negative";
      grouped: true;
      groups: TertiaryOptionGroup[];
      options: string[];
    }
  | {
      mode: "positive";
      grouped: false;
      groups: [];
      options: string[];
    }
  | {
      mode: "mixed";
      grouped: true;
      groups: TertiaryOptionGroup[];
      options: string[];
    };

/**
 * 根据已选二级词返回三级选项池：
 * - 仅负向：返回负向统一池（grouped）
 * - 仅中性或正向：返回正向统一池（平铺）
 * - 负向+（中性或正向）混选：负向池在前 + 正向池在后，去重「说不上来」只保留一个
 *
 * 中性（neutral）在三级池选择上与正向同池，因为用户不处于负向状态。
 * 正常流程中一级情绪会限制二级词库，通常不会出现混选；
 * mixed 作为确认页修改或异常状态下的兜底。
 */
export function getTertiaryPoolBySelectedSecondaryWords(
  selectedWords: string[],
): TertiaryPoolResult {
  const groups = selectedWords
    .map(findGroupByWord)
    .filter((group): group is SecondaryMoodGroup => Boolean(group));

  const hasNegative = groups.some((g) => g.polarity === "negative");
  // 中性在三级池选择上与正向同口径
  const hasNonNegative = groups.some((g) => g.polarity !== "negative");

  const negativeOptions = flattenNegativeTertiaryPool();

  if (hasNegative && hasNonNegative) {
    const merged = [...negativeOptions, ...positiveTertiaryPool].filter(
      (item, index, arr) =>
        item !== "说不上来" || index === arr.lastIndexOf("说不上来"),
    );

    return {
      mode: "mixed",
      grouped: true,
      groups: [
        ...negativeTertiaryPool,
        {
          title: "变好一些的原因",
          options: positiveTertiaryPool.filter((item) => item !== "说不上来"),
        },
      ],
      options: merged,
    };
  }

  if (hasNonNegative) {
    return {
      mode: "positive",
      grouped: false,
      groups: [],
      options: positiveTertiaryPool,
    };
  }

  return {
    mode: "negative",
    grouped: true,
    groups: negativeTertiaryPool,
    options: negativeOptions,
  };
}

/* —— 情绪记录步骤选择模式基线 ——
 * 固化每一步的单选 / 多选规则，防止后续审计或开发按旧规则误改。
 *
 * 正式规则（不允许回退为旧规则）：
 *   - 一级情绪（level）：单选，选中后自动进入下一步
 *   - 具体感受（feelings）：多选，底部按钮确认
 *   - 可能相关原因（reasons）：多选，底部按钮确认
 *   - 特殊情况大类（specialCategory）：单选，选中后自动进入下一步
 *   - 特殊情况细项（specialDetails）：多选，底部按钮确认
 *
 * 交互规则：
 *   - 单选（selectionMode: 'single'）：选中即自动前进（autoAdvance: true）
 *   - 多选（selectionMode: 'multiple'）：需底部按钮确认（autoAdvance: false），
 *     第一次点击不会自动前进
 */
export type SelectionMode = "single" | "multiple";

export interface MoodStepRule {
  selectionMode: SelectionMode;
  autoAdvance: boolean;
}

export const MOOD_STEP_CONFIG = {
  level: {
    selectionMode: "single",
    autoAdvance: true,
  },
  feelings: {
    selectionMode: "multiple",
    autoAdvance: false,
  },
  reasons: {
    selectionMode: "multiple",
    autoAdvance: false,
  },
  specialCategory: {
    selectionMode: "single",
    autoAdvance: true,
  },
  specialDetails: {
    selectionMode: "multiple",
    autoAdvance: false,
  },
} as const satisfies Record<string, MoodStepRule>;

/** 查询某一步骤是否为单选模式 */
export function isSingleSelectStep(
  step: keyof typeof MOOD_STEP_CONFIG,
): boolean {
  return MOOD_STEP_CONFIG[step].selectionMode === "single";
}

/** 查询某一步骤选中后是否自动前进 */
export function shouldAutoAdvance(
  step: keyof typeof MOOD_STEP_CONFIG,
): boolean {
  return MOOD_STEP_CONFIG[step].autoAdvance;
}
