import { calculateAge, MOCK_USER_PROFILE } from "@/data/userProfile";
import ZaizaiVideo from "@/components/ZaizaiVideo";

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
  const { nickname, birthDate } = MOCK_USER_PROFILE.basicInfo;
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
          {nickname}，{age} 岁，重度抑郁重度焦虑。
        </h1>

        {/* 副标题 */}
        <p className="mt-4 text-center text-[21px] font-medium leading-[1.5] text-ink">
          她的一天，从起床就开始卡住。
        </p>

        {/* 内心句 */}
        <p className="mt-4 text-center text-[19px] leading-[1.6] text-ink-soft">
          “我知道该做什么，但我真的做不到。”
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

      {/* —— C. 认识在在 —— */}
      <section
        aria-label="认识在在"
        className="mt-10 border-t border-line-soft pt-8"
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
          {/* 在在动画：透明背景，96-128px */}
          <ZaizaiVideo
            className="h-24 w-24 shrink-0 sm:h-28 sm:w-28"
            shadow={false}
          />
          {/* 文字说明 */}
          <div className="flex-1 text-center sm:text-left">
            <p className="text-[12px] tracking-[0.18em] text-ink-faint">
              认识在在
            </p>
            <p className="mt-3 text-[16px] leading-[1.75] text-ink">
              在在，是「在呀 ZÀIYA」中持续在场的虚拟伙伴。它不会催促或评判，而是在起床、吃饭、学习、睡前等生活节点里，陪用户完成下一小步。
            </p>
          </div>
        </div>
      </section>

      {/* —— D. 观看提示区 —— */}
      <section
        aria-label="评委观看提示"
        className="mt-10 border-t border-line-soft pt-8"
      >
        <p className="text-[16px] leading-[1.7] text-ink">
          <span className="font-semibold">这是无数饱受精神心理问题困扰的青少年的缩影。</span>
        </p>
        <p className="mt-3 text-[16px] leading-[1.7] text-ink-soft">
          接下来，我们将通过小晨的故事，展示在呀 ZÀIYA 是如何帮助小晨开始好转。
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
