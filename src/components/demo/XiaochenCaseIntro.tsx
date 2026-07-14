import { calculateAge } from "@/data/userProfile";
import { DEMO_USER_PROFILE } from "@/apps/demo/data/demoUser";

type ImpairmentPoint = {
  title: string;
  detail: string;
};

const impairmentPoints: ImpairmentPoint[] = [
  {
    title: "起不来床",
    detail: "早上起不来床，频繁请假，无法正常上学。",
  },
  {
    title: "饮食失控",
    detail: "三餐不定时，有时吃不下，有时暴饮暴食。",
  },
  {
    title: "学业受阻",
    detail: "对成绩极其焦虑，学不进去，一开始学习就难受。",
  },
  {
    title: "家庭冲突",
    detail: "难以和父母正常交流，家人也越来越焦虑，经常争吵。",
  },
];

/* —— 小晨案例简报页 ——
 * 演示序列第 0 页。不再包含「开始看小晨第一天」按钮。
 * 评委通过右箭头或键盘 → 进入第一天第一个节点。
 *
 * 三个视觉区域：
 *   A. 身份区：小标签 + 主标题 + 副标题 + 内心句
 *   B. 功能受损证据区：4 个短信息块（作息/饮食/学习/关系）
 *   C. 观看提示区：案例说明
 */
export default function XiaochenCaseIntro() {
  const { nickname, birthDate } = DEMO_USER_PROFILE.basicInfo;
  const age = calculateAge(birthDate);
  return (
    <div className="mx-auto w-[min(680px,calc(100vw-48px))] max-w-[680px]">
      {/* —— A. 身份区 —— */}
      <section aria-label="人物身份">
        {/* 小标签 */}
        <p className="text-center text-[13px] leading-5 font-medium tracking-[0.18em] text-[var(--text-muted)]">
          案例演示
        </p>

        {/* 主标题 */}
        <h1 className="mt-3 text-center text-[30px] font-[650] leading-[1.3] text-[var(--text-primary)]">
          {nickname}，{age} 岁，重度抑郁重度焦虑。
        </h1>

        {/* 副标题 */}
        <p className="mt-3 text-center text-[17px] font-medium leading-[1.6] text-[var(--text-primary)]">
          她的一天，从起床就开始卡住。
        </p>

        {/* 内心句 */}
        <p className="mt-2 text-center text-[16px] font-normal leading-[1.65] text-[var(--text-secondary)]">
          “我知道该做什么，但我真的做不到。”
        </p>
      </section>

      {/* —— B. 功能受损证据区 —— */}
      <section
        aria-label="功能受损证据点"
        className="mt-7"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3">
          {impairmentPoints.map((point) => (
            <div
              key={point.title}
              className="rounded-xl border border-[#E5E8E1] bg-white px-[18px] py-4"
            >
              <p className="text-[16px] font-semibold leading-6 text-[var(--text-primary)]">
                {point.title}
              </p>
              <p className="mt-1.5 text-[15px] font-normal leading-[1.65] text-[var(--text-secondary)]">
                {point.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* —— C. 观看提示区 —— */}
      <section
        aria-label="评委观看提示"
        className="mt-7 border-t border-line-soft pt-6"
      >
        <p className="text-[16px] font-semibold leading-[1.6] text-[var(--text-primary)]">
          这是无数饱受精神心理问题困扰的青少年的缩影。
        </p>
        <p className="mt-3 text-[15px] font-normal leading-[1.7] text-[var(--text-secondary)]">
          接下来，我们将通过小晨的故事，展示在呀 ZÀIYA 是如何帮助小晨开始好转。
        </p>
      </section>
    </div>
  );
}
