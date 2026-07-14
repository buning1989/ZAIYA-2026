import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const dimensions = [
  {
    title: "生物状态",
    description: "睡眠、饮食、用药与活动。",
  },
  {
    title: "心理状态",
    description: "情绪、认知、动机与压力。",
  },
  {
    title: "社会功能",
    description: "上学、社交、家庭互动与自我管理。",
  },
];

const scenarios = [
  {
    index: "01",
    title: "当用户不想行动，或很难开始",
    method: "借鉴 MI",
    methodText: "减少对抗，让改变从用户愿意做的一小步开始。",
    product: [
      "不使用命令、催促和失败惩罚",
      "提供少量、可选择的下一步",
      "将行动拆到足够小",
    ],
    situation: "起床、吃饭、出门、记录和复诊准备。",
  },
  {
    index: "02",
    title: "当情绪过载，暂时无法整理问题",
    method: "借鉴 DBT",
    methodText: "先承接和稳定，再进入理解与行动。",
    product: [
      "先回应感受，不急于分析",
      "降低页面刺激与信息密度",
      "提供呼吸、接地等稳定化练习",
    ],
    situation: "焦虑加剧、家庭冲突后，或情绪已经难以承受时。",
  },
  {
    index: "03",
    title: "当事件、想法和感受混在一起",
    method: "借鉴 CBT",
    methodText: "帮助用户逐步看见它们之间的关系。",
    product: [
      "将复杂表达拆成事实、感受与想法",
      "每次只推进一个问题",
      "不直接纠正，也不替用户下结论",
    ],
    situation: "“我什么都做不好。”\n“回学校一定会失败。”",
  },
  {
    index: "04",
    title: "当状态零散，长期变化难以判断",
    method: "基于 BPS 与社会功能视角",
    methodText: "把多维信息放回完整生活中理解。",
    product: [
      "共同观察情绪、睡眠、饮食、用药、活动和关系",
      "关注是否重新吃饭、出门、上学和参与互动",
      "整理事实、趋势与待讨论问题",
    ],
    situation: "日常回看、阶段总结、复诊和咨询前整理。",
  },
];

function ProductList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 grid gap-2 text-[13px] leading-relaxed text-ink-soft md:text-[14px]">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-line" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ClinicalFramework() {
  return (
    <section id="clinical" className="border-t border-line">
      <div className="container pt-10 pb-12 md:pt-11">
        <SectionHeading
          eyebrow="专业方法"
          title={
            <>
              先理解一个人的完整处境，
              <br />
              再决定此刻如何回应。
            </>
          }
        />

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-[46rem] text-[17px] leading-relaxed text-ink-soft md:text-[19px]">
            在呀以 GPM × BPS
            为底层认知框架，关注用户的情绪、身体状态、生活节律与社会功能；再根据不同场景，借鉴
            MI、DBT、CBT 等方法，提供更合适的支持。
          </p>
        </Reveal>

        <Reveal delay={0.16}>
          <article className="mt-10 rounded-lg border border-line bg-accent-soft px-6 py-7 md:mt-12 md:px-8 md:py-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-[12px] font-medium tracking-[0.16em] text-ink-faint">
                底层认知框架
              </div>
              <div className="w-fit rounded-full border border-line bg-white/65 px-3 py-1 text-[13px] font-semibold tracking-tight text-ink">
                GPM × BPS
              </div>
            </div>

            <h3 className="mt-5 max-w-2xl font-display text-[24px] font-semibold leading-tight tracking-tight text-ink md:text-[30px]">
              不只看情绪，也看生活是否正在重新稳定。
            </h3>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              在呀从生物、心理和社会三个维度理解用户：
            </p>

            <div className="mt-6 grid border-t border-line md:grid-cols-3">
              {dimensions.map((dimension, index) => (
                <div
                  key={dimension.title}
                  className={`py-5 md:px-6 ${
                    index === 0 ? "md:pl-0" : "border-t border-line md:border-l md:border-t-0"
                  } ${index === dimensions.length - 1 ? "md:pr-0" : ""}`}
                >
                  <h4 className="font-display text-[18px] font-semibold leading-tight tracking-tight text-ink">
                    {dimension.title}
                  </h4>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                    {dimension.description}
                  </p>
                </div>
              ))}
            </div>

            <p className="border-t border-line pt-5 text-[16px] font-semibold leading-relaxed text-ink md:text-[18px]">
              产品关注的不是用户聊了多少，而是是否逐渐重新参与真实生活。
            </p>
          </article>
        </Reveal>

        <div className="mt-12 md:mt-14">
          <Reveal delay={0.22}>
            <div className="text-[12px] font-medium tracking-[0.16em] text-ink-faint">
              场景化技术应用
            </div>
          </Reveal>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {scenarios.map((scenario, i) => (
              <Reveal key={scenario.index} delay={0.26 + i * 0.06}>
                <article className="flex h-full min-h-[318px] flex-col rounded-lg border border-line bg-white p-5 md:min-h-[400px] md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-[22px] font-semibold leading-tight tracking-tight text-ink md:text-[24px]">
                      {scenario.title}
                    </h3>
                    <span className="shrink-0 text-[12px] font-medium tracking-[0.16em] text-ink-faint">
                      {scenario.index}
                    </span>
                  </div>

                  <div className="mt-5 border-l border-line pl-4">
                    <div className="text-[12px] font-medium tracking-[0.16em] text-ink-faint">
                      {scenario.method}
                    </div>
                    <p className="mt-2 text-[15px] font-semibold leading-relaxed text-ink">
                      {scenario.methodText}
                    </p>
                  </div>

                  <div className="mt-5">
                    <div className="text-[12px] font-medium tracking-[0.16em] text-ink-faint">
                      产品表现
                    </div>
                    <ProductList items={scenario.product} />
                  </div>

                  <div className="mt-auto pt-5">
                    <div className="border-t border-line pt-4">
                      <div className="text-[12px] font-medium tracking-[0.16em] text-ink-faint">
                        典型场景
                      </div>
                      <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink-soft md:text-[15px]">
                        {scenario.situation}
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.5}>
          <div className="mt-8 rounded-lg border border-line bg-accent-soft px-5 py-5 md:px-6 md:py-6">
            <p className="text-[16px] font-semibold leading-relaxed text-ink md:text-[18px]">
              框架决定我们如何理解一个人，技术决定此刻如何回应。
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.56}>
          <p className="mt-6 text-[12px] leading-relaxed text-ink-faint">
            在呀借鉴专业方法中的日常支持原则，不提供医学诊断、心理治疗或用药建议，也不替代专业人员的判断。
          </p>
        </Reveal>
      </div>
    </section>
  );
}
