import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/chat/ChatProvider';
import { ChatMessage } from '@/chat/types';

const MAX_INPUT_HEIGHT = 140;

export default function ChatScreen() {
  const { messages, pending, sendMessage } = useChat();
  const [input, setInput] = useState('');

  const listRef = useRef<FlatList<ChatMessage>>(null);
  // 用户主动滚动后暂停自动滚动，直到接近底部
  const userScrolledAwayRef = useRef(false);
  const inputRef = useRef<TextInput>(null);

  const trimmed = input.trim();
  const canSend = trimmed.length > 0 && !pending;

  // 收到新消息或 pending 变化时，如果用户在底部附近，自动滚动到底
  useEffect(() => {
    if (messages.length === 0) return;
    if (userScrolledAwayRef.current) return;
    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 60);
    return () => clearTimeout(timer);
  }, [messages.length, pending]);

  const handleSend = () => {
    if (!canSend) return;
    const text = input;
    setInput('');
    inputRef.current?.clear();
    sendMessage(text);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const distanceFromBottom =
      contentSize.height - contentOffset.y - layoutMeasurement.height;
    userScrolledAwayRef.current = distanceFromBottom > 120;
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}
      >
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleAssistant,
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant,
            ]}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <Pressable style={styles.flex} onPress={() => Keyboard.dismiss()}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="handled"
            onScrollToIndexFailed={() => {}}
            ListFooterComponent={
              pending ? (
                <View style={[styles.row, styles.rowAssistant]}>
                  <View style={[styles.bubble, styles.bubbleAssistant]}>
                    <ActivityIndicator size="small" color="#60646C" />
                    <Text style={styles.thinkingText}>在在正在想</Text>
                  </View>
                </View>
              ) : null
            }
          />
        </Pressable>

        <View style={styles.inputBar}>
          <TextInput
            ref={inputRef}
            value={input}
            onChangeText={setInput}
            placeholder="说点什么…"
            placeholderTextColor="#9CA0A8"
            multiline
            maxLength={2000}
            style={styles.input}
          />
          <Pressable
            style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
            disabled={!canSend}
            onPress={handleSend}
            hitSlop={8}
          >
            <Text style={[styles.sendBtnText, !canSend && styles.sendBtnTextDisabled]}>
              发送
            </Text>
          </Pressable>
        </View>

        <View style={styles.footerLink}>
          <Pressable
            style={styles.linkBtn}
            onPress={() => router.dismissTo('/')}
            hitSlop={8}
          >
            <Text style={styles.linkBtnText}>返回首页</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    marginVertical: 6,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  bubbleUser: {
    backgroundColor: '#1A1A1A',
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: '#F5F1EA',
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: '#FFFFFF',
  },
  bubbleTextAssistant: {
    color: '#1A1A1A',
  },
  thinkingText: {
    fontSize: 14,
    color: '#60646C',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: MAX_INPUT_HEIGHT,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#F5F1EA',
    fontSize: 16,
    lineHeight: 22,
    color: '#1A1A1A',
    textAlignVertical: 'center',
  },
  sendBtn: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#3B7A4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#D8DBDF',
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  sendBtnTextDisabled: {
    color: '#9CA0A8',
  },
  footerLink: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  linkBtn: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkBtnText: {
    color: '#60646C',
    fontSize: 14,
  },
});
