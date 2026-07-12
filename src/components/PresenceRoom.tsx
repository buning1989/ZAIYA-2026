import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  Moon,
  Utensils,
  BookOpen,
  ChevronLeft,
} from "lucide-react";
import { CollapseButton } from "./FeaturePageTransition";

const ease = [0.22, 1, 0.36, 1] as const;

/* —— 轻社交场景配置 ——
 * Demo 阶段仅开放「一起发呆」「一起吃饭」；「一起睡」「一起学习」暂未开放。
 * 已移除原「一起上课」场景。 */
export type SceneId = "daze" | "eat" | "sleep" | "study";

type SceneConfig = {
  id: SceneId;
  label: string;
  desc: string;
  Icon: LucideIcon;
  open: boolean;
};

export const scenes: SceneConfig[] = [
  {
    id: "daze",
    label: "一起发呆",
    desc: "什么也不用做，待一会儿。",
    Icon: Cloud,
    open: true,
  },
  {
    id: "eat",
    label: "一起吃饭",
    desc: "围坐一桌，慢慢吃。",
    Icon: Utensils,
    open: true,
  },
  {
    id: "sleep",
    label: "一起睡",
    desc: "安静的夜晚，各自安睡。",
    Icon: Moon,
    open: false,
  },
  {
    id: "study",
    label: "一起学习",
    desc: "各自专注，偶尔抬头。",
    Icon: BookOpen,
    open: false,
  },
];

const CLOSED_TOAST = "Demo 阶段暂未开放";

/**
 * 轻社交场景选择内容层（在 AppMainSurface 内部渲染）。
 *
 * ZaiZai 由 AppMainSurface 上移到中上部并保留气泡；
 * 本组件只渲染下方 2×2 场景卡片 + 收起按钮。
 * 开放场景点击后进入对应流程；关闭场景点击仅轻提示。
 */
export function SocialSceneSelectContent({
  onSelect,
  onClose,
}: {
  onSelect: (s: SceneId) => void;
  onClose: () => void;
}) {
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1600);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const handleClick = (s: SceneConfig) => {
    if (!s.open) {
      showToast(CLOSED_TOAST);
      return;
    }
    onSelect(s.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease }}
      className="absolute inset-0"
    >
      {/* 场景卡片：位于 ZaiZai 下方 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.35, ease, delay: 0.05 }}
        className="absolute inset-x-0 px-6"
        style={{ top: "52%" }}
      >
        <div className="grid grid-cols-2 gap-3">
          {scenes.map((s) => (
            <button
              key={s.id}
              onClick={() => handleClick(s)}
              className={`relative flex flex-col items-start gap-2 rounded-2xl border bg-white p-4 text-left transition-colors ${
                s.open
                  ? "border-line hover:border-ink-faint"
                  : "border-line/60 opacity-60 hover:border-line/60"
              }`}
            >
              <s.Icon
                className={`h-6 w-6 ${
                  s.open ? "text-ink-soft" : "text-ink-faint"
                }`}
                strokeWidth={1.6}
              />
              <div>
                <div
                  className={`text-[14px] font-medium ${
                    s.open ? "text-ink" : "text-ink-faint"
                  }`}
                >
                  {s.label}
                </div>
                <div className="mt-0.5 text-[11px] leading-relaxed text-ink-faint">
                  {s.desc}
                </div>
              </div>
              {!s.open && (
                <span className="absolute right-3 top-3 rounded-full bg-line-soft px-2 py-0.5 text-[10px] text-ink-faint">
                  暂未开放
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 底部中央收起按钮 */}
      <CollapseButton onClick={onClose} ariaLabel="收起轻社交" />

      {/* 关闭场景轻提示 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="social-toast"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease }}
            className="pointer-events-none absolute bottom-24 left-1/2 z-[9999] -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/85 px-4 py-2 text-[12px] text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* —— 「一起发呆」动作配置 —— */
type DazePosture = {
  id: string;
  label: string;
  src: string;
};

const dazePostures: DazePosture[] = [
  {
    id: "shake-head",
    label: "轻轻摇头",
    src: "/assets/social/daze/action-shake-head.gif",
  },
  {
    id: "quick-idle",
    label: "安静坐着",
    src: "/assets/social/daze/action-quick-idle.gif",
  },
  {
    id: "lean-back",
    label: "往后靠着",
    src: "/assets/social/daze/action-lean-back.gif",
  },
];

const SCENE_GIF = "/assets/social/daze/scene-together-1.gif";

/**
 * 「一起发呆」完整流程（准备态 → 正式发呆态 → 长按退出）。
 *
 * 新流程：点击「一起发呆」后直接进入沉浸场景，先在场景内的准备态中
 * 通过横滑选择发呆动作，确认后进入正式发呆态。
 * 正式态仅保留沉浸画面 + 左上角共在动态 + 底部状态文案 + 透明圆形长按退出。
 *
 * - onExit：准备态返回（无能量）
 * - onFinish：正式发呆态长按结束（触发能量奖励并返回）
 */
export function DazeFlow({
  onExit,
  onFinish,
}: {
  onExit: () => void;
  onFinish: () => void;
}) {
  const [phase, setPhase] = useState<"ready" | "dazing">("ready");
  const [selected, setSelected] = useState<string>("quick-idle");

  return (
    <motion.div
      key="daze-flow"
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute inset-0 z-[60] overflow-hidden bg-ink"
    >
      {/* 全屏场景 GIF：准备态与正式态共用同一画面背景 */}
      <img
        src={SCENE_GIF}
        alt="一起发呆"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      <AnimatePresence mode="wait">
        {phase === "ready" ? (
          <DazeReady
            key="ready"
            selected={selected}
            onSelect={setSelected}
            onBack={onExit}
            onConfirm={() => setPhase("dazing")}
          />
        ) : (
          <DazeActive key="dazing" onExit={onFinish} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* —— 准备态：沉浸场景内的动作选择（无限循环横滑 carousel） ——
 * 背景为场景 GIF，叠加轻微毛玻璃蒙层；中部横滑选动作，底部确认。
 * carousel 渲染多份副本，拖拽结束后静默归一化到中段副本，实现无限循环。 */
const CARD_W = 140;
const CARD_GAP = 16;
const CARD_STEP = CARD_W + CARD_GAP;
const REPEAT = 5;
const HOME_COPY = 2; // 中段副本索引，归一化目标范围 [HOME_COPY*n, (HOME_COPY+1)*n)

function DazeReady({
  selected,
  onSelect,
  onBack,
  onConfirm,
}: {
  selected: string;
  onSelect: (id: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const n = dazePostures.length;
  const total = n * REPEAT;
  const defaultRealIdx = Math.max(
    0,
    dazePostures.findIndex((p) => p.id === selected),
  );
  const [vIdx, setVIdx] = useState(HOME_COPY * n + defaultRealIdx);
  const x = useMotionValue(-vIdx * CARD_STEP);
  const draggedRef = useRef(false);

  const realIdx = ((vIdx % n) + n) % n;

  // 选中姿势变化时同步到父级（仅当 id 真正变化时调用）
  useEffect(() => {
    const id = dazePostures[realIdx].id;
    if (id !== selected) onSelect(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realIdx]);

  // 键盘左右方向键无限循环切换（仅在准备态生效，离开即卸载）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        snapTo(vIdx - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        snapTo(vIdx + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vIdx]);

  const snapTo = (newV: number) => {
    const clamped = Math.max(0, Math.min(total - 1, newV));
    setVIdx(clamped);
    const controls = animate(x, -clamped * CARD_STEP, {
      type: "spring",
      stiffness: 320,
      damping: 32,
    });
    controls.then(() => {
      // 落在中段副本之外则静默归一化：同一姿势卡片仍在中心，视觉无跳变
      if (clamped < HOME_COPY * n || clamped >= (HOME_COPY + 1) * n) {
        const homeV = HOME_COPY * n + (((clamped % n) + n) % n);
        x.set(-homeV * CARD_STEP);
        setVIdx(homeV);
      }
    });
  };

  // 构造多份副本卡片列表
  const cards: { trackIdx: number; posture: DazePosture }[] = [];
  for (let c = 0; c < REPEAT; c++) {
    for (let i = 0; i < n; i++) {
      cards.push({ trackIdx: c * n + i, posture: dazePostures[i] });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease }}
      className="absolute inset-0"
    >
      {/* 轻微毛玻璃蒙层：仍能看见场景，但不喧宾夺主 */}
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" />

      {/* 左上角返回 */}
      <button
        onClick={onBack}
        aria-label="返回场景选择"
        className="absolute left-5 top-12 z-20 grid h-8 w-8 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      {/* 顶部文案 */}
      <div className="absolute inset-x-0 top-24 px-6 text-center">
        <p className="text-[15px] font-medium tracking-tight text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
          选一个舒服的发呆姿势
        </p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-white/70 drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]">
          不用选得很认真。
        </p>
      </div>

      {/* 无限循环横滑 carousel：选中项居中，两侧露出弱化 */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <div className="no-scrollbar overflow-x-auto px-[calc(50%-70px)]">
          <motion.div
            className="flex"
            style={{ x, gap: CARD_GAP }}
            drag="x"
            dragConstraints={{
              left: -(total - 1) * CARD_STEP,
              right: 0,
            }}
            dragElastic={0.12}
            onDragStart={() => {
              draggedRef.current = true;
            }}
            onDragEnd={(_, info) => {
              const moved = Math.round(-info.offset.x / CARD_STEP);
              snapTo(vIdx + moved);
              setTimeout(() => {
                draggedRef.current = false;
              }, 0);
            }}
          >
            {cards.map(({ trackIdx, posture }) => (
              <CarouselCard
                key={trackIdx}
                trackIdx={trackIdx}
                posture={posture}
                x={x}
                onClick={() => {
                  if (draggedRef.current) return;
                  snapTo(trackIdx);
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {/* 底部确认按钮 */}
      <div className="absolute inset-x-0 bottom-8 px-6">
        <button
          onClick={onConfirm}
          className="mx-auto block rounded-full bg-white/15 px-7 py-3 text-[14px] font-medium text-white/95 backdrop-blur-md ring-1 ring-white/40 transition-colors hover:bg-white/25"
        >
          就这样待着
        </button>
      </div>
    </motion.div>
  );
}

/* —— carousel 单卡：透明度/缩放/描边均由 x 派生，拖拽过程中无重渲染 —— */
function CarouselCard({
  trackIdx,
  posture,
  x,
  onClick,
}: {
  trackIdx: number;
  posture: DazePosture;
  x: ReturnType<typeof useMotionValue<number>>;
  onClick: () => void;
}) {
  // 当前中心卡索引 = -x / step
  const center = useTransform(x, (xv) => -xv / CARD_STEP);
  const dist = useTransform(center, (c) => Math.abs(trackIdx - c));
  const opacity = useTransform(
    dist,
    (d) => (d < 0.5 ? 1 : Math.max(0.4, 0.72 - (d - 0.5) * 0.3)),
  );
  const scale = useTransform(
    dist,
    (d) => (d < 0.5 ? 1 : Math.max(0.86, 0.96 - (d - 0.5) * 0.1)),
  );
  const ringOpacity = useTransform(
    dist,
    (d) => (d < 0.5 ? 0.55 : 0.18),
  );

  return (
    <div className="shrink-0" style={{ width: CARD_W }} onClick={onClick}>
      <motion.div
        className="grid place-items-center overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm"
        style={{
          width: CARD_W,
          height: 170,
          opacity,
          scale,
          boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.18)`,
        }}
      >
        {/* 选中态描边：用单独 motion.span 叠加，避免动态 className */}
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.9)",
            opacity: ringOpacity,
          }}
        />
        <img
          src={posture.src}
          alt={posture.label}
          className="h-full w-full object-contain"
          draggable={false}
        />
      </motion.div>
      <motion.p
        className="mt-2 text-center text-[12px] font-medium text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
        style={{ opacity }}
      >
        {posture.label}
      </motion.p>
    </div>
  );
}

/* —— 正式发呆态 ——
 * 无顶部标题；左上角轻量共在动态流（LIVE + 主状态 + 动态列表）；
 * 底部仅保留「长按结束发呆」+ 透明圆形长按退出。 */
function DazeActive({ onExit }: { onExit: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease }}
      className="absolute inset-0"
    >
      {/* 左上角共在动态流 */}
      <PresencePulse />

      {/* 底部轻渐变蒙层：保证文案与按钮可读 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/55 to-transparent" />

      {/* 底部文案：主状态已移至左上角，底部仅保留操作提示 */}
      <div className="absolute inset-x-0 bottom-24 px-6 text-center">
        <p className="text-[12px] font-medium text-white/85 drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]">
          长按结束发呆
        </p>
      </div>

      {/* 底部透明圆形长按退出按钮 */}
      <div className="absolute inset-x-0 bottom-7 flex justify-center">
        <LongPressExitButton onComplete={onExit} />
      </div>
    </motion.div>
  );
}

/* —— 左上角共在动态流 ——
 * 结构：LIVE 标识 → 主状态「正在一起发呆」→ 其他用户动态列表（带时间戳）。
 * 动态列表每 5s 在底部补入一条新动态、移除最旧一条，整体轻微上滚淡入淡出。
 * 非直播间、非弹幕，仅表达「此刻也有别人在安静待着」。 */
const PRESENCE_MESSAGES = [
  "小王正在发呆",
  "小李也在这里",
  "阿木刚刚待下来了",
  "可可也安静待着",
  "小鱼正在一起发呆",
  "又有朋友来了",
  "木木也在这片草地上",
];

type PresenceEntry = {
  id: number;
  time: string;
  text: string;
};

function formatHHMM(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function PresencePulse() {
  const [entries, setEntries] = useState<PresenceEntry[]>(() => {
    // 初始 3 条，时间从当前向前递减 15 分钟一档，营造「最近有人来过」
    const now = Date.now();
    return [0, 1, 2].map((i) => ({
      id: i,
      time: formatHHMM(new Date(now - i * 15 * 60 * 1000)),
      text: PRESENCE_MESSAGES[i % PRESENCE_MESSAGES.length],
    }));
  });
  const idRef = useRef(3);
  const msgIdxRef = useRef(3);

  useEffect(() => {
    const t = setInterval(() => {
      // 新动态时间取当前时刻；每条间隔 5s，但展示时间戳仍贴近「现在」
      const next: PresenceEntry = {
        id: idRef.current++,
        time: formatHHMM(new Date()),
        text: PRESENCE_MESSAGES[msgIdxRef.current % PRESENCE_MESSAGES.length],
      };
      msgIdxRef.current += 1;
      setEntries((prev) => [...prev.slice(-2), next]);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute left-5 top-12 z-10 flex max-w-[200px] flex-col gap-1.5">
      {/* 左上角极轻渐变暗层：为整列文字可读，不做明显卡片 */}
      <div className="pointer-events-none absolute -left-5 -top-12 h-[220px] w-[240px] rounded-full bg-black/20 blur-2xl" />

      {/* 第一行：LIVE 标识（小圆点 + 全大写，保持小尺寸） */}
      <div className="relative flex items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-action-primary/60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-action-primary" />
        </span>
        <span className="text-[11px] font-semibold tracking-[0.08em] text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
          LIVE
        </span>
      </div>

      {/* 第二行：当前状态主体文案（比动态列表更醒目） */}
      <p className="relative text-[14px] font-semibold tracking-tight text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
        正在一起发呆
      </p>

      {/* 第三行起：其他用户动态列表，缓慢上滚更新 */}
      <div className="relative mt-0.5 flex flex-col gap-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {entries.map((e) => (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.6, ease }}
              className="flex flex-col"
            >
              {/* 时间戳：字号小、颜色弱，与正文上下排布 */}
              <span className="text-[10px] font-medium text-white/55 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
                {e.time}
              </span>
              {/* 动态正文 */}
              <span className="text-[11px] font-medium text-white/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                {e.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* —— 长按结束发呆按钮（透明圆形 + 环形进度） ——
 * 默认态只保留细描边与轻量 icon；长按时出现环形进度逐步填满，松手未完成则恢复。 */
const HOLD_MS = 1500;
const BTN_SIZE = 52;
const STROKE = 2;
const R = (BTN_SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

function LongPressExitButton({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const doneRef = useRef(false);

  const tick = () => {
    const elapsed = Date.now() - startRef.current;
    const p = Math.min(1, elapsed / HOLD_MS);
    setProgress(p);
    if (p >= 1) {
      if (!doneRef.current) {
        doneRef.current = true;
        onComplete();
      }
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const start = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    doneRef.current = false;
    startRef.current = Date.now();
    setProgress(0);
    rafRef.current = requestAnimationFrame(tick);
  };

  const cancel = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (!doneRef.current) setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const pressing = progress > 0 && progress < 1;

  return (
    <button
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      aria-label="长按结束发呆"
      className="relative grid place-items-center rounded-full bg-transparent ring-1 ring-white/40 transition-colors hover:bg-white/5 select-none"
      style={{ width: BTN_SIZE, height: BTN_SIZE, touchAction: "none" }}
    >
      {/* 环形进度：仅长按时可见 */}
      <svg
        className="absolute inset-0 -rotate-90"
        width={BTN_SIZE}
        height={BTN_SIZE}
        viewBox={`0 0 ${BTN_SIZE} ${BTN_SIZE}`}
        style={{ opacity: pressing || progress >= 1 ? 1 : 0, transition: "opacity 0.2s" }}
      >
        <circle
          cx={BTN_SIZE / 2}
          cy={BTN_SIZE / 2}
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={STROKE}
        />
        <circle
          cx={BTN_SIZE / 2}
          cy={BTN_SIZE / 2}
          r={R}
          fill="none"
          stroke="var(--z-action-primary)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - progress)}
        />
      </svg>
      {/* 中心图标：关闭 ×，按下时轻微缩放反馈 */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 14 14"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        className={`transition-transform ${pressing ? "scale-90" : "scale-100"}`}
      >
        <path d="M3 3l8 8M11 3l-8 8" />
      </svg>
    </button>
  );
}

/* —— 「一起吃饭」占位页 ——
 * Demo 阶段仅保留入口与基础占位，不展开完整流程。 */
export function EatPlaceholderContent({ onExit }: { onExit: () => void }) {
  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute inset-0 z-[60] bg-white"
    >
      <div className="relative flex h-full flex-col bg-white">
        {/* 顶部返回 */}
        <div className="flex items-center gap-3 px-5 pt-14 pb-2">
          <button
            onClick={onExit}
            aria-label="返回场景选择"
            className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        </div>

        {/* 标题 + 文案 */}
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <Utensils className="h-8 w-8 text-ink-faint" strokeWidth={1.4} />
          <h2 className="mt-5 text-[20px] font-semibold tracking-tight text-ink">
            一起吃饭
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            围坐一桌，慢慢吃。
          </p>
        </div>

        {/* 底部返回入口 */}
        <div className="px-6 pb-8">
          <button
            onClick={onExit}
            className="w-full rounded-xl border border-line bg-white px-6 py-3.5 text-[15px] font-medium text-ink transition-colors hover:border-ink-faint"
          >
            返回
          </button>
        </div>
      </div>
    </motion.div>
  );
}
