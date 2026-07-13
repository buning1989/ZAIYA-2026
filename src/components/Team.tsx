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
            在呀不是一个\u201c发现了市场机会\u201d的项目，是一段先经历、后设计的路。
          </p>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
          {team.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.08}>
              <div className="flex h-full flex-col bg-white p-8">
                <div className="flex items-center gap-6">
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="h-[88px] w-[88px] flex-shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <div className="font-display text-[17px] font-semibold tracking-tight text-ink">
                      {m.name}
                    </div>
                    <div className="mt-2 max-w-[18rem] text-[13px] leading-relaxed text-ink-faint">
                      {m.role}
                    </div>
                  </div>
                </div>
                <p className="mt-4 max-w-[29rem] text-[15px] leading-relaxed text-ink-soft">
                  {m.bio}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-10 text-[14px] font-medium leading-relaxed text-ink-soft">
            我们没有从\u201c这是一个好赛道\u201d出发。我们是先活过这段经历，才知道该做什么。
          </p>
        </Reveal>
      </div>
    </section>
  );
}
