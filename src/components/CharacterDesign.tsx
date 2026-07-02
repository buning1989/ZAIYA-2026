import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import ZaizaiRive from "./ZaizaiRive";

const principles = [
  { label: "非人非动物", text: "不指向现实物种，避免用户把它理解成宠物、医生或权威角色。" },
  { label: "无嘴无鼻", text: "弱化表达和评判感，让它更像一个安静在场的生活节点提醒。" },
  { label: "低刺激", text: "减少强情绪反馈，不催促、不逼问，适合主动触发困难的人群。" },
];

export default function CharacterDesign() {
  return (
    <section id="character" className="border-t border-line">
      <div className="container py-20 md:py-32">
        <div className="grid gap-14 md:grid-cols-[1fr_1fr] md:gap-20 md:items-start">
          {/* 在在动画 */}
          <Reveal>
            <div className="aspect-square rounded-2xl border border-line bg-line-soft">
              <div className="grid h-full place-items-center">
                <ZaizaiRive className="h-44 w-44" />
              </div>
            </div>
          </Reveal>

          {/* 文案 */}
          <div>
            <SectionHeading
              eyebrow="角色设计"
              title="在在，被设计成一个低刺激的在场者。"
            />
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink-soft">
                在在不是医生、咨询师，也不是替用户做决定的助手。它更像一个安静的生活节点：在起床、吃饭、睡前和复诊前出现，帮助用户把状态留下来，把下一步降到足够小。
              </p>
            </Reveal>

            <div className="mt-12 flex flex-col">
              {principles.map((p, i) => (
                <Reveal key={p.label} delay={0.12 + i * 0.08}>
                  <div className="border-t border-line py-7">
                    <div className="text-[13px] font-medium uppercase tracking-[0.16em] text-ink-faint">
                      {p.label}
                    </div>
                    <p className="mt-3 text-[18px] leading-snug tracking-tight text-ink md:text-[20px]">
                      {p.text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
