import { useEffect } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

type Props = {
  atStart: boolean;
  atEnd: boolean;
  total: number;
  stepIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
  onEnterFree: () => void;
};

/* —— 案例演示控制层（简化版）——
 * 职责：
 *   - 键盘 ←/→ 切换步骤（末步 → 进入自由体验）
 *   - 移动端 Prev/Next 按钮（桌面端左右大按钮由 UnifiedDemoStage 直接渲染）
 *   - 底部进度点（可点击跳转）
 *
 * 桌面端左右大按钮不在本组件内，因为它们需要紧贴手机左右两侧
 * 作为舞台 flex 的子项，由 UnifiedDemoStage 在 flex 行中直接渲染。
 */
export default function GuidedDemoControls({
  atStart,
  atEnd,
  total,
  stepIndex,
  onPrev,
  onNext,
  onGoTo,
  onEnterFree,
}: Props) {
  // 键盘左右方向键
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (!atStart) onPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (atEnd) onEnterFree();
        else onNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [atStart, atEnd, onPrev, onNext, onEnterFree]);

  const handleNext = atEnd ? onEnterFree : onNext;

  return (
    <>
      {/* 移动端：内联 Prev/Next 按钮（故事面板下方） */}
      <div className="mt-8 flex items-center justify-center gap-3 lg:hidden">
        <button
          onClick={onPrev}
          disabled={atStart}
          aria-label="上一节点"
          className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-ink-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={handleNext}
          aria-label={atEnd ? "完成并进入自由体验" : "下一节点"}
          className="inline-flex h-11 items-center gap-1.5 rounded-full bg-ink px-6 text-[13px] font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
        >
          {atEnd ? (
            <>
              <Check className="h-4 w-4" />
              完成
            </>
          ) : (
            <>
              下一步
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

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

      {/* 键盘引导语 */}
      <p className="mt-3 text-center text-[12px] text-ink-faint">
        键盘 ← / → 切换
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
  isEnd,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  isEnd: boolean;
  onClick: () => void;
}) {
  const isLeft = direction === "left";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={
        isLeft
          ? "上一节点"
          : isEnd
            ? "完成并进入自由体验"
            : "下一节点"
      }
      className="hidden h-12 w-12 shrink-0 place-items-center rounded-full border border-line bg-white text-ink-soft shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] transition-colors hover:border-ink-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 lg:grid"
    >
      {isLeft ? (
        <ChevronLeft className="h-6 w-6" />
      ) : isEnd ? (
        <Check className="h-6 w-6" />
      ) : (
        <ChevronRight className="h-6 w-6" />
      )}
    </button>
  );
}
