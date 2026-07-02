import Reveal from "./Reveal";
import { stats } from "@/data/content";

export default function Stats() {
  return (
    <section className="border-t border-line">
      <div className="container grid grid-cols-2 gap-y-10 py-16 md:grid-cols-4 md:py-20">
        {stats.map((s, i) => (
          <Reveal
            key={s.label}
            delay={i * 0.06}
            className="px-1 md:px-6 md:border-l md:border-line md:first:border-l-0"
          >
            <div className="font-display text-[34px] font-semibold tracking-tightest text-ink md:text-[40px]">
              {s.value}
            </div>
            <div className="mt-2 max-w-[12rem] text-[13px] leading-snug text-ink-soft">
              {s.label}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
