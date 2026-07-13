import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* —— 全局能量入口（统一组件）——
 *
 * 所有模块右上角能量入口均使用此组件，统一控制：
 *   - 图标（Zap h-3 w-3）+ 数字
 *   - 浅色圆角胶囊样式（rounded-full, px-2.5 py-1, text-[12px]）
 *   - 配色：常态 status-mood/15；pulse 态 action-primary/[0.48] + 阴影
 *   - 点击反馈：紧贴下方展开轻提示，1.8s 自动淡出
 *   - pulse 动画：能量飞抵后 scale 脉冲
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
  /** 当前能量值（来自 useEnergy） */
  value: number;
  /** 是否触发 pulse 动画（toast 抵达时置 true） */
  pulse?: boolean;
  /** 按钮引用（EnergyRewardFeedback 飞行目标） */
  buttonRef?: RefObject<HTMLButtonElement | null>;
  /** 定位模式 */
  position?: "inline" | "floating";
  /** 点击提示文案，默认 Demo 暂未开放 */
  hintText?: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

const DEFAULT_HINT = "小装扮兑换暂未开放";

/* —— 种子发芽图标（扁平、圆润、轻治愈风格）—— */
function SproutIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* 种子 */}
      <ellipse
        cx="12"
        cy="18"
        rx="3"
        ry="2.5"
        fill="currentColor"
        opacity="0.6"
      />
      {/* 嫩芽茎 */}
      <path
        d="M12 15.5 Q12 12 12 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* 左叶 */}
      <path
        d="M12 12 Q9 11 8 9 Q9 10 12 12"
        fill="currentColor"
        opacity="0.7"
      />
      {/* 右叶 */}
      <path
        d="M12 10 Q15 9 16 7 Q15 8 12 10"
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  );
}

export default function EnergyBadge({
  value,
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
    }, 1800);
  };

  useEffect(() => {
    return () => {
      if (hintTimer.current) window.clearTimeout(hintTimer.current);
    };
  }, []);

  const wrapperClass =
    position === "floating"
      ? "absolute right-5 top-14 z-40"
      : "relative";

  return (
    <div className={wrapperClass}>
      <motion.button
        ref={buttonRef}
        onClick={handleClick}
        animate={pulse ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={{ duration: 0.36, ease }}
        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium text-ink transition-colors hover:bg-status-mood/25 ${
          pulse
            ? "bg-action-primary/[0.48] shadow-[0_6px_18px_rgb(var(--z-action-primary-rgb)/0.22)]"
            : "bg-status-mood/15"
        }`}
      >
        <SproutIcon className="h-3.5 w-3.5" />
      </motion.button>

      {/* 点击提示：紧贴入口下方展开，1.8s 自动淡出；min-width 防止竖向压缩 */}
      <AnimatePresence>
        {hint && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease }}
            className="pointer-events-none absolute right-0 top-full z-40 mt-1 w-max min-w-[160px] max-w-[280px] whitespace-nowrap rounded-2xl bg-status-mood/90 px-3.5 py-2 text-center text-[12px] font-medium leading-relaxed text-white shadow-[0_6px_16px_rgba(44,59,39,0.18)]"
          >
            {hint}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
