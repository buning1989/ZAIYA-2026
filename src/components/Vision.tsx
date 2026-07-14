import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const recoverySupports = [
  {
    no: "01",
    title: "药物治疗",
    description: "帮助控制症状，稳定身心状态。",
  },
  {
    no: "02",
    title: "心理治疗",
    description: "帮助理解问题，建立新的应对方式。",
  },
  {
    no: "03",
    title: "生活调整",
    description: "让改变真正进入每天的生活。",
  },
];

export default function Vision() {
  return (
    <section id="vision" className="border-t border-line">
      <div className="container py-14 md:py-16">
        <div className="mx-auto max-w-[940px]">
          <SectionHeading
            eyebrow="愿景"
            title={
              <>
                真正的康复，
                <br />
                是重新拥有自己的生活。
              </>
            }
          />

          <Reveal delay={0.1} y={8}>
            <p className="mt-6 max-w-3xl text-[16px] leading-relaxed text-ink-soft md:text-[18px]">
              康复不只发生在诊室和咨询室，也发生在每天的睡眠、饮食、学习、工作、关系与自我管理中。
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-5">
            {recoverySupports.map((support, index) => (
              <Reveal key={support.no} delay={0.16 + index * 0.04} y={8}>
                <article className="h-full rounded-2xl border border-line bg-white px-5 py-5 md:px-6 md:py-6">
                  <div className="text-[12px] font-medium tracking-[0.14em] text-ink-faint">
                    {support.no}
                  </div>
                  <h3 className="mt-4 text-[20px] font-semibold leading-snug tracking-tight text-ink md:text-[22px]">
                    {support.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-ink-soft md:text-[15px]">
                    {support.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3} y={8}>
            <p className="mt-9 max-w-3xl border-t border-line pt-7 text-[23px] font-semibold leading-snug tracking-tight text-accent-deep md:mt-10 md:pt-8 md:text-[30px]">
              连接成一套持续、完整的精神健康管理模式。
            </p>
          </Reveal>

          <Reveal delay={0.38} y={8}>
            <p className="mt-6 max-w-3xl text-[17px] leading-relaxed text-ink md:mt-7 md:text-[20px]">
              让因精神心理困扰而导致社会功能受损的人，重新参与生活，走向健康、有序、可持续的人生。
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
