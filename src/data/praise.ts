/* —— 「夸夸自己」数据与本地持久化（不接后端 / LLM / 真实数据写入）——
 *
 * 定位：把今天一点点好的东西留下来，像一个安静的私人卡片库。
 *   - 不做分类、不做筛选、不做连续打卡、不做积分 / 徽章
 *   - 不做公开分享、社区互夸、家长端查看原文
 *   - 不生成 AI 抽象夸奖；用户写什么，卡片就保存什么
 *   - 所有卡片默认私密，isPrivate 固定为 true
 *
 * 数据持久化：localStorage，key = zaiya_praise_cards
 * 仅前端 mock，刷新后仍保留。 */

/* —— 单张夸夸卡片 ——
 * isPrivate 固定为 true：当前版本不开发家长端查看 / 公开分享 / 社区展示。
 * gradientId：卡片使用的渐变 ID，创建时分配，刷新后保持不变。 */
export type PraiseCard = {
  id: string;
  text: string;
  createdAt: string; // ISO 时间戳
  updatedAt?: string;
  isPrivate: true;
  gradientId: string;
};

/* —— 新建卡片页的轻量示例句（不做分类，仅作启动参考）—— */
export const PRAISE_EXAMPLES: string[] = [
  "今天吃了一口饭",
  "今天没有继续和家里人吵下去",
  "今天指甲盖还挺好看",
  "今天看到一朵很好看的云",
  "邻居对我笑了一下",
  "今天撑到了现在",
];

/* —— 输入规则 —— */
export const PRAISE_MAX_LENGTH = 60;

/* —— 卡片渐变定义 ——
 * Tolan Library 风格：柔和渐变背景，低饱和，不刺眼。
 * 每个渐变有唯一 id，创建卡片时随机分配一个，持久化后不再变化。 */
export type CardGradient = {
  id: string;
  from: string; // 起始色
  to: string; // 结束色
};

export const CARD_GRADIENTS: CardGradient[] = [
  { id: "g1", from: "#FDE8E0", to: "#F5D5C8" }, // 暖粉
  { id: "g2", from: "#E8F0E8", to: "#D5E5D5" }, // 淡绿
  { id: "g3", from: "#E8E8F5", to: "#D5D5E8" }, // 淡紫
  { id: "g4", from: "#FFF5E0", to: "#FFE8C8" }, // 暖黄
  { id: "g5", from: "#E0F0F5", to: "#C8E0E8" }, // 淡青
  { id: "g6", from: "#F5E8F0", to: "#E8D5E0" }, // 淡粉紫
  { id: "g7", from: "#F0F0E0", to: "#E0E0C8" }, // 淡米
  { id: "g8", from: "#E0E8F0", to: "#C8D5E0" }, // 淡蓝灰
];

/* —— 随机分配一个渐变 —— */
export function randomGradientId(): string {
  const idx = Math.floor(Math.random() * CARD_GRADIENTS.length);
  return CARD_GRADIENTS[idx].id;
}

/* —— 根据 id 获取渐变定义 —— */
export function getGradient(id: string): CardGradient {
  return CARD_GRADIENTS.find((g) => g.id === id) ?? CARD_GRADIENTS[0];
}

/* —— 日期 / 时间标签 ——
 * 今天 → 「今天 HH:MM」
 * 其他 → 「M月D日」 */
export function buildTimeLabel(d: Date = new Date()): string {
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (isToday) {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `今天 ${hh}:${mm}`;
  }
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

/* —— localStorage 持久化 —— */
const STORAGE_KEY = "zaiya_praise_cards";

export function loadCards(): PraiseCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PraiseCard[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveCards(cards: PraiseCard[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // 忽略写入失败（隐私模式 / 配额满）
  }
}

/* —— 创建一张夸夸卡片 —— */
export function createCard(text: string): PraiseCard {
  const now = new Date();
  return {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    text: text.trim(),
    createdAt: now.toISOString(),
    isPrivate: true,
    gradientId: randomGradientId(),
  };
}
