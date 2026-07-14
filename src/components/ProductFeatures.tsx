import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ChevronLeft,
  ChevronUp,
  Sprout,
  Waves,
  Wifi,
} from "lucide-react";
import DialogueZaiyaAnimation from "./DialogueZaiyaAnimation";
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
  mediaComponent?: "widget" | "relief" | "dialog";
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
  image?: {
    src: string;
    alt: string;
  };
};

const solutions: Solution[] = [
  {
    step: "01｜多端持续在场",
    title: "在需要的时刻，随时可以看见",
    summary:
      "在呀 ZÀIYA 通过 App、桌面小组件和手表等轻入口，出现在起床、吃饭、睡前这些日常时刻——不用先想起打开它，支持就已经在。",
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
      "当起床、吃饭这样的小事都变难，催促只会加压。在呀不催，而是自己先做一点、轻轻邀请，陪用户从一件做得到的小事开始。",
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
      "相比填表和逐项录入，说话更自然。在呀从文字和语音里读懂发生的事、感受和状态，整理成可确认的记录，慢慢沉淀成连续的生活记忆。",
    features: [
      "从自然表达中识别情绪、睡眠、饮食、活动和用药等信息",
      "将对话转化为可查看、确认和管理的记录",
      "将单次表达连接为长期生活变化",
    ],
    placeholder: [
      "产品图占位",
      "AI 对话 → 信息识别 → 用户确认 → 结构化记录",
    ],
    mediaComponent: "dialog",
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
      "看见最近睡觉、吃饭、活动的样子，哪些时刻更容易难受，生活参与感有没有在变化。",
    features: ["回头看看", "帮我整理", "夸夸自己"],
    placeholder: [
      "产品图占位",
      "用户端生活趋势 / 阶段回看 / 变化总结",
    ],
    image: {
      src: "/assets/product/lookback-trend-preview.png",
      alt: "回头看看生活趋势产品界面",
    },
  },
  {
    label: "给支持者的沟通依据",
    title: "帮助支持者了解情况",
    description:
      "在用户授权下，把日常记录整理成结构化的沟通材料，让家长、医生和咨询师快速看清一段时间里的状态和关键变化。",
    features: [
      "复诊前整理",
      "沟通确认单",
      "专业参考报告",
    ],
    placeholder: [
      "产品图占位",
      "沟通确认单 / 专业参考报告 / 待讨论问题",
    ],
    image: {
      src: "/assets/product/supporter-communication-preview.png",
      alt: "沟通确认单产品界面",
    },
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

function ProductImageFrame({ image }: { image: NonNullable<OutputBlock["image"]> }) {
  return (
    <div className="mx-auto aspect-[426/422] w-full max-w-[383px] overflow-hidden">
      <img
        src={image.src}
        alt={image.alt}
        className="h-full w-full object-cover object-top"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

function DeferredPreview({
  children,
  className,
  rootMargin = "700px",
}: {
  children: ReactNode;
  className: string;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) return;
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  return (
    <div ref={ref} className={className}>
      {shouldRender ? children : null}
    </div>
  );
}

function ReliefEntryPreview() {
  return (
    <div className="mx-auto w-full max-w-[390px]">
      <div className="relative h-[500px] overflow-hidden rounded-t-[42px] border-[7px] border-b-0 border-ink bg-ink shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)]">
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

          <div className="mt-1 flex flex-col items-center">
            <div className="flex h-[168px] items-center justify-center">
              <ZaizaiVideo
                src={ZAIZAI_RELIEF_VIDEO_SRC}
                className="h-[98px] w-[98px]"
                shadow={false}
              />
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft/80">
              不着急，先让自己慢下来。
            </p>
          </div>

          <div className="mt-4 pb-8">
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

function DialogRecordPreview() {
  return (
    <div className="mx-auto w-full max-w-[390px]">
      <div className="relative h-[430px] overflow-hidden rounded-t-[42px] border-[7px] border-b-0 border-ink bg-ink shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)]">
        <div className="relative h-full overflow-hidden rounded-t-[34px] bg-white px-6 pt-4">
          <div className="flex items-center justify-between text-[12px] font-semibold text-ink">
            <span>01:30</span>
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
            <div className="h-9 w-9" />
          </div>

          <div className="-mt-2 flex justify-center">
            <DialogueZaiyaAnimation
              state="listening"
              className="h-[100px] w-[92px]"
              videoClassName="object-contain"
            />
          </div>

          <div className="mt-3 text-center text-[12px] leading-5 text-ink-faint/35">
            今天 01:30
          </div>

          <div className="mt-4 space-y-3.5">
            <div className="max-w-[48%] rounded-[17px] border border-line bg-white px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
              ......嗯？我在......
            </div>
            <div className="ml-auto max-w-[34%] rounded-[17px] bg-[#EFF0EC] px-4 py-3 text-[13px] leading-relaxed text-ink">
              睡不着。
            </div>
            <div className="max-w-[72%] rounded-[17px] border border-line bg-white px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
              这个点了呀.....你还好吗？
            </div>
            <div className="ml-auto max-w-[78%] rounded-[17px] bg-[#EFF0EC] px-4 py-3 text-[13px] leading-relaxed text-ink">
              一躺下就开始想 我爸那张暴怒的脸 没写完的卷子
              同学一直在上学 我去不了学校成绩就一直下滑 各种乱七八糟的。
            </div>
            <div className="max-w-[76%] rounded-[17px] border border-line bg-white px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
              脑子里在放电视剧，循环播放那种，最烦了。
            </div>
            <div className="max-w-[82%] rounded-[17px] border border-line bg-white px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
              那些事让它们先在门口等等，天亮了再说，现在不是它们的时间。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HalfPhonePreviewStage({
  children,
  ariaLabel,
  stageClassName = "min-h-[330px] md:min-h-[370px]",
}: {
  children: ReactNode;
  ariaLabel: string;
  stageClassName?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-white ${stageClassName}`}
      role="img"
      aria-label={ariaLabel}
    >
      <div className="w-full -translate-y-5 scale-[0.82] md:scale-[0.85]">
        {children}
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
            <h3 className="mt-3 font-display text-[22px] font-semibold leading-tight tracking-tight text-ink md:text-[26px]">
              {solution.title}
            </h3>
            <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
              {solution.summary}
            </p>
            <FeatureDisclosure items={solution.features} />
          </div>

          <div className={mediaFirst ? "md:order-1" : undefined}>
            {solution.mediaComponent === "widget" ? (
              <DeferredPreview
                className="flex min-h-[330px] items-center justify-center overflow-hidden bg-white md:min-h-[370px]"
              >
                <div
                  className="flex min-h-[330px] items-center justify-center overflow-hidden bg-white md:min-h-[370px]"
                  role="img"
                  aria-label="在呀 ZÀIYA 手机桌面小组件产品展示"
                >
                  <div className="w-full scale-[0.7]">
                    <WidgetSurface videoEager={false} />
                  </div>
                </div>
              </DeferredPreview>
            ) : solution.mediaComponent === "relief" ? (
              <DeferredPreview className="min-h-[430px] md:min-h-[455px]">
                <HalfPhonePreviewStage
                  ariaLabel="在呀 ZÀIYA 缓解入口半屏产品展示"
                  stageClassName="min-h-[430px] md:min-h-[455px]"
                >
                  <ReliefEntryPreview />
                </HalfPhonePreviewStage>
              </DeferredPreview>
            ) : solution.mediaComponent === "dialog" ? (
              <DeferredPreview className="min-h-[330px] md:min-h-[370px]">
                <HalfPhonePreviewStage ariaLabel="在呀 ZÀIYA 对话记录半屏产品展示">
                  <DialogRecordPreview />
                </HalfPhonePreviewStage>
              </DeferredPreview>
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
        <h4 className="font-display text-[19px] font-semibold leading-tight tracking-tight text-ink md:text-[21px]">
          {output.title}
        </h4>
        <p className="mt-4 text-[14px] leading-relaxed text-ink-soft md:text-[15px]">
          {output.description}
        </p>

        <div className="mt-5">
          {output.image ? (
            <ProductImageFrame image={output.image} />
          ) : (
            <PlaceholderFrame
              lines={output.placeholder}
              ratio="aspect-[4/3]"
              layout="output"
            />
          )}
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
                <h3 className="mt-3 font-display text-[22px] font-semibold leading-tight tracking-tight text-ink md:text-[26px]">
                  把零散日常，整理成真正有用的信息
                </h3>
                <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
                  同一组生活信息，两种用途：一份帮助用户理解自己，一份帮助支持者了解情况。
                </p>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {outputs.map((output, index) => (
                  <OutputCard key={output.label} output={output} index={index} />
                ))}
              </div>

              <p className="mt-5 text-[12px] leading-relaxed text-ink-faint">
                报告只整理事实、趋势和待讨论的问题，不给出诊断、用药建议或治疗结论。
              </p>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
