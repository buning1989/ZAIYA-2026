import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Zap } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;
const PARTICLE_COUNT = 5;
const PARTICLE_START_S = 1.86;
const PARTICLE_FLIGHT_S = 0.9;
const ARRIVE_MS = 3020;
const DONE_MS = 3350;
const REDUCED_ARRIVE_MS = 2000;
const REDUCED_DONE_MS = 2300;
const TOAST_BOTTOM_OFFSET = 185;
const TOAST_MIN_Y_RATIO = 0.58;
const TOAST_BOTTOM_SAFE_GAP = 118;

export interface RecordEnergyRewardEvent {
  id: number;
  reward: number;
}

export interface RecordEnergyToastProps {
  event: RecordEnergyRewardEvent | null;
  targetRef: RefObject<HTMLElement | null>;
  onArrive: () => void;
  onDone: () => void;
  /** 自定义文案；不传则使用默认「获得了 N 个能量值」 */
  text?: string;
}

type Point = {
  x: number;
  y: number;
};

type FlightGeometry = {
  origin: Point;
  target: Point;
};

function getFallbackTarget(bounds: DOMRect): Point {
  return {
    x: bounds.width - 54,
    y: 78,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getToastOrigin(bounds: DOMRect): Point {
  const minY = bounds.height * TOAST_MIN_Y_RATIO;
  const maxY = bounds.height - TOAST_BOTTOM_SAFE_GAP;
  const idealY = bounds.height - TOAST_BOTTOM_OFFSET;

  return {
    x: bounds.width / 2,
    y: maxY > minY ? clamp(idealY, minY, maxY) : Math.max(48, maxY),
  };
}

const particleOffsets = [
  { x: -26, y: -16, rotate: -18 },
  { x: 18, y: -26, rotate: 16 },
  { x: -14, y: 18, rotate: -8 },
  { x: 28, y: 12, rotate: 24 },
  { x: 0, y: -34, rotate: 6 },
];

export default function RecordEnergyToast({
  event,
  targetRef,
  onArrive,
  onDone,
  text,
}: RecordEnergyToastProps) {
  const prefersReducedMotion = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [geometry, setGeometry] = useState<FlightGeometry | null>(null);

  useEffect(() => {
    if (!event) {
      setGeometry(null);
      return;
    }

    const overlayBounds = overlayRef.current?.getBoundingClientRect();
    if (!overlayBounds) return;

    const targetBounds = targetRef.current?.getBoundingClientRect();
    const target = targetBounds
      ? {
          x: targetBounds.left - overlayBounds.left + targetBounds.width / 2,
          y: targetBounds.top - overlayBounds.top + targetBounds.height / 2,
        }
      : getFallbackTarget(overlayBounds);

    setGeometry({
      origin: getToastOrigin(overlayBounds),
      target,
    });
  }, [event, targetRef]);

  useEffect(() => {
    if (!event) return;

    const arriveTimer = window.setTimeout(
      onArrive,
      prefersReducedMotion ? REDUCED_ARRIVE_MS : ARRIVE_MS,
    );
    const doneTimer = window.setTimeout(
      onDone,
      prefersReducedMotion ? REDUCED_DONE_MS : DONE_MS,
    );

    return () => {
      window.clearTimeout(arriveTimer);
      window.clearTimeout(doneTimer);
    };
  }, [event, onArrive, onDone, prefersReducedMotion]);

  const reward = event?.reward ?? 0;
  const readableText = text ?? `获得了 ${reward} 个能量值`;

  return (
    <div
      ref={overlayRef}
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
                  duration: prefersReducedMotion ? 2.15 : 2.08,
                  times: prefersReducedMotion
                    ? [0, 0.12, 0.9, 1]
                    : [0, 0.12, 0.875, 1],
                  ease,
                }}
                className="whitespace-nowrap rounded-full border border-status-mood/40 bg-canvas-soft px-4 py-2 text-[14px] font-semibold tracking-tight text-ink shadow-[0_6px_16px_rgba(44,59,39,0.12)]"
              >
                {readableText}
              </motion.div>
            </div>

            {!prefersReducedMotion &&
              Array.from({ length: PARTICLE_COUNT }).map((_, index) => {
                const offset = particleOffsets[index];
                const dx = geometry.target.x - geometry.origin.x;
                const dy = geometry.target.y - geometry.origin.y;

                return (
                  <motion.div
                    key={`${event.id}-${index}`}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.65 }}
                    animate={{
                      x: [0, offset.x, dx],
                      y: [0, offset.y, dy],
                      opacity: [0, 1, 1, 0],
                      scale: [0.65, 1.08, 0.45],
                      rotate: [0, offset.rotate, offset.rotate * 0.4],
                    }}
                    transition={{
                      delay: PARTICLE_START_S + index * 0.045,
                      duration: PARTICLE_FLIGHT_S,
                      times: [0, 0.14, 1],
                      ease,
                    }}
                    className="absolute grid h-6 w-6 place-items-center rounded-full border border-status-mood/45 bg-action-primary/20 text-ink shadow-[0_8px_18px_rgba(44,59,39,0.16)]"
                    style={{
                      left: geometry.origin.x - 12,
                      top: geometry.origin.y - 12,
                    }}
                  >
                    <Zap className="h-3.5 w-3.5 fill-current" strokeWidth={1.8} />
                  </motion.div>
                );
              })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
