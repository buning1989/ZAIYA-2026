// 在呀 ZÀIYA - 数据库类型定义
//
// 与 src/chat/types.ts 的 ChatMessage 互补：
// 这里定义的是数据库行结构（row），用于持久化与读取。

export type MessageRole = 'user' | 'assistant';
export type MessageStatus = 'sending' | 'sent' | 'error';
export type SafetyLevel = 'normal' | 'boundary' | 'high';
// 数据库中 suggested_action_type 只存 type 字符串（label 由前端常量提供）
export type SuggestedActionType = 'sleep_record' | null;

export interface ChatSessionRow {
  id: string;
  created_at: number;
  updated_at: number;
}

export interface ChatMessageRow {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  safety_level: SafetyLevel | null;
  suggested_action_type: SuggestedActionType;
  request_id: string | null;
  created_at: number;
}

export interface SleepRecordRow {
  id: string;
  sleep_at: number; // Unix ms
  wake_at: number; // Unix ms
  duration_minutes: number;
  note: string | null;
  created_at: number;
  updated_at: number;
}
