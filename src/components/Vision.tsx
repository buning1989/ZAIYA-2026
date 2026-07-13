import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const roadmap = [
  {
    label: "现在",
    text: "陪伴 + 记录 + 给能帮你的人——先在个人端把这个闭环做扎实。",
  },
  {
    label: "下一步",
    text: "从 App 走向更轻的入口：桌面组件、智能手表，甚至可以随身佩戴的实体挂件——让陪伴不必\u201c打开App\u201d才存在。",
  },
  {
    label: "更远",
    text: "成为学校、社区、医疗机构都愿意接入的协同工具——不止服务一个孩子，服务整个支持系统。",
  },
];

export default function Vision() {
  return (
    <section id="vision" className="border-t border-line">
      <div className="container py-20 md:py-32">
        <SectionHeading eyebrow="愿景" title="先陪你把这一步走稳，再往前走。" />

        <Reveal delay={0.1}>
          <p className="mt-8 max-w-2xl text-[22px] leading-relaxed tracking-tight text-ink md:text-[28px]">
            在呀真正想做到的，不是让你心情变好，而是帮你的生活，重新转起来。
          </p>
        </Reveal>

        <div className="mt-12 flex max-w-3xl flex-col">
          {roadmap.map((r, i) => (
            <Reveal key={r.label} delay={0.12 + i * 0.08}>
              <div className="border-t border-line py-7">
                <div className="text-[13px] font-medium uppercase tracking-[0.16em] text-ink-faint">
                  {r.label}
                </div>
                <p className="mt-3 text-[18px] leading-snug tracking-tight text-ink md:text-[20px]">
                  {r.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-12 max-w-2xl text-[16px] font-medium leading-relaxed text-ink-soft">
            真正的成功，不是被记录了多少天，是一个曾经被生活困住的人，某一天，重新回到了自己的生活里。
          </p>
        </Reveal>
      </div>
    </section>
  );
}
