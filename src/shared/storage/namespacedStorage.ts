/* —— 模式命名空间存储层 ——
 * 演示模式（demo）与体验模式（experience）使用各自独立的 localStorage 命名空间，
 * 互不污染。命名规则：`zaiya-<mode>-<name>`。
 *
 * 调度器（App.tsx）在挂载某个 App Shell 前同步调用 setStorageMode，
 * 确保该 Shell 内所有数据模块读写到正确的命名空间。
 *
 * 由于同一时刻仅挂载一个 Shell，模块级当前模式变量不存在并发竞争。
 * 落地页（landing）不读写这些业务 key，使用中性命名空间即可。
 */

export type AppStorageMode = "demo" | "experience" | "landing";

let currentMode: AppStorageMode = "landing";

/** 设置当前存储命名空间。由 App 调度器在挂载 Shell 前同步调用。 */
export function setStorageMode(mode: AppStorageMode): void {
  currentMode = mode;
}

/** 读取当前存储命名空间。 */
export function getStorageMode(): AppStorageMode {
  return currentMode;
}

/** 将逻辑名解析为带命名空间的完整 key。 */
export function storageKey(name: string): string {
  return `zaiya-${currentMode}-${name}`;
}

/** 读取带命名空间的 item。 */
export function storageGet(name: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(storageKey(name));
  } catch {
    return null;
  }
}

/** 写入带命名空间的 item。 */
export function storageSet(name: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(name), value);
  } catch {
    // 忽略写入失败（隐私模式 / 配额满）
  }
}

/** 移除带命名空间的 item。 */
export function storageRemove(name: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(name));
  } catch {
    // 忽略
  }
}

/** 读取并 JSON 解析带命名空间的 item；失败时返回 fallback。 */
export function storageGetJSON<T>(name: string, fallback: T): T {
  const raw = storageGet(name);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** JSON 序列化后写入带命名空间的 item。 */
export function storageSetJSON<T>(name: string, value: T): void {
  storageSet(name, JSON.stringify(value));
}
