/* —— 帮我整理首页 ——
 * 工具化首页：标题 + 说明 + 开始整理 + 以往整理历史
 * 不出现「在在」形象、安抚文案、「创建报告」等旧概念 */
import { ChevronLeft } from "lucide-react";
import type { OrganizeHistoryEntry } from "@/data/organize";
import {
  formatDateRange,
  formatCreatedAt,
} from "@/data/organize";

interface Props {
  onBack: () => void;
  history: OrganizeHistoryEntry[];
  onStart: () => void;
  onViewHistory: (entry: OrganizeHistoryEntry) => void;
}

export default function HomeStep({
  onBack,
  history,
  onStart,
  onViewHistory,
}: Props) {
  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-2">
        <button
          onClick={onBack}
          aria-label="返回"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-[17px] font-semibold tracking-tight text-ink">
          帮我整理
        </h1>
      </div>

      {/* 内容区 */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        {/* 说明 */}
        <div className="mt-4">
          <p className="text-[13px] leading-relaxed text-ink-soft">
            根据已有记录，整理需要向他人说明的重点信息，并确认哪些内容可以被对方看见。
          </p>
        </div>

        {/* 以往整理 */}
        <div className="mt-8">
          {history.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-line bg-card-soft/40 px-4 py-8 text-center">
              <p className="text-[13px] text-ink-faint">
                还没有整理过沟通材料
              </p>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-2.5">
              {history.map((entry) => (
                <HistoryCard
                  key={entry.id}
                  entry={entry}
                  onClick={() => onViewHistory(entry)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 底部固定主按钮 */}
      <div className="shrink-0 px-5 pb-8 pt-3">
        <button
          onClick={onStart}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-action-primary px-4 py-3.5 text-[14px] font-medium text-action-primary-text transition-opacity active:opacity-80"
        >
          开始整理
        </button>
      </div>
    </div>
  );
}

/* —— 历史卡片 —— */
function HistoryCard({
  entry,
  onClick,
}: {
  entry: OrganizeHistoryEntry;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-left transition-colors hover:bg-card-soft/30"
    >
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-ink">
          给{entry.targetLabel}的沟通材料
        </div>
        <div className="mt-1 text-[12px] text-ink-faint">
          {formatDateRange(entry.startDate, entry.endDate)}
        </div>
        <div className="mt-0.5 text-[12px] text-ink-faint">
          创建于 {formatCreatedAt(entry.createdAt)}
        </div>
      </div>
      <span className="mt-0.5 shrink-0 text-[12px] text-accent">
        查看详情
      </span>
    </button>
  );
}
