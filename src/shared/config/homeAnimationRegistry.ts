/* —— 首页动画注册表选择器 ——
 *
 * 根据当前存储模式（由 App Shell 在挂载时设置）返回对应的动画注册表。
 * 共享展示组件（ZaizaiHomeScene、HomeBubbleCopy 等）通过此选择器
 * 获取动画路径和气泡文案，无需自身包含模式判断逻辑。
 *
 * 选择器在调用时读取当前存储模式，同一时刻仅有一个 Shell 挂载，
 * 因此不存在并发竞争。 */
import { getStorageMode } from "@/shared/storage/namespacedStorage";
import type { HomeTimePhase } from "@/lib/homeTimePhase";
import {
  DEMO_HOME_PHASE_SCENE,
  DEMO_HOME_PHASE_BUBBLE_TEXT,
} from "@/apps/demo/config/homeAnimation";
import {
  EXPERIENCE_HOME_PHASE_SCENE,
  EXPERIENCE_HOME_PHASE_BUBBLE_TEXT,
} from "@/apps/experience/config/homeAnimation";

/** 返回当前模式对应的首页动画素材路径注册表 */
export function getHomePhaseScene(): Record<HomeTimePhase, string> {
  return getStorageMode() === "demo"
    ? DEMO_HOME_PHASE_SCENE
    : EXPERIENCE_HOME_PHASE_SCENE;
}

/** 返回当前模式对应的首页气泡文案注册表 */
export function getHomePhaseBubbleText(): Record<HomeTimePhase, string> {
  return getStorageMode() === "demo"
    ? DEMO_HOME_PHASE_BUBBLE_TEXT
    : EXPERIENCE_HOME_PHASE_BUBBLE_TEXT;
}
