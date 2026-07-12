import type { LucideIcon } from "lucide-react";
import { CloudSun, Pill, Utensils, Moon, Footprints, Weight } from "lucide-react";

/* —— "记一下" 记录类型配置（单页单项 Wizard）——
 * 仅本地 mock，不接后端 / LLM / 真实数据写入。
 *
 * 定位：单页单项记录流。一次只面对一个问题，信息压力最小。
 *   - 5 个主类型：情绪 / 服用 / 饮食 / 睡眠 / 活动（体重已从主类型移除）
 *   - 所有项统一使用「纵向选项卡」形态，最后一项固定为「自由输入」
 *   - 自由输入支持文本 + 语音 icon（mock），饮食相关项额外显示图片 icon
 *   - 异常选项通过 branches 进入温和追问（仍是单页单项，不做风险强化）
 *   - 最后一项为「还想补一句的话，可以写在这里。」自由输入，可不填完成
 *   - 完整记录触发能量奖励（前端 mock）
 *
 * 流转规则（wizard）：
 *   1. 当前 step 有 branches 且选中值命中 → 跳到 branches[value]
 *   2. 否则用 nextStepId
 *   3. 无 nextStepId → 完成
 *   没有数组顺序兜底，避免落到被跳过的 step。
 *
 * 不再使用：滑杆、横向胶囊按钮、AI「帮我整理一下」入口。 */

export type RecordTypeId =
  | "mood"
  | "medication"
  | "food"
  | "sleep"
  | "activity"
  | "weight";

export type StepInputType = "segmented" | "time" | "text" | "number";

export type StepOption = { label: string; value: string; abnormal?: boolean };

export type Step = {
  id: string;
  question: string;
  field: string;
  inputType: StepInputType;
  /** segmented: 选项（「自由输入」由 wizard 自动追加，无需在此列出） */
  options?: StepOption[];
  /** 异常分支：optionValue → nextStepId */
  branches?: Record<string, string>;
  /** 下一项 id（无分支时） */
  nextStepId?: string;
  /** 是否最后一项（补一句，自由输入结构，可不填完成） */
  isLast?: boolean;
  /** 是否允许图片辅助 icon（饮食类） */
  photoAllowed?: boolean;
  /** 该字段是否算"完整记录"的额外字段 */
  extra?: boolean;
  /** segmented 选项是否多选（点击 toggle，需「下一步」确认，不自动推进） */
  multi?: boolean;
  /** 选项左侧是否用「月相」圆点表达（与 LookbackPage MoodBead 同步） */
  moonPhase?: boolean;
  /** 是否允许自由输入「没有合适的？自己写一句」。
   *  单选 segmented 默认 true；需结构化的字段（情绪状态/服药状态/食量/睡眠时间等）设 false。
   *  multi segmented 默认 false；如需补充说明设 true 并指定 customField。
   *  number / text(isLast) 不受此字段影响。 */
  allowCustom?: boolean;
  /** 自由输入保存到独立字段（仅 multi + allowCustom 时生效，如情绪原因的 customReason）。
   *  不指定则自由输入覆盖当前 field。 */
  customField?: string;
  /** 动态选项：依据已答字段返回选项，覆盖静态 options */
  dynamicOptions?: (answers: Answers) => StepOption[];
};

export type RecordType = {
  id: RecordTypeId;
  name: string;
  Icon: LucideIcon;
  reminderAllowed: boolean;
  steps: Step[];
  /** 完整记录要求：extra 字段至少填 1 个 */
  hasCompletenessExtras: boolean;
  /** 最近一次记录摘要（mock，RecordHome 底部展示） */
  mockRecentSummary: { date: string; text: string };
};

export const recordTypes: RecordType[] = [
  {
    id: "mood",
    name: "情绪",
    Icon: CloudSun,
    reminderAllowed: false,
    hasCompletenessExtras: true,
    mockRecentSummary: {
      date: "7月4日",
      text: "情绪偏低，下午有一阵特别闷，与人际有关。",
    },
    // 情绪类型使用独立的 MoodRecordWizard 组件渲染（动态层级选择），
    // 不走通用 wizard step 系统，steps 留空。
    steps: [],
  },
  {
    id: "medication",
    name: "服用",
    Icon: Pill,
    reminderAllowed: true,
    hasCompletenessExtras: true,
    mockRecentSummary: {
      date: "7月4日",
      text: "早上那顿药已记，半小时后有轻微嗜睡。",
    },
    // 服用类型使用独立的 MedicationRecordWizard 组件渲染（3 步分页：
    // 1 服药时段 / 2 起效时间 / 3 身体感受），不走通用 wizard step 系统，
    // steps 留空。
    steps: [],
  },
  {
    id: "food",
    name: "饮食",
    Icon: Utensils,
    reminderAllowed: true,
    hasCompletenessExtras: true,
    mockRecentSummary: {
      date: "7月5日",
      text: "午饭吃了一点，饭后胃堵。",
    },
    // 饮食类型使用独立的 MealRecordWizard 组件渲染（4 步分页流程，
    // 与情绪模块一致：一页只做一个判断，不使用折叠/多餐位展开式表单），
    // 不走通用 wizard step 系统，steps 留空。
    steps: [],
  },
  {
    id: "sleep",
    name: "睡眠",
    Icon: Moon,
    reminderAllowed: true,
    hasCompletenessExtras: true,
    mockRecentSummary: {
      date: "7月5日",
      text: "入睡较晚，夜里醒过一次。",
    },
    // 睡眠类型使用独立的 SleepRecordWizard 组件渲染（7 步分页流程，
    // 与情绪 / 饮食 / 服用模块一致：一页只做一个判断，所有时间均使用范围选项，
    // 不使用滚轮 / 分钟输入，时间步骤允许跳过）：
    //   1 整体睡眠感受（单选自动进入） / 2 具体睡眠感受（按 level 动态多选） /
    //   3 大概上床时间 / 4 大概入睡时间 / 5 大概醒来或起床时间 /
    //   6 夜里醒着大概多久（3-6 均为范围单选，含「记不清」选项） /
    //   7 完整信息确认页
    // 不走通用 wizard step 系统，steps 留空。
    steps: [],
  },
  {
    id: "activity",
    name: "活动",
    Icon: Footprints,
    reminderAllowed: false,
    hasCompletenessExtras: true,
    mockRecentSummary: {
      date: "7月4日",
      text: "下午出门散步 20 分钟，身体轻松。",
    },
    // 活动类型使用独立的 ActivityRecordWizard 组件渲染（5 步分页流程，
    // 与情绪 / 饮食模块一致：一页只做一个判断，不使用完整表单）：
    //   1 活动大类（卡片单选） / 2 具体活动（胶囊多选 + 自由输入） /
    //   3 持续时间（胶囊单选） / 4 做完后感受（胶囊多选） / 5 完整信息确认页
    // 不走通用 wizard step 系统，steps 留空。
    steps: [],
  },
  {
    id: "weight",
    name: "体重",
    Icon: Weight,
    reminderAllowed: false,
    hasCompletenessExtras: false,
    mockRecentSummary: {
      date: "7月5日",
      text: "今天体重 51.5 kg。",
    },
    // 体重类型使用独立的 WeightRecordWizard 组件渲染（4 步分页流程，
    // 与情绪 / 饮食模块一致：一页只做一个判断，不做即时胖瘦评价）：
    //   1 体重数值（数字键盘 + 步进微调） / 2 测量场景（胶囊单选） /
    //   3 补充说明（没有补充 / 写一点）/ 4 完整信息确认页
    // 不走通用 wizard step 系统，steps 留空。
    steps: [],
  },
];

/* —— 自定义输入标记（选项列表末尾自动追加） —— */
export const CUSTOM_INPUT_VALUE = "__custom__";

/* —— 下一项解析 ——
 * 1. branches 命中 → 跳对应 step
 * 2. nextStepId → 跳对应 step
 * 3. 都无 → 完成（null） */
export function getNextStep(
  current: Step,
  selectedValue: string,
  allSteps: Step[],
): Step | null {
  const targetId =
    current.branches?.[selectedValue] ?? current.nextStepId;
  if (!targetId) return null;
  return allSteps.find((s) => s.id === targetId) ?? null;
}

/* —— 解析 step 选项：优先动态选项，回退静态 options —— */
export function resolveStepOptions(step: Step, answers: Answers): StepOption[] {
  return step.dynamicOptions?.(answers) ?? step.options ?? [];
}

/* —— 答案条目结构 ——
 * option: 选择预设选项（value + label）
 * custom: 自由输入文本（value 为用户输入） */
export type AnswerEntry = {
  type: "option" | "custom";
  value: string;
  label?: string;
};

export type Answers = Record<string, AnswerEntry | undefined>;

/* —— 完整记录判断（核心记录类型） ——
 * 基础记录：只完成结果型字段（如"午饭吃了"），可保存但不触发能量/快捷入口提示。
 * 完整记录：按类型严格匹配完整标准，包含异常状态的原因字段必填。
 *
 * 情绪：情绪强度 + 具体情绪词 + (触发原因 或 身体反应)
 * 饮食：餐次 + 吃了多少 + 饭后身体感受 + (异常时原因必填)
 * 睡眠：整体睡眠感受（sleepLevel），时间步骤允许跳过，不影响完整记录判断
 * 服用：服药时段 + 起效时间 + (身体感受 或 自定义感受)
 * 活动：活动大类 + (具体活动 或 自定义活动文字) + 持续时间
 * 体重：体重数值 + 测量场景 */
export function isCompleteCoreRecord(
  typeId: RecordTypeId,
  answers: Answers,
): boolean {
  const filled = (field: string): boolean => {
    const a = answers[field];
    if (!a) return false;
    return !!a.label?.trim() || !!a.value.trim();
  };

  switch (typeId) {
    case "mood":
      // 情绪类型使用独立 MoodRecordWizard，完整记录 = 已选一级情绪
      return filled("primaryMood");
    case "food": {
      // 饮食类型使用独立 MealRecordWizard（4 步分页：餐次 / 吃了什么 / 吃完感受 / 确认）
      // 完整记录 = 餐次 + (食物标签 或 食物文字)
      // 感受为可选（提供「先不记感受」入口），不计入完整记录判断
      return (
        filled("mealType") && (filled("foodTags") || filled("foodText"))
      );
    }
    case "sleep": {
      // 睡眠类型使用独立 SleepRecordWizard（7 步分页），
      // 完整记录 = 已选整体睡眠感受（sleepLevel）；
      // 时间步骤（bedTime / fallAsleepTime / wakeTime / awakeDuration）允许跳过，
      // 跳过或选「记不清」不影响完整记录判断。
      return filled("sleepLevel");
    }
    case "medication":
      // 完整记录 = 服药时段 + 起效时间 + (身体感受 或 自定义感受)
      // 部分保存（仅选了时段）不算完整，不发能量
      return (
        filled("doseSlot") &&
        filled("effectTime") &&
        (filled("discomfortTags") || filled("customDiscomfortText"))
      );
    case "activity":
      // 活动类型使用独立 ActivityRecordWizard（5 步分页：大类 / 具体活动 / 时长 / 感受 / 确认）
      // 完整记录 = 活动大类 + (具体活动标签 或 自定义活动文字) + 持续时间
      return (
        filled("activityCategory") &&
        (filled("activityItems") || filled("customActivityText")) &&
        filled("duration")
      );
    case "weight":
      // 体重类型使用独立 WeightRecordWizard（4 步分页：数值 / 场景 / 感受 / 确认）
      // 完整记录 = 体重数值 + 测量场景（感受为可选，不计入完整记录判断）
      return filled("weightKg") && filled("measureContext");
    default:
      return false;
  }
}

/* —— 摘要卡短标签（确认页摘要卡用，typeId → field → 短标签） ——
 * 仅用于记录确认页的摘要展示，不影响数据结构。 */
export const summaryLabels: Record<RecordTypeId, Record<string, string>> = {
  mood: {
    primaryMood: "情绪",
    feeling: "感受",
    reasons: "原因",
    specialCategory: "特殊情况",
    specialDetails: "具体表现",
  },
  medication: {
    doseSlot: "时段",
    effectTime: "起效",
    discomfortTags: "感受",
    customDiscomfortText: "感受",
    note: "补充",
  },
  food: {
    mealType: "餐次",
    snackTimeLabel: "加餐时间",
    foodTags: "吃了什么",
    customFoodText: "吃了什么",
    bodyTags: "吃完感受",
    customBodyFeelingText: "吃完感受",
    note: "补充",
  },
  sleep: {
    sleepLevel: "睡眠",
    sleepSubwords: "感受",
    customFeelingText: "感受",
    bedTimeLabel: "上床",
    fallAsleepTimeLabel: "入睡",
    wakeTimeLabel: "起床",
    awakeDurationLabel: "夜醒",
    note: "补充",
  },
  activity: {
    activityCategory: "活动",
    activityItems: "具体活动",
    customActivityText: "具体活动",
    duration: "时长",
    afterFeeling: "感受",
  },
  weight: {
    weightKg: "体重",
    measureContext: "场景",
    note: "补充",
  },
};

/* —— 记录历史条目（本地 mock，不接后端） —— */
export type RecordEntry = {
  id: string;
  type: RecordTypeId;
  completedAt: number; // Date.now()
  isComplete: boolean;
  entrySource: "more" | "homeShortcut";
  /** basic: 先保存的低能量记录；complete: 走完 wizard 的记录 */
  status: "basic" | "complete";
  /** 保存方式：saveFirst = 先保存；wizard = 走完流程 */
  savedBy?: "saveFirst" | "wizard";
  /** 体重记录专用：保存时的体重值（KG），用于下次进入体重页时作为默认值 */
  weight?: number;
};

/* —— 体重历史读取：返回最近一条带 weight 值的体重记录 ——
 * 用于「记一下 - 体重」页默认值与调节器初始化。
 * 若无任何体重历史 → 返回 null（页面将渲染普通手动输入框）。 */
export function getLastWeightRecord(
  history: RecordEntry[],
): RecordEntry | null {
  for (let i = history.length - 1; i >= 0; i--) {
    const r = history[i];
    if (r.type === "weight" && typeof r.weight === "number" && r.weight > 0) {
      return r;
    }
  }
  return null;
}
