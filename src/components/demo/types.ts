/* —— 案例演示共享类型 ——
 * 集中 DialogItem / AppMainSurfaceDemoState / GuidedScenarioStep 等类型，
 * 供 AppMainSurface、案例脚本、GuidedScenarioPlayer 共用，
 * 避免类型在多处重复定义导致漂移。
 *
 * 使用原则：
 * - demoState.enabled !== true 时，AppMainSurface 完全保持现有自由体验逻辑
 * - demoState.enabled === true 时，允许外部覆盖内部模式 / 时间 / 气泡 / 对话 / 轻社交场景
 * - 不通过 DOM click 自动点击按钮推进演示
 * - 不改动现有业务模块逻辑，不影响自由体验模式
 */

/** 对话消息角色：用户 / 在在 */
export type DialogMessageRole = "user" | "zaizai";

/** 对话消息条目 */
export type DialogMessageItem = {
  kind: "message";
  id: string;
  role: DialogMessageRole;
  text: string;
  createdAt: number;
};

/** 对话时间分隔条目 */
export type DialogTimeItem = {
  kind: "time";
  id: string;
  label: string;
  createdAt: number;
};

/** 对话条目（消息 | 时间分隔） */
export type DialogItem = DialogMessageItem | DialogTimeItem;

/** AppMainSurface 首页内模式（与组件内部 SurfaceMode 对齐的演示可控子集） */
export type DemoSurfaceMode =
  | "home"
  | "dialog"
  | "reliefSelect"
  | "breathing"
  | "socialSelect"
  | "socialFlow";

/** 轻社交场景标识（演示仅启用 daze / eat） */
export type DemoSocialScene = "daze" | "eat";

/**
 * AppMainSurface 演示状态注入接口。
 *
 * - enabled !== true：组件完全保持现有自由体验逻辑
 * - enabled === true：以下字段优先于内部状态
 *   - now：固定演示时间，覆盖系统时间（影响状态栏 / 时间锚点 / 在在场景时段）
 *   - surfaceMode：覆盖首页内部模式（home / dialog / reliefSelect / breathing / socialSelect / socialFlow）
 *   - socialScene：当 surfaceMode=socialFlow 时，指定场景（daze / eat）
 *   - bubbleCopy：覆盖首页轻状态气泡文案（仅 home 模式生效）
 *   - dialogItems：替换对话区消息列表（仅 dialog 模式生效，同时禁用本地输入与发送）
 */
export type AppMainSurfaceDemoState = {
  enabled?: boolean;
  now?: Date;
  surfaceMode?: DemoSurfaceMode;
  socialScene?: DemoSocialScene | null;
  bubbleCopy?: string;
  dialogItems?: DialogItem[];
};

/** 案例演示单步配置 */
export type GuidedScenarioStep = {
  id: string;
  /** 步骤序号（1-based），与数组 index + 1 一致，便于脚本阅读 */
  order: number;
  /** 步骤时间标签，例如 "06:40" */
  time: string;
  /** 步骤标题，例如 "起床失败" */
  title: string;
  /** 一句话场景说明（右侧故事面板主文案） */
  summary: string;
  /** 可选补充说明（右侧故事面板次文案，更克制的注解） */
  detail?: string;
  /** 该步骤对应的产品演示状态 */
  demoState: AppMainSurfaceDemoState;
};

/** 案例脚本：一个完整案例由若干步骤组成 */
export type GuidedScenario = {
  id: string;
  /** 案例名称，例如 "小晨第一天" */
  name: string;
  /** 案例简短描述 */
  description?: string;
  steps: GuidedScenarioStep[];
};
