/* —— 集中式动态模块加载器 ——
 * 性能优化（2026-07-13）：确保 React.lazy 和预加载使用同一个 loader，
 * 避免预加载后又重复请求。
 *
 * 关键约束：
 * - 每个功能的 loader 函数必须是模块级常量，不能在组件内重新创建。
 * - React.lazy 和 preloadModule 必须引用同一个 loader。
 * - Vite 会根据 import() 路径生成同一个 chunk，预加载和真实渲染复用同一份 Promise。
 *
 * 使用方式：
 *   import { loadBreathingFlow, breathingFlowLoader } from "@/lib/moduleLoaders";
 *   const BreathingFlow = lazy(breathingFlowLoader);
 *   // 预加载
 *   loadBreathingFlow();
 */

import { preloadModule } from "./mediaPreloader";

/* —— Guided Demo —— */
export const demoExperienceLoader = () =>
  import("@/components/demo/DemoExperience");
export const loadDemoExperience = () =>
  preloadModule(demoExperienceLoader, "demoExperience");

/* —— Rive —— */
export const rivePlayerLoader = () => import("@/components/RivePlayer");
export const loadRivePlayer = () =>
  preloadModule(rivePlayerLoader, "rivePlayer");

/* —— 呼吸法 —— */
export const breathingFlowLoader = () => import("@/components/BreathingFlow");
export const loadBreathingFlow = () =>
  preloadModule(breathingFlowLoader, "breathingFlow");

/* —— 轻社交：一起发呆 / 一起吃饭 —— */
export const presenceRoomLoader = () => import("@/components/PresenceRoom");
export const loadPresenceRoom = () =>
  preloadModule(presenceRoomLoader, "presenceRoom");

/* —— 记一下 —— */
export const recordFlowLoader = () => import("@/components/RecordFlow");
export const loadRecordFlow = () =>
  preloadModule(recordFlowLoader, "recordFlow");

/* —— 演示态：记一下预览 —— */
export const demoRecordPreviewLoader = () =>
  import("@/components/demo/DemoRecordPreview");
export const loadDemoRecordPreview = () =>
  preloadModule(demoRecordPreviewLoader, "demoRecordPreview");

/* —— 演示态：夸夸预览 —— */
export const demoPraisePreviewLoader = () =>
  import("@/components/demo/DemoPraisePreview");
export const loadDemoPraisePreview = () =>
  preloadModule(demoPraisePreviewLoader, "demoPraisePreview");

/* —— 夸夸自己（真实功能页）—— */
export const praisePageLoader = () => import("@/components/PraisePage");
export const loadPraisePage = () =>
  preloadModule(praisePageLoader, "praisePage");

/* —— 回头看看 —— */
export const lookbackPageLoader = () => import("@/components/LookbackPage");
export const loadLookbackPage = () =>
  preloadModule(lookbackPageLoader, "lookbackPage");

/* —— 帮我整理：主页面 —— */
export const organizePageLoader = () => import("@/components/OrganizePage");
export const loadOrganizePage = () =>
  preloadModule(organizePageLoader, "organizePage");

/* —— 帮我整理：材料详情 —— */
export const materialDetailViewLoader = () =>
  import("@/components/organize/MaterialDetailView");
export const loadMaterialDetailView = () =>
  preloadModule(materialDetailViewLoader, "materialDetailView");

/* —— 帮我整理：完成页 —— */
export const doneStepLoader = () => import("@/components/organize/DoneStep");
export const loadDoneStep = () => preloadModule(doneStepLoader, "doneStep");

/* —— 我的隐私 —— */
export const privacyPageLoader = () => import("@/components/PrivacyPage");
export const loadPrivacyPage = () =>
  preloadModule(privacyPageLoader, "privacyPage");
