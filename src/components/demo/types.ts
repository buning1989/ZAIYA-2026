import type { DailyLookbackData } from "@/data/lookback";
import type { OrganizeHistoryEntry } from "@/data/organize";

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
  | "socialFlow"
  | "record"
  | "praise"
  | "lookback"
  | "organize";

/** 轻社交场景标识（演示仅启用 daze / eat） */
export type DemoSocialScene = "daze" | "eat";

/** 演示用记录预填数据：驱动「记一下」完成态预览，不走真实记录流程 */
export type RecordDemoPreset = {
  /** 记录类型：饮食 / 活动 */
  type: "food" | "activity";
  /** 页面标题：例如「饮食」「活动」 */
  title: string;
  /** 右上角能量值 */
  energyValue: number;
  /** 记录字段行（label + value），复用 RecordSummaryCard 的 SummaryRow 结构 */
  rows: { label: string; value: string }[];
  /** 补充说明完成态内容 */
  note?: string;
  /** 底部主按钮文案 */
  primaryButtonText?: string;
};

/** 演示用夸夸卡片 */
export type PraiseDemoCard = {
  id: string;
  text: string;
  dateLabel: string;
  gradientId: string;
};

/** 演示用夸夸配置：驱动真实结构的「夸夸自己」首页 feed */
export type PraiseDemoConfig = {
  /** 在在引导气泡 */
  guideText: string;
  /** 右上角能量值 */
  energyValue: number;
  /** feed 卡片 */
  cards: PraiseDemoCard[];
  readOnly?: boolean;
};

/** 演示用回头看看配置：驱动真实 LookbackPage 的受控只读结果态 */
export type LookbackDemoConfig = {
  referenceDate: string;
  initialTimeMode?: "week" | "month";
  initialScene?: "mood" | "sleep" | "meals" | "med" | "activity" | "weight";
  dataOverrides?: Record<string, Partial<DailyLookbackData>>;
  readOnly?: boolean;
};

/** 演示用帮我整理配置：驱动真实整理材料组件的受控结果态 */
export type OrganizeDemoConfig = {
  historyEntry: OrganizeHistoryEntry;
  view?: "done" | "materialDetail";
};

/**
 * AppMainSurface 演示状态注入接口。
 *
 * - enabled !== true：组件完全保持现有自由体验逻辑
 * - enabled === true：以下字段优先于内部状态
 *   - now：固定演示时间，覆盖系统时间（影响状态栏 / 时间锚点 / 在在场景时段）
 *   - surfaceMode：覆盖首页内部模式（home / dialog / reliefSelect / breathing / socialSelect / socialFlow）
 *   - socialScene：当 surfaceMode=socialFlow 时，指定场景（daze / eat）
 *   - bubbleCopy：覆盖首页轻状态气泡文案（仅 home 模式生效）
 *   - bubbleEmphasis：在覆盖文案内轻量强调首个匹配片段（仅 home 模式生效）
 *   - dialogItems：替换对话区消息列表（仅 dialog 模式生效，同时禁用本地输入与发送）
 *   - recordPreset：surfaceMode="record" 时驱动「记一下」完成态预览（不走真实记录流程，仅展示已保存态）
 *   - praiseDemo：surfaceMode="praise" 时驱动真实结构的「夸夸自己」首页 feed
 *   - lookbackDemo：surfaceMode="lookback" 时驱动真实「回头看看」只读结果态
 *   - organizeDemo：surfaceMode="organize" 时驱动真实「帮我整理」结果态
 */
export type AppMainSurfaceDemoState = {
  enabled?: boolean;
  now?: Date;
  surfaceMode?: DemoSurfaceMode;
  socialScene?: DemoSocialScene | null;
  bubbleCopy?: string;
  bubbleEmphasis?: string;
  dialogItems?: DialogItem[];
  /** 演示用记录预填：surfaceMode="record" 时驱动「记一下」完成态预览 */
  recordPreset?: RecordDemoPreset;
  /** 演示用夸夸配置：surfaceMode="praise" 时驱动真实结构的「夸夸自己」首页 feed */
  praiseDemo?: PraiseDemoConfig;
  /** 演示用回头看看配置：surfaceMode="lookback" 时驱动真实回头看看只读结果态 */
  lookbackDemo?: LookbackDemoConfig;
  /** 演示用帮我整理配置：surfaceMode="organize" 时驱动真实整理材料结果态 */
  organizeDemo?: OrganizeDemoConfig;
};

/** 案例时间线标识：第一天 / 第二天（使用产品 2 周后的一天） */
export type ScenarioId = "day1" | "day2";

/** 产品模块标签：用于在故事面板中标识当前步骤涉及的硬功能 */
export type ProductModuleTag =
  | "widget"
  | "watch"
  | "home"
  | "dialog"
  | "relief"
  | "social"
  | "record"
  | "lookback"
  | "organize"
  | "praise"
  | "privacy"
  | "energy";

/** 模块标签 → 产品内真实名称映射 */
export const moduleLabelMap: Record<ProductModuleTag, string> = {
  widget: "桌面小组件",
  watch: "手表",
  home: "首页",
  dialog: "对话",
  relief: "缓解",
  social: "轻社交",
  record: "记一下",
  lookback: "回头看看",
  organize: "帮我整理",
  praise: "夸夸自己",
  privacy: "我的隐私",
  energy: "我的能量",
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
  /** 严格来自 Word 文档的连续故事正文，按自然段落分段 */
  narrative: string[];
  /** Word 文档中"心理学技术应用"下的方法名称 */
  principles: string;
  /** 方法下方的作用说明（作为"为什么这样设计"模块的最终设计目标） */
  explanation: string;
  /** 心理学方法的普通语言解释（可选，仅部分节点提供） */
  plainExplanation?: string;
  /** narrative 各段段首需加粗的关键词（可选，与 narrative 数组一一对应，空字符串表示不加粗） */
  narrativeLeads?: string[];
  /** 当前步骤涉及的产品模块标签（用于故事面板硬功能标识） */
  moduleTags: ProductModuleTag[];
  /** 该步骤对应的产品演示状态（主场景） */
  demoState?: AppMainSurfaceDemoState;
  /** 该步骤的次要产品演示状态（用于一个节点包含两个内部场景的情况，如 07:35 对话+呼吸） */
  secondaryDemoState?: AppMainSurfaceDemoState;
};

/** 案例脚本：一个完整案例由若干步骤组成 */
export type GuidedScenario = {
  id: string;
  /** 案例名称，例如 "小晨第一天" */
  name: string;
  /** 案例简短描述 */
  description?: string;
  /** 开场说明（显示在第一步之前或第一步面板内） */
  intro?: string;
  /** 收束文案（显示在最后一步之后） */
  outro?: string;
  steps: GuidedScenarioStep[];
};
