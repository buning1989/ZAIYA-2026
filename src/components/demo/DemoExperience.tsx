import { useEffect, useRef } from "react";
import { useDemoMode, readModeFromUrl } from "./useDemoMode";
import DemoModeSelector from "./DemoModeSelector";
import UnifiedDemoStage from "./UnifiedDemoStage";

type Props = { onClose: () => void };

type HistoryState = { __demo?: true; mode?: string } | null;

/**
 * Demo 双模式框架路由。
 *
 * 根据 demoMode 渲染：select（模式选择页）/ guided（案例演示占位）/ free（自由体验）。
 *
 * URL 同步：mode=guided / mode=free 直接访问对应模式；返回选择页时清除参数。
 * 浏览器后退：在 Demo 内切换模式；再后退退出到落地页。
 *
 * Esc：select 退出到落地页；guided 返回选择页；free 不拦截（避免打断内部流程，
 * 用「切换体验模式」按钮退出）。
 */
export default function DemoExperience({ onClose }: Props) {
  const { mode, setMode, enterGuidedMode, enterFreeMode, exitToModeSelect } =
    useDemoMode();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // 初始历史标记：让浏览器后退可在 Demo 内切换模式 / 退出到落地页
  useEffect(() => {
    const urlMode = readModeFromUrl();
    const st = window.history.state as HistoryState;
    if (st && st.__demo === true && st.mode === "select") {
      // 重新打开且已在 select 条目：原地标记，避免堆叠历史
      window.history.replaceState(
        { __demo: true, mode: "select" },
        "",
        window.location.href,
      );
    } else if (urlMode === "guided" || urlMode === "free") {
      // 直接 URL 访问：标记当前条目为 Demo 条目
      window.history.replaceState(
        { __demo: true, mode: urlMode },
        "",
        window.location.href,
      );
    } else {
      // 从落地页点击进入 select：压入一条 Demo 条目，后退可回到落地页
      window.history.pushState(
        { __demo: true, mode: "select" },
        "",
        window.location.href,
      );
    }
  }, []);

  // 浏览器后退 / 前进：同步模式，或退出到落地页
  useEffect(() => {
    const onPop = () => {
      const st = window.history.state as HistoryState;
      if (st && st.__demo === true) {
        setMode(readModeFromUrl());
      } else {
        // 已退出到落地页
        onCloseRef.current();
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [setMode]);

  // 锁背景滚动 + Esc
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (mode === "select") onCloseRef.current();
      else if (mode === "guided") exitToModeSelect();
      // free 模式不拦截 Esc
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mode, exitToModeSelect]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="在呀 ZÀIYA Demo"
      className="fixed inset-0 z-[100] overflow-y-auto bg-white"
    >
      {mode === "select" && (
        <DemoModeSelector
          onEnterGuided={enterGuidedMode}
          onEnterFree={enterFreeMode}
          onClose={onClose}
        />
      )}
      {(mode === "guided" || mode === "free") && (
        <UnifiedDemoStage
          mode={mode}
          onReturnHome={onClose}
          onSwitchToGuided={enterGuidedMode}
          onSwitchToFree={enterFreeMode}
        />
      )}
    </div>
  );
}
