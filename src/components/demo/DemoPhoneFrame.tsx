import { AnimatePresence, motion } from "framer-motion";
import AppMainSurface from "@/components/AppMainSurface";
import DemoWidgetScreen from "./DemoWidgetScreen";
import type { AppMainSurfaceDemoState } from "./types";
import { SOFT_EASE } from "@/lib/motionVariants";

/* —— 小组件启动 App 的子状态 ——
 * desktop   → 桌面 + 2×2 小组件
 * launching → 小组件按压反馈
 * home      → App 首页（晨起气泡）
 * dialog    → App 对话界面
 *
 * 该子状态只服务于 06:40 → 07:35 的页面切换。
 * 由 UnifiedDemoStage 控制，DemoPhoneFrame 只负责按状态渲染。
 */
export type WidgetLaunchStage =
  | "desktop"
  | "launching"
  | "home"
  | "dialog";

type Props = {
  /** 案例演示状态注入（day1[1] 及之后的对话/呼吸等场景使用） */
  demoState?: AppMainSurfaceDemoState;
  /** 小组件启动子状态。未传时按 demoState 正常渲染 AppMainSurface */
  launchStage?: WidgetLaunchStage;
  /** 桌面/启动态显示的系统时间 */
  widgetTime?: string;
};

/* —— App 首页中间态：晨起气泡 ——
 * 启动过渡中短暂停留的 App 首页状态。
 * 只显示窗帘文案的后半句（前半句在小组件内）。
 */
const HOME_LAUNCH_STATE: AppMainSurfaceDemoState = {
  enabled: true,
  now: new Date("2026-07-12T06:40:00+08:00"),
  surfaceMode: "home",
  bubbleCopy: "我只把窗帘拉开了一条小缝，光就自己挤进来了。",
};

/* —— 共享手机壳 ——
 * 案例演示和自由体验共用的手机外壳。
 *
 * launchStage 控制小组件启动 App 的过渡：
 * - desktop/launching: 渲染 DemoWidgetScreen（launching 时 pressing=true）
 * - home: 渲染 AppMainSurface + HOME_LAUNCH_STATE（首页中间态）
 * - dialog: 渲染 AppMainSurface + 外部传入的 demoState（对话场景）
 *
 * 过渡动画：widget 层和 app 层通过 AnimatePresence 交叉溶解。
 */
export default function DemoPhoneFrame({
  demoState,
  launchStage,
  widgetTime,
}: Props) {
  // 未启用小组件启动流程时，直接渲染 AppMainSurface
  const useWidgetFlow = launchStage !== undefined;
  const showWidget = useWidgetFlow && (launchStage === "desktop" || launchStage === "launching");
  const showApp = !useWidgetFlow || launchStage === "home" || launchStage === "dialog";

  // App 层使用的 demoState：home 中间态用 HOME_LAUNCH_STATE，dialog 用外部传入
  const appDemoState =
    launchStage === "home" ? HOME_LAUNCH_STATE : demoState;

  return (
    <div className="aspect-[9/18] w-[min(390px,calc(100vw-32px),calc(50vh-16px))] shrink-0">
      <div className="h-full w-full rounded-[40px] border-[7px] border-ink bg-ink p-[2px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)]">
        <div className="no-scrollbar relative h-full w-full overflow-hidden rounded-[33px] bg-white">
          {/* Widget 层：桌面 + 小组件 */}
          <AnimatePresence>
            {showWidget && (
              <motion.div
                key="widget-layer"
                className="absolute inset-0"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: SOFT_EASE }}
              >
                <DemoWidgetScreen
                  time={widgetTime ?? "06:40"}
                  pressing={launchStage === "launching"}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* App 层：在呀 App 首页 / 对话 */}
          <AnimatePresence>
            {showApp && (
              <motion.div
                key="app-layer"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, ease: SOFT_EASE }}
              >
                <AppMainSurface
                  interactive
                  variant="immersive"
                  demoState={appDemoState}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
