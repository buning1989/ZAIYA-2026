import { router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { getLatestSleepRecord } from '@/db/sleepRepository';
import { SleepRecordRow } from '@/db/types';

type LoadState = 'loading' | 'ready' | 'error';

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} 分钟`;
  if (m === 0) return `${h} 小时`;
  return `${h} 小时 ${m} 分钟`;
}

export default function ReviewScreen() {
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [record, setRecord] = useState<SleepRecordRow | null>(null);

  const load = async () => {
    setLoadState('loading');
    try {
      const r = await getLatestSleepRecord();
      setRecord(r);
      setLoadState('ready');
    } catch (e) {
      console.warn('[review] load failed:', e);
      setLoadState('error');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        {loadState === 'loading' ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="small" color="#60646C" />
            <Text style={styles.stateText}>正在读取记录</Text>
          </View>
        ) : loadState === 'error' ? (
          <View style={styles.centerState}>
            <Text style={styles.stateText}>记录读取失败</Text>
            <Pressable style={styles.reloadBtn} onPress={load} hitSlop={8}>
              <Text style={styles.reloadBtnText}>重新加载</Text>
            </Pressable>
          </View>
        ) : record ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>最近一次睡眠</Text>
            <View style={styles.row}>
              <Text style={styles.label}>入睡时间</Text>
              <Text style={styles.value}>{formatTime(record.sleep_at)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>起床时间</Text>
              <Text style={styles.value}>{formatTime(record.wake_at)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>睡眠时长</Text>
              <Text style={styles.valueHighlight}>
                {formatDuration(record.duration_minutes)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>记录日期</Text>
              <Text style={styles.value}>{formatDate(record.sleep_at)}</Text>
            </View>
            {record.note ? (
              <View style={styles.row}>
                <Text style={styles.label}>备注</Text>
                <Text style={styles.valueNote}>{record.note}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.centerState}>
            <Text style={styles.empty}>还没有睡眠记录</Text>
            <Text style={styles.emptyHint}>和在在聊聊后，可以记一下睡眠</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.primaryBtn} onPress={() => router.dismissTo('/')}>
          <Text style={styles.primaryBtnText}>回到首页</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  stateText: {
    fontSize: 14,
    color: '#60646C',
    textAlign: 'center',
  },
  reloadBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B7A4F',
  },
  reloadBtnText: {
    color: '#3B7A4F',
    fontSize: 14,
    fontWeight: '500',
  },
  empty: {
    fontSize: 15,
    color: '#60646C',
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 13,
    color: '#9CA0A8',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#F5F1EA',
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    color: '#60646C',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  label: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  value: {
    fontSize: 15,
    color: '#60646C',
    fontVariant: ['tabular-nums'],
  },
  valueHighlight: {
    fontSize: 15,
    color: '#3B7A4F',
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
  },
  valueNote: {
    fontSize: 15,
    color: '#60646C',
    flex: 1,
    marginLeft: 16,
    textAlign: 'right',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
