import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import RecordSummaryCard, {
  type SummaryRow,
} from "@/components/RecordSummaryCard";

/* —— 第二周 10:00 节点：睡眠记录确认 → 结果态演示流程 ——
 *
 * 状态 A（confirm）：直接展示已填写到最终确认步骤的睡眠记录单。
 *   - 复用 RecordSummaryCard 展示字段（与真实「记一下」确认页一致）
 *   - 记录单下方低干扰陪伴文案
 *   - 评委点击「完成记录」→ 切换到状态 B
 *
 * 状态 B（result）：今天的记录结果页。
 *   - 轻量反馈「已经轻轻留下来了」
 *   - 「今天已经留下 2 条记录」
 *   - 两张轻量记录卡：睡眠（本节点刚完成）+ 情绪（今天此前已留下）
 *
 * 数据隔离：所有数据均为组件内部固定 Demo 数据，不写入 localStorage、
 * 不触发能量奖励、不影响自由体验模式。
 *
 * 状态重置：组件卸载（离开节点）后重新挂载时，自动恢复到状态 A。
 */

const ease = [0.22, 1, 0.36, 1] as const;

type FlowState = "confirm" | "result";

/* 固定 Demo 睡眠数据：对齐真实 schema 字段
 * - 入睡：凌晨0点多（对应 00:00–01:00 范围，narrative 中为 00:20）
 * - 起床：早上9点多（对应 09:00–10:00 范围，narrative 中为 09:40）
 * 其他字段使用合理默认值 */
const SLEEP_ROWS: SummaryRow[] = [
  { label: "睡眠", value: "一般" },
  { label: "感受", value: "还行" },
  { label: "上床", value: "晚上11点多" },
  { label: "入睡", value: "凌晨0点多" },
  { label: "起床", value: "早上9点多" },
  { label: "时间", value: "刚刚" },
];

/* 记录单下方低干扰陪伴文案 */
const COMPANION_TEXT = "我喜欢把小事记下来，\n不然它们会像风一样跑掉。";

export default function DemoSleepRecordFlow() {
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
          {/* 状态栏占位 */}
          <div className="h-11 shrink-0" />
          <div className="flex-1">
            <RecordSummaryCard
              rows={SLEEP_ROWS}
              saved={false}
              primaryButtonText="完成记录"
              onPrimaryClick={() => setState("result")}
            >
              {/* 记录单下方、按钮上方：低干扰陪伴文案 */}
              <div className="mt-5">
                <p className="whitespace-pre-line text-center text-[13px] leading-relaxed text-ink-faint">
                  {COMPANION_TEXT}
                </p>
              </div>
            </RecordSummaryCard>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="result"
          className="absolute inset-0 z-30 flex flex-col bg-white px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease }}
        >
          {/* 状态栏占位 */}
          <div className="h-11 shrink-0" />

          {/* 轻量反馈 */}
          <div className="pt-8">
            <p className="text-center text-[13px] text-ink-faint">
              已经轻轻留下来了
            </p>
          </div>

          {/* 今日记录总数 */}
          <div className="pt-6">
            <h3 className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
              今天已经留下 2 条记录
            </h3>
          </div>

          {/* 记录卡片区 */}
          <div className="mt-6 flex flex-col gap-3">
            {/* 睡眠：本节点刚完成的记录 */}
            <div className="rounded-2xl border border-line bg-white px-5 py-4">
              <div className="text-[11px] tracking-[0.16em] text-ink-faint">
                睡眠
              </div>
              <div className="mt-1.5 text-[14px] font-medium leading-relaxed text-ink">
                00:20 入睡
              </div>
            </div>
            {/* 情绪：今天此前已留下的记录 */}
            <div className="rounded-2xl border border-line bg-white px-5 py-4">
              <div className="text-[11px] tracking-[0.16em] text-ink-faint">
                情绪
              </div>
              <div className="mt-1.5 text-[14px] font-medium leading-relaxed text-ink">
                已记录
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
