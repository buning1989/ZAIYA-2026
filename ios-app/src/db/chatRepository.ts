// 在呀 ZÀIYA - 对话数据访问层
//
// 所有 SQL 集中在此文件，页面与 Provider 只调用仓库方法。
// 全部使用参数化 SQL，防止注入。

import { getDatabase } from './database';
import {
  ChatSessionRow,
  ChatMessageRow,
  MessageRole,
  MessageStatus,
  SafetyLevel,
  SuggestedActionType,
} from './types';

const WELCOME_SESSION_ID = 'default';

function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// 创建或取得当前会话
export async function getOrCreateCurrentSession(): Promise<ChatSessionRow> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<ChatSessionRow>(
    'SELECT id, created_at, updated_at FROM chat_sessions WHERE id = ?',
    [WELCOME_SESSION_ID],
  );
  if (existing) {
    return existing;
  }
  const now = Date.now();
  await db.runAsync(
    'INSERT INTO chat_sessions (id, created_at, updated_at) VALUES (?, ?, ?)',
    [WELCOME_SESSION_ID, now, now],
  );
  return { id: WELCOME_SESSION_ID, created_at: now, updated_at: now };
}

interface InsertChatMessageParams {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  safetyLevel: SafetyLevel | null;
  suggestedActionType: SuggestedActionType;
  requestId: string | null;
  createdAt: number;
}

// 保存任意消息（用户或 AI）
export async function insertChatMessage(params: InsertChatMessageParams): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO chat_messages
      (id, session_id, role, content, status, safety_level, suggested_action_type, request_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.id,
      params.sessionId,
      params.role,
      params.content,
      params.status,
      params.safetyLevel,
      params.suggestedActionType,
      params.requestId,
      params.createdAt,
    ],
  );
  await db.runAsync(
    'UPDATE chat_sessions SET updated_at = ? WHERE id = ?',
    [params.createdAt, params.sessionId],
  );
}

// 保存用户消息
export async function saveUserMessage(
  sessionId: string,
  id: string,
  content: string,
  createdAt: number,
): Promise<void> {
  await insertChatMessage({
    id,
    sessionId,
    role: 'user',
    content,
    status: 'sent',
    safetyLevel: null,
    suggestedActionType: null,
    requestId: null,
    createdAt,
  });
}

// 保存 AI 回复消息
export async function saveAssistantMessage(
  sessionId: string,
  id: string,
  content: string,
  createdAt: number,
  safetyLevel: SafetyLevel,
  suggestedActionType: SuggestedActionType,
  requestId: string | null,
  status: MessageStatus = 'sent',
): Promise<void> {
  await insertChatMessage({
    id,
    sessionId,
    role: 'assistant',
    content,
    status,
    safetyLevel,
    suggestedActionType,
    requestId,
    createdAt,
  });
}

// 保存错误占位消息（assistant 角色，status=error）
export async function saveAssistantErrorPlaceholder(
  sessionId: string,
  id: string,
  createdAt: number,
  retryOfUserId: string,
): Promise<void> {
  // 错误占位消息的 content 用空串保存，retryOfUserId 通过 id 末尾编码
  // 这里 id 由调用方传入，约定格式：err_<retryOfUserId>
  void retryOfUserId;
  await insertChatMessage({
    id,
    sessionId,
    role: 'assistant',
    content: '',
    status: 'error',
    safetyLevel: null,
    suggestedActionType: null,
    requestId: null,
    createdAt,
  });
}

// 更新消息状态
export async function updateMessageStatus(
  id: string,
  status: MessageStatus,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE chat_messages SET status = ? WHERE id = ?',
    [status, id],
  );
}

// 删除某条消息（重试前移除错误占位）
export async function deleteMessage(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM chat_messages WHERE id = ?', [id]);
}

// 批量读取会话消息（按时间正序）
export async function getMessagesBySession(sessionId: string): Promise<ChatMessageRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<ChatMessageRow>(
    `SELECT id, session_id, role, content, status, safety_level, suggested_action_type, request_id, created_at
     FROM chat_messages
     WHERE session_id = ?
     ORDER BY created_at ASC`,
    [sessionId],
  );
}

// 统计会话消息数（用于判断是否首次启动）
export async function countMessagesBySession(sessionId: string): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) AS c FROM chat_messages WHERE session_id = ?',
    [sessionId],
  );
  return row?.c ?? 0;
}

export { WELCOME_SESSION_ID, genId };
