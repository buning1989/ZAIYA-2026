import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { softRevealItemVariants } from "@/lib/motionVariants";
import type { HomeTimePhase } from "@/lib/homeTimePhase";

/* —— 首页轻状态文案：属于在在动画模块，不作为独立气泡覆盖动画 ——
 * 3 句文案顺序循环展示，放在动画上方并与动画同轴排列。
 * 每句以打字机节奏出现，完成后短暂停留再切到下一句。
 *
 * 视觉：普通居中文案，无卡片背景；增加对比度和行高，避免弱到不像引导语。
 * 动效：跟随动画模块的 soft reveal。
 *
 * 演示模式：传入 overrideCopy 时只展示该文案，不循环、不打字机，
 * 随首页挂载柔和出现。自由体验模式不受影响。
 */

const HOME_BUBBLE_COPY = [
  "我只把窗帘拉开了一条小缝，光就自己挤进来了。",
  "没做完的事，我放在明天的门口了，一开门就能看见。",
  "心事说出来，就有了自己的小房子，不用再挤在心里了。",
];

const TYPEWRITER_INTERVAL_MS = 80;
const COPY_HOLD_MS = 3200;

function nextCopyIndex(idx: number): number {
  return (idx + 1) % HOME_BUBBLE_COPY.length;
}

export default function HomeBubbleCopy({
  phase,
  overrideCopy,
}: {
  phase: HomeTimePhase;
  /** 演示模式注入的固定文案。提供时只展示该文案，不循环、不打字机。 */
  overrideCopy?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  // 场景切换时从第一句重新开始，避免不同时段回到首页时卡在半句。
  // 演示模式下 overrideCopy 不受 phase 重置影响（直接展示完整文案）。
  useEffect(() => {
    if (overrideCopy) return;
    setIdx(0);
    setVisibleCount(0);
  }, [phase, overrideCopy]);

  const text = overrideCopy ?? HOME_BUBBLE_COPY[idx] ?? HOME_BUBBLE_COPY[0];
  const textChars = Array.from(text);
  const visibleText = prefersReducedMotion
    ? text
    : textChars.slice(0, visibleCount).join("");
  // 演示模式（overrideCopy 存在）直接展示完整文案，不显示打字光标
  const isTyping =
    !overrideCopy && !prefersReducedMotion && visibleCount < textChars.length;

  useEffect(() => {
    // 演示模式：直接展示完整文案，不启动打字机定时器
    if (overrideCopy) {
      setVisibleCount(textChars.length);
      return;
    }

    const chars = Array.from(text);

    if (prefersReducedMotion) {
      setVisibleCount(chars.length);
      const holdTimer = window.setTimeout(() => {
        setIdx((currentIdx) => nextCopyIndex(currentIdx));
      }, COPY_HOLD_MS);

      return () => window.clearTimeout(holdTimer);
    }

    setVisibleCount(0);

    if (chars.length === 0) {
      const holdTimer = window.setTimeout(() => {
        setIdx((currentIdx) => nextCopyIndex(currentIdx));
      }, COPY_HOLD_MS);

      return () => window.clearTimeout(holdTimer);
    }

    let nextCount = 0;
    let holdTimer: number | undefined;
    const typingTimer = window.setInterval(() => {
      nextCount += 1;
      setVisibleCount(nextCount);

      if (nextCount >= chars.length) {
        window.clearInterval(typingTimer);
        holdTimer = window.setTimeout(() => {
          setIdx((currentIdx) => nextCopyIndex(currentIdx));
        }, COPY_HOLD_MS);
      }
    }, TYPEWRITER_INTERVAL_MS);

    return () => {
      window.clearInterval(typingTimer);
      if (holdTimer !== undefined) {
        window.clearTimeout(holdTimer);
      }
    };
    // overrideCopy 变化时重新初始化展示
  }, [phase, prefersReducedMotion, text, overrideCopy, textChars.length]);

  return (
    <motion.div
      variants={softRevealItemVariants}
      className="min-h-[40px] max-w-[226px] text-center text-[14px] font-normal leading-[20px]"
      style={{ color: "rgba(0, 0, 0, 0.68)" }}
    >
      {visibleText}
      {isTyping && (
        <span
          aria-hidden="true"
          className="ml-[1px] inline-block h-[1em] w-px translate-y-[2px] animate-pulse bg-current opacity-50"
        />
      )}
    </motion.div>
  );
}
