import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const principles = [
  { label: "非人非动物", text: "占位：不指向任何现实物种，避免投射与角色混淆。" },
  { label: "无嘴无鼻", text: "占位：不说话、不评判，降低「被评价」的紧张感。" },
  { label: "顿感", text: "占位：反应慢半拍，留出空间让你先表达。" },
];

export default function CharacterDesign() {
  return (
    <section id="character" className="border-t border-line">
      <div className="container py-20 md:py-32">
        <div className="grid gap-14 md:grid-cols-[1fr_1fr] md:gap-20 md:items-start">
          {/* 图片占位 */}
          <Reveal>
            <div className="aspect-square rounded-2xl border border-line bg-line-soft">
              <div className="grid h-full place-items-center">
                <div className="h-40 w-40 rounded-full bg-ink/10" />
              </div>
            </div>
          </Reveal>

          {/* 文案 */}
          <div>
            <SectionHeading
              eyebrow="角色设计"
              title="在在，被刻意设计成「不那么像」。"
            />
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink-soft">
                占位文案：在在不是一个拟人的助手，而是一个存在感很低的陪伴者。它的
                每一个视觉特征都是为了减少干扰，让你把注意力放回自己身上。最终文案
                待回填。
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
