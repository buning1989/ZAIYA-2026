import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  Moon,
  Utensils,
  BookOpen,
  Sun,
  Footprints,
  ChevronLeft,
  Volume2,
  VolumeX,
} from "lucide-react";
import { CollapseButton } from "./FeaturePageTransition";
import LazyVideo from "./LazyVideo";

const ease = [0.22, 1, 0.36, 1] as const;

/* —— 轻社交场景配置 ——
 * Demo 阶段仅开放「一起发呆」「一起吃饭」；其余为预告场景（不可点击）。 */
export type SceneId = "daze" | "eat" | "sleep" | "study" | "sun" | "walk";

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
    label: "一起睡觉",
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
  {
    id: "sun",
    label: "一起晒太阳",
    desc: "暖洋洋，慢慢晒。",
    Icon: Sun,
    open: false,
  },
  {
    id: "walk",
    label: "一起散步",
    desc: "慢慢走，不赶路。",
    Icon: Footprints,
    open: false,
  },
];

const COMPANION_GIF = "./assets/social/social-home-companion.gif";
const COMPANION_COPY = "今天想和大家一起待一会儿吗？";

/**
 * 轻社交场景选择内容层（在 AppMainSurface 内部渲染）。
 *
 * 三层结构：顶部陪伴区（在在 GIF + 气泡文案）→ 已开放场景 → 预告场景。
 * 预告场景不可点击、不触发路由或弹窗，仅表达「未来场景预告」。
 * 底部保留轻量返回箭头收起轻社交。
 */
export function SocialSceneSelectContent({
  onSelect,
  onClose,
}: {
  onSelect: (s: SceneId) => void;
  onClose: () => void;
}) {
  const openScenes = scenes.filter((s) => s.open);
  const previewScenes = scenes.filter((s) => !s.open);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease }}
      className="absolute inset-0 z-20 flex flex-col bg-white"
    >
      {/* 顶部陪伴区：在在 GIF（左）+ 气泡文案（右）横向组合 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease, delay: 0.05 }}
        className="flex flex-row items-center justify-center gap-3 px-[18px] max-[360px]:gap-[9px] max-[360px]:px-[12px]"
        style={{ marginTop: 54, marginBottom: 34 }}
      >
        <div className="flex h-[88px] w-[84px] flex-shrink-0 items-center justify-center overflow-visible max-[360px]:h-[80px] max-[360px]:w-[76px]">
          <img
            src={COMPANION_GIF}
            alt="在在"
            className="block h-[84px] w-[84px] flex-shrink-0 select-none object-contain object-center max-[360px]:h-[76px] max-[360px]:w-[76px]"
            style={{ transform: "scale(1.08)", transformOrigin: "center center" }}
          />
        </div>
        <div
          className="max-w-[178px] rounded-[16px] border bg-white px-[14px] py-[10px] text-left text-[15px] font-normal leading-[1.6] text-[#4C5348] max-[360px]:max-w-[164px] max-[360px]:px-[12px] max-[360px]:py-[9px] max-[360px]:text-[14px]"
          style={{ borderColor: "#E1E4DE", boxShadow: "none" }}
        >
          {COMPANION_COPY}
        </div>
      </motion.div>

      {/* 已开放场景 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease, delay: 0.1 }}
        className="px-6"
      >
        <div className="text-[13px] font-medium leading-5 text-[#7B8376]">
          现在可以一起
        </div>
        <div className="mt-[10px] grid grid-cols-2 gap-3">
          {openScenes.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className="flex flex-col items-start gap-2 rounded-2xl bg-white p-4 text-left transition-colors hover:border-[#C7CCBF]"
              style={{ border: "1px solid #DDE1D8", boxShadow: "none" }}
            >
              <s.Icon className="h-6 w-6 text-ink-soft" strokeWidth={1.8} />
              <div>
                <div className="text-[14px] font-medium text-ink">
                  {s.label}
                </div>
                <div className="mt-0.5 text-[11px] leading-relaxed text-ink-faint">
                  {s.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* 预告场景（不可点击） */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease, delay: 0.15 }}
        className="mt-[24px] px-6"
      >
        <div className="text-[13px] font-medium leading-5 text-[#7B8376]">
          更多一起做的事
        </div>
        <div className="mt-[10px] grid grid-cols-2 gap-[10px]">
          {previewScenes.map((s) => (
            <div
              key={s.id}
              className="relative flex min-h-[72px] flex-col items-start gap-1.5 rounded-[14px] bg-white p-[13px]"
              style={{
                border: "1px solid #E5E6E2",
                boxShadow: "none",
                cursor: "default",
              }}
            >
              <s.Icon
                className="h-5 w-5 text-[#858B82]"
                strokeWidth={1.8}
              />
              <div className="text-[13px] font-medium text-[#858B82]">
                {s.label}
              </div>
              <span
                className="absolute right-3 top-3 rounded-full px-[7px] py-[2px] text-[10px] leading-4 text-[#999E96]"
                style={{
                  border: "1px solid #E0E2DD",
                  background: "transparent",
                }}
              >
                即将开放
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 底部中央返回箭头 */}
      <CollapseButton onClick={onClose} ariaLabel="收起轻社交" />
    </motion.div>
  );
}

/* —— 「一起发呆」动作配置 —— */
type DazePosture = {
  id: string;
  label: string;
  src: string;
  poster?: string;
};

const dazePostures: DazePosture[] = [
  {
    id: "shake-head",
    label: "轻轻摇头",
    src: "./assets/social/daze/action-shake-head.webm",
    poster: "./assets/social/daze/action-shake-head-poster.png",
  },
  {
    id: "quick-idle",
    label: "安静坐着",
    src: "./assets/social/daze/action-quick-idle.webm",
    poster: "./assets/social/daze/action-quick-idle-poster.png",
  },
  {
    id: "lean-back",
    label: "往后靠着",
    src: "./assets/social/daze/action-lean-back.webm",
    poster: "./assets/social/daze/action-lean-back-poster.png",
  },
];

const SCENE_VIDEO = "./assets/social/daze/scene-together-15s.webm";
const DAZE_BGM = "./assets/social/daze/together-bgm.mp3";

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
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.42;
    audio.muted = isMuted;

    if (!isMuted) {
      void audio.play().catch(() => {
        audio.muted = true;
        setIsMuted(true);
      });
    }
  }, [isMuted]);

  const toggleAudio = () => {
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

  return (
    <motion.div
      key="daze-flow"
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute inset-0 z-[60] overflow-hidden bg-ink"
    >
      {/* 全屏场景视频：准备态与正式态共用同一画面背景 */}
      <LazyVideo
        src={SCENE_VIDEO}
        ariaLabel="一起发呆"
        eager
        layout="fill"
        mediaClassName="object-cover"
        className="absolute inset-0 h-full w-full"
        fadeDuration={400}
      />
      <audio ref={audioRef} src={DAZE_BGM} autoPlay loop preload="none" />

      <button
        type="button"
        onClick={toggleAudio}
        aria-label={isMuted ? "打开背景音乐" : "静音背景音乐"}
        className="absolute right-5 top-12 z-30 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/20 text-white/85 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-md transition-colors hover:bg-white/12 hover:text-white"
      >
        {isMuted ? (
          <VolumeX className="h-[18px] w-[18px]" strokeWidth={1.8} />
        ) : (
          <Volume2 className="h-[18px] w-[18px]" strokeWidth={1.8} />
        )}
      </button>

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
                item={posture}
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

/* —— carousel 通用条目类型（发呆姿势 / 食物均满足此结构）—— */
type CarouselItem = {
  id: string;
  label: string;
  src: string;
  poster?: string;
};

/* —— carousel 单卡：透明度/缩放/描边均由 x 派生，拖拽过程中无重渲染 ——
 * 性能优化（2026-07-13）：GIF → 透明 WebM，使用 LazyVideo 懒加载。 */
function CarouselCard({
  trackIdx,
  item,
  x,
  onClick,
}: {
  trackIdx: number;
  item: CarouselItem;
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
        <LazyVideo
          src={item.src}
          poster={item.poster}
          rootMargin="100px"
          layout="fill"
          mediaClassName="object-contain"
          alt={item.label}
          ariaLabel={item.label}
          fadeDuration={250}
          className="h-full w-full"
        />
      </motion.div>
      <motion.p
        className="mt-2 text-center text-[12px] font-medium text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
        style={{ opacity }}
      >
        {item.label}
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

function PresencePulse({
  messages = PRESENCE_MESSAGES,
  mainText = "正在一起发呆",
}: {
  messages?: string[];
  mainText?: string;
}) {
  const [entries, setEntries] = useState<PresenceEntry[]>(() => {
    // 初始 3 条，时间从当前向前递减 15 分钟一档，营造「最近有人来过」
    const now = Date.now();
    return [0, 1, 2].map((i) => ({
      id: i,
      time: formatHHMM(new Date(now - i * 15 * 60 * 1000)),
      text: messages[i % messages.length],
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
        text: messages[msgIdxRef.current % messages.length],
      };
      msgIdxRef.current += 1;
      setEntries((prev) => [...prev.slice(-2), next]);
    }, 5000);
    return () => clearInterval(t);
  }, [messages]);

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
        {mainText}
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

function LongPressExitButton({
  onComplete,
  ariaLabel = "长按结束发呆",
}: {
  onComplete: () => void;
  ariaLabel?: string;
}) {
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
      aria-label={ariaLabel}
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
        strokeWidth="1.8"
        strokeLinecap="round"
        className={`transition-transform ${pressing ? "scale-90" : "scale-100"}`}
      >
        <path d="M3 3l8 8M11 3l-8 8" />
      </svg>
    </button>
  );
}

/* —— 「一起吃饭」食物配置 + 场景视频 ——
 * 食物仅作为轻社交场景中的陪伴道具，不进入饮食记录数据结构、不评价健康。
 * 默认选中「粥」，更温和，也符合慢慢吃的状态。 */
const eatFoods: CarouselItem[] = [
  { id: "milk-tea", label: "奶茶", src: "./assets/social/eat/food-milk-tea.webm" },
  { id: "greens", label: "青菜", src: "./assets/social/eat/food-greens.webm" },
  { id: "meat", label: "肉", src: "./assets/social/eat/food-meat.webm" },
  { id: "fruit", label: "水果", src: "./assets/social/eat/food-fruit.webm" },
  { id: "dessert", label: "甜品", src: "./assets/social/eat/food-dessert.webm" },
  { id: "congee", label: "粥", src: "./assets/social/eat/food-congee.webm" },
];

const EAT_SCENE_VIDEO = "./assets/social/eat/scene-eating-plaza.webm";
const EAT_DEFAULT_FOOD = "congee";

const EAT_PRESENCE_MESSAGES = [
  "小王正在吃饭",
  "小李也坐下来了",
  "阿木正在慢慢吃",
  "可可也在这一桌",
  "小鱼正在一起吃饭",
  "又有朋友来了",
  "木木也安静坐着吃",
];

/**
 * 「一起吃饭」完整流程（准备态 → 正式吃饭态 → 长按退出）。
 *
 * 结构与「一起发呆」一致：点击后直接进入沉浸场景，先在场景内的准备态中
 * 通过横滑选择想一起吃的食物，确认后进入正式吃饭态。
 * 正式态仅保留沉浸画面 + 左上角共在动态 + 底部状态文案 + 透明圆形长按退出。
 *
 * - onExit：准备态返回（无能量）
 * - onFinish：正式吃饭态长按结束（触发能量奖励并返回）
 */
export function EatFlow({
  onExit,
  onFinish,
}: {
  onExit: () => void;
  onFinish: () => void;
}) {
  const [phase, setPhase] = useState<"ready" | "eating">("ready");
  const [selected, setSelected] = useState<string>(EAT_DEFAULT_FOOD);

  return (
    <motion.div
      key="eat-flow"
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute inset-0 z-[60] overflow-hidden bg-ink"
    >
      {/* 全屏场景视频：准备态与正式态共用同一画面背景 */}
      <LazyVideo
        src={EAT_SCENE_VIDEO}
        ariaLabel="一起吃饭"
        eager
        layout="fill"
        mediaClassName="object-cover"
        className="absolute inset-0 h-full w-full"
        fadeDuration={400}
      />

      <AnimatePresence mode="wait">
        {phase === "ready" ? (
          <EatReady
            key="ready"
            selected={selected}
            onSelect={setSelected}
            onBack={onExit}
            onConfirm={() => setPhase("eating")}
          />
        ) : (
          <EatActive key="eating" onExit={onFinish} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* —— 准备态：沉浸场景内的食物选择（无限循环横滑 carousel） ——
 * 复用与发呆准备态相同的 carousel 机制，食物卡渲染为 LazyVideo。 */
function EatReady({
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
  const n = eatFoods.length;
  const total = n * REPEAT;
  const defaultRealIdx = Math.max(
    0,
    eatFoods.findIndex((f) => f.id === selected),
  );
  const [vIdx, setVIdx] = useState(HOME_COPY * n + defaultRealIdx);
  const x = useMotionValue(-vIdx * CARD_STEP);
  const draggedRef = useRef(false);

  const realIdx = ((vIdx % n) + n) % n;

  // 选中食物变化时同步到父级（仅当 id 真正变化时调用）
  useEffect(() => {
    const id = eatFoods[realIdx].id;
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
      // 落在中段副本之外则静默归一化：同一食物卡片仍在中心，视觉无跳变
      if (clamped < HOME_COPY * n || clamped >= (HOME_COPY + 1) * n) {
        const homeV = HOME_COPY * n + (((clamped % n) + n) % n);
        x.set(-homeV * CARD_STEP);
        setVIdx(homeV);
      }
    });
  };

  // 构造多份副本卡片列表
  const cards: { trackIdx: number; food: CarouselItem }[] = [];
  for (let c = 0; c < REPEAT; c++) {
    for (let i = 0; i < n; i++) {
      cards.push({ trackIdx: c * n + i, food: eatFoods[i] });
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
      {/* 轻微毛玻璃蒙层：仍能看见吃饭广场场景，但不喧宾夺主 */}
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
          选一个想一起吃的东西
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
            {cards.map(({ trackIdx, food }) => (
              <CarouselCard
                key={trackIdx}
                trackIdx={trackIdx}
                item={food}
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
          就这样慢慢吃
        </button>
      </div>
    </motion.div>
  );
}

/* —— 正式吃饭态 ——
 * 无顶部标题；左上角轻量共在动态流（LIVE + 主状态 + 动态列表）；
 * 底部仅保留「长按结束吃饭」+ 透明圆形长按退出。 */
function EatActive({ onExit }: { onExit: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease }}
      className="absolute inset-0"
    >
      {/* 左上角共在动态流 */}
      <PresencePulse
        messages={EAT_PRESENCE_MESSAGES}
        mainText="正在一起吃饭"
      />

      {/* 底部轻渐变蒙层：保证文案与按钮可读 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/55 to-transparent" />

      {/* 底部文案：主状态已移至左上角，底部仅保留操作提示 */}
      <div className="absolute inset-x-0 bottom-24 px-6 text-center">
        <p className="text-[12px] font-medium text-white/85 drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]">
          长按结束吃饭
        </p>
      </div>

      {/* 底部透明圆形长按退出按钮 */}
      <div className="absolute inset-x-0 bottom-7 flex justify-center">
        <LongPressExitButton
          onComplete={onExit}
          ariaLabel="长按结束吃饭"
        />
      </div>
    </motion.div>
  );
}
