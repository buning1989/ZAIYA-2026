/* —— 需要单独确认的记录 ——
 * 第二页定位：敏感/特殊内容的披露决策
 * 与第一页普通沟通重点在信息结构、文案、视觉层级上明显区分
 * 直接展示用户原文，不折叠、不摘要、不做风险判断
 * 底部两按钮，点击任一直接进入完成页 */
import { ChevronLeft } from "lucide-react";
import {
  formatSensitiveRecordTime,
  type CommunicationSession,
  type DisclosureDecision,
} from "@/data/organize";
import { StepProgress } from "./shared";

interface Props {
  session: CommunicationSession;
  onBack: () => void;
  onComplete: (decision: DisclosureDecision) => void;
}

export default function DisclosureStep({ session, onBack, onComplete }: Props) {
  const name = session.contactSnapshot.displayName;
  const records = session.specialDisclosure.originalRecords;

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
            需要单独确认的记录
          </h2>
        </div>

        {/* 特殊记录卡片列表 */}
        <div className="mt-5 flex flex-col gap-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="rounded-2xl border border-line bg-ink/[0.02] px-4 py-4"
            >
              {/* 顶部标签：需要单独确认 */}
              <div className="flex items-center gap-2">
                <span className="text-[13px] leading-relaxed text-ink-soft">
                  需要单独确认
                </span>
              </div>

              {/* 涉及内容（辅助说明） */}
              <div className="mt-2.5 text-[12px] leading-relaxed text-ink-faint">
                {record.confirmReason}
              </div>

              {/* 分隔线 */}
              <div className="my-3 h-px bg-line/60" />

              {/* 日期 + 记录类型 */}
              <div className="flex items-center justify-between text-[12px] text-ink-faint">
                <span>{formatSensitiveRecordTime(record.recordedAt)}</span>
                <span>{record.recordType}</span>
              </div>

              {/* 用户原文（视觉权重更高） */}
              <p className="mt-2.5 whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
                {record.originalText}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 底部两个按钮 */}
      <div className="shrink-0 px-5 pb-8 pt-3">
        <div className="flex gap-2.5">
          <button
            onClick={() => onComplete("exclude")}
            className="flex-1 rounded-xl border border-line bg-white px-4 py-3.5 text-[14px] font-medium text-ink transition-colors hover:bg-card-soft/30"
          >
            不放入
          </button>
          <button
            onClick={() => onComplete("include")}
            className="flex-1 rounded-xl bg-action-primary px-4 py-3.5 text-[14px] font-medium text-action-primary-text transition-opacity active:opacity-80"
          >
            放入材料
          </button>
        </div>
      </div>
    </div>
  );
}
