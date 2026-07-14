import { Fragment } from "react";
import Reveal from "./Reveal";
import { team } from "@/data/content";

type Capability = {
  no: string;
  title: string;
  description: string;
};

type Practice = {
  no: string;
  title: string;
  description: string;
};

const capabilities: Capability[] = [
  {
    no: "01",
    title: "理解问题，不只来自调研。",
    description:
      "长期精神心理困扰与康复经历，让团队能够从个体、家庭和社会功能的整体视角理解真实处境。",
  },
  {
    no: "02",
    title: "把经历转化为可验证的判断。",
    description:
      "围绕 DSM-5-TR、GPM、BPS、DBT、CBT、MI 等框架持续学习，并获得中美专业机构专家顾问支持。",
  },
  {
    no: "03",
    title: "把复杂问题做成能用的产品。",
    description:
      "具备用户研究、产品设计、商业策略与 AI 开发能力，能够将专业原则转化为具体交互和完整体验。",
  },
];

const practices: Practice[] = [
  {
    no: "01",
    title: "纸质情绪日记本",
    description: "第一次尝试，把难以表达的情绪留下来。",
  },
  {
    no: "02",
    title: "情绪记录小程序",
    description: "第二次尝试，降低记录和回看的使用成本。",
  },
  {
    no: "03",
    title: "在呀 ZÀIYA",
    description: "第三次实践，从情绪记录走向完整的生活恢复支持。",
  },
];

function DesktopArrow() {
  return (
    <svg className="h-6 w-10 flex-shrink-0 text-ink-faint" viewBox="0 0 40 24" fill="none" aria-hidden>
      <path
        d="M4 12h29M27.5 6.5 33 12l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MobileArrow() {
  return (
    <svg className="h-8 w-4 text-ink-faint" viewBox="0 0 16 32" fill="none" aria-hidden>
      <path
        d="M8 3v24M3.5 22.5 8 27l4.5-4.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Team() {
  return (
    <section id="team" className="border-t border-line">
      <div className="container py-12 md:py-16">
        <Reveal>
          <div className="text-[12px] font-medium tracking-[0.16em] text-ink-faint">
            为什么是我们
          </div>
          <h2 className="mt-4 max-w-3xl text-[34px] font-semibold leading-tight tracking-tight text-ink md:text-[44px]">
            二十年亲历，三次实践。
          </h2>
          <p className="mt-5 max-w-[760px] text-[16px] leading-relaxed text-ink-soft md:text-[17px]">
            我们既理解精神心理困扰如何改变一个人的生活，也具备把复杂问题转化为低门槛、可使用产品的能力。
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-5">
          {capabilities.map((item, index) => (
            <Reveal key={item.no} delay={0.08 + index * 0.04}>
              <article className="h-full rounded-2xl border border-line bg-white px-5 py-5 md:px-6 md:py-6">
                <div className="text-[12px] font-medium tracking-[0.14em] text-ink-faint">{item.no}</div>
                <h3 className="mt-4 text-[20px] font-semibold leading-snug tracking-tight text-ink md:text-[22px]">
                  {item.title}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-soft md:text-[15px]">
                  {item.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.18}>
          <div className="mt-12 md:mt-14">
            <div className="max-w-[760px]">
              <h3 className="text-[24px] font-semibold leading-tight tracking-tight text-ink md:text-[28px]">
                三次实践
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft md:text-[16px]">
                从记录情绪，到降低记录门槛，再到帮助用户重新参与生活，我们围绕同一个问题进行了三次持续迭代。
              </p>
            </div>

            <div className="mt-7 hidden items-stretch md:flex">
              {practices.map((item, index) => {
                const isLast = index === practices.length - 1;
                return (
                  <Fragment key={item.no}>
                    <article
                      className={[
                        "flex min-h-[156px] flex-1 flex-col rounded-2xl border bg-white px-6 py-5",
                        isLast ? "border-accent/45" : "border-line",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-[13px] font-medium text-ink">
                          {item.no}
                        </span>
                        <h4 className="text-[18px] font-semibold leading-snug tracking-tight text-ink">
                          {item.title}
                        </h4>
                      </div>
                      <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">{item.description}</p>
                    </article>
                    {!isLast && (
                      <div className="flex w-12 items-center justify-center">
                        <DesktopArrow />
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>

            <div className="mt-7 md:hidden">
              {practices.map((item, index) => {
                const isLast = index === practices.length - 1;
                return (
                  <Fragment key={item.no}>
                    <article
                      className={[
                        "rounded-2xl border bg-white px-5 py-5",
                        isLast ? "border-accent/45" : "border-line",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-line bg-white text-[12px] font-medium text-ink">
                          {item.no}
                        </span>
                        <div>
                          <h4 className="text-[18px] font-semibold leading-snug tracking-tight text-ink">
                            {item.title}
                          </h4>
                          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{item.description}</p>
                        </div>
                      </div>
                    </article>
                    {!isLast && (
                      <div className="flex h-9 items-center justify-center">
                        <MobileArrow />
                      </div>
                    )}
                  </Fragment>
                );
              })}
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
                    className="h-[68px] w-[68px] flex-shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <h3 className="font-display text-[22px] font-semibold leading-tight tracking-tight text-ink md:text-[24px]">
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
          <p className="mx-auto mt-7 max-w-2xl text-center text-[18px] font-semibold leading-relaxed tracking-tight text-ink md:text-[22px]">
            一个人更接近问题本身，一个人负责把问题做成产品。
          </p>
        </Reveal>

        <Reveal delay={0.34}>
          <div className="mt-9 rounded-2xl bg-accent-soft px-7 py-7 text-center md:px-10 md:py-9">
            <p className="text-[22px] font-semibold leading-snug tracking-tight text-ink md:text-[28px]">
              这不是一场临时参赛，
              <br />
              而是我们会持续做下去的长期方向。
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
