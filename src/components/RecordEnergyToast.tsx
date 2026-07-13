/* —— 轻量化光反馈弹层 ——
 * 原名 RecordEnergyToast（能量飞行动画），重构为「收下一点光」轻量弹层。
 * 设计原则：
 *   - 行动被轻轻接住的反馈，不是游戏通关结算
 *   - 简单淡入淡出 + 轻微上移，总时长约 2 秒
 *   - 不展示数字、不飞向入口、不粒子爆炸
 *   - 统一文案「收下一点光」+ 副文案「这一步，也算数。」
 *
 * 调用方式：event 非 null 时展示，动画结束后自动调用 onDone。
 * 各模块统一复用此组件，不重复创建。 */
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;
const HOLD_MS = 1500;
const EXIT_MS = 250;
const TOTAL_MS = HOLD_MS + EXIT_MS;

export interface RecordEnergyRewardEvent {
  id: number;
  reward: number;
}

export interface RecordEnergyToastProps {
  event: RecordEnergyRewardEvent | null;
  onDone: () => void;
}

/* —— 柔和微光图标（低饱和暖色小星） —— */
function SoftSparkleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="text-ink-soft"
    >
      <path
        d="M12 2L13.6 8.4L20 10L13.6 11.6L12 18L10.4 11.6L4 10L10.4 8.4L12 2Z"
        fill="currentColor"
        fillOpacity={0.12}
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RecordEnergyToast({
  event,
  onDone,
}: RecordEnergyToastProps) {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!event) return;

    timerRef.current = window.setTimeout(() => {
      onDone();
    }, TOTAL_MS);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [event, onDone]);

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
      <AnimatePresence>
        {event && (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease }}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-status-mood/30 bg-canvas-soft px-6 py-4 shadow-[0_6px_20px_rgba(44,59,39,0.10)]"
          >
            <SoftSparkleIcon />
            <span className="text-[15px] font-medium tracking-tight text-ink">
              收下一点光
            </span>
            <span className="text-[12px] text-ink-faint">
              这一步，也算数。
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
