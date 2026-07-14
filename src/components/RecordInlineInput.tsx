import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import VoiceInputBar from "./VoiceInputBar";

const ease = [0.22, 1, 0.36, 1] as const;

/* —— 记录模块通用自由输入组件 ——
 * 所有「记一下」子模块中需要自由输入的场景，统一使用这个组件，
 * 不允许每个模块单独写一套 textarea / input 样式。
 *
 * 形态：轻量底部弹层（bottom sheet）
 *   - 顶部：标题 + 关闭按钮
 *   - 中部：圆角输入容器（textarea + 语音按钮，复用 VoiceInputBar inline 风格）
 *   - 底部：保存按钮（输入为空时置灰）
 *
 * 不接真实语音识别；VoiceInputBar 内部 mock 转录结果。
 * 点击保存：调用 onSave(value)，由调用方写入对应字段。
 * 点击关闭 / 遮罩：调用 onClose，不修改任何字段。
 *
 * 用法：
 *   <RecordInlineInput
 *     show={showCustomInput}
 *     title="其他感受"
 *     placeholder="如果还有别的感受，可以写在这里"
 *     value={customDiscomfortText}
 *     onSave={(v) => setCustomDiscomfortText(v)}
 *     onClose={() => setShowCustomInput(false)}
 *   />
 */
export interface RecordInlineInputProps {
  /** 是否显示 */
  show: boolean;
  /** 顶部标题 */
  title: string;
  /** 输入框 placeholder */
  placeholder?: string;
  /** 当前值（每次 show 由 true 时同步到本地输入态） */
  value: string;
  /** 最大字数（默认 200） */
  maxLength?: number;
  /** 是否启用语音入口（默认 true） */
  enableVoice?: boolean;
  /** 保存回调，传入最终文本 */
  onSave: (value: string) => void;
  /** 关闭回调 */
  onClose: () => void;
}

export default function RecordInlineInput({
  show,
  title,
  placeholder = "写点什么…",
  value,
  maxLength = 200,
  enableVoice = true,
  onSave,
  onClose,
}: RecordInlineInputProps) {
  // 本地输入态：每次 show 由 false → true 时，从 value 同步
  const [localValue, setLocalValue] = useState(value);

  // show 切换为 true 时，把外部 value 同步到本地输入态
  useEffect(() => {
    if (show) {
      setLocalValue(value);
    }
  }, [show, value]);

  const canSave = localValue.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave(localValue.trim());
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 bg-ink/25"
            onClick={handleClose}
          />
          {/* 底部弹层 */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.28, ease }}
            className="absolute inset-x-0 bottom-0 z-40 rounded-t-2xl bg-white px-5 pb-7 pt-5 shadow-[0_-8px_24px_rgba(39,51,31,0.08)]"
          >
            {/* 顶部：标题 + 关闭 */}
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold tracking-tight text-ink">
                {title}
              </h3>
              <button
                onClick={handleClose}
                aria-label="关闭"
                className="grid h-8 w-8 place-items-center rounded-full text-ink-faint transition-colors hover:bg-surface-soft hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 中部：输入区（文本 + 语音，不显示纸飞机，保存统一走底部按钮） */}
            <div className="mt-4">
              {enableVoice ? (
                <VoiceInputBar
                  value={localValue}
                  onChange={setLocalValue}
                  onSend={handleSave}
                  canSend={canSave}
                  placeholder={placeholder}
                  className="rounded-2xl border border-line bg-white py-[12px] pl-[16px] pr-[14px] min-h-[44px] items-center"
                  showSendButton={false}
                  mockText="今天有点累，想先慢一点。"
                />
              ) : (
                <textarea
                  value={localValue}
                  onChange={(e) =>
                    setLocalValue(e.target.value.slice(0, maxLength))
                  }
                  placeholder={placeholder}
                  rows={1}
                  maxLength={maxLength}
                  className="w-full resize-none rounded-2xl border border-line bg-white px-4 py-3 text-[14px] leading-[20px] text-ink outline-none transition-colors placeholder:text-ink-faint/50 focus:border-ink-faint"
                />
              )}
              {/* 字数提示 */}
              <div className="mt-1.5 text-right text-[11px] text-ink-faint">
                {localValue.length}/{maxLength}
              </div>
            </div>

            {/* 底部：保存按钮 */}
            <div className="mt-2">
              <button
                onClick={handleSave}
                disabled={!canSave}
                className={`w-full rounded-xl px-4 py-3 text-[13px] font-medium transition-opacity ${
                  canSave
                    ? "bg-action-primary text-action-primary-text hover:opacity-90"
                    : "bg-surface-muted text-ink-faint"
                }`}
              >
                保存
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
