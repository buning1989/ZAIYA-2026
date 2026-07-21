// 在呀 ZÀIYA - 数据库初始化与连接管理
//
// 使用 expo-sqlite 开启数据库连接并执行迁移。
// 数据库初始化可重复执行（幂等）。
// 不删除已有数据。

import * as SQLite from 'expo-sqlite';
import { migrations, CURRENT_DB_VERSION } from './migrations';

const DB_NAME = 'zaiya.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function execAsync(db: SQLite.SQLiteDatabase, sql: string): Promise<void> {
  return db.execAsync(sql).then(() => undefined);
}

async function getUserVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  const result = await db.getAllAsync<{ user_version: number }>(
    'PRAGMA user_version',
  );
  return result[0]?.user_version ?? 0;
}

async function setUserVersion(db: SQLite.SQLiteDatabase, version: number): Promise<void> {
  await execAsync(db, `PRAGMA user_version = ${version}`);
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const current = await getUserVersion(db);
  for (const m of migrations) {
    if (m.version <= current) continue;
    for (const stmt of m.statements) {
      await execAsync(db, stmt);
    }
    await setUserVersion(db, m.version);
  }
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  if (!initPromise) {
    initPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      // 启用外键约束
      await execAsync(db, 'PRAGMA foreign_keys = ON');
      await runMigrations(db);
      dbInstance = db;
      return db;
    })();
  }
  return initPromise;
}

// 仅用于测试：关闭并重置单例（不删除数据库文件）
export async function resetDatabaseInstanceForTest(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
    initPromise = null;
  }
}

export { CURRENT_DB_VERSION };
