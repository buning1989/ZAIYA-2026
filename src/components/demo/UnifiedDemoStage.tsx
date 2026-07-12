import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GuidedModeSwitch from "./GuidedModeSwitch";
import GuidedStoryPanel from "./GuidedStoryPanel";
import GuidedDemoControls, { NavArrow } from "./GuidedDemoControls";
import GuidedScenarioPlayer from "./GuidedScenarioPlayer";
import XiaochenCaseIntro from "./XiaochenCaseIntro";
import DemoPhoneFrame from "./DemoPhoneFrame";
import FreeExperiencePanel from "./FreeExperiencePanel";
import { xiaochenDay1Scenario } from "./scenarios/xiaochenDay1";
import { SOFT_EASE } from "@/lib/motionVariants";

type Props = {
  mode: "guided" | "free";
  onReturnHome: () => void;
  onSwitchToGuided: () => void;
  onSwitchToFree: () => void;
};

type GuidedPhase = "intro" | "scenario";

/* —— 统一演示舞台 ——
 * 案例演示（guided）和自由体验（free）共用同一个舞台容器。
 * 不再对应两个互斥的页面组件，而是同一舞台的两种状态。
 *
 * 核心设计：
 * 1. 外层页面、背景、舞台容器不变 —— 由 DemoExperience 提供
 * 2. 弱提示返回入口与模式切换控件常驻顶部，位置不变
 * 3. 手机 Demo（DemoPhoneFrame + AppMainSurface）在 scenario ↔ free 之间不卸载，
 *    只通过 demoState prop 的有无切换内部状态
 * 4. 手机固定在桌面舞台的第二列；右侧槽位在故事说明与自由体验引导间切换
 * 5. intro → stage 切换用 AnimatePresence mode="wait" 交叉淡入淡出
 *
 * guidedPhase 状态在 guided/free 切换时保留：
 * - scenario → free → guided：回到之前的 step（GuidedScenarioPlayer 不卸载）
 * - intro → free → guided：回到 intro（第一版简化方案）
 */
export default function UnifiedDemoStage({
  mode,
  onReturnHome,
  onSwitchToGuided,
  onSwitchToFree,
}: Props) {
  const [guidedPhase, setGuidedPhase] = useState<GuidedPhase>("intro");
  const enterScenario = () => setGuidedPhase("scenario");

  const showIntro = mode === "guided" && guidedPhase === "intro";

  return (
    <GuidedScenarioPlayer scenario={xiaochenDay1Scenario}>
      {({ step, stepIndex, total, atStart, atEnd, next, prev, goTo }) => (
        <div className="mx-auto flex min-h-full w-full max-w-[1120px] flex-col px-6 py-8">
          {/* 顶部弱导航：返回入口位于舞台左侧，模式切换器严格居中 */}
          <div className="mb-8 grid grid-cols-1 gap-y-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-y-0">
            <button
              type="button"
              onClick={onReturnHome}
              aria-label="返回在呀主页"
              className="inline-flex h-9 items-center justify-self-start rounded-full px-1 text-[13px] text-ink-faint transition-colors hover:text-ink-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-4"
            >
              ← 返回主页
            </button>

            <div className="justify-self-center sm:col-start-2 sm:row-start-1">
              <GuidedModeSwitch
                currentMode={mode}
                onSwitchToGuided={onSwitchToGuided}
                onSwitchToFree={onSwitchToFree}
              />
            </div>

            <div
              aria-hidden="true"
              className="hidden sm:col-start-3 sm:row-start-1 sm:block"
            />
          </div>

          {/* 主内容区：flex-1 居中 */}
          <div className="flex flex-1 flex-col justify-center">
            <AnimatePresence mode="wait">
              {showIntro ? (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28, ease: SOFT_EASE }}
                >
                  <XiaochenCaseIntro onStart={enterScenario} />
                </motion.div>
              ) : (
                <motion.div
                  key="stage"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28, ease: SOFT_EASE }}
                >
                  <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[48px_390px_420px_48px] lg:gap-x-24 lg:gap-y-0">
                    {/* 固定箭头槽位：显隐不再参与手机位置计算 */}
                    <div className="hidden h-12 w-12 items-center justify-center lg:flex lg:col-start-1">
                      <AnimatePresence>
                        {mode === "guided" && (
                          <motion.div
                            key="left-arrow"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.28, ease: SOFT_EASE }}
                          >
                            <NavArrow
                              direction="left"
                              disabled={atStart}
                              isEnd={false}
                              onClick={prev}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 手机 Demo：固定锚点、常驻，不参与模式切换位移动画 */}
                    <div className="justify-self-center lg:col-start-2">
                      <DemoPhoneFrame
                        demoState={mode === "guided" ? step.demoState : undefined}
                      />
                    </div>

                    {/* 固定说明槽位：左右模式按标签方向柔和替换 */}
                    <div className="w-full lg:col-start-3 lg:h-full">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={mode}
                          initial={{
                            opacity: 0,
                            x: mode === "guided" ? -24 : 24,
                          }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: mode === "guided" ? -24 : 24 }}
                          transition={{ duration: 0.32, ease: SOFT_EASE }}
                          className="h-full"
                        >
                          {mode === "guided" ? (
                            <GuidedStoryPanel
                              step={step}
                              scenarioName={xiaochenDay1Scenario.name}
                              total={total}
                            />
                          ) : (
                            <FreeExperiencePanel />
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <div className="hidden h-12 w-12 items-center justify-center lg:flex lg:col-start-4">
                      <AnimatePresence>
                        {mode === "guided" && (
                          <motion.div
                            key="right-arrow"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.28, ease: SOFT_EASE }}
                          >
                            <NavArrow
                              direction="right"
                              disabled={false}
                              isEnd={atEnd}
                              onClick={atEnd ? onSwitchToFree : next}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 固定高度控制槽：内容仅在 guided scenario 显示，避免切换时上下漂移 */}
          {!showIntro && (
            <div className="min-h-[138px] lg:min-h-[61px]">
              {mode === "guided" && guidedPhase === "scenario" && (
                <GuidedDemoControls
                  atStart={atStart}
                  atEnd={atEnd}
                  total={total}
                  stepIndex={stepIndex}
                  onPrev={prev}
                  onNext={next}
                  onGoTo={goTo}
                  onEnterFree={onSwitchToFree}
                />
              )}
            </div>
          )}
        </div>
      )}
    </GuidedScenarioPlayer>
  );
}
