import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

type VoiceCard = {
  voice: string[];
  name: string;
  explanation: string;
  illustration: string;
};

const voiceCards: VoiceCard[] = [
  {
    voice: [
      "“我知道应该起床、吃饭、洗澡，",
      "可每一件小事都像要用完全部力气。”",
    ],
    name: "生活很难启动",
    explanation:
      "他们不是不知道应该做什么，而是连最普通的日常行动，也可能变得异常困难。",
    illustration: "/assets/dilemmas/openpeeps80.svg",
  },
  {
    voice: [
      "“一想到要回学校，身体就先开始难受。",
      "放假时，我又好像恢复了一点。”",
    ],
    name: "学习与社交逐渐受阻",
    explanation:
      "返校、考试和人际互动，可能引发明显的恐惧、躯体不适与回避，让原本正常的学习和社交难以继续。",
    illustration: "/assets/dilemmas/openpeeps93.svg",
  },
  {
    voice: [
      "“我不是故意不配合，",
      "可家里看到的，常常只是懒、叛逆和不努力。”",
    ],
    name: "痛苦难以表达，也容易被误解",
    explanation:
      "自己很难说清发生了什么，家长看到的却往往只是行为结果，误解和家庭冲突也因此不断加深。",
    illustration: "/assets/dilemmas/openpeeps54.svg",
  },
];

export default function RealDilemmas() {
  return (
    <section id="dilemmas" className="border-t border-line">
      <div className="container py-20 md:py-32">
        <SectionHeading
          eyebrow="真实困境"
          title="他们面对的，远不只是情绪不好。"
        />

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink-soft">
            在一项基于小红书公开内容的探索性调研中，我们分析了约 13,900 条青少年与家长的表达。反复出现的，是生活无法启动、上学与社交受阻，以及痛苦长期被误解。
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {voiceCards.map((card, i) => (
            <Reveal key={card.name} delay={0.12 + i * 0.06}>
              <article className="relative flex h-full min-h-[330px] overflow-hidden rounded-lg border border-line bg-white px-6 py-7 md:min-h-[360px] md:px-7 md:py-8">
                <img
                  src={card.illustration}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-5 h-24 w-20 object-contain opacity-[0.16] md:right-5 md:top-6 md:h-32 md:w-28 md:opacity-[0.28]"
                />

                <div className="relative z-10 flex h-full flex-col">
                  <blockquote className="text-[19px] font-medium leading-loose tracking-tight text-ink md:pr-20 md:text-[20px]">
                    {card.voice.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </blockquote>

                  <div className="mt-auto pt-10">
                    <h3 className="font-display text-[19px] font-semibold leading-snug tracking-tight text-ink md:text-[20px]">
                      {card.name}
                    </h3>
                    <p className="mt-3 text-[13px] leading-relaxed text-ink-soft md:text-[14px]">
                      {card.explanation}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.34}>
          <div className="mt-10 rounded-lg border border-line bg-accent-soft px-6 py-7 md:px-8 md:py-8">
            <p className="max-w-2xl text-[18px] font-medium leading-relaxed text-ink md:text-[20px]">
              他们失去的，不只是情绪稳定，
              <br />
              而是对日常生活的参与感和掌控感。
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.42}>
          <p className="mt-8 text-[11px] leading-relaxed text-ink-faint">
            调研说明：以上内容基于 2026 年 6 月对小红书公开笔记及评论区的探索性研究，相关表达均由多条评论脱敏归纳，并非对单一用户原文的直接引用。平台用户结构、样本筛选与关键词设置可能带来偏差，结果仅用于理解典型需求场景，不代表总体人群比例或严格统计结论。
          </p>
        </Reveal>
      </div>
    </section>
  );
}
