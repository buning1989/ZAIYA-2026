type Props = {
  /** 章节序号，1 起始 */
  index: number;
  /** 模块名称，例如 "现实缺口" */
  name: string;
  className?: string;
};

/**
 * 一级章节统一的章节眉标。
 *
 * 结构：章节编号 + 章节名称。
 */
export default function SectionEyebrow({
  index,
  name,
  className = "",
}: Props) {
  const indexLabel = String(index).padStart(2, "0");

  return (
    <div className={`section-eyebrow section-eyebrow--primary ${className}`}>
      <span className="section-progress">{indexLabel}</span>
      <span className="section-name-badge">{name}</span>
    </div>
  );
}
