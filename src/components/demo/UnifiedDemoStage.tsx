import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GuidedModeSwitch from "./GuidedModeSwitch";
import GuidedStoryPanel from "./GuidedStoryPanel";
import GuidedDemoControls, { NavArrow } from "./GuidedDemoControls";
import XiaochenCaseIntro from "./XiaochenCaseIntro";
import TwoWeekTransition from "./TwoWeekTransition";
import DemoPhoneFrame from "./DemoPhoneFrame";
import FreeExperiencePanel from "./FreeExperiencePanel";
import { xiaochenDay1Scenario } from "./scenarios/xiaochenDay1";
import { xiaochenDay2Scenario } from "./scenarios/xiaochenDay2";
import { SOFT_EASE } from "@/lib/motionVariants";

type Props = {
  mode: "guided" | "free";
  onReturnHome: () => void;
  onSwitchToGuided: () => void;
  onSwitchToFree: () => void;
};

/* —— 线性叙事相位 ——
 * intro       → 案例介绍
 * day1        → 第一天 1/6 … 6/6
 * transition  → 两周后过渡页
 * day2        → 小晨两周后 1/8 … 8/8
 *
 * 评委不再通过 Tab 切换第一天/第二天，而是通过「下一步」线性推进。
 * 第一天末步 → transition → 第二天第 1 步。
 */
type GuidedPhase = "intro" | "day1" | "transition" | "day2";

/* —— 统一演示舞台 ——
 * 案例演示（guided）和自由体验（free）共用同一个舞台容器。
 *
 * 核心设计：
 * 1. 外层页面、背景、舞台容器不变 —— 由 DemoExperience 提供
 * 2. 弱提示返回入口与模式切换控件常驻顶部，位置不变
 * 3. 手机 Demo（DemoPhoneFrame + AppMainSurface）在 scenario ↔ free 之间不卸载，
 *    只通过 demoState prop 的有无切换内部状态
 * 4. 线性叙事：intro → day1 → transition → day2，不再有「第一天｜第二天」Tab
 * 5. transition 不显示手机 Demo，独立居中卡片
 *
 * guidedPhase 状态在 guided/free 切换时保留：
 * - scenario → free → guided：回到之前的 phase / step
 */
export default function UnifiedDemoStage({
  mode,
  onReturnHome,
  onSwitchToGuided,
  onSwitchToFree,
}: Props) {
  const [phase, setPhase] = useState<GuidedPhase>("intro");
  // 分别记住第一天 / 第二天的步骤索引，便于 transition 双向返回时恢复
  const [day1Index, setDay1Index] = useState(0);
  const [day2Index, setDay2Index] = useState(0);

  const enterDay1 = useCallback(() => setPhase("day1"), []);
  const enterDay2 = useCallback(() => {
    setDay2Index(0);
    setPhase("day2");
  }, []);
  const backToDay1 = useCallback(() => {
    setDay1Index(xiaochenDay1Scenario.steps.length - 1);
    setPhase("day1");
  }, []);

  const isDay2 = phase === "day2";
  const scenario = isDay2 ? xiaochenDay2Scenario : xiaochenDay1Scenario;
  const stepIndex = isDay2 ? day2Index : day1Index;
  const total = scenario.steps.length;
  const step = scenario.steps[stepIndex] ?? scenario.steps[0];

  const atStart = stepIndex <= 0;
  const atEnd = stepIndex >= total - 1;
  // 仅第二天末步才真正"完成 → 进入自由体验"；第一天末步下一步是 transition
  const isFinalEnd = isDay2 && atEnd;

  const next = useCallback(() => {
    if (phase === "day1") {
      if (atEnd) setPhase("transition");
      else setDay1Index((i) => Math.min(i + 1, xiaochenDay1Scenario.steps.length - 1));
    } else if (phase === "day2") {
      if (atEnd) onSwitchToFree();
      else setDay2Index((i) => Math.min(i + 1, xiaochenDay2Scenario.steps.length - 1));
    }
  }, [phase, atEnd, onSwitchToFree]);

  const prev = useCallback(() => {
    if (phase === "day1") {
      if (!atStart) setDay1Index((i) => Math.max(i - 1, 0));
    } else if (phase === "day2") {
      if (atStart) setPhase("transition");
      else setDay2Index((i) => Math.max(i - 1, 0));
    }
  }, [phase, atStart]);

  const goTo = useCallback(
    (index: number) => {
      if (phase === "day1") {
        setDay1Index(Math.max(0, Math.min(index, xiaochenDay1Scenario.steps.length - 1)));
      } else if (phase === "day2") {
        setDay2Index(Math.max(0, Math.min(index, xiaochenDay2Scenario.steps.length - 1)));
      }
    },
    [phase],
  );

  const showIntro = mode === "guided" && phase === "intro";
  const showTransition = mode === "guided" && phase === "transition";
  const showStage = mode === "guided" && (phase === "day1" || phase === "day2");

  const stageKey = useMemo(
    () => (showIntro ? "intro" : showTransition ? "transition" : "stage"),
    [showIntro, showTransition],
  );

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1120px] flex-col px-6 py-8">
      {/* 顶部弱导航：返回入口位于舞台左侧，模式切换器严格居中 */}
      <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-y-0">
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
      <div className="flex flex-1 flex-col justify-center mt-6">
        <AnimatePresence mode="wait">
          {showIntro ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: SOFT_EASE }}
            >
              <XiaochenCaseIntro onStart={enterDay1} />
            </motion.div>
          ) : showTransition ? (
            <motion.div
              key="transition"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: SOFT_EASE }}
            >
              <TwoWeekTransition onEnter={enterDay2} onBack={backToDay1} />
            </motion.div>
          ) : (
            <motion.div
              key={stageKey}
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
                          scenarioName={scenario.name}
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
                          isEnd={isFinalEnd}
                          onClick={isFinalEnd ? onSwitchToFree : next}
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

      {/* 固定高度控制槽：内容仅在 guided stage 显示，避免切换时上下漂移 */}
      {showStage && (
        <div className="min-h-[138px] lg:min-h-[61px]">
          {mode === "guided" && (
            <GuidedDemoControls
              atStart={atStart}
              atEnd={isFinalEnd}
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
  );
}
