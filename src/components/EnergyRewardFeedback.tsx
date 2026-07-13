/* —— 光奖励反馈 ——
 * 保留文件名以减少调用侧 churn；视觉语义已从“能量入账”调整为“收下一点光”。
 * 组件只负责一段轻量的完成反馈，不再承载数字资产、飞行动画或入口入账关系。 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Moon, Star, Sun } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;
const DONE_MS = 2200;
const REDUCED_DONE_MS = 2000;
const FEEDBACK_BOTTOM_OFFSET = 185;
const FEEDBACK_MIN_Y_RATIO = 0.58;
const FEEDBACK_BOTTOM_SAFE_GAP = 118;

export interface LightRewardEvent {
  id: number;
}

export type EnergyRewardEvent = LightRewardEvent;

export interface EnergyRewardFeedbackProps {
  event: LightRewardEvent | null;
  onDone: () => void;
  description?: string;
}

type Point = {
  x: number;
  y: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getFeedbackOrigin(bounds: DOMRect): Point {
  const minY = bounds.height * FEEDBACK_MIN_Y_RATIO;
  const maxY = bounds.height - FEEDBACK_BOTTOM_SAFE_GAP;
  const idealY = bounds.height - FEEDBACK_BOTTOM_OFFSET;

  return {
    x: bounds.width / 2,
    y: maxY > minY ? clamp(idealY, minY, maxY) : Math.max(48, maxY),
  };
}

export default function EnergyRewardFeedback({
  event,
  onDone,
  description = "这一步，也算数。",
}: EnergyRewardFeedbackProps) {
  const prefersReducedMotion = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [origin, setOrigin] = useState<Point | null>(null);

  useEffect(() => {
    if (!event) {
      setOrigin(null);
      return;
    }

    const overlayBounds = overlayRef.current?.getBoundingClientRect();
    if (!overlayBounds) return;
    setOrigin(getFeedbackOrigin(overlayBounds));
  }, [event]);

  useEffect(() => {
    if (!event) return;

    const doneTimer = window.setTimeout(
      onDone,
      prefersReducedMotion ? REDUCED_DONE_MS : DONE_MS,
    );

    return () => {
      window.clearTimeout(doneTimer);
    };
  }, [event, onDone, prefersReducedMotion]);

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none absolute inset-0 z-50 overflow-hidden"
    >
      <AnimatePresence>
        {event && origin && (
          <motion.div
            key={event.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease }}
            className="absolute inset-0"
          >
            <div
              className="absolute"
              style={{
                left: origin.x,
                top: origin.y,
                transform: "translate(-50%, -50%)",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={
                  prefersReducedMotion
                    ? { opacity: [0, 1, 1, 0] }
                    : {
                        opacity: [0, 1, 1, 0],
                        y: [8, 0, 0, -4],
                        scale: [0.98, 1, 1, 0.98],
                      }
                }
                transition={{
                  duration: prefersReducedMotion ? 1.95 : 2.08,
                  times: prefersReducedMotion
                    ? [0, 0.14, 0.88, 1]
                    : [0, 0.14, 0.88, 1],
                  ease,
                }}
                className="min-w-[168px] rounded-[18px] border border-status-mood/35 bg-canvas-soft/95 px-4 py-3 text-center text-ink shadow-[0_8px_20px_rgba(44,59,39,0.12)] backdrop-blur-sm"
              >
                <div className="mb-1.5 flex items-center justify-center gap-2 text-status-mood">
                  {[Sun, Moon, Star].map((Icon, index) => (
                    <motion.span
                      key={index}
                      initial={prefersReducedMotion ? false : { scale: 0.9 }}
                      animate={prefersReducedMotion ? undefined : { scale: 1 }}
                      transition={{ duration: 0.28, delay: index * 0.04, ease }}
                      className="grid h-6 w-6 place-items-center rounded-full bg-status-mood/[0.14]"
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                    </motion.span>
                  ))}
                </div>
                <div className="text-[14px] font-semibold leading-tight tracking-tight">
                  收下一点光
                </div>
                <div className="mt-1 text-[12px] font-medium leading-snug text-ink-soft">
                  {description}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
