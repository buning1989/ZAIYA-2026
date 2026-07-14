import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

type Solution = {
  step: string;
  title: string;
  summary: string[];
  features: string[];
  conclusion: string;
  placeholder: string[];
  ratio: string;
  mediaLayout: "devices" | "scene" | "dialog";
  mediaSide: "right" | "left";
};

type OutputBlock = {
  label: string;
  title: string;
  description: string;
  features: string[];
  placeholder: string[];
};

const solutions: Solution[] = [
  {
    step: "01｜多端持续在场",
    title: "在需要的时刻，随时可以看见",
    summary: [
      "在呀不只存在于 App 内，还可以通过手机桌面小组件、智能手表等轻入口，出现在起床、吃饭、睡前和情绪波动等生活节点。",
      "用户不需要先想起打开一款健康管理工具，产品才能开始发挥作用。",
    ],
    features: [
      "App 首页中的在在",
      "手机桌面小组件",
      "智能手表端",
      "根据时间和生活场景变化的状态与轻量邀请",
    ],
    conclusion: "降低用户主动打开产品的门槛。",
    placeholder: [
      "产品图占位",
      "App 首页 / 手机桌面小组件 / 智能手表",
    ],
    ratio: "aspect-[16/9]",
    mediaLayout: "devices",
    mediaSide: "right",
  },
  {
    step: "02｜陪伴行动",
    title: "不催促，先陪着做一点",
    summary: [
      "当起床、吃饭、出门等小事都变得困难，提醒用户“应该做什么”往往没有作用，甚至可能增加压力。",
      "在呀通过角色的生活演示、轻量邀请和共同参与，把命令式提醒变成低压力的行动入口。",
    ],
    features: [
      "一起吃饭、一起发呆等轻社交场景",
      "呼吸练习和情绪缓解工具",
      "在在起床、吃饭、看书、休息等生活演示",
      "不惩罚、不强调连续打卡的能量反馈机制",
    ],
    conclusion:
      "不是要求用户完成任务，而是陪用户从一件做得到的小事开始。",
    placeholder: [
      "产品图占位",
      "一起吃饭 / 一起发呆 / 呼吸练习 / 生活演示",
    ],
    ratio: "aspect-[4/3]",
    mediaLayout: "scene",
    mediaSide: "left",
  },
  {
    step: "03｜AI 对话自然记录",
    title: "表达本身，就是记录的开始",
    summary: [
      "对这类用户来说，填写表单、回忆一天发生了什么，本身就是一项高成本任务。相比逐项录入，文字或语音对话是一种更自然的表达方式。",
      "在呀通过 AI 对话理解用户描述的事件、感受和生活状态，将零散信息整理为结构化记录，并在长期互动中形成连续的个人生活记忆。",
    ],
    features: [
      "文字与语音对话",
      "从自然表达中识别情绪、睡眠、饮食、活动和用药等信息",
      "将对话内容转化为可确认的记录",
      "用户可以查看、确认和管理沉淀的信息",
      "将单次表达连接为长期生活变化",
    ],
    conclusion:
      "AI 对话不是产品终点，而是降低记录成本、理解生活信息的入口。",
    placeholder: [
      "产品图占位",
      "AI 对话 → 信息识别 → 用户确认 → 结构化记录",
    ],
    ratio: "aspect-[16/10]",
    mediaLayout: "dialog",
    mediaSide: "right",
  },
];

const outputs: OutputBlock[] = [
  {
    label: "子区域 A｜给用户的生活回看",
    title: "帮助用户理解自己",
    description:
      "帮助用户看见最近怎样睡觉、吃饭和活动，哪些时刻更容易难受，自己做过哪些努力，以及生活参与感是否正在发生变化。",
    features: ["回头看看", "帮我整理", "趋势回看", "阶段性总结"],
    placeholder: [
      "产品图占位",
      "用户端生活趋势 / 阶段回看 / 变化总结",
    ],
  },
  {
    label: "子区域 B｜给支持者的沟通依据",
    title: "帮助支持者了解情况",
    description:
      "在用户授权下，将日常记录整理为结构化沟通材料，帮助家长、医生和咨询师快速理解一段时间内的生活状态、关键变化和待讨论问题。",
    features: [
      "复诊前整理",
      "沟通确认单",
      "专业参考报告",
      "高风险记录",
      "待沟通问题",
    ],
    placeholder: [
      "产品图占位",
      "沟通确认单 / 专业参考报告 / 待讨论问题",
    ],
  },
];

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2 text-[13px] leading-relaxed text-ink-soft md:text-[14px]">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-line" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function PlaceholderFrame({
  lines,
  ratio,
  layout,
}: {
  lines: string[];
  ratio: string;
  layout: Solution["mediaLayout"] | "output";
}) {
  return (
    <div
      className={`${ratio} relative overflow-hidden rounded-lg border border-line bg-accent-soft p-4 md:p-5`}
    >
      <div className="absolute inset-4 rounded-md border border-line bg-card/50 md:inset-5" />

      {layout === "devices" && (
        <div className="absolute inset-x-8 bottom-8 top-8 flex items-end justify-center gap-3 md:inset-x-12">
          <div className="h-[78%] w-[28%] rounded-md border border-line bg-white/55" />
          <div className="mb-4 h-[52%] w-[34%] rounded-md border border-line bg-white/55" />
          <div className="mb-7 h-[30%] w-[20%] rounded-full border border-line bg-white/55" />
        </div>
      )}

      {layout === "scene" && (
        <div className="absolute inset-7 grid grid-cols-[1.35fr_0.8fr] gap-3">
          <div className="rounded-md border border-line bg-white/55" />
          <div className="grid gap-3">
            <div className="rounded-md border border-line bg-white/55" />
            <div className="rounded-md border border-line bg-white/55" />
          </div>
        </div>
      )}

      {layout === "dialog" && (
        <div className="absolute inset-6 grid grid-cols-2 gap-3">
          <div className="rounded-md border border-line bg-white/55" />
          <div className="rounded-md border border-line bg-white/55" />
        </div>
      )}

      {layout === "output" && (
        <div className="absolute inset-7 rounded-md border border-line bg-white/55" />
      )}

      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
        <span className="text-[13px] font-semibold tracking-tight text-ink md:text-[14px]">
          {lines[0]}
        </span>
        <span className="mt-2 max-w-[18rem] text-[12px] leading-relaxed text-ink-soft md:text-[13px]">
          {lines[1]}
        </span>
      </div>
    </div>
  );
}

function SolutionSection({ solution, index }: { solution: Solution; index: number }) {
  const mediaFirst = solution.mediaSide === "left";

  return (
    <Reveal delay={0.08 + index * 0.06}>
      <article className="border-t border-line pt-10 md:pt-12">
        <div className="grid gap-7 md:grid-cols-2 md:items-center md:gap-12">
          <div className={mediaFirst ? "md:order-2" : undefined}>
            <div className="text-[12px] font-medium tracking-[0.16em] text-ink-faint">
              {solution.step}
            </div>
            <h3 className="mt-3 font-display text-[24px] font-semibold leading-tight tracking-tight text-ink md:text-[30px]">
              {solution.title}
            </h3>
            <div className="mt-5 space-y-3 text-[15px] leading-relaxed text-ink-soft">
              {solution.summary.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className={mediaFirst ? "md:order-1" : undefined}>
            <PlaceholderFrame
              lines={solution.placeholder}
              ratio={solution.ratio}
              layout={solution.mediaLayout}
            />
          </div>

          <div className={mediaFirst ? "md:order-4" : undefined}>
            <div className="rounded-lg border border-line bg-white px-5 py-5 md:px-6 md:py-6">
              <div className="text-[12px] font-medium tracking-[0.16em] text-ink-faint">
                具体产品体现
              </div>
              <div className="mt-4">
                <FeatureList items={solution.features} />
              </div>
            </div>
          </div>

          <div className={mediaFirst ? "md:order-3" : undefined}>
            <p className="rounded-lg border border-line bg-accent-soft px-5 py-5 text-[16px] font-semibold leading-relaxed text-ink md:px-6 md:py-6 md:text-[18px]">
              {solution.conclusion}
            </p>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function OutputCard({ output, index }: { output: OutputBlock; index: number }) {
  return (
    <Reveal delay={0.24 + index * 0.06}>
      <article className="flex h-full flex-col rounded-lg border border-line bg-white p-5 md:p-6">
        <div className="text-[12px] font-medium tracking-[0.16em] text-ink-faint">
          {output.label}
        </div>
        <h4 className="mt-3 font-display text-[20px] font-semibold leading-tight tracking-tight text-ink md:text-[24px]">
          {output.title}
        </h4>
        <p className="mt-4 text-[14px] leading-relaxed text-ink-soft md:text-[15px]">
          {output.description}
        </p>

        <div className="mt-6">
          <PlaceholderFrame
            lines={output.placeholder}
            ratio="aspect-[4/3]"
            layout="output"
          />
        </div>

        <div className="mt-6">
          <FeatureList items={output.features} />
        </div>
      </article>
    </Reveal>
  );
}

export default function ProductFeatures() {
  return (
    <section id="product" className="border-t border-line">
      <div className="container py-20 md:py-32">
        <SectionHeading
          eyebrow="我们怎么做"
          title="在呀，把支持带进每天的真实生活。"
        />

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-prose text-[17px] leading-relaxed text-ink-soft md:text-[19px]">
            从持续在场、陪伴行动，到自然记录和信息整理，在呀帮助用户重新参与生活，也让日常变化成为支持决策的依据。
          </p>
        </Reveal>

        <div className="mt-14 space-y-12 md:mt-16 md:space-y-16">
          {solutions.map((solution, index) => (
            <SolutionSection
              key={solution.step}
              solution={solution}
              index={index}
            />
          ))}

          <Reveal delay={0.22}>
            <article className="border-t border-line pt-10 md:pt-12">
              <div className="max-w-3xl">
                <div className="text-[12px] font-medium tracking-[0.16em] text-ink-faint">
                  04｜双层信息输出
                </div>
                <h3 className="mt-3 font-display text-[24px] font-semibold leading-tight tracking-tight text-ink md:text-[30px]">
                  把零散日常，整理成真正有用的信息
                </h3>
                <p className="mt-5 text-[15px] leading-relaxed text-ink-soft md:text-[16px]">
                  在呀将同一组生活信息，整理为两种不同用途的结果：一份帮助用户理解自己，一份帮助支持者更准确地了解情况。
                </p>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {outputs.map((output, index) => (
                  <OutputCard key={output.label} output={output} index={index} />
                ))}
              </div>

              <p className="mt-6 rounded-lg border border-line bg-accent-soft px-5 py-5 text-[15px] font-semibold leading-relaxed text-ink md:px-6 md:py-6 md:text-[17px]">
                报告只整理事实、趋势和待讨论问题，不输出诊断、用药建议或治疗结论。
              </p>
            </article>
          </Reveal>
        </div>

        <Reveal delay={0.34}>
          <div className="mt-12 rounded-lg border border-line bg-accent-soft px-6 py-7 md:mt-16 md:px-8 md:py-8">
            <p className="max-w-3xl text-[18px] font-semibold leading-relaxed text-ink md:text-[20px]">
              让用户更容易开始，让生活自然留下记录，让每一次支持都建立在更完整的信息上。
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
