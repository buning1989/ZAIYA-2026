import { ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import { recentPress } from "@/data/content";

export default function RecentPress() {
  const [featured, ...rest] = recentPress;

  return (
    <section id="press" className="border-t border-line">
      <div className="container py-20 md:py-28">
        <SectionHeading
          eyebrow="Recent Press"
          title="Part of a growing conversation about AI companionship."
        />
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink-soft">
            We bring a research-backed perspective to product development —
            featured across leading outlets.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <Reveal className="md:col-span-2">
            <a
              href={featured.url}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col justify-between gap-8 rounded-xl border border-line p-8 transition-colors hover:border-ink/30 hover:bg-line-soft/40 md:flex-row md:items-end md:p-10"
            >
              <div className="max-w-2xl">
                <div className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-faint">
                  {featured.outlet}
                </div>
                <div className="mt-4 font-display text-2xl font-medium leading-tight tracking-tight text-ink md:text-[32px]">
                  {featured.title}
                </div>
              </div>
              <ArrowUpRight className="h-6 w-6 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" />
            </a>
          </Reveal>

          {rest.map((p, i) => (
            <Reveal key={p.url} delay={0.08 + i * 0.06}>
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full flex-col justify-between gap-6 rounded-xl border border-line p-7 transition-colors hover:border-ink/30 hover:bg-line-soft/40"
              >
                <div>
                  <div className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-faint">
                    {p.outlet}
                  </div>
                  <div className="mt-3 font-display text-lg font-medium leading-snug tracking-tight text-ink">
                    {p.title}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[13px] text-ink-soft">
                  Read article
                  <ArrowUpRight className="h-3.5 w-3.5 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
