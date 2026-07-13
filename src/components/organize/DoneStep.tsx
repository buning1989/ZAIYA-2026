/* —— 完成页 ——
 * 顶栏：左上返回 + 右上角模块图标
 * 摘要压缩为三行
 * 一个主按钮 + 两个横向次级按钮 */
import { useState } from "react";
import { ChevronLeft, Download, FolderOpen, Share2 } from "lucide-react";
import {
  buildShareText,
  formatDateRangeChinese,
  formatCreatedAt,
  getMaterialTopics,
  type CommunicationSession,
} from "@/data/organize";
import { Toast } from "./shared";
import MaterialExportConfirmDialog, {
  type MaterialExportAction,
} from "./MaterialExportConfirmDialog";
import { AnimatePresence } from "framer-motion";

interface Props {
  session: CommunicationSession;
  onBack: () => void;
  onHome: () => void;
  onViewMaterial: () => void;
  /** 演示只读态：按钮保留视觉，但不触发分享/下载副作用 */
  readOnly?: boolean;
}

export default function DoneStep({
  session,
  onBack,
  onHome,
  onViewMaterial,
  readOnly = false,
}: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const [pendingAction, setPendingAction] =
    useState<MaterialExportAction | null>(null);
  const name = session.contactSnapshot.displayName;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const materialTopics = getMaterialTopics(session);
  const disclosure = session.specialDisclosure;
  const disclosureIncluded =
    disclosure.decision === "include" && disclosure.confirmed;
  const selectedRecordCount = disclosure.originalRecords.filter(
    (r) => r.selected,
  ).length;
  // 进入材料的高风险记录数量（未纳入披露时为 0）
  const highRiskCount = disclosureIncluded ? selectedRecordCount : 0;

  // 点击「分享 / 保存」只打开确认弹层，不直接执行导出
  const handleShare = () => {
    if (readOnly) {
      showToast("演示模式不执行真实分享");
      return;
    }
    setPendingAction("share");
  };

  const handleSave = () => {
    if (readOnly) {
      showToast("演示模式不执行真实保存");
      return;
    }
    setPendingAction("save");
  };

  // 用户在确认弹层中点击「继续分享」后才执行真实分享
  const executeShare = async () => {
    setPendingAction(null);
    const text = buildShareText(session);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `给${name}的沟通材料`,
          text,
        });
      } catch {
        // 用户取消
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        showToast("已复制到剪贴板");
      } catch {
        showToast("复制失败，请手动选择文本");
      }
    }
  };

  // 用户在确认弹层中点击「继续保存」后才执行真实下载
  const executeSave = () => {
    setPendingAction(null);
    const text = buildShareText(session);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `沟通材料_${session.startDate}_${session.endDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("已保存");
  };

  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* 顶部导航：左上返回，右上角使用「帮我整理」同款模块图标 */}
      <div className="flex items-center justify-between px-5 pt-14 pb-2">
        <div className="flex items-center gap-3">
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
        <button
          onClick={onHome}
          aria-label="返回帮我整理首页"
          className="grid h-8 w-8 place-items-center rounded-full text-ink transition-colors hover:bg-line-soft"
        >
          <FolderOpen className="h-[19px] w-[19px]" strokeWidth={1.8} />
        </button>
      </div>

      {/* 内容区 */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        <div className="mt-6">
          <h2 className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
            和{name}沟通的内容已整理好
          </h2>
        </div>

        {/* 沟通信息卡片 */}
        <div className="mt-6 rounded-2xl border border-line bg-card-soft/20 px-5 py-4">
          <div className="text-[14px] font-semibold text-ink">
            {name} · {session.contactSnapshot.roleLabel}
          </div>
          <div className="mt-3 flex flex-col gap-1.5 text-[12.5px] text-ink-soft">
            <div className="flex">
              <span className="w-20 shrink-0 text-ink-faint">记录日期</span>
              <span>{formatDateRangeChinese(session.startDate, session.endDate)}</span>
            </div>
            <div className="flex">
              <span className="w-20 shrink-0 text-ink-faint">记录天数</span>
              <span>{session.recordedDays}/{session.totalDays}</span>
            </div>
            <div className="flex">
              <span className="w-20 shrink-0 text-ink-faint">沟通重点</span>
              <div className="flex flex-col">
                {materialTopics.map((topic, i) => (
                  <span key={topic.id}>
                    {i + 1}. {topic.title}
                  </span>
                ))}
              </div>
            </div>
            {disclosureIncluded && selectedRecordCount > 0 && (
              <div className="flex">
                <span className="w-20 shrink-0 text-ink-faint">高风险记录</span>
                <span>已加入 {selectedRecordCount} 条</span>
              </div>
            )}
            <div className="flex">
              <span className="w-20 shrink-0 text-ink-faint">创建日期</span>
              <span>{formatCreatedAt(session.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作区 */}
      <div className="shrink-0 px-5 pb-8 pt-3">
        <button
          onClick={onViewMaterial}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-action-primary px-4 py-3.5 text-[14px] font-medium text-action-primary-text transition-opacity active:opacity-80"
        >
          查看完整材料
        </button>

        <div className="mt-3 flex gap-2.5">
          <button
            onClick={handleShare}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-[13px] font-medium text-ink transition-colors hover:bg-card-soft/30"
          >
            <Share2 className="h-4 w-4" strokeWidth={1.8} />
            分享给{name}
          </button>
          <button
            onClick={handleSave}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-[13px] font-medium text-ink transition-colors hover:bg-card-soft/30"
          >
            <Download className="h-4 w-4" strokeWidth={1.8} />
            保存材料
          </button>
        </div>
      </div>

      <AnimatePresence>
        {pendingAction && (
          <MaterialExportConfirmDialog
            action={pendingAction}
            recipientLabel={pendingAction === "share" ? name : undefined}
            highRiskCount={highRiskCount}
            onConfirm={
              pendingAction === "share" ? executeShare : executeSave
            }
            onClose={() => setPendingAction(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast message={toast} />}
      </AnimatePresence>
    </div>
  );
}
