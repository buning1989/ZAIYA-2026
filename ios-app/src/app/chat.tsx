import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@/chat/ChatProvider';
import { ChatMessage } from '@/chat/types';

const MAX_INPUT_HEIGHT = 140;

export default function ChatScreen() {
  const { messages, pending, sendMessage, retry, cancel } = useChat();
  const [input, setInput] = useState('');

  const inputRef = useRef<TextInput>(null);
  const invertedMessages = useMemo(() => [...messages].reverse(), [messages]);

  // 离开页面取消请求
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  const handleSend = () => {
    if (input.trim().length === 0 || pending) return;
    const text = input;
    setInput('');
    inputRef.current?.clear();
    sendMessage(text);
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';

    // error 状态的 assistant 消息：显示重试卡片
    if (!isUser && item.status === 'error') {
      return (
        <View style={[styles.row, styles.rowAssistant]}>
          <View style={[styles.bubble, styles.bubbleAssistant, styles.bubbleError]}>
            <Text style={styles.errorText}>没连上，再试一次？</Text>
            <Pressable
              style={styles.retryBtn}
              onPress={() => item.retryOf && retry(item.retryOf)}
              hitSlop={8}
            >
              <Text style={styles.retryBtnText}>重新试试</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.col}>
        <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
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
        {/* 行动卡片：仅 sleep_record 显示，high 和 boundary 不显示 */}
        {!isUser && item.suggestedAction?.type === 'sleep_record' && item.status === 'sent' && (
          <View style={styles.actionRow}>
            <Pressable
              style={styles.actionCard}
              onPress={() => router.push('/sleep')}
              hitSlop={6}
            >
              <Text style={styles.actionCardText}>{item.suggestedAction.label}</Text>
              <Text style={styles.actionCardArrow}>→</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  const canSend = input.trim().length > 0 && !pending;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <FlatList
            style={styles.flex}
            data={invertedMessages}
            inverted
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 120,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === 'ios' ? 'interactive' : 'on-drag'
            }
            ListHeaderComponent={
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
        </TouchableWithoutFeedback>

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
    paddingTop: 24,
    paddingBottom: 16,
  },
  col: {
    width: '100%',
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
  bubbleError: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
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
  errorText: {
    fontSize: 14,
    color: '#60646C',
  },
  retryBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3B7A4F',
  },
  retryBtnText: {
    color: '#3B7A4F',
    fontSize: 14,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 6,
    marginBottom: 4,
    marginLeft: 4,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3B7A4F',
  },
  actionCardText: {
    color: '#3B7A4F',
    fontSize: 14,
    fontWeight: '500',
  },
  actionCardArrow: {
    color: '#3B7A4F',
    fontSize: 14,
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
