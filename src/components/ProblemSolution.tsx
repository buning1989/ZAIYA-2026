import Reveal from "./Reveal";

type StatCard = {
  label: string;
  value: string;
  suffix?: string;
  meaning: string;
};

const stats: StatCard[] = [
  {
    label: "问题并不少见",
    value: "17.5",
    suffix: "%",
    meaning: "约每 6 名中小学生，就有 1 人受精神障碍困扰。",
  },
  {
    label: "专业支持仍然有限",
    value: "20",
    suffix: "%",
    meaning: "多数孩子的困扰，还没进入持续、专业的支持。",
  },
  {
    label: "更多时间发生在日常",
    value: "8700",
    suffix: "小时",
    meaning:
      "即使每周有 1 小时专业支持，一年里绝大多数时间，仍要自己度过。",
  },
];

function StatCardView({ stat, delay }: { stat: StatCard; delay: number }) {
  return (
    <Reveal delay={delay}>
      <div className="flex h-full flex-col rounded-xl border border-line bg-white px-6 py-6 md:px-7 md:py-7">
        <span className="text-[12px] font-medium tracking-wide text-ink-faint">
          {stat.label}
        </span>

        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-[40px] font-semibold leading-none tracking-tightest text-ink md:text-[48px]">
            {stat.value}
          </span>
          {stat.suffix && (
            <span className="text-[20px] font-semibold leading-none tracking-tight text-ink md:text-[24px]">
              {stat.suffix}
            </span>
          )}
        </div>

        <p className="mt-4 text-[14px] leading-relaxed text-ink md:text-[15px]">
          {stat.meaning}
        </p>
      </div>
    </Reveal>
  );
}

export default function ProblemSolution() {
  return (
    <section id="problem" className="border-t border-line">
      <div className="container pt-12 pb-10 md:pt-16 md:pb-12">
        <Reveal>
          <div className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-faint">
            需求与缺口
          </div>
        </Reveal>

        <Reveal delay={0.04}>
          <h2 className="mt-4 max-w-2xl text-[30px] leading-tight tracking-tight text-ink md:text-[40px]">
            真正的难题，在诊室之外。
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mt-3 text-[17px] leading-relaxed text-ink-soft md:text-[19px]">
            精神心理困扰影响的不只是情绪——睡眠、饮食、上学、社交、家庭，都会慢慢失序。
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {stats.map((stat, i) => (
            <StatCardView key={stat.label} stat={stat} delay={0.12 + i * 0.06} />
          ))}
        </div>

        <Reveal delay={0.34}>
          <p className="mt-4 text-[11px] leading-relaxed text-ink-faint md:mt-5">
            数据来源：中国 6—16 岁儿童青少年精神障碍流行病学调查；就诊率、8700
            小时为相关研究与测算（按每周 1 小时专业支持估算）。
          </p>
        </Reveal>
      </div>
    </section>
  );
}
