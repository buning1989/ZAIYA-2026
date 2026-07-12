import GuidedDemoHeader from "./GuidedDemoHeader";
import GuidedDemoStage from "./GuidedDemoStage";
import GuidedDemoControls from "./GuidedDemoControls";

type Props = {
  onEnterFree: () => void;
  onExitToSelect: () => void;
};

/**
 * 案例演示模式容器：可扩展的占位骨架。
 *
 *   <GuidedDemoHeader />   后续：案例名称、步骤进度、切换自由体验
 *   <GuidedDemoStage />    后续：真实 Demo 页面与高亮区域
 *   <GuidedDemoControls /> 后续：暂停 / 继续 / 上一步 / 下一步 / 退出
 *
 * 本阶段仅完成布局与占位，不实现播放逻辑。
 */
export default function GuidedDemoShell({
  onEnterFree,
  onExitToSelect,
}: Props) {
  return (
    <div className="flex min-h-full flex-col">
      <GuidedDemoHeader onSwitchToFree={onEnterFree} />
      <GuidedDemoStage onEnterFree={onEnterFree} onExitToSelect={onExitToSelect} />
      <GuidedDemoControls />
    </div>
  );
}
