type Props = {
  /** 章节序号，1 起始 */
  index: number;
  /** 总章节数，默认 5 */
  total?: number;
  /** 模块名称，例如 "需求与缺口" */
  name: string;
  className?: string;
};

/**
 * 一级章节统一的章节眉标。
 *
 * 结构：章节编号 ── 短横线 ── 章节名称
 *
 * 视觉层级：
 * - 章节编号：12–13px / 500 字重 / 低对比度辅助文字色（ink-faint）
 * - 短横线：32–48px 宽 / 1px 高 / 浅绿描边色（line）
 * - 章节名称：15–16px / 600 字重 / 深绿正文色（ink）
 *
 * 明显高于二级子章节标识，但仍低于模块主标题（26–32px）。
 */
export default function SectionEyebrow({
  index,
  total = 5,
  name,
  className = "",
}: Props) {
  const indexLabel = `${String(index).padStart(2, "0")} / ${String(
    total,
  ).padStart(2, "0")}`;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="shrink-0 whitespace-nowrap text-[12px] font-medium tracking-[0.14em] text-ink-faint md:text-[13px]">
        {indexLabel}
      </span>
      <span
        className="h-px w-8 shrink-0 bg-line md:w-12"
        aria-hidden="true"
      />
      <span className="shrink-0 whitespace-nowrap text-[15px] font-semibold tracking-tight text-ink md:text-[16px]">
        {name}
      </span>
    </div>
  );
}
