type Props = {
  className?: string;
  /** color of the mark body */
  tone?: "ink" | "canvas";
};

/** Minimal geometric alien mark — a rounded head with two eyes. */
export default function TolanGlyph({ className, tone = "canvas" }: Props) {
  const body = tone === "ink" ? "#18181B" : "#FAFAF9";
  const eyes = tone === "ink" ? "#FAFAF9" : "#18181B";
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 5c-4.4 0-8 3.4-8 7.7 0 4.1 2.6 7.5 6.2 8.6.6.2 1 .2 1.8 0 3.6-1.1 6.2-4.5 6.2-8.6C24 8.4 20.4 5 16 5Z"
        fill={body}
      />
      <circle cx="13.2" cy="12.6" r="1.4" fill={eyes} />
      <circle cx="18.8" cy="12.6" r="1.4" fill={eyes} />
    </svg>
  );
}
