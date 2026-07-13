import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TouchEvent as ReactTouchEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import GuidedModeSwitch from "./GuidedModeSwitch";
import GuidedStoryPanel from "./GuidedStoryPanel";
import GuidedDemoControls, { NavArrow } from "./GuidedDemoControls";
import XiaochenCaseIntro from "./XiaochenCaseIntro";
import DayOneSummaryPage from "./DayOneSummaryPage";
import TwoWeekTransition from "./TwoWeekTransition";
import ConclusionSummaryPage from "./ConclusionSummaryPage";
import DemoPhoneFrame from "./DemoPhoneFrame";
import DemoWatchFrame from "./DemoWatchFrame";
import DemoSleepRecordFlow from "./DemoSleepRecordFlow";
import FreeExperiencePanel from "./FreeExperiencePanel";
import { xiaochenDay1Scenario } from "./scenarios/xiaochenDay1";
import { xiaochenDay2Scenario } from "./scenarios/xiaochenDay2";
import type { DialogItem } from "./types";
import { SOFT_EASE } from "@/lib/motionVariants";

type Props = {
  mode: "guided" | "free";
  onReturnHome: () => void;
  onSwitchToGuided: () => void;
  onSwitchToFree: () => void;
};

/* —— 线性叙事相位 ——
 * intro         → 案例介绍（第 0 页）
 * day1          → 第一天 1/5 … 5/5
 * day1-summary  → 第一天结束总结页
 * week2-intro   → 两周后开场页
 * day2          → 小晨两周后 1/5 … 5/5
 * conclusion    → 结尾总结页（最后一页，只显示左箭头）
 *
 * 注：独立复诊整理页已移除，第二周第 5 节点直接进入最终总结。
 *
 * 所有阶段统一使用左右箭头 / 键盘 ← → / 移动端左右滑动切换。
 * 不再设置任何用于推进流程的 CTA 按钮。
 */
type GuidedPhase =
  | "intro"
  | "day1"
  | "day1-summary"
  | "week2-intro"
  | "day2"
  | "conclusion";

/* 阶段页：无手机 Demo、无分页圆点，但保留左右箭头 */
const PHASE_PAGES: GuidedPhase[] = [
  "day1-summary",
  "week2-intro",
  "conclusion",
];

function isPhasePage(phase: GuidedPhase): boolean {
  return PHASE_PAGES.includes(phase);
}

/* 根据已显示的消息条数，构造部分对话列表
 * 时间分隔条始终保留；消息条目按 revealCount 截取
 */
function revealDialogItems(
  items: DialogItem[] | undefined,
  revealCount: number,
): DialogItem[] | undefined {
  if (!items) return undefined;
  if (revealCount <= 0) {
    // 只保留时间分隔条
    return items.filter((item) => item.kind === "time");
  }
  let msgShown = 0;
  return items.filter((item) => {
    if (item.kind === "time") return true;
    msgShown += 1;
    return msgShown <= revealCount;
  });
}

/* 移动端滑动水平阈值（px） */
const SWIPE_THRESHOLD = 50;

export default function UnifiedDemoStage({
  mode,
  onReturnHome,
  onSwitchToGuided,
  onSwitchToFree,
}: Props) {
  const [phase, setPhase] = useState<GuidedPhase>("intro");
  const [day1Index, setDay1Index] = useState(0);
  const [day2Index, setDay2Index] = useState(0);

  /* —— Guided Demo 自动演示序列 ——
   * 07:35（day1[1]）：对话逐条出现 → 自动进入呼吸练习
   * 01:30（day1[4]）：深夜对话逐条出现（更慢节奏）
   *
   * dialogRevealCount：当前已显示的对话条数
   * dialogDone：对话是否全部出现
   * showBreathing：07:35 是否已切换到呼吸练习
   *
   * 进入这些节点时重置为初始状态；
   * 离开或快速切换时由 effect cleanup 清理计时器。
   */
  const [dialogRevealCount, setDialogRevealCount] = useState(0);
  const [showBreathing, setShowBreathing] = useState(false);

  const isDialogRevealNode =
    phase === "day1" && (day1Index === 1 || day1Index === 4);
  const isBreakdownNode = phase === "day1" && day1Index === 1;
  const isInsomniaNode = phase === "day1" && day1Index === 4;

  const isDay2 = phase === "day2";
  const scenario = isDay2 ? xiaochenDay2Scenario : xiaochenDay1Scenario;
  const stepIndex = isDay2 ? day2Index : day1Index;
  const total = scenario.steps.length;
  const step = scenario.steps[stepIndex] ?? scenario.steps[0];

  /* —— 第二周 06:40 节点：气泡点击 → 角落星星反馈 ——
   * starCollected：评委是否已点击气泡（星星是否已出现）
   * - 仅在 day2[0] 生效；进入 / 返回该节点时重置为 false
   * - 点击后星星从气泡附近移动到屏幕角落，停留至离开节点
   * - 重复点击不生成多颗星星、不累计、不重播动画
   * - Guided Demo 状态完全隔离，不影响自由体验模式
   */
  const [starCollected, setStarCollected] = useState(false);
  const isDay2WakeLookNode = phase === "day2" && day2Index === 0;
  const isDay2SelfRecordNode = phase === "day2" && day2Index === 1;
  const reducedMotion = useReducedMotion();

  // 进入 / 返回 day2[0] 时重置星星状态
  useEffect(() => {
    if (isDay2WakeLookNode) {
      setStarCollected(false);
    }
  }, [isDay2WakeLookNode, reducedMotion]);

  const atStart = stepIndex <= 0;
  const atEnd = stepIndex >= total - 1;

  const next = useCallback(() => {
    if (phase === "intro") {
      setDay1Index(0);
      setPhase("day1");
    } else if (phase === "day1") {
      if (atEnd) setPhase("day1-summary");
      else setDay1Index((i) => Math.min(i + 1, xiaochenDay1Scenario.steps.length - 1));
    } else if (phase === "day1-summary") {
      setPhase("week2-intro");
    } else if (phase === "week2-intro") {
      setDay2Index(0);
      setPhase("day2");
    } else if (phase === "day2") {
      if (atEnd) setPhase("conclusion");
      else setDay2Index((i) => Math.min(i + 1, xiaochenDay2Scenario.steps.length - 1));
    }
    // conclusion：无下一页
  }, [phase, atEnd]);

  const prev = useCallback(() => {
    if (phase === "day1") {
      if (atStart) setPhase("intro");
      else setDay1Index((i) => Math.max(i - 1, 0));
    } else if (phase === "day1-summary") {
      setDay1Index(xiaochenDay1Scenario.steps.length - 1);
      setPhase("day1");
    } else if (phase === "week2-intro") {
      setPhase("day1-summary");
    } else if (phase === "day2") {
      if (atStart) setPhase("week2-intro");
      else setDay2Index((i) => Math.max(i - 1, 0));
    } else if (phase === "conclusion") {
      setDay2Index(xiaochenDay2Scenario.steps.length - 1);
      setPhase("day2");
    }
    // intro：无上一页
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
  const showDay1Summary = mode === "guided" && phase === "day1-summary";
  const showWeek2Intro = mode === "guided" && phase === "week2-intro";
  const showConclusion = mode === "guided" && phase === "conclusion";
  const showGuidedNav = mode === "guided";

  // 阶段页（无手机 Demo、无圆点，但保留左右箭头）
  const showPhasePage = mode === "guided" && isPhasePage(phase);

  const showDay1Progress = mode === "guided" && (phase === "intro" || phase === "day1");
  const showGuidedControls = showDay1Progress || (mode === "guided" && phase === "day2");
  const guidedControlsTotal = showDay1Progress
    ? xiaochenDay1Scenario.steps.length + 1
    : total;
  const guidedControlsIndex =
    phase === "intro" ? 0 : phase === "day1" ? day1Index + 1 : stepIndex;

  const goToGuidedProgress = useCallback(
    (index: number) => {
      if (phase === "intro" || phase === "day1") {
        const clampedIndex = Math.max(0, Math.min(index, xiaochenDay1Scenario.steps.length));
        if (clampedIndex === 0) {
          setPhase("intro");
          return;
        }
        setDay1Index(clampedIndex - 1);
        setPhase("day1");
        return;
      }

      goTo(index);
    },
    [phase, goTo],
  );

  /* —— 对话自动逐条出现 ——
   * 07:35（day1[1]）：短消息 400ms，长消息 750ms，对话全部出现后停留
   * 01:30（day1[4]）：短消息 600ms，长消息 1100ms（深夜更慢）
   * 减少动态模式：直接显示全部对话
   *
   * 注意：07:35 不再自动进入呼吸练习，改为评委主动点击呼吸入口。
   */
  const prefersReducedDialogMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (!isDialogRevealNode) return;
    // 重置状态
    setDialogRevealCount(0);
    setShowBreathing(false);

    const fullDialog = step.demoState?.dialogItems ?? [];
    const messageItems = fullDialog.filter((item) => item.kind === "message");
    const totalCount = messageItems.length;

    if (prefersReducedDialogMotion.current) {
      setDialogRevealCount(totalCount);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const shortDelay = isInsomniaNode ? 600 : 400;
    const longDelay = isInsomniaNode ? 1100 : 750;

    let elapsed = 0;
    messageItems.forEach((item, idx) => {
      if (idx === 0) {
        elapsed = 200;
      } else {
        const prevItem = messageItems[idx - 1];
        const text = "text" in prevItem ? prevItem.text : "";
        elapsed += text.length > 20 ? longDelay : shortDelay;
      }
      const t = setTimeout(() => {
        setDialogRevealCount(idx + 1);
      }, elapsed);
      timers.push(t);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [phase, day1Index, isDialogRevealNode, isInsomniaNode, step.demoState?.dialogItems, prefersReducedDialogMotion]);

  // 07:35 呼吸入口是否显示：对话全部出现后显示
  const fullMessageCount = step.demoState?.dialogItems?.filter((i) => i.kind === "message").length ?? 0;
  const dialogAllShown = dialogRevealCount >= fullMessageCount;
  const showBreathingEntry = isBreakdownNode && dialogAllShown && !showBreathing;

  // 统一键盘事件：覆盖所有 guided 阶段
  useEffect(() => {
    if (mode !== "guided") return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft") {
        if (phase === "intro") return; // intro 无上一页
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        if (phase === "conclusion") return; // conclusion 无下一页
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, phase, prev, next]);

  // 移动端左右滑动
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const onTouchStart = useCallback(
    (e: ReactTouchEvent<HTMLDivElement>) => {
      if (mode !== "guided") return;
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
    },
    [mode],
  );

  const onTouchEnd = useCallback(
    (e: ReactTouchEvent<HTMLDivElement>) => {
      if (mode !== "guided") return;
      if (touchStartX.current === null || touchStartY.current === null) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartX.current;
      const dy = touch.clientY - touchStartY.current;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      touchStartX.current = null;
      touchStartY.current = null;
      // 水平距离需超过阈值，且大于垂直距离（避免误触发纵向滚动）
      if (absDx < SWIPE_THRESHOLD || absDx < absDy) return;
      if (dx > 0) {
        // 向右滑 = 上一页
        if (phase !== "intro") prev();
      } else {
        // 向左滑 = 下一页
        if (phase !== "conclusion") next();
      }
    },
    [mode, phase, prev, next],
  );

  const stageKey = useMemo(
    () =>
      showIntro
        ? "intro"
        : showDay1Summary
          ? "day1-summary"
          : showWeek2Intro
            ? "week2-intro"
            : showConclusion
              ? "conclusion"
              : "stage",
    [showIntro, showDay1Summary, showWeek2Intro, showConclusion],
  );

  return (
    <div
      className="mx-auto flex min-h-full w-full max-w-[1120px] flex-col px-6 py-8"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
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

      {/* 主内容区 */}
      <div className="relative mt-6 flex flex-1 flex-col justify-center">
        {showGuidedNav && (
          <div className="pointer-events-none absolute inset-y-0 z-20 hidden items-center justify-between lg:-left-10 lg:-right-10 lg:flex xl:-left-20 xl:-right-20 2xl:-left-28 2xl:-right-28">
            <div className="pointer-events-auto">
              <NavArrow direction="left" disabled={phase === "intro"} onClick={prev} />
            </div>
            <div className="pointer-events-auto">
              <NavArrow direction="right" disabled={phase === "conclusion"} onClick={next} />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {showIntro ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: SOFT_EASE }}
            >
              <div className="lg:px-20">
                <XiaochenCaseIntro />
              </div>
            </motion.div>
          ) : showDay1Summary ? (
            <motion.div
              key="day1-summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: SOFT_EASE }}
            >
              <div className="lg:px-20">
                <DayOneSummaryPage />
              </div>
            </motion.div>
          ) : showWeek2Intro ? (
            <motion.div
              key="week2-intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: SOFT_EASE }}
            >
              <div className="lg:px-20">
                <TwoWeekTransition />
              </div>
            </motion.div>
          ) : showConclusion ? (
            <motion.div
              key="conclusion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: SOFT_EASE }}
            >
              <div className="lg:px-20">
                <ConclusionSummaryPage />
              </div>
            </motion.div>
          ) : mode === "free" ? (
            <motion.div
              key="free"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: SOFT_EASE }}
            >
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[390px_420px] lg:justify-center lg:gap-x-24 lg:gap-y-0">
                <div className="justify-self-center">
                  <DemoPhoneFrame />
                </div>

                <div className="w-full lg:h-full">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key="free-panel"
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 24 }}
                      transition={{ duration: 0.32, ease: SOFT_EASE }}
                      className="h-full"
                    >
                      <FreeExperiencePanel />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={stageKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: SOFT_EASE }}
            >
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[390px_420px] lg:justify-center lg:gap-x-16 lg:gap-y-0 lg:px-10 xl:gap-x-24 xl:px-20">
                {/* 设备 Demo：06:40 桌面小组件 / 12:00 手表 / 其他 手机 App */}
                <div className="relative justify-self-center lg:col-start-1">
                  {phase === "day1" && day1Index === 0 ? (
                    <DemoPhoneFrame
                      showWidget
                      widgetTime={step.time}
                    />
                  ) : phase === "day1" && day1Index === 2 ? (
                    <DemoWatchFrame time={step.time} />
                  ) : phase === "day1" && day1Index === 1 && showBreathing ? (
                    <DemoPhoneFrame
                      demoState={mode === "guided" ? step.secondaryDemoState : undefined}
                    />
                  ) : isDialogRevealNode && mode === "guided" && step.demoState ? (
                    <DemoPhoneFrame
                      demoState={{
                        ...step.demoState,
                        dialogItems: revealDialogItems(step.demoState.dialogItems, dialogRevealCount),
                      }}
                      dialogActionCard={
                        showBreathingEntry
                          ? {
                              title: "和在在一起缓一缓",
                              description: "呼气长一点，让身体先慢下来。",
                              actionLabel: "开始呼吸练习",
                              onClick: () => setShowBreathing(true),
                            }
                          : undefined
                      }
                    />
                  ) : isDay2WakeLookNode && mode === "guided" ? (
                    /* 第二周 06:40：首页气泡可点击 → 角落星星反馈 */
                    <DemoPhoneFrame
                      demoState={step.demoState}
                      onDemoBubbleClick={() => setStarCollected(true)}
                      overlay={
                        starCollected ? (
                          <motion.div
                            className="pointer-events-none absolute z-40"
                            initial={
                              reducedMotion
                                ? { top: "5%", left: "90%", x: "-50%", opacity: 1, scale: 1 }
                                : { top: "22%", left: "50%", x: "-50%", opacity: 0, scale: 0.3 }
                            }
                            animate={{ top: "5%", left: "90%", x: "-50%", opacity: 1, scale: 1 }}
                            transition={{ duration: reducedMotion ? 0 : 0.8, ease: "easeInOut" }}
                          >
                            <Star
                              className="h-4 w-4 text-ink-soft"
                              fill="currentColor"
                              strokeWidth={0}
                            />
                          </motion.div>
                        ) : null
                      }
                    />
                  ) : isDay2SelfRecordNode && mode === "guided" ? (
                    /* 第二周 10:00：睡眠记录确认 → 结果态（内部两状态流程） */
                    <DemoPhoneFrame
                      demoState={step.demoState}
                      overlay={<DemoSleepRecordFlow />}
                    />
                  ) : (
                    <DemoPhoneFrame
                      demoState={mode === "guided" ? step.demoState : undefined}
                    />
                  )}
                </div>

                {/* 说明面板 */}
                <div className="w-full lg:col-start-2 lg:h-full">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={mode}
                      initial={{ opacity: 0, x: mode === "guided" ? -24 : 24 }}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部控制槽：intro + 第一天节点共用进度点；day2 保持自身进度点 */}
      {showGuidedControls && (
        <div className="min-h-[138px] lg:min-h-[61px]">
          <GuidedDemoControls
            total={guidedControlsTotal}
            stepIndex={guidedControlsIndex}
            onGoTo={goToGuidedProgress}
          />
        </div>
      )}

      {/* 阶段页键盘/滑动提示 */}
      {showPhasePage && (
        <p className="mt-4 text-center text-[12px] text-ink-faint">
          键盘 ← / → 或左右滑动切换
        </p>
      )}
    </div>
  );
}
