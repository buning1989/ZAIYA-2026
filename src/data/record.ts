import type { LucideIcon } from "lucide-react";
import { CloudSun, Pill, Utensils, Moon, Footprints } from "lucide-react";

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
  | "activity";

export type StepInputType = "segmented" | "time" | "text";

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

/* —— 通用身体感受选项（复用） —— */
const bodyFeelingOptions: StepOption[] = [
  { label: "胃堵", value: "stomach" },
  { label: "恶心", value: "nausea" },
  { label: "肚子疼", value: "belly" },
  { label: "心慌", value: "heart" },
  { label: "没力气", value: "tired" },
];

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
    steps: [
      {
        id: "intensity",
        question: "现在情绪强度大概是多少？",
        field: "intensity",
        inputType: "segmented",
        options: [
          { label: "很低", value: "very_low", abnormal: true },
          { label: "偏低", value: "low", abnormal: true },
          { label: "一般", value: "normal" },
          { label: "偏高", value: "high" },
          { label: "很高", value: "very_high" },
        ],
        nextStepId: "emotionWords",
      },
      {
        id: "emotionWords",
        question: "更接近哪种情绪？",
        field: "emotionWords",
        inputType: "segmented",
        options: [
          { label: "难过", value: "sad" },
          { label: "烦躁", value: "upset" },
          { label: "紧张", value: "nervous" },
          { label: "空", value: "empty" },
          { label: "稳", value: "steady" },
        ],
        nextStepId: "triggers",
        extra: true,
      },
      {
        id: "triggers",
        question: "可能和什么有关？",
        field: "triggers",
        inputType: "segmented",
        options: [
          { label: "人际", value: "people" },
          { label: "身体", value: "body" },
          { label: "睡眠", value: "sleep" },
          { label: "工作/学习", value: "work" },
          { label: "无明确原因", value: "none" },
        ],
        nextStepId: "bodyReaction",
        extra: true,
      },
      {
        id: "bodyReaction",
        question: "身体有什么反应吗？",
        field: "bodyReaction",
        inputType: "segmented",
        options: [
          ...bodyFeelingOptions,
          { label: "还好", value: "ok" },
        ],
        nextStepId: "note",
        extra: true,
      },
      {
        id: "note",
        question: "还想补一句的话，可以写在这里。",
        field: "note",
        inputType: "text",
        isLast: true,
        extra: true,
      },
    ],
  },
  {
    id: "medication",
    name: "服用",
    Icon: Pill,
    reminderAllowed: true,
    hasCompletenessExtras: true,
    mockRecentSummary: {
      date: "7月4日",
      text: "早 8:00 服药，无不适。",
    },
    steps: [
      {
        id: "status",
        question: "今天药吃了吗？",
        field: "status",
        inputType: "segmented",
        options: [
          { label: "已服", value: "taken" },
          { label: "未服", value: "not_taken" },
          { label: "漏服", value: "missed", abnormal: true },
          { label: "改动", value: "changed", abnormal: true },
        ],
        branches: {
          taken: "timing",
          missed: "missedReason",
          changed: "changedReason",
          not_taken: "note",
        },
      },
      {
        id: "timing",
        question: "服用时间正常吗？",
        field: "timing",
        inputType: "segmented",
        options: [
          { label: "正常", value: "normal" },
          { label: "延迟", value: "late" },
          { label: "提前", value: "early" },
        ],
        nextStepId: "feeling",
        extra: true,
      },
      {
        id: "missedReason",
        question: "更像是哪种情况？",
        field: "missedReason",
        inputType: "segmented",
        options: [
          { label: "忘了", value: "forgot" },
          { label: "出门没带", value: "no_med" },
          { label: "不舒服没吃", value: "unwell" },
          { label: "时间冲突", value: "conflict" },
        ],
        nextStepId: "note",
        extra: true,
      },
      {
        id: "changedReason",
        question: "改动原因？",
        field: "changedReason",
        inputType: "segmented",
        options: [
          { label: "方案调整", value: "adjust" },
          { label: "时间冲突", value: "conflict" },
          { label: "副作用", value: "side_effect" },
        ],
        nextStepId: "note",
        extra: true,
      },
      {
        id: "feeling",
        question: "服用后感受？",
        field: "feeling",
        inputType: "segmented",
        options: [
          { label: "无不适", value: "ok" },
          { label: "胃不适", value: "stomach" },
          { label: "犯困", value: "drowsy" },
          { label: "心慌", value: "heart" },
        ],
        nextStepId: "note",
        extra: true,
      },
      {
        id: "note",
        question: "还想补一句的话，可以写在这里。",
        field: "note",
        inputType: "text",
        isLast: true,
        extra: true,
      },
    ],
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
    steps: [
      {
        id: "meal",
        question: "记的是哪一餐？",
        field: "meal",
        inputType: "segmented",
        options: [
          { label: "早饭", value: "breakfast" },
          { label: "午饭", value: "lunch" },
          { label: "晚饭", value: "dinner" },
          { label: "加餐", value: "snack" },
        ],
        nextStepId: "amount",
      },
      {
        id: "amount",
        question: "吃了多少？",
        field: "amount",
        inputType: "segmented",
        options: [
          { label: "正常", value: "normal" },
          { label: "吃了一点", value: "little", abnormal: true },
          { label: "没吃", value: "none", abnormal: true },
          { label: "不舒服", value: "unwell", abnormal: true },
        ],
        branches: {
          little: "reason",
          none: "reason",
          unwell: "bodyFeeling",
          normal: "afterFeeling",
        },
      },
      {
        id: "reason",
        question: "更像是哪种情况？",
        field: "reason",
        inputType: "segmented",
        options: [
          { label: "没胃口", value: "no_appetite" },
          { label: "忘了", value: "forgot" },
          { label: "吃不下", value: "cant_eat" },
          { label: "身体不舒服", value: "unwell", abnormal: true },
        ],
        branches: { unwell: "bodyFeeling" },
        // 非 unwell → afterFeeling
        nextStepId: "afterFeeling",
        extra: true,
      },
      {
        id: "bodyFeeling",
        question: "哪里最明显？",
        field: "bodyFeeling",
        inputType: "segmented",
        options: bodyFeelingOptions,
        nextStepId: "afterFeeling",
        extra: true,
      },
      {
        id: "afterFeeling",
        question: "饭后身体感受？",
        field: "afterFeeling",
        inputType: "segmented",
        photoAllowed: true,
        options: [
          ...bodyFeelingOptions,
          { label: "还好", value: "ok" },
        ],
        nextStepId: "note",
        extra: true,
      },
      {
        id: "note",
        question: "还想补一句的话，可以写在这里。",
        field: "note",
        inputType: "text",
        isLast: true,
        photoAllowed: true,
        extra: true,
      },
    ],
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
    steps: [
      {
        id: "quality",
        question: "睡眠怎么样？",
        field: "quality",
        inputType: "segmented",
        options: [
          { label: "不好", value: "bad", abnormal: true },
          { label: "一般", value: "ok" },
          { label: "还行", value: "fine" },
          { label: "很好", value: "good" },
        ],
        branches: { bad: "issues" },
        nextStepId: "sleepTime",
      },
      {
        id: "issues",
        question: "更像是哪种情况？",
        field: "issues",
        inputType: "segmented",
        options: [
          { label: "夜醒", value: "wake" },
          { label: "难入睡", value: "hard_sleep" },
          { label: "早醒", value: "early_wake" },
          { label: "多梦", value: "dream" },
          { label: "噩梦", value: "nightmare" },
          { label: "睡不沉", value: "light" },
        ],
        nextStepId: "sleepTime",
        extra: true,
      },
      {
        id: "sleepTime",
        question: "大概几点睡着的？",
        field: "sleepTime",
        inputType: "segmented",
        options: [
          { label: "23 点前", value: "before_23" },
          { label: "23–24 点", value: "23_24" },
          { label: "0–1 点", value: "0_1" },
          { label: "1 点后", value: "after_1", abnormal: true },
        ],
        nextStepId: "wakeTime",
      },
      {
        id: "wakeTime",
        question: "早上几点醒的？",
        field: "wakeTime",
        inputType: "segmented",
        options: [
          { label: "6 点前", value: "before_6" },
          { label: "6–7 点", value: "6_7" },
          { label: "7–8 点", value: "7_8" },
          { label: "8 点后", value: "after_8" },
        ],
        nextStepId: "wakeState",
      },
      {
        id: "wakeState",
        question: "醒后状态？",
        field: "wakeState",
        inputType: "segmented",
        options: [
          { label: "累", value: "tired" },
          { label: "昏沉", value: "groggy" },
          { label: "还好", value: "ok" },
          { label: "清醒", value: "fresh" },
        ],
        nextStepId: "note",
        extra: true,
      },
      {
        id: "note",
        question: "还想补一句的话，可以写在这里。",
        field: "note",
        inputType: "text",
        isLast: true,
        extra: true,
      },
    ],
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
    steps: [
      {
        id: "type",
        question: "是什么活动？",
        field: "type",
        inputType: "segmented",
        options: [
          { label: "出门", value: "out" },
          { label: "运动", value: "exercise" },
          { label: "上学/学习", value: "study" },
          { label: "家务", value: "housework" },
          { label: "其他", value: "other" },
        ],
        nextStepId: "completion",
      },
      {
        id: "completion",
        question: "完成程度？",
        field: "completion",
        inputType: "segmented",
        options: [
          { label: "没开始", value: "none", abnormal: true },
          { label: "做了一点", value: "some" },
          { label: "基本完成", value: "mostly" },
          { label: "完成", value: "done" },
        ],
        nextStepId: "bodyChange",
      },
      {
        id: "bodyChange",
        question: "身体变化？",
        field: "bodyChange",
        inputType: "segmented",
        options: [
          { label: "累", value: "tired" },
          { label: "轻松", value: "light" },
          { label: "疼", value: "pain" },
          { label: "出汗", value: "sweat" },
          { label: "无变化", value: "none" },
        ],
        nextStepId: "moodChange",
        extra: true,
      },
      {
        id: "moodChange",
        question: "情绪变化？",
        field: "moodChange",
        inputType: "segmented",
        options: [
          { label: "更稳", value: "steady" },
          { label: "更闷", value: "stuffy" },
          { label: "更轻", value: "light" },
          { label: "无变化", value: "none" },
        ],
        nextStepId: "note",
        extra: true,
      },
      {
        id: "note",
        question: "还想补一句的话，可以写在这里。",
        field: "note",
        inputType: "text",
        isLast: true,
        extra: true,
      },
    ],
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
 * 睡眠：睡眠质量 + 入睡/醒来时间 + (quality=不好 时 issues 必填)
 * 服用：已服→时间+感受；漏服→原因；改动→原因；未服→不算完整
 * 活动：活动类型 + 完成程度 + (身体 或 情绪感受) */
export function isCompleteCoreRecord(
  typeId: RecordTypeId,
  answers: Answers,
): boolean {
  const filled = (field: string): boolean => {
    const a = answers[field];
    if (!a) return false;
    return !!a.label?.trim() || !!a.value.trim();
  };
  const labelOf = (field: string): string | undefined => answers[field]?.label;

  switch (typeId) {
    case "mood":
      return (
        filled("intensity") &&
        filled("emotionWords") &&
        (filled("triggers") || filled("bodyReaction"))
      );
    case "food": {
      const abnormalAmount = ["吃了一点", "没吃", "不舒服"].includes(
        labelOf("amount") ?? "",
      );
      return (
        filled("meal") &&
        filled("amount") &&
        filled("afterFeeling") &&
        (!abnormalAmount || filled("reason") || filled("bodyFeeling"))
      );
    }
    case "sleep": {
      const badQuality = labelOf("quality") === "不好";
      return (
        filled("quality") &&
        filled("sleepTime") &&
        filled("wakeTime") &&
        (!badQuality || filled("issues"))
      );
    }
    case "medication": {
      const status = labelOf("status");
      if (status === "已服") return filled("timing") && filled("feeling");
      if (status === "漏服") return filled("missedReason");
      if (status === "改动") return filled("changedReason");
      return false; // 未服 不算完整
    }
    case "activity":
      return (
        filled("type") &&
        filled("completion") &&
        (filled("bodyChange") || filled("moodChange"))
      );
    default:
      return false;
  }
}

/* —— 摘要卡短标签（确认页摘要卡用，typeId → field → 短标签） ——
 * 仅用于记录确认页的摘要展示，不影响数据结构。 */
export const summaryLabels: Record<RecordTypeId, Record<string, string>> = {
  mood: {
    intensity: "情绪强度",
    emotionWords: "情绪",
    triggers: "原因",
    bodyReaction: "身体感受",
  },
  medication: {
    status: "服药",
    timing: "时间",
    missedReason: "原因",
    changedReason: "原因",
    feeling: "感受",
  },
  food: {
    meal: "餐次",
    amount: "食量",
    reason: "原因",
    bodyFeeling: "身体感受",
    afterFeeling: "饭后感受",
  },
  sleep: {
    quality: "睡眠",
    issues: "情况",
    sleepTime: "入睡",
    wakeTime: "醒来",
    wakeState: "醒后",
  },
  activity: {
    type: "活动",
    completion: "完成度",
    bodyChange: "身体",
    moodChange: "情绪",
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
};
