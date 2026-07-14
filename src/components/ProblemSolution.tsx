import Reveal from "./Reveal";

type StatCard = {
  label: string;
  value: string;
  unit?: string;
  meaning: string;
  explanation: string;
};

const stats: StatCard[] = [
  {
    label: "问题并不少见",
    value: "17.5",
    unit: "%",
    meaning: "约每 6 名中小学生，就有 1 名患有至少一种精神障碍",
    explanation: "中国 6—16 岁在校学生精神障碍总患病率为 17.5%。",
  },
  {
    label: "专业支持仍然有限",
    value: "不足 20",
    unit: "%",
    meaning: "有精神心理问题的青少年，实际就诊率不足 20%",
    explanation: "多数困扰尚未进入持续、专业的支持体系。",
  },
  {
    label: "更多时间发生在日常",
    value: "约 8700",
    unit: "小时",
    meaning: "即使每周获得 1 小时专业支持，一年绝大多数时间仍要回到真实生活",
    explanation: "吃饭、睡觉、上学、社交和家庭相处，都发生在这些时间里。",
  },
];

function StatCardView({ stat, delay }: { stat: StatCard; delay: number }) {
  return (
    <Reveal delay={delay}>
      <div className="flex h-full flex-col rounded-lg border border-line px-6 py-7 md:px-7 md:py-8">
        <span className="text-[12px] font-medium tracking-wide text-ink-soft">
          {stat.label}
        </span>

        <div className="mt-4 flex items-baseline gap-0.5">
          <span className="text-[48px] font-semibold leading-none tracking-tightest text-ink md:text-[56px]">
            {stat.value}
          </span>
          {stat.unit && (
            <span className="text-[20px] font-medium leading-none tracking-tight text-ink md:text-[24px]">
              {stat.unit}
            </span>
          )}
        </div>

        <p className="mt-4 text-[15px] leading-relaxed text-ink md:text-[16px]">
          {stat.meaning}
        </p>

        <p className="mt-3 text-[13px] leading-relaxed text-ink-soft md:text-[14px]">
          {stat.explanation}
        </p>
      </div>
    </Reveal>
  );
}

export default function ProblemSolution() {
  return (
    <section id="problem" className="border-t border-line">
      <div className="container py-20 md:py-32">
        {/* 模块标签 */}
        <Reveal>
          <div className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-faint">
            需求与缺口
          </div>
        </Reveal>

        {/* 主标题：根据页面宽度自然换行，不强制断行 */}
        <Reveal delay={0.04}>
          <h2 className="mt-4 max-w-2xl text-[30px] leading-tight tracking-tight text-ink md:text-[40px]">
            因精神心理困扰而导致社会功能受损的人群，真正困难的，是专业支持之外的日常。
          </h2>
        </Reveal>

        {/* 副标题 */}
        <Reveal delay={0.08}>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-soft md:text-[19px]">
            精神心理困扰影响的不只是情绪，还可能让睡眠、饮食、上学、社交和家庭生活逐渐失去秩序。
          </p>
        </Reveal>

        {/* 三张数据卡：桌面端三列等宽，移动端单列 */}
        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {stats.map((stat, i) => (
            <StatCardView key={stat.label} stat={stat} delay={0.12 + i * 0.06} />
          ))}
        </div>

        {/* 收束区域：低强调度，沿用浅绿色背景 */}
        <Reveal delay={0.36}>
          <div className="mt-10 rounded-lg bg-accent-soft px-6 py-8 md:px-8 md:py-10">
            <p className="max-w-2xl text-[18px] leading-relaxed text-ink md:text-[20px]">
              在呀不替代诊断和治疗，而是让专业支持难以覆盖的日常，也能被看见和管理。
            </p>
          </div>
        </Reveal>

        {/* 数据来源 */}
        <Reveal delay={0.44}>
          <p className="mt-8 text-[11px] leading-relaxed text-ink-faint">
            数据来源：中国 6—16 岁儿童青少年精神障碍流行病学调查及相关青少年精神心理健康研究资料；8700 小时按每周 1 小时专业支持估算。
          </p>
        </Reveal>
      </div>
    </section>
  );
}
