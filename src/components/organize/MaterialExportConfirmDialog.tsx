/* —— 材料导出最终确认弹层 ——
 * 在执行「分享 / 保存」动作前统一拦截，向用户明确展示：
 * 1) 当前执行的动作（分享 / 保存）
 * 2) 分享对象（保存动作无）
 * 3) 材料中包含的高风险记录数量
 * 4) 执行动作后可能产生的隐私后果
 *
 * 仅当用户点击「继续分享 / 继续保存」后才调用 onConfirm；
 * 点击取消、点击遮罩、按 Escape 均只调用 onClose，不产生任何文件、分享面板或成功提示。
 *
 * 视觉沿用轻量 BottomSheet，不使用红色警告，保持柔和风格。
 */
import { useEffect } from "react";
import { BottomSheet } from "./shared";

export type MaterialExportAction = "share" | "save";

interface Props {
  action: MaterialExportAction;
  /** 分享对象可读名称（保存动作可省略） */
  recipientLabel?: string;
  /** 材料中包含的高风险记录数量 */
  highRiskCount: number;
  /** 用户确认后执行真实导出（系统分享 / 文件下载） */
  onConfirm: () => void | Promise<void>;
  /** 取消 / 关闭 / Escape */
  onClose: () => void;
}

const COPY: Record<
  MaterialExportAction,
  {
    title: string;
    actionLine: (recipient?: string) => string;
    consequence: string;
    confirm: string;
  }
> = {
  share: {
    title: "确认分享",
    actionLine: (r) =>
      r ? `即将把沟通材料分享给：${r}` : "即将分享沟通材料",
    consequence:
      "分享后材料将离开本机，对方可能长期留存或转发，请确认是否继续。",
    confirm: "继续分享",
  },
  save: {
    title: "确认保存",
    actionLine: () => "即将把沟通材料保存为本机 .txt 文件",
    consequence:
      "保存的文件可能被其他应用读取或同步至云盘，请确认存放位置与设备是否安全。",
    confirm: "继续保存",
  },
};

export default function MaterialExportConfirmDialog({
  action,
  recipientLabel,
  highRiskCount,
  onConfirm,
  onClose,
}: Props) {
  // Escape 关闭：不触发任何导出副作用
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const c = COPY[action];

  return (
    <BottomSheet onClose={onClose}>
      <div className="text-[16px] font-semibold tracking-tight text-ink">
        {c.title}
      </div>

      {/* 动作 + 对象 */}
      <p className="mt-3 text-[13.5px] leading-relaxed text-ink">
        {c.actionLine(recipientLabel)}
      </p>

      {/* 材料内容提示：高风险记录数量 */}
      <div className="mt-3 rounded-xl border border-line bg-card-soft/30 px-4 py-3">
        <div className="flex items-center justify-between text-[12.5px]">
          <span className="text-ink-soft">材料包含的高风险记录</span>
          <span className="font-medium tabular-nums text-ink">
            {highRiskCount} 条
          </span>
        </div>
      </div>

      {/* 隐私后果提示（柔和文案，不用红色警告） */}
      <p className="mt-3 text-[12px] leading-relaxed text-ink-soft">
        {c.consequence}
      </p>

      {/* 操作按钮 */}
      <div className="mt-5 flex gap-2.5">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-line bg-white px-4 py-3 text-[14px] font-medium text-ink transition-colors hover:bg-card-soft/30"
        >
          取消
        </button>
        <button
          onClick={() => onConfirm()}
          className="flex-1 rounded-xl bg-action-primary px-4 py-3 text-[14px] font-medium text-action-primary-text transition-opacity active:opacity-80"
        >
          {c.confirm}
        </button>
      </div>
    </BottomSheet>
  );
}
