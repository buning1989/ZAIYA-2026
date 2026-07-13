import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

/* —— 第二周 15:30 节点：复诊沟通确认单 → 预览 演示流程 ——
 *
 * 状态 A（confirm）：沟通确认单
 *   - 系统整理的沟通重点（4 条）
 *   - 我最想问医生的事（用户补充，已填写完成）
 *   - 敏感记录授权（默认不加入，评委可勾选）
 *   - 陪伴文案
 *   - 「确认这份沟通单」按钮
 *
 * 状态 B（preview）：已确认的沟通单预览
 *   - 复诊沟通单标题（近两周 / 王医生）
 *   - 沟通重点
 *   - 用户最想问医生的问题
 *   - 敏感记录（仅当评委勾选时显示）
 *   - 确认状态 + 免责声明
 *
 * 数据隔离：所有数据为组件内固定 Demo 数据，不写入 localStorage、
 * 不触发能量奖励、不调用真实业务接口、不影响自由体验模式。
 *
 * 状态重置：组件卸载（离开节点）后重新挂载时，自动恢复到状态 A，
 * 敏感记录默认不加入，沟通单未确认。
 */

const ease = [0.22, 1, 0.36, 1] as const;

type FlowState = "confirm" | "preview";

/* 固定 Demo 数据 —— 对齐剧情文件 */
const CONTACT_NAME = "王医生";
const TIME_RANGE = "近两周";

const COMMUNICATION_POINTS: string[] = [
  "入睡时间比两周前有所提前，但仍有波动",
  "饮食状态不稳定，有时会错过正餐",
  "情绪压力较大时，曾出现哭泣和喘不上气",
  "希望讨论下一步返校安排",
];

const USER_QUESTION = "我什么时候能回学校上课？";

const SENSITIVE_RECORD_TEXT =
  "和家里争吵后，我会觉得自己是所有人的负担。";

const COMPANION_TEXT = "把心里的事一件件摆出来，\n它们就没那么挤了。";

const DISCLAIMER =
  "这仅供沟通参考，不构成任何专业性的诊断说明。";

export default function DemoOrganizeFlow() {
  const [state, setState] = useState<FlowState>("confirm");
  const [sensitiveIncluded, setSensitiveIncluded] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      {state === "confirm" ? (
        <motion.div
          key="confirm"
          className="absolute inset-0 z-30 flex flex-col bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease }}
        >
          {/* 状态栏占位 */}
          <div className="h-11 shrink-0" />

          {/* 顶部导航：复诊沟通确认单 */}
          <div className="flex items-center gap-3 px-5 pt-3 pb-2">
            <h1 className="text-[17px] font-semibold tracking-tight text-ink">
              复诊沟通确认单
            </h1>
          </div>

          {/* 内容区：可滚动 */}
          <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
            {/* 元信息 */}
            <div className="mt-3 flex flex-col gap-1.5 text-[12.5px] text-ink-soft">
              <div className="flex">
                <span className="w-20 shrink-0 text-ink-faint">时间范围</span>
                <span>{TIME_RANGE}</span>
              </div>
              <div className="flex">
                <span className="w-20 shrink-0 text-ink-faint">沟通对象</span>
                <span>{CONTACT_NAME}</span>
              </div>
            </div>

            {/* 沟通重点 */}
            <section className="mt-6">
              <h2 className="text-[14px] font-medium text-ink">
                沟通重点
              </h2>
              <div className="mt-3 rounded-2xl border border-line bg-white px-4 py-3">
                <div className="text-[11px] tracking-[0.16em] text-ink-faint">
                  系统整理
                </div>
                <ul className="mt-2 flex flex-col gap-2">
                  {COMMUNICATION_POINTS.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex gap-2 text-[14px] leading-relaxed text-ink"
                    >
                      <span className="text-ink-faint">{idx + 1}.</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 我最想问医生的事 */}
            <section className="mt-5">
              <h2 className="text-[14px] font-medium text-ink">
                我最想问医生的事
              </h2>
              <div className="mt-3 rounded-2xl border border-line bg-white px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] tracking-[0.16em] text-ink-faint">
                    由你补充
                  </div>
                </div>
                <p className="mt-2 text-[14px] font-medium leading-relaxed text-ink">
                  {USER_QUESTION}
                </p>
              </div>
            </section>

            {/* 敏感记录授权 */}
            <section className="mt-5">
              <h2 className="text-[14px] font-medium text-ink">
                敏感记录
              </h2>
              <button
                type="button"
                onClick={() => setSensitiveIncluded((v) => !v)}
                className={`mt-3 w-full rounded-2xl border px-4 py-4 text-left transition-colors ${
                  sensitiveIncluded
                    ? "border-action-primary bg-action-primary/[0.06]"
                    : "border-line bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
                      {SENSITIVE_RECORD_TEXT}
                    </p>
                    <p className="mt-2 text-[12px] leading-relaxed text-ink-faint">
                      {sensitiveIncluded
                        ? "已加入本次沟通材料 · 让医生知道吧。"
                        : "默认不加入本次沟通材料 · 仅在你确认后加入"}
                    </p>
                  </div>
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-[5px] border transition-colors ${
                      sensitiveIncluded
                        ? "border-action-primary bg-action-primary"
                        : "border-line bg-white"
                    }`}
                  >
                    {sensitiveIncluded && (
                      <Check className="h-3 w-3 text-white" strokeWidth={2.4} />
                    )}
                  </span>
                </div>
              </button>
            </section>

            {/* 陪伴文案 */}
            <p className="mt-6 whitespace-pre-line text-center text-[13px] leading-relaxed text-ink-faint">
              {COMPANION_TEXT}
            </p>
          </div>

          {/* 底部确认按钮：敏感记录是否加入都不影响可用性 */}
          <div className="shrink-0 px-5 pb-8 pt-3">
            <button
              type="button"
              onClick={() => setState("preview")}
              className="w-full rounded-xl bg-action-primary px-4 py-3.5 text-[14px] font-medium text-action-primary-text transition-opacity active:opacity-80"
            >
              确认这份沟通单
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="preview"
          className="absolute inset-0 z-30 flex flex-col bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease }}
        >
          {/* 状态栏占位 */}
          <div className="h-11 shrink-0" />

          {/* 顶部导航 */}
          <div className="flex items-center gap-3 px-5 pt-3 pb-2">
            <h1 className="text-[17px] font-semibold tracking-tight text-ink">
              复诊沟通单
            </h1>
          </div>

          {/* 内容区 */}
          <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
            {/* 确认状态 */}
            <div className="mt-4">
              <p className="text-center text-[13px] text-ink-faint">
                已经按你的选择整理好了
              </p>
            </div>

            {/* 元信息卡 */}
            <div className="mt-5 rounded-2xl border border-line bg-card-soft/20 px-5 py-4">
              <div className="text-[14px] font-semibold text-ink">
                {CONTACT_NAME} · 医生
              </div>
              <div className="mt-3 flex flex-col gap-1.5 text-[12.5px] text-ink-soft">
                <div className="flex">
                  <span className="w-20 shrink-0 text-ink-faint">时间范围</span>
                  <span>{TIME_RANGE}</span>
                </div>
                <div className="flex">
                  <span className="w-20 shrink-0 text-ink-faint">沟通对象</span>
                  <span>{CONTACT_NAME}</span>
                </div>
              </div>
            </div>

            {/* 沟通重点 */}
            <section className="mt-5">
              <h2 className="text-[14px] font-medium text-ink">
                沟通重点
              </h2>
              <div className="mt-3 rounded-2xl border border-line bg-white px-4 py-3">
                <ul className="flex flex-col gap-2">
                  {COMMUNICATION_POINTS.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex gap-2 text-[14px] leading-relaxed text-ink"
                    >
                      <span className="text-ink-faint">{idx + 1}.</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 我最想问医生的事 */}
            <section className="mt-5">
              <h2 className="text-[14px] font-medium text-ink">
                我最想问医生的事
              </h2>
              <div className="mt-3 rounded-2xl border border-line bg-white px-4 py-3">
                <p className="text-[14px] font-medium leading-relaxed text-ink">
                  {USER_QUESTION}
                </p>
              </div>
            </section>

            {/* 敏感记录：仅当评委勾选时显示 */}
            {sensitiveIncluded && (
              <section className="mt-5">
                <h2 className="text-[14px] font-medium text-ink">
                  敏感记录
                </h2>
                <div className="mt-3 rounded-2xl border border-line bg-white px-4 py-3">
                  <div className="text-[11px] tracking-[0.16em] text-ink-faint">
                    已加入本次沟通材料
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
                    {SENSITIVE_RECORD_TEXT}
                  </p>
                </div>
              </section>
            )}

            {/* 免责声明 */}
            <p className="mt-6 text-center text-[12px] leading-relaxed text-ink-faint">
              {DISCLAIMER}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
