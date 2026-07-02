import { ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import TolanGlyph from "./TolanGlyph";

const CAREERS_URL = "https://www.tolans.com/careers";

export default function Hiring() {
  return (
    <section id="careers" className="border-t border-line">
      <div className="container py-20 md:py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-ink px-8 py-16 text-center md:px-16 md:py-24">
            <span className="mx-auto grid h-9 w-9 place-items-center rounded-md bg-canvas/10">
              <TolanGlyph className="h-5 w-5" tone="canvas" />
            </span>

            <div className="mt-6 text-[12px] font-medium uppercase tracking-[0.16em] text-canvas/50">
              We're Hiring
            </div>
            <h2 className="mx-auto mt-4 max-w-2xl text-[30px] leading-tight tracking-tight text-canvas md:text-[44px]">
              Build embodied AI that puts people first.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-canvas/60">
              Join a small team building together, in-person in San Francisco —
              across engineering, research, design, and more.
            </p>

            <a
              href={CAREERS_URL}
              target="_blank"
              rel="noreferrer"
              className="group mt-9 inline-flex items-center gap-2 rounded-md bg-canvas px-5 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90"
            >
              View open roles
              <ArrowUpRight className="h-4 w-4 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
