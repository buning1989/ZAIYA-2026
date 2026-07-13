import { calculateAge, MOCK_USER_PROFILE } from "@/data/userProfile";

type Props = {
  onStart: () => void;
};

type ImpairmentPoint = {
  title: string;
  detail: string;
};

const impairmentPoints: ImpairmentPoint[] = [
  {
    title: "起不来床",
    detail: "早上起不来,频繁请假,无法正常上学。",
  },
  {
    title: "饮食失控",
    detail: "三餐不定时,有时吃不下,有时暴饮暴食。",
  },
  {
    title: "学业受阻",
    detail: "对成绩极度焦虑,学不进去,一开始学习就难受。",
  },
  {
    title: "家庭冲突",
    detail: "难以和父母正常交流,家人也越来越焦虑,经常争吵。",
  },
];

/* —— 小晨案例简报页 ——
 * 进入产品演示前的案例背景页，把"长段故事"重构为"案例简报"。
 * 让评委在 10 秒内建立判断：小晨不是普通心情不好，而是生活功能已经卡住。
 *
 * 人物身份（昵称 / 年龄 / 年级）统一从 MOCK_USER_PROFILE 读取，
 * 年龄由 calculateAge(birthDate) 推导，避免硬编码与数据源不一致。
 *
 * 三个视觉区域：
 *   A. 身份区：小标签 + 主标题 + 副标题 + 内心句
 *   B. 功能受损证据区：4 个短信息块（作息/饮食/学习/关系）
 *   C. 观看提示区：与故事视觉分区，建立演示预期 + 主按钮
 *
 * 不含手机 Demo，保持安静、克制的案例背景页风格。
 * Rive 形象此前已移除，采用单列居中结构。
 */
export default function XiaochenCaseIntro({ onStart }: Props) {
  const { nickname, birthDate, grade } = MOCK_USER_PROFILE.basicInfo;
  const age = calculateAge(birthDate);
  return (
    <div className="mx-auto w-full max-w-[680px]">
      {/* —— A. 身份区 —— */}
      <section aria-label="人物身份">
        {/* 小标签 */}
        <p className="text-center text-[12px] tracking-[0.18em] text-ink-faint">
          案例演示
        </p>

        {/* 主标题 */}
        <h1 className="mt-3 text-center text-[40px] font-bold leading-[1.2] text-ink">
          {nickname},{age} 岁,重度抑郁、重度焦虑
        </h1>

        {/* 副标题 */}
        <p className="mt-4 text-center text-[21px] font-medium leading-[1.5] text-ink">
          她的一天,从起床就开始卡住。
        </p>

        {/* 内心句 */}
        <p className="mt-4 text-center text-[19px] leading-[1.6] text-ink-soft">
          "我知道该做什么,但我真的做不到。"
        </p>
      </section>

      {/* —— B. 功能受损证据区 —— */}
      <section
        aria-label="功能受损证据点"
        className="mt-10"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {impairmentPoints.map((point) => (
            <div
              key={point.title}
              className="rounded-2xl border border-line-soft bg-card-soft/60 px-5 py-4"
            >
              <p className="text-[16px] font-semibold leading-[1.4] text-ink">
                {point.title}
              </p>
              <p className="mt-1.5 text-[14px] leading-[1.6] text-ink-soft">
                {point.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* —— C. 观看提示区 —— */}
      <section
        aria-label="评委观看提示"
        className="mt-10 border-t border-line-soft pt-8"
      >
        <p className="text-[16px] leading-[1.7] text-ink">
          <span className="font-semibold">在呀不替小晨治疗。</span>
        </p>
        <p className="mt-3 text-[16px] leading-[1.7] text-ink-soft">
          接下来,通过她刚开始使用的一天和两周后的一天,看支持如何从崩溃之后,慢慢前移到失控之前。
        </p>

        {/* 主按钮 */}
        <div className="mt-8 flex flex-col items-center">
          <button
            onClick={onStart}
            className="inline-flex h-12 w-full max-w-[280px] items-center justify-center rounded-full bg-action-primary px-6 text-[15px] font-medium text-action-primary-text transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
          >
            开始看小晨第一天
          </button>
        </div>
      </section>
    </div>
  );
}
