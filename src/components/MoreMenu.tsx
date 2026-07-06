import { motion } from "framer-motion";
import {
  ChevronLeft,
  BookOpen,
  Clock,
  FolderOpen,
  Sparkles,
  Shield,
  Settings,
  type LucideProps,
} from "lucide-react";
import type { ForwardRefExoticComponent } from "react";
import RecordFlow from "./RecordFlow";
import LookbackPage from "./LookbackPage";
import OrganizePage from "./OrganizePage";
import PraisePage from "./PraisePage";
import PrivacyPage from "./PrivacyPage";
import type { Answers, RecordTypeId } from "@/data/record";
import type { OrganizeHistoryEntry } from "@/data/organize";

const ease = [0.22, 1, 0.36, 1] as const;

/* —— 更多首页菜单项配置（仅 icon + 名称，无说明文案） ——
 * 新增「设置」一级入口，承载首页快捷入口等全局配置。 */
export type MoreItemId =
  | "note"
  | "review"
  | "organize"
  | "praise"
  | "privacy"
  | "settings";

export const moreMenuItems: {
  id: MoreItemId;
  label: string;
  Icon: ForwardRefExoticComponent<LucideProps>;
}[] = [
  { id: "note", label: "记一下", Icon: BookOpen },
  { id: "review", label: "回头看看", Icon: Clock },
  { id: "organize", label: "帮我整理", Icon: FolderOpen },
  { id: "praise", label: "夸夸自己", Icon: Sparkles },
  { id: "privacy", label: "我的隐私", Icon: Shield },
  { id: "settings", label: "设置", Icon: Settings },
];

/* —— 更多侧边栏内容（一级菜单项列表，Tolan 风格） —— */
export function MoreContent({
  onSelect,
  onClose,
}: {
  onSelect: (id: MoreItemId) => void;
  onClose: () => void;
}) {
  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* 菜单列表：大字、宽行距、无卡片、无边框、无箭头 */}
      <nav className="flex-1 px-8 pt-16">
        <ul className="flex flex-col">
          {moreMenuItems.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                ease: [...ease],
                delay: 0.08 + i * 0.05,
              }}
            >
              <button
                onClick={() => onSelect(item.id)}
                className="flex w-full items-center gap-4 py-4 text-left transition-colors hover:text-ink-faint"
              >
                <item.Icon
                  className="h-[21px] w-[21px] shrink-0 text-ink-soft"
                  strokeWidth={1.6}
                />
                <span className="text-[17px] font-medium tracking-tight text-ink">
                  {item.label}
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* 底部关闭入口（弱化） */}
      <div className="px-8 pb-10">
        <button
          onClick={onClose}
          className="text-[13px] text-ink-faint transition-colors hover:text-ink-soft"
        >
          关闭
        </button>
      </div>
    </div>
  );
}

/* —— 极简 Switch（无外部依赖，settings 详情层使用） —— */
function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? "bg-accent" : "bg-line"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm ${
          checked ? "right-1" : "left-1"
        }`}
      />
    </button>
  );
}

/* —— 设置详情层 ——
 * 路径：更多 → 设置 → 首页与快捷入口 → 记一下
 * 本次仅实现「在首页显示记一下快捷入口」开关；其余设置项为占位。
 * 默认关闭；开启后首页右上角显示「记一下」icon。 */
function SettingsDetail({
  onBack,
  homeShortcut,
  setHomeShortcut,
}: {
  onBack: () => void;
  homeShortcut: boolean;
  setHomeShortcut: (v: boolean) => void;
}) {
  return (
    <div className="relative flex h-full flex-col bg-canvas">
      {/* 顶部：返回 + 标题 */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-2">
        <button
          onClick={onBack}
          aria-label="返回更多"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">
          设置
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-8">
        {/* 分组：首页与快捷入口 */}
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-faint">
          首页与快捷入口
        </div>
        <div className="mt-2 flex flex-col gap-2.5">
          <div className="flex items-center justify-between rounded-2xl border border-line bg-white px-5 py-4">
            <div className="flex-1 pr-3">
              <div className="text-[14px] font-medium text-ink">
                在首页显示记一下快捷入口
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
                开启后，首页右上角出现「记一下」入口。
              </p>
            </div>
            <Switch
              checked={homeShortcut}
              onChange={setHomeShortcut}
            />
          </div>
        </div>

        {/* 分组：其他（占位） */}
        <div className="mt-6 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-faint">
          其他
        </div>
        <div className="mt-2 rounded-2xl border border-line bg-white px-5 py-4">
          <p className="text-[13px] text-ink-faint">【其他设置项占位】</p>
        </div>
      </div>
    </div>
  );
}

/* —— 更多详情页 ——
 * "记一下" 走完整 RecordFlow（单页单题 wizard + 完成页）。
 * "settings" 走 SettingsDetail（含首页快捷入口开关）。
 * 其余仍为占位。
 *
 * homeShortcut / setHomeShortcut 由 AppMainSurface 上提，控制首页右上角快捷入口。
 * showShortcutHint / onAcceptShortcut / onDismissShortcutHint 由 AppMainSurface 控制，
 *   用于完成页低频提示（mock 2–3 次完整记录后出现一次）。 */
export function MoreDetailContent({
  itemId,
  onBack,
  homeShortcut,
  setHomeShortcut,
  showShortcutHint,
  onAcceptShortcut,
  onDismissShortcutHint,
  onRecordComplete,
  onSaveFirst,
  recordHistory,
  organizeHistory,
  onSaveOrganizeToHistory,
  onDeleteOrganizeHistory,
}: {
  itemId: MoreItemId;
  onBack: () => void;
  homeShortcut: boolean;
  setHomeShortcut: (v: boolean) => void;
  showShortcutHint: boolean;
  onAcceptShortcut: () => void;
  onDismissShortcutHint: () => void;
  onRecordComplete?: (e: {
    typeId: "mood" | "medication" | "food" | "sleep" | "activity";
    isComplete: boolean;
  }) => void;
  /** 先保存：用户在 wizard 中途点击「先保存」，保存为 basic 记录并直接回首页 */
  onSaveFirst?: (e: {
    typeId: RecordTypeId;
    answers: Answers;
  }) => void;
  /** 记录历史，用于「记一下」主页最近记录气泡展示 */
  recordHistory?: import("@/data/record").RecordEntry[];
  /** 「帮我整理」历史记录，由 AppMainSurface 持有，跨页面持久 */
  organizeHistory?: OrganizeHistoryEntry[];
  /** 保存整理单到历史 */
  onSaveOrganizeToHistory?: (entry: OrganizeHistoryEntry) => void;
  /** 删除整理单历史条目 */
  onDeleteOrganizeHistory?: (id: string) => void;
}) {
  // "记一下"：完整二级功能页，由 RecordFlow 接管
  if (itemId === "note") {
    return (
      <RecordFlow
        onBack={onBack}
        onRecordComplete={onRecordComplete}
        onSaveFirst={onSaveFirst}
        showShortcutHint={showShortcutHint}
        onAcceptShortcut={onAcceptShortcut}
        onDismissShortcutHint={onDismissShortcutHint}
        recordHistory={recordHistory}
      />
    );
  }

  // "回头看看"：生活状态时间轴页面
  if (itemId === "review") {
    return <LookbackPage onBack={onBack} />;
  }

  // "帮我整理"：沟通准备单生成流程
  if (itemId === "organize") {
    return (
      <OrganizePage
        onBack={onBack}
        organizeHistory={organizeHistory}
        onSaveToHistory={onSaveOrganizeToHistory}
        onDeleteHistory={onDeleteOrganizeHistory}
      />
    );
  }

  // "夸夸自己"：把今天一点点好的东西留下来（卡片库）
  if (itemId === "praise") {
    return <PraisePage onBack={onBack} />;
  }

  // "privacy"：我的隐私（资料 / 家人和联系人 / 服用信息）
  if (itemId === "privacy") {
    return <PrivacyPage onBack={onBack} />;
  }

  // "settings"：设置详情层（首页快捷入口开关在此）
  if (itemId === "settings") {
    return (
      <SettingsDetail
        onBack={onBack}
        homeShortcut={homeShortcut}
        setHomeShortcut={setHomeShortcut}
      />
    );
  }

  const item = moreMenuItems.find((m) => m.id === itemId);
  if (!item) return null;

  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* 顶部：返回箭头 + 标题（位于状态栏下方） */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-2">
        <button
          onClick={onBack}
          aria-label="返回更多"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">
          {item.label}
        </h2>
      </div>

      {/* 占位内容 */}
      <div className="flex flex-1 items-center justify-center px-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: [...ease], delay: 0.1 }}
          className="text-[14px] text-ink-faint"
        >
          【功能内容占位】
        </motion.p>
      </div>
    </div>
  );
}
