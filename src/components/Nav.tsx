import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { navLinks } from "@/data/content";
import Logo from "./Logo";

type Props = {
  onOpenDemo: () => void;
};

export default function Nav({ onOpenDemo }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "pointer-events-auto translate-y-0 border-b border-line bg-white/88 opacity-100 shadow-[0_1px_18px_-12px_rgba(0,0,0,0.35)] backdrop-blur"
          : "pointer-events-none -translate-y-3 border-b border-transparent bg-transparent opacity-0"
      }`}
    >
      <nav className="container flex h-20 items-center justify-between">
        <a href="#top" className="flex items-center">
          <Logo size="nav" />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13.5px] font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <button
            onClick={onOpenDemo}
            className="group inline-flex items-center gap-1.5 rounded-md bg-[#E6F46B] px-3.5 py-2 text-[13px] font-medium text-black"
          >
            体验 Demo
            <ArrowUpRight className="h-3.5 w-3.5 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-md text-ink md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-white md:hidden">
          <div className="container flex flex-col gap-1 py-4">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm text-ink-soft hover:bg-line-soft hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                onOpenDemo();
              }}
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-md bg-[#E6F46B] px-3.5 py-2.5 text-sm font-medium text-black"
            >
              体验 Demo
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
