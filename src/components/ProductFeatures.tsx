import { ChevronLeft, ChevronUp, Sprout, Waves, Wifi } from "lucide-react";
import FeatureDisclosure from "./FeatureDisclosure";
import { WidgetSurface } from "./MultiFormShowcase";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import ZaizaiVideo, { ZAIZAI_RELIEF_VIDEO_SRC } from "./ZaizaiVideo";

type Solution = {
  step: string;
  title: string;
  summary: string;
  features: string[];
  placeholder: string[];
  mediaComponent?: "widget" | "relief";
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
    summary:
      "在呀 ZÀIYA 通过 App、手机桌面小组件和智能手表等轻入口，出现在起床、吃饭、睡前和情绪波动等生活节点——不需要用户先想起打开一款工具，支持就已经在场。",
    features: [
      "App 首页中的在在",
      "手机桌面小组件",
      "智能手表端",
    ],
    placeholder: [
      "产品图占位",
      "App 首页 / 手机桌面小组件 / 智能手表",
    ],
    mediaComponent: "widget",
    ratio: "aspect-[16/9]",
    mediaLayout: "devices",
    mediaSide: "right",
  },
  {
    step: "02｜陪伴行动",
    title: "不催促，先陪着做一点",
    summary:
      "当起床、吃饭这样的小事都变得困难，催促往往只会增加压力。在呀 ZÀIYA 用角色的生活演示、轻量邀请和共同参与，陪用户从一件做得到的小事开始。",
    features: [
      "一起吃饭、一起发呆等轻社交场景",
      "呼吸练习和情绪缓解工具",
      "在在起床、吃饭、看书、休息等生活演示",
    ],
    placeholder: [
      "产品图占位",
      "一起吃饭 / 一起发呆 / 呼吸练习 / 生活演示",
    ],
    mediaComponent: "relief",
    ratio: "aspect-[4/3]",
    mediaLayout: "scene",
    mediaSide: "left",
  },
  {
    step: "03｜AI 对话自然记录",
    title: "表达本身，就是记录的开始",
    summary:
      "相比填表和逐项录入，说话是更自然的表达。在呀 ZÀIYA 从文字和语音对话中理解事件、感受与生活状态，整理成可确认的结构化记录，并在长期互动中沉淀为连续的生活记忆。",
    features: [
      "从自然表达中识别情绪、睡眠、饮食、活动和用药等信息",
      "将对话转化为可查看、确认和管理的记录",
      "将单次表达连接为长期生活变化",
    ],
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
    label: "给用户的生活回看",
    title: "帮助用户理解自己",
    description:
      "看见最近怎样睡觉、吃饭和活动，哪些时刻更容易难受，以及生活参与感是否正在变化。",
    features: ["回头看看", "帮我整理", "夸夸自己"],
    placeholder: [
      "产品图占位",
      "用户端生活趋势 / 阶段回看 / 变化总结",
    ],
  },
  {
    label: "给支持者的沟通依据",
    title: "帮助支持者了解情况",
    description:
      "在用户授权下，把日常记录整理为结构化沟通材料，帮助家长、医生和咨询师快速了解一段时间的生活状态和关键变化。",
    features: [
      "复诊前整理",
      "沟通确认单",
      "专业参考报告",
    ],
    placeholder: [
      "产品图占位",
      "沟通确认单 / 专业参考报告 / 待讨论问题",
    ],
  },
];

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

function ReliefEntryPreview() {
  return (
    <div className="mx-auto w-full max-w-[390px]">
      <div className="relative h-[430px] overflow-hidden rounded-t-[42px] border-[7px] border-b-0 border-ink bg-ink shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)]">
        <div className="relative h-full overflow-hidden rounded-t-[34px] bg-white px-7 pt-4">
          <div className="flex items-center justify-between text-[12px] font-semibold text-ink">
            <span>22:01</span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-end gap-[2px]">
                <span className="h-1.5 w-1 rounded-[1px] bg-ink" />
                <span className="h-2 w-1 rounded-[1px] bg-ink" />
                <span className="h-2.5 w-1 rounded-[1px] bg-ink" />
                <span className="h-3 w-1 rounded-[1px] bg-ink" />
              </div>
              <Wifi className="h-3.5 w-3.5" strokeWidth={1.8} />
              <div className="relative ml-0.5 h-3 w-6 rounded-[3px] border border-ink/55 p-[1.5px]">
                <span className="absolute -right-[3px] top-1/2 h-1.5 w-[2px] -translate-y-1/2 rounded-r bg-ink/55" />
                <span className="block h-full w-3/4 rounded-[1px] bg-ink" />
              </div>
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between">
            <ChevronLeft className="h-6 w-6 text-ink-soft" strokeWidth={1.8} />
            <div className="grid h-9 w-9 place-items-center rounded-full border border-[#E8D9B8] bg-[#FFF8EB] text-[#C69838]">
              <Sprout className="h-4 w-4" strokeWidth={1.8} />
            </div>
          </div>

          <div className="mt-3 flex flex-col items-center">
            <ZaizaiVideo
              src={ZAIZAI_RELIEF_VIDEO_SRC}
              className="h-[112px] w-[112px]"
              shadow={false}
            />
            <p className="mt-[5%] text-[13px] leading-relaxed text-ink-soft/80">
              不着急，先让自己慢下来。
            </p>
          </div>

          <div className="mt-7">
            <div className="mb-[10px] text-[13px] font-medium leading-5 text-[#7B8376]">
              当前可用
            </div>
            <div
              className="flex min-h-[88px] w-full items-center gap-[14px] rounded-2xl bg-white p-[16px_18px] text-left"
              style={{ border: "1px solid #D8DDD3" }}
            >
              <Waves className="h-7 w-7 text-ink-soft" strokeWidth={1.8} />
              <div className="min-w-0 flex-1">
                <div className="text-[16px] font-semibold leading-6 text-[#2F392B]">
                  呼吸法
                </div>
                <div className="mt-[3px] text-[13px] font-normal leading-5 text-[#737A70]">
                  选择一种适合现在的节奏
                </div>
              </div>
              <ChevronUp className="h-5 w-5 text-ink-faint" strokeWidth={1.8} />
            </div>
          </div>
        </div>
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
            <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
              {solution.summary}
            </p>
            <FeatureDisclosure items={solution.features} />
          </div>

          <div className={mediaFirst ? "md:order-1" : undefined}>
            {solution.mediaComponent === "widget" ? (
              <div
                className="flex min-h-[330px] items-center justify-center overflow-hidden bg-white md:min-h-[370px]"
                role="img"
                aria-label="在呀 ZÀIYA 手机桌面小组件产品展示"
              >
                <div className="w-full scale-[0.7]">
                  <WidgetSurface />
                </div>
              </div>
            ) : solution.mediaComponent === "relief" ? (
              <div
                className="relative flex min-h-[330px] items-center justify-center overflow-hidden bg-white md:min-h-[370px]"
                role="img"
                aria-label="在呀 ZÀIYA 缓解入口半屏产品展示"
              >
                <div className="w-full -translate-y-5 scale-[0.82] md:scale-[0.85]">
                  <ReliefEntryPreview />
                </div>
              </div>
            ) : (
              <PlaceholderFrame
                lines={solution.placeholder}
                ratio={solution.ratio}
                layout={solution.mediaLayout}
              />
            )}
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
        <h4 className="font-display text-[20px] font-semibold leading-tight tracking-tight text-ink md:text-[24px]">
          {output.title}
        </h4>
        <p className="mt-4 text-[14px] leading-relaxed text-ink-soft md:text-[15px]">
          {output.description}
        </p>

        <div className="mt-5">
          <PlaceholderFrame
            lines={output.placeholder}
            ratio="aspect-[4/3]"
            layout="output"
          />
        </div>

        <FeatureDisclosure items={output.features} />
      </article>
    </Reveal>
  );
}

export default function ProductFeatures() {
  return (
    <section id="product">
      <div className="container pt-16 pb-14 md:pt-24 md:pb-16">
        <SectionHeading
          eyebrow="我们怎么做"
          title="在呀 ZÀIYA，把支持带进每天的真实生活。"
        />

        <div className="mt-10 space-y-10 md:mt-12 md:space-y-12">
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
                  同一组生活信息，两种用途：一份帮助用户理解自己，一份帮助支持者更准确地了解情况。
                </p>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {outputs.map((output, index) => (
                  <OutputCard key={output.label} output={output} index={index} />
                ))}
              </div>

              <p className="mt-5 text-[12px] leading-relaxed text-ink-faint">
                报告只整理事实、趋势和待讨论问题，不输出诊断、用药建议或治疗结论。
              </p>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
