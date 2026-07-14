import Reveal from "./Reveal";
import SectionEyebrow from "./SectionEyebrow";

type Support = {
  title: string;
  description: string;
};

const supports: Support[] = [
  {
    title: "医疗｜让专业判断看见连续的生活",
    description:
      "为复诊和沟通，提供睡眠、饮食、用药、情绪与社会功能变化的事实依据。",
  },
  {
    title: "学校｜让学习和社交的变化被看见",
    description:
      "理解出勤、学习、人际和返校适应中的真实困难，给出更合适的支持。",
  },
  {
    title: "家庭｜让关心转化为更有效的支持",
    description:
      "减少猜测、催促和对抗，让家人更清楚孩子正在经历什么、此刻能做什么。",
  },
];

type CoreNodeProps = {
  title: string;
  summary: string;
  description: string;
  emphasized?: boolean;
};

function CoreNode({
  title,
  summary,
  description,
  emphasized = false,
}: CoreNodeProps) {
  return (
    <article
      className={[
        "flex h-full min-h-[180px] flex-col rounded-2xl border px-6 py-6 lg:px-7 lg:py-7",
        emphasized
          ? "border-accent/45 bg-accent-soft"
          : "border-line bg-white",
      ].join(" ")}
    >
      <h3 className="text-[20px] font-semibold leading-tight tracking-tight text-ink md:text-[22px]">
        核心节点 · {title}
      </h3>
      <p className="mt-3 text-[14px] font-medium leading-relaxed text-ink md:text-[15px]">
        {summary}
      </p>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-soft md:text-[15px]">
        {description}
      </p>
    </article>
  );
}

function SupportNode({ title, description }: Support) {
  return (
    <article className="h-full rounded-2xl border border-line bg-white px-5 py-5 lg:px-6 lg:py-6">
      <h3 className="text-[16px] font-semibold leading-snug tracking-tight text-ink">
        {title}
      </h3>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
        {description}
      </p>
    </article>
  );
}

function HorizontalConnection() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2.5 text-center">
      <svg
        className="h-6 w-full text-ink-faint"
        viewBox="0 0 96 48"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7 17C32 17 59 16.5 89 17"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M76 5C80.5 11 84.5 14.5 89 17"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M89 31C62 31 35 31.5 7 31"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M20 43C15.5 37.5 11 34 7 31"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function ConnectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-line" />
      <span className="max-w-[220px] shrink-0 text-center text-[12px] leading-relaxed text-ink-soft md:max-w-none">
        {label}
      </span>
      <div className="h-px flex-1 bg-line" />
    </div>
  );
}

function ThreePartyConnector() {
  return (
    <div className="absolute inset-x-0 top-0 h-[118px]" aria-hidden="true">
      <div className="absolute left-[calc((100%_-_2.5rem)/6)] right-[calc((100%_-_2.5rem)/6)] top-0 grid grid-cols-[1fr_auto_1fr] items-center gap-7">
        <div className="h-px bg-ink-soft/55" />
        <div className="text-center text-[15px] font-semibold leading-none tracking-tight text-ink md:text-[16px]">
          在呀 ZÀIYA 帮用户连接三方
        </div>
        <div className="h-px bg-ink-soft/55" />
      </div>
      <div className="absolute inset-x-0 bottom-0 grid h-full grid-cols-3 gap-5">
        {supports.map((support, index) => (
          <div key={support.title} className="relative flex justify-center">
            <div
              className={[
                "absolute bottom-0 w-px bg-ink-soft/55",
                index === 1 ? "top-[36px]" : "top-3",
              ].join(" ")}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileConnection({ bidirectional = false }: { bidirectional?: boolean }) {
  return (
    <svg
      className="h-10 w-5 text-accent"
      viewBox="0 0 20 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={bidirectional ? "M10 5v30M5 10l5-5 5 5M5 30l5 5 5-5" : "M10 4v31M5 30l5 5 5-5"}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Vision() {
  return (
    <section id="vision" className="scroll-mt-20">
      <div className="container pt-20 pb-14 md:pt-24 md:pb-20">
        <div className="h-px w-full bg-line" aria-hidden="true" />
        <div className="mx-auto mt-7 max-w-[940px] md:mt-8">
          <Reveal>
            <SectionEyebrow index={5} name="愿景" />
            <h2 className="mt-4 max-w-[900px] text-[26px] font-semibold leading-tight tracking-tight text-ink md:mt-5 md:text-[32px]">
              让每一个因精神心理困扰而生活失序的人，都能连接起持续、完整的支持。
            </h2>
            <p className="mt-6 max-w-[860px] text-[15px] leading-relaxed text-ink-soft md:text-[16px]">
              在呀 ZÀIYA 先和用户建立持续连接，再帮他们把医疗、学校与家庭连起来，让分散的支持不再彼此断裂。
            </p>
          </Reveal>

          <Reveal delay={0.12} y={8}>
            <figure
              className="mt-11 md:mt-14"
              aria-label="用户与在呀持续双向连接，在用户知情、确认与授权下，在呀帮助用户连接医疗、学校与家庭"
            >
              <div className="hidden md:block">
                <div className="grid grid-cols-[1fr_96px_1fr] items-stretch">
                  <CoreNode
                    title="用户"
                    summary="真实生活与所有支持的中心"
                    description="用户拥有自己的生活信息，也决定哪些可以被整理、确认和分享。"
                  />
                  <HorizontalConnection />
                  <CoreNode
                    title="在呀 ZÀIYA"
                    summary="持续陪伴 · 记录日常 · 整理变化 · 授权连接"
                    description="不替用户判断，而是把零散的生活状态，整理成自己和支持者都能看懂的信息。"
                  />
                </div>

                <div className="relative mt-10 pt-[118px]">
                  <ThreePartyConnector />

                  <div className="grid grid-cols-3 gap-5">
                    {supports.map((support) => (
                      <SupportNode key={support.title} {...support} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:hidden">
                <CoreNode
                  title="用户"
                  summary="真实生活与所有支持的中心"
                  description="用户拥有自己的生活信息，也决定哪些可以被整理、确认和分享。"
                />

                <div className="flex flex-col items-center py-2">
                  <span className="mb-1 text-[12px] text-ink-faint">
                    持续双向连接
                  </span>
                  <MobileConnection bidirectional />
                </div>

                <CoreNode
                  title="在呀 ZÀIYA"
                  summary="持续陪伴 · 记录日常 · 整理变化 · 授权连接"
                  description="不替用户判断，而是把零散的生活状态，整理成自己和支持者都能看懂的信息。"
                />

                <div className="flex flex-col items-center gap-3 py-6">
                  <MobileConnection />
                  <div className="w-full">
                    <ConnectionDivider label="在呀 ZÀIYA 帮用户连接三方" />
                  </div>
                </div>

                <div className="space-y-3">
                  {supports.map((support) => (
                    <SupportNode key={support.title} {...support} />
                  ))}
                </div>
              </div>

              <figcaption className="sr-only">
                用户是真实生活与所有支持的中心。在呀首先与用户持续双向连接，并在用户知情、确认与授权下，帮助用户连接医疗、学校与家庭。
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.28} y={8}>
            <p className="mt-4 max-w-[860px] text-[12px] leading-relaxed text-ink-faint md:mt-5 md:text-[13px]">
              在呀 ZÀIYA 不替代医疗、学校或家庭中的任何角色，也不绕过用户直接共享信息。所有连接都以用户知情、确认与授权为前提。
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
