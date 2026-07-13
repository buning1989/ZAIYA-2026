/* —— 首页时间段判断与场景 / 文案映射 ——
 * 统一首页"当前处于什么生活节律"的判断，供在在动画场景、状态文案、
 * 环境信息等共用，避免多处各自实现规则不一致。
 *
 * 时间段规则（按本地系统时间）：
 *   06:00–10:00  morning   起床场景
 *   10:00–18:00  daytime   白天（暂用默认首页在在形象）
 *   18:00–23:30  evening   夜晚看书翻页场景
 *   23:30–06:00  night     睡觉温和呼吸场景
 */

export type HomeTimePhase = "morning" | "daytime" | "evening" | "night";

/** 按当前时间返回首页所处的时间段 */
export function getHomeTimePhase(date: Date): HomeTimePhase {
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes >= 360 && minutes < 600) return "morning"; // 06:00–10:00
  if (minutes >= 600 && minutes < 1080) return "daytime"; // 10:00–18:00
  if (minutes >= 1080 && minutes < 1410) return "evening"; // 18:00–23:30
  return "night"; // 23:30–06:00
}

/* —— 首页时间锚点的时段词（用于主信息「晚上 22:46」前缀）——
 * 与手机状态栏的裸时间区分开，避免混淆；口径比 getHomeTimePhase 更细。 */
export function getHomeTimeLabel(date: Date): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 9) return "早上";
  if (hour >= 9 && hour < 12) return "上午";
  if (hour >= 12 && hour < 18) return "下午";
  if (hour >= 18 && hour < 23) return "晚上";
  return "夜深了";
}

/* —— 各时间段对应的在在首页动画素材 —— */
export const HOME_PHASE_SCENE: Record<HomeTimePhase, string> = {
  morning: "./assets/zaiya/wake-up.gif",
  daytime: "./assets/zaiya/wake-up.gif",
  evening: "./assets/zaiya/zaizai-reading-night.gif",
  night: "./assets/zaiya/zaizai-sleeping-breathing.gif",
};
