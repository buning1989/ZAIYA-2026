import { router } from 'expo-router';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SleepScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.row}>
          <Text style={styles.label}>入睡时间</Text>
          <Text style={styles.value}>--:--</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>起床时间</Text>
          <Text style={styles.value}>--:--</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.primaryBtn} onPress={() => router.push('/review')}>
          <Text style={styles.primaryBtnText}>保存</Text>
        </Pressable>
        <Pressable style={styles.linkBtn} onPress={() => router.dismissTo('/')}>
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
