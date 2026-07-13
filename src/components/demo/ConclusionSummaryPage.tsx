import { conclusionContent } from "./scenarios/conclusionSummary";

type Props = {
  onBack: () => void;
};

/* —— 结尾总结页 ——
 * 在完整案例结束后增加总结区块。
 * 突出产品定位：帮助生活功能逐渐恢复，而不是停留在情绪陪伴。
 *
 * 结构：
 *   A. 主标题
 *   B. 两段正文
 *   C. 收束文案
 *   D. 终句
 *   E. 返回按钮
 */
export default function ConclusionSummaryPage({ onBack }: Props) {
  return (
    <div className="mx-auto w-full max-w-[680px]">
      {/* —— A. 主标题 —— */}
      <section aria-label="总结标题">
        <h1 className="text-center text-[36px] font-bold leading-[1.25] text-ink">
          {conclusionContent.title}
        </h1>
      </section>

      {/* —— B. 两段正文 —— */}
      <section aria-label="总结正文" className="mt-8">
        <div className="space-y-5">
          {conclusionContent.paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="text-[17px] leading-[1.8] text-ink-soft"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* —— C. 收束文案 —— */}
      <section
        aria-label="收束文案"
        className="mt-10 border-t border-line-soft pt-8"
      >
        <p className="text-[16px] leading-[1.8] text-ink">
          {conclusionContent.closing}
        </p>
      </section>

      {/* —— D. 终句 —— */}
      <section aria-label="终句" className="mt-8">
        <p className="text-center text-[24px] font-semibold leading-[1.4] text-ink">
          {conclusionContent.finalLine}
        </p>
      </section>

      {/* —— E. 返回按钮 —— */}
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
