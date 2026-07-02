import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useRive } from "@rive-app/react-canvas";
import { navLinks } from "@/data/content";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/tolan-alien-best-friend/id6477549878";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const { RiveComponent: LogoRive } = useRive({
    src: "/lil_guy.riv",
    stateMachines: "State Machine 1",
    autoplay: true,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-canvas/80 backdrop-blur border-b border-line"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="container flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-3">
          <span className="h-[280px] w-[280px] overflow-hidden rounded-md">
            <LogoRive className="h-full w-full" />
          </span>
          <span className="font-display text-[48px] font-semibold tracking-tight text-ink">
            在呀 ZÀIYA
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13.5px] text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-2 text-[13px] font-medium text-canvas transition-opacity hover:opacity-90"
          >
            Download
            <ArrowUpRight className="h-3.5 w-3.5 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
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
        <div className="border-t border-line bg-canvas md:hidden">
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
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-md bg-ink px-3.5 py-2.5 text-sm font-medium text-canvas"
            >
              Download on the App Store
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
