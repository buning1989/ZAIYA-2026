import { router } from 'expo-router';
import { StyleSheet, View, Pressable, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>
            我把窗帘拉开了一条小缝，光就自己挤进来了。
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.primaryBtn} onPress={() => router.push('/sleep')}>
          <Text style={styles.primaryBtnText}>记一下睡眠</Text>
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
    paddingBottom: 24,
  },
  bubble: {
    alignSelf: 'flex-start',
    maxWidth: '85%',
    backgroundColor: '#F5F1EA',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1A1A1A',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
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
