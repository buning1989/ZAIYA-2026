import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronLeft, FolderOpen } from "lucide-react";

/* —— 第二周 15:30 节点：复诊沟通确认单 → 预览 演示流程 ——
 *
 * 状态 A（confirm）：沟通确认单
 *   - 系统整理的沟通重点（4 条）
 *   - 我最想问医生的事（用户补充，已填写完成）
 *   - 敏感记录授权（默认不加入，评委可勾选）
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
 *
 * UI 对齐：与「帮我整理」体验模块 DoneStep 沟通确认单 UI 保持一致——
 * 单一圆角卡片 + 分割线分隔区块 + 相同的信息行/编号列表样式。
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
          {/* 顶部导航：对齐体验模块 DoneStep 导航栏（返回 + 标题 + 文件夹图标） */}
          <div className="flex items-center justify-between px-5 pt-14 pb-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="返回"
                className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h1 className="text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                复诊沟通确认单
              </h1>
            </div>
            <button
              type="button"
              aria-label="返回帮我整理首页"
              className="grid h-8 w-8 place-items-center rounded-full text-ink transition-colors hover:bg-line-soft"
            >
              <FolderOpen className="h-[19px] w-[19px]" strokeWidth={1.8} />
            </button>
          </div>

          {/* 内容区：可滚动 */}
          <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
            {/* 单一圆角卡片：对齐体验模块 DoneStep 单据卡片 */}
            <div className="rounded-2xl border border-line bg-white px-5 py-5">
              {/* 单据顶部：主标题 */}
              <div>
                <h2 className="text-center text-[18px] font-semibold leading-relaxed tracking-tight text-ink">
                  沟通确认单
                </h2>
              </div>

              {/* 分割线 */}
              <div className="my-4 h-px bg-line-soft" />

              {/* 基本信息行：对齐体验模块 w-16 标签 + gap-4 */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-baseline gap-4">
                  <span className="w-16 shrink-0 text-[12px] text-ink-faint">
                    时间范围
                  </span>
                  <span className="text-[14px] leading-relaxed text-ink">
                    {TIME_RANGE}
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="w-16 shrink-0 text-[12px] text-ink-faint">
                    沟通对象
                  </span>
                  <span className="text-[14px] leading-relaxed text-ink">
                    {CONTACT_NAME}
                  </span>
                </div>
              </div>

              {/* 分割线 */}
              <div className="my-4 h-px bg-line-soft" />

              {/* 沟通重点：对齐体验模块 text-[12px] text-ink-faint 标题 + 编号列表 */}
              <div>
                <div className="text-[12px] text-ink-faint">沟通重点</div>
                <ol className="mt-2 flex flex-col gap-2.5">
                  {COMMUNICATION_POINTS.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex gap-2.5 text-[14px] leading-[1.6] text-ink"
                    >
                      <span className="shrink-0 tabular-nums text-ink-faint">
                        {idx + 1}.
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* 分割线 */}
              <div className="my-4 h-px bg-line-soft" />

              {/* 我最想问医生的事 */}
              <div>
                <div className="text-[12px] text-ink-faint">
                  我最想问医生的事
                </div>
                <div className="mt-3">
                  <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent-pressed">
                    由你补充
                  </span>
                  <p className="mt-2 text-[14px] font-medium leading-relaxed text-ink">
                    {USER_QUESTION}
                  </p>
                </div>
              </div>

              {/* 分割线 */}
              <div className="my-4 h-px bg-line-soft" />

              {/* 敏感记录授权 */}
              <div>
                <div className="text-[12px] text-ink-faint">敏感记录</div>
                <button
                  type="button"
                  onClick={() => setSensitiveIncluded((v) => !v)}
                  className="mt-3 w-full rounded-xl border border-line bg-white px-4 py-4 text-left"
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
                          ? "border-accent bg-accent"
                          : "border-line bg-white"
                      }`}
                    >
                      {sensitiveIncluded && (
                        <Check
                          className="h-3 w-3 text-white"
                          strokeWidth={2.4}
                        />
                      )}
                    </span>
                  </div>
                </button>
              </div>
            </div>
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
          {/* 顶部导航（对齐体验模块导航栏） */}
          <div className="flex items-center justify-between px-5 pt-14 pb-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setState("confirm")}
                aria-label="返回"
                className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h1 className="text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                复诊沟通单
              </h1>
            </div>
            <button
              type="button"
              aria-label="返回帮我整理首页"
              className="grid h-8 w-8 place-items-center rounded-full text-ink transition-colors hover:bg-line-soft"
            >
              <FolderOpen className="h-[19px] w-[19px]" strokeWidth={1.8} />
            </button>
          </div>

          {/* 内容区 */}
          <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
            {/* 确认状态 */}
            <div className="mt-4">
              <p className="text-center text-[13px] text-ink-faint">
                已经按你的选择整理好了
              </p>
            </div>

            {/* 单一圆角卡片：对齐体验模块 DoneStep 单据卡片 */}
            <div className="mt-5 rounded-2xl border border-line bg-white px-5 py-5">
              {/* 单据顶部：主标题 */}
              <div>
                <h2 className="text-center text-[18px] font-semibold leading-relaxed tracking-tight text-ink">
                  沟通确认单
                </h2>
              </div>

              {/* 分割线 */}
              <div className="my-4 h-px bg-line-soft" />

              {/* 基本信息行 */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-baseline gap-4">
                  <span className="w-16 shrink-0 text-[12px] text-ink-faint">
                    时间范围
                  </span>
                  <span className="text-[14px] leading-relaxed text-ink">
                    {TIME_RANGE}
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="w-16 shrink-0 text-[12px] text-ink-faint">
                    沟通对象
                  </span>
                  <span className="text-[14px] leading-relaxed text-ink">
                    {CONTACT_NAME}
                  </span>
                </div>
              </div>

              {/* 分割线 */}
              <div className="my-4 h-px bg-line-soft" />

              {/* 沟通重点 */}
              <div>
                <div className="text-[12px] text-ink-faint">沟通重点</div>
                <ol className="mt-2 flex flex-col gap-2.5">
                  {COMMUNICATION_POINTS.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex gap-2.5 text-[14px] leading-[1.6] text-ink"
                    >
                      <span className="shrink-0 tabular-nums text-ink-faint">
                        {idx + 1}.
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* 分割线 */}
              <div className="my-4 h-px bg-line-soft" />

              {/* 我最想问医生的事 */}
              <div>
                <div className="text-[12px] text-ink-faint">
                  我最想问医生的事
                </div>
                <p className="mt-2 text-[14px] font-medium leading-relaxed text-ink">
                  {USER_QUESTION}
                </p>
              </div>

              {/* 敏感记录：仅当评委勾选时显示 */}
              {sensitiveIncluded && (
                <>
                  {/* 分割线 */}
                  <div className="my-4 h-px bg-line-soft" />

                  <div>
                    <div className="text-[12px] text-ink-faint">敏感记录</div>
                    <div className="mt-3 rounded-xl border border-line bg-white px-4 py-3">
                      <div className="text-[11px] font-medium tracking-[0.14em] text-ink-faint">
                        已加入本次沟通材料
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
                        {SENSITIVE_RECORD_TEXT}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

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
