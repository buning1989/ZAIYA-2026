import { router } from 'expo-router';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { saveSleepRecord } from '@/db/sleepRepository';

// 跨午夜计算时长（分钟）
// 入睡时间和起床时间都按今天日期构造，若 wake <= sleep 则 wake 视为次日
function computeDurationMinutes(sleepAt: number, wakeAt: number): number {
  if (wakeAt > sleepAt) {
    return Math.round((wakeAt - sleepAt) / 60000);
  }
  // 跨午夜：wake 视为次日
  const wakeNextDay = wakeAt + 24 * 60 * 60 * 1000;
  return Math.round((wakeNextDay - sleepAt) / 60000);
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

type PickerMode = 'sleep' | 'wake' | null;

export default function SleepScreen() {
  // 默认入睡时间：今天 23:30；默认起床时间：明天 07:00
  // 为简化跨午夜逻辑，两个时间都用今天的日期构造
  const now = new Date();
  const defaultSleep = new Date(now);
  defaultSleep.setHours(23, 30, 0, 0);
  const defaultWake = new Date(now);
  defaultWake.setHours(7, 0, 0, 0);

  const [sleepAt, setSleepAt] = useState<number>(defaultSleep.getTime());
  const [wakeAt, setWakeAt] = useState<number>(defaultWake.getTime());
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [saving, setSaving] = useState(false);

  const durationMinutes = computeDurationMinutes(sleepAt, wakeAt);
  // 起床时间与入睡时间相同不得保存
  const isSameTime = wakeAt === sleepAt;
  const canSave = !saving && !isSameTime;

  const openPicker = (mode: Exclude<PickerMode, null>) => {
    setPickerMode(mode);
  };

  const onPickerChange = (_event: DateTimePickerEvent, date?: Date) => {
    // Android：选择后立即关闭；iOS：spinner 模式需手动关闭
    if (Platform.OS === 'android') {
      setPickerMode(null);
    }
    if (date) {
      const ts = date.getTime();
      if (pickerMode === 'sleep') setSleepAt(ts);
      if (pickerMode === 'wake') setWakeAt(ts);
    }
  };

  const closePicker = () => setPickerMode(null);

  const handleSave = async () => {
    if (!canSave) return;
    // 防止快速点击造成重复记录
    setSaving(true);
    try {
      // 跨午夜：若 wake <= sleep，保存时 wake 加一天
      let wakeAtToSave = wakeAt;
      if (wakeAt <= sleepAt) {
        wakeAtToSave = wakeAt + 24 * 60 * 60 * 1000;
      }
      const duration = Math.round((wakeAtToSave - sleepAt) / 60000);
      await saveSleepRecord({
        sleepAt,
        wakeAt: wakeAtToSave,
        durationMinutes: duration,
        note: null,
      });
      // 保存成功后进入 /review
      router.dismissTo('/review');
    } catch (e) {
      console.warn('[sleep] save failed:', e);
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <Pressable
          style={styles.row}
          onPress={() => openPicker('sleep')}
          disabled={saving}
        >
          <Text style={styles.label}>入睡时间</Text>
          <Text style={styles.value}>{formatTime(sleepAt)}</Text>
        </Pressable>

        <Pressable
          style={styles.row}
          onPress={() => openPicker('wake')}
          disabled={saving}
        >
          <Text style={styles.label}>起床时间</Text>
          <Text style={styles.value}>{formatTime(wakeAt)}</Text>
        </Pressable>

        <View style={styles.durationRow}>
          <Text style={styles.durationLabel}>睡眠时长</Text>
          <Text style={styles.durationValue}>
            {isSameTime ? '--' : `${durationMinutes} 分钟`}
          </Text>
        </View>

        {isSameTime && (
          <Text style={styles.hint}>入睡时间和起床时间不能相同</Text>
        )}
      </View>

      {pickerMode && (
        <View style={styles.pickerWrap}>
          <View style={styles.pickerHeader}>
            <Pressable onPress={closePicker} hitSlop={8}>
              <Text style={styles.pickerAction}>完成</Text>
            </Pressable>
          </View>
          <DateTimePicker
            value={new Date(pickerMode === 'sleep' ? sleepAt : wakeAt)}
            mode="time"
            display="spinner"
            onChange={onPickerChange}
            locale="zh-Hans"
          />
        </View>
      )}

      <View style={styles.footer}>
        <Pressable
          style={[styles.primaryBtn, !canSave && styles.primaryBtnDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>保存</Text>
          )}
        </Pressable>
        <Pressable
          style={styles.linkBtn}
          onPress={() => router.dismissTo('/')}
          disabled={saving}
          hitSlop={8}
        >
          <Text style={styles.linkBtnText}>返回首页</Text>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  label: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  value: {
    fontSize: 16,
    color: '#60646C',
    fontVariant: ['tabular-nums'],
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  durationLabel: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  durationValue: {
    fontSize: 16,
    color: '#3B7A4F',
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
  },
  hint: {
    fontSize: 13,
    color: '#B45309',
    marginTop: 4,
  },
  pickerWrap: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pickerAction: {
    color: '#3B7A4F',
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
    marginTop: 'auto',
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: '#D8DBDF',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  linkBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkBtnText: {
    color: '#60646C',
    fontSize: 15,
  },
});
