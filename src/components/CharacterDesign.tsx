import { Sprout, EyeOff, Anchor, Sun } from "lucide-react";
import Reveal from "./Reveal";
import ZaizaiVideo from "./ZaizaiVideo";

/** 右侧四项设计理由：标题 + 一句解释。 */
const reasons = [
  {
    icon: Sprout,
    title: "一粒种子，而不是一张固定的脸",
    desc: "它不定义用户此刻应该是什么状态，只保留继续生长的可能。",
  },
  {
    icon: EyeOff,
    title: "不像人，也不像宠物",
    desc: "不扮演医生、老师或家人，也不过度制造“只有它懂我”的关系感。",
  },
  {
    icon: Anchor,
    title: "没有嘴，不要求你回应",
    desc: "不急着说话，也不索取关注，用动作、目光和小芽表达状态。",
  },
  {
    icon: Sun,
    title: "住在屏幕里，却始终指向屏幕外",
    desc: "通过吃饭、休息、看书和出门等动作，陪用户重新参与真实生活。",
  },
];

export default function CharacterDesign() {
  return (
    <section id="character" className="border-t border-line">
      <div className="container pt-10 pb-10 md:pt-10 md:pb-10 min-[1200px]:pt-10 min-[1200px]:pb-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[0.34fr_0.66fr] md:gap-8 min-[1200px]:grid-cols-[0.38fr_0.62fr] min-[1200px]:gap-8 min-[1200px]:items-stretch">
          {/* 左侧：在在角色视觉区 + 三个轻量虚线标注 */}
          <Reveal y={10} className="md:col-start-1 md:row-span-2">
            <div className="relative mx-auto flex min-h-[300px] w-full max-w-[420px] items-end justify-center pb-5 md:h-full md:min-h-[440px] md:max-w-none md:pb-6">
              <ZaizaiVideo className="h-52 w-52 md:h-64 md:w-64 min-[1200px]:h-72 min-[1200px]:w-72" />

              {/* 标注一：种子形态 —— 左上，虚线指向角色顶部 */}
              <div className="absolute left-0 top-1 hidden w-[44%] md:block min-[1200px]:w-[46%]">
                <div className="flex items-start gap-2">
                  <div className="text-right">
                    <div className="text-[13px] font-semibold text-accent">
                      种子形态
                    </div>
                    <p className="mt-1 hidden text-[12px] leading-snug text-ink-soft min-[1200px]:block">
                      成长，而不是治愈承诺。
                      <br />
                      带着此刻的状态，也可以慢慢向前生长。
                    </p>
                  </div>
                  <div className="mt-[7px] flex flex-1 items-center">
                    <div className="h-px flex-1 border-t border-dashed border-accent/55" />
                    <span className="ml-px h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  </div>
                </div>
              </div>

              {/* 标注二：低位目光 —— 右侧，虚线指向角色面部方向 */}
              <div className="absolute right-0 top-[40%] hidden w-[44%] md:block min-[1200px]:w-[46%]">
                <div className="flex items-start gap-2">
                  <div className="mt-[7px] flex flex-1 items-center">
                    <span className="mr-px h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <div className="h-px flex-1 border-t border-dashed border-accent/55" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-accent">
                      低位目光
                    </div>
                    <p className="mt-1 hidden text-[12px] leading-snug text-ink-soft min-[1200px]:block">
                      不凝视，也不审视。
                      <br />
                      减少被观察和被评判的压力。
                    </p>
                  </div>
                </div>
              </div>

              {/* 标注三：低重心 —— 左下，虚线指向角色基座 */}
              <div className="absolute bottom-2 left-0 hidden w-[44%] md:block min-[1200px]:w-[46%]">
                <div className="flex items-start gap-2">
                  <div className="text-right">
                    <div className="text-[13px] font-semibold text-accent">
                      低重心
                    </div>
                    <p className="mt-1 hidden text-[12px] leading-snug text-ink-soft min-[1200px]:block">
                      稳定，不轻易被带乱。
                      <br />
                      动作缓慢，传递安定而非兴奋的反馈。
                    </p>
                  </div>
                  <div className="mt-[7px] flex flex-1 items-center">
                    <div className="h-px flex-1 border-t border-dashed border-accent/55" />
                    <span className="ml-px h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* 右侧：标题区 */}
          <div className="flex flex-col md:col-start-2">
            <Reveal y={10}>
              <div className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-faint">
                角色设计
              </div>
            </Reveal>

            <Reveal delay={0.04} y={10}>
              <h2 className="mt-4 text-[26px] font-semibold leading-[1.22] tracking-tight text-ink md:text-[32px] min-[1200px]:text-[36px]">
                我们把在在设计成一粒种子，
                <br />
                因为真正的陪伴，不该把人留在屏幕里。
              </h2>
            </Reveal>

            <Reveal delay={0.08} y={10}>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft md:text-[16px] min-[1200px]:text-[17px]">
                它不扮演医生，也不要求用户回应。只以稳定、低压力的方式在场，陪用户重新回到吃饭、睡觉、出门和与人相处。
              </p>
            </Reveal>
          </div>

          {/* 右侧：2×2 设计理由卡片，移动端置于形象之后单列显示 */}
          <div className="grid auto-rows-fr grid-cols-1 gap-3 md:col-start-2 md:grid-cols-2 md:gap-3 min-[1200px]:gap-4">
            {reasons.map((r, i) => (
              <Reveal key={r.title} delay={0.12 + i * 0.05} y={10}>
                <article className="flex h-full min-h-[168px] flex-col gap-2.5 rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(39,51,31,0.04)] md:min-h-[190px] md:p-5 min-[1200px]:min-h-[186px] min-[1200px]:p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                    <r.icon
                      className="h-[18px] w-[18px] text-accent"
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-[16px] font-semibold leading-snug tracking-tight text-ink md:text-[16px] min-[1200px]:text-[18px]">
                    {r.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-ink-soft md:text-[13px] min-[1200px]:text-[14px]">
                    {r.desc}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        {/* 底部价值总结：横跨主体宽度 */}
        <Reveal delay={0.32} y={10}>
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-accent-soft via-accent-soft/40 to-transparent md:mt-8 min-[1200px]:mt-8">
            <div className="flex items-center gap-4 px-6 py-6 md:gap-5 md:px-8 md:py-7 min-[1200px]:px-10">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70 md:h-11 md:w-11">
                <Sprout
                  className="h-5 w-5 text-accent"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </div>
              <p className="text-[20px] font-semibold leading-snug tracking-tight text-ink md:text-[24px] min-[1200px]:text-[28px]">
                在在不是情绪陪伴的终点，
                <br />
                而是重新参与生活的入口。
              </p>
              {/* 右侧弱化植物路径意象：明显弱于文字 */}
              <svg
                className="ml-auto hidden h-16 w-24 text-accent/25 md:block min-[1200px]:h-20 min-[1200px]:w-32"
                viewBox="0 0 144 96"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 86 C 36 74, 52 52, 72 56 S 110 30, 134 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="3 5"
                />
                <circle cx="134" cy="14" r="3" fill="currentColor" />
                <path
                  d="M72 56 q -7 -11 2 -18 M72 56 q 9 -9 16 -2"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
