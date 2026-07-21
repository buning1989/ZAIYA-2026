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
  clientRequestId?: string;
  durationMs?: number;
  attempts?: number;
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
  readonly clientRequestId?: string;
  readonly durationMs?: number;
  readonly attempts?: number;
  readonly retryable: boolean;

  constructor(
    type: ChatApiErrorType,
    message: string,
    opts?: {
      status?: number;
      requestId?: string;
      clientRequestId?: string;
      durationMs?: number;
      attempts?: number;
      retryable?: boolean;
    },
  ) {
    super(message);
    this.name = "ChatApiError";
    this.type = type;
    this.status = opts?.status;
    this.requestId = opts?.requestId;
    this.clientRequestId = opts?.clientRequestId;
    this.durationMs = opts?.durationMs;
    this.attempts = opts?.attempts;
    this.retryable = opts?.retryable ?? false;
  }
}

const TIMEOUT_MS = 12000;
const RETRY_DELAY_MS = 500;
const MAX_ATTEMPTS = 2;

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

function genClientRequestId(): string {
  return `ios_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function parseRequestId(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null || !("requestId" in data)) {
    return undefined;
  }
  const requestId = (data as Record<string, unknown>).requestId;
  return typeof requestId === "string" && requestId.length > 0 ? requestId : undefined;
}

function isRetryableStatus(status?: number): boolean {
  return status === 408 || status === 429 || (typeof status === "number" && status >= 500);
}

// 单次请求（不含重试）。失败时抛出 ChatApiError。
async function doFetch(
  endpoint: string,
  messages: ChatApiMessage[],
  externalSignal?: AbortSignal,
  clientRequestId?: string,
  attempt = 1,
): Promise<ChatApiResponse> {
  const startedAt = Date.now();
  // 12 秒超时（AbortController），与外部 signal 合并
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timer);
      throw new ChatApiError("cancelled", "aborted before send", {
        clientRequestId,
        attempts: attempt,
        durationMs: Date.now() - startedAt,
      });
    }
    externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(clientRequestId ? { "X-Zaiya-Client-Request-Id": clientRequestId } : {}),
        },
        body: JSON.stringify({ messages, clientRequestId }),
        signal: controller.signal,
      });
    } catch (err) {
      // 区分取消 / 超时 / 网络
      if (controller.signal.aborted) {
        if (externalSignal?.aborted) {
          throw new ChatApiError("cancelled", "aborted by caller", {
            clientRequestId,
            attempts: attempt,
            durationMs: Date.now() - startedAt,
          });
        }
        throw new ChatApiError("timeout", "request timed out", {
          clientRequestId,
          attempts: attempt,
          durationMs: Date.now() - startedAt,
          retryable: true,
        });
      }
      // 非 abort 的 fetch 错误一律视为 network
      throw new ChatApiError("network", "network error", {
        clientRequestId,
        attempts: attempt,
        durationMs: Date.now() - startedAt,
        retryable: true,
      });
    }

    // 先读取原始响应，再按 HTTP 状态分类。Vercel/网关的 5xx 可能是 HTML。
    const status = response.status;
    let raw = "";
    try {
      raw = await response.text();
    } catch {
      raw = "";
    }

    let data: unknown;
    if (raw.length > 0) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = undefined;
      }
    }

    // HTTP 非 2xx
    if (!response.ok) {
      const requestId = parseRequestId(data);
      throw new ChatApiError("server", `HTTP ${response.status}`, {
        status,
        requestId,
        clientRequestId,
        attempts: attempt,
        durationMs: Date.now() - startedAt,
        retryable: isRetryableStatus(status),
      });
    }

    // 校验响应结构
    if (typeof data !== "object" || data === null) {
      throw new ChatApiError("invalid_response", "response is not object", {
        status,
        clientRequestId,
        attempts: attempt,
        durationMs: Date.now() - startedAt,
      });
    }
    const obj = data as Record<string, unknown>;
    if (typeof obj.reply !== "string" || obj.reply.length === 0) {
      throw new ChatApiError("invalid_response", "empty reply", {
        status,
        requestId: parseRequestId(data),
        clientRequestId,
        attempts: attempt,
        durationMs: Date.now() - startedAt,
      });
    }
    const safetyLevel = parseSafetyLevel(obj.safetyLevel);
    const suggestedAction = parseSuggestedAction(obj.suggestedAction);
    if (typeof obj.requestId !== "string" || obj.requestId.length === 0) {
      throw new ChatApiError("invalid_response", "missing requestId", {
        status,
        clientRequestId,
        attempts: attempt,
        durationMs: Date.now() - startedAt,
      });
    }

    return {
      reply: obj.reply,
      suggestedAction,
      safetyLevel,
      requestId: obj.requestId,
      clientRequestId,
      attempts: attempt,
      durationMs: Date.now() - startedAt,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function sendChat(
  messages: ChatApiMessage[],
  options: SendChatOptions = {},
): Promise<ChatApiResponse> {
  const baseUrl = getBaseUrl();
  const endpoint = `${baseUrl}/api/chat`;
  const externalSignal = options.signal;
  const clientRequestId = genClientRequestId();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      return await doFetch(endpoint, messages, externalSignal, clientRequestId, attempt);
    } catch (err) {
      if (!(err instanceof ChatApiError)) {
        throw err;
      }
      if (err.type === "cancelled" || !err.retryable || attempt >= MAX_ATTEMPTS) {
        throw err;
      }
      console.warn("[chatApi] attempt failed, retrying", {
        type: err.type,
        status: err.status,
        requestId: err.requestId,
        clientRequestId: err.clientRequestId,
        attempt,
        durationMs: err.durationMs,
        messageCount: messages.length,
      });
      await new Promise<void>((resolve) => {
        const t = setTimeout(resolve, RETRY_DELAY_MS);
        if (externalSignal) {
          if (externalSignal.aborted) {
            clearTimeout(t);
            resolve();
          } else {
            externalSignal.addEventListener("abort", () => {
              clearTimeout(t);
              resolve();
            }, { once: true });
          }
        }
      });
    }
  }

  throw new ChatApiError("network", "request failed", {
    clientRequestId,
    attempts: MAX_ATTEMPTS,
  });
}
