import { lazy, Suspense } from "react";

/* 性能优化（2026-07-13）：@rive-app/react-canvas 库较大（~250KB gzip），
 * 通过 React.lazy 将 RivePlayer 拆为独立 chunk，Logo 文字部分立即可见，
 * Rive 动画在主 bundle 解析完成后异步加载，避免阻塞首屏文字渲染。 */
const RivePlayer = lazy(() => import("./RivePlayer"));

type Props = {
  className?: string;
  showWordmark?: boolean;
  size?: "default" | "nav";
};

/** 在呀 wordmark —— Rive 动画标记 + 文字。 */
export default function Logo({
  className,
  showWordmark = true,
  size = "default",
}: Props) {
  const isNav = size === "nav";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <span
        className={`relative shrink-0 overflow-visible ${
          isNav ? "h-8 w-8" : "h-6 w-6"
        }`}
        aria-hidden="true"
      >
        <Suspense fallback={null}>
          <RivePlayer
            src="./color_eyes_interaction.riv"
            stateMachines="State Machine 1"
            stateMachineBooleans={{ "Following?": true, "Annoying?": false }}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
              isNav ? "h-32 w-32" : "h-24 w-24"
            }`}
          />
        </Suspense>
      </span>
      {showWordmark && (
        <span
          className={`font-brand font-semibold leading-none tracking-normal text-ink ${
            isNav ? "text-[28px]" : "text-2xl"
          }`}
        >
          在呀 <span className="text-ink-faint">ZÀIYA</span>
        </span>
      )}
    </span>
  );
}
