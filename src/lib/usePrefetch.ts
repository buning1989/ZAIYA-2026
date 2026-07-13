/* —— Intent Prefetch Hook ——
 * 性能优化（2026-07-13）：在用户「即将进入」功能页前预加载对应资源。
 *
 * 触发时机：onPointerEnter / onFocus / onTouchStart / onPointerDown
 * 行为：
 * - 预加载对应 React 动态模块（复用集中式 loader）
 * - 预加载该功能首次展示的 WebM 和 poster
 * - 同一资源只预加载一次（由 mediaPreloader 去重）
 * - 不自动播放视频、不挂载完整功能页面
 * - 不修改当前入口样式和交互
 *
 * 使用方式：
 *   const prefetch = usePrefetch(() => {
 *     loadBreathingFlow();
 *     preloadVideo("./assets/breathing/hero.webm");
 *     preloadImage("./assets/breathing/hero-poster.png");
 *   });
 *   <button onPointerEnter={prefetch} onFocus={prefetch} onTouchStart={prefetch} onPointerDown={prefetch} />
 */

import { useCallback, useRef } from "react";

/**
 * 创建一个预加载回调，在 pointerenter / focus / touchstart / pointerdown 时触发。
 * 使用 ref 确保同一回调只执行一次（即使多个事件依次触发）。
 *
 * @param prefetchFn 预加载函数（调用 loadXxx / preloadVideo / preloadImage 等）
 * @returns 事件处理函数，可直接赋值给 onPointerEnter 等
 */
export function usePrefetch(prefetchFn: () => void): () => void {
  const calledRef = useRef(false);

  return useCallback(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    try {
      prefetchFn();
    } catch {
      // 错误吞吐：预加载失败不影响后续点击进入
      calledRef.current = false;
    }
  }, [prefetchFn]);
}

/**
 * 批量预加载多个入口的预加载函数。
 * 用于在有多个功能入口的页面（如 MoreMenu）中统一管理。
 *
 * @param prefetchMap 记录每个入口的预加载函数
 * @returns 与 prefetchMap 相同结构的回调函数集合
 */
export function usePrefetchMap<T extends string>(
  prefetchMap: Record<T, () => void>,
): Record<T, () => void> {
  const calledRef = useRef<Set<T>>(new Set());

  const result = {} as Record<T, () => void>;
  for (const key of Object.keys(prefetchMap) as T[]) {
    result[key] = () => {
      if (calledRef.current.has(key)) return;
      calledRef.current.add(key);
      try {
        prefetchMap[key]();
      } catch {
        calledRef.current.delete(key);
      }
    };
  }
  return result;
}
