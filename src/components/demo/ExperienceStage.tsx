import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GuidedModeSwitch from "./GuidedModeSwitch";
import DemoPhoneFrame from "./DemoPhoneFrame";
import FreeExperiencePanel from "./FreeExperiencePanel";
import { SOFT_EASE } from "@/lib/motionVariants";
import { XIAOCHEN_CURRENT_DATETIME } from "@/apps/experience/data/xiaochen/timeConfig";

type Props = {
  onReturnHome: () => void;
  onSwitchToGuided: () => void;
};

/* —— 体验模式专用舞台（free）——
 *
 * 从 UnifiedDemoStage 拆分而来，移除所有 mode=== 条件判断。
 * 仅承载自由体验模式的布局：手机框 + 体验说明面板。
 * 无线性叙事、无阶段管理、无键盘/滑动导航。
 */
export default function ExperienceStage({
  onReturnHome,
  onSwitchToGuided,
}: Props) {
  const referenceNow = useMemo(
    () => new Date(XIAOCHEN_CURRENT_DATETIME),
    [],
  );

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1120px] flex-col px-6 py-8">
      {/* 顶部弱导航：返回入口位于舞台左侧，模式切换器严格居中 */}
      <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-y-0">
        <button
          type="button"
          onClick={onReturnHome}
          aria-label="返回在呀 ZÀIYA 主页"
          className="inline-flex h-9 items-center justify-self-start rounded-full px-1 text-[13px] text-ink-faint transition-colors hover:text-ink-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-4"
        >
          ← 返回主页
        </button>

        <div className="justify-self-center sm:col-start-2 sm:row-start-1">
          <GuidedModeSwitch
            currentMode="free"
            onSwitchToGuided={onSwitchToGuided}
            onSwitchToFree={() => {}}
          />
        </div>

        <div
          aria-hidden="true"
          className="hidden sm:col-start-3 sm:row-start-1 sm:block"
        />
      </div>

      {/* 主内容区 */}
      <div className="relative mt-6 flex flex-1 flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key="free"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: SOFT_EASE }}
          >
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[auto_minmax(280px,360px)] lg:justify-center lg:gap-x-16 lg:gap-y-0">
              <div className="order-2 justify-self-center lg:order-1">
                <DemoPhoneFrame
                  appMode="experience"
                  referenceNow={referenceNow}
                />
              </div>

              <div className="order-1 w-full lg:order-2">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key="free-panel"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.32, ease: SOFT_EASE }}
                  >
                    <FreeExperiencePanel />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
