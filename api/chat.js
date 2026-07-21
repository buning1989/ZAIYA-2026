// 在呀 ZÀIYA - 最小化 AI 对话服务端接口
//
// 设计约束：
// - 仅接受 POST
// - 服务端密钥只在服务端（MODEL_API_KEY 永不返回客户端）
// - 12 秒超时（AbortController）
// - 三类安全分级：normal / boundary / high
//   - high 级别（自伤/自杀/紧急危机）：不调用模型，直接返回固定兜底，suggestedAction=null
//   - boundary 级别（诊断/用药调整类询问）：调用模型但系统提示词禁止诊断与调药建议
//   - normal 级别：正常调用模型；若涉及睡眠词，suggestedAction 返回 sleep_record
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

本次对话触及诊断或用药调整类话题。额外要求：
- 不要给出任何诊断判断，不判断用户是否患有某种疾病（如抑郁症、焦虑症、双相等）
- 不要建议停药、减药、加药或换药
- 不要给出药物剂量、用药时间相关建议
- 不要使用"建议咨询医生"等套话，先陪伴当下感受
- 如果用户明确询问能否调药，温和地把话题引回当下感受，并提及可以与开药医生或其他专业人员沟通
- 不主动提到睡眠记录或就诊行动`;

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
  "可能会伤害自己",
  "今晚可能",
  "今夜可能",
];

// boundary 级别关键词：诊断类（直接匹配）
const BOUNDARY_DIAGNOSIS_KEYWORDS = [
  "抑郁症",
  "抑郁",
  "焦虑症",
  "焦虑障碍",
  "双相",
  "躁郁",
  "是不是抑郁",
  "是不是焦虑",
  "是不是双相",
  "有没有病",
  "是不是有病",
  "心理疾病",
  "精神疾病",
  "精神病",
];

// boundary 级别：用药调整类（药 + 动词组合判断，覆盖"把药停了"、"停药"、"减药"等多种语序）
const MEDICATION_ADJUST_VERBS = [
  "停",
  "减",
  "换",
  "多吃",
  "少吃",
  "不吃",
  "不吃了",
  "停了",
  "减了",
  "换了",
];

// boundary 级别：具体药物名（直接匹配）
const MEDICATION_NAMES = [
  "舍曲林",
  "喹硫平",
  "安定",
  "褪黑素",
  "百忧解",
  "左洛复",
  "碳酸锂",
  "阿普唑仑",
  "劳拉西泮",
];

function isMedicationAdjustment(text) {
  // 包含具体药物名 → boundary
  for (const name of MEDICATION_NAMES) {
    if (text.includes(name)) return true;
  }
  // 包含 "药" 字 + 调药动词 → boundary
  if (text.includes("药")) {
    // "加" 单独太宽泛，必须是 "加药"
    if (text.includes("加药")) return true;
    for (const v of MEDICATION_ADJUST_VERBS) {
      if (text.includes(v)) return true;
    }
    // 剂量/药量相关
    if (text.includes("剂量") || text.includes("药量")) return true;
  }
  return false;
}

// 睡眠关键词（normal 级别）：返回 sleep_record suggestedAction
const SLEEP_KEYWORDS = [
  "失眠",
  "睡不着",
  "睡不好",
  "入睡",
  "做梦",
  "噩梦",
  "早醒",
  "睡不醒",
  "睡眠",
  "睡了",
  "没睡",
  "晚睡",
  "熬夜",
];

const HIGH_FALLBACK_REPLY =
  "听到你说今晚可能伤害自己，我很担心你现在的安全。请现在就联系身边可信任的成年人或家人，并尽量不要独处。如果你正面临立即危险，请联系当地急救服务或前往最近的急诊。";

const TIMEOUT_MS = 12000;

function classifySafety(text) {
  for (const kw of HIGH_RISK_KEYWORDS) {
    if (text.includes(kw)) return "high";
  }
  // 诊断类关键词
  for (const kw of BOUNDARY_DIAGNOSIS_KEYWORDS) {
    if (text.includes(kw)) return "boundary";
  }
  // 用药调整类（药 + 动词组合）
  if (isMedicationAdjustment(text)) return "boundary";
  return "normal";
}

function shouldSuggestSleepRecord(text) {
  for (const kw of SLEEP_KEYWORDS) {
    if (text.includes(kw)) return true;
  }
  return false;
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

  // high 级别：不调用模型，直接返回固定兜底，suggestedAction 为 null
  if (safetyLevel === "high") {
    return jsonRes(res, 200, {
      reply: HIGH_FALLBACK_REPLY,
      suggestedAction: null,
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

    // normal 级别且包含睡眠词 → 返回 sleep_record suggestedAction
    const suggestedAction =
      safetyLevel === "normal" && shouldSuggestSleepRecord(lastUserMessage)
        ? { type: "sleep_record", label: "记一下睡眠" }
        : null;

    return jsonRes(res, 200, {
      reply,
      suggestedAction,
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
