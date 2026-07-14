/* —— 高风险记录确认 ——
 * 第二页定位：高风险原话的逐条披露决策
 * 默认全部不选；用户主动勾选后该条才进入材料。
 * 卡片只展示：来源场景 + 时间 + 用户原话。
 * 不做行为概括、不贴标签、不展示内部分类、不做风险等级判断。
 * 底部两按钮：「都不放入」/「放入 X 条」，X 为已勾选数量，为 0 时右侧置灰。 */
import { useState } from "react";
import { ChevronLeft, Check } from "lucide-react";
import {
  formatHighRiskRecordTime,
  type CommunicationSession,
} from "@/data/organize";
import { StepProgress } from "./shared";

interface Props {
  session: CommunicationSession;
  onBack: () => void;
  onComplete: (selectedIds: string[]) => void;
}

export default function DisclosureStep({ session, onBack, onComplete }: Props) {
  const name = session.contactSnapshot.displayName;
  const records = session.specialDisclosure.originalRecords;

  // 默认全部不选
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedCount = selectedIds.size;

  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-2">
        <button
          onClick={onBack}
          aria-label="返回"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-[18px] font-medium leading-relaxed tracking-tight text-ink">
          和{name}的沟通
        </h1>
      </div>

      <StepProgress current={2} total={2} />

      {/* 内容区 */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        {/* 页面标题 */}
        <div className="mt-5">
          <h2 className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
            高风险记录确认
          </h2>
        </div>

        {/* 高风险记录卡片列表 */}
        <div className="mt-5 flex flex-col gap-3">
          {records.map((record) => {
            const checked = selectedIds.has(record.id);
            return (
              <button
                key={record.id}
                onClick={() => toggleSelect(record.id)}
                className="rounded-2xl border border-line bg-white px-4 py-4 text-left"
              >
                {/* 来源 + 勾选框 */}
                <div className="flex items-center justify-between">
                  <div className="text-[16px] font-medium leading-relaxed text-ink">
                    来源：{record.sourceLabel}
                  </div>
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-[5px] border transition-colors ${
                      checked
                        ? "border-accent/50 bg-accent-soft text-accent"
                        : "border-line bg-white"
                    }`}
                  >
                    {checked && (
                      <Check className="h-3 w-3" strokeWidth={2.4} />
                    )}
                  </span>
                </div>

                {/* 时间 */}
                <div className="mt-1 text-[12px] leading-relaxed text-ink-faint">
                  {formatHighRiskRecordTime(record.recordedAt)}
                </div>

                {/* 用户原话（完整展示，不改写不摘要） */}
                <p className="mt-2.5 whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
                  {record.originalText}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 底部两个按钮 */}
      <div className="shrink-0 px-5 pb-8 pt-3">
        <div className="flex gap-2.5">
          <button
            onClick={() => onComplete([])}
            className="flex-1 rounded-xl border border-line bg-white px-4 py-3.5 text-[14px] font-medium text-ink transition-colors hover:bg-surface-soft/30"
          >
            都不放入
          </button>
          <button
            onClick={() => onComplete([...selectedIds])}
            disabled={selectedCount === 0}
            className="flex-1 rounded-xl bg-action-primary px-4 py-3.5 text-[14px] font-medium text-action-primary-text transition-opacity active:opacity-80 disabled:opacity-30"
          >
            放入 {selectedCount} 条
          </button>
        </div>
      </div>
    </div>
  );
}
