/* —— 首页时间段判断与场景 / 文案映射 ——
 * 统一首页"当前处于什么生活节律"的判断，供在在动画场景、状态文案、
 * 环境信息等共用，避免多处各自实现规则不一致。
 *
 * 时间段规则（按本地系统时间）：
 *   06:00–09:29  morning   晨起
 *   09:30–11:59  forenoon  上午
 *   12:00–14:59  noon      午间休息
 *   15:00–17:29  afternoon 下午
 *   17:30–19:29  dusk      傍晚
 *   19:30–21:59  evening   晚间回顾
 *   22:00–05:59  night     深夜
 */

export type HomeTimePhase =
  | "morning"
  | "forenoon"
  | "noon"
  | "afternoon"
  | "dusk"
  | "evening"
  | "night";

/** 首页动画配置项 */
export type HomepageAnimationConfig = {
  /** 时间段起始分钟数（从零点开始） */
  startMinutes: number;
  /** 时间段结束分钟数（从零点开始） */
  endMinutes: number;
  /** 动画资源路径 */
  src: string;
  /** 气泡文案 */
  bubbleText: string;
  /** 时间段标识 */
  phase: HomeTimePhase;
};

/** 首页动画配置表（按时间段顺序排列） */
export const HOMEPAGE_ANIMATION_CONFIGS: HomepageAnimationConfig[] = [
  {
    phase: "morning",
    startMinutes: 360, // 06:00
    endMinutes: 569, // 09:29
    src: "/assets/homepage-animations/打开窗帘，阳光自己就挤进来了.webm",
    bubbleText: "打开窗帘，阳光自己就挤进来了",
  },
  {
    phase: "forenoon",
    startMinutes: 570, // 09:30
    endMinutes: 719, // 11:59
    src: "/assets/homepage-animations/根往下扎的时候看不见，等看见时，小苗已经长高了。.webm",
    bubbleText: "根往下扎的时候看不见，等看见时，小苗已经长高了。",
  },
  {
    phase: "noon",
    startMinutes: 720, // 12:00
    endMinutes: 899, // 14:59
    src: "/assets/homepage-animations/累了就歇一会儿,草地不会催种子发芽。.webm",
    bubbleText: "累了就歇一会儿，草地不会催种子发芽。",
  },
  {
    phase: "afternoon",
    startMinutes: 900, // 15:00
    endMinutes: 1049, // 17:29
    src: "/assets/homepage-animations/今天有什么小小的好事发生吗？.webm",
    bubbleText: "今天有什么小小的好事发生吗？",
  },
  {
    phase: "dusk",
    startMinutes: 1050, // 17:30
    endMinutes: 1169, // 19:29
    src: "/assets/homepage-animations/我喜欢把小事记下来，不然它们会像风一样跑掉。.webm",
    bubbleText: "我喜欢把小事记下来，不然它们会像风一样跑掉。",
  },
  {
    phase: "evening",
    startMinutes: 1170, // 19:30
    endMinutes: 1319, // 21:59
    src: "/assets/homepage-animations/走的时候只顾着累，回头才发现，已经走出好远了。.webm",
    bubbleText: "走的时候只顾着累，回头才发现，已经走出好远了。",
  },
  {
    phase: "night",
    startMinutes: 1320, // 22:00
    endMinutes: 359, // 05:59（跨午夜）
    src: "/assets/homepage-animations/把心里的事一件件摆出来，它们就没那么挤了。.webm",
    bubbleText: "把心里的事一件件摆出来，它们就没那么挤了。",
  },
];

/** 按当前时间返回首页所处的时间段 */
export function getHomeTimePhase(date: Date): HomeTimePhase {
  const minutes = date.getHours() * 60 + date.getMinutes();
  const config = getHomepageAnimationConfig(minutes);
  return config.phase;
}

/** 根据分钟数获取对应的动画配置 */
export function getHomepageAnimationConfig(
  minutes: number
): HomepageAnimationConfig {
  for (const config of HOMEPAGE_ANIMATION_CONFIGS) {
    // 深夜区间跨午夜：22:00–23:59 或 00:00–05:59
    if (config.startMinutes > config.endMinutes) {
      if (minutes >= config.startMinutes || minutes <= config.endMinutes) {
        return config;
      }
    } else {
      if (minutes >= config.startMinutes && minutes <= config.endMinutes) {
        return config;
      }
    }
  }
  // 默认返回深夜配置（理论上不会走到这里）
  return HOMEPAGE_ANIMATION_CONFIGS[HOMEPAGE_ANIMATION_CONFIGS.length - 1];
}

/* —— 首页时间锚点的时段词（用于主信息「晚上 22:46」前缀）——
 * 与手机状态栏的裸时间区分开，避免混淆；口径比 getHomeTimePhase 更细。 */
export function getHomeTimeLabel(date: Date): string {
  const hour = date.getHours();
  if (hour >= 6 && hour < 9) return "早上";
  if (hour >= 9 && hour < 12) return "上午";
  if (hour >= 12 && hour < 15) return "中午";
  if (hour >= 15 && hour < 18) return "下午";
  if (hour >= 18 && hour < 20) return "傍晚";
  if (hour >= 20 && hour < 22) return "晚上";
  return "夜深了";
}

/* —— 各时间段对应的在在首页动画素材（向后兼容） —— */
export const HOME_PHASE_SCENE: Record<HomeTimePhase, string> = {
  morning: "/assets/homepage-animations/打开窗帘，阳光自己就挤进来了.webm",
  forenoon: "/assets/homepage-animations/根往下扎的时候看不见，等看见时，小苗已经长高了。.webm",
  noon: "/assets/homepage-animations/累了就歇一会儿,草地不会催种子发芽。.webm",
  afternoon: "/assets/homepage-animations/今天有什么小小的好事发生吗？.webm",
  dusk: "/assets/homepage-animations/我喜欢把小事记下来，不然它们会像风一样跑掉。.webm",
  evening: "/assets/homepage-animations/走的时候只顾着累，回头才发现，已经走出好远了。.webm",
  night: "/assets/homepage-animations/把心里的事一件件摆出来，它们就没那么挤了。.webm",
};

/* —— 各时间段对应的气泡文案 —— */
export const HOME_PHASE_BUBBLE_TEXT: Record<HomeTimePhase, string> = {
  morning: "打开窗帘，阳光自己就挤进来了",
  forenoon: "根往下扎的时候看不见，等看见时，小苗已经长高了。",
  noon: "累了就歇一会儿，草地不会催种子发芽。",
  afternoon: "今天有什么小小的好事发生吗？",
  dusk: "我喜欢把小事记下来，不然它们会像风一样跑掉。",
  evening: "走的时候只顾着累，回头才发现，已经走出好远了。",
  night: "把心里的事一件件摆出来，它们就没那么挤了。",
};
