export type MessageRole = 'user' | 'assistant';

// sending: 用户消息已加入但请求中
// sent: 已成功
// error: 请求失败（可重试）
export type MessageStatus = 'sending' | 'sent' | 'error';

export type SafetyLevel = 'normal' | 'boundary' | 'high';

export type SuggestedAction = {
  type: 'sleep_record';
  label: string;
} | null;

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  createdAt: number;
  safetyLevel?: SafetyLevel;
  suggestedAction?: SuggestedAction;
  requestId?: string;
  // 用于重试：触发本条 assistant 回复的用户消息 id
  retryOf?: string;
  errorType?: string;
  errorStatus?: number;
  errorRequestId?: string;
  errorClientRequestId?: string;
  errorDurationMs?: number;
  errorAttempts?: number;
}
