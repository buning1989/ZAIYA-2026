import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sprout } from "lucide-react";

/* —— 我的光入口（统一组件）——
 *
 * 所有模块右上角入口均使用此组件。它只表达“我的光 / 我的成长”的访问入口，
 * 不展示数值、不接收奖励入账动效，也不做持续吸引注意的动画。
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
  /** 定位模式 */
  position?: "inline" | "floating";
  /** 点击提示文案，默认 Demo 暂未开放 */
  hintText?: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

const DEFAULT_HINT = "我的光还在慢慢长出来";

export default function EnergyBadge({
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
        type="button"
        aria-label="我的光"
        onClick={handleClick}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.2, ease }}
        className="grid h-8 min-w-8 place-items-center rounded-full border border-status-mood/20 bg-status-mood/[0.12] px-2 text-ink transition-colors hover:bg-status-mood/[0.18] focus:outline-none focus-visible:ring-2 focus-visible:ring-status-mood/45"
      >
        <Sprout className="h-4 w-4" strokeWidth={1.8} />
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
