type Props = {
  onStart: () => void;
};

type ImpairmentPoint = {
  title: string;
  detail: string;
};

const impairmentPoints: ImpairmentPoint[] = [
  {
    title: "作息卡住",
    detail: "早上起不来，频繁请假。",
  },
  {
    title: "饮食卡住",
    detail: "饭点到了，但吃饭变少、没胃口。",
  },
  {
    title: "学习卡住",
    detail: "知道该写作业，但一打开就崩溃。",
  },
  {
    title: "关系卡住",
    detail: "家人越着急追问，她越说不清楚。",
  },
];

/* —— 小晨案例简报页 ——
 * 进入产品演示前的案例背景页，把"长段故事"重构为"案例简报"。
 * 让评委在 10 秒内建立判断：小晨不是普通心情不好，而是生活功能已经卡住。
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
          小晨，15 岁，高一
        </h1>

        {/* 副标题 */}
        <p className="mt-4 text-center text-[21px] font-medium leading-[1.5] text-ink">
          最近，她的一天开始变得很难启动。
        </p>

        {/* 内心句 */}
        <p className="mt-4 text-center text-[19px] leading-[1.6] text-ink-soft">
          “我知道我应该做，但我真的动不了。”
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
          <span className="font-semibold">接下来不是展示在呀 ZÀIYA 如何帮她治疗。</span>
        </p>
        <p className="mt-3 text-[16px] leading-[1.7] text-ink-soft">
          而是看在她状态很差、几乎没有力气主动记录的时候，在呀 ZÀIYA 如何在一天里的几个关键节点稳定在场、轻轻回应，并尽量不增加新的压力。
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
