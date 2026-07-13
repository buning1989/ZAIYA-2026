import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import RecordSummaryCard, {
  type SummaryRow,
} from "@/components/RecordSummaryCard";
import RecordNoteSection from "@/components/RecordNoteSection";
import { PhoneStatusBar } from "@/components/AppMainSurface";
import EnergyBadge from "@/components/EnergyBadge";

/* —— 第二周 10:00 节点：睡眠记录确认 → 结果态演示流程 ——
 *
 * 未保存态：直接展示已填写到最终确认步骤的睡眠记录单。
 *   - 复用 RecordSummaryCard 展示字段（与真实「记一下」确认页一致）
 *   - 复用 RecordNoteSection 展示补充说明区域（视觉与真实产品一致）
 *   - 复用 PhoneStatusBar + 导航栏（与真实产品一致）
 *   - 评委点击「保存记录」→ 切换为真实完成态样式
 *
 * 已保存态：与体验模式记录完成态一致。
 *   - 复用 RecordSummaryCard 的 saved 盖章
 *   - 底部按钮文案切为「回到记一下」
 *   - 补充说明进入已保存样式
 *
 * 数据隔离：所有数据均为组件内部固定 Demo 数据，不写入 localStorage、
 * 不触发能量奖励、不影响自由体验模式。
 *
 * 状态重置：组件卸载（离开节点）后重新挂载时，自动恢复到未保存态。
 */

const ease = [0.22, 1, 0.36, 1] as const;

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

export default function DemoSleepRecordFlow() {
  const [saved, setSaved] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      key="demo-sleep-record"
      className="absolute inset-0 z-30 flex flex-col bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease }}
    >
      {/* iOS 风格状态栏 */}
      <PhoneStatusBar />

      {/* 页面导航栏：返回箭头 + 标题 + 我的光入口 */}
      <div className="relative flex items-center gap-3 bg-white px-5 pt-14 pb-2">
        <button
          aria-label="返回"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-line-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="flex-1 text-[17px] font-semibold tracking-tight text-ink">
          睡眠
        </h2>
        <EnergyBadge position="inline" />
      </div>

      {/* 记录确认 / 已保存主体：与体验模式 SleepRecordWizard 完成态同构 */}
      <div className="min-h-0 flex-1">
        <RecordSummaryCard
          rows={SLEEP_ROWS}
          saved={saved}
          primaryButtonText={saved ? "回到记一下" : "保存记录"}
          onPrimaryClick={() => setSaved(true)}
        >
          <RecordNoteSection
            value=""
            onChange={() => {}}
            saved={saved}
            placeholder="比如做了梦、半夜醒了几次、醒来后的感觉"
            hint="比如做了梦、半夜醒了几次、醒来后的感觉"
          />
        </RecordSummaryCard>
      </div>
    </motion.div>
  );
}
