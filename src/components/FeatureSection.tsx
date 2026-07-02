import { ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import type { Link } from "@/data/content";

type Props = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  links: Link[];
};

export default function FeatureSection({ id, eyebrow, title, body, links }: Props) {
  return (
    <section id={id} className="border-t border-line">
      <div className="container grid gap-14 py-20 md:grid-cols-[1fr_1.1fr] md:py-28">
        <div>
          <SectionHeading eyebrow={eyebrow} title={title} />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink-soft">
              {body}
            </p>
          </Reveal>
        </div>

        <div className="flex flex-col md:pt-16">
          {links.map((l, i) => (
            <Reveal key={l.url} delay={0.1 + i * 0.06}>
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between gap-4 border-t border-line py-6 transition-colors first:border-t-0 hover:bg-line-soft/40"
              >
                <span className="px-1">
                  <span className="block font-display text-[17px] font-medium leading-snug tracking-tight text-ink md:text-lg">
                    {l.title}
                  </span>
                  <span className="mt-1 block text-[13px] text-ink-faint">
                    {l.source}
                  </span>
                </span>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
