import { useEffect, useState } from "react";
import AppMainSurface from "@/components/AppMainSurface";
import type { AppMainSurfaceDemoState } from "./types";

type Props = {
  /** 案例演示状态注入。guided 模式传 step.demoState；free 模式不传（undefined）。
   *  传入 undefined 时 AppMainSurface 走自由体验逻辑，组件实例不卸载。 */
  demoState?: AppMainSurfaceDemoState;
  /** 是否在手机屏幕内显示「在在」指向标签（仅第一天第一节点使用）。 */
  showZaizaiLabel?: boolean;
};

/* —— 共享手机壳 ——
 * 案例演示和自由体验共用的手机外壳 + AppMainSurface 容器。
 *
 * 关键：本组件由 UnifiedDemoStage 常驻渲染，不因 guided/free 切换而卸载，
 * 只通过 demoState prop 的变化切换 AppMainSurface 内部状态。
 *
 * showZaizaiLabel=true 时，在手机屏幕内部角色形象旁渲染一个轻量指向标签，
 * 带短引导线，延迟 400ms 淡入，不自动消失，切换节点后自然卸载。
 */
export default function DemoPhoneFrame({ demoState, showZaizaiLabel }: Props) {
  const [labelVisible, setLabelVisible] = useState(false);

  useEffect(() => {
    if (!showZaizaiLabel) {
      setLabelVisible(false);
      return;
    }
    const timer = setTimeout(() => setLabelVisible(true), 400);
    return () => clearTimeout(timer);
  }, [showZaizaiLabel]);

  return (
    // 固定沿用原 Demo 的 390 × 780 基准尺寸；仅在视口不足时等比缩小。
    <div className="aspect-[9/18] w-[min(390px,calc(100vw-32px),calc(50vh-16px))] shrink-0">
      <div className="h-full w-full rounded-[40px] border-[7px] border-ink bg-ink p-[2px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)]">
        <div className="no-scrollbar relative h-full w-full overflow-hidden rounded-[33px] bg-white">
          <AppMainSurface interactive variant="immersive" demoState={demoState} />

          {/* 「在在」指向标签：位于手机屏幕内部，角色形象右侧 */}
          {showZaizaiLabel && (
            <div
              className="pointer-events-none absolute left-1/2 top-[42%] z-20 flex items-center gap-1 transition-opacity duration-500"
              style={{
                opacity: labelVisible ? 1 : 0,
                transform: "translateX(60px)",
              }}
            >
              {/* 短引导线 */}
              <svg width="24" height="1.5" viewBox="0 0 24 2" fill="none" aria-hidden="true">
                <line x1="0" y1="1" x2="20" y2="1" stroke="rgba(0,0,0,0.38)" strokeWidth="1" />
                <path d="M18 0.5 L23 1 L18 1.5 Z" fill="rgba(0,0,0,0.38)" />
              </svg>
              {/* 名称标签 */}
              <span className="rounded-md border border-black/10 bg-white/80 px-2 py-0.5 text-[12px] font-medium text-ink-soft backdrop-blur-sm">
                在在
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
