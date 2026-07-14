import Reveal from "./Reveal";
import SubsectionEyebrow from "./SubsectionEyebrow";
import ZaizaiVideo from "./ZaizaiVideo";

/** 右侧四项设计理由：标题 + 一句解释。 */
const reasons = [
  {
    title: "一粒种子，而不是一张固定的脸",
    desc: "不定义此刻状态，只留继续生长的可能。",
  },
  {
    title: "不像人，也不像宠物",
    desc: '不扮演医生、老师或家人，不制造"懂你"的错觉。',
  },
  {
    title: "没有嘴，不要求你回应",
    desc: "不索取关注，用动作和小芽表达自己。",
  },
  {
    title: "住在屏幕里，却始终指向屏幕外",
    desc: "会吃饭、休息、看书、出门，陪你回到真实生活。",
  },
];

type CharacterNoteProps = {
  title: string;
  desc: string;
  side: "left" | "right";
  className: string;
};

function CharacterNote({ title, desc, side, className }: CharacterNoteProps) {
  const copy = (
    <div className="w-[118px] min-[1200px]:w-[136px]">
      <div className="text-[13px] font-semibold leading-none text-accent">
        {title}
      </div>
      <p className="mt-2 hidden text-[12px] leading-snug text-ink-soft min-[1200px]:block">
        {desc}
      </p>
    </div>
  );
  const leftConnector = (
    <div className="mt-[6px] flex w-10 items-center min-[1200px]:w-12">
      <div className="h-px flex-1 border-t border-dashed border-accent/55" />
      <span className="ml-px h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
    </div>
  );
  const rightConnector = (
    <div className="mt-[6px] flex w-12 items-center min-[1200px]:w-14">
      <span className="mr-px h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
      <div className="h-px flex-1 border-t border-dashed border-accent/55" />
    </div>
  );

  return (
    <div className={`absolute hidden md:block ${className}`}>
      <div className="flex items-start gap-2.5">
        {side === "left" ? (
          <>
            {copy}
            {leftConnector}
          </>
        ) : (
          <>
            {rightConnector}
            {copy}
          </>
        )}
      </div>
    </div>
  );
}

export default function CharacterDesign() {
  return (
    <section id="solution-character" className="relative scroll-mt-24">
      <span id="character" className="pointer-events-none absolute -top-20 h-px w-px" aria-hidden="true" />
      <div className="container pt-12 pb-20 md:pt-12 md:pb-24 min-[1200px]:pt-12 min-[1200px]:pb-24">
        <div className="h-px w-full bg-line-soft" aria-hidden="true" />
        <div className="mt-7 grid grid-cols-1 gap-10 md:mt-8 md:grid-cols-[0.36fr_0.64fr] md:gap-8 min-[1200px]:grid-cols-[0.4fr_0.6fr] min-[1200px]:gap-8 min-[1200px]:items-stretch">
          {/* 左侧：在在角色视觉区 + 三个轻量虚线标注 */}
          <Reveal y={10} className="md:col-start-1 md:row-span-2">
            <div className="relative mx-auto flex min-h-[320px] w-full max-w-[420px] items-center justify-center pb-4 md:h-full md:min-h-[428px] md:max-w-[456px] md:translate-y-8 md:pb-3 min-[1200px]:translate-y-12">
              <ZaizaiVideo className="h-64 w-64 md:h-[19rem] md:w-[19rem] min-[1200px]:h-[20.5rem] min-[1200px]:w-[20.5rem]" />

              <CharacterNote
                title="种子形态"
                desc="承载，而不是治愈承诺"
                side="left"
                className="left-[4%] top-[13%] min-[1200px]:left-[8%] min-[1200px]:top-[12%]"
              />

              <CharacterNote
                title="低位目光"
                desc="不凝视，也不审视"
                side="right"
                className="right-[-8%] top-[38%] min-[1200px]:right-[-7%] min-[1200px]:top-[39%]"
              />

              <CharacterNote
                title="低重心"
                desc="动作缓慢，传递安定"
                side="left"
                className="left-[4%] top-[66%] min-[1200px]:left-[8%] min-[1200px]:top-[65%]"
              />
            </div>
          </Reveal>

          {/* 右侧：标题区 */}
          <div className="flex flex-col md:col-start-2">
            <Reveal y={10}>
              <SubsectionEyebrow index="03.3" name="角色设计" />
            </Reveal>

            <Reveal delay={0.04} y={10}>
              <h2 className="mt-5 text-[26px] font-semibold leading-[1.22] tracking-tight text-ink md:mt-6 md:text-[32px]">
                我们把在在设计成一粒种子：陪你长大，也把你带回屏幕外。
              </h2>
            </Reveal>

          </div>

          {/* 右侧：2×2 设计理由卡片，移动端置于形象之后单列显示 */}
          <div className="grid auto-rows-fr grid-cols-1 gap-3 md:col-start-2 md:grid-cols-2 md:gap-3 min-[1200px]:gap-4">
            {reasons.map((r, i) => (
              <Reveal key={r.title} delay={0.12 + i * 0.05} y={10}>
                <article className="flex h-full min-h-[118px] flex-col gap-2 rounded-xl border border-line bg-white p-3 shadow-[0_1px_2px_rgba(39,51,31,0.04)] md:min-h-[133px] md:p-4 min-[1200px]:min-h-[130px] min-[1200px]:p-4">
                  <h3 className="text-[16px] font-semibold leading-snug tracking-tight text-ink md:text-[17px]">
                    {r.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-ink-soft md:text-[14px]">
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
