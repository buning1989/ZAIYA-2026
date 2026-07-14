import { useState } from "react";
import { setStorageMode } from "@/shared/storage/namespacedStorage";
import UnifiedDemoStage from "@/components/demo/UnifiedDemoStage";

/* —— 演示模式 App Shell（guided）——
 *
 * 职责：
 *   1. 在挂载子组件前同步设置存储命名空间为 "demo"，确保所有数据层
 *      读写落到 zaiya-demo-* 键，与体验模式完全隔离。
 *   2. 以 data-app-mode="demo" 命名空间包裹根节点，为后续 CSS 作用域
 *      收紧预留钩子。
 *   3. 渲染演示模式专用舞台（当前委托 UnifiedDemoStage mode="guided"，
 *      Phase 3 将拆分为独立 DemoStage，移除 mode=== 条件判断）。
 *
 * 注意：setStorageMode 必须在子组件挂载前同步完成，因此使用 useState
 *   初始化器（render phase 同步执行），而非 useEffect（异步，子组件
 *   已挂载后才执行）。 */
type Props = {
  onReturnHome: () => void;
  onSwitchToFree: () => void;
};

export default function DemoApp({ onReturnHome, onSwitchToFree }: Props) {
  const [ready] = useState(() => {
    setStorageMode("demo");
    return true;
  });

  if (!ready) return null;

  return (
    <div data-app-mode="demo" className="contents">
      <UnifiedDemoStage
        mode="guided"
        onReturnHome={onReturnHome}
        onSwitchToGuided={() => {}}
        onSwitchToFree={onSwitchToFree}
      />
    </div>
  );
}
