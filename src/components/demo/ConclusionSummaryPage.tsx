import { conclusionContent } from "./scenarios/conclusionSummary";

type Props = {
  onBack: () => void;
};

/* —— 两天整体大总结页 ——
 * 完整替换原压缩改写版。
 * 突出四方价值、GPM 核心和"桥"的定位。
 *
 * 结构：
 *   A. 第一部分：痛苦中的人最怕的
 *   B. 第二部分：四方看到的碎片
 *   C. 第三部分：在呀做的
 *   D. 四方价值卡片：医生 / 咨询师 / 学校 / 家长
 *   E. GPM 说明
 *   F. 最终收束
 *   G. 终句
 *   H. 返回按钮
 *
 * 所有可见文字保持 Word 文档原文。
 */
export default function ConclusionSummaryPage({ onBack }: Props) {
  return (
    <div className="mx-auto w-full max-w-[680px]">
      {/* —— A. 第一部分 —— */}
      <section aria-label="总结第一部分">
        {conclusionContent.part1.map((line, index) => (
          <p
            key={index}
            className={
              index === 0
                ? "text-[24px] font-semibold leading-[1.5] text-ink"
                : "mt-3 text-[20px] leading-[1.6] text-ink-soft"
            }
          >
            {line}
          </p>
        ))}
      </section>

      {/* —— B. 第二部分 —— */}
      <section aria-label="总结第二部分" className="mt-8">
        {conclusionContent.part2.map((line, index) => {
          const isLast = index === conclusionContent.part2.length - 1;
          return (
            <p
              key={index}
              className={
                isLast
                  ? "mt-4 text-[17px] font-medium leading-[1.7] text-ink"
                  : "text-[17px] leading-[1.8] text-ink-soft"
              }
            >
              {line}
            </p>
          );
        })}
      </section>

      {/* —— C. 第三部分 —— */}
      <section
        aria-label="总结第三部分"
        className="mt-8 border-t border-line-soft pt-8"
      >
        {conclusionContent.part3.split("\n").map((line, index) => (
          <p
            key={index}
            className={
              index === 0
                ? "text-[18px] font-semibold leading-[1.6] text-ink"
                : "mt-2 text-[16px] leading-[1.7] text-ink-soft"
            }
          >
            {line}
          </p>
        ))}
      </section>

      {/* —— D. 四方价值卡片 —— */}
      <section aria-label="四方价值" className="mt-10">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {conclusionContent.stakeholderValues.map((value) => (
            <div
              key={value.target}
              className="rounded-2xl border border-line-soft bg-card-soft/60 px-5 py-4"
            >
              <p className="text-[16px] font-semibold leading-[1.4] text-ink">
                {value.target}
              </p>
              <p className="mt-1.5 text-[14px] leading-[1.6] text-ink-soft">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* —— E. GPM 说明 —— */}
      <section
        aria-label="GPM 说明"
        className="mt-10 rounded-2xl border border-line-soft bg-card-soft/40 px-6 py-6"
      >
        {conclusionContent.gpm.map((line, index) => {
          const isFirst = index === 0;
          const isSecond = index === 1;
          return (
            <p
              key={index}
              className={
                isFirst
                  ? "text-[16px] font-semibold leading-[1.6] text-ink"
                  : isSecond
                    ? "mt-2 text-[15px] leading-[1.7] text-ink-soft"
                    : "mt-2 text-[15px] leading-[1.7] text-ink"
              }
            >
              {line}
            </p>
          );
        })}
      </section>

      {/* —— F. 最终收束 —— */}
      <section
        aria-label="最终收束"
        className="mt-10 border-t border-line-soft pt-8"
      >
        {conclusionContent.finalClosing.map((line, index) => (
          <p
            key={index}
            className={
              index === 1
                ? "text-[17px] font-medium leading-[1.8] text-ink"
                : "text-[16px] leading-[1.8] text-ink-soft"
            }
          >
            {line}
          </p>
        ))}
      </section>

      {/* —— G. 终句 —— */}
      <section aria-label="终句" className="mt-8">
        <p className="text-center text-[26px] font-semibold leading-[1.4] text-ink">
          {conclusionContent.finalLine}
        </p>
      </section>

      {/* —— H. 返回按钮 —— */}
      <section
        aria-label="返回按钮"
        className="mt-12 flex flex-col items-center gap-3"
      >
        <button
          onClick={onBack}
          className="inline-flex h-9 items-center rounded-full px-4 text-[13px] text-ink-faint transition-colors hover:text-ink-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
        >
          ← 回到复诊整理
        </button>
      </section>
    </div>
  );
}
