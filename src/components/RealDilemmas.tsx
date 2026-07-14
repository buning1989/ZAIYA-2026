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
    name: "学习逐渐受阻",
    explanation:
      "返校、考试和人际互动，可能引发明显的恐惧、躯体不适与回避，让原本正常的学习和社交难以继续。",
    illustration: "/assets/dilemmas/openpeeps93.svg",
  },
  {
    voice: [
      "“我不是故意不配合，",
      "可家里看到的，常常只是懒、叛逆和不努力。”",
    ],
    name: "痛苦不被理解",
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
              <article className="relative flex h-full min-h-[230px] flex-col justify-center rounded-lg border border-line bg-white px-5 pb-7 pt-9 md:min-h-[250px] md:px-6 md:pb-8 md:pt-10">
                <h3 className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-white px-4 font-display text-[16px] font-semibold leading-none tracking-tight text-ink md:text-[17px]">
                  {card.name}
                </h3>

                <div className="grid grid-cols-[76px_minmax(0,1fr)] items-center gap-4 md:grid-cols-[84px_minmax(0,1fr)] md:gap-5">
                  <div className="grid aspect-square place-items-center rounded-full border border-line bg-card-soft">
                    <img
                      src={card.illustration}
                      alt=""
                      aria-hidden="true"
                      className="h-[84%] w-[84%] object-contain opacity-70"
                    />
                  </div>

                  <blockquote className="text-[15px] font-semibold leading-snug tracking-tight text-ink md:text-[16px]">
                    {card.voice.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
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
