import { useState } from "react";
import { setStorageMode } from "@/shared/storage/namespacedStorage";
import UnifiedDemoStage from "@/components/demo/UnifiedDemoStage";

/* —— 体验模式 App Shell（free）——
 *
 * 职责：
 *   1. 在挂载子组件前同步设置存储命名空间为 "experience"，确保所有
 *      数据层读写落到 zaiya-experience-* 键，与演示模式完全隔离。
 *   2. 以 data-app-mode="experience" 命名空间包裹根节点，为后续 CSS
 *      作用域收紧预留钩子。
 *   3. 渲染体验模式专用舞台（当前委托 UnifiedDemoStage mode="free"，
 *      Phase 3 将拆分为独立 ExperienceStage，移除 mode=== 条件判断）。
 *
 * 注意：setStorageMode 必须在子组件挂载前同步完成，因此使用 useState
 *   初始化器（render phase 同步执行），而非 useEffect（异步，子组件
 *   已挂载后才执行）。 */
type Props = {
  onReturnHome: () => void;
  onSwitchToGuided: () => void;
};

export default function ExperienceApp({
  onReturnHome,
  onSwitchToGuided,
}: Props) {
  const [ready] = useState(() => {
    setStorageMode("experience");
    return true;
  });

  if (!ready) return null;

  return (
    <div data-app-mode="experience" className="contents">
      <UnifiedDemoStage
        mode="free"
        onReturnHome={onReturnHome}
        onSwitchToGuided={onSwitchToGuided}
        onSwitchToFree={() => {}}
      />
    </div>
  );
}
