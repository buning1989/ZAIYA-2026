import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { softRevealItemVariants } from "@/lib/motionVariants";
import { type HomeTimePhase } from "@/lib/homeTimePhase";
import { getHomePhaseBubbleText } from "@/shared/config/homeAnimationRegistry";

/* —— 首页轻状态文案：属于在在动画模块，不作为独立气泡覆盖动画 ——
 * 每个时间段显示对应的一句文案，与动画绑定。
 * 文案以打字机节奏出现。
 *
 * 视觉：普通居中文案，无卡片背景；使用 .bubble-copy 陪伴文案样式（中文字体栈、柔和深灰绿、宽松行高），区别于功能字体。
 * 动效：跟随动画模块的 soft reveal。
 *
 * 演示模式：传入 overrideCopy 时只展示该文案，并循环使用打字机增强在场感。
 * 自由体验模式不受影响。
 */

const TYPEWRITER_INTERVAL_MS = 80;
const OVERRIDE_TYPEWRITER_INTERVAL_MS = 55;
const COPY_HOLD_MS = 3200;

export default function HomeBubbleCopy({
  phase,
  overrideCopy,
  emphasisText,
}: {
  phase: HomeTimePhase;
  /** 演示模式注入的固定文案。提供时只展示该文案，并循环打字。 */
  overrideCopy?: string;
  /** 演示模式下需要轻量强调的首个片段。 */
  emphasisText?: string;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  // 场景切换时重新开始打字效果
  // 演示模式下 overrideCopy 不受 phase 重置影响（直接展示完整文案）。
  useEffect(() => {
    if (overrideCopy) return;
    setVisibleCount(0);
  }, [phase, overrideCopy]);

  const text = overrideCopy ?? getHomePhaseBubbleText()[phase];
  const textChars = Array.from(text);
  const visibleText = prefersReducedMotion
    ? text
    : textChars.slice(0, visibleCount).join("");
  // 打字中显示轻光标；减少动态效果时直接展示完整文案。
  const isTyping =
    !prefersReducedMotion && visibleCount < textChars.length;
  const emphasisStart =
    overrideCopy && emphasisText ? visibleText.indexOf(emphasisText) : -1;
  const hasEmphasis = emphasisStart >= 0 && !!emphasisText;

  useEffect(() => {
    if (overrideCopy) {
      if (prefersReducedMotion) {
        setVisibleCount(textChars.length);
        return;
      }

      setVisibleCount(0);

      let typingTimer: number | undefined;
      let holdTimer: number | undefined;

      const play = () => {
        let nextCount = 0;
        setVisibleCount(0);
        typingTimer = window.setInterval(() => {
          nextCount += 1;
          setVisibleCount(nextCount);

          if (nextCount >= textChars.length) {
            if (typingTimer !== undefined) {
              window.clearInterval(typingTimer);
            }
            holdTimer = window.setTimeout(play, COPY_HOLD_MS);
          }
        }, OVERRIDE_TYPEWRITER_INTERVAL_MS);
      };

      play();

      return () => {
        if (typingTimer !== undefined) {
          window.clearInterval(typingTimer);
        }
        if (holdTimer !== undefined) {
          window.clearTimeout(holdTimer);
        }
      };
    }

    const chars = Array.from(text);

    if (prefersReducedMotion) {
      setVisibleCount(chars.length);
      return;
    }

    setVisibleCount(0);

    if (chars.length === 0) {
      return;
    }

    let nextCount = 0;
    const typingTimer = window.setInterval(() => {
      nextCount += 1;
      setVisibleCount(nextCount);

      if (nextCount >= chars.length) {
        window.clearInterval(typingTimer);
      }
    }, TYPEWRITER_INTERVAL_MS);

    return () => {
      window.clearInterval(typingTimer);
    };
    // overrideCopy 变化时重新初始化展示
  }, [phase, prefersReducedMotion, text, overrideCopy, textChars.length]);

  return (
    <motion.div
      variants={softRevealItemVariants}
      className="bubble-copy min-h-[60px]"
    >
      {hasEmphasis ? (
        <>
          {visibleText.slice(0, emphasisStart)}
          <span className="decoration-[#7d9b7d] decoration-[1px] underline underline-offset-[3px]">
            {visibleText.slice(emphasisStart, emphasisStart + emphasisText.length)}
          </span>
          {visibleText.slice(emphasisStart + emphasisText.length)}
        </>
      ) : (
        visibleText
      )}
      {isTyping && (
        <span
          aria-hidden="true"
          className="ml-[1px] inline-block h-[1em] w-px translate-y-[2px] animate-pulse bg-current opacity-50"
        />
      )}
    </motion.div>
  );
}
