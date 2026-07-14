import { motion } from "framer-motion";
import { ChevronLeft, Edit3 } from "lucide-react";
import EnergyBadge from "@/components/EnergyBadge";
import { formatRecordLabel } from "@/components/RecordSummaryCard";
import type { RecordDemoPreset } from "./types";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  preset: RecordDemoPreset;
};

/* —— 演示用「记一下」完成页 ——
 * 对齐真实记录完成页的信息架构：模块标题 / 能量 / 完整记录卡 / 补充说明 / 保存按钮。
 * 仅展示只读完成态，不写入记录历史、不触发能量奖励。
 */
export default function DemoRecordPreview({ preset }: Props) {
  return (
    <motion.div
      key="demo-record"
      className="absolute inset-0 z-30 flex flex-col bg-white px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease }}
    >
      <header className="flex items-center gap-3 pt-14 pb-2">
        <button
          type="button"
          aria-label="返回记一下"
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="flex-1 text-[17px] font-semibold tracking-tight text-ink">
          {preset.title}
        </h2>
        <EnergyBadge />
      </header>

      <div className="pt-7">
        <h3 className="text-center text-[18px] font-medium leading-relaxed tracking-tight text-ink">
          这条记录已经完整了
        </h3>
      </div>

      <section className="relative mt-4 rounded-2xl border border-line bg-white px-5 py-4">
        <div className="text-[11px] tracking-[0.16em] text-ink-faint">
          已记录
        </div>
        <div className="mt-3 flex flex-col">
          {preset.rows.map((row, index) => (
            <div
              key={`${row.label}-${index}`}
              className="grid grid-cols-[4em_minmax(0,1fr)] items-baseline gap-3 border-b border-line-soft py-3 last:border-b-0"
            >
              <span className="text-[14px] leading-relaxed text-ink-faint">
                {formatRecordLabel(row.label)}
              </span>
              <span className="min-w-0 break-words text-[14px] font-semibold leading-relaxed text-ink">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {preset.note && (
        <section className="mt-5">
          <div className="text-[14px] leading-relaxed text-ink-faint">
            补充说明（可选）
          </div>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5">
            <p className="min-w-0 flex-1 text-[14px] leading-relaxed text-ink">
              {preset.note}
            </p>
            <span className="inline-flex shrink-0 items-center gap-1 text-[12px] text-ink-faint">
              <Edit3 className="h-3.5 w-3.5" strokeWidth={1.8} />
              编辑
            </span>
          </div>
        </section>
      )}

      <div className="mt-auto pb-6 pt-4">
        <button
          type="button"
          className="w-full rounded-xl bg-action-primary px-4 py-3.5 text-[14px] font-medium text-action-primary-text"
        >
          {preset.primaryButtonText ?? "保存记录"}
        </button>
      </div>
    </motion.div>
  );
}
