// 在呀 ZÀIYA - 睡眠记录数据访问层
//
// 所有 SQL 集中在此文件。
// 全部使用参数化 SQL。

import { getDatabase } from './database';
import { SleepRecordRow } from './types';

function genId(): string {
  return `sleep_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export interface SaveSleepRecordInput {
  sleepAt: number; // Unix ms
  wakeAt: number; // Unix ms
  durationMinutes: number;
  note: string | null;
}

// 保存睡眠记录（调用方负责跨午夜计算与时间校验）
export async function saveSleepRecord(input: SaveSleepRecordInput): Promise<SleepRecordRow> {
  const db = await getDatabase();
  const id = genId();
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO sleep_records
      (id, sleep_at, wake_at, duration_minutes, note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, input.sleepAt, input.wakeAt, input.durationMinutes, input.note, now, now],
  );
  return {
    id,
    sleep_at: input.sleepAt,
    wake_at: input.wakeAt,
    duration_minutes: input.durationMinutes,
    note: input.note,
    created_at: now,
    updated_at: now,
  };
}

// 查询最近一条睡眠记录
export async function getLatestSleepRecord(): Promise<SleepRecordRow | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<SleepRecordRow>(
    `SELECT id, sleep_at, wake_at, duration_minutes, note, created_at, updated_at
     FROM sleep_records
     ORDER BY sleep_at DESC
     LIMIT 1`,
  );
  return row ?? null;
}

// 查询睡眠记录列表（按入睡时间倒序，limit 默认 50）
export async function listSleepRecords(limit = 50): Promise<SleepRecordRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<SleepRecordRow>(
    `SELECT id, sleep_at, wake_at, duration_minutes, note, created_at, updated_at
     FROM sleep_records
     ORDER BY sleep_at DESC
     LIMIT ?`,
    [limit],
  );
}

// 统计睡眠记录数（用于防重复保存的快速校验）
export async function countSleepRecords(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) AS c FROM sleep_records',
  );
  return row?.c ?? 0;
}
