import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Vision() {
  return (
    <section id="vision" className="border-t border-line">
      <div className="container py-14 md:py-16">
        <div className="mx-auto max-w-[940px]">
          <SectionHeading eyebrow="愿景" title="真正的康复，是重新拥有自己的生活。" />

          <Reveal delay={0.1} y={8}>
            <p className="mt-6 text-[16px] leading-relaxed text-ink-soft md:text-[18px]">
              精神心理困扰不只需要治疗，更需要将：
            </p>
          </Reveal>

          <Reveal delay={0.16} y={8}>
            <p className="mt-3 text-[20px] leading-snug tracking-tight text-ink md:text-[24px]">
              药物治疗 × 心理治疗 × 生活调整
            </p>
          </Reveal>

          <Reveal delay={0.24} y={8}>
            <p className="mt-6 inline-block rounded bg-accent-soft px-5 py-3 text-[26px] font-semibold leading-snug tracking-tight text-ink md:text-[34px]">
              连接成一套持续、完整的精神健康管理模式。
            </p>
          </Reveal>

          <Reveal delay={0.32} y={8}>
            <p className="mt-8 max-w-2xl text-[16px] leading-relaxed text-ink-soft md:text-[18px]">
              在呀 ZÀIYA 想成为三者之间的桥梁，让专业支持真正回到每天的吃饭、睡觉、学习、工作与关系中。
            </p>
          </Reveal>

          <Reveal delay={0.4} y={8}>
            <p className="mt-10 max-w-3xl text-[20px] leading-relaxed tracking-tight text-ink md:text-[24px]">
              让每一个被精神心理困扰按下暂停的人，都有机会重新参与生活，走向健康、有序、可持续的人生。
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
