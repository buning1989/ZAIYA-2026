import { useCallback, useEffect, useRef, useState } from "react";
import { getEnergy, subscribeEnergy } from "@/data/userProfile";

/* —— 全局能量值展示态 Hook ——
 *
 * 所有模块统一通过此 Hook 读取能量值，确保跨模块同步：
 *   - 初始化时从 localStorage 读取最新值
 *   - 订阅 subscribeEnergy，任一模块调用 addEnergy 后即时刷新
 *   - freeze / unfreeze：用于能量飞行动画期间「冻结」展示值，
 *     避免数字在 toast 抵达前就跳变（破坏飞抵后 +pulse 的反馈节奏）。
 *
 * 典型用法：
 *   const { value, freeze, unfreeze } = useEnergy();
 *   // 发放能量前：freeze()
 *   // addEnergy(...) → 其他模块的 Hook 自动同步
 *   // toast 飞抵后：unfreeze() → 本地展示值刷新到最新 + 触发 pulse
 *
 * 不触发能量的模块只需读取 value 即可。
 */
export function useEnergy() {
  const [value, setValue] = useState<number>(() => getEnergy());
  const frozenRef = useRef(false);

  useEffect(() => {
    const unsubscribe = subscribeEnergy((v) => {
      if (!frozenRef.current) setValue(v);
    });
    return unsubscribe;
  }, []);

  /** 冻结展示值：抑制订阅更新，用于 toast 飞行期间保持旧数字 */
  const freeze = useCallback(() => {
    frozenRef.current = true;
  }, []);

  /** 解冻并同步到 localStorage 最新值（toast 抵达后调用） */
  const unfreeze = useCallback(() => {
    frozenRef.current = false;
    setValue(getEnergy());
  }, []);

  return { value, freeze, unfreeze };
}
