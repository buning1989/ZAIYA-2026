import type { ReactNode } from "react";
import Reveal from "./Reveal";

type Props = {
  eyebrow: string;
  title: ReactNode;
  className?: string;
};

export default function SectionHeading({ eyebrow, title, className }: Props) {
  return (
    <Reveal className={className}>
      <div className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-faint">
        {eyebrow}
      </div>
      <h2 className="mt-4 text-[26px] leading-tight tracking-tight text-ink md:text-[32px]">
        {title}
      </h2>
    </Reveal>
  );
}
