/* —— 完成页 ——
 * 不显示步骤进度
 * 展示材料概要 + 4 个操作（分享/保存/查看完整内容/返回）
 * 分享复用 navigator.share，保存为模拟下载 */
import { useState } from "react";
import { ChevronLeft, Share2, Download, FileText, Home } from "lucide-react";
import {
  buildShareText,
  formatDateRange,
  getMaterialTopics,
  type CommunicationSession,
} from "@/data/organize";
import { Toast } from "./shared";
import { AnimatePresence } from "framer-motion";

interface Props {
  session: CommunicationSession;
  onBack: () => void;
  onViewFull: () => void;
  onBackHome: () => void;
}

export default function DoneStep({
  session,
  onBack,
  onViewFull,
  onBackHome,
}: Props) {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const materialTopics = getMaterialTopics(session);
  const disclosure = session.specialDisclosure;

  const handleShare = async () => {
    const text = buildShareText(session);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `给${session.targetLabel}的沟通材料`,
          text,
        });
      } catch {
        // 用户取消分享，不提示
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

  const handleSave = () => {
    // 模拟下载（复用导出逻辑，不新增重量级依赖）
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
    showToast("材料已保存");
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
      </div>

      {/* 内容区 */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        <div className="mt-6 text-center">
          <h1 className="text-[22px] font-semibold tracking-tight text-ink">
            沟通材料已生成
          </h1>
        </div>

        {/* 材料概要 */}
        <div className="mt-6 rounded-2xl border border-line bg-card-soft/20 px-5 py-4">
          <InfoRow label="沟通对象" value={session.targetLabel} />
          <div className="my-2.5 h-px bg-line/50" />
          <InfoRow
            label="时间范围"
            value={formatDateRange(session.startDate, session.endDate)}
          />
          <div className="my-2.5 h-px bg-line/50" />
          <InfoRow
            label="已确认沟通重点"
            value={`${materialTopics.length} 项`}
          />
          <div className="my-2.5 h-px bg-line/50" />
          <InfoRow
            label="特殊情况"
            value={
              disclosure.decision === "include" && disclosure.confirmed
                ? "已纳入"
                : "未纳入"
            }
          />
        </div>

        {/* 操作按钮 */}
        <div className="mt-6 flex flex-col gap-2.5">
          <ActionButton
            icon={Share2}
            label="分享给医生"
            onClick={handleShare}
            primary
          />
          <ActionButton
            icon={Download}
            label="保存材料"
            onClick={handleSave}
          />
          <ActionButton
            icon={FileText}
            label="查看完整内容"
            onClick={onViewFull}
          />
          <ActionButton
            icon={Home}
            label="返回帮我整理"
            onClick={onBackHome}
          />
        </div>
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast} />}
      </AnimatePresence>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-ink-faint">{label}</span>
      <span className="text-[13px] font-medium text-ink">{value}</span>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  primary,
}: {
  icon: typeof Share2;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[14px] font-medium transition-opacity active:opacity-80 ${
        primary
          ? "bg-action-primary text-action-primary-text"
          : "border border-line bg-white text-ink"
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.8} />
      {label}
    </button>
  );
}
