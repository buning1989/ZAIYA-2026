import { createContext, useContext, useReducer, ReactNode, useCallback, useRef } from 'react';
import { ChatMessage } from './types';
import { pickReply } from './replies';

interface ChatState {
  messages: ChatMessage[];
  // 当前是否有 in-flight 的 assistant 回复
  pending: boolean;
  // 已使用过的回复计数（用于轮换）
  replyIndex: number;
}

type ChatAction =
  | { type: 'ADD_USER_MESSAGE'; message: ChatMessage }
  | { type: 'MARK_USER_SENT'; id: string }
  | { type: 'SET_PENDING'; pending: boolean }
  | { type: 'ADD_ASSISTANT_MESSAGE'; message: ChatMessage; replyIndex: number };

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
  replyIndex: 0,
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
      return { ...state, pending: action.pending };
    case 'ADD_ASSISTANT_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.message],
        replyIndex: action.replyIndex,
        pending: false,
      };
    default:
      return state;
  }
}

interface ChatContextValue {
  messages: ChatMessage[];
  pending: boolean;
  // 返回用户消息 id（同步展示用户消息），异步产生 assistant 回复
  sendMessage: (text: string) => string;
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
    dispatch({ type: 'SET_PENDING', pending: true });

    // 用户消息几乎立即转为 sent
    setTimeout(() => {
      dispatch({ type: 'MARK_USER_SENT', id: userMessage.id });
    }, 80);

    // 600~900ms 后给出本地固定回复
    const delay = 600 + Math.floor(Math.random() * 300);
    const nextReplyIndex = stateRef.current.replyIndex + 1;
    setTimeout(() => {
      const replyMessage: ChatMessage = {
        id: genId(),
        role: 'assistant',
        content: pickReply(nextReplyIndex),
        status: 'sent',
        createdAt: Date.now(),
      };
      dispatch({
        type: 'ADD_ASSISTANT_MESSAGE',
        message: replyMessage,
        replyIndex: nextReplyIndex,
      });
    }, delay);

    return userMessage.id;
  }, []);

  return (
    <ChatContext.Provider value={{ messages: state.messages, pending: state.pending, sendMessage }}>
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
