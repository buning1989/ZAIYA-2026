import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function ProblemSolution() {
  return (
    <section id="problem" className="border-t border-line">
      <div className="container py-20 md:py-32">
        <SectionHeading
          eyebrow="需求与方案"
          title="现有的陪伴，总是太快给出答案。"
        />

        <div className="mt-12 grid gap-14 md:grid-cols-[1fr_1.2fr] md:gap-20">
          <Reveal>
            <div className="md:sticky md:top-28">
              <p className="text-[15px] leading-relaxed text-ink-soft">
                占位文案：大多数 AI 产品被设计成「解决问题」的工具——你输入困扰，
                它输出建议。但真实的情绪困境往往不是一道待解的题，而是一个需要先被
                承认的状态。
              </p>
              <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
                占位文案：在呀不急于给出方案。它先停留、先确认你的感受，再决定是否
                推进。最终文案待回填。
              </p>
            </div>
          </Reveal>

          <div className="flex flex-col gap-12">
            <Reveal delay={0.1}>
              <div className="border-t border-line pt-8">
                <div className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-faint">
                  现有方案不够的地方
                </div>
                <p className="mt-4 text-[24px] leading-snug tracking-tight text-ink md:text-[28px]">
                  占位：把情绪当输入、把建议当输出，跳过了「被听见」这一步。
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="border-t border-line pt-8">
                <div className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-faint">
                  我们做了什么
                </div>
                <p className="mt-4 text-[24px] leading-snug tracking-tight text-ink md:text-[28px]">
                  占位：让 AI 先学会不说话，再用临床框架引导你找到自己的节奏。
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
