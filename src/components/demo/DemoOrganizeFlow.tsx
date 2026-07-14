import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, FolderOpen } from "lucide-react";

/* —— 第二周 15:30 节点：复诊沟通确认单 → 预览 演示流程 ——
 *
 * 状态 A（confirm）：沟通确认单
 *   - 沟通对象、记录日期、记录天数、创建日期
 *   - 沟通重点（4 条）
 *   - 「确认这份沟通单」按钮
 *
 * 状态 B（preview）：已确认的沟通单预览
 *   - 确认状态提示
 *   - 沟通确认单卡片（同 confirm 内容）
 *   - 免责声明
 *
 * 数据隔离：所有数据为组件内固定 Demo 数据，不写入 localStorage、
 * 不触发能量奖励、不调用真实业务接口、不影响自由体验模式。
 *
 * 状态重置：组件卸载（离开节点）后重新挂载时，自动恢复到状态 A。
 *
 * UI 对齐：与「帮我整理」体验模块 DoneStep 沟通确认单 UI 保持一致——
 * 单一圆角卡片 + 分割线分隔区块 + 相同的信息行/编号列表样式。
 */

const ease = [0.22, 1, 0.36, 1] as const;

type FlowState = "confirm" | "preview";

/* 固定 Demo 数据 —— 对齐剧情文件 */
const CONTACT_NAME = "王医生";
const CONTACT_ROLE = "精神科医生";
const RECORD_DATE = "7 月 3 日—7 月 17 日";
const RECORD_DAYS = "10/14 天";
const CREATED_DATE = "2026 年 7 月 18 日";

const COMMUNICATION_POINTS: string[] = [
  "入睡时间近 7 天平均 00:20（前 7 天 01:40）",
  "记录到正餐 21 次，跳过 9 次（10 天）",
  "哭泣 4 次、喘不上气 2 次；均记录于早间时段",
  "希望讨论下一步返校安排",
];

const DISCLAIMER =
  "这仅供沟通参考，不构成任何专业性的诊断说明。";

export default function DemoOrganizeFlow() {
  const [state, setState] = useState<FlowState>("confirm");
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
                className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-soft"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h1 className="text-[18px] font-medium leading-relaxed tracking-tight text-ink">
                和王医生的沟通
              </h1>
            </div>
            <button
              type="button"
              aria-label="返回帮我整理首页"
              className="grid h-8 w-8 place-items-center rounded-full text-ink transition-colors hover:bg-surface-soft"
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
                    沟通对象
                  </span>
                  <span className="text-[14px] leading-relaxed text-ink">
                    {CONTACT_NAME}（{CONTACT_ROLE}）
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="w-16 shrink-0 text-[12px] text-ink-faint">
                    记录日期
                  </span>
                  <span className="text-[14px] leading-relaxed text-ink">
                    {RECORD_DATE}
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="w-16 shrink-0 text-[12px] text-ink-faint">
                    创建日期
                  </span>
                  <span className="text-[14px] leading-relaxed text-ink">
                    {CREATED_DATE}
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
            </div>
          </div>

          {/* 底部确认按钮 */}
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
                className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-soft"
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
              className="grid h-8 w-8 place-items-center rounded-full text-ink transition-colors hover:bg-surface-soft"
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
                    沟通对象
                  </span>
                  <span className="text-[14px] leading-relaxed text-ink">
                    {CONTACT_NAME}（{CONTACT_ROLE}）
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="w-16 shrink-0 text-[12px] text-ink-faint">
                    记录日期
                  </span>
                  <span className="text-[14px] leading-relaxed text-ink">
                    {RECORD_DATE}
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="w-16 shrink-0 text-[12px] text-ink-faint">
                    创建日期
                  </span>
                  <span className="text-[14px] leading-relaxed text-ink">
                    {CREATED_DATE}
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
