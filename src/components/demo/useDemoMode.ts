import { useCallback, useState } from "react";

/** Demo 体验模式：选择 / 案例演示 / 自由体验 */
export type DemoMode = "select" | "guided" | "free";

/** 从当前 URL 读取模式参数（?mode=guided | ?mode=free），无参数视为 select。 */
export function readModeFromUrl(): DemoMode {
  if (typeof window === "undefined") return "select";
  const m = new URLSearchParams(window.location.search).get("mode");
  return m === "guided" || m === "free" ? m : "select";
}

function buildUrl(mode: DemoMode): string {
  const url = new URL(window.location.href);
  if (mode === "select") {
    url.searchParams.delete("mode");
  } else {
    url.searchParams.set("mode", mode);
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * 将模式同步到 URL：pushState 一条带 __demo 标记的记录。
 * 标记用于 popstate 时区分「Demo 内部条目」与「落地页条目」，
 * 从而让浏览器后退能在 Demo 内切换模式、再后退退出到落地页。
 */
function syncUrl(mode: DemoMode) {
  if (typeof window === "undefined") return;
  window.history.pushState({ __demo: true, mode }, "", buildUrl(mode));
}

/**
 * Demo 模式状态管理。
 *
 * - mode：当前模式（select / guided / free）
 * - setMode：仅更新状态，不同步 URL（供 popstate 回填使用）
 * - setDemoMode：更新状态并 pushState 同步 URL
 * - enterGuidedMode / enterFreeMode / exitToModeSelect：语义化快捷方法
 */
export function useDemoMode() {
  const [mode, setMode] = useState<DemoMode>(() => readModeFromUrl());

  const setDemoMode = useCallback((m: DemoMode) => {
    setMode(m);
    syncUrl(m);
  }, []);

  const enterGuidedMode = useCallback(() => setDemoMode("guided"), [setDemoMode]);
  const enterFreeMode = useCallback(() => setDemoMode("free"), [setDemoMode]);
  const exitToModeSelect = useCallback(() => setDemoMode("select"), [setDemoMode]);

  return { mode, setMode, setDemoMode, enterGuidedMode, enterFreeMode, exitToModeSelect };
}
