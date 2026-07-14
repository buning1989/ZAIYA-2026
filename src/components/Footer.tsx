import Logo from "./Logo";

const socialLinks = [
  {
    label: "小红书",
    href: "https://www.xiaohongshu.com/user/profile/55765ff55894465da0db0db1?xsec_token=AB8_2-W3ZabhI9lpfBoMp56l0I-xCmPydikiwt7mlxbJE=&xsec_source=pc_search",
    icon: "/assets/social/xiaohongshu-logo.png",
  },
  {
    label: "GitHub",
    href: "https://github.com/buning1989/ZAIYA-2026",
    icon: "/assets/social/github-logo.png",
  },
];

const columns = [
  {
    title: "产品",
    links: [
      { label: "体验 Demo", href: "#demo" },
      { label: "需求与方案", href: "#problem" },
      { label: "产品功能", href: "#product" },
      { label: "技术实践", href: "#clinical" },
    ],
  },
  {
    title: "关于",
    links: [
      { label: "角色设计", href: "#character" },
      { label: "团队介绍", href: "#team" },
      { label: "产品愿景", href: "#vision" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="flex flex-col items-start text-left">
          <a href="#top" className="flex items-center">
            <Logo />
          </a>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-ink-soft">
            面向精神心理困扰人群的 AI 健康生活伙伴。
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-start gap-1.5 self-start">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                className="group inline-flex shrink-0 items-center justify-center"
              >
                <img
                  src={link.icon}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className={[
                    "object-contain transition-opacity",
                    link.label === "GitHub"
                      ? "h-[30px] w-[30px] rounded-full opacity-[0.72] group-hover:opacity-100"
                      : "h-[14px] w-[42px] opacity-[0.72] group-hover:opacity-100",
                  ].join(" ")}
                />
              </a>
            ))}
          </div>
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
        </div>
      </div>
    </footer>
  );
}
