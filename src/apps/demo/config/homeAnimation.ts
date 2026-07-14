/* —— 演示模式首页动画注册表 ——
 *
 * 独立于体验模式的动画注册表。即使当前引用同一份动画文件，
 * 也通过独立注册表引用，确保未来替换演示模式动画时不会影响体验模式。
 *
 * 引用隔离原则：两个模式的注册表是独立的对象实例，
 * 修改一方不会影响另一方的引用。 */
import type { HomeTimePhase } from "@/lib/homeTimePhase";

/** 演示模式：各时间段对应的在在首页动画素材路径 */
export const DEMO_HOME_PHASE_SCENE: Record<HomeTimePhase, string> = {
  morning: "/assets/homepage-animations/打开窗帘，阳光自己就挤进来了.webm",
  forenoon:
    "/assets/homepage-animations/根往下扎的时候看不见，等看见时，小苗已经长高了。.webm",
  noon: "/assets/homepage-animations/累了就歇一会儿,草地不会催种子发芽。.webm",
  afternoon: "/assets/homepage-animations/今天有什么小小的好事发生吗？.webm",
  dusk: "/assets/homepage-animations/我喜欢把小事记下来，不然它们会像风一样跑掉。.webm",
  evening:
    "/assets/homepage-animations/走的时候只顾着累，回头才发现，已经走出好远了。.webm",
  night: "/assets/homepage-animations/把心里的事一件件摆出来，它们就没那么挤了。.webm",
};

/** 演示模式：各时间段对应的气泡文案 */
export const DEMO_HOME_PHASE_BUBBLE_TEXT: Record<HomeTimePhase, string> = {
  morning: "打开窗帘，阳光自己就挤进来了",
  forenoon: "根往下扎的时候看不见，等看见时，小苗已经长高了。",
  noon: "累了就歇一会儿，草地不会催种子发芽。",
  afternoon: "今天有什么小小的好事发生吗？",
  dusk: "我喜欢把小事记下来，不然它们会像风一样跑掉。",
  evening: "走的时候只顾着累，回头才发现，已经走出好远了。",
  night: "把心里的事一件件摆出来，它们就没那么挤了。",
};
