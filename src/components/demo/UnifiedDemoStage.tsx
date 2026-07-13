import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TouchEvent as ReactTouchEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GuidedModeSwitch from "./GuidedModeSwitch";
import GuidedStoryPanel from "./GuidedStoryPanel";
import GuidedDemoControls, { NavArrow } from "./GuidedDemoControls";
import XiaochenCaseIntro from "./XiaochenCaseIntro";
import DayOneSummaryPage from "./DayOneSummaryPage";
import TwoWeekTransition from "./TwoWeekTransition";
import ConsultationPrepPage from "./ConsultationPrepPage";
import ConclusionSummaryPage from "./ConclusionSummaryPage";
import DemoPhoneFrame, { type WidgetLaunchStage } from "./DemoPhoneFrame";
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
 * intro         → 案例介绍（第 0 页）
 * day1          → 第一天 1/7 … 7/7
 * day1-summary  → 第一天结束总结页
 * week2-intro   → 两周后开场页
 * day2          → 小晨两周后 1/9 … 9/9
 * consultation  → 复诊整理页
 * conclusion    → 结尾总结页（最后一页，只显示左箭头）
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
  | "consultation"
  | "conclusion";

/* 阶段页：无手机 Demo、无分页圆点，但保留左右箭头 */
const PHASE_PAGES: GuidedPhase[] = [
  "intro",
  "day1-summary",
  "week2-intro",
  "consultation",
  "conclusion",
];

function isPhasePage(phase: GuidedPhase): boolean {
  return PHASE_PAGES.includes(phase);
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
  // 小组件启动 App 的子状态（仅服务于 06:40 → 07:35 的页面切换）
  const [launchStage, setLaunchStage] = useState<WidgetLaunchStage>("desktop");

  // 检测 prefers-reduced-motion：减少动态模式下跳过缩放动画
  const prefersReducedMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );

  // 跟踪上一步以检测 06:40 → 07:35 的过渡
  const prevStepRef = useRef<{ phase: GuidedPhase; day1Index: number }>({
    phase: "intro",
    day1Index: 0,
  });

  const isDay2 = phase === "day2";
  const scenario = isDay2 ? xiaochenDay2Scenario : xiaochenDay1Scenario;
  const stepIndex = isDay2 ? day2Index : day1Index;
  const total = scenario.steps.length;
  const step = scenario.steps[stepIndex] ?? scenario.steps[0];

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
      if (atEnd) setPhase("consultation");
      else setDay2Index((i) => Math.min(i + 1, xiaochenDay2Scenario.steps.length - 1));
    } else if (phase === "consultation") {
      setPhase("conclusion");
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
    } else if (phase === "consultation") {
      setDay2Index(xiaochenDay2Scenario.steps.length - 1);
      setPhase("day2");
    } else if (phase === "conclusion") {
      setPhase("consultation");
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
  const showConsultation = mode === "guided" && phase === "consultation";
  const showConclusion = mode === "guided" && phase === "conclusion";
  const showStage = mode === "guided" && (phase === "day1" || phase === "day2");

  // 阶段页（无手机 Demo、无圆点，但保留左右箭头）
  const showPhasePage = mode === "guided" && isPhasePage(phase);

  /* —— 小组件启动 App 的过渡序列 ——
   * 检测 day1[0] → day1[1] 的过渡，自动播放：
   *   desktop → launching → home → dialog
   *
   * 时序：
   * - 正常模式：launching 500ms（按压+放大）→ home 1000ms（首页停留）→ dialog
   * - 减少动态模式：跳过 launching，home 900ms → dialog
   *
   * 返回 day1[0] 时重置为 desktop。
   * 其他 day1 步骤（非从 [0] 过来）直接设为 dialog，不播放启动动画。
   * 计时器在卸载、返回或快速切换时由 cleanup 清理。
   */
  useEffect(() => {
    const prev = prevStepRef.current;
    const cameFromWidget = prev.phase === "day1" && prev.day1Index === 0;
    const goingToStep1 = phase === "day1" && day1Index === 1;

    const timers: ReturnType<typeof setTimeout>[] = [];

    if (phase === "day1" && day1Index === 0) {
      // 在 widget 步骤：重置为桌面
      setLaunchStage("desktop");
    } else if (cameFromWidget && goingToStep1) {
      // 从 06:40 过渡到 07:35：播放启动序列
      if (prefersReducedMotion.current) {
        // 减少动态：直接淡入首页，停留后进入对话
        setLaunchStage("home");
        const t = setTimeout(() => setLaunchStage("dialog"), 900);
        timers.push(t);
      } else {
        // 正常模式：按压+放大 → 首页停留 → 对话
        setLaunchStage("launching");
        const t1 = setTimeout(() => setLaunchStage("home"), 500);
        const t2 = setTimeout(() => setLaunchStage("dialog"), 500 + 1000);
        timers.push(t1, t2);
      }
    } else if (phase === "day1" && day1Index >= 1) {
      // 在 day1[1+] 但非从 widget 过来（如圆点跳转）：直接显示对话
      setLaunchStage("dialog");
    }

    prevStepRef.current = { phase, day1Index };

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [phase, day1Index]);

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
            : showConsultation
              ? "consultation"
              : showConclusion
                ? "conclusion"
                : "stage",
    [showIntro, showDay1Summary, showWeek2Intro, showConsultation, showConclusion],
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
      <div className="mt-6 flex flex-1 flex-col justify-center">
        <AnimatePresence mode="wait">
          {showIntro ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: SOFT_EASE }}
            >
              <div className="flex items-center gap-4 lg:gap-8">
                {/* intro 无左箭头 */}
                <div className="hidden h-12 w-12 shrink-0 lg:block" aria-hidden="true" />
                <div className="flex-1">
                  <XiaochenCaseIntro />
                </div>
                {/* 右箭头：进入 day1[0] */}
                <div className="hidden h-12 w-12 shrink-0 lg:block">
                  <NavArrow direction="right" disabled={false} onClick={next} />
                </div>
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
              <div className="flex items-center gap-4 lg:gap-8">
                <div className="hidden h-12 w-12 shrink-0 lg:block">
                  <NavArrow direction="left" disabled={false} onClick={prev} />
                </div>
                <div className="flex-1">
                  <DayOneSummaryPage />
                </div>
                <div className="hidden h-12 w-12 shrink-0 lg:block">
                  <NavArrow direction="right" disabled={false} onClick={next} />
                </div>
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
              <div className="flex items-center gap-4 lg:gap-8">
                <div className="hidden h-12 w-12 shrink-0 lg:block">
                  <NavArrow direction="left" disabled={false} onClick={prev} />
                </div>
                <div className="flex-1">
                  <TwoWeekTransition />
                </div>
                <div className="hidden h-12 w-12 shrink-0 lg:block">
                  <NavArrow direction="right" disabled={false} onClick={next} />
                </div>
              </div>
            </motion.div>
          ) : showConsultation ? (
            <motion.div
              key="consultation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: SOFT_EASE }}
            >
              <div className="flex items-center gap-4 lg:gap-8">
                <div className="hidden h-12 w-12 shrink-0 lg:block">
                  <NavArrow direction="left" disabled={false} onClick={prev} />
                </div>
                <div className="flex-1">
                  <ConsultationPrepPage />
                </div>
                <div className="hidden h-12 w-12 shrink-0 lg:block">
                  <NavArrow direction="right" disabled={false} onClick={next} />
                </div>
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
              <div className="flex items-center gap-4 lg:gap-8">
                <div className="hidden h-12 w-12 shrink-0 lg:block">
                  <NavArrow direction="left" disabled={false} onClick={prev} />
                </div>
                <div className="flex-1">
                  <ConclusionSummaryPage />
                </div>
                {/* conclusion 只显示左箭头，不显示右箭头 */}
                <div className="hidden h-12 w-12 shrink-0 lg:block" aria-hidden="true" />
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
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[48px_390px_420px_48px] lg:gap-x-24 lg:gap-y-0">
                {/* 左箭头 */}
                <div className="hidden h-12 w-12 items-center justify-center lg:flex lg:col-start-1">
                  <NavArrow direction="left" disabled={false} onClick={prev} />
                </div>

                {/* 手机 Demo */}
                <div className="justify-self-center lg:col-start-2">
                  <DemoPhoneFrame
                    demoState={mode === "guided" ? step.demoState : undefined}
                    launchStage={phase === "day1" ? launchStage : undefined}
                    widgetTime={phase === "day1" && day1Index === 0 ? step.time : undefined}
                  />
                </div>

                {/* 说明面板 */}
                <div className="w-full lg:col-start-3 lg:h-full">
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

                {/* 右箭头 */}
                <div className="hidden h-12 w-12 items-center justify-center lg:flex lg:col-start-4">
                  <NavArrow direction="right" disabled={false} onClick={next} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部控制槽：仅 stage 显示进度点 */}
      {showStage && (
        <div className="min-h-[138px] lg:min-h-[61px]">
          {mode === "guided" && (
            <GuidedDemoControls total={total} stepIndex={stepIndex} onGoTo={goTo} />
          )}
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
