import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import VoiceInputBar from "./VoiceInputBar";

/* —— 记录确认页通用「补充说明」模块 ——
 * 所有记录模块的确认页统一使用此组件，不允许各模块单独写补充说明交互。
 *
 * 三种状态：
 *   1. 空态：展示「+ 添加一句补充」+ 轻提示
 *   2. 编辑态：展开输入框（文字 + 语音，复用 VoiceInputBar）
 *   3. 已填写态：展示文本 + 「编辑」入口
 *
 * 已保存态（saved=true）：
 *   - 有内容 → 只读展示文本
 *   - 无内容 → 隐藏整个模块
 *
 * 补充说明不是必填，不填写也可以完成记录。
 */
export interface RecordNoteSectionProps {
  /** 当前补充说明文本 */
  value: string;
  /** 文本变更回调 */
  onChange: (v: string) => void;
  /** 输入框 placeholder */
  placeholder?: string;
  /** 空态轻提示文案 */
  hint?: string;
  /** 是否已保存：保存后只读展示，不可编辑 */
  saved?: boolean;
}

export default function RecordNoteSection({
  value,
  onChange,
  placeholder = "比如今天有什么特殊情况，或想多记一句",
  hint = "比如今天有什么特殊情况，或想多记一句",
  saved = false,
}: RecordNoteSectionProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  // 每次进入编辑态时，把外部 value 同步到本地草稿
  useEffect(() => {
    if (editing) {
      setDraft(value);
    }
  }, [editing, value]);

  const hasContent = value.trim().length > 0;

  // 已保存 + 无内容 → 隐藏整个模块
  if (saved && !hasContent) return null;

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
  };

  const handleSave = () => {
    onChange(draft.trim());
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <div className="mt-4">
      <div className="mb-2 text-[13px] font-medium text-ink-faint">
        补充说明（可选）
      </div>

      {/* 空态：+ 添加一句补充 + 轻提示 */}
      {!editing && !hasContent && (
        <button
          onClick={startEdit}
          className="w-full rounded-2xl border border-dashed border-line bg-white px-4 py-3.5 text-left transition-colors hover:border-ink-faint"
        >
          <span className="text-[14px] text-ink-soft">+ 添加一句补充</span>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
            {hint}
          </p>
        </button>
      )}

      {/* 已填写态（未保存）：展示文本 + 编辑入口 */}
      {!editing && hasContent && !saved && (
        <div className="flex items-start gap-3 rounded-2xl border border-line bg-white px-4 py-3.5">
          <p className="min-w-0 flex-1 text-[14px] leading-relaxed text-ink">
            {value}
          </p>
          <button
            onClick={startEdit}
            className="inline-flex shrink-0 items-center gap-1 pt-[1px] text-[12px] leading-relaxed text-ink-faint transition-colors hover:text-ink"
          >
            <Pencil className="h-3 w-3" strokeWidth={1.8} />
            编辑
          </button>
        </div>
      )}

      {/* 已保存 + 有内容：只读展示 */}
      {!editing && hasContent && saved && (
        <div className="rounded-2xl border border-line bg-white px-4 py-3.5">
          <p className="text-[14px] leading-relaxed text-ink">{value}</p>
        </div>
      )}

      {/* 编辑态：展开输入框 */}
      {editing && (
        <div className="rounded-2xl border border-line bg-white px-4 py-3">
          <VoiceInputBar
            value={draft}
            onChange={setDraft}
            onSend={handleSave}
            canSend={draft.trim().length > 0}
            placeholder={placeholder}
            className="border-0 px-0 py-1"
            showSendButton={false}
            mockText="今天有点累，想先慢一点。"
          />
          <div className="mt-3 flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] font-medium text-ink-soft transition-colors hover:border-ink-faint"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={draft.trim().length === 0}
              className={`flex-1 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-opacity ${
                draft.trim().length > 0
                  ? "bg-action-primary text-action-primary-text hover:opacity-90"
                  : "bg-surface-muted text-ink-faint"
              }`}
            >
              完成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
