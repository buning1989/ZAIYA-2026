import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Plus } from "lucide-react";
import { getGradient } from "@/data/praise";
import EnergyBadge from "@/components/EnergyBadge";
import ZaizaiVideo from "@/components/ZaizaiVideo";
import type { PraiseDemoConfig, PraiseDemoCard } from "./types";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  preset: PraiseDemoConfig;
};

/* —— 演示用「夸夸自己」首页 feed ——
 * 对齐真实 PraisePage 的 home 结构：标题栏 / 能量 / 在在引导 / 双列卡片 / 悬浮加号。
 * 只读展示，不写 localStorage，不触发能量奖励。
 */
export default function DemoPraisePreview({ preset }: Props) {
  return (
    <motion.div
      key="demo-praise"
      className="absolute inset-0 z-30 overflow-hidden bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease }}
    >
      <div className="relative flex h-full flex-col bg-white">
        <header className="flex items-center gap-3 px-5 pt-14 pb-1">
          <button
            type="button"
            aria-label="返回更多"
            className="grid h-8 w-8 place-items-center rounded-full text-ink-soft"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="flex-1 text-[17px] font-semibold tracking-tight text-ink">
            夸夸自己
          </h2>
          <EnergyBadge />
        </header>

        <section className="relative z-20 h-[96px] shrink-0 overflow-visible px-5">
          <div className="absolute left-1/2 top-4 flex h-[88px] w-[188px] -translate-x-1/2 items-start justify-between overflow-visible">
            <div className="relative h-[88px] w-[72px] shrink-0 overflow-visible">
              <div className="absolute left-[46%] top-1 h-[88px] w-[88px] -translate-x-1/2 scale-[1.08] overflow-visible">
                <ZaizaiVideo className="h-full w-full" />
              </div>
            </div>
            <GuideBubble text={preset.guideText} />
          </div>
        </section>

        <div className="pointer-events-none absolute inset-x-0 top-[170px] z-[15] h-24 bg-gradient-to-b from-white via-white/95 to-white/0" />

        <section className="no-scrollbar flex-1 overflow-y-auto px-5 pb-24 pt-6">
          <div className="columns-2 gap-3">
            {preset.cards.map((card, index) => (
              <DemoPraiseCardItem key={card.id} card={card} index={index} />
            ))}
          </div>
        </section>

        <button
          type="button"
          aria-label="新建夸夸"
          className="absolute bottom-7 right-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-action-primary bg-action-primary text-action-primary-text shadow-[0_4px_18px_-6px_rgba(0,0,0,0.14)]"
        >
          <Plus className="h-5 w-5" strokeWidth={2.4} />
        </button>
      </div>
    </motion.div>
  );
}

function GuideBubble({ text }: { text: string }) {
  return (
    <div className="relative h-[52px] w-[120px] shrink-0 pt-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={text}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease }}
          className="absolute inset-x-0 top-2"
        >
          <div className="relative min-h-[42px] rounded-lg bg-line-soft px-3 py-2">
            <p className="line-clamp-2 text-[12px] leading-relaxed text-ink-soft">
              {text}
            </p>
            <div className="absolute -left-1.5 top-3">
              <svg
                width="8"
                height="12"
                viewBox="0 0 8 12"
                fill="none"
                className="text-line-soft"
                aria-hidden="true"
              >
                <path d="M0 6L8 0v12L0 6z" fill="currentColor" />
              </svg>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function DemoPraiseCardItem({
  card,
  index,
}: {
  card: PraiseDemoCard;
  index: number;
}) {
  const gradient = getGradient(card.gradientId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease, delay: Math.min(index * 0.04, 0.3) }}
      className="mb-3 flex min-h-[150px] w-full break-inside-avoid flex-col justify-between rounded-3xl p-5 text-left"
      style={{
        background: `linear-gradient(140deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
      }}
    >
      <div className="flex flex-1 items-center justify-center py-3">
        <p className="text-center text-[14.5px] leading-relaxed text-ink">
          {card.text}
        </p>
      </div>
      <p className="text-center text-[11px] text-ink/40">{card.dateLabel}</p>
    </motion.div>
  );
}
