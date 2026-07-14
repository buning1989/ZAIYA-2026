import { useEffect, useState } from "react";

const sections = [
  { id: "problem", label: "需求与缺口" },
  { id: "dilemmas", label: "真实困境" },
  { id: "product", label: "我们怎么做" },
  { id: "clinical", label: "专业方法" },
  { id: "character", label: "角色设计" },
  { id: "team", label: "为什么是我们" },
  { id: "vision", label: "愿景" },
];

function sectionIndexLabel(index: number) {
  return `${String(index + 1).padStart(2, "0")} / ${String(sections.length).padStart(2, "0")}`;
}

function pickActiveSection(elements: HTMLElement[]) {
  const readingLine = window.innerHeight * 0.32;
  const candidateTopLimit = window.innerHeight * 0.45;
  const candidateBottomLimit = window.innerHeight * 0.15;

  const candidates = elements
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        id: element.id,
        top: rect.top,
        bottom: rect.bottom,
        distance: Math.abs(rect.top - readingLine),
      };
    })
    .filter(
      (section) =>
        section.top <= candidateTopLimit &&
        section.bottom >= candidateBottomLimit,
    )
    .sort((a, b) => a.distance - b.distance);

  if (candidates[0]) return candidates[0].id;

  const passedSections = elements
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return { id: element.id, top: rect.top };
    })
    .filter((section) => section.top <= readingLine)
    .sort((a, b) => b.top - a.top);

  return passedSections[0]?.id ?? sections[0].id;
}

export default function SectionNavigator() {
  const [activeId, setActiveId] = useState(sections[0].id);
  const [firstSectionHasEntered, setFirstSectionHasEntered] = useState(false);
  const [footerHasEntered, setFooterHasEntered] = useState(false);

  const showNavigator = firstSectionHasEntered && !footerHasEntered;

  useEffect(() => {
    let activeObserver: IntersectionObserver | null = null;
    let firstSectionObserver: IntersectionObserver | null = null;
    let footerObserver: IntersectionObserver | null = null;
    let retryTimer: number | undefined;

    const connectObservers = () => {
      const sectionElements = sections
        .map((section) => document.getElementById(section.id))
        .filter((element): element is HTMLElement => element instanceof HTMLElement);
      const firstSection = sectionElements[0];
      const footer = document.querySelector("footer");

      if (sectionElements.length !== sections.length || !firstSection || !footer) {
        retryTimer = window.setTimeout(connectObservers, 100);
        return;
      }

      const updateActiveSection = () => {
        setActiveId(pickActiveSection(sectionElements));
      };

      activeObserver = new IntersectionObserver(updateActiveSection, {
        rootMargin: "-25% 0px -60% 0px",
        threshold: [0, 0.01, 0.1, 0.5],
      });
      sectionElements.forEach((section) => activeObserver?.observe(section));

      firstSectionObserver = new IntersectionObserver(
        ([entry]) => {
          const enteredReadingArea =
            entry.isIntersecting ||
            entry.boundingClientRect.top <= window.innerHeight * 0.4;

          setFirstSectionHasEntered(enteredReadingArea);
          updateActiveSection();
        },
        {
          rootMargin: "0px 0px -60% 0px",
          threshold: 0,
        },
      );
      firstSectionObserver.observe(firstSection);

      footerObserver = new IntersectionObserver(
        ([entry]) => {
          setFooterHasEntered(
            entry.isIntersecting ||
              entry.boundingClientRect.top <= window.innerHeight * 0.65,
          );
        },
        {
          rootMargin: "0px 0px -35% 0px",
          threshold: 0,
        },
      );
      footerObserver.observe(footer);

      updateActiveSection();
    };

    connectObservers();

    return () => {
      window.clearTimeout(retryTimer);
      activeObserver?.disconnect();
      firstSectionObserver?.disconnect();
      footerObserver?.disconnect();
    };
  }, []);

  const handleNavigate = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    setActiveId(id);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="章节目录"
      aria-hidden={!showNavigator}
      className={[
        "fixed left-6 top-[calc(50vh-76px)] z-30 hidden transition-[opacity,transform] duration-200 ease-out xl:flex",
        showNavigator
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-1 opacity-0",
      ].join(" ")}
    >
      <ol className="space-y-3">
        {sections.map((section, index) => {
          const isActive = section.id === activeId;
          const indexLabel = sectionIndexLabel(index);

          return (
            <li key={section.id}>
              <button
                type="button"
                aria-label={`跳转到第 ${index + 1} 章：${section.label}`}
                aria-current={isActive ? "step" : undefined}
                tabIndex={showNavigator ? 0 : -1}
                onClick={() => handleNavigate(section.id)}
                className="group relative flex h-3 w-10 items-center rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-4 focus-visible:ring-offset-white"
              >
                <span
                  aria-hidden="true"
                  className={[
                    "block transition-[width,background-color,opacity] duration-[180ms] ease-in-out",
                    isActive
                      ? "h-0.5 w-7 bg-ink opacity-100 group-hover:w-8"
                      : "h-px w-2.5 bg-line opacity-90 group-hover:w-4 group-hover:bg-ink-faint",
                  ].join(" ")}
                />

                <span className="pointer-events-none absolute left-12 top-1/2 min-w-[104px] -translate-y-1/2 rounded-md border border-line bg-white px-3 py-2 text-left opacity-0 shadow-[0_6px_18px_-16px_rgba(39,51,31,0.38)] transition-opacity duration-[180ms] ease-in-out group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="block text-[11px] font-medium leading-none tracking-[0.14em] text-ink-faint">
                    {indexLabel}
                  </span>
                  <span className="mt-1.5 block whitespace-nowrap text-[13px] font-semibold leading-none tracking-normal text-ink">
                    {section.label}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
