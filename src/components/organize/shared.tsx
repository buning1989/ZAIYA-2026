/* —— 「帮我整理」共享 UI 组件 —— */
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

/** 与「记一下」一致的细进度条 + 右侧弱化步骤数字 */
export function StepProgress({ current, total }: { current: number; total: number }) {
  const pct = Math.min(100, (current / total) * 100);
  return (
    <div className="px-5 pt-3 pb-1">
      <div className="flex items-center gap-2.5">
        <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-line-soft">
          <motion.div
            className="h-full rounded-full bg-action-primary"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3, ease }}
          />
        </div>
        <span className="text-[11px] tabular-nums text-ink-faint">
          {current}/{total}
        </span>
      </div>
    </div>
  );
}

/** 小节标题（统一弱化样式） */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
      {children}
    </div>
  );
}

/** 选中标记（淡绿勾选） */
export function SelectMark({ checked }: { checked: boolean }) {
  return (
    <span
      className={`mt-0.5 grid shrink-0 place-items-center rounded-[5px] border transition-colors ${
        checked
          ? "border-accent bg-accent text-white"
          : "border-line bg-white"
      }`}
      style={{ height: 18, width: 18 }}
    >
      {checked && <Check className="h-3 w-3" strokeWidth={2.4} />}
    </span>
  );
}

/** 来源标签：系统整理不显示，本人补充保留标签 */
export function SourceTag({
  sourceType,
}: {
  sourceType: "system_summary" | "user_added";
}) {
  if (sourceType === "system_summary") return null;
  return (
    <span className="shrink-0 rounded-full bg-surface-soft px-2 py-0.5 text-[10px] font-medium text-ink-soft">
      本人补充
    </span>
  );
}

/** 底部固定主按钮 */
export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex w-full items-center justify-center rounded-lg bg-action-primary px-4 py-3 text-[13px] font-medium text-action-primary-text transition-opacity disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/** 底部固定次级按钮 */
export function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex w-full items-center justify-center rounded-lg border border-line bg-white px-4 py-3 text-[13px] font-medium text-ink"
    >
      {children}
    </button>
  );
}

/** 通用底部 sheet（轻量确认面板） */
export function BottomSheet({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <motion.div
        className="absolute inset-0 z-[60] bg-black/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease }}
        onClick={onClose}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 z-[61] rounded-t-[20px] bg-white px-6 pb-8 pt-5"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-line" />
        {children}
      </motion.div>
    </>
  );
}

/** 底部居中 toast 反馈
 *
 * —— Toast 使用白名单 ——
 * 允许用于轻量、即时、可自动消失的操作结果反馈：
 *   - 已复制 / 已保存 / 已删除（操作结果）
 *   - 复制失败 / 保存失败（错误提示）
 *   - Demo 阶段暂未开放（轻量提示）
 *
 * 禁止用于以下场景（改用 Dialog / Confirm modal / 页面内说明）：
 *   - 隐私后果或分享风险（使用 MaterialExportConfirmDialog）
 *   - 诊断或治疗相关信息
 *   - 必须阅读的重要说明
 *   - 需要用户作出决定的信息
 *   - 长篇内容或主动打扰式通知
 *
 * 规则：
 *   - 同一时刻最多显示一个 Toast，不连续堆叠
 *   - Toast 不遮挡主要操作
 *   - 能量奖励动效使用 EnergyRewardFeedback，不与本组件混用 */
export function Toast({ message }: { message: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-20 left-1/2 z-[70] rounded-full bg-ink/85 px-4 py-2 text-[12px] text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)]"
      initial={{ opacity: 0, x: "-50%", y: 6 }}
      animate={{ opacity: 1, x: "-50%", y: 0 }}
      exit={{ opacity: 0, x: "-50%", y: 6 }}
      transition={{ duration: 0.2, ease }}
    >
      {message}
    </motion.div>
  );
}
