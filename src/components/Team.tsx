import Reveal from "./Reveal";
import SectionEyebrow from "./SectionEyebrow";
import { team } from "@/data/content";

type Practice = {
  no: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

const practices: Practice[] = [
  {
    no: "01",
    title: "纸质情绪日记本",
    description: "把难以表达的情绪，先留下来。",
    image: "./assets/team/practice-notebook.png",
    imageAlt: "纸质情绪日记本实物图",
  },
  {
    no: "02",
    title: "情绪记录小程序",
    description: "降低记录和回看的成本。",
    image: "./assets/team/practice-miniapp.png",
    imageAlt: "情绪记录小程序界面截图",
  },
  {
    no: "03",
    title: "在呀 ZÀIYA",
    description: "从记录情绪，走向帮人重新参与生活。",
    image: "./assets/team/practice-app.png",
    imageAlt: "在呀 ZÀIYA App 界面样机",
  },
];

function PracticeCard({ item }: { item: Practice }) {
  return (
    <article className="flex min-w-0 flex-1 flex-col rounded-lg border border-line bg-white p-3">
      <div className="overflow-hidden rounded-md bg-white">
        <img
          src={item.image}
          alt={item.imageAlt}
          loading="lazy"
          decoding="async"
          className="aspect-[3/4] h-auto w-full object-cover"
        />
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-[12px] font-medium leading-none text-ink-soft">{item.no}</span>
        <h4 className="min-w-0 text-[14px] font-semibold leading-snug tracking-tight text-ink md:text-[15px]">
          {item.title}
        </h4>
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-soft md:text-[14px]">{item.description}</p>
    </article>
  );
}

export default function Team() {
  return (
    <section id="team" className="scroll-mt-20">
      <div className="container pt-20 pb-20 md:pt-24 md:pb-24">
        <div className="h-px w-full bg-line" aria-hidden="true" />
        <Reveal className="mt-7 md:mt-8">
          <SectionEyebrow index={4} name="为什么是我们" />
          <h2 className="mt-4 max-w-3xl text-[26px] font-semibold leading-tight tracking-tight text-ink md:mt-5 md:text-[32px]">
            <span className="inline-block">二十年亲历，</span>
            <span className="inline-block">三次实践。</span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-soft md:text-[16px]">
            我们既理解精神心理困扰如何改变一个人的生活，也能把复杂的问题，做成真正好用的产品。
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-12 md:mt-14">
            <div className="max-w-[760px]">
              <p className="text-[15px] leading-relaxed text-ink-soft md:text-[16px]">
                从纸笔到一个 App，每一次都在降低门槛，也更接近真实生活。
              </p>
            </div>

            <div className="mt-7 hidden w-full items-stretch gap-4 md:flex">
              {practices.map((item) => (
                <PracticeCard key={item.no} item={item} />
              ))}
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4 md:hidden">
              {practices.map((item) => (
                <PracticeCard key={item.no} item={item} />
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:mt-14 md:grid-cols-2 md:gap-6">
          {team.map((member, index) => (
            <Reveal key={member.name} delay={0.22 + index * 0.04}>
              <article className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 md:p-7">
                <div className="flex items-center gap-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    loading="lazy"
                    decoding="async"
                    className="h-[68px] w-[68px] flex-shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <h3 className="font-display text-[20px] font-semibold leading-tight tracking-tight text-ink md:text-[22px]">
                      {member.name}
                    </h3>
                    <p className="mt-1 text-[14px] leading-snug text-accent md:text-[15px]">{member.role}</p>
                  </div>
                </div>
                <div className="mt-5 text-[14px] leading-relaxed text-ink-soft md:text-[15px]">
                  {member.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <p className="mx-auto mt-9 max-w-2xl text-center text-[16px] font-semibold leading-relaxed tracking-tight text-accent-deep md:mt-10 md:text-[18px]">
            <span className="inline-block">一个人更接近问题本身，</span>
            <span className="inline-block">一个人负责把问题做成产品。</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
