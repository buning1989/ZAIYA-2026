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
 * gradientId：卡片使用的渐变 ID，创建时分配，刷新后保持不变。
 * guideText：新建时随机分配的底纹引导词，持久化后不再变化。 */
export type PraiseCard = {
  id: string;
  text: string;
  createdAt: string; // ISO 时间戳
  updatedAt?: string;
  isPrivate: true;
  gradientId: string;
  guideText?: string;
};

/* —— 新建卡片页的轻量示例句（不做分类，仅作启动参考）—— */
const PRAISE_EXAMPLES: string[] = [
  "今天吃了一口饭",
  "今天没有继续和家里人吵下去",
  "今天指甲盖还挺好看",
  "今天看到一朵很好看的云",
  "邻居对我笑了一下",
  "今天撑到了现在",
];

/* —— 新建卡片页底纹引导词：创建时随机二选一，持久化到卡片 —— */
export const PRAISE_GUIDE_TEXTS = [
  "收集每一缕微光，终将照亮前路",
  "珍视每一次小胜，积攒面对未来的勇气",
] as const;

/* —— 输入规则 —— */
export const PRAISE_MAX_LENGTH = 60;

/* —— 卡片纯色定义 ——
 * 纯色背景，低饱和，不刺眼。
 * 每个颜色有唯一 id，创建卡片时随机分配一个，持久化后不再变化。
 *
 * 设计例外：多彩背景是「夸夸自己」既定产品设计，用于让每张卡片具有独立感、
 * 形成收集积累的视觉感受、减少连续卡片的单调感、与其他模块白底表单区分。
 * 调色板固定为 8 种，通过 CSS 变量（--z-praise-card-1..8）集中管理，
 * 不得在此数组之外新增临时浅色，也不得用于卡片背景以外的任何区域。 */
export type CardGradient = {
  id: string;
  from: string; // 纯色（保留 from 字段以兼容现有类型）
  to: string;   // 纯色（保留 to 字段以兼容现有类型）
};

export const CARD_GRADIENTS: CardGradient[] = [
  { id: "g1", from: "var(--z-praise-card-1)", to: "var(--z-praise-card-1)" }, // 苔灰绿
  { id: "g2", from: "var(--z-praise-card-2)", to: "var(--z-praise-card-2)" }, // 浅蓝
  { id: "g3", from: "var(--z-praise-card-3)", to: "var(--z-praise-card-3)" }, // 浅青
  { id: "g4", from: "var(--z-praise-card-4)", to: "var(--z-praise-card-4)" }, // 暖米
  { id: "g5", from: "var(--z-praise-card-5)", to: "var(--z-praise-card-5)" }, // 淡粉
  { id: "g6", from: "var(--z-praise-card-6)", to: "var(--z-praise-card-6)" }, // 浅藤紫
  { id: "g7", from: "var(--z-praise-card-7)", to: "var(--z-praise-card-7)" }, // 空间底
  { id: "g8", from: "var(--z-praise-card-8)", to: "var(--z-praise-card-8)" }, // 浅杏
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

/* —— 随机分配一句底纹引导词 —— */
export function randomGuideText(): string {
  const idx = Math.floor(Math.random() * PRAISE_GUIDE_TEXTS.length);
  return PRAISE_GUIDE_TEXTS[idx];
}

/* —— 解析卡片渐变 ID（兼容历史数据）——
 * 已有 gradientId 直接返回；缺失时按 id/createdAt 做 hash 取固定颜色，
 * 避免每次刷新变化，也不再把 g1（偏绿）作为唯一默认。 */
export function resolveGradientId(card: PraiseCard): string {
  if (card.gradientId) return card.gradientId;
  const seed = card.id || card.createdAt || "";
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % CARD_GRADIENTS.length;
  return CARD_GRADIENTS[idx].id;
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

/* —— 创建一张夸夸卡片 ——
 * gradientId / guideText 由新建页在进入时随机生成并传入，
 * 确保编辑页预览的颜色和引导词与保存后完全一致。 */
export function createCard(
  text: string,
  gradientId: string,
  guideText: string,
): PraiseCard {
  const now = new Date();
  return {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    text: text.trim(),
    createdAt: now.toISOString(),
    isPrivate: true,
    gradientId,
    guideText,
  };
}
