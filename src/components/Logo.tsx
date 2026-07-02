type Props = {
  className?: string;
  showWordmark?: boolean;
};

/** 在呀 wordmark —— 一个简单的圆形标记 + 文字。 */
export default function Logo({ className, showWordmark = true }: Props) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" aria-hidden="true">
        <circle cx="16" cy="16" r="12" fill="#18181B" />
      </svg>
      {showWordmark && (
        <span className="font-display text-[18px] font-semibold tracking-tight text-ink">
          在呀 <span className="text-ink-faint">ZÀIYA</span>
        </span>
      )}
    </span>
  );
}
