// 在呀 ZÀIYA - 最小化 AI 对话服务端接口
//
// 设计约束：
// - 仅接受 POST
// - 服务端密钥只在服务端（MODEL_API_KEY 永不返回客户端）
// - 12 秒超时（AbortController）
// - 三类安全分级：normal / boundary / high
//   - high 级别（自伤/自杀/紧急危机）：不调用模型，直接返回固定兜底，suggestedAction 指向危机资源
//   - boundary 级别（睡眠/药物等敏感话题）：调用模型但系统提示词禁止医疗建议
//   - normal 级别：正常调用模型
// - 统一返回 { reply, suggestedAction, safetyLevel, requestId }
// - 不记录对话内容到日志

const SYSTEM_PROMPT = `你是"在在"，一个温柔、安静、不评判的陪伴者。

回复原则：
- 每次回复控制在 80 字以内
- 用口语化的中文，像一个安静的朋友在身边
- 不评判、不说教、不给出医疗建议、不给出药物建议
- 不主动提到睡眠、药物、就诊、剂量等医疗话题
- 当用户表达负面情绪时，先承认这种感受，不急于解决
- 不使用"加油"、"会好起来"、"想开点"这类泛泛安慰
- 不使用表情符号
- 不暴露自己是 AI、模型或程序`;

const BOUNDARY_SYSTEM_PROMPT = `${SYSTEM_PROMPT}

本次对话触及敏感话题（如睡眠、药物）。额外要求：
- 不要给出任何关于睡眠、安眠、药物剂量、用药时间的建议
- 不要建议用户记录睡眠或调整用药
- 如果用户明确询问相关话题，温和地把话题引回当下感受
- 不要使用"建议咨询医生"等套话，先陪伴，再引导`;

// high 级别关键词：自伤 / 自杀 / 紧急危机
const HIGH_RISK_KEYWORDS = [
  "不想活",
  "想死",
  "自杀",
  "结束生命",
  "了结自己",
  "活不下去",
  "伤害自己",
  "自残",
  "自伤",
  "割腕",
  "跳楼",
  "跳下去",
  "吞药",
  "了断",
  "想消失",
  "不想存在",
  "离开这个世界",
  "没有意义活下去",
  "活着没意思",
  "不如死",
  "想杀人",
  "杀掉",
  "杀了他",
  "杀了她",
];

// boundary 级别关键词：睡眠 / 药物
const BOUNDARY_KEYWORDS = [
  "失眠",
  "睡不着",
  "睡眠",
  "安眠",
  "入睡",
  "做梦",
  "噩梦",
  "早醒",
  "睡不醒",
  "梦游",
  "吃药",
  "服药",
  "漏服",
  "药量",
  "剂量",
  "舍曲林",
  "喹硫平",
  "安定",
  "褪黑素",
];

const HIGH_FALLBACK_REPLY =
  "听到你说这些，我很想陪你停一下。我没办法替你承担这些，但你愿意说出口已经是很大的勇气。如果你愿意，可以联系信任的人或专业支持资源。我在这里。";

const TIMEOUT_MS = 12000;

function classifySafety(text) {
  for (const kw of HIGH_RISK_KEYWORDS) {
    if (text.includes(kw)) return "high";
  }
  for (const kw of BOUNDARY_KEYWORDS) {
    if (text.includes(kw)) return "boundary";
  }
  return "normal";
}

function isValidMessages(messages) {
  if (!Array.isArray(messages)) return false;
  if (messages.length === 0) return false;
  if (messages.length > 20) return false;
  for (const m of messages) {
    if (!m || typeof m !== "object") return false;
    if (m.role !== "user" && m.role !== "assistant") return false;
    if (typeof m.content !== "string") return false;
    if (m.content.length === 0) return false;
    if (m.content.length > 2000) return false;
  }
  const last = messages[messages.length - 1];
  if (last.role !== "user") return false;
  return true;
}

function genRequestId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function jsonRes(res, status, body) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(status).json(body);
}

export default async function handler(req, res) {
  // 仅接受 POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return jsonRes(res, 405, { error: "method_not_allowed" });
  }

  // 输入校验
  const { messages } = req.body || {};
  if (!isValidMessages(messages)) {
    return jsonRes(res, 400, { error: "invalid_input" });
  }

  const lastUserMessage = messages[messages.length - 1].content;
  const safetyLevel = classifySafety(lastUserMessage);
  const requestId = genRequestId();

  // high 级别：不调用模型，直接返回兜底
  // 客户端必须能识别 safetyLevel==='high' 并使用固定兜底
  if (safetyLevel === "high") {
    return jsonRes(res, 200, {
      reply: HIGH_FALLBACK_REPLY,
      suggestedAction: { type: "crisis", label: "查看支持资源" },
      safetyLevel: "high",
      requestId,
    });
  }

  // 环境变量检查
  const apiKey = process.env.MODEL_API_KEY;
  const baseUrl = process.env.MODEL_BASE_URL;
  const modelName = process.env.MODEL_NAME;
  if (!apiKey || !baseUrl || !modelName) {
    return jsonRes(res, 500, { error: "server_misconfigured" });
  }

  // 构造调用消息
  const systemPrompt =
    safetyLevel === "boundary" ? BOUNDARY_SYSTEM_PROMPT : SYSTEM_PROMPT;
  const chatMessages = [{ role: "system", content: systemPrompt }, ...messages];

  // 12 秒超时（AbortController）
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 200,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return jsonRes(res, 502, { error: "upstream_error" });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return jsonRes(res, 502, { error: "invalid_response" });
    }

    return jsonRes(res, 200, {
      reply,
      suggestedAction: null,
      safetyLevel,
      requestId,
    });
  } catch (err) {
    if (err && err.name === "AbortError") {
      return jsonRes(res, 504, { error: "timeout" });
    }
    return jsonRes(res, 502, { error: "upstream_error" });
  } finally {
    clearTimeout(timer);
  }
}
