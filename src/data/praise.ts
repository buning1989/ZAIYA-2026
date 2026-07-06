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
 * isPrivate 固定为 true：当前版本不开发家长端查看 / 公开分享 / 社区展示。 */
export type PraiseCard = {
  id: string;
  text: string;
  createdAt: string; // ISO 时间戳
  updatedAt?: string;
  isPrivate: true;
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
  };
}
