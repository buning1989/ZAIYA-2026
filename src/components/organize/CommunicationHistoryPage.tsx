/* —— 历史记录独立页 ——
 * 按时间倒序展示历史沟通材料
 * 按具体沟通对象归档（不按角色类型分组） */
import { useState } from "react";
import { ChevronLeft, MoreHorizontal } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import {
  formatDateRangeChinese,
  formatCreatedAt,
  removeHistory,
  type OrganizeHistoryEntry,
} from "@/data/organize";
import { BottomSheet, Toast } from "./shared";

interface Props {
  history: OrganizeHistoryEntry[];
  onBack: () => void;
  onViewDetail: (entry: OrganizeHistoryEntry) => void;
  onHistoryChange: (history: OrganizeHistoryEntry[]) => void;
}

export default function CommunicationHistoryPage({
  history,
  onBack,
  onViewDetail,
  onHistoryChange,
}: Props) {
  const [menuEntry, setMenuEntry] = useState<OrganizeHistoryEntry | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const handleDelete = (entry: OrganizeHistoryEntry) => {
    const next = removeHistory(history, entry.id);
    onHistoryChange(next);
    setMenuEntry(null);
    showToast("已删除");
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
        <h1 className="text-[17px] font-semibold tracking-tight text-ink">
          历史记录
        </h1>
      </div>

      {/* 内容区 */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        {history.length === 0 ? (
          <div className="mt-20 text-center">
            <p className="text-[13px] text-ink-faint">
              还没有整理过沟通材料
            </p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2.5">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-line bg-white px-4 py-4"
              >
                <button
                  onClick={() => onViewDetail(entry)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[15px] font-medium text-ink">
                      {entry.contactSnapshot.displayName}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuEntry(entry);
                      }}
                      className="grid h-7 w-7 place-items-center rounded-full text-ink-faint transition-colors hover:bg-line-soft"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-0.5 text-[12px] text-ink-faint">
                    {entry.contactSnapshot.roleLabel}
                  </div>
                  <div className="mt-2 text-[12.5px] text-ink-soft">
                    {formatDateRangeChinese(entry.startDate, entry.endDate)}
                  </div>
                  <div className="mt-1 text-[12px] text-ink-faint">
                    {entry.topicCount} 条沟通重点
                  </div>
                  <div className="mt-0.5 text-[12px] text-ink-faint">
                    创建于 {formatCreatedAt(entry.createdAt)}
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 更多操作面板 */}
      <AnimatePresence>
        {menuEntry && (
          <BottomSheet onClose={() => setMenuEntry(null)}>
            <div className="text-[14px] font-medium text-ink">
              {menuEntry.contactSnapshot.displayName} ·{" "}
              {formatDateRangeChinese(menuEntry.startDate, menuEntry.endDate)}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => handleDelete(menuEntry)}
                className="w-full rounded-xl border border-line bg-white py-3 text-[13px] font-medium text-ink"
              >
                删除此记录
              </button>
              <button
                onClick={() => setMenuEntry(null)}
                className="w-full rounded-xl bg-card-soft/40 py-3 text-[13px] text-ink-faint"
              >
                取消
              </button>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast message={toast} />}
      </AnimatePresence>
    </div>
  );
}
