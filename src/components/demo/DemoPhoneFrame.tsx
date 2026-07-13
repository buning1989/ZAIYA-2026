import AppMainSurface from "@/components/AppMainSurface";
import type { AppMainSurfaceDemoState } from "./types";

type Props = {
  /** 案例演示状态注入。guided 模式传 step.demoState；free 模式不传（undefined）。
   *  传入 undefined 时 AppMainSurface 走自由体验逻辑，组件实例不卸载。 */
  demoState?: AppMainSurfaceDemoState;
};

/* —— 共享手机壳 ——
 * 案例演示和自由体验共用的手机外壳 + AppMainSurface 容器。
 *
 * 关键：本组件由 UnifiedDemoStage 常驻渲染，不因 guided/free 切换而卸载，
 * 只通过 demoState prop 的变化切换 AppMainSurface 内部状态。
 */
export default function DemoPhoneFrame({ demoState }: Props) {
  return (
    // 固定沿用原 Demo 的 390 × 780 基准尺寸；仅在视口不足时等比缩小。
    <div className="aspect-[9/18] w-[min(390px,calc(100vw-32px),calc(50vh-16px))] shrink-0">
      <div className="h-full w-full rounded-[40px] border-[7px] border-ink bg-ink p-[2px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)]">
        <div className="no-scrollbar relative h-full w-full overflow-hidden rounded-[33px] bg-white">
          <AppMainSurface interactive variant="immersive" demoState={demoState} />
        </div>
      </div>
    </div>
  );
}
