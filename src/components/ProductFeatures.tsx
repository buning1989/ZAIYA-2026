import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

type Card = {
  name: string;
  note: string;
  /** 弱化呈现：降低正文颜色（不改变卡片结构与字号）。 */
  muted?: boolean;
};

type Group = {
  title: string;
  cards: Card[];
};

const groups: Group[] = [
  {
    title: "你不用逼自己，也能动起来",
    cards: [
      {
        name: "在在陪伴",
        note: "早上、吃饭、睡前，在在自己出现在屏幕上，陪你把这件事做完，你不用想起来打开它",
      },
      {
        name: "一起做",
        note: "不想一个人做的事，和在在、和其他人一起做：一起吃饭、一起发呆，做着做着就开始了",
      },
      {
        name: "攒能量",
        note: "每做完一件小事，就攒下一点能量。不是打卡任务，是让你看见自己一点点在往前走",
      },
    ],
  },
  {
    title: "你只是随口说说，它已经在悄悄帮你",
    cards: [
      {
        name: "和在在聊聊",
        note: "你只是说说今天怎么了，但每一句回应背后都有方法，轻轻帮你把钻进去的念头松开一点——不是陪聊，也不是讲道理",
      },
      {
        name: "随口就记下了",
        note: "心情、吃了没、睡得好不好、药吃了没，你不用填表，说一句、点一下，这一天就留下来了",
      },
      {
        name: "偶然瞥见的一句话",
        note: "待机时飘过的句子，有时是一句被人读了很多年的话，恰好在这一刻被你看到",
        muted: true,
      },
    ],
  },
  {
    title: "你的难，第一次被人完整看见",
    cards: [
      {
        name: "帮我整理",
        note: "散落的日常，一键整理成一份材料，给复诊的医生，也给想理解你的父母、老师、咨询师",
      },
      {
        name: "回头看看",
        note: "这段时间到底是怎么过来的，你自己也看得见：哪几天特别难，哪几天好一点，一目了然",
      },
      {
        name: "你说了算",
        note: "哪些给谁看，你自己决定；敏感内容，发出去之前一定先问过你",
      },
    ],
  },
];

export default function ProductFeatures() {
  return (
    <section id="product" className="border-t border-line">
      <div className="container py-20 md:py-32">
        <SectionHeading
          eyebrow="产品与核心功能"
          title="别人让你打卡、坚持、完成目标。在呀反过来——你什么都不用做。"
        />

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink-soft">
            因为对这群人来说，\u201c坚持\u201d本身就是那件做不到的事。在呀不靠你努力，而是从三个方向，悄悄陪你一点点变好。
          </p>
        </Reveal>

        <div className="mt-14 flex flex-col gap-14">
          {groups.map((g, gi) => (
            <Reveal key={g.title} delay={0.08 + gi * 0.06}>
              <div>
                <div className="border-t border-line pt-8">
                  <div className="text-[20px] font-medium tracking-tight text-ink md:text-[22px]">
                    {g.title}
                  </div>
                </div>

                <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
                  {g.cards.map((c) => (
                    <div
                      key={c.name}
                      className="flex h-full flex-col gap-3 bg-white p-8"
                    >
                      <div className="text-[18px] font-semibold tracking-tight text-ink">
                        {c.name}
                      </div>
                      <p
                        className={`text-[13px] leading-relaxed ${
                          c.muted ? "text-ink-faint" : "text-ink-soft"
                        }`}
                      >
                        {c.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
