import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/* —— 记录模块通用结算单组件 ——
 * 只负责展示记录字段 + 保存状态，不负责业务判断。
 * 各记录模块（服用 / 饮食 / 睡眠 / 体重 / 情绪）的结算页都应使用此组件，
 * 不要每个模块单独写一套卡片样式。
 *
 * 摘要卡片内所有字段均为只读展示，不出现右箭头、编辑图标、点击态。
 * 补充说明模块通过 children 传入（统一使用 RecordNoteSection），渲染在卡片下方。
 *
 * 用法：
 *   <RecordSummaryCard
 *     rows={[
 *       { label: '时段', value: '中午的药 13:00' },
 *       { label: '起效', value: '1.5 小时' },
 *       { label: '感受', value: '头晕、大大的' },
 *       { label: '时间', value: '今天 22:26' },
 *     ]}
 *     saved={isSaved}
 *     primaryButtonText={isSaved ? '回到记一下' : '保存记录'}
 *     onPrimaryClick={isSaved ? onAbort : handleSave}
 *   >
 *     <RecordNoteSection value={note} onChange={setNote} saved={isSaved} />
 *   </RecordSummaryCard>
 */
export interface SummaryRow {
  label: string;
  value: string;
  /** 缺省态文案：value 为空时展示此文案（灰色），如「未记录」 */
  placeholder?: string;
  /** 跳过两字中文字段名的视觉拉宽，仅用于需要保留原始字段名的模块 */
  preserveLabel?: boolean;
}

export interface RecordSummaryCardProps {
  /** 顶部标题（默认「这条记录已经完整了」） */
  title?: string;
  /** 字段行 */
  rows: SummaryRow[];
  /** 是否已保存：true 显示「已保存」盖戳 */
  saved?: boolean;
  /** 底部主按钮文案 */
  primaryButtonText: string;
  /** 底部主按钮是否可用（默认 true） */
  primaryButtonDisabled?: boolean;
  /** 底部主按钮回调 */
  onPrimaryClick: () => void;
  /** 摘要卡片下方的补充说明模块（统一使用 RecordNoteSection） */
  children?: ReactNode;
}

// 确认页字段标签格式化：两字字段中间插两个全角空格，对齐四字字段视觉宽度
export function formatRecordLabel(label: string): string {
  const ideographicSpace = "\u3000";
  const cjkCount = Array.from(label).filter((ch) =>
    /[\u4e00-\u9fff]/.test(ch),
  ).length;
  if (cjkCount === 2) {
    return `${label[0]}${ideographicSpace}${ideographicSpace}${label[1]}`;
  }
  return label;
}

export default function RecordSummaryCard({
  title = "这条记录已经完整了",
  rows,
  saved = false,
  primaryButtonText,
  primaryButtonDisabled = false,
  onPrimaryClick,
  children,
}: RecordSummaryCardProps) {
  const infoRowClass =
    "grid grid-cols-[4em_minmax(0,1fr)] items-baseline gap-3 border-b border-line-soft py-2.5 last:border-b-0";
  const labelClass = "block text-[14px] leading-relaxed text-ink-faint";
  const contentClass =
    "min-w-0 break-words text-[14px] font-medium leading-relaxed text-ink";

  return (
    <div className="no-scrollbar relative flex h-full flex-col overflow-y-auto bg-white px-5">
      <div className="pt-4">
        <h2 className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
          {title}
        </h2>
      </div>

      <div className="relative mt-4 rounded-2xl border border-line bg-white px-5 py-4">
        {/* 已保存盖章 */}
        <AnimatePresence>
          {saved && (
            <motion.img
              src="./saved-stamp.svg"
              alt="已保存"
              initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: -10 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.32, ease }}
              className="pointer-events-none absolute -right-3 -top-3 z-20 h-[68px] w-[68px] select-none"
              draggable={false}
            />
          )}
        </AnimatePresence>

        <div className="text-[11px] uppercase tracking-[0.16em] text-ink-faint">
          已记录
        </div>

        <div className="mt-2 flex flex-col gap-1.5">
          {rows.map((row, idx) => {
            const valueText = row.value?.trim();
            const display = valueText || row.placeholder || "";
            const isEmpty = !valueText;
            return (
              <div key={`${row.label}-${idx}`} className={infoRowClass}>
                <span className={labelClass}>
                  {row.preserveLabel
                    ? row.label
                    : formatRecordLabel(row.label)}
                </span>
                <span
                  className={`${contentClass} ${isEmpty ? "text-ink-faint" : ""}`}
                >
                  {display}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 补充说明模块：由调用方通过 children 传入 RecordNoteSection */}
      {children}

      {/* 底部按钮：调用方决定文案与行为 */}
      <div className="mt-auto pb-6 pt-4">
        <button
          onClick={onPrimaryClick}
          disabled={primaryButtonDisabled}
          className={`w-full rounded-xl px-4 py-3 text-[14px] font-medium transition-opacity ${
            primaryButtonDisabled
              ? "bg-surface-muted text-ink-faint"
              : "bg-action-primary text-action-primary-text hover:opacity-90"
          }`}
        >
          {primaryButtonText}
        </button>
      </div>
    </div>
  );
}
