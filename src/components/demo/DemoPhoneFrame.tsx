import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import AppMainSurface, { type AppSurfaceMode } from "@/components/AppMainSurface";
import DemoWidgetScreen from "./DemoWidgetScreen";
import type { AppMainSurfaceDemoState } from "./types";

const LOGICAL_SCREEN_WIDTH = 390;

function useLogicalScreenScale() {
  const screenRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState({ scale: 1, logicalHeight: 780 });

  useLayoutEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;

    const update = () => {
      const rect = screen.getBoundingClientRect();
      const scale = rect.width / LOGICAL_SCREEN_WIDTH;
      if (scale <= 0) return;
      setMetrics({
        scale,
        logicalHeight: rect.height / scale,
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(screen);
    return () => observer.disconnect();
  }, []);

  return { screenRef, ...metrics };
}

type Props = {
  /** 当前手机壳承载的 App 模式，由上层 Shell 显式传入。 */
  appMode?: AppSurfaceMode;
  /** 数据日期基准，主要用于自由体验模式固定 2026-07-15。 */
  referenceNow?: Date;
  /** 案例演示状态注入 */
  demoState?: AppMainSurfaceDemoState;
  /** 对话流末尾行动卡片：用于 07:35 呼吸入口 */
  dialogActionCard?: {
    title: string;
    description: string;
    actionLabel: string;
    onClick: () => void;
  };
  /** 是否显示桌面小组件场景（替代 AppMainSurface） */
  showWidget?: boolean;
  /** 桌面态显示的系统时间 */
  widgetTime?: string;
  /** 首页气泡点击回调：用于 06:40 第二周节点星星反馈 */
  onDemoBubbleClick?: () => void;
  /** 手机屏幕内叠加层（如星星、睡眠记录流程），渲染在 App 内容之上、屏幕圆角裁切内 */
  overlay?: ReactNode;
};

/* —— 共享手机壳 ——
 * 案例演示和自由体验共用的手机外壳。
 *
 * showWidget=true: 渲染桌面 + 2×2 小组件（06:40 节点）
 * showWidget=false/undefined: 渲染 AppMainSurface（其他节点）
 */
export default function DemoPhoneFrame({
  appMode = "guided",
  referenceNow,
  demoState,
  dialogActionCard,
  showWidget,
  widgetTime,
  onDemoBubbleClick,
  overlay,
}: Props) {
  const { screenRef, scale, logicalHeight } = useLogicalScreenScale();

  return (
    <div className="aspect-[9/18] w-[min(390px,calc(100vw-32px),calc((100vh-128px)/2))] shrink-0">
      <div className="h-full w-full rounded-[40px] border-[7px] border-ink bg-ink p-[2px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)]">
        <div
          ref={screenRef}
          className="no-scrollbar relative h-full w-full overflow-hidden rounded-[33px] bg-white"
        >
          {showWidget ? (
            <>
              <DemoWidgetScreen time={widgetTime ?? "06:40"} />
              {overlay}
            </>
          ) : (
            <div
              className="absolute left-0 top-0"
              style={{
                width: LOGICAL_SCREEN_WIDTH,
                height: logicalHeight,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <AppMainSurface
                mode={appMode}
                referenceNow={referenceNow}
                interactive
                variant="immersive"
                demoState={demoState}
                dialogActionCard={dialogActionCard}
                onDemoBubbleClick={onDemoBubbleClick}
              />
              {overlay}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
