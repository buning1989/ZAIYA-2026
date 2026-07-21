import { createContext, useContext, useReducer, ReactNode, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, SafetyLevel, SuggestedAction } from './types';
import { sendChat, ChatApiError, ChatApiMessage } from '@/api/chatApi';

// 客户端 high 固定兜底：即使服务端返回空也必须显示
const HIGH_FALLBACK_REPLY =
  '听到你说今晚可能伤害自己，我很担心你现在的安全。请现在就联系身边可信任的成年人或家人，并尽量不要独处。如果你正面临立即危险，请联系当地急救服务或前往最近的急诊。';

interface ChatState {
  messages: ChatMessage[];
  // 当前是否有 in-flight 的 assistant 回复
  pending: boolean;
  // 当前 in-flight 请求对应的用户消息 id（用于重试）
  pendingUserId: string | null;
}

type ChatAction =
  | { type: 'ADD_USER_MESSAGE'; message: ChatMessage }
  | { type: 'MARK_USER_SENT'; id: string }
  | { type: 'SET_PENDING'; pending: boolean; pendingUserId: string | null }
  | { type: 'ADD_ASSISTANT_MESSAGE'; message: ChatMessage }
  | { type: 'MARK_ASSISTANT_ERROR'; id: string }
  | { type: 'CLEAR_PENDING' }
  | { type: 'REMOVE_ASSISTANT_ERROR_BY_USER'; userId: string };

const initialState: ChatState = {
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: '我在。今天怎么样？',
      status: 'sent',
      createdAt: Date.now(),
    },
  ],
  pending: false,
  pendingUserId: null,
};

function reducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] };
    case 'MARK_USER_SENT':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id ? { ...m, status: 'sent' as const } : m,
        ),
      };
    case 'SET_PENDING':
      return { ...state, pending: action.pending, pendingUserId: action.pendingUserId };
    case 'ADD_ASSISTANT_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.message],
        pending: false,
        pendingUserId: null,
      };
    case 'MARK_ASSISTANT_ERROR':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id ? { ...m, status: 'error' as const } : m,
        ),
        pending: false,
        pendingUserId: null,
      };
    case 'CLEAR_PENDING':
      return { ...state, pending: false, pendingUserId: null };
    case 'REMOVE_ASSISTANT_ERROR_BY_USER': {
      // 重试前移除该用户消息对应的错误 assistant 消息
      const filtered = state.messages.filter(
        (m) => !(m.role === 'assistant' && m.status === 'error' && m.retryOf === action.userId),
      );
      return { ...state, messages: filtered };
    }
    default:
      return state;
  }
}

interface ChatContextValue {
  messages: ChatMessage[];
  pending: boolean;
  // 发送用户消息，返回用户消息 id
  sendMessage: (text: string) => string;
  // 重试某条用户消息（不重复插入用户消息）
  retry: (userId: string) => void;
  // 取消当前 in-flight 请求（离开页面时调用）
  cancel: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

let messageSeq = 0;
function genId(): string {
  messageSeq += 1;
  return `m_${Date.now()}_${messageSeq}`;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // 当前 in-flight 请求的 AbortController
  const abortRef = useRef<AbortController | null>(null);

  // 离开页面时取消请求：组件卸载时执行
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      dispatch({ type: 'CLEAR_PENDING' });
    };
  }, []);

  const doRequest = useCallback(
    async (userId: string, history: ChatApiMessage[], isRetry: boolean) => {
      // 同一时间只允许一个请求
      if (stateRef.current.pending) {
        return;
      }

      // 重试前移除该用户消息对应的错误 assistant 消息
      if (isRetry) {
        dispatch({ type: 'REMOVE_ASSISTANT_ERROR_BY_USER', userId });
      }

      dispatch({ type: 'SET_PENDING', pending: true, pendingUserId: userId });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const resp = await sendChat(history, { signal: controller.signal });

        // high 级别：即使服务端返回空也使用本地固定兜底
        let reply = resp.reply;
        let safetyLevel: SafetyLevel = resp.safetyLevel;
        if (safetyLevel === 'high' && (!reply || reply.trim().length === 0)) {
          reply = HIGH_FALLBACK_REPLY;
        }
        if (!reply || reply.trim().length === 0) {
          // 服务端返回空 reply 但不是 high：标记错误
          const errorMsg: ChatMessage = {
            id: genId(),
            role: 'assistant',
            content: '',
            status: 'error',
            createdAt: Date.now(),
            retryOf: userId,
            requestId: resp.requestId,
          };
          dispatch({ type: 'ADD_ASSISTANT_MESSAGE', message: errorMsg });
          return;
        }

        const assistantMessage: ChatMessage = {
          id: genId(),
          role: 'assistant',
          content: reply,
          status: 'sent',
          createdAt: Date.now(),
          safetyLevel,
          suggestedAction: safetyLevel === 'high' ? null : resp.suggestedAction,
          requestId: resp.requestId,
          retryOf: userId,
        };
        dispatch({ type: 'ADD_ASSISTANT_MESSAGE', message: assistantMessage });
      } catch (err) {
        // cancelled 不显示错误消息（离开页面或主动取消）
        if (err instanceof ChatApiError && err.type === 'cancelled') {
          dispatch({ type: 'CLEAR_PENDING' });
          return;
        }
        // 其他错误：插入 error 占位 assistant 消息，允许重试
        const errorMsg: ChatMessage = {
          id: genId(),
          role: 'assistant',
          content: '',
          status: 'error',
          createdAt: Date.now(),
          retryOf: userId,
        };
        dispatch({ type: 'ADD_ASSISTANT_MESSAGE', message: errorMsg });
      } finally {
        abortRef.current = null;
      }
    },
    [],
  );

  const sendMessage = useCallback((text: string): string => {
    const trimmed = text.trim();
    if (!trimmed) {
      return '';
    }
    // 同一时间只处理一条回复
    if (stateRef.current.pending) {
      return '';
    }

    const userMessage: ChatMessage = {
      id: genId(),
      role: 'user',
      content: trimmed,
      status: 'sending',
      createdAt: Date.now(),
    };
    dispatch({ type: 'ADD_USER_MESSAGE', message: userMessage });

    // 用户消息几乎立即转为 sent
    setTimeout(() => {
      dispatch({ type: 'MARK_USER_SENT', id: userMessage.id });
    }, 80);

    const history: ChatApiMessage[] = stateRef.current.messages
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.status !== 'error')
      .map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: trimmed });

    // 异步发起请求（不阻塞 UI）
    void doRequest(userMessage.id, history, false);

    return userMessage.id;
  }, [doRequest]);

  const retry = useCallback((userId: string) => {
    if (stateRef.current.pending) return;
    const currentMessages = stateRef.current.messages;
    const userIdx = currentMessages.findIndex((m) => m.id === userId);
    if (userIdx < 0) return;
    const userMsg = currentMessages[userIdx];
    if (!userMsg || userMsg.role !== 'user') return;

    const history: ChatApiMessage[] = [];
    for (let i = 0; i <= userIdx; i++) {
      const m = currentMessages[i];
      if ((m.role === 'user' || m.role === 'assistant') && m.status !== 'error') {
        history.push({ role: m.role, content: m.content });
      }
    }

    void doRequest(userId, history, true);
  }, [doRequest]);

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    dispatch({ type: 'CLEAR_PENDING' });
  }, []);

  return (
    <ChatContext.Provider value={{ messages: state.messages, pending: state.pending, sendMessage, retry, cancel }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return ctx;
}
