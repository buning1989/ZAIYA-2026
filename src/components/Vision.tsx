import Reveal from "./Reveal";

type Support = {
  title: string;
  summary: string;
  description: string;
};

const supports: Support[] = [
  {
    title: "医疗",
    summary: "让专业判断看见更连续的生活信息",
    description:
      "为复诊和专业沟通提供睡眠、饮食、用药、情绪与社会功能变化等事实依据。",
  },
  {
    title: "学校",
    summary: "让学习与社交变化更早被理解",
    description:
      "帮助学校理解出勤、学习、人际和返校适应中的真实困难，提供更合适的支持。",
  },
  {
    title: "家庭",
    summary: "让关心转化为更有效的支持",
    description:
      "减少依靠猜测、催促和对抗，让家人更清楚用户正在经历什么、此刻可以做什么。",
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
        "flex h-full min-h-[230px] flex-col rounded-2xl border px-6 py-6 lg:px-7 lg:py-7",
        emphasized
          ? "border-accent/45 bg-accent-soft"
          : "border-line bg-white",
      ].join(" ")}
    >
      <div className="text-[12px] font-medium tracking-[0.14em] text-ink-faint">
        核心节点
      </div>
      <h3 className="mt-5 text-[28px] font-semibold leading-none tracking-tight text-ink md:text-[32px]">
        {title}
      </h3>
      <p className="mt-4 text-[16px] font-medium leading-relaxed text-ink md:text-[17px]">
        {summary}
      </p>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-soft md:text-[15px]">
        {description}
      </p>
    </article>
  );
}

function SupportNode({ title, summary, description }: Support) {
  return (
    <article className="h-full rounded-2xl border border-line bg-white px-5 py-5 lg:px-6 lg:py-6">
      <h3 className="text-[21px] font-semibold leading-tight tracking-tight text-ink md:text-[23px]">
        {title}
      </h3>
      <p className="mt-3 text-[15px] font-medium leading-relaxed text-ink">
        {summary}
      </p>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
        {description}
      </p>
    </article>
  );
}

function HorizontalConnection() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <span className="text-[12px] leading-snug text-ink-faint">
        持续双向连接
      </span>
      <svg
        className="h-5 w-full text-accent"
        viewBox="0 0 112 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 10h96M14 4 8 10l6 6M98 4l6 6-6 6"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
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
        <div className="mx-auto max-w-[940px]">
          <Reveal>
            <div className="text-[12px] font-medium tracking-[0.16em] text-ink-faint">
              愿景
            </div>
            <h2 className="mt-4 max-w-[900px] text-[30px] font-semibold leading-tight tracking-tight text-ink md:text-[40px]">
              让每一个因精神心理困扰而生活失序的用户，
              <br className="hidden md:block" />
              都能连接起持续、完整的支持。
            </h2>
            <p className="mt-6 max-w-[860px] text-[16px] leading-relaxed text-ink-soft md:text-[18px]">
              在呀首先与用户建立持续连接，在用户知情、确认与授权下，帮助他们连接医疗、学校与家庭，让生物、心理与社会三个维度的支持不再彼此断裂。
            </p>
          </Reveal>

          <Reveal delay={0.12} y={8}>
            <figure
              className="mt-11 md:mt-14"
              aria-label="用户与在呀持续双向连接，在用户知情、确认与授权下，在呀帮助用户连接医疗、学校与家庭"
            >
              <div className="hidden md:block">
                <div className="mx-auto grid max-w-[860px] grid-cols-[minmax(0,1.08fr)_112px_minmax(0,1fr)] items-stretch">
                  <CoreNode
                    title="用户"
                    summary="真实生活与所有支持的中心"
                    description="用户拥有自己的生活信息，也决定哪些内容可以被整理、确认和分享。"
                    emphasized
                  />
                  <HorizontalConnection />
                  <CoreNode
                    title="在呀"
                    summary="持续陪伴 · 记录日常 · 整理变化 · 授权连接"
                    description="在呀不替用户作出判断，而是帮助用户把零散的生活状态，转化为自己和支持者都能理解的信息。"
                  />
                </div>

                <div className="flex flex-col items-center">
                  <div className="h-6 w-px bg-line" />
                  <div className="rounded-full border border-line bg-white px-4 py-2 text-center text-[12px] leading-relaxed text-ink-soft">
                    在用户知情、确认与授权下，在呀帮助用户连接
                  </div>
                </div>

                <svg
                  className="h-[72px] w-full text-line"
                  viewBox="0 0 940 72"
                  preserveAspectRatio="none"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M470 0v24M157 24h626M157 24v48M470 24v48M783 24v48"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </svg>

                <div className="grid grid-cols-3 gap-5">
                  {supports.map((support) => (
                    <SupportNode key={support.title} {...support} />
                  ))}
                </div>
              </div>

              <div className="md:hidden">
                <CoreNode
                  title="用户"
                  summary="真实生活与所有支持的中心"
                  description="用户拥有自己的生活信息，也决定哪些内容可以被整理、确认和分享。"
                  emphasized
                />

                <div className="flex flex-col items-center py-2">
                  <span className="mb-1 text-[12px] text-ink-faint">
                    持续双向连接
                  </span>
                  <MobileConnection bidirectional />
                </div>

                <CoreNode
                  title="在呀"
                  summary="持续陪伴 · 记录日常 · 整理变化 · 授权连接"
                  description="在呀不替用户作出判断，而是帮助用户把零散的生活状态，转化为自己和支持者都能理解的信息。"
                />

                <div className="flex flex-col items-center py-3 text-center">
                  <MobileConnection />
                  <p className="mt-1 max-w-[280px] text-[12px] leading-relaxed text-ink-soft">
                    在用户知情、确认与授权下，
                    <br />
                    在呀帮助用户连接这些支持角色
                  </p>
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

          <Reveal delay={0.2} y={8}>
            <p className="mt-12 max-w-[840px] border-t border-line pt-8 text-[24px] font-semibold leading-snug tracking-tight text-accent-deep md:mt-14 md:pt-9 md:text-[30px]">
              以用户为中心，帮助他们连接医疗、学校与家庭，形成一套持续、完整的精神健康管理模式。
            </p>
          </Reveal>

          <Reveal delay={0.28} y={8}>
            <p className="mt-7 max-w-[860px] text-[12px] leading-relaxed text-ink-faint md:mt-8 md:text-[13px]">
              在呀不替代医疗、学校或家庭中的任何角色，也不绕过用户直接共享信息。所有连接均以用户知情、确认与授权为前提。
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
