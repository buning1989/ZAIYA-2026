import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mic, Send, X } from "lucide-react";

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
  /** 发送按钮背景色，默认 bg-action-primary */
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
  sendButtonClassName = "bg-action-primary text-action-primary-text",
  className = "rounded-[14px] border border-line bg-white py-[14px] pl-[16px] pr-[14px]",
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
    <div className={`flex h-[56px] items-center ${className}`}>
      {/* 左侧：× 取消（仅当传入 onCancel 时显示） */}
      {onCancel && (
        <button
          onClick={handleCancel}
          aria-label="取消"
          className="mr-2 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-faint transition-colors hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* 中部：文本输入
          录音 / 识别中保持 textarea 原位（disabled），不展开横向波形，
          避免输入框高度跳动和页面元素位移。 */}
      <div className="flex flex-1 items-center">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSend) onSend();
            }
          }}
          placeholder={placeholder}
          rows={1}
          disabled={voiceState !== "idle"}
          className="w-full resize-none bg-transparent p-0 text-[14px] leading-[20px] text-ink placeholder:text-ink-faint focus:outline-none disabled:opacity-50"
        />
      </div>

      {/* 右侧：语音 / 发送，与 compact 模式视觉一致
          - idle：圆形语音按钮（Mic）+ 发送（canSend 控制高亮/置灰）
          - recording：圆形按钮内部切换为动态声纹，点击停止录音
          - transcribing：圆形按钮内部切换为 Loader2 旋转，禁用
          语音按钮统一圆形 h-9 w-9 rounded-full，不再使用方形停止按钮。 */}
      <div className="ml-3 flex shrink-0 items-center gap-[10px]">
        <button
          onClick={voiceState === "recording" ? stopRecording : startRecording}
          aria-label={voiceState === "recording" ? "停止录音" : "语音"}
          disabled={voiceState === "transcribing"}
          className={`grid h-9 w-9 place-items-center rounded-full border border-line bg-white/70 text-ink-soft backdrop-blur-sm transition-colors hover:text-ink disabled:opacity-40 ${
            voiceState === "recording" ? "border-ink-faint" : ""
          }`}
        >
          {voiceState === "idle" && <Mic className="h-[18px] w-[18px]" strokeWidth={1.8} />}
          {voiceState === "recording" && (
            <span className="flex items-end gap-0.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="rounded-full w-[2px]"
                  animate={{ height: [3, 9, 3] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.1,
                  }}
                  style={{ height: 3, backgroundColor: accentColor }}
                />
              ))}
            </span>
          )}
          {voiceState === "transcribing" && (
            <Loader2 className="h-4 w-4 animate-spin text-ink-faint" />
          )}
        </button>
        {showSendButton && (
          <button
            onClick={onSend}
            aria-label="发送"
            disabled={!canSend || voiceState !== "idle"}
            className={`grid h-9 w-9 place-items-center rounded-[10px] transition-opacity ${sendButtonClassName} ${
              canSend && voiceState === "idle" ? "opacity-100" : "opacity-30"
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
