type Props = {
  index: string;
  name: string;
  className?: string;
};

export default function SubsectionEyebrow({
  index,
  name,
  className = "",
}: Props) {
  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className="shrink-0 whitespace-nowrap text-[13px] font-medium tracking-[0.08em] text-ink-faint md:text-[14px]">
        {index}
      </span>
      <span className="shrink-0 whitespace-nowrap text-[14px] font-semibold tracking-tight text-ink md:text-[15px]">
        {name}
      </span>
    </div>
  );
}
