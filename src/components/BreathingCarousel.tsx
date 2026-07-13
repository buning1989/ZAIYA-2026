import { useRef, useState, useLayoutEffect, useMemo, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { motion, type PanInfo } from "framer-motion";

/* —— 呼吸法节奏配置 ——
 * 每个阶段（phase）包含：展示文案、时长（秒）、目标缩放。
 * ring 缩放由「上一阶段目标 → 当前阶段目标」按进度插值得到，
 * 因此 hold 阶段（目标与前一阶段相同）自然表现为「保持」，
 * topup 阶段目标略大于 inhale，体现「再补一小口」的短暂扩张。 */
export type Phase = { label: string; duration: number; scale: number };

export type BreathingMethod = {
  id: string;
  name: string;
  purpose: string;
  rhythm: string;
  durationLabel: string;
  rounds: number;
  phases: Phase[];
};

export const BASE_MIN = 0.72;
export const INHALE_MAX = 1.04;
export const TOPUP_MAX = 1.1;

export const BREATHING_METHODS: BreathingMethod[] = [
  {
    id: "4-6",
    name: "4-6 呼吸法",
    purpose: "日常减压",
    rhythm: "吸气 4 秒 · 呼气 6 秒",
    durationLabel: "约 1 分钟",
    rounds: 6,
    phases: [
      { label: "吸气", duration: 4, scale: INHALE_MAX },
      { label: "呼气", duration: 6, scale: BASE_MIN },
    ],
  },
  {
    id: "4x4",
    name: "4x4 呼吸法",
    purpose: "快速冷静",
    rhythm: "吸气 · 停住 · 呼气 · 停住",
    durationLabel: "约 1 分钟",
    rounds: 4,
    phases: [
      { label: "吸气", duration: 4, scale: INHALE_MAX },
      { label: "停住", duration: 4, scale: INHALE_MAX },
      { label: "呼气", duration: 4, scale: BASE_MIN },
      { label: "停住", duration: 4, scale: BASE_MIN },
    ],
  },
  {
    id: "sigh",
    name: "生理性叹息",
    purpose: "快速缓解紧绷",
    rhythm: "吸气 · 补一小口 · 长呼气",
    durationLabel: "约 45 秒",
    rounds: 5,
    phases: [
      { label: "吸一口气", duration: 2, scale: INHALE_MAX },
      { label: "再补一小口", duration: 1, scale: TOPUP_MAX },
      { label: "慢慢呼出去", duration: 6, scale: BASE_MIN },
    ],
  },
  {
    id: "4-7-8",
    name: "4-7-8 呼吸法",
    purpose: "睡前放松",
    rhythm: "吸气 4 秒 · 停住 7 秒 · 呼气 8 秒",
    durationLabel: "约 1 分钟",
    rounds: 3,
    phases: [
      { label: "吸气", duration: 4, scale: INHALE_MAX },
      { label: "停住", duration: 7, scale: INHALE_MAX },
      { label: "呼气", duration: 8, scale: BASE_MIN },
    ],
  },
];

/* —— 横滑卡片轮播（意图优先 + 左右循环） ——
 * 全部 4 张卡片始终挂载，按相对当前卡的环形位移定位到 3 个可见槽位
 * （左 peek / 居中 / 右 peek）+ 1 个隐藏槽位。环形索引天然支持无限循环，
 * 没有首末终点。卡片主标题为「用户意图」，副标题为「呼吸法名 · 时长」，
 * 不展示完整呼吸步骤。支持左右滑动切换、点击分页点切换；首次进入有一次
 * 轻微横向位移暗示可滑动，不循环播放。 */
export function BreathingCarousel({
  methods,
  activeIndex,
  onActiveChange,
}: {
  methods: BreathingMethod[];
  activeIndex: number;
  onActiveChange: (i: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerW(el.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cardW = containerW * 0.68;
  const slotOffset = containerW * 0.72; // 相邻卡片中心间距，保证左右露边
  const cardLeft = (containerW - cardW) / 2;
  const cardH = 176;

  // 首次进入轻微横向位移暗示（keyframes，仅 mount 时执行一次）
  const nudgeX = useMemo(() => [0, 8, -6, 0], []);

  const paginate = (dir: number) => {
    onActiveChange((activeIndex + dir + methods.length) % methods.length);
  };

  const handlePanEnd = (_: unknown, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold || info.velocity.x < -300) paginate(1);
    else if (info.offset.x > threshold || info.velocity.x > 300) paginate(-1);
  };

  // 键盘方向键左右切换（循环）：← 上一张，→ 下一张
  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      paginate(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      paginate(1);
    }
  };

  // 环形槽位：0=居中，1=右 peek，n-1=左 peek，其余=隐藏
  const slotFor = (i: number) => {
    const n = methods.length;
    const d = ((i - activeIndex + n) % n);
    if (d === 0) return { x: 0, opacity: 1, z: 30 };
    if (d === 1) return { x: slotOffset, opacity: 0.5, z: 20 };
    if (d === n - 1) return { x: -slotOffset, opacity: 0.5, z: 20 };
    return {
      x: d <= n / 2 ? 2 * slotOffset : -2 * slotOffset,
      opacity: 0,
      z: 10,
    };
  };

  return (
    <div className="flex flex-col">
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="listbox"
        aria-label="呼吸法选择"
        aria-activedescendant={methods[activeIndex]?.id}
        className="relative w-full outline-none"
        style={{ height: cardH, touchAction: "pan-y" }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ x: 0 }}
          animate={{ x: nudgeX }}
          transition={{
            duration: 0.7,
            ease: "easeInOut",
            times: [0, 0.35, 0.7, 1],
          }}
          onPanEnd={handlePanEnd}
        >
          {containerW > 0 &&
            methods.map((m, i) => {
              const slot = slotFor(i);
              return (
                <motion.div
                  key={m.id}
                  id={m.id}
                  role="option"
                  aria-selected={i === activeIndex}
                  className="flex flex-col items-center justify-center rounded-3xl border border-line bg-card px-6 text-center"
                  animate={{ x: slot.x, opacity: slot.opacity }}
                  transition={{ type: "spring", stiffness: 300, damping: 32 }}
                  style={{
                    position: "absolute",
                    width: cardW,
                    left: cardLeft,
                    top: 0,
                    height: cardH,
                    zIndex: slot.z,
                  }}
                >
                  <h3 className="text-[20px] font-medium tracking-tight text-ink">
                    {m.purpose}
                  </h3>
                  <p className="mt-3 text-[12px] text-ink-faint">
                    {m.name} · {m.durationLabel}
                  </p>
                </motion.div>
              );
            })}
        </motion.div>
      </div>

      {/* 分页点：始终 4 个，反映真实 methodId */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {methods.map((m, i) => (
          <button
            key={m.id}
            onClick={() => onActiveChange(i)}
            aria-label={`第 ${i + 1} 个呼吸法`}
            className={`h-1.5 rounded-full transition-all ${
              i === activeIndex ? "w-4 bg-ink" : "w-1.5 bg-line"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
