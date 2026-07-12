/* —— 沟通清单视图 ——
 * 简洁清单，用于用户现场查看
 * 不展示全部统计数据、所有记录维度或大量事实列表 */
import { ChevronLeft, Share2, Download } from "lucide-react";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  buildChecklist,
  buildShareText,
  formatDateRange,
  formatSensitiveRecordTime,
  type CommunicationSession,
} from "@/data/organize";
import { Toast } from "./shared";

interface Props {
  session: CommunicationSession;
  onBack: () => void;
}

export default function CommunicationChecklistView({ session, onBack }: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const checklist = buildChecklist(session);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const handleShare = async () => {
    const text = buildShareText(session);
    if (navigator.share) {
      try {
        await navigator.share({ title: `和${checklist.contactName}的沟通清单`, text });
      } catch {
        // 用户取消
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        showToast("已复制到剪贴板");
      } catch {
        showToast("复制失败");
      }
    }
  };

  const handleSave = () => {
    const text = buildShareText(session);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `沟通清单_${session.startDate}_${session.endDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("清单已保存");
  };

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
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">
          沟通清单
        </h2>
      </div>

      {/* 内容区 */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        {/* 标题 */}
        <div className="mt-4">
          <h1 className="text-[20px] font-semibold tracking-tight text-ink">
            和{checklist.contactName}沟通
          </h1>
          <div className="mt-1.5 text-[12.5px] text-ink-faint">
            {formatDateRange(session.startDate, session.endDate)}
          </div>
        </div>

        {/* 这次想说的事 */}
        <div className="mt-6">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            这次想说的事
          </div>
          <div className="mt-3 flex flex-col gap-3">
            {checklist.topics.map((topic, i) => (
              <div
                key={i}
                className="rounded-xl border border-line bg-white px-4 py-3"
              >
                <div className="flex gap-2">
                  <span className="text-[13px] font-medium text-accent">
                    {i + 1}.
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium text-ink">
                      {topic.title}
                    </div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
                      {topic.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 单独确认的内容 */}
        {checklist.disclosure && (
          <div className="mt-6">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
              单独确认的内容
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {checklist.disclosure.records.map((record) => (
                <div
                  key={record.id}
                  className="rounded-xl border border-line bg-card-soft/30 px-4 py-3"
                >
                  <div className="flex items-center justify-between text-[11.5px] text-ink-faint">
                    <span>{formatSensitiveRecordTime(record.recordedAt)}</span>
                    <span>{record.recordType}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink-soft">
                    {record.originalText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部操作 */}
      <div className="shrink-0 flex gap-2.5 px-5 pb-8 pt-3">
        <button
          onClick={handleSave}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-4 py-3 text-[13px] font-medium text-ink"
        >
          <Download className="h-3.5 w-3.5" strokeWidth={1.8} />
          保存
        </button>
        <button
          onClick={handleShare}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-action-primary px-4 py-3 text-[13px] font-medium text-action-primary-text"
        >
          <Share2 className="h-3.5 w-3.5" strokeWidth={1.8} />
          分享
        </button>
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast} />}
      </AnimatePresence>
    </div>
  );
}
