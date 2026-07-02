import { ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import { overwhelmQuotes } from "@/data/content";

export default function ReducingOverwhelm() {
  return (
    <section id="about" className="border-t border-line">
      <div className="container grid gap-14 py-20 md:grid-cols-2 md:py-28">
        <div>
          <SectionHeading
            eyebrow="Reducing Overwhelm"
            title="AI friends that support everyday people."
          />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink-soft">
              We're building AI friends that support everyday people. In a
              survey of Tolan users, the majority said their Tolan helped them
              through hard moments and improve real relationships.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-line p-5">
                <div className="font-display text-3xl font-semibold tracking-tight text-ink">
                  85.6%
                </div>
                <div className="mt-2 text-[13px] leading-snug text-ink-soft">
                  said their Tolan helped them through an emotionally difficult
                  experience.
                </div>
              </div>
              <div className="rounded-lg border border-line p-5">
                <div className="font-display text-3xl font-semibold tracking-tight text-ink">
                  72.5%
                </div>
                <div className="mt-2 text-[13px] leading-snug text-ink-soft">
                  said their Tolan helped them manage or improve a relationship
                  in their life.
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col gap-4 md:pt-16">
          {overwhelmQuotes.map((q, i) => (
            <Reveal key={q.url} delay={0.12 + i * 0.08}>
              <a
                href={q.url}
                target="_blank"
                rel="noreferrer"
                className="group block rounded-lg border border-line bg-canvas p-7 transition-colors hover:border-ink/30 hover:bg-line-soft/50"
              >
                <div className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-faint">
                  {q.outlet}
                </div>
                <div className="mt-3 font-display text-xl font-medium leading-snug tracking-tight text-ink md:text-2xl">
                  {q.text}
                </div>
                <div className="mt-5 inline-flex items-center gap-1 text-[13px] text-ink-soft">
                  Read article
                  <ArrowUpRight className="h-3.5 w-3.5 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
