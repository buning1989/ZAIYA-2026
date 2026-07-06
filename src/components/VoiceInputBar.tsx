import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mic, Send, Square, X } from "lucide-react";

/**
 * 通用语音输入组件，统一「首页对话」与「记一下」的语音交互。
 *
 * 状态机：idle → recording → transcribing → idle（文本已填入）
 *
 * 不调用真实麦克风 / 语音识别 API；不跳页、不弹窗。
 * 转录结果为 mock 文本：【语音转文字占位】
 */
export type VoiceState = "idle" | "recording" | "transcribing";

export interface VoiceInputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  /** 是否允许发送（控制发送按钮高亮/置灰） */
  canSend: boolean;
  /** 左侧 × 按钮回调；不传则不显示 × */
  onCancel?: () => void;
  placeholder?: string;
  /** 发送按钮背景色，默认 bg-accent */
  sendButtonClassName?: string;
  /** 外层容器自定义 className */
  className?: string;
}

export default function VoiceInputBar({
  value,
  onChange,
  onSend,
  canSend,
  onCancel,
  placeholder = "说点什么…",
  sendButtonClassName = "bg-accent text-canvas",
  className = "rounded-2xl border border-line bg-white p-2",
}: VoiceInputBarProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");

  // 进入录制态
  const startRecording = () => setVoiceState("recording");

  // 停止录音 → 进入识别态 → 800–1200ms 后填入 mock 文本，回到 idle
  const stopRecording = () => {
    setVoiceState("transcribing");
    const delay = 800 + Math.random() * 400;
    window.setTimeout(() => {
      onChange("【语音转文字占位】");
      setVoiceState("idle");
    }, delay);
  };

  // × 取消：重置语音状态 + 调用外部回调
  const handleCancel = () => {
    setVoiceState("idle");
    onCancel?.();
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* 左侧：× 取消（仅当传入 onCancel 时显示） */}
      {onCancel && (
        <button
          onClick={handleCancel}
          aria-label="取消"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-faint transition-colors hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* 中部：根据状态切换 文本输入 / 波形 / 正在转录 */}
      <div className="flex flex-1 items-center">
        {voiceState === "idle" && (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSend && onSend()}
            placeholder={placeholder}
            className="w-full bg-transparent px-2 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
        )}

        {voiceState === "recording" && (
          <div className="flex w-full items-center justify-center gap-1 py-1">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <motion.span
                key={i}
                className="w-1 rounded-full bg-ink-soft"
                animate={{ height: [6, 16, 6] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.08,
                }}
                style={{ height: 6 }}
              />
            ))}
          </div>
        )}

        {voiceState === "transcribing" && (
          <div className="flex w-full items-center justify-center gap-2 py-1">
            <Loader2 className="h-4 w-4 animate-spin text-ink-faint" />
            <span className="text-[13px] text-ink-faint">正在转录</span>
          </div>
        )}
      </div>

      {/* 右侧：根据状态切换按钮 */}
      {voiceState === "idle" && (
        <>
          <button
            onClick={startRecording}
            aria-label="语音"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-faint transition-colors hover:text-ink"
          >
            <Mic className="h-4 w-4" />
          </button>
          <button
            onClick={onSend}
            aria-label="发送"
            disabled={!canSend}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-opacity ${sendButtonClassName} ${
              canSend ? "opacity-100" : "opacity-30"
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        </>
      )}

      {voiceState === "recording" && (
        <>
          <button
            onClick={stopRecording}
            aria-label="停止录音"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink text-canvas transition-opacity"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </button>
          <button
            aria-label="发送"
            disabled
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-opacity opacity-30 ${sendButtonClassName}`}
          >
            <Send className="h-4 w-4" />
          </button>
        </>
      )}

      {/* transcribing 态：右侧发送按钮置灰 */}
      {voiceState === "transcribing" && (
        <button
          aria-label="发送"
          disabled
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-opacity opacity-30 ${sendButtonClassName}`}
        >
          <Send className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
