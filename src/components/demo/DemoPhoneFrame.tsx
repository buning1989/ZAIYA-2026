import AppMainSurface from "@/components/AppMainSurface";
import DemoWidgetScreen from "./DemoWidgetScreen";
import type { AppMainSurfaceDemoState } from "./types";

type Props = {
  /** 案例演示状态注入。guided 模式传 step.demoState；free 模式不传（undefined）。
   *  传入 undefined 时 AppMainSurface 走自由体验逻辑，组件实例不卸载。 */
  demoState?: AppMainSurfaceDemoState;
  /** 是否显示桌面小组件场景（第一天 06:40 起床失败专用）。
   *  为 true 时不渲染 AppMainSurface，而是渲染 DemoWidgetScreen。 */
  showWidget?: boolean;
  /** 小组件场景的时间标签 */
  widgetTime?: string;
  /** 是否在手机屏幕内显示「在在」指向标签（仅第一天第一节点使用）。 */
  showZaizaiLabel?: boolean;
};

/* —— 共享手机壳 ——
 * 案例演示和自由体验共用的手机外壳 + AppMainSurface 容器。
 *
 * 关键：本组件由 UnifiedDemoStage 常驻渲染，不因 guided/free 切换而卸载，
 * 只通过 demoState prop 的变化切换 AppMainSurface 内部状态。
 *
 * showWidget=true 时，不渲染 AppMainSurface，而是渲染 DemoWidgetScreen，
 * 模拟手机桌面 + 在呀桌面小组件（第一天 06:40 起床失败场景）。
 */
export default function DemoPhoneFrame({
  demoState,
  showWidget,
  widgetTime,
  showZaizaiLabel,
}: Props) {
  return (
    // 固定沿用原 Demo 的 390 × 780 基准尺寸；仅在视口不足时等比缩小。
    <div className="aspect-[9/18] w-[min(390px,calc(100vw-32px),calc(50vh-16px))] shrink-0">
      <div className="h-full w-full rounded-[40px] border-[7px] border-ink bg-ink p-[2px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)]">
        <div className="no-scrollbar relative h-full w-full overflow-hidden rounded-[33px] bg-white">
          {showWidget ? (
            <DemoWidgetScreen
              time={widgetTime ?? "06:40"}
              showLabel={showZaizaiLabel}
            />
          ) : (
            <AppMainSurface
              interactive
              variant="immersive"
              demoState={demoState}
            />
          )}
        </div>
      </div>
    </div>
  );
}
