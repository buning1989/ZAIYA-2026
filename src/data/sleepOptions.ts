/* —— 睡眠记录模块配置数据 ——
 *
 * 与情绪 / 饮食模块一致的分页原则：每页只做一个判断，选项只用于记录事实和身体感受，
 * 不做睡眠质量评价、健康建议或医学判断。
 *
 * 结构：
 *   1. 整体睡眠感受（sleepLevel: 3=好 / 2=一般 / 1=不好）
 *   2. 具体睡眠感受（sleepSubwords，按 sleepLevel 动态展示，多选，含「其他感受」自定义）
 *   3. 大概上床时间（bedTimeRange，口语化范围选项）
 *   4. 大概入睡时间（fallAsleepTimeRange，根据上床时间动态过滤）
 *   5. 大概醒来或起床时间（wakeTimeRange，范围选项）
 *   6. 夜里醒着大概多久（awakeDurationRange，范围选项）
 *
 * 所有时间均使用口语化范围选项，不使用滚轮 / 分钟输入。
 * 「记不清」选项不生成旧字段估算值，不阻止保存。
 * payload 同时保存口语化 label、标准 rangeText 和估算值 estimate。
 *
 * 组件只读取本文件配置并渲染，不在此处写死 UI 逻辑。 */

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

/* —— 时间范围选项 ——
 * label:      口语化展示文案（用户看到）
 * value:      唯一标识
 * rangeText:  标准范围文案（payload 中保存），undefined 表示「记不清」等无标准范围
 * estimate:   旧字段兼容估算值（"HH:MM"），undefined 表示不生成估算值
 * hour:       用于入睡时间动态过滤（24h 制，次日 hours+24），undefined 表示「记不清」等不过滤 */
export type TimeRangeOption = {
  label: string;
  value: string;
  rangeText?: string;
  estimate?: string;
  hour?: number;
};

/* —— 大概上床时间 ——
 * label 使用口语化时间段表达（晚上 / 凌晨），value/rangeText/estimate 保持原值不动 */
export const bedTimeRanges: TimeRangeOption[] = [
  { label: "晚上8点前", value: "before_20", rangeText: "20:00 前", estimate: "20:00", hour: 19 },
  { label: "晚上8点多", value: "20_21", rangeText: "20:00–21:00", estimate: "20:30", hour: 20 },
  { label: "晚上9点多", value: "21_22", rangeText: "21:00–22:00", estimate: "21:30", hour: 21 },
  { label: "晚上10点多", value: "22_23", rangeText: "22:00–23:00", estimate: "22:30", hour: 22 },
  { label: "晚上11点多", value: "23_00", rangeText: "23:00–00:00", estimate: "23:30", hour: 23 },
  { label: "凌晨0点多", value: "00_01", rangeText: "00:00–01:00", estimate: "00:30", hour: 24 },
  { label: "凌晨1点多", value: "01_02", rangeText: "01:00–02:00", estimate: "01:30", hour: 25 },
  { label: "凌晨2点以后", value: "after_02", rangeText: "02:00 以后", estimate: "02:00", hour: 26 },
  { label: "记不清", value: "unknown" },
];

/* —— 大概入睡时间（完整通用选项，组件会根据上床时间动态过滤） ——
 * 比 bedTimeRanges 多了「凌晨2点多」「凌晨3点以后」，少了「凌晨2点以后」。
 * label 与上床时间口语化保持一致。 */
export const fallAsleepTimeRanges: TimeRangeOption[] = [
  { label: "晚上8点前", value: "before_20", rangeText: "20:00 前", estimate: "20:00", hour: 19 },
  { label: "晚上8点多", value: "20_21", rangeText: "20:00–21:00", estimate: "20:30", hour: 20 },
  { label: "晚上9点多", value: "21_22", rangeText: "21:00–22:00", estimate: "21:30", hour: 21 },
  { label: "晚上10点多", value: "22_23", rangeText: "22:00–23:00", estimate: "22:30", hour: 22 },
  { label: "晚上11点多", value: "23_00", rangeText: "23:00–00:00", estimate: "23:30", hour: 23 },
  { label: "凌晨0点多", value: "00_01", rangeText: "00:00–01:00", estimate: "00:30", hour: 24 },
  { label: "凌晨1点多", value: "01_02", rangeText: "01:00–02:00", estimate: "01:30", hour: 25 },
  { label: "凌晨2点多", value: "02_03", rangeText: "02:00–03:00", estimate: "02:30", hour: 26 },
  { label: "凌晨3点以后", value: "after_03", rangeText: "03:00 以后", estimate: "03:00", hour: 27 },
  { label: "几乎没睡着", value: "barely" },
  { label: "记不清", value: "unknown" },
];

/* —— 根据上床时间过滤入睡时间选项 ——
 * 规则：只展示「上床时间及之后」的选项 + 「几乎没睡着」+「记不清」。
 * 上床时间 = 「记不清」时，展示全部通用选项。 */
export function getFilteredFallAsleepOptions(
  bedTimeValue: string | null,
): TimeRangeOption[] {
  const bedOption = bedTimeRanges.find((o) => o.value === bedTimeValue);
  const bedHour = bedOption?.hour;
  if (bedHour === undefined) {
    return fallAsleepTimeRanges;
  }
  return fallAsleepTimeRanges.filter((opt) => {
    if (opt.hour === undefined) return true;
    return opt.hour >= bedHour;
  });
}

/* —— 大概醒来或起床时间 ——
 * label 使用口语化时间段表达（早上 / 上午） */
export const wakeTimeRanges: TimeRangeOption[] = [
  { label: "早上6点前", value: "before_06", rangeText: "06:00 前", estimate: "06:00", hour: 6 },
  { label: "早上6点多", value: "06_07", rangeText: "06:00–07:00", estimate: "06:30", hour: 6 },
  { label: "早上7点多", value: "07_08", rangeText: "07:00–08:00", estimate: "07:30", hour: 7 },
  { label: "早上8点多", value: "08_09", rangeText: "08:00–09:00", estimate: "08:30", hour: 8 },
  { label: "早上9点多", value: "09_10", rangeText: "09:00–10:00", estimate: "09:30", hour: 9 },
  { label: "上午10点多", value: "10_11", rangeText: "10:00–11:00", estimate: "10:30", hour: 10 },
  { label: "上午11点以后", value: "after_11", rangeText: "11:00 以后", estimate: "11:00", hour: 11 },
  { label: "记不清", value: "unknown" },
];

/* —— 夜里醒着大概多久 ——
 * estimate: 旧字段兼容估算值（分钟数），undefined 表示不生成估算值。
 * allNight: 「整晚没睡」→ awakeAllNight = true，不生成分钟估算值。 */
export type AwakeDurationOption = {
  label: string;
  value: string;
  rangeText?: string;
  estimate?: number;
  allNight?: boolean;
};

export const awakeDurationOptions: AwakeDurationOption[] = [
  { label: "基本没醒", value: "none", rangeText: "基本没醒", estimate: 0 },
  { label: "醒过一下", value: "brief", rangeText: "醒过一下", estimate: 10 },
  { label: "半小时以内", value: "within_30", rangeText: "0–30 分钟", estimate: 15 },
  { label: "半小时到一小时", value: "30_60", rangeText: "30–60 分钟", estimate: 45 },
  { label: "一两个小时", value: "1_2h", rangeText: "1–2 小时", estimate: 90 },
  { label: "很久", value: "long_time", rangeText: "2 小时以上", estimate: 150 },
  { label: "整晚没睡", value: "all_night", allNight: true },
  { label: "记不清", value: "unknown" },
];
