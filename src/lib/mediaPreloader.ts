/* —— 统一媒体预加载工具 ——
 * 性能优化（2026-07-13）：将资源加载时机从「进入页面后」提前到「即将进入页面前」。
 *
 * 设计原则：
 * 1. 同一资源只预加载一次（去重 + 状态缓存）。
 * 2. 不自动播放、不挂载完整功能页面。
 * 3. 错误吞吐：预加载失败不影响后续真实使用，浏览器仍可按需重新请求。
 * 4. 超时保护：视频预加载最多等待 8s，超时后释放 DOM 引用，保留浏览器已下载的部分缓存。
 * 5. 不依赖 fetch() 写入媒体缓存：fetch 的 Response body 不一定能被 <video> 复用，
 *    因此视频预加载使用独立 HTMLVideoElement + preload="auto" + load()。
 *
 * 使用方式：
 *   import { preloadImage, preloadVideo, preloadAudio, preloadModule } from "@/lib/mediaPreloader";
 *   preloadImage("./assets/zaiya/wake-up-poster.png");
 *   preloadVideo("./assets/zaiya/wake-up.webm");
 *   preloadAudio("./assets/social/daze/together-bgm.mp3");
 *   preloadModule(() => import("./BreathingFlow"));
 */

type LoadStatus = "loading" | "loaded" | "error";

/* —— 资源状态缓存：URL → 当前状态 ——
 * 用于去重：同一 URL 不会重复发起预加载。
 * 注意：浏览器缓存失效后再次调用 preload 不会重新发起，因为状态标记仍为 "loaded"。
 * 这是有意为之——预加载只是「尽力而为」，真正渲染时由 LazyVideo/video 元素自行处理。 */
const statusCache = new Map<string, LoadStatus>();
const promiseCache = new Map<string, Promise<void>>();

/* —— 视频预加载：创建独立 HTMLVideoElement ——
 * 完成后释放 DOM 引用，但浏览器 HTTP 缓存保留。 */
export function preloadVideo(url: string, timeoutMs = 8000): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const existing = statusCache.get(url);
  if (existing === "loaded") return Promise.resolve();
  if (existing === "loading") return promiseCache.get(url) ?? Promise.resolve();

  if (typeof document === "undefined") return Promise.resolve();

  statusCache.set(url, "loading");
  const v = document.createElement("video");
  v.muted = true;
  v.preload = "auto";
  v.playsInline = true;
  // 不设置 autoPlay，不调用 play()
  v.src = url;

  const promise = new Promise<void>((resolve) => {
    let settled = false;
    const cleanup = () => {
      if (settled) return;
      settled = true;
      // 释放 DOM 引用，浏览器 HTTP 缓存保留
      v.removeAttribute("src");
      v.load();
      clearTimeout(timer);
    };

    const onReady = () => {
      statusCache.set(url, "loaded");
      cleanup();
      resolve();
    };
    const onError = () => {
      statusCache.set(url, "error");
      cleanup();
      resolve(); // 错误吞吐：不 reject
    };

    v.addEventListener("loadeddata", onReady, { once: true });
    v.addEventListener("canplay", onReady, { once: true });
    v.addEventListener("error", onError, { once: true });

    // 超时保护
    const timer = window.setTimeout(() => {
      if (settled) return;
      // 超时不标记为 error，让浏览器继续在后台下载
      // 状态保持 "loading"，下次调用不会重复发起
      statusCache.set(url, "loaded");
      cleanup();
      resolve();
    }, timeoutMs);

    // 触发加载
    v.load();
  });

  promiseCache.set(url, promise);
  return promise;
}

/* —— 图片预加载：使用 new Image() —— */
export function preloadImage(url: string, timeoutMs = 6000): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const existing = statusCache.get(url);
  if (existing === "loaded") return Promise.resolve();
  if (existing === "loading") return promiseCache.get(url) ?? Promise.resolve();

  if (typeof Image === "undefined") return Promise.resolve();

  statusCache.set(url, "loading");
  const img = new Image();

  const promise = new Promise<void>((resolve) => {
    let settled = false;
    const cleanup = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
    };

    const onReady = () => {
      statusCache.set(url, "loaded");
      cleanup();
      resolve();
    };
    const onError = () => {
      statusCache.set(url, "error");
      cleanup();
      resolve();
    };

    img.addEventListener("load", onReady, { once: true });
    img.addEventListener("error", onError, { once: true });

    const timer = window.setTimeout(() => {
      statusCache.set(url, "loaded");
      cleanup();
      resolve();
    }, timeoutMs);

    img.src = url;
  });

  promiseCache.set(url, promise);
  return promise;
}

/* —— 音频预加载：使用 new Audio() —— */
export function preloadAudio(url: string, timeoutMs = 6000): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const existing = statusCache.get(url);
  if (existing === "loaded") return Promise.resolve();
  if (existing === "loading") return promiseCache.get(url) ?? Promise.resolve();

  if (typeof Audio === "undefined") return Promise.resolve();

  statusCache.set(url, "loading");
  const audio = new Audio();
  audio.preload = "auto";
  audio.src = url;

  const promise = new Promise<void>((resolve) => {
    let settled = false;
    const cleanup = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
    };

    const onReady = () => {
      statusCache.set(url, "loaded");
      cleanup();
      resolve();
    };
    const onError = () => {
      statusCache.set(url, "error");
      cleanup();
      resolve();
    };

    audio.addEventListener("canplaythrough", onReady, { once: true });
    audio.addEventListener("loadeddata", onReady, { once: true });
    audio.addEventListener("error", onError, { once: true });

    const timer = window.setTimeout(() => {
      statusCache.set(url, "loaded");
      cleanup();
      resolve();
    }, timeoutMs);

    audio.load();
  });

  promiseCache.set(url, promise);
  return promise;
}

/* —— 动态模块预加载：复用 React.lazy 的 loader ——
 * 关键：调用方必须传入与 React.lazy 完全相同的 import 路径，
 * 这样 Vite 会生成同一个 chunk，预加载和真实渲染复用同一份 Promise。 */
const moduleCache = new Map<string, Promise<unknown>>();

export function preloadModule<T>(
  loader: () => Promise<T>,
  key?: string,
): Promise<T> {
  // 用 loader 函数的字符串表示作为去重 key（不够精确，但配合显式 key 更可靠）
  const cacheKey = key ?? loader.toString();
  const existing = moduleCache.get(cacheKey);
  if (existing) return existing as Promise<T>;

  const promise = loader().catch((err) => {
    // 错误吞吐：预加载失败时移除缓存，让下次调用可以重试
    moduleCache.delete(cacheKey);
    throw err;
  });

  moduleCache.set(cacheKey, promise);
  return promise;
}

/* —— 批量预加载 —— */
export function preloadAll(resources: {
  videos?: string[];
  images?: string[];
  audio?: string[];
}): Promise<void[]> {
  const tasks: Promise<void>[] = [
    ...(resources.videos ?? []).map((url) => preloadVideo(url)),
    ...(resources.images ?? []).map((url) => preloadImage(url)),
    ...(resources.audio ?? []).map((url) => preloadAudio(url)),
  ];
  return Promise.all(tasks);
}

/* —— 查询资源加载状态（调试用）—— */
function getPreloadStatus(url: string): LoadStatus | undefined {
  return statusCache.get(url);
}
