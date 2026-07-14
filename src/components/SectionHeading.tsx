import type { ReactNode } from "react";
import Reveal from "./Reveal";
import SectionEyebrow from "./SectionEyebrow";

type Props = {
  /** 章节序号，1 起始 */
  index: number;
  /** 模块名称，例如 "需求与缺口" */
  name: string;
  title: ReactNode;
  className?: string;
};

export default function SectionHeading({ index, name, title, className }: Props) {
  return (
    <Reveal className={className}>
      <SectionEyebrow index={index} name={name} />
      <h2 className="mt-5 text-[26px] leading-tight tracking-tight text-ink md:mt-6 md:text-[32px]">
        {title}
      </h2>
    </Reveal>
  );
}
