import { Fragment } from "react";
import { BookOpen, Smartphone } from "lucide-react";
import Reveal from "./Reveal";
import { team } from "@/data/content";

type PracticeNode = {
  no: string;
  name: string;
  icon: "book" | "phone" | "brand";
};

const practices: PracticeNode[] = [
  { no: "01", name: "纸质情绪日记本", icon: "book" },
  { no: "02", name: "情绪记录小程序", icon: "phone" },
  { no: "03", name: "在呀 ZÀIYA", icon: "brand" },
];

/** 渲染 **加粗** 标记 */
function renderRich(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

function NodeIcon({ kind }: { kind: PracticeNode["icon"] }) {
  if (kind === "book") {
    return <BookOpen className="h-[18px] w-[18px]" strokeWidth={1.6} />;
  }
  if (kind === "phone") {
    return <Smartphone className="h-[18px] w-[18px]" strokeWidth={1.6} />;
  }
  return <span className="text-[17px] font-semibold leading-none">在</span>;
}

function Arrow() {
  return (
    <svg
      className="h-[10px] w-5 flex-shrink-0 text-ink-faint md:h-[18px] md:w-[18px]"
      viewBox="0 0 20 10"
      fill="none"
      aria-hidden
    >
      <path
        d="M0 5h17M12.5 1l4.5 4-4.5 4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Team() {
  return (
    <section id="team" className="border-t border-line">
      <div className="container py-12 md:py-16">
        {/* 标题区 */}
        <Reveal>
          <div className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-faint">
            团队
          </div>
          <h2 className="mt-4 text-[34px] leading-tight tracking-tight text-ink md:text-[44px]">
            二十年亲历，三次实践。
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-soft md:text-[17px]">
            我们是一对 37 岁、从互联网职场转身的夫妻。我们将康复亲历、精神健康系统训练、产品经验与
            AI 开发能力，融合成了一套<strong className="font-semibold text-ink">跨学科的产品能力</strong>。
          </p>
        </Reveal>

        {/* 三次实践路径 */}
        <Reveal delay={0.14}>
          <div className="mt-9 flex flex-col items-stretch gap-2.5 md:flex-row md:items-center md:gap-3">
            {practices.map((p, i) => {
              const isLast = i === practices.length - 1;
              return (
                <Fragment key={p.no}>
                  <div
                    className={[
                      "flex flex-1 items-center gap-3 rounded-2xl px-5 py-3.5",
                      isLast
                        ? "border border-accent/50 bg-accent-soft"
                        : "border border-line bg-accent-soft/50",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                        isLast ? "bg-accent text-white" : "bg-white text-accent",
                      ].join(" ")}
                    >
                      <NodeIcon kind={p.icon} />
                    </span>
                    <span className="text-[13px] font-medium text-ink-faint">{p.no}</span>
                    <span
                      className={[
                        "text-[15px] tracking-tight text-ink md:text-[16px]",
                        isLast ? "font-semibold" : "font-medium",
                      ].join(" ")}
                    >
                      {p.name}
                    </span>
                  </div>
                  {!isLast && (
                    <span className="flex justify-center py-0.5 md:py-0">
                      <Arrow />
                    </span>
                  )}
                </Fragment>
              );
            })}
          </div>
        </Reveal>

        {/* 关键判断 */}
        <Reveal delay={0.18}>
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-ink md:text-[17px]">
            三次实践让我们看清：真正缺少的不是更多工具，<br className="hidden md:block" />
            而是当一个人没有力气时，依然能够用起来的帮助。
          </p>
        </Reveal>

        {/* 成员卡 */}
        <div className="mt-9 grid gap-5 md:grid-cols-2 md:gap-6">
          {team.map((m) => (
            <Reveal key={m.name} delay={0.24}>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-7 shadow-[0_1px_2px_rgba(39,51,31,0.04)] md:p-8">
                <div className="flex items-center gap-4">
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="h-[68px] w-[68px] flex-shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <div className="font-display text-[22px] font-semibold tracking-tight text-ink md:text-[24px]">
                      {m.name}
                    </div>
                    <div className="mt-1 text-[14px] leading-snug text-accent md:text-[15px]">
                      {m.role}
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex-1 space-y-3 text-[14px] leading-relaxed text-ink-soft md:text-[15px]">
                  {m.paragraphs.map((para, i) => (
                    <p key={i}>{renderRich(para)}</p>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* 结尾价值区 */}
        <Reveal delay={0.3}>
          <div className="mt-9 rounded-2xl bg-accent-soft px-7 py-7 md:px-10 md:py-8">
            <p className="max-w-2xl text-[20px] leading-snug tracking-tight text-ink md:text-[26px]">
              让那些最难开始的人，
              <br className="hidden md:block" />
              也能获得真正够得着、用得起来的帮助。
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-soft md:text-[16px]">
              我们既理解这类问题，也有能力把它做成产品。
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
