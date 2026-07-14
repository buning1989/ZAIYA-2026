import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Volume2, VolumeX } from "lucide-react";
import { grantEnergy } from "@/data/userProfile";
import ZaizaiVideo, { ZAIZAI_RELIEF_VIDEO_SRC } from "./ZaizaiVideo";
import EnergyBadge from "./EnergyBadge";
import EnergyRewardFeedback, { type EnergyRewardEvent } from "./EnergyRewardFeedback";
import {
  BreathingCarousel,
  BREATHING_METHODS,
  BASE_MIN,
  INHALE_MAX,
  TOPUP_MAX,
} from "./BreathingCarousel";

const ease = [0.22, 1, 0.36, 1] as const;

/* —— 低动态版本（prefers-reduced-motion: reduce）——
 * 不关闭呼吸引导，仅缩小圆圈缩放幅度、移除模糊装饰；
 * 保留吸气 / 停住 / 呼气文字、倒计时与呼吸节奏。 */
const REDUCED_BASE_MIN = 0.9;
const REDUCED_INHALE_MAX = 1.0;
const REDUCED_TOPUP_MAX = 1.02;

function reduceScale(original: number): number {
  if (original === BASE_MIN) return REDUCED_BASE_MIN;
  if (original === INHALE_MAX) return REDUCED_INHALE_MAX;
  if (original === TOPUP_MAX) return REDUCED_TOPUP_MAX;
  return original;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

const SELECT_GUIDE_MESSAGES = [
  "先把肩膀放下来一点。",
  "不用做得标准，跟着节奏就好。",
  "感觉不舒服，随时停下。",
  "我们只做这一分钟。",
] as const;

const TICK_MS = 50;
const LONG_PRESS_MS = 700;
const LONG_PRESS_TICK_MS = 30;
const SELECT_GUIDE_INTERVAL_MS = 3200;
const BREATHING_BGM = "./assets/zaiya/breathing-bgm.mp3";

const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

type SubView = "select" | "practice" | "complete";
type PlayStatus = "playing" | "paused";

type Props = {
  /** 从呼吸法选择页返回 → 回到「缓解一下」能力项网格 */
  onBackToRelief: () => void;
  /** 完成页「回到首页」→ 回到 App 首页 */
  onGoHome: () => void;
  /** 预设呼吸法索引（从缓解首页 inline 进入时使用，默认 0） */
  initialMethodIndex?: number;
  /** 初始子视图（默认 select；从缓解首页 inline 进入时传 practice 跳过选择页） */
  initialSubView?: SubView;
  /** 练习中长按结束 / 停止确认退出 → 回到缓解主页并保持呼吸法展开 + 保留所选方法。
   *  未提供时回退到旧 select 子视图（仅非 inline 入口兜底，不再被实际入口触发）。 */
  onExitToRelief?: (methodIndex: number) => void;
};

export default function BreathingFlow({
  onBackToRelief,
  onGoHome,
  initialMethodIndex,
  initialSubView,
  onExitToRelief,
}: Props) {
  const prefersReducedMotion = usePrefersReducedMotion();
  // 派生初始值（prop 缺省时回退到旧默认：select + 第 0 个呼吸法）
  const initMethodIdx = initialMethodIndex ?? 0;
  const initMethod = BREATHING_METHODS[initMethodIdx];
  const initSubView: SubView = initialSubView ?? "select";

  const [subView, setSubView] = useState<SubView>(initSubView);
  const [methodIndex, setMethodIndex] = useState(initMethodIdx);
  const [activeCard, setActiveCard] = useState(initMethodIdx);
  const [guideIndex, setGuideIndex] = useState(0);
  const [prepCountdown, setPrepCountdown] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prepTimerRef = useRef<number | null>(null);

  // 练习态
  const [status, setStatus] = useState<PlayStatus>("playing");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [phaseRemainingMs, setPhaseRemainingMs] = useState(
    initMethod.phases[0].duration * 1000,
  );
  const remainingRef = useRef(initMethod.phases[0].duration * 1000);
  const timerRef = useRef<number | null>(null);

  // 停止确认浮层
  const [stopSheet, setStopSheet] = useState(false);
  const statusBeforeStop = useRef<PlayStatus>("playing");

  // —— 光反馈：底层仍沿用能量奖励数据 ——
  // 单次练习只发放一次：practiceIdRef 每次开始 / 重来时重新生成，
  // energyGrantedRef 防止完成页重复渲染造成重复发放；grantEnergy 再做幂等兜底。
  const [breathEnergyReward, setBreathEnergyReward] =
    useState<EnergyRewardEvent | null>(null);
  const [breathEnergyPulse, setBreathEnergyPulse] = useState(false);
  const breathBadgeRef = useRef<HTMLButtonElement | null>(null);
  const breathPulseTimer = useRef<number | null>(null);
  const breathRewardIdRef = useRef(0);
  const practiceIdRef = useRef<string>("");
  const energyGrantedRef = useRef(false);

  const method = BREATHING_METHODS[methodIndex];

  // 直接从 inline 入口进入练习态时，初始化练习 ID（正常流程由 startPractice 设置）
  useEffect(() => {
    if (initSubView === "practice" && !practiceIdRef.current) {
      practiceIdRef.current = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
    // initSubView 来自 props，组件生命周期内不变，仅在 mount 时执行一次
  }, [initSubView]);

  useEffect(() => {
    if (subView !== "practice" || status !== "playing" || stopSheet) {
      audioRef.current?.pause();
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.34;
    audio.muted = isMuted;

    if (!isMuted) {
      void audio.play().catch(() => {
        audio.muted = true;
        setIsMuted(true);
      });
    }
  }, [isMuted, status, stopSheet, subView]);

  const toggleAudio = () => {
    if (subView !== "practice") return;

    const nextMuted = !isMuted;
    const audio = audioRef.current;
    setIsMuted(nextMuted);

    if (!audio) return;
    audio.muted = nextMuted;
    if (!nextMuted) {
      void audio.play().catch(() => {
        audio.muted = true;
        setIsMuted(true);
      });
    }
  };

  useEffect(() => {
    if (subView !== "select") return;
    const guideTimer = window.setInterval(() => {
      setGuideIndex((i) => (i + 1) % SELECT_GUIDE_MESSAGES.length);
    }, SELECT_GUIDE_INTERVAL_MS);
    return () => window.clearInterval(guideTimer);
  }, [subView]);

  // —— 节奏引擎：仅在 practice + playing 时运行 ——
  useEffect(() => {
    if (subView !== "practice" || status !== "playing" || stopSheet) return;
    const tick = () => {
      remainingRef.current -= TICK_MS;
      if (remainingRef.current <= 0) {
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        // 推进到下一阶段 / 下一轮
        let nextPhase = phaseIndex + 1;
        let nextRound = roundIndex;
        if (nextPhase >= method.phases.length) {
          nextPhase = 0;
          nextRound += 1;
          if (nextRound >= method.rounds) {
            setSubView("complete");
            return;
          }
        }
        remainingRef.current = method.phases[nextPhase].duration * 1000;
        setPhaseRemainingMs(remainingRef.current);
        setPhaseIndex(nextPhase);
        setRoundIndex(nextRound);
      } else {
        setPhaseRemainingMs(remainingRef.current);
      }
    };
    timerRef.current = window.setInterval(tick, TICK_MS);
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [subView, status, stopSheet, phaseIndex, roundIndex, method]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (progressTimer.current) window.clearInterval(progressTimer.current);
      if (prepTimerRef.current) window.clearInterval(prepTimerRef.current);
      // 组件卸载时显式暂停背景音乐，避免依赖 DOM 移除导致部分浏览器继续播放
      audioRef.current?.pause();
    };
  }, []);

  // —— 完成态触发能量奖励 ——
  // 出现在呼吸练习完成反馈之后（完成页淡入 0.4s + 缓冲），避免同时出现多个浮层。
  // 单次练习只发放一次：energyGrantedRef 防重 + grantEnergy 幂等兜底。
  useEffect(() => {
    if (subView !== "complete") return;
    if (energyGrantedRef.current) return;
    if (!practiceIdRef.current) return;
    energyGrantedRef.current = true;

    const grantTimer = window.setTimeout(() => {
      const result = grantEnergy({
        source: "breathing_exercise_completed",
        sourceId: practiceIdRef.current,
      });
      if (result.granted) {
        breathRewardIdRef.current += 1;
        setBreathEnergyReward({
          id: breathRewardIdRef.current,
          occurredAt: Date.now(),
        });
      }
    }, 600);

    return () => window.clearTimeout(grantTimer);
  }, [subView]);

  // toast 整段动画结束：清空 event
  const handleBreathEnergyDone = useCallback(() => {
    setBreathEnergyReward(null);
  }, []);

  const handleBreathEnergyArrive = useCallback(() => {
    setBreathEnergyPulse(true);
    if (breathPulseTimer.current)
      window.clearTimeout(breathPulseTimer.current);
    breathPulseTimer.current = window.setTimeout(() => {
      setBreathEnergyPulse(false);
      breathPulseTimer.current = null;
    }, 420);
  }, []);

  useEffect(() => {
    return () => {
      if (breathPulseTimer.current)
        window.clearTimeout(breathPulseTimer.current);
    };
  }, []);

  const startPractice = (idx: number) => {
    setPrepCountdown(null);
    const m = BREATHING_METHODS[idx];
    setMethodIndex(idx);
    setPhaseIndex(0);
    setRoundIndex(0);
    remainingRef.current = m.phases[0].duration * 1000;
    setPhaseRemainingMs(remainingRef.current);
    setStatus("playing");
    setStopSheet(false);
    // 新练习会话：生成唯一练习 ID + 重置能量发放标记
    practiceIdRef.current = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    energyGrantedRef.current = false;
    setBreathEnergyReward(null);
    setSubView("practice");
  };

  const startPracticeAfterCountdown = (idx: number) => {
    if (prepTimerRef.current) window.clearInterval(prepTimerRef.current);

    let next = 3;
    setPrepCountdown(next);
    prepTimerRef.current = window.setInterval(() => {
      next -= 1;
      if (next <= 0) {
        if (prepTimerRef.current) {
          window.clearInterval(prepTimerRef.current);
          prepTimerRef.current = null;
        }
        startPractice(idx);
        return;
      }
      setPrepCountdown(next);
    }, 1000);
  };

  const restartPractice = () => {
    remainingRef.current = method.phases[0].duration * 1000;
    setPhaseRemainingMs(remainingRef.current);
    setPhaseIndex(0);
    setRoundIndex(0);
    setStatus("playing");
    setStopSheet(false);
    // 重来视为新的一次练习：重新生成 ID + 重置标记 + 清空上一次的能量反馈
    practiceIdRef.current = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    energyGrantedRef.current = false;
    setBreathEnergyReward(null);
    setSubView("practice");
  };

  const togglePlay = () => {
    setStatus((s) => (s === "playing" ? "paused" : "playing"));
  };

  // —— 长按底部按钮：触发停止确认 ——
  // 长按进度反馈：pressStartRef 记录按下时间戳，progressTimer 周期性更新
  // longPressProgress（0~1），达 100% 触发停止确认浮层；中途松手则进度回退为 0。
  const pressStartRef = useRef<number>(0);
  const progressTimer = useRef<number | null>(null);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const longFired = useRef(false);
  const suppressNextClick = useRef(false);

  const clearProgressTimer = () => {
    if (progressTimer.current !== null) {
      window.clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  const handlePointerDown = () => {
    longFired.current = false;
    pressStartRef.current = Date.now();
    progressTimer.current = window.setInterval(() => {
      const elapsed = Date.now() - pressStartRef.current;
      const ratio = Math.min(elapsed / LONG_PRESS_MS, 1);
      setLongPressProgress(ratio);
      if (ratio >= 1) {
        clearProgressTimer();
        progressTimer.current = null;
        longFired.current = true;
        suppressNextClick.current = true;
        statusBeforeStop.current = status;
        setStatus("paused");
        setStopSheet(true);
        setLongPressProgress(0);
      }
    }, LONG_PRESS_TICK_MS);
  };
  const cancelPress = () => {
    if (progressTimer.current !== null) {
      clearProgressTimer();
      progressTimer.current = null;
    }
    setLongPressProgress(0);
  };
  const handlePointerUp = () => {
    cancelPress();
  };
  const handleControlClick = () => {
    if (suppressNextClick.current) {
      suppressNextClick.current = false;
      return;
    }
    if (!longFired.current) {
      togglePlay();
    }
  };

  const continueFromStop = () => {
    setStopSheet(false);
    if (statusBeforeStop.current === "playing") {
      setStatus("playing");
    }
  };
  // 统一退出入口：长按结束 / 停止确认「结束」均走此方法。
  // 不再回到旧 select 选择页；显式回到缓解主页并保持呼吸法展开 + 保留所选方法。
  // 跳转前的 timer / 长按进度 / 暂停态清理由组件卸载时的 cleanup effect 兜底
  // （onExitToRelief 触发 setMode('reliefSelect') → 本组件卸载 → 清理 timerRef /
  // progressTimer / prepTimerRef 并暂停背景音乐）。
  const stopPractice = () => {
    setStopSheet(false);
    // 中断退出不发放完成奖励：energyGrantedRef 保持 false，complete 分支不会触发
    if (onExitToRelief) {
      onExitToRelief(methodIndex);
    } else {
      // 兜底：非 inline 入口（未提供 onExitToRelief）维持旧行为，避免破坏演示模式
      setSubView("select");
    }
  };

  // —— 当前 ring 缩放：按阶段进度插值 ——
  // 低动态模式下缩小缩放幅度，保留呼吸节奏引导
  const phase = method.phases[phaseIndex];
  const phaseMs = phase.duration * 1000;
  const rawPrevScale =
    method.phases[(phaseIndex - 1 + method.phases.length) % method.phases.length]
      .scale;
  const prevScale = prefersReducedMotion ? reduceScale(rawPrevScale) : rawPrevScale;
  const phaseScale = prefersReducedMotion ? reduceScale(phase.scale) : phase.scale;
  const progress = 1 - Math.min(phaseRemainingMs / phaseMs, 1);
  const ringScale =
    subView === "practice"
      ? prevScale + (phaseScale - prevScale) * easeInOut(progress)
      : prefersReducedMotion
        ? REDUCED_BASE_MIN
        : BASE_MIN;
  const countdown = Math.ceil(phaseRemainingMs / 1000);

  return (
    <motion.div
      key="breathing-flow"
      className="absolute inset-0 z-[55] bg-white"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <AnimatePresence mode="wait">
        {/* —— 呼吸法选择页 —— */}
        {subView === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease }}
            className="absolute inset-0 flex flex-col"
          >
            {/* 顶部返回入口 */}
            <button
              onClick={onBackToRelief}
              aria-label="返回"
              className="absolute left-5 top-12 z-10 grid h-11 w-11 place-items-center rounded-full text-ink-soft outline-none transition-colors hover:bg-line-soft hover:text-ink focus-visible:outline-none"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={1.8} />
            </button>

            {/* 在在与场景引导：左侧主视觉，右侧轻气泡。整体略下移，形成均衡三段结构上部 */}
            <div className="flex items-center gap-3 px-6 pt-[132px]">
              <ZaizaiVideo
                className="h-32 w-32 shrink-0"
                shadow={false}
              />
              <div className="relative mt-5 min-w-0 flex-1 rounded-[24px] border border-line bg-white/82 px-4 py-3 shadow-[0_14px_34px_-26px_rgba(39,51,31,0.45)]">
                <span className="absolute left-[-6px] top-[44%] h-3 w-3 -translate-y-1/2 rotate-45 border-b border-l border-line bg-white" />
                <AnimatePresence mode="wait">
                  <motion.p
                    key={SELECT_GUIDE_MESSAGES[guideIndex]}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.28, ease }}
                    className="relative text-[13px] leading-relaxed text-ink-soft"
                  >
                    {SELECT_GUIDE_MESSAGES[guideIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* 横滑卡片（意图优先 + 左右循环横滑）- 中部 */}
            <div className="mt-10 flex min-h-0 flex-1 flex-col justify-center">
              <BreathingCarousel
                methods={BREATHING_METHODS}
                activeIndex={activeCard}
                onActiveChange={setActiveCard}
              />
            </div>

            {/* 底部开始按钮：全局统一主行动色，水平居中 */}
            <div className="flex justify-center pb-8 pt-3">
              <button
                onClick={() => startPracticeAfterCountdown(activeCard)}
                disabled={prepCountdown !== null}
                className="min-w-[104px] rounded-full bg-action-primary px-12 py-3 text-[15px] font-medium tracking-wide text-action-primary-text transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-80"
              >
                {prepCountdown === null ? "开始" : `${prepCountdown}`}
              </button>
            </div>
          </motion.div>
        )}

        {/* —— 呼吸练习播放器 —— */}
        {subView === "practice" && (
          <motion.div
            key="practice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="absolute inset-0 flex flex-col items-center px-6 pb-10"
          >
            <audio ref={audioRef} src={BREATHING_BGM} autoPlay loop preload="auto" />

            <button
              type="button"
              onClick={toggleAudio}
              aria-label={isMuted ? "打开背景音乐" : "静音背景音乐"}
              className="absolute right-5 top-12 z-30 grid h-9 w-9 place-items-center rounded-full border border-line bg-white/82 text-ink-soft shadow-[0_12px_30px_-22px_rgba(39,51,31,0.55)] backdrop-blur-md transition-colors hover:border-ink-faint hover:bg-white hover:text-ink"
            >
              {isMuted ? (
                <VolumeX className="h-[18px] w-[18px]" strokeWidth={1.8} />
              ) : (
                <Volume2 className="h-[18px] w-[18px]" strokeWidth={1.8} />
              )}
            </button>

            {/* 顶部陪伴层：在在上移，把中心位置留给呼吸圆环。 */}
            <div className="pointer-events-none absolute left-1/2 top-[14%] -translate-x-1/2">
              <ZaizaiVideo
                className="h-24 w-24"
                shadow={false}
                src={ZAIZAI_RELIEF_VIDEO_SRC}
              />
            </div>

            {/* 视觉主区：中心只承载呼吸节奏，强化可感知的收缩与扩张。 */}
            <div className="flex min-h-0 flex-1 flex-col items-center justify-start pt-[clamp(225px,34vh,280px)]">
              {/* 呼吸圆环（内含阶段 + 倒计时） */}
              <div className="relative grid h-[300px] w-[300px] place-items-center">
                <div
                  className={`absolute h-[260px] w-[260px] rounded-full bg-line-soft/55 ${
                    prefersReducedMotion ? "" : "blur-[1px]"
                  }`}
                  style={{
                    transform: `scale(${ringScale})`,
                    transition: "transform 0.1s linear",
                  }}
                />
                <div
                  className="absolute h-[214px] w-[214px] rounded-full border border-line bg-card/70 shadow-[0_18px_60px_-38px_rgba(39,51,31,0.45)]"
                  style={{
                    transform: `scale(${ringScale})`,
                    transition: "transform 0.1s linear",
                  }}
                />
                {/* 圆环内部信息：阶段（上）+ 倒计时（下，视觉中心） */}
                <div className="relative z-10 flex flex-col items-center">
                  <p className="text-[14px] tracking-wide text-ink-soft">
                    {phase.label}
                  </p>
                  <span className="mt-1 font-display text-[56px] leading-none text-ink tabular-nums">
                    {countdown}
                  </span>
                </div>
              </div>

              {/* 轮次：弱化，紧贴圆环下方 */}
              <p className="mt-2 text-[12px] text-ink-faint">
                第 {roundIndex + 1} / {method.rounds} 轮
              </p>
            </div>

            {/* 控制辅助区：提醒文案 + 暂停按钮 + 长按结束 紧凑成组 */}
            <div className="mt-auto flex flex-col items-center">
              {/* 安全提示：浅灰绿小字，紧贴按钮上方 */}
              <p className="mb-4 text-center text-[11px] text-ink-faint/70">
                不舒服就停下，回到自然呼吸。
              </p>

              {/* 圆形 icon 按钮 + 外围环形进度条 */}
              <div className="relative grid h-16 w-16 place-items-center">
                {/* 长按外围环形进度条：从 0% 增长到 100% */}
                {longPressProgress > 0 && (
                  <svg
                    className="pointer-events-none absolute inset-0 h-16 w-16 -rotate-90"
                    viewBox="0 0 64 64"
                  >
                    <circle
                      cx="32"
                      cy="32"
                      r="30"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="text-ink/30"
                      strokeDasharray={`${2 * Math.PI * 30 * longPressProgress} ${2 * Math.PI * 30}`}
                    />
                  </svg>
                )}
                <button
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={cancelPress}
                  onPointerCancel={cancelPress}
                  onClick={handleControlClick}
                  aria-label={status === "playing" ? "暂停" : "继续"}
                  className="grid h-14 w-14 place-items-center rounded-full border border-line bg-white text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
                >
                  <span className="text-[20px] leading-none">
                    {status === "playing" ? "Ⅱ" : "▶"}
                  </span>
                </button>
              </div>
              <p className="mt-2.5 text-[11px] text-ink-faint/70">长按结束</p>
            </div>
          </motion.div>
        )}

        {/* —— 完成页 —— */}
        {subView === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="absolute inset-0 flex flex-col items-center justify-center px-8"
          >
            <ZaizaiVideo className="h-24 w-24" shadow={false} />

            <p className="mt-8 text-center text-[15px] leading-relaxed text-ink-soft">
              完成了，先回到自然呼吸。
            </p>

            <div className="mt-12 flex w-full max-w-[260px] flex-col items-center gap-3">
              <button
                onClick={restartPractice}
                className="h-11 w-full rounded-full bg-ink text-[14px] font-medium tracking-wide text-canvas transition-opacity hover:opacity-90"
              >
                再来一次
              </button>
              <button
                onClick={onGoHome}
                className="text-[13px] text-ink-faint underline-offset-4 transition-colors hover:text-ink-soft hover:underline"
              >
                回到首页
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* —— 停止确认浮层 —— */}
      <AnimatePresence>
        {stopSheet && (
          <>
            <motion.div
              key="stop-backdrop"
              className="absolute inset-0 z-40 bg-ink/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease }}
              onClick={continueFromStop}
            />
            <motion.div
              key="stop-sheet"
              className="absolute inset-x-0 bottom-0 z-50 rounded-t-[28px] bg-white px-6 pb-9 pt-6"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <p className="text-center text-[15px] text-ink">
                结束这次呼吸？
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={continueFromStop}
                  className="h-11 w-full rounded-full bg-line-soft text-[14px] font-medium text-ink transition-colors hover:bg-line"
                >
                  继续
                </button>
                <button
                  onClick={stopPractice}
                  className="h-11 w-full text-[14px] text-ink-faint transition-colors hover:text-ink-soft"
                >
                  结束
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 右上角我的光入口：练习中隐藏，完成反馈时作为光粒目标。 */}
      {subView !== "practice" && (
        <EnergyBadge
          pulse={breathEnergyPulse}
          buttonRef={breathBadgeRef}
          position="floating"
        />
      )}
      {/* 光反馈：完成有效行动后飞向右上角入口 */}
      <EnergyRewardFeedback
        event={breathEnergyReward}
        targetRef={breathBadgeRef}
        onArrive={handleBreathEnergyArrive}
        onDone={handleBreathEnergyDone}
      />
    </motion.div>
  );
}
