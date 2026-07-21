// 在呀 ZÀIYA - 数据库迁移
//
// 使用 PRAGMA user_version 管理迁移。
// 每个版本对应一组 SQL 语句，可重复执行（IF NOT EXISTS）。
// 不删除已有数据。

export interface Migration {
  version: number;
  description: string;
  statements: string[];
}

export const CURRENT_DB_VERSION = 1;

export const migrations: Migration[] = [
  {
    version: 1,
    description: 'initial schema: chat_sessions, chat_messages, sleep_records',
    statements: [
      // 会话表
      `CREATE TABLE IF NOT EXISTS chat_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
      // 消息表
      `CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY NOT NULL,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT NOT NULL,
        safety_level TEXT,
        suggested_action_type TEXT,
        request_id TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
      )`,
      // 睡眠记录表
      `CREATE TABLE IF NOT EXISTS sleep_records (
        id TEXT PRIMARY KEY NOT NULL,
        sleep_at INTEGER NOT NULL,
        wake_at INTEGER NOT NULL,
        duration_minutes INTEGER NOT NULL,
        note TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
      // 索引：按会话查消息
      `CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id)`,
      // 索引：按时间排序消息
      `CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at)`,
      // 索引：睡眠记录按时间倒序
      `CREATE INDEX IF NOT EXISTS idx_sleep_records_sleep_at ON sleep_records(sleep_at)`,
    ],
  },
];
