import Logo from "./Logo";

const columns = [
  {
    title: "产品",
    links: [
      { label: "体验 Demo", href: "#demo" },
      { label: "需求与方案", href: "#problem" },
      { label: "技术实践", href: "#clinical" },
    ],
  },
  {
    title: "关于",
    links: [
      { label: "角色设计", href: "#character" },
      { label: "团队", href: "#team" },
      { label: "愿景", href: "#vision" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <a href="#top" className="flex items-center">
            <Logo />
          </a>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-ink-soft">
            占位文案：一个不急于解决问题的 AI 陪伴产品。最终文案待回填。
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
          <span>© {new Date().getFullYear()} 在呀 ZÀIYA</span>
          <span>骨架搭建阶段</span>
        </div>
      </div>
    </footer>
  );
}
