import type { ReactNode } from "react";
import AppMainSurface from "@/components/AppMainSurface";
import DemoWidgetScreen from "./DemoWidgetScreen";
import type { AppMainSurfaceDemoState } from "./types";

type Props = {
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
  demoState,
  dialogActionCard,
  showWidget,
  widgetTime,
  onDemoBubbleClick,
  overlay,
}: Props) {
  return (
    <div className="aspect-[9/18] w-[min(390px,calc(100vw-32px),calc(50vh-100px))] shrink-0">
      <div className="h-full w-full rounded-[40px] border-[7px] border-ink bg-ink p-[2px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)]">
        <div className="no-scrollbar relative h-full w-full overflow-hidden rounded-[33px] bg-white">
          {showWidget ? (
            <DemoWidgetScreen time={widgetTime ?? "06:40"} />
          ) : (
            <AppMainSurface
              interactive
              variant="immersive"
              demoState={demoState}
              dialogActionCard={dialogActionCard}
              onDemoBubbleClick={onDemoBubbleClick}
            />
          )}
          {overlay}
        </div>
      </div>
    </div>
  );
}
