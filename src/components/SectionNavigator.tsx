import { useEffect, useState } from "react";

type MainSectionId = "needs" | "pain" | "solution" | "team" | "vision";
type ObservedSectionId =
  | "needs"
  | "pain"
  | "solution-product"
  | "solution-method"
  | "solution-character"
  | "team"
  | "vision";

const mainSections: { id: MainSectionId; label: string; targetId: string }[] = [
  { id: "needs", label: "现实缺口", targetId: "needs" },
  { id: "pain", label: "用户困境", targetId: "pain" },
  { id: "solution", label: "在呀 ZÀIYA", targetId: "solution-product" },
  { id: "team", label: "关于团队", targetId: "team" },
  { id: "vision", label: "未来愿景", targetId: "vision" },
];

const observedSections: { id: ObservedSectionId; mainId: MainSectionId }[] = [
  { id: "needs", mainId: "needs" },
  { id: "pain", mainId: "pain" },
  { id: "solution-product", mainId: "solution" },
  { id: "solution-method", mainId: "solution" },
  { id: "solution-character", mainId: "solution" },
  { id: "team", mainId: "team" },
  { id: "vision", mainId: "vision" },
];

function sectionIndexLabel(index: number) {
  return `${String(index + 1).padStart(2, "0")} / ${String(mainSections.length).padStart(2, "0")}`;
}

function pickActiveSection(elements: HTMLElement[]) {
  const readingLine = window.innerHeight * 0.32;
  const candidateTopLimit = window.innerHeight * 0.45;
  const candidateBottomLimit = window.innerHeight * 0.15;

  const candidates = elements
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        id: element.id as ObservedSectionId,
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
      return { id: element.id as ObservedSectionId, top: rect.top };
    })
    .filter((section) => section.top <= readingLine)
    .sort((a, b) => b.top - a.top);

  return passedSections[0]?.id ?? observedSections[0].id;
}

function getObservedConfig(id: ObservedSectionId) {
  return observedSections.find((section) => section.id === id) ?? observedSections[0];
}

export default function SectionNavigator() {
  const [activeObservedId, setActiveObservedId] = useState<ObservedSectionId>(observedSections[0].id);
  const [firstSectionHasEntered, setFirstSectionHasEntered] = useState(false);
  const [footerHasEntered, setFooterHasEntered] = useState(false);

  const activeConfig = getObservedConfig(activeObservedId);
  const activeMainId = activeConfig.mainId;
  const showNavigator = firstSectionHasEntered && !footerHasEntered;

  useEffect(() => {
    let activeObserver: IntersectionObserver | null = null;
    let firstSectionObserver: IntersectionObserver | null = null;
    let footerObserver: IntersectionObserver | null = null;
    let retryTimer: number | undefined;
    let frameId: number | undefined;
    let scheduleActiveSectionUpdate: (() => void) | undefined;

    const connectObservers = () => {
      const sectionElements = observedSections
        .map((section) => document.getElementById(section.id))
        .filter((element): element is HTMLElement => element instanceof HTMLElement);
      const firstSection = document.getElementById(mainSections[0].targetId);
      const footer = document.querySelector("footer");

      if (sectionElements.length !== observedSections.length || !firstSection || !footer) {
        retryTimer = window.setTimeout(connectObservers, 100);
        return;
      }

      const updateActiveSection = () => {
        setActiveObservedId(pickActiveSection(sectionElements));
      };
      scheduleActiveSectionUpdate = () => {
        if (frameId) return;
        frameId = window.requestAnimationFrame(() => {
          frameId = undefined;
          updateActiveSection();
        });
      };

      activeObserver = new IntersectionObserver(scheduleActiveSectionUpdate, {
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
      window.addEventListener("scroll", scheduleActiveSectionUpdate, { passive: true });
      window.addEventListener("resize", scheduleActiveSectionUpdate);
    };

    connectObservers();

    return () => {
      window.clearTimeout(retryTimer);
      if (frameId) window.cancelAnimationFrame(frameId);
      if (scheduleActiveSectionUpdate) {
        window.removeEventListener("scroll", scheduleActiveSectionUpdate);
        window.removeEventListener("resize", scheduleActiveSectionUpdate);
      }
      activeObserver?.disconnect();
      firstSectionObserver?.disconnect();
      footerObserver?.disconnect();
    };
  }, []);

  const handleNavigate = (targetId: string, observedId?: ObservedSectionId) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    if (observedId) setActiveObservedId(observedId);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="章节目录"
      aria-hidden={!showNavigator}
      className={[
        "fixed right-[max(32px,calc((100vw-1120px)/2-64px))] top-[calc(50vh-76px)] z-30 hidden flex-col items-start transition-[opacity,transform] duration-200 ease-out xl:flex",
        showNavigator
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-1 opacity-0",
      ].join(" ")}
    >
      <ol className="space-y-3">
        {mainSections.map((section, index) => {
          const isActive = section.id === activeMainId;
          const indexLabel = sectionIndexLabel(index);

          return (
            <li key={section.id}>
              <button
                type="button"
                aria-label={`跳转到第 ${index + 1} 章：${section.label}`}
                aria-current={isActive ? "step" : undefined}
                tabIndex={showNavigator ? 0 : -1}
                onClick={() =>
                  handleNavigate(
                    section.targetId,
                    section.id === "solution"
                      ? "solution-product"
                      : (section.targetId as ObservedSectionId),
                  )
                }
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

                <span className="pointer-events-none absolute right-12 top-1/2 min-w-[124px] -translate-y-1/2 rounded-md border border-line bg-white px-3 py-2 text-left opacity-0 shadow-[0_6px_18px_-16px_rgba(39,51,31,0.38)] transition-opacity duration-[180ms] ease-in-out group-hover:opacity-100 group-focus-visible:opacity-100">
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
