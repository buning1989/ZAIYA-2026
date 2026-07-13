import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const frameworks = [
  {
    code: "IPSRT",
    name: "人际与社会节奏疗法",
    note: "陪伴的出现节奏，帮助紊乱的生活节律重新找回规律",
  },
  {
    code: "团体治疗因子",
    name: "希望灌注 · 普遍性 · 行为示范",
    note: "在相似处境的人身上，看到\u201c这件事其实可以做到\u201d",
  },
  {
    code: "CBT · DBT · MI",
    name: "循证对话技术",
    note: "不评判、不说教，轻轻松动卡住的念头",
  },
  {
    code: "GPM · BPS",
    name: "生物心理社会模式",
    note: "把生活事实按医生熟悉的临床结构组织，零诊断、零推断",
  },
];

export default function ClinicalFramework() {
  return (
    <section id="clinical" className="border-t border-line">
      <div className="container py-20 md:py-32">
        <SectionHeading
          eyebrow="技术实践"
          title="你在上一屏看到的每一个设计，都不是随手做的。"
        />

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink-soft">
            陪伴的分寸、对话的方式、报告的结构——背后都是循证心理学框架，由专业顾问团参与设计。
          </p>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2">
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
            我们不做诊断，也不做治疗。我们只是把专业的方法，做成了不像\u201c被治疗\u201d的样子。
          </p>
        </Reveal>

        <Reveal delay={0.24}>
          <p className="mt-3 text-[12px] leading-relaxed text-ink-faint">
            在呀不提供医疗诊断、治疗或用药建议，不替代精神科医生、心理咨询师的专业判断。产品注册类目为工具-健康管理。
          </p>
        </Reveal>
      </div>
    </section>
  );
}
