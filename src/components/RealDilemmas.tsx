import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

type VoiceCard = {
  voice: string;
  tag: string;
  illustration: string;
};

const voiceCards: VoiceCard[] = [
  {
    voice:
      "“我知道应该起床、吃饭、洗澡，可每件小事都要用尽力气。”",
    tag: "生活很难启动",
    illustration: "/assets/dilemmas/openpeeps80.svg",
  },
  {
    voice:
      "“一想到要回学校，身体就开始难受。放假时，又好像恢复了一点。”",
    tag: "学习逐渐受阻",
    illustration: "/assets/dilemmas/openpeeps93.svg",
  },
  {
    voice:
      "“我不是故意不配合，可家里看到的，常常只是懒、叛逆和不努力。”",
    tag: "痛苦不被理解",
    illustration: "/assets/dilemmas/openpeeps54.svg",
  },
];

export default function RealDilemmas() {
  return (
    <section id="pain" className="relative scroll-mt-20">
      <span id="dilemmas" className="pointer-events-none absolute -top-20 h-px w-px" aria-hidden="true" />
      <div className="container pt-20 pb-20 md:pt-24 md:pb-24">
        <div className="h-px w-full bg-line" aria-hidden="true" />
        <SectionHeading
          index={2}
          name="用户困境"
          title="他们面对的，远不只是情绪不好。"
          className="mt-7 md:mt-8"
        />

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink-soft md:text-[16px]">
            在一项基于小红书公开内容的探索性调研中，我们分析了约 13,900 条青少年与家长的表达。反复出现的，是生活无法启动、上学与社交受阻，以及痛苦长期被误解。
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 md:mt-14 md:grid-cols-3 md:gap-5">
          {voiceCards.map((card, i) => (
            <Reveal key={card.tag} delay={0.12 + i * 0.06}>
              <article className="flex h-full min-h-[230px] flex-col rounded-lg border border-line bg-white p-6 md:min-h-[250px] md:p-7">
                <h3 className="font-display text-[17px] font-semibold leading-snug tracking-tight text-ink md:text-[18px]">
                  <span className="mr-2 font-body text-[12px] font-semibold tracking-[0.14em] text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {card.tag}
                </h3>

                <div className="mt-6 flex flex-1 items-center gap-4 md:mt-7 md:gap-5">
                  <img
                    src={card.illustration}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="h-[72px] w-[62px] shrink-0 object-contain opacity-80 md:h-[86px] md:w-[74px]"
                  />

                  <blockquote className="bubble-copy min-w-0 flex-1 !max-w-none !text-left !text-[16px] md:!text-[16px]">
                    {card.voice}
                  </blockquote>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.34}>
          <p className="mt-6 text-[11px] leading-relaxed text-ink-faint md:mt-7">
            调研说明：以上内容基于 2026 年 6 月对小红书公开笔记及评论区的探索性研究，相关表达均由多条评论脱敏归纳，并非对单一用户原文的直接引用。平台用户结构、样本筛选与关键词设置可能带来偏差，结果仅用于理解典型需求场景，不代表总体人群比例或严格统计结论。
          </p>
        </Reveal>
      </div>
    </section>
  );
}
