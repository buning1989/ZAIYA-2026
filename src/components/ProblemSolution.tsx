import { Frown, Clock, TrendingUp, Users, Eye, Heart } from "lucide-react";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import type { ElementType } from "react";

type StatCard = {
  icon: ElementType;
  label: string;
  value: string;
  unit?: string;
  lines: string[];
};

const stats: StatCard[] = [
  {
    icon: Frown,
    label: "被忽视的痛",
    value: "92",
    unit: "%",
    lines: ["精神障碍青少年", "从未接受过任何治疗"],
  },
  {
    icon: Clock,
    label: "真正发生问题的地方",
    value: "8700",
    unit: "小时",
    lines: ["每年发生在诊室之外", "却几乎没人知道"],
  },
  {
    icon: TrendingUp,
    label: "家庭正在加速求助",
    value: "近 3",
    unit: "倍",
    lines: ["五年间", "主动为孩子购买心理服务的家庭增长"],
  },
  {
    icon: Users,
    label: "沉默的一亿人",
    value: "1.5",
    unit: "亿+",
    lines: ["正在被精神心理困扰", "影响日常生活的人"],
  },
  {
    icon: Eye,
    label: "真正被看见的时间",
    value: "不到 2",
    unit: "小时",
    lines: ["即使开始治疗", "一年真正被专业人士看见的时间"],
  },
];

function StatCardView({ stat, delay }: { stat: StatCard; delay: number }) {
  const Icon = stat.icon;
  return (
    <Reveal delay={delay}>
      <div className="flex h-full flex-col border border-line rounded-lg px-6 py-7 md:px-7 md:py-8">
        <div className="flex items-center gap-2 text-ink-soft">
          <Icon size={16} strokeWidth={1.5} />
          <span className="text-[12px] font-medium tracking-wide">
            {stat.label}
          </span>
        </div>

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

        <div className="mt-4 space-y-0.5">
          {stat.lines.map((line) => (
            <p key={line} className="text-[14px] leading-relaxed text-ink-soft">
              {line}
            </p>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

export default function ProblemSolution() {
  return (
    <section id="problem" className="border-t border-line">
      <div className="container py-20 md:py-32">
        <SectionHeading
          eyebrow="需求与缺口"
          title="真正把人拖垮的，不只是在诊室里。"
        />
        <Reveal delay={0.08}>
          <p className="mt-4 max-w-2xl text-[18px] leading-relaxed text-ink-soft md:text-[20px]">
            更多时候，是诊室外那 8700 小时，没人知道发生了什么。
          </p>
        </Reveal>

        {/* 数据卡片网格 */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {stats.map((stat, i) => (
            <StatCardView
              key={stat.label}
              stat={stat}
              delay={0.12 + i * 0.06}
            />
          ))}

          {/* 在呀在做的事 —— 叙事卡片 */}
          <Reveal delay={0.12 + stats.length * 0.06}>
            <div className="flex h-full flex-col border border-line rounded-lg bg-canvas px-6 py-7 md:px-7 md:py-8">
              <div className="flex items-center gap-2 text-ink-soft">
                <Heart size={16} strokeWidth={1.5} />
                <span className="text-[12px] font-medium tracking-wide">
                  在呀在做的事
                </span>
              </div>

              <p className="mt-4 text-[22px] font-semibold leading-snug tracking-tight text-ink md:text-[24px]">
                不是打卡，不是树洞。
              </p>

              <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">
                在呀把那 8700 小时里发生的一切，
                <br />
                变成家长、医生、老师、
                <br />
                咨询师都看得懂的信息。
              </p>
            </div>
          </Reveal>
        </div>

        {/* 数据来源脚注 */}
        <Reveal delay={0.6}>
          <p className="mt-8 text-[11px] leading-relaxed text-ink-faint">
            数据来源：WHO、北大六院《中国精神卫生调查》、中科院心理所《国民心理健康发展报告（2021—2023）》、行业公开报告及文献整理
          </p>
        </Reveal>
      </div>
    </section>
  );
}
