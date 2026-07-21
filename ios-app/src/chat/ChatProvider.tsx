import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { ChatMessage, SafetyLevel, SuggestedAction } from './types';
import { sendChat, ChatApiError, ChatApiMessage } from '@/api/chatApi';
import {
  getOrCreateCurrentSession,
  getMessagesBySession,
  countMessagesBySession,
  saveUserMessage,
  saveAssistantMessage,
  saveAssistantErrorPlaceholder,
  deleteMessage,
  WELCOME_SESSION_ID,
} from '@/db/chatRepository';
import { ChatMessageRow } from '@/db/types';

// 客户端 high 固定兜底：即使服务端返回空也必须显示
const HIGH_FALLBACK_REPLY =
  '听到你说今晚可能伤害自己，我很担心你现在的安全。请现在就联系身边可信任的成年人或家人，并尽量不要独处。如果你正面临立即危险，请联系当地急救服务或前往最近的急诊。';

// 欢迎消息（仅首次启动插入，重启后从数据库读取历史不重复插入）
const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '我在。今天怎么样？',
  status: 'sent',
  createdAt: Date.now(),
};

interface ChatState {
  // 数据库加载状态：loading | ready | error
  loadState: 'loading' | 'ready' | 'error';
  messages: ChatMessage[];
  pending: boolean;
  pendingUserId: string | null;
  sessionId: string | null;
}

type ChatAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; sessionId: string; messages: ChatMessage[] }
  | { type: 'LOAD_ERROR' }
  | { type: 'ADD_USER_MESSAGE'; message: ChatMessage }
  | { type: 'MARK_USER_SENT'; id: string }
  | { type: 'SET_PENDING'; pending: boolean; pendingUserId: string | null }
  | { type: 'ADD_ASSISTANT_MESSAGE'; message: ChatMessage }
  | { type: 'CLEAR_PENDING' }
  | { type: 'REMOVE_ASSISTANT_ERROR_BY_USER'; userId: string };

const initialState: ChatState = {
  loadState: 'loading',
  messages: [],
  pending: false,
  pendingUserId: null,
  sessionId: null,
};

function rowToMessage(row: ChatMessageRow): ChatMessage {
  const suggestedAction: SuggestedAction =
    row.suggested_action_type === 'sleep_record'
      ? { type: 'sleep_record', label: '记一下睡眠' }
      : null;
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    status: row.status,
    createdAt: row.created_at,
    safetyLevel: row.safety_level ?? undefined,
    suggestedAction: suggestedAction ?? undefined,
    requestId: row.request_id ?? undefined,
  };
}

function reducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loadState: 'loading' };
    case 'LOAD_SUCCESS':
      return {
        ...state,
        loadState: 'ready',
        sessionId: action.sessionId,
        messages: action.messages,
      };
    case 'LOAD_ERROR':
      return { ...state, loadState: 'error' };
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
    case 'CLEAR_PENDING':
      return { ...state, pending: false, pendingUserId: null };
    case 'REMOVE_ASSISTANT_ERROR_BY_USER': {
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
  loadState: 'loading' | 'ready' | 'error';
  messages: ChatMessage[];
  pending: boolean;
  sendMessage: (text: string) => string;
  retry: (userId: string) => void;
  cancel: () => void;
  reload: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

let messageSeq = 0;
function genId(): string {
  messageSeq += 1;
  return `m_${Date.now()}_${messageSeq}`;
}

function getErrorMeta(err: unknown) {
  if (err instanceof ChatApiError) {
    return {
      errorType: err.type,
      errorStatus: err.status,
      errorRequestId: err.requestId,
      errorClientRequestId: err.clientRequestId,
      errorDurationMs: err.durationMs,
      errorAttempts: err.attempts,
    };
  }
  return {
    errorType: 'unknown' as const,
  };
}

function toApiHistory(messages: ChatMessage[], currentUser?: ChatApiMessage): ChatApiMessage[] {
  const history: ChatApiMessage[] = messages
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.status !== 'error')
    .map((m) => ({ role: m.role, content: m.content }));

  if (currentUser) {
    history.push(currentUser);
  }

  return history.slice(-20);
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const abortRef = useRef<AbortController | null>(null);

  // 启动时加载数据库历史
  const loadFromDb = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });
    try {
      const session = await getOrCreateCurrentSession();
      const count = await countMessagesBySession(session.id);
      let rows = await getMessagesBySession(session.id);
      // 首次启动（无任何消息）：插入欢迎消息并保存
      if (count === 0) {
        await saveAssistantMessage(
          session.id,
          WELCOME_MESSAGE.id,
          WELCOME_MESSAGE.content,
          WELCOME_MESSAGE.createdAt,
          'normal',
          null,
          null,
          'sent',
        );
        rows = await getMessagesBySession(session.id);
      }
      const messages = rows.map(rowToMessage);
      dispatch({ type: 'LOAD_SUCCESS', sessionId: session.id, messages });
    } catch (err) {
      console.warn('[chat] load history failed:', err);
      dispatch({ type: 'LOAD_ERROR' });
    }
  }, []);

  useEffect(() => {
    void loadFromDb();
  }, [loadFromDb]);

  // 离开页面时取消请求
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
      if (stateRef.current.pending) {
        return;
      }
      const sessionId = stateRef.current.sessionId;
      if (!sessionId) {
        return;
      }

      // 重试前移除该用户消息对应的错误 assistant 消息（前端 + 数据库）
      if (isRetry) {
        dispatch({ type: 'REMOVE_ASSISTANT_ERROR_BY_USER', userId });
        try {
          await deleteMessage(`err_${userId}`);
        } catch (e) {
          console.warn('[chat] delete error placeholder failed:', e);
        }
      }

      dispatch({ type: 'SET_PENDING', pending: true, pendingUserId: userId });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const resp = await sendChat(history, { signal: controller.signal });

        let reply = resp.reply;
        const safetyLevel: SafetyLevel = resp.safetyLevel;
        if (safetyLevel === 'high' && (!reply || reply.trim().length === 0)) {
          reply = HIGH_FALLBACK_REPLY;
        }
        if (!reply || reply.trim().length === 0) {
          const errorMsgId = `err_${userId}`;
          const errorMsg: ChatMessage = {
            id: errorMsgId,
            role: 'assistant',
            content: '',
            status: 'error',
            createdAt: Date.now(),
            retryOf: userId,
            requestId: resp.requestId,
          };
          try {
            await saveAssistantErrorPlaceholder(sessionId, errorMsgId, errorMsg.createdAt, userId);
          } catch (e) {
            console.warn('[chat] save error placeholder failed:', e);
          }
          dispatch({ type: 'ADD_ASSISTANT_MESSAGE', message: errorMsg });
          return;
        }

        const assistantId = genId();
        const suggestedAction: SuggestedAction =
          safetyLevel === 'high' ? null : resp.suggestedAction;
        const assistantMessage: ChatMessage = {
          id: assistantId,
          role: 'assistant',
          content: reply,
          status: 'sent',
          createdAt: Date.now(),
          safetyLevel,
          suggestedAction,
          requestId: resp.requestId,
          retryOf: userId,
        };
        try {
          await saveAssistantMessage(
            sessionId,
            assistantId,
            reply,
            assistantMessage.createdAt,
            safetyLevel,
            suggestedAction?.type ?? null,
            resp.requestId,
            'sent',
          );
        } catch (e) {
          console.warn('[chat] save assistant message failed:', e);
        }
        dispatch({ type: 'ADD_ASSISTANT_MESSAGE', message: assistantMessage });
      } catch (err) {
        if (err instanceof ChatApiError && err.type === 'cancelled') {
          dispatch({ type: 'CLEAR_PENDING' });
          return;
        }
        const errorMeta = getErrorMeta(err);
        console.warn('[chat] request failed', {
          ...errorMeta,
          messageCount: history.length,
        });
        const errorMsgId = `err_${userId}`;
        const errorMsg: ChatMessage = {
          id: errorMsgId,
          role: 'assistant',
          content: '',
          status: 'error',
          createdAt: Date.now(),
          retryOf: userId,
          ...errorMeta,
        };
        try {
          await saveAssistantErrorPlaceholder(sessionId, errorMsgId, errorMsg.createdAt, userId);
        } catch (e) {
          console.warn('[chat] save error placeholder failed:', e);
        }
        dispatch({ type: 'ADD_ASSISTANT_MESSAGE', message: errorMsg });
      } finally {
        abortRef.current = null;
      }
    },
    [],
  );

  const sendMessage = useCallback(
    (text: string): string => {
      const trimmed = text.trim();
      if (!trimmed) {
        return '';
      }
      if (stateRef.current.pending) {
        return '';
      }
      const sessionId = stateRef.current.sessionId;
      if (!sessionId) {
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

      setTimeout(() => {
        dispatch({ type: 'MARK_USER_SENT', id: userMessage.id });
      }, 80);

      // 用户消息先写数据库，再发送请求
      void (async () => {
        try {
          await saveUserMessage(sessionId, userMessage.id, trimmed, userMessage.createdAt);
        } catch (e) {
          console.warn('[chat] save user message failed:', e);
        }
      })();

      const history = toApiHistory(stateRef.current.messages, { role: 'user', content: trimmed });

      void doRequest(userMessage.id, history, false);

      return userMessage.id;
    },
    [doRequest],
  );

  const retry = useCallback(
    (userId: string) => {
      if (stateRef.current.pending) return;
      const currentMessages = stateRef.current.messages;
      const userIdx = currentMessages.findIndex((m) => m.id === userId);
      if (userIdx < 0) return;
      const userMsg = currentMessages[userIdx];
      if (!userMsg || userMsg.role !== 'user') return;

      const history = toApiHistory(currentMessages.slice(0, userIdx + 1));

      void doRequest(userId, history, true);
    },
    [doRequest],
  );

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    dispatch({ type: 'CLEAR_PENDING' });
  }, []);

  const reload = useCallback(() => {
    void loadFromDb();
  }, [loadFromDb]);

  return (
    <ChatContext.Provider
      value={{
        loadState: state.loadState,
        messages: state.messages,
        pending: state.pending,
        sendMessage,
        retry,
        cancel,
        reload,
      }}
    >
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

export { WELCOME_SESSION_ID };
