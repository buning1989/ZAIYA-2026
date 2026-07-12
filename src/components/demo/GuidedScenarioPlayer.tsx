import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { GuidedScenario, GuidedScenarioStep } from "./types";

/* —— 案例演示播放器：管理脚本步骤状态 + 暴露导航 API ——
 * 采用 render prop 模式：父组件通过 children 函数获取当前步骤与导航方法，
 * 避免 context 复杂度，同时让 Header / Stage / Controls 共享同一状态源。
 *
 * 职责：
 * - 持有当前步骤索引（stepIndex）
 * - 派生当前步骤（step）/ 总数 / 是否首尾
 * - 提供 next / prev / restart 导航方法
 * - 步骤索引越界时自动夹紧到 [0, total-1]
 *
 * 不负责：
 * - 渲染 AppMainSurface（由 UnifiedDemoStage 通过 DemoPhoneFrame 注入 step.demoState）
 * - 旁白 / 控制按钮 UI（由父组件通过 render props 组合）
 */

export type GuidedScenarioRenderProps = {
  /** 当前步骤对象 */
  step: GuidedScenarioStep;
  /** 当前步骤索引（0-based） */
  stepIndex: number;
  /** 总步骤数 */
  total: number;
  /** 是否在第一步（上一步禁用） */
  atStart: boolean;
  /** 是否在最后一步（下一步变为"重新开始"） */
  atEnd: boolean;
  /** 前进到下一步（最后一步时为 no-op） */
  next: () => void;
  /** 后退到上一步（第一步时为 no-op） */
  prev: () => void;
  /** 重新从第一步开始 */
  restart: () => void;
  /** 跳转到指定步骤索引（自动夹紧到 [0, total-1]） */
  goTo: (index: number) => void;
};

type Props = {
  scenario: GuidedScenario;
  /** render prop：接收步骤状态与导航方法，返回完整布局 */
  children: (props: GuidedScenarioRenderProps) => ReactNode;
};

export default function GuidedScenarioPlayer({ scenario, children }: Props) {
  const [stepIndex, setStepIndex] = useState(0);

  const total = scenario.steps.length;
  const step = scenario.steps[stepIndex] ?? scenario.steps[0];

  const atStart = stepIndex <= 0;
  const atEnd = stepIndex >= total - 1;

  const next = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, total - 1));
  }, [total]);

  const prev = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const restart = useCallback(() => {
    setStepIndex(0);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setStepIndex(Math.max(0, Math.min(index, total - 1)));
    },
    [total],
  );

  const renderProps = useMemo<GuidedScenarioRenderProps>(
    () => ({
      step,
      stepIndex,
      total,
      atStart,
      atEnd,
      next,
      prev,
      restart,
      goTo,
    }),
    [step, stepIndex, total, atStart, atEnd, next, prev, restart, goTo],
  );

  return <>{children(renderProps)}</>;
}
