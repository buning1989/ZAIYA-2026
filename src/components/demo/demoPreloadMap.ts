/* —— Guided Demo 节点资源预加载映射表 ——
 * 性能优化（2026-07-13）：当前节点稳定显示后，后台只预加载下一个节点。
 *
 * 设计原则：
 * 1. 不把资源地址散落在多个点击事件中，统一映射。
 * 2. 每个节点声明：preloadModule / videos / posters / audio。
 * 3. 预加载只针对「下一个节点」，不预加载下下个。
 * 4. 已加载缓存保留，返回上一节点不重复下载（由 mediaPreloader 去重）。
 * 5. 不改变 Demo 剧情、时间线和页面视觉。
 *
 * 节点 ID 命名规则：phase + index，如 "day1-0"、"day1-summary"、"week2-intro"、"day2-0"。
 */

import type { GuidedPhase } from "./UnifiedDemoStage";
import {
  loadBreathingFlow,
  loadPresenceRoom,
  loadDemoRecordPreview,
  loadDemoPraisePreview,
  loadLookbackPage,
  loadOrganizePage,
} from "@/lib/moduleLoaders";
import { preloadVideo, preloadImage, preloadAudio } from "@/lib/mediaPreloader";

/* —— 对话四状态视频 —— */
const DIALOGUE_VIDEOS = {
  idle: "./assets/zaiya/dialogue/zaiya-dialogue-idle.webm",
  listening: "./assets/zaiya/dialogue/zaiya-dialogue-listening.webm",
  thinking: "./assets/zaiya/dialogue/zaiya-dialogue-thinking.webm",
  responding: "./assets/zaiya/dialogue/zaiya-dialogue-responding.webm",
};

/* —— 节点资源声明 ——
 * phase + index 组合成节点 key。每个节点声明：
 * - preloadModule：动态模块预加载函数（仅一个，避免一次预加载过多）
 * - videos：首个 WebM（不预加载全部视频，避免带宽浪费）
 * - posters：poster 图片
 * - audio：必须的音频
 * 注意：只声明「进入该节点时需要」的资源，不声明全部。 */
type NodeResources = {
  preloadModule?: () => void;
  videos?: string[];
  posters?: string[];
  audio?: string[];
};

const DAY1_0: NodeResources = {
  videos: ["./assets/zaiya/wake-up.webm"],
  posters: ["./assets/zaiya/wake-up-poster.png"],
};

const DAY1_1: NodeResources = {
  // 07:35：对话 + 呼吸法 secondary
  preloadModule: () => {
    loadBreathingFlow();
  },
  videos: [DIALOGUE_VIDEOS.idle],
};

const DAY1_2: NodeResources = {
  // 12:00：手表 + zaizai-eating
  videos: ["./assets/zaiya/zaizai-eating.webm"],
};

const DAY1_3: NodeResources = {
  // 20:00：一起发呆
  preloadModule: () => {
    loadPresenceRoom();
  },
  videos: ["./assets/social/daze/scene-together-15s.webm"],
  audio: ["./assets/social/daze/together-bgm.mp3"],
};

const DAY1_4: NodeResources = {
  // 01:30：反刍失眠（对话）
  videos: [DIALOGUE_VIDEOS.idle],
};

const DAY1_SUMMARY: NodeResources = {};

const WEEK2_INTRO: NodeResources = {};

const DAY2_0: NodeResources = {
  // 第二周 06:40：home 模式，ZaizaiHomeScene 按 phase 加载
  // ZaizaiHomeScene 内部已有自己的视频管理，此处不重复声明
};

const DAY2_1: NodeResources = {
  // 10:00：主动记录自己
  preloadModule: () => {
    loadDemoRecordPreview();
  },
};

const DAY2_2: NodeResources = {
  // 15:30：帮我整理
  preloadModule: () => {
    loadOrganizePage();
  },
};

const DAY2_3: NodeResources = {
  // 16:30：夸夸自己
  preloadModule: () => {
    loadDemoPraisePreview();
  },
};

const DAY2_4: NodeResources = {
  // 21:00：回头看看
  preloadModule: () => {
    loadLookbackPage();
  },
};

const GUIDED_RESULT: NodeResources = {};

const GUIDED_PRODUCT_VALUE: NodeResources = {};

/* —— 节点 key 生成 —— */
export function getNodeKey(
  phase: GuidedPhase,
  day1Index: number,
  day2Index: number,
): string {
  switch (phase) {
    case "intro":
      return "intro";
    case "day1":
      return `day1-${day1Index}`;
    case "day1-summary":
      return "day1-summary";
    case "week2-intro":
      return "week2-intro";
    case "day2":
      return `day2-${day2Index}`;
    case "guided-result":
      return "guided-result";
    case "guided-product-value":
      return "guided-product-value";
    default:
      return "intro";
  }
}

/* —— 节点 key → 资源映射 —— */
const NODE_RESOURCES: Record<string, NodeResources> = {
  intro: {},
  "day1-0": DAY1_0,
  "day1-1": DAY1_1,
  "day1-2": DAY1_2,
  "day1-3": DAY1_3,
  "day1-4": DAY1_4,
  "day1-summary": DAY1_SUMMARY,
  "week2-intro": WEEK2_INTRO,
  "day2-0": DAY2_0,
  "day2-1": DAY2_1,
  "day2-2": DAY2_2,
  "day2-3": DAY2_3,
  "day2-4": DAY2_4,
  "guided-result": GUIDED_RESULT,
  "guided-product-value": GUIDED_PRODUCT_VALUE,
};

/* —— 计算下一个节点 key —— */
export function getNextNodeKey(
  phase: GuidedPhase,
  day1Index: number,
  day2Index: number,
  day1Length: number,
  day2Length: number,
): string | null {
  switch (phase) {
    case "intro":
      return "day1-0";
    case "day1":
      if (day1Index < day1Length - 1) return `day1-${day1Index + 1}`;
      return "day1-summary";
    case "day1-summary":
      return "week2-intro";
    case "week2-intro":
      return "day2-0";
    case "day2":
      if (day2Index < day2Length - 1) return `day2-${day2Index + 1}`;
      return "guided-result";
    case "guided-result":
      return "guided-product-value";
    case "guided-product-value":
      return null;
    default:
      return null;
  }
}

/* —— 预加载指定节点的资源 —— */
export function preloadNodeResources(nodeKey: string): void {
  const resources = NODE_RESOURCES[nodeKey];
  if (!resources) return;

  if (resources.preloadModule) {
    try {
      resources.preloadModule();
    } catch {
      // 错误吞吐
    }
  }

  if (resources.videos) {
    resources.videos.forEach((url) => preloadVideo(url));
  }
  if (resources.posters) {
    resources.posters.forEach((url) => preloadImage(url));
  }
  if (resources.audio) {
    resources.audio.forEach((url) => preloadAudio(url));
  }
}

/* —— 对话状态预加载链 ——
 * idle 显示时预加载 listening；
 * 用户开始输入时预加载 thinking；
 * thinking 显示时预加载 responding；
 * 不一次加载四个状态。 */
export function preloadDialogueState(
  currentState: "idle" | "listening" | "thinking" | "responding",
): void {
  const nextMap: Record<string, string> = {
    idle: DIALOGUE_VIDEOS.listening,
    listening: DIALOGUE_VIDEOS.thinking,
    thinking: DIALOGUE_VIDEOS.responding,
    responding: DIALOGUE_VIDEOS.idle,
  };
  const next = nextMap[currentState];
  if (next) preloadVideo(next);
}
