import type { Variants } from "framer-motion";

/* —— 全局动效语言：软浮现（softReveal）——
 * 提取自项目已有的交错入场语言：
 *   - 「更多」侧边栏菜单项：opacity + x 上浮，依次延迟（MoreMenu.tsx）
 *   - Demo 时间线条目：opacity 0→1, y 8→0, delay: i*0.08, duration 0.4（Demo.tsx）
 * 统一为"轻量信息依次浮现 / 轻退出"，供首页时间锚点等轻量信息复用，
 * 避免 Demo 中出现割裂的动画风格。
 *
 * 进入：opacity 0→1, y 8→0，依次延迟（staggerChildren 0.08）
 * 离开：opacity 1→0, y 0→-4，更快（0.2s），轻上移淡出
 * ease 统一使用项目既有 [0.22, 1, 0.36, 1]
 */

/** 项目统一缓动（与 MoreMenu / Demo / AppMainSurface 一致） */
export const SOFT_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** 容器：编排子项依次入场；离开时近乎同时淡出 */
export const softRevealContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

/** 子项：淡入上浮 / 淡出轻上移 */
export const softRevealItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: SOFT_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.2,
      ease: SOFT_EASE,
    },
  },
};
