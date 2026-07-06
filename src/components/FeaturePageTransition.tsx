import { motion, useDragControls } from "framer-motion";
import type { ReactNode } from "react";

/**
 * 一级功能页面统一过渡组件（对话 / 缓解 / 共同在场共用）。
 *
 * 进入：从下方上浮进入（Spring）。
 * 退出：整体下滑 + 透明度降低 + 轻微缩放（100%→97%→95%）。
 * 支持下滑手势退出（iOS Modal 风格），仅页面上半区域可拖动。
 */

type Props = {
  /** 页面唯一 key，用于 AnimatePresence 区分不同页面 */
  pageKey: string;
  /** 退出回调（关闭 / 下滑退出 / 点击 ×） */
  onExit: () => void;
  /** 页面内容 */
  children: ReactNode;
  /** 是否启用下滑退出手势。默认 true */
  enableDragExit?: boolean;
};

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

const exitTransition = {
  duration: 0.25,
  ease: [0.32, 0, 0.67, 0] as const,
};

export default function FeaturePageTransition({
  pageKey,
  onExit,
  children,
  enableDragExit = true,
}: Props) {
  const dragControls = useDragControls();

  const handleDragEnd = (
    _: unknown,
    info: { offset: { y: number }; velocity: { y: number } },
  ) => {
    // 下滑超过 120px 或速度超过 300px/s 触发退出
    if (info.offset.y > 120 || info.velocity.y > 300) {
      onExit();
    }
    // 未达阈值时 framer-motion 自动 spring 回 animate 位置
  };

  return (
    <motion.div
      key={pageKey}
      initial={{ y: "100%", opacity: 0, scale: 0.97 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{
        y: "100%",
        opacity: 0,
        scale: 0.95,
        transition: exitTransition,
      }}
      transition={springTransition}
      drag={enableDragExit ? "y" : false}
      dragControls={enableDragExit ? dragControls : undefined}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.15 }}
      onDragEnd={enableDragExit ? handleDragEnd : undefined}
      className="absolute inset-0"
    >
      {children}

      {/* 拖拽手柄：仅覆盖页面上半区域（45%），透明，不阻断下层视觉。
          用户按住此区域即可拖动整个页面下滑退出。 */}
      {enableDragExit && (
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="absolute inset-x-0 top-0 h-[45%] z-30"
          style={{ touchAction: "none" }}
        />
      )}
    </motion.div>
  );
}

/**
 * 统一关闭按钮（右上角 ×）。
 * 位置：状态栏下方，right-5 top-12。
 * 尺寸：h-7 w-7。
 * 样式：圆形，text-ink-faint，hover 变深。
 * z-40 确保在拖拽手柄（z-30）之上可点击。
 */
export function CloseButton({
  onClick,
  ariaLabel = "关闭",
}: {
  onClick: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="absolute right-5 top-12 z-40 grid h-7 w-7 place-items-center rounded-full text-ink-faint transition-colors hover:text-ink"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <path d="M3 3l8 8M11 3l-8 8" />
      </svg>
    </button>
  );
}
