import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mic, Send, Square, X } from "lucide-react";

/**
 * 通用语音输入组件，统一「首页对话」与「记一下」的语音交互。
 *
 * 状态机：idle → recording → transcribing → idle（文本已填入）/ failed（提示后回 idle）
 *
 * 不调用真实麦克风 / 语音识别 API；不跳页、不弹窗。
 * 转录结果为本地 mock 文本，不调用真实语音识别。
 *
 * compact 模式：只渲染一个轻量 mic 圆形按钮 + 状态反馈，不显示输入框 / 发送按钮，
 * 适合「夸夸自己」这类主输入区已占据全屏、不需要底部聊天输入条的场景。
 */
export type VoiceState = "idle" | "recording" | "transcribing" | "failed";

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
  /** 是否显示发送按钮，默认 true */
  showSendButton?: boolean;
  /** compact 模式：只渲染轻量 mic 按钮 + 状态反馈，不显示输入框 / 发送按钮 */
  compact?: boolean;
  /** compact 模式按钮尺寸：md（默认，h-10）/ sm（h-8，适合附加到短输入框） */
  size?: "md" | "sm";
  /** compact 模式录音态波形/失败态强调色（HEX/rgb），默认 #27331F。用于融入主题色场景 */
  tint?: string;
  /** 转录完成后填入的 mock 文本，默认「我今天有点累，想先慢一点。」 */
  mockText?: string;
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
  showSendButton = true,
  compact = false,
  size = "md",
  tint,
  mockText = "我今天有点累，想先慢一点。",
}: VoiceInputBarProps) {
  const accentColor = tint ?? "#27331F";
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");

  // 进入录制态
  const startRecording = () => setVoiceState("recording");

  // 停止录音 → 进入识别态 → 800–1200ms 后填入 mock 文本，回到 idle
  // compact 模式下引入 ~15% 失败概率，演示「没听清」提示
  const stopRecording = () => {
    setVoiceState("transcribing");
    const delay = 800 + Math.random() * 400;
    window.setTimeout(() => {
      if (compact && Math.random() < 0.15) {
        setVoiceState("failed");
        window.setTimeout(() => setVoiceState("idle"), 2000);
        return;
      }
      onChange(mockText);
      setVoiceState("idle");
    }, delay);
  };

  // × 取消：重置语音状态 + 调用外部回调
  const handleCancel = () => {
    setVoiceState("idle");
    onCancel?.();
  };

  /* —— compact 模式：只渲染轻量 mic 圆形按钮 + 状态反馈 —— */
  if (compact) {
    const btnSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";
    const micSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
    const barH = size === "sm" ? [3, 9, 3] : [4, 12, 4];
    const barW = size === "sm" ? "w-[2px]" : "w-0.5";
    const loaderSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
    const failedColor = tint ?? "#D99C6B";
    return (
      <div className="relative flex items-center justify-center">
        {/* 失败提示气泡 */}
        {voiceState === "failed" && (
          <span className="absolute -top-9 whitespace-nowrap rounded-full bg-ink/90 px-3 py-1 text-[11px] text-canvas">
            没听清，可以再说一次
          </span>
        )}
        <button
          onClick={voiceState === "recording" ? stopRecording : startRecording}
          aria-label={
            voiceState === "recording" ? "停止录音" : "语音输入"
          }
          className={`grid ${btnSize} place-items-center rounded-full border border-line bg-white/70 text-ink-soft backdrop-blur-sm transition-colors hover:text-ink`}
        >
          {voiceState === "idle" && <Mic className={micSize} strokeWidth={1.8} />}
          {voiceState === "recording" && (
            <span className="flex items-end gap-0.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className={`rounded-full ${barW}`}
                  animate={{ height: barH }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.1,
                  }}
                  style={{ height: barH[0], backgroundColor: accentColor }}
                />
              ))}
            </span>
          )}
          {voiceState === "transcribing" && (
            <Loader2 className={`${loaderSize} animate-spin text-ink-faint`} />
          )}
          {voiceState === "failed" && (
            <Mic className={micSize} style={{ color: failedColor }} strokeWidth={1.8} />
          )}
        </button>
      </div>
    );
  }

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
          {showSendButton && (
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
          )}
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
          {showSendButton && (
            <button
              aria-label="发送"
              disabled
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-opacity opacity-30 ${sendButtonClassName}`}
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </>
      )}

      {/* transcribing 态：右侧发送按钮置灰 */}
      {voiceState === "transcribing" && showSendButton && (
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
