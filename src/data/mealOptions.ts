/* —— 饮食记录模块配置数据 ——
 *
 * 与情绪模块一致的分页原则：每页只做一个判断，选项只用于记录事实和身体感受，
 * 不做营养评价、热量估算、健康建议或医学判断，不使用“吃得好/不好”这类评价性表达。
 *
 * 结构：
 *   1. 餐次（4 个，加餐与早午晚同级，不出现推荐 / 热门等标签）
 *   2. 加餐发生时间（仅加餐需要，单选）
 *   3. 各餐次常见食物胶囊选项（多选，不穷举）+「其他 / 自己写」触发自由输入
 *   4. 吃完感受胶囊选项（多选）+「其他感受」触发自由输入
 *
 * 组件只读取本文件配置并渲染，不在此处写死 UI 逻辑。 */

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type MealTypeOption = {
  value: MealType;
  label: string;
};

/* —— 餐次 ——
 * 加餐与早餐、午餐、晚餐同级，不作为附属入口，也不出现推荐标签。 */
export const mealTypes: MealTypeOption[] = [
  { value: "breakfast", label: "早餐" },
  { value: "lunch", label: "午餐" },
  { value: "dinner", label: "晚餐" },
  { value: "snack", label: "加餐" },
];

/* —— 加餐发生时间 ——
 * 加餐不是固定餐点，需单独记录大致发生时间。
 * 仅作标签保存（snack_time_label），不使用复杂时间选择器。
 * 早 / 午 / 晚餐不需要此字段。 */
export const snackTimeOptions: string[] = [
  "上午 10 点左右",
  "下午 3 点左右",
  "晚饭后",
  "睡前",
  "半夜醒来",
];

/* —— 各餐次常见食物胶囊选项 ——
 * 多选，只列常见项，不尝试穷举所有食物。
 * 用户可以只选胶囊，也可以点击「其他 / 自己写」后输入文字，二者均可单独保存。 */
export const foodOptionsByMealType: Record<MealType, string[]> = {
  breakfast: ["牛奶", "豆浆", "鸡蛋", "面包", "包子/馒头", "粥", "面条", "水果", "咖啡"],
  lunch: ["米饭配菜", "面食", "食堂套餐", "外卖", "轻食", "汤饭", "快餐", "多蔬菜", "肉蛋鱼"],
  dinner: ["家常菜", "清淡少油", "粥", "面食", "外卖", "聚餐", "面包简餐", "水果为主", "吃得很少"],
  snack: ["水果", "酸奶", "坚果", "饼干点心", "奶茶饮料", "夜宵"],
};

/* —— 吃完感受胶囊选项 ——
 * 多选，只记录事实和身体感受，不对用户进行纠正。
 * 「其他感受」由组件作为触发自由输入的特殊入口追加，不在此列表中。 */
export const bodyFeelingOptions: string[] = [
  "舒服",
  "满足",
  "没胃口",
  "吃不下去",
  "吃得很少",
  "吃撑了",
  "胃胀",
  "胃疼",
  "反胃",
  "想吐",
  "没什么感觉",
];

/* —— 餐次短标签（确认页摘要用） —— */
export const mealTypeLabel: Record<MealType, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐",
};
