/* —— 睡眠记录模块配置数据 ——
 *
 * 与情绪 / 饮食模块一致的分页原则：每页只做一个判断，选项只用于记录事实和身体感受，
 * 不做睡眠质量评价、健康建议或医学判断。
 *
 * 结构：
 *   1. 整体睡眠感受（sleepLevel: 3=好 / 2=一般 / 1=不好）
 *   2. 具体睡眠感受（sleepSubwords，按 sleepLevel 动态展示，多选，含「其他感受」自定义）
 *   3. 大概上床时间（bedTimeRange，5 段分段时间轴，单选）
 *   4. 入睡用时（fallAsleepDurationRange，5 段分段时间轴，单选，问题改为「躺下后多久睡着？」）
 *   5. 大概醒来或起床时间（wakeTimeRange，5 段分段时间轴，单选）
 *   6. 夜里醒着大概多久（awakeDurationRange，5 段分段时间轴，单选）
 *
 * 时间轴步骤 3-6 均使用 SegmentedTimeScale 组件渲染，下方提供「记不清，先跳过」弱化按钮。
 * 跳过后字段保存为 null，不生成估算值，结算页不展示该行。
 * payload 同时保存口语化 label、标准 rangeText 和估算值 estimate。 */

export type SleepLevel = 1 | 2 | 3;

export type SleepLevelOption = {
  value: SleepLevel;
  label: string;
};

/* —— 整体睡眠感受 ——
 * 单选，选中后自动进入下一步。 */
export const sleepLevels: SleepLevelOption[] = [
  { value: 3, label: "好" },
  { value: 2, label: "一般" },
  { value: 1, label: "不好" },
];

export const sleepLevelLabel: Record<SleepLevel, string> = {
  3: "好",
  2: "一般",
  1: "不好",
};

/* —— 具体睡眠感受词（按 sleepLevel 动态展示） ——
 * 多选，保存为 sleepSubwords 数组，同时兼容生成 sleepSubword 字符串。
 * 选项末尾会追加「其他感受」自定义入口（由组件渲染，不在此数组中）。 */
export const sleepSubwordsByLevel: Record<SleepLevel, string[]> = {
  1: [
    "没睡够",
    "断断续续",
    "老醒过来",
    "入睡很难",
    "醒来更累",
    "做噩梦",
    "睡不踏实",
    "几乎没睡",
  ],
  2: [
    "还行",
    "说不上来",
    "不太稳",
    "有点浅",
    "醒来一般",
    "中途醒过",
    "够睡但不舒服",
  ],
  3: [
    "睡得沉",
    "醒来轻松",
    "比较放松",
    "很踏实",
    "有精神一点",
    "恢复了一点",
  ],
};

/* —— 时间范围选项类型（上床 / 醒来时间） ——
 * label:      口语化展示文案（用户看到）
 * value:      唯一标识
 * rangeText:  标准范围文案（payload 中保存）
 * estimate:   旧字段兼容估算值（"HH:MM"） */
export type TimeRangeOption = {
  label: string;
  value: string;
  rangeText?: string;
  estimate?: string;
};

/* —— 时长范围选项类型（入睡用时 / 夜间清醒时长） ——
 * estimate: 旧字段兼容估算值（分钟数） */
export type AwakeDurationOption = {
  label: string;
  value: string;
  rangeText?: string;
  estimate?: number;
};

/* —— 大概上床时间（横滑时间轴，1 小时粒度） ——
 * label 为口语化短文案，rangeText/estimate 保留标准范围与估算值。
 * 「记不清」不再作为选项，改为页面下方的「记不清，先跳过」弱化按钮，跳过后字段为 null。 */
export const bedTimeRanges: TimeRangeOption[] = [
  { label: "9点前", value: "before_21", rangeText: "21:00 前", estimate: "20:30" },
  { label: "9点", value: "21_22", rangeText: "21:00–22:00", estimate: "21:30" },
  { label: "10点", value: "22_23", rangeText: "22:00–23:00", estimate: "22:30" },
  { label: "11点", value: "23_00", rangeText: "23:00–00:00", estimate: "23:30" },
  { label: "0点", value: "00_01", rangeText: "00:00–01:00", estimate: "00:30" },
  { label: "1点", value: "01_02", rangeText: "01:00–02:00", estimate: "01:30" },
  { label: "2点", value: "02_03", rangeText: "02:00–03:00", estimate: "02:30" },
  { label: "3点后", value: "after_03", rangeText: "03:00 后", estimate: "03:00" },
];

/* —— 入睡用时（分段时间轴，5 段） ——
 * 原问题「大概几点睡着？」改为「躺下后多久睡着？」，语义从时间点改为时长。
 * estimate 为分钟数（数字），保存到 fallAsleepTime 字段时转为字符串。
 * 「几乎没睡着」label 命中 isUnknownLabel，结算页不展示该行。 */
export const fallAsleepDurationOptions: AwakeDurationOption[] = [
  { label: "15分内", value: "within_15m", rangeText: "0–15 分钟", estimate: 10 },
  { label: "15–30分", value: "15_30m", rangeText: "15–30 分钟", estimate: 22 },
  { label: "30–60分", value: "30_60m", rangeText: "30–60 分钟", estimate: 45 },
  { label: "1小时+", value: "over_60m", rangeText: "60 分钟以上", estimate: 70 },
  { label: "几乎没睡着", value: "barely_slept" },
];

/* —— 大概醒来或起床时间（横滑时间轴，1 小时粒度） ——
 * 方向：清晨 → 中午。label 为口语化短文案。 */
export const wakeTimeRanges: TimeRangeOption[] = [
  { label: "6点前", value: "before_06", rangeText: "06:00 前", estimate: "05:30" },
  { label: "6点", value: "06_07", rangeText: "06:00–07:00", estimate: "06:30" },
  { label: "7点", value: "07_08", rangeText: "07:00–08:00", estimate: "07:30" },
  { label: "8点", value: "08_09", rangeText: "08:00–09:00", estimate: "08:30" },
  { label: "9点", value: "09_10", rangeText: "09:00–10:00", estimate: "09:30" },
  { label: "10点", value: "10_11", rangeText: "10:00–11:00", estimate: "10:30" },
  { label: "11点", value: "11_12", rangeText: "11:00–12:00", estimate: "11:30" },
  { label: "中午后", value: "after_12", rangeText: "12:00 后", estimate: "12:00" },
];

/* —— 夜里醒着大概多久（分段时间轴，5 段，等宽） ——
 * 方向：很少 → 很久。estimate 为分钟数（数字）。 */
export const awakeDurationOptions: AwakeDurationOption[] = [
  { label: "没怎么醒", value: "almost_none", rangeText: "基本没醒", estimate: 0 },
  { label: "15分内", value: "within_15m", rangeText: "0–15 分钟", estimate: 10 },
  { label: "15–30分", value: "15_30m", rangeText: "15–30 分钟", estimate: 22 },
  { label: "30–60分", value: "30_60m", rangeText: "30–60 分钟", estimate: 45 },
  { label: "1小时+", value: "over_60m", rangeText: "60 分钟以上", estimate: 70 },
];
