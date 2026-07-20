import { router } from 'expo-router';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';

import testVideo from '@/assets/videos/zaiya-test.mp4';

export default function HomeScreen() {
  const player = useVideoPlayer(testVideo, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>在呀</Text>

        <View style={styles.videoWrap}>
          <VideoView
            player={player}
            style={styles.video}
            contentFit="contain"
            nativeControls={false}
            allowsPictureInPicture={false}
          />
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.primaryBtn} onPress={() => router.push('/chat')}>
            <Text style={styles.primaryBtnText}>和在在说说</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => router.push('/review')}>
            <Text style={styles.secondaryBtnText}>回头看看</Text>
          </Pressable>
        </View>
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
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  videoWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  video: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#F5F1EA',
  },
  actions: {
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
  secondaryBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '500',
  },
});
