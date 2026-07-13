import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  total: number;
  stepIndex: number;
  onGoTo: (index: number) => void;
};

/* —— 案例演示控制层（简化版）——
 * 职责：
 *   - 底部进度点（可点击跳转）
 *   - 轻量提示语
 *
 * 导航（左右箭头、键盘、滑动）由 UnifiedDemoStage 统一处理。
 * 不再包含移动端 Prev/Next 按钮，统一使用滑动切换。
 */
export default function GuidedDemoControls({
  total,
  stepIndex,
  onGoTo,
}: Props) {
  return (
    <>
      {/* 底部进度点：可点击跳转 */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {Array.from({ length: total }, (_, i) => {
          const active = i === stepIndex;
          return (
            <button
              key={i}
              onClick={() => onGoTo(i)}
              aria-label={`跳转到第 ${i + 1} 步`}
              className={[
                "h-1.5 rounded-full transition-all",
                active
                  ? "w-5 bg-ink"
                  : "w-1.5 bg-line hover:bg-ink-faint",
              ].join(" ")}
            />
          );
        })}
      </div>

      {/* 提示语 */}
      <p className="mt-3 text-center text-[12px] text-ink-faint">
        键盘 ← / → 或左右滑动切换
      </p>
    </>
  );
}

/* —— 桌面端左右大按钮（由 UnifiedDemoStage 在 flex 行中渲染）——
 * 导出为独立组件，保持样式一致。
 */
export function NavArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const isLeft = direction === "left";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={isLeft ? "上一页" : "下一页"}
      className="hidden h-12 w-12 shrink-0 place-items-center rounded-full border border-line bg-white text-ink-soft shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] transition-colors hover:border-ink-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 lg:grid"
    >
      {isLeft ? (
        <ChevronLeft className="h-6 w-6" />
      ) : (
        <ChevronRight className="h-6 w-6" />
      )}
    </button>
  );
}

