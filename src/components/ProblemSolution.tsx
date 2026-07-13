import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const blocks = [
  {
    label: "被忽视的痛",
    text: "每 10 个青少年，就有近 2 个被诊断为精神障碍。而超过 90% 的人，从未接受过任何治疗。就算看了医生，一年真正被看见的时间，也不到两小时。剩下的 8700 小时里发生了什么，没有人知道。",
  },
  {
    label: "沉默的一亿人",
    text: "这是一个上亿人、却几乎没人接住的市场。每一个卡在里面的孩子背后，都有一个想帮他、却不知道怎么帮的家庭。五年间，主动为孩子寻求帮助的家庭，多了近三倍。",
  },
  {
    label: "没人在做的事",
    text: "别的工具让你打卡、做练习——可对这群人，\u201c坚持\u201d本身就是做不到的事。在呀不要求任何努力，只是安静地把那 8700 小时里发生的一切，变成家长、医生、老师、咨询师看得懂的信息。因为只有被完整地看见，才能得到全面的帮助。",
  },
];

export default function ProblemSolution() {
  return (
    <section id="problem" className="border-t border-line">
      <div className="container py-20 md:py-32">
        <SectionHeading
          eyebrow="需求与方案"
          title="因为，真正的难题在诊室之外。"
        />

        <div className="mt-12 flex max-w-3xl flex-col gap-12">
          {blocks.map((b, i) => (
            <Reveal key={b.label} delay={0.08 + i * 0.08}>
              <div className="border-t border-line pt-8">
                <div className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-faint">
                  {b.label}
                </div>
                <p className="mt-4 text-[24px] leading-snug tracking-tight text-ink md:text-[28px]">
                  {b.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
