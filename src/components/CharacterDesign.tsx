import Reveal from "./Reveal";
import ZaizaiVideo from "./ZaizaiVideo";

/** 右侧四项设计理由：标题 + 一句解释。 */
const reasons = [
  {
    title: "一粒种子，而不是一张固定的脸",
    desc: "它不定义用户此刻应该是什么状态，只保留继续生长的可能。",
  },
  {
    title: "不像人，也不像宠物",
    desc: '不扮演医生、老师或家人，也不过度制造"只有它懂我"的关系感。',
  },
  {
    title: "没有嘴，不要求你回应",
    desc: "不急着说话，也不索取关注，用动作、目光和小芽表达状态。",
  },
  {
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

          </div>

          {/* 右侧：2×2 设计理由卡片，移动端置于形象之后单列显示 */}
          <div className="grid auto-rows-fr grid-cols-1 gap-3 md:col-start-2 md:grid-cols-2 md:gap-3 min-[1200px]:gap-4">
            {reasons.map((r, i) => (
              <Reveal key={r.title} delay={0.12 + i * 0.05} y={10}>
                <article className="flex h-full min-h-[168px] flex-col gap-2.5 rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(39,51,31,0.04)] md:min-h-[190px] md:p-5 min-[1200px]:min-h-[186px] min-[1200px]:p-5">
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
      </div>
    </section>
  );
}
