import FeatureDisclosure from "./FeatureDisclosure";
import Reveal from "./Reveal";
import SubsectionEyebrow from "./SubsectionEyebrow";

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
    methodText: "减少对抗，让改变从愿意做的一小步开始。",
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
    methodText: "先接住情绪、稳下来，再进入理解和行动。",
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
    methodText: "帮用户一点点看清它们之间的关系。",
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
    method: "借鉴 BPS 与社会功能视角",
    methodText: "把多维信息放回完整生活中理解。",
    product: [
      "共同观察情绪、睡眠、饮食、用药、活动和关系",
      "关注是否重新吃饭、出门、上学和参与互动",
      "整理事实、趋势与待讨论问题",
    ],
    situation: "日常回看、阶段总结、复诊和咨询前整理。",
  },
];

export default function ClinicalFramework() {
  return (
    <section id="solution-method" className="relative scroll-mt-20">
      <span id="clinical" className="pointer-events-none absolute -top-20 h-px w-px" aria-hidden="true" />
      <div className="container pt-12 pb-8 md:pt-12 md:pb-8">
        <div className="h-px w-16 bg-line-soft md:w-20" aria-hidden="true" />
        <Reveal className="mt-7 md:mt-8">
          <SubsectionEyebrow index="03.B" name="心理技术" />
          <h2 className="mt-5 text-[26px] leading-tight tracking-tight text-ink md:mt-6 md:text-[32px]">
            先理解一个人的完整处境，
            <br />
            再决定此刻如何回应。
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <article className="mt-8 rounded-lg border border-line bg-white px-6 py-7 md:mt-10 md:px-8 md:py-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-[12px] font-medium tracking-[0.16em] text-ink-faint">
                底层认知框架
              </div>
              <div className="w-fit rounded-full border border-line bg-accent-soft px-3 py-1 text-[13px] font-semibold tracking-tight text-ink">
                GPM × BPS
              </div>
            </div>

            <h3 className="mt-5 max-w-2xl font-display text-[22px] font-semibold leading-tight tracking-tight text-ink md:text-[26px]">
              不只看情绪，也看生活是否正在重新稳定。
            </h3>

            <div className="mt-6 grid border-t border-line md:grid-cols-3">
              {dimensions.map((dimension, index) => (
                <div
                  key={dimension.title}
                  className={`py-5 md:px-6 ${
                    index === 0 ? "md:pl-0" : "border-t border-line md:border-l md:border-t-0"
                  } ${index === dimensions.length - 1 ? "md:pr-0" : ""}`}
                >
                  <h4 className="font-display text-[17px] font-semibold leading-tight tracking-tight text-ink md:text-[18px]">
                    {dimension.title}
                  </h4>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                    {dimension.description}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </Reveal>

        <div className="mt-10 md:mt-12">
          <Reveal delay={0.22} className="pl-6 md:pl-8">
            <div className="text-[12px] font-medium tracking-[0.16em] text-ink-faint">
              场景化技术应用
            </div>
          </Reveal>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {scenarios.map((scenario, i) => (
              <Reveal key={scenario.index} delay={0.26 + i * 0.06}>
                <article className="flex h-full flex-col rounded-lg border border-line bg-white p-5 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-[19px] font-semibold leading-tight tracking-tight text-ink md:text-[21px]">
                      {scenario.title}
                    </h3>
                    <span className="inline-flex shrink-0 items-center rounded-full border border-line bg-accent-soft px-3 py-1 text-[13px] font-semibold tracking-tight text-ink">
                      {scenario.index}
                    </span>
                  </div>

                  <p className="mt-3 text-[14px] leading-relaxed text-ink-soft md:text-[15px]">
                    <span className="mr-2 inline-flex items-center rounded-full border border-line bg-accent-soft px-3 py-1 text-[13px] font-semibold tracking-tight text-ink">
                      {scenario.method}
                    </span>
                    {scenario.methodText}
                  </p>

                  <FeatureDisclosure
                    label="查看产品表现与典型场景"
                    items={[...scenario.product, `典型场景：${scenario.situation.replace(/\n/g, " ")}`]}
                  />
                </article>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={0.56}>
          <p className="mt-5 text-[12px] leading-relaxed text-ink-faint">
            在呀 ZÀIYA 借鉴专业方法中的日常支持原则，不提供医学诊断、心理治疗或用药建议，也不替代专业人员的判断。
          </p>
        </Reveal>
      </div>
    </section>
  );
}
