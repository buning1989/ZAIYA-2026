import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import { team } from "@/data/content";

export default function Team() {
  return (
    <section id="team" className="border-t border-line">
      <div className="container py-20 md:py-32">
        <SectionHeading
          eyebrow="团队"
          title="两个人，一段亲历经验。"
        />
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink-soft">
            占位文案：在呀由饼饼和步宁共同创立。饼饼的临床背景与亲历经验是产品方向
            的起点，不是附加的「专家背书」。最终文案待回填。
          </p>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
          {team.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.08}>
              <div className="flex h-full flex-col gap-4 bg-canvas p-8">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-ink font-display text-[14px] font-medium text-canvas">
                  {m.initials}
                </div>
                <div>
                  <div className="font-display text-[17px] font-semibold tracking-tight text-ink">
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
