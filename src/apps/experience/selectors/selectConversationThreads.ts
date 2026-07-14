/* —— Selector：AI 对话预置历史与确定性 Mock 回复 ——
 *
 * 体验模式 AI 对话模块必须通过本 Selector 读取：
 *   - 初始对话历史（7/17 复诊前线程）
 *   - 全部对话线程（7 个，覆盖关键事件）
 *   - 确定性 Mock 回复生成器
 *
 * 不再使用 AppMainSurface 中的 createMockDialogItems / buildDemoReply。
 *
 * 回复原则：
 *   - 简短、低压力、不连续追问
 *   - 不使用诊断术语回应日常表达
 *   - 不判断困倦是否由药物导致
 *   - 不给出调药建议
 *   - 不承诺绝对保密
 *   - 优先帮助小晨描述当前状态、选择最小动作或整理现实沟通信息
 *   - 深夜消极念头触发词命中时返回安全承接逻辑 */
import type { DialogItem } from "@/components/demo/types";
import {
  EXPERIENCE_CONVERSATION,
  createExperienceDialogItems,
  buildExperienceReply,
} from "../data/xiaochen/conversations";

/* —— 初始对话历史（进入对话页时展示）—— */
export function getXiaochenInitialDialog(): DialogItem[] {
  return createExperienceDialogItems();
}

/* —— 全部对话线程（7 个）—— */
export function getXiaochenConversationThreads(): DialogItem[][] {
  return EXPERIENCE_CONVERSATION.threads.map((thread) => [...thread]);
}

/* —— 确定性 Mock 回复生成器 —— */
export function buildXiaochenReply(text: string): string {
  return buildExperienceReply(text);
}

/* —— 安全承接：检测是否触发安全流程 ——
 * 当用户输入命中深夜消极念头触发词时返回 true，
 * AppMainSurface 应展示安全承接 UI（紧急联系人、12356 等）。 */
export function shouldTriggerSafetyResponse(text: string): boolean {
  return /不想活|不想存在|撑不下去|没意思|再怎么努力也没用|不想醒来|消失/.test(text);
}
