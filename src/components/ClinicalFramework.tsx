import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const frameworks = [
  {
    code: "DBT",
    name: "辩证行为疗法",
    note: "占位：情绪调节与痛苦承受技能。",
  },
  {
    code: "CBT",
    name: "认知行为疗法",
    note: "占位：识别并调整认知偏差。",
  },
  {
    code: "MI",
    name: "动机式访谈",
    note: "占位：引导而非说服的对话方式。",
  },
];

export default function ClinicalFramework() {
  return (
    <section id="clinical" className="border-t border-line">
      <div className="container py-20 md:py-32">
        <SectionHeading
          eyebrow="技术实践"
          title="产品背后，是真实的临床框架。"
        />

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink-soft">
            占位文案：在呀的对话逻辑建立在循证心理学的框架之上，而非通用的「 empathetic
            chatbot 」模板。每一个推进节点都有对应的临床依据，并由专业顾问参与设计。
            最终文案待回填。
          </p>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
          {frameworks.map((f, i) => (
            <Reveal key={f.code} delay={i * 0.08}>
              <div className="flex h-full flex-col gap-3 bg-white p-8">
                <div className="font-display text-[40px] font-semibold tracking-tightest text-ink">
                  {f.code}
                </div>
                <div className="text-[14px] font-medium text-ink">{f.name}</div>
                <p className="text-[13px] leading-relaxed text-ink-soft">
                  {f.note}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-10 text-[13px] text-ink-faint">
            占位：由持有专业资质的临床顾问团队参与产品设计与评审。具体顾问信息待回填。
          </p>
        </Reveal>
      </div>
    </section>
  );
}
