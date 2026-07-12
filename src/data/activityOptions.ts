/* —— 活动记录模块配置数据 ——
 *
 * 与情绪 / 饮食模块一致的分页原则：每页只做一个判断，选项只用于记录事实和身体感受，
 * 不做完成度评价、不强化打卡 / 连续天数 / 失败惩罚。
 *
 * 活动模块记录的是用户当天真实发生的生活功能活动（出门、学习、整理、运动、社交、兴趣等），
 * 重点服务社会功能恢复，不只是「运动记录」。
 *
 * 结构：
 *   1. 活动大类（8 个，卡片单选）
 *   2. 各大类关联的具体活动细项（胶囊多选，不穷举；「其他」大类只保留自由输入）
 *   3. 持续时间（胶囊单选，含「记不清」）
 *   4. 做完后的感受（胶囊多选，只记录状态，不评价做得好不好）
 *
 * 组件只读取本文件配置并渲染，不在此处写死 UI 逻辑。 */

export type ActivityCategory =
  | "out"
  | "study"
  | "housework"
  | "exercise"
  | "selfcare"
  | "social"
  | "hobby"
  | "other";

export type ActivityCategoryOption = {
  value: ActivityCategory;
  label: string;
};

/* —— 活动大类 ——
 * 一级选择，使用卡片样式，单选后自动进入下一步。 */
export const activityCategories: ActivityCategoryOption[] = [
  { value: "out", label: "出门走走" },
  { value: "study", label: "学习 / 写作业" },
  { value: "housework", label: "家务 / 整理" },
  { value: "exercise", label: "运动" },
  { value: "selfcare", label: "洗漱 / 照顾自己" },
  { value: "social", label: "社交 / 和人接触" },
  { value: "hobby", label: "兴趣 / 放松" },
  { value: "other", label: "其他" },
];

/* —— 大类短标签（确认页摘要用） —— */
export const activityCategoryLabel: Record<ActivityCategory, string> = {
  out: "出门走走",
  study: "学习 / 写作业",
  housework: "家务 / 整理",
  exercise: "运动",
  selfcare: "洗漱 / 照顾自己",
  social: "社交 / 和人接触",
  hobby: "兴趣 / 放松",
  other: "其他",
};

/* —— 各大类关联的具体活动细项 ——
 * 多选，只列常见项，不尝试穷举所有活动。
 * 「其他」大类无预设细项，用户直接使用自由输入。
 * 用户可以只选胶囊，也可以只写文字，二者均可单独保存。 */
export const activityItemsByCategory: Record<ActivityCategory, string[]> = {
  out: ["楼下走了走", "去了便利店", "晒太阳", "散步", "通勤"],
  study: ["上课", "写作业", "看书", "复习", "整理资料"],
  housework: ["收拾桌面", "洗衣服", "倒垃圾", "整理房间", "洗碗"],
  exercise: ["拉伸", "慢走", "跑步", "跳操", "球类"],
  selfcare: ["洗澡", "刷牙洗脸", "换衣服", "简单梳洗"],
  social: ["和家人说话", "和朋友聊天", "见了同学", "线上聊天"],
  hobby: ["听音乐", "看剧", "画画", "写字", "发呆放松"],
  other: [],
};

/* —— 持续时间 ——
 * 单选，胶囊样式，选中后自动进入下一步。包含「记不清」弱选项。 */
export const activityDurationOptions: string[] = [
  "不到 10 分钟",
  "10–30 分钟",
  "30–60 分钟",
  "1 小时以上",
  "记不清",
];

/* —— 做完后的感受 ——
 * 多选，胶囊样式，只记录状态，不评价「做得好不好」。 */
export const activityAfterFeelingOptions: string[] = [
  "轻松了一点",
  "还可以",
  "有点累",
  "很耗尽",
  "有点烦",
  "身体不舒服",
  "没什么感觉",
];
