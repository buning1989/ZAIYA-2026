import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sprout } from "lucide-react";

/* —— 我的光入口（统一组件）——
 *
 * 所有模块右上角入口均使用此组件。它只表达“我的光 / 我的成长”的访问入口，
 * 不展示数值；光粒抵达时只做一次轻微 pulse。
 *
 * 定位模式：
 *   - "inline"：作为 flex 子项参与顶部标题栏布局（记一下 / 夸夸自己）
 *   - "floating"：absolute 右上角悬浮（轻社交 / 缓解，无标题栏的覆盖页）
 *
 * floating 定位规则：absolute right-5 top-14 z-40
 *   top-14(56px) 与记一下顶部栏 pt-14 一致，位于系统状态栏下方，
 *   与标题栏内容区同一高度逻辑，不贴近状态栏。
 */
type EnergyBadgeProps = {
  /** 是否触发 pulse 动画（光粒抵达时置 true） */
  pulse?: boolean;
  /** 按钮引用（EnergyRewardFeedback 飞行目标） */
  buttonRef?: RefObject<HTMLButtonElement | null>;
  /** 定位模式 */
  position?: "inline" | "floating";
  /** 点击提示文案，默认提示成长中 */
  hintText?: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

const DEFAULT_HINT = "我的枝芽还在慢慢长出来";
const HINT_DURATION = 2500;

export default function EnergyBadge({
  pulse = false,
  buttonRef,
  position = "inline",
  hintText = DEFAULT_HINT,
}: EnergyBadgeProps) {
  const [hint, setHint] = useState<string | null>(null);
  const hintTimer = useRef<number | null>(null);

  const handleClick = () => {
    setHint(hintText);
    if (hintTimer.current) window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => {
      setHint(null);
      hintTimer.current = null;
    }, HINT_DURATION);
  };

  useEffect(() => {
    return () => {
      if (hintTimer.current) window.clearTimeout(hintTimer.current);
    };
  }, []);

  const wrapperClass =
    position === "floating"
      ? "absolute right-5 top-14 z-50"
      : "relative z-50";

  return (
    <div className={wrapperClass}>
      <motion.button
        ref={buttonRef}
        type="button"
        aria-label="我的光"
        onClick={handleClick}
        animate={pulse ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.36, ease }}
        className={`grid h-8 min-w-8 place-items-center rounded-full border bg-white px-2 text-ink transition-colors hover:border-light-warm/40 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-light-warm/45 ${
          pulse
            ? "border-light-warm/40 shadow-[0_6px_16px_rgba(201,168,92,0.18)]"
            : "border-light-warm/25"
        }`}
      >
        <Sprout
          data-light-reward-target
          className="h-4 w-4 text-light-warm"
          strokeWidth={1.8}
        />
      </motion.button>

      {/* 点击提示：紧贴入口下方展开，2.5s 自动淡出。
          宽度随文案自适应（不设 min-width），浅色背景 + 深色正文保证对比度；
          z-50 高于缓解/社交覆盖层，避免被 bg-white 层遮挡。 */}
      <AnimatePresence>
        {hint && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease }}
            className="pointer-events-none absolute right-0 top-full z-50 mt-1 w-max max-w-[280px] whitespace-nowrap rounded-2xl border border-line/70 bg-surface-soft px-3.5 py-2 text-center text-[13px] font-medium leading-relaxed text-ink shadow-[0_6px_16px_rgba(39,51,31,0.10)]"
          >
            {hint}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
