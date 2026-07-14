import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const frameworks = [
  {
    code: "IPSRT",
    name: "人际与社会节律疗法",
    value: "让生活重新有节奏",
    note: "稳定出现的时间与生活节点，帮助睡眠、饮食和活动慢慢找回规律。",
  },
  {
    code: "GTF",
    name: "团体治疗因子",
    value: "让人看见“我也可以”",
    note: "通过希望灌注、普遍性和行为示范，让用户从相似处境中看见可抵达的改变。",
  },
  {
    code: "CBT · DBT · MI",
    name: "认知行为疗法 · 辩证行为疗法 · 动机性访谈",
    value: "让开始变得更容易",
    note: "不评判、不说教，把混乱的念头和难启动的行动拆成眼前的一小步。",
  },
  {
    code: "GPM · BPS",
    name: "良好的精神健康管理 · 生物心理社会模型",
    value: "不只看情绪，看见完整生活",
    note: "把睡眠、饮食、用药、学习或工作、关系与情绪，放回同一张生活图里。",
  },
];

export default function ClinicalFramework() {
  return (
    <section id="clinical" className="border-t border-line">
      <div className="container pt-10 pb-12 md:pt-11">
        <SectionHeading
          eyebrow="技术与临床框架"
          title={
            <>
              润物细无声的帮助背后，
              <br />
              是一套循证的心理学技术。
            </>
          }
        />

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink-soft">
            陪伴的分寸、对话的方式、记录的节奏、报告的结构——每一处，都在悄悄降低行动门槛、找回生活规律，让真实变化被看见。
          </p>
        </Reveal>

        <div className="mt-10 grid grid-flow-col auto-cols-[78vw] gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar md:mt-11 md:grid-flow-row md:grid-cols-2 md:auto-cols-auto md:overflow-visible md:snap-none min-[1200px]:grid-cols-4">
          {frameworks.map((f, i) => (
            <Reveal key={f.code} delay={i * 0.08}>
              <article className="flex h-full snap-start flex-col rounded-xl border border-line bg-white px-6 py-6 min-h-[218px] md:snap-none">
                <h3 className="font-display text-[18px] font-semibold tracking-tight text-ink">
                  {f.code}
                </h3>
                <p className="mt-1.5 text-[13px] leading-snug text-ink-soft">
                  {f.name}
                </p>
                <div className="mt-5 text-[22px] font-semibold leading-snug text-ink">
                  {f.value}
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                  {f.note}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-8 text-[13px] text-ink-faint">
            这些框架用于产品设计与健康生活管理，不代表在呀提供心理治疗、临床诊断或用药建议。
          </p>
        </Reveal>
      </div>
    </section>
  );
}
