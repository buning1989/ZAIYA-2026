/* —— 体验模式 Mock 数据版本管理与迁移 ——
 *
 * 职责：
 *   1. 维护体验模式 Mock 数据版本号（zaiya-experience-mock-data-version）
 *   2. 首次进入或检测到旧版本时重置体验模式命名空间
 *   3. 保留「重置体验数据」能力，重置后恢复统一小晨种子数据
 *   4. 初始化过程幂等：多次刷新不会重复生成卡片、联系人或记录
 *
 * 边界：
 *   - 仅读写 zaiya-experience-* 命名空间
 *   - 不得读写或清除 zaiya-demo-* / zaiya-landing-* 数据
 *   - 不得清除与体验模式无关的业务数据
 *   - 不把旧的随机数据与新种子数据直接合并（旧版本直接清除）
 *
 * 种子化策略：
 *   - 本迁移器只负责「清除旧数据 + 写入版本号」
 *   - 实际种子化由各模块的 seedXxxIfEmpty 函数在首次访问时完成
 *     （ContactStep.loadContactsWithExperienceSeed / PrivacyPage.seedExperienceContactsIfEmpty /
 *      PraisePage.seedExperiencePraiseCardsIfEmpty）
 *   - 各 seed 函数通过 xc- 前缀 id 检测保证幂等 */
import { EXPERIENCE_MOCK_DATA_VERSION } from "./xiaochen/constants";

/** 版本 key（独立于业务 key，仅用于版本检测） */
const VERSION_KEY = "mock-data-version";

/** 体验模式命名空间前缀（与 namespacedStorage.storageKey 约定一致） */
const EXPERIENCE_NAMESPACE_PREFIX = "zaiya-experience-";

/** 读取当前持久化的体验模式数据版本；未设置返回 0。 */
export function getExperienceDataVersion(): number {
  if (typeof window === "undefined") return EXPERIENCE_MOCK_DATA_VERSION;
  try {
    const raw = window.localStorage.getItem(
      `${EXPERIENCE_NAMESPACE_PREFIX}${VERSION_KEY}`,
    );
    if (!raw) return 0;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

/** 写入体验模式数据版本号。 */
function setExperienceDataVersion(version: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `${EXPERIENCE_NAMESPACE_PREFIX}${VERSION_KEY}`,
      String(version),
    );
  } catch {
    // 忽略写入失败（隐私模式 / 配额满）
  }
}

/** 列出所有 zaiya-experience-* 命名空间的 localStorage key。
 *  跳过版本 key 本身，避免迁移过程中误删版本号。 */
function listExperienceKeys(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      if (!key.startsWith(EXPERIENCE_NAMESPACE_PREFIX)) continue;
      if (key === `${EXPERIENCE_NAMESPACE_PREFIX}${VERSION_KEY}`) continue;
      keys.push(key);
    }
    return keys;
  } catch {
    return [];
  }
}

/** 清除所有 zaiya-experience-* 业务 key（保留版本 key）。
 *  不影响 zaiya-demo-* / zaiya-landing-* 数据。 */
function clearExperienceBusinessData(): void {
  if (typeof window === "undefined") return;
  const keys = listExperienceKeys();
  for (const key of keys) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // 忽略单 key 删除失败
    }
  }
}

/**
 * 体验模式数据迁移：在 ExperienceApp 挂载时同步调用。
 *
 * 行为：
 *   - 当前版本 === 已持久化版本：不做任何操作（幂等）
 *   - 当前版本 > 已持久化版本（含首次进入）：清除所有体验模式业务数据，
 *     写入新版本号。下次访问各模块时由 seedXxxIfEmpty 函数重新种子化。
 *   - 当前版本 < 已持久化版本（理论不应发生）：仍以当前版本为准，覆盖写入。
 *
 * 不抛异常：迁移失败不应阻塞 App 启动，最坏情况是数据未清除，由 seed 函数
 * 的 xc- 前缀检测兜底，避免重复种子化。 */
export function migrateExperienceData(): void {
  const current = EXPERIENCE_MOCK_DATA_VERSION;
  const persisted = getExperienceDataVersion();
  if (persisted === current) return;
  // 版本不一致：清除旧业务数据，让各模块在下次访问时重新种子化
  clearExperienceBusinessData();
  setExperienceDataVersion(current);
}

/**
 * 手动重置体验模式数据（保留「重置体验数据」能力）。
 *
 * 行为：
 *   - 清除所有 zaiya-experience-* 业务 key
 *   - 重置版本号为当前版本（确保下次访问触发种子化）
 *   - 不影响 zaiya-demo-* 数据
 *
 * 重置后再次进入各模块时，由 seedXxxIfEmpty 函数恢复统一小晨种子数据。 */
export function resetExperienceData(): void {
  clearExperienceBusinessData();
  setExperienceDataVersion(EXPERIENCE_MOCK_DATA_VERSION);
}
