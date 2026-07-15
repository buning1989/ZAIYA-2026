/* —— 光奖励反馈 ——
 * 保留文件名以减少调用侧 churn；视觉语义为收下当下这一点日光、月光或星光。 */
import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Moon, Star, Sun, type LucideIcon } from "lucide-react";
import {
  getLightRewardKind,
  getLightRewardTitle,
  type LightRewardKind,
} from "@/lib/lightReward";
import {
  buildLightParticlePath,
  getLightRewardArrivalMs,
  getLightRewardTargetPoint,
} from "@/lib/lightRewardGeometry";

const ease = [0.22, 1, 0.36, 1] as const;
const PARTICLE_COUNT = 3;
const PARTICLE_START_S = 1.78;
const PARTICLE_TRAVEL_S = 1.18;
const PARTICLE_ABSORB_S = 0.18;
const PARTICLE_DELAY_S = 0.045;
const PARTICLE_TOTAL_S = PARTICLE_TRAVEL_S + PARTICLE_ABSORB_S;
const PARTICLE_LAND_PROGRESS = PARTICLE_TRAVEL_S / PARTICLE_TOTAL_S;
const ARRIVE_MS = getLightRewardArrivalMs({
  startSeconds: PARTICLE_START_S,
  particleCount: PARTICLE_COUNT,
  staggerSeconds: PARTICLE_DELAY_S,
  travelSeconds: PARTICLE_TRAVEL_S,
});
const DONE_MS = 3500;
const REDUCED_DONE_MS = 2850;
const FEEDBACK_BOTTOM_OFFSET = 185;
const FEEDBACK_MIN_Y_RATIO = 0.58;
const FEEDBACK_BOTTOM_SAFE_GAP = 118;

export interface LightRewardEvent {
  id: number;
  occurredAt: number;
}

export type EnergyRewardEvent = LightRewardEvent;

export interface EnergyRewardFeedbackProps {
  event: LightRewardEvent | null;
  targetRef: RefObject<HTMLElement | null>;
  onArrive: () => void;
  onDone: () => void;
}

type Point = {
  x: number;
  y: number;
};

type Size = {
  width: number;
  height: number;
};

type FlightGeometry = {
  origin: Point;
  target: Point;
};

type LightVisual = {
  Icon: LucideIcon;
  particleClass: string;
};

const lightVisuals: Record<LightRewardKind, LightVisual> = {
  sunlight: {
    Icon: Sun,
    particleClass: "text-ink/75",
  },
  moonlight: {
    Icon: Moon,
    particleClass: "text-ink/75",
  },
  starlight: {
    Icon: Star,
    particleClass: "text-ink/75",
  },
};

function getFallbackTarget(bounds: Size): Point {
  return {
    x: bounds.width - 54,
    y: 78,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getFeedbackOrigin(bounds: Size): Point {
  const minY = bounds.height * FEEDBACK_MIN_Y_RATIO;
  const maxY = bounds.height - FEEDBACK_BOTTOM_SAFE_GAP;
  const idealY = bounds.height - FEEDBACK_BOTTOM_OFFSET;

  return {
    x: bounds.width / 2,
    y: maxY > minY ? clamp(idealY, minY, maxY) : Math.max(48, maxY),
  };
}

const particleOffsets = [
  { x: -22, y: -18, rotate: -14 },
  { x: 20, y: -22, rotate: 12 },
  { x: -4, y: 18, rotate: -4 },
];

export default function EnergyRewardFeedback({
  event,
  targetRef,
  onArrive,
  onDone,
}: EnergyRewardFeedbackProps) {
  const prefersReducedMotion = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [geometry, setGeometry] = useState<FlightGeometry | null>(null);

  useEffect(() => {
    if (!event) {
      setGeometry(null);
      return;
    }

    const overlayElement = overlayRef.current;
    const overlayBounds = overlayElement?.getBoundingClientRect();
    if (!overlayElement || !overlayBounds) return;

    // The surrounding demo can be CSS-scaled. DOMRects use rendered pixels,
    // while absolute positions inside the overlay use its unscaled layout pixels.
    const overlayLayoutSize = {
      width: overlayElement.clientWidth,
      height: overlayElement.clientHeight,
    };

    const targetElement =
      targetRef.current?.querySelector<SVGElement>(
        "[data-light-reward-target]",
      ) ?? targetRef.current;
    const targetBounds = targetElement?.getBoundingClientRect();
    const target = targetBounds
      ? getLightRewardTargetPoint(
          overlayBounds,
          overlayLayoutSize,
          targetBounds,
        )
      : getFallbackTarget(overlayLayoutSize);

    setGeometry({
      origin: getFeedbackOrigin(overlayLayoutSize),
      target,
    });
  }, [event, targetRef]);

  useEffect(() => {
    if (!event) return;

    const arriveTimer = prefersReducedMotion
      ? null
      : window.setTimeout(onArrive, ARRIVE_MS);
    const doneTimer = window.setTimeout(
      onDone,
      prefersReducedMotion ? REDUCED_DONE_MS : DONE_MS,
    );

    return () => {
      if (arriveTimer !== null) window.clearTimeout(arriveTimer);
      window.clearTimeout(doneTimer);
    };
  }, [event, onArrive, onDone, prefersReducedMotion]);

  const lightKind = event
    ? getLightRewardKind(event.occurredAt)
    : "starlight";
  const visual = lightVisuals[lightKind];
  const LightIcon = visual.Icon;
  const title = getLightRewardTitle(lightKind);

  return (
    <div
      ref={overlayRef}
      data-light-reward-overlay
      className="pointer-events-none absolute inset-0 z-50 overflow-hidden"
    >
      <AnimatePresence>
        {event && geometry && (
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
                left: geometry.origin.x,
                top: geometry.origin.y,
                transform: "translate(-50%, -50%)",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={
                  prefersReducedMotion
                    ? { opacity: [0, 1, 1, 0], y: [-6, 0, 0, -3] }
                    : {
                        opacity: [0, 1, 1, 0],
                        y: [-8, 0, 0, -10],
                        scale: [0.96, 1, 1, 0.92],
                      }
                }
                transition={{
                  duration: prefersReducedMotion ? 2.75 : 2.68,
                  times: [0, 0.1, 0.82, 1],
                  ease,
                }}
                role="status"
                className="min-w-[146px] rounded-[18px] border border-line/70 bg-white/80 px-4 py-3 text-center text-ink shadow-[0_8px_20px_rgba(44,59,39,0.08)] backdrop-blur-sm"
              >
                <div className="text-[14px] font-semibold leading-tight tracking-tight">
                  {title}
                </div>
              </motion.div>
            </div>

            {!prefersReducedMotion &&
              Array.from({ length: PARTICLE_COUNT }).map((_, index) => {
                const offset = particleOffsets[index];
                const dx = geometry.target.x - geometry.origin.x;
                const dy = geometry.target.y - geometry.origin.y;
                const delay =
                  PARTICLE_START_S + index * PARTICLE_DELAY_S;
                const path = buildLightParticlePath(
                  { x: dx, y: dy },
                  { x: offset.x, y: offset.y },
                );
                const positionTransition = {
                  delay,
                  duration: PARTICLE_TRAVEL_S,
                  times: path.times,
                  ease: "linear" as const,
                };

                return (
                  <motion.div
                    key={`${event.id}-${index}`}
                    initial={{
                      x: path.x[0],
                      y: path.y[0],
                      opacity: 0,
                      scale: 0.72,
                      rotate: offset.rotate,
                    }}
                    animate={{
                      x: path.x,
                      y: path.y,
                      opacity: 1,
                      scale: [0.72, 1.08, 0.92, 0.92, 0.18],
                      rotate: 0,
                    }}
                    transition={{
                      x: positionTransition,
                      y: positionTransition,
                      scale: {
                        delay,
                        duration: PARTICLE_TOTAL_S,
                        times: [0, 0.1, 0.35, PARTICLE_LAND_PROGRESS, 1],
                        ease,
                      },
                      rotate: {
                        delay,
                        duration: PARTICLE_TRAVEL_S,
                        ease,
                      },
                      opacity: { delay, duration: 0.12, ease },
                    }}
                    data-light-reward-particle
                    className={`absolute grid h-8 w-8 place-items-center ${visual.particleClass}`}
                    style={{
                      left: geometry.origin.x - 16,
                      top: geometry.origin.y - 16,
                      willChange: "transform, opacity",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <LightIcon
                      aria-hidden="true"
                      className="h-6 w-6"
                      strokeWidth={1.6}
                    />
                  </motion.div>
                );
              })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
