import TolanGlyph from "./TolanGlyph";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/tolan-alien-best-friend/id6477549878";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Download", href: APP_STORE_URL },
      { label: "Watch the Trailer", href: "#trailer" },
      { label: "About", href: "#about" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Research", href: "#research" },
      { label: "Press", href: "#press" },
      { label: "Careers", href: "#careers" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Instagram", href: "https://www.tolans.com" },
      { label: "TikTok", href: "https://www.tolans.com" },
      { label: "X", href: "https://www.tolans.com" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <a href="#top" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-ink">
              <TolanGlyph className="h-4 w-4" tone="canvas" />
            </span>
            <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
              Tolan
            </span>
          </a>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-ink-soft">
            A friend who gets you. An embodied AI companion for the everyday
            moments that matter.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <div className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-faint">
              {col.title}
            </div>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                    className="text-[13.5px] text-ink-soft transition-colors hover:text-ink"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-[12.5px] text-ink-faint sm:flex-row">
          <span>© {new Date().getFullYear()} Tolan. A replication project.</span>
          <span>San Francisco, CA</span>
        </div>
      </div>
    </footer>
  );
}
