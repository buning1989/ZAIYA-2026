// 在呀 ZÀIYA - 客户端 AI 对话 API
//
// 设计约束：
// - 只使用 Preview HTTPS API
// - 不在客户端保存模型密钥
// - 12 秒超时（AbortController）
// - 错误分类：timeout / network / server / invalid_response / cancelled
// - 不在日志中输出完整对话或任何密钥

export type SafetyLevel = "normal" | "boundary" | "high";

export type SuggestedAction = {
  type: "sleep_record";
  label: string;
} | null;

export interface ChatApiMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatApiResponse {
  reply: string;
  suggestedAction: SuggestedAction;
  safetyLevel: SafetyLevel;
  requestId: string;
}

export type ChatApiErrorType =
  | "timeout"
  | "network"
  | "server"
  | "invalid_response"
  | "cancelled";

export class ChatApiError extends Error {
  readonly type: ChatApiErrorType;
  readonly status?: number;
  readonly requestId?: string;

  constructor(type: ChatApiErrorType, message: string, opts?: { status?: number; requestId?: string }) {
    super(message);
    this.name = "ChatApiError";
    this.type = type;
    this.status = opts?.status;
    this.requestId = opts?.requestId;
  }
}

const TIMEOUT_MS = 12000;

function getBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!url) {
    throw new ChatApiError("server", "EXPO_PUBLIC_API_BASE_URL not configured");
  }
  return url.replace(/\/+$/, "");
}

function parseSafetyLevel(v: unknown): SafetyLevel {
  if (v === "normal" || v === "boundary" || v === "high") return v;
  throw new ChatApiError("invalid_response", "invalid safetyLevel");
}

function parseSuggestedAction(v: unknown): SuggestedAction {
  if (v === null || v === undefined) return null;
  if (typeof v !== "object" || v === null) {
    throw new ChatApiError("invalid_response", "invalid suggestedAction");
  }
  const obj = v as Record<string, unknown>;
  if (obj.type !== "sleep_record") {
    throw new ChatApiError("invalid_response", "unsupported suggestedAction type");
  }
  if (typeof obj.label !== "string" || obj.label.length === 0) {
    throw new ChatApiError("invalid_response", "invalid suggestedAction label");
  }
  return { type: "sleep_record", label: obj.label };
}

export interface SendChatOptions {
  signal?: AbortSignal;
}

export async function sendChat(
  messages: ChatApiMessage[],
  options: SendChatOptions = {},
): Promise<ChatApiResponse> {
  const baseUrl = getBaseUrl();
  const endpoint = `${baseUrl}/api/chat`;

  // 12 秒超时（AbortController），与外部 signal 合并
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const externalSignal = options.signal;
  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timer);
      throw new ChatApiError("cancelled", "aborted before send");
    }
    externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
        signal: controller.signal,
      });
    } catch (err) {
      // 区分取消 / 超时 / 网络
      if (controller.signal.aborted) {
        if (externalSignal?.aborted) {
          throw new ChatApiError("cancelled", "aborted by caller");
        }
        throw new ChatApiError("timeout", "request timed out");
      }
      // 非 abort 的 fetch 错误一律视为 network
      throw new ChatApiError("network", "network error");
    }

    // 解析 JSON
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new ChatApiError("invalid_response", "invalid JSON", { status: response.status });
    }

    // HTTP 非 2xx
    if (!response.ok) {
      const requestId =
        typeof data === "object" && data !== null && "requestId" in data
          ? String((data as Record<string, unknown>).requestId)
          : undefined;
      throw new ChatApiError("server", `HTTP ${response.status}`, {
        status: response.status,
        requestId,
      });
    }

    // 校验响应结构
    if (typeof data !== "object" || data === null) {
      throw new ChatApiError("invalid_response", "response is not object");
    }
    const obj = data as Record<string, unknown>;
    if (typeof obj.reply !== "string" || obj.reply.length === 0) {
      throw new ChatApiError("invalid_response", "empty reply");
    }
    const safetyLevel = parseSafetyLevel(obj.safetyLevel);
    const suggestedAction = parseSuggestedAction(obj.suggestedAction);
    if (typeof obj.requestId !== "string" || obj.requestId.length === 0) {
      throw new ChatApiError("invalid_response", "missing requestId");
    }

    return {
      reply: obj.reply,
      suggestedAction,
      safetyLevel,
      requestId: obj.requestId,
    };
  } finally {
    clearTimeout(timer);
  }
}
