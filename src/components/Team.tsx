import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import { team } from "@/data/content";

export default function Team() {
  return (
    <section id="team" className="border-t border-line">
      <div className="container py-20 md:py-28">
        <SectionHeading
          eyebrow="The Team"
          title="An experienced team, backed by $30M+ in capital."
        />
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink-soft">
            Investors include Khosla Ventures, Lachy Groom, Nat Friedman,
            Daniel Gross, and the founders of Instagram, Notion, Replit, and
            more.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m, i) => (
            <Reveal key={m.name} delay={(i % 3) * 0.06}>
              <div className="flex h-full flex-col gap-4 bg-canvas p-7">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-ink font-display text-[13px] font-medium text-canvas">
                  {m.initials}
                </div>
                <div>
                  <div className="font-display text-[16px] font-semibold tracking-tight text-ink">
                    {m.name}
                  </div>
                  <div className="mt-0.5 text-[13px] text-ink-faint">
                    {m.role}
                  </div>
                </div>
                <p className="text-[13.5px] leading-relaxed text-ink-soft">
                  {m.bio}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
