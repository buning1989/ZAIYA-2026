import { useEffect, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookOpen,
  Hand,
  Moon,
  PenLine,
  School,
  Utensils,
  BedDouble,
} from "lucide-react";
import PresenceCharacterRive from "./PresenceCharacterRive";
import { presenceCharacters, type PresenceCharacter } from "@/data/presenceCharacters";
import { CloseButton } from "./FeaturePageTransition";

const ease = [0.22, 1, 0.36, 1] as const;

export type SceneId = "sleep" | "eat" | "study" | "class";

type SceneConfig = {
  id: SceneId;
  label: string;
  desc: string;
  Icon: LucideIcon;
  action: { label: string; Icon: LucideIcon };
};

export const scenes: SceneConfig[] = [
  {
    id: "sleep",
    label: "一起睡",
    desc: "安静的夜晚，各自安睡。",
    Icon: Moon,
    action: { label: "盖被子", Icon: BedDouble },
  },
  {
    id: "eat",
    label: "一起吃饭",
    desc: "围坐一桌，慢慢吃。",
    Icon: Utensils,
    action: { label: "递纸巾", Icon: Hand },
  },
  {
    id: "study",
    label: "一起学习",
    desc: "各自专注，偶尔抬头。",
    Icon: BookOpen,
    action: { label: "递笔", Icon: PenLine },
  },
  {
    id: "class",
    label: "一起上课",
    desc: "面向同一方向，一起听。",
    Icon: School,
    action: { label: "轻提醒", Icon: Bell },
  },
];

/**
 * 场景选择内容层（在 AppMainSurface 内部渲染）。
 *
 * ZaiZai 由 AppMainSurface 上移到中上部并保留气泡；
 * 本组件只渲染下方场景卡片 + 关闭按钮，与 dialog / reliefSelect 同构。
 */
export function PresenceSelectContent({
  onSelect,
  onClose,
}: {
  onSelect: (s: SceneId) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease }}
      className="absolute inset-0"
    >
      {/* 关闭：统一右上角 × */}
      <CloseButton onClick={onClose} ariaLabel="关闭共同在场" />

      {/* 场景卡片：位于 ZaiZai 下方 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.35, ease, delay: 0.05 }}
        className="absolute inset-x-0 px-6"
        style={{ top: "52%" }}
      >
        <div className="grid grid-cols-2 gap-3">
          {scenes.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className="flex flex-col items-start gap-2 rounded-2xl border border-line bg-canvas p-4 text-left transition-colors hover:border-ink-faint"
            >
              <s.Icon className="h-6 w-6 text-ink-soft" strokeWidth={1.6} />
              <div>
                <div className="text-[14px] font-medium text-ink">{s.label}</div>
                <div className="mt-0.5 text-[11px] leading-relaxed text-ink-faint">
                  {s.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * 房间内容层（在 AppMainSurface 内部渲染）。
 *
 * ZaiZai 由 AppMainSurface 保留在顶部（缩小），本组件渲染场景标题 + 6 个角色位 + 轻互动按钮。
 * 自己的位置高亮，其他用户不可点击。不接后端 / 不做聊天 / 不做排名。
 */
export function PresenceRoomContent({
  scene,
  onClose,
}: {
  scene: SceneId;
  onClose: () => void;
}) {
  const config = scenes.find((s) => s.id === scene)!;
  const me = presenceCharacters.find((c) => c.isSelf)!;
  const others = presenceCharacters.filter((c) => !c.isSelf);
  // 2 列 × 3 行：把"我"放在中间行（第 2 行左），略靠近视觉中心，高亮更易识别
  const ordered = [others[0], others[1], me, others[2], others[3], others[4]];

  // 轻互动反馈：递增 pulseKey 触发"我"的高亮 + 图标浮现，1s 后归零
  const [pulseKey, setPulseKey] = useState(0);
  useEffect(() => {
    if (pulseKey === 0) return;
    const t = setTimeout(() => setPulseKey(0), 1000);
    return () => clearTimeout(t);
  }, [pulseKey]);

  const trigger = () => setPulseKey((k) => k + 1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease }}
      className="absolute inset-0"
    >
      {/* 关闭：统一右上角 × */}
      <CloseButton onClick={onClose} ariaLabel="关闭共同在场" />

      {/* 顶部极简导航：仅场景名称，不保留在在 / 气泡 */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease, delay: 0.05 }}
        className="absolute inset-x-0 top-14 text-center"
      >
        <div className="flex items-center justify-center gap-1.5 text-ink">
          <config.Icon className="h-3.5 w-3.5 text-ink-faint" strokeWidth={1.8} />
          <span className="text-[13px] font-medium">{config.label}</span>
        </div>
      </motion.div>

      {/* 6 个角色位：2 列 × 3 行，占屏幕约 60%，成为唯一视觉主体。
          原本在在的顶部位置让给角色区，整体上移约 100px */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.35, ease, delay: 0.1 }}
        className="absolute inset-x-0 px-6"
        style={{ top: "20%", bottom: "16%" }}
      >
        <div className="grid h-full grid-cols-2 grid-rows-3 gap-y-2">
          {ordered.map((c) => (
            <CharacterCell
              key={c.id}
              char={c}
              highlight={!!c.isSelf}
              pulseKey={c.isSelf ? pulseKey : 0}
              actionIcon={config.action.Icon}
              size={c.isSelf ? "me" : "normal"}
            />
          ))}
        </div>
      </motion.div>

      {/* 轻互动按钮 */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.3, ease, delay: 0.15 }}
        onClick={trigger}
        className="absolute inset-x-6 bottom-8 inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-canvas px-4 py-3 text-[13px] font-medium text-ink transition-colors hover:border-ink-faint"
      >
        <config.action.Icon className="h-4 w-4 text-ink-soft" strokeWidth={1.8} />
        {config.action.label}
      </motion.button>
    </motion.div>
  );
}

/* —— 单个角色位：Rive 动画 + 昵称 + 状态；高亮 / 轻互动反馈 ——
 * 普通角色 h-20 w-20（80px）；“我” h-24 w-24（96px），高亮框跟随放大 */
function CharacterCell({
  char,
  highlight = false,
  pulseKey = 0,
  actionIcon: ActionIcon,
  size = "normal",
}: {
  char: PresenceCharacter;
  highlight?: boolean;
  pulseKey?: number;
  actionIcon?: LucideIcon;
  size?: "normal" | "me";
}) {
  const controls = useAnimationControls();
  const [showIcon, setShowIcon] = useState(false);

  useEffect(() => {
    if (pulseKey === 0) return;
    controls.start({
      scale: [1, 1.08, 1],
      transition: { duration: 0.6, ease },
    });
    setShowIcon(true);
    const t = setTimeout(() => setShowIcon(false), 1000);
    return () => clearTimeout(t);
  }, [pulseKey, controls]);

  const riveSize = size === "me" ? "h-24 w-24" : "h-20 w-20";

  return (
    <div className="flex flex-col items-center justify-center gap-1.5">
      <div className="relative grid place-items-center">
        <motion.div
          animate={controls}
          className={`relative rounded-2xl p-1.5 transition-colors ${
            highlight
              ? "bg-accent-soft/40 ring-2 ring-accent shadow-[0_0_0_4px_rgba(252,89,27,0.08)]"
              : ""
          }`}
        >
          <PresenceCharacterRive src={char.src} className={riveSize} />
          <AnimatePresence>
            {showIcon && ActionIcon && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 0.6 }}
                animate={{ opacity: 1, y: -16, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease }}
                className="pointer-events-none absolute -top-1 left-1/2 z-20 -translate-x-1/2"
              >
                <ActionIcon className="h-4 w-4 text-accent" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <span
        className={`text-[12px] ${
          highlight ? "font-semibold text-ink" : "text-ink-soft"
        }`}
      >
        {char.nickname}
      </span>
      <span className="text-[10px] text-ink-faint">{char.status}</span>
    </div>
  );
}
