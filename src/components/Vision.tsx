import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Vision() {
  return (
    <section id="vision" className="border-t border-line">
      <div className="container py-20 md:py-32">
        <SectionHeading eyebrow="愿景" title="先陪你待一会儿，再谈其他。" />

        <Reveal delay={0.1}>
          <p className="mt-8 max-w-2xl text-[22px] leading-relaxed tracking-tight text-ink md:text-[28px]">
            占位文案：我们希望陪伴这件事本身被重新看见——不是作为解决问题的手段，
            而是作为一种值得被设计的关系。最终文案待回填。
          </p>
        </Reveal>
      </div>
    </section>
  );
}
