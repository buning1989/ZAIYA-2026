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
type SolutionSubsectionId = "product" | "method" | "character";

const mainSections: { id: MainSectionId; label: string; targetId: string }[] = [
  { id: "needs", label: "需求与缺口", targetId: "needs" },
  { id: "pain", label: "真实困境", targetId: "pain" },
  { id: "solution", label: "解决方案", targetId: "solution-product" },
  { id: "team", label: "为什么是我们", targetId: "team" },
  { id: "vision", label: "愿景", targetId: "vision" },
];

const observedSections: { id: ObservedSectionId; mainId: MainSectionId; subId?: SolutionSubsectionId }[] = [
  { id: "needs", mainId: "needs" },
  { id: "pain", mainId: "pain" },
  { id: "solution-product", mainId: "solution", subId: "product" },
  { id: "solution-method", mainId: "solution", subId: "method" },
  { id: "solution-character", mainId: "solution", subId: "character" },
  { id: "team", mainId: "team" },
  { id: "vision", mainId: "vision" },
];

const solutionSubsections: { id: SolutionSubsectionId; label: string; targetId: ObservedSectionId }[] = [
  { id: "product", label: "我们怎么做", targetId: "solution-product" },
  { id: "method", label: "专业方法", targetId: "solution-method" },
  { id: "character", label: "角色设计", targetId: "solution-character" },
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
  const activeSolutionSubsection = activeConfig.subId;
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
        "fixed left-6 top-[calc(50vh-76px)] z-30 hidden transition-[opacity,transform] duration-200 ease-out xl:flex",
        showNavigator
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-1 opacity-0",
      ].join(" ")}
    >
      <ol className="space-y-3">
        {mainSections.map((section, index) => {
          const isActive = section.id === activeMainId;
          const indexLabel = sectionIndexLabel(index);
          const activeSubsection = solutionSubsections.find(
            (subsection) => subsection.id === activeSolutionSubsection,
          );

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

                <span className="pointer-events-none absolute left-12 top-1/2 min-w-[124px] -translate-y-1/2 rounded-md border border-line bg-white px-3 py-2 text-left opacity-0 shadow-[0_6px_18px_-16px_rgba(39,51,31,0.38)] transition-opacity duration-[180ms] ease-in-out group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="block text-[11px] font-medium leading-none tracking-[0.14em] text-ink-faint">
                    {indexLabel}
                  </span>
                  <span className="mt-1.5 block whitespace-nowrap text-[13px] font-semibold leading-none tracking-normal text-ink">
                    {section.label}
                  </span>
                  {section.id === "solution" && activeSubsection && (
                    <span className="mt-2 block whitespace-nowrap text-[12px] font-medium leading-none text-ink-soft">
                      03.{solutionSubsections.findIndex((subsection) => subsection.id === activeSubsection.id) + 1} {activeSubsection.label}
                    </span>
                  )}
                </span>
              </button>

              {section.id === "solution" && isActive && (
                <div className="mt-2 space-y-2 pl-2">
                  {solutionSubsections.map((subsection) => {
                    const isSubActive = subsection.id === activeSolutionSubsection;

                    return (
                      <button
                        key={subsection.id}
                        type="button"
                        aria-label={`跳转到解决方案子章节：${subsection.label}`}
                        tabIndex={showNavigator ? 0 : -1}
                        onClick={() => handleNavigate(subsection.targetId, subsection.targetId)}
                        className="group/sub relative flex h-2.5 w-8 items-center rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-4 focus-visible:ring-offset-white"
                      >
                        <span
                          aria-hidden="true"
                          className={[
                            "block transition-[width,background-color,opacity] duration-[180ms] ease-in-out",
                            isSubActive
                              ? "h-0.5 w-5 bg-ink opacity-90 group-hover/sub:w-6"
                              : "h-px w-2 bg-line opacity-80 group-hover/sub:w-4 group-hover/sub:bg-ink-faint",
                          ].join(" ")}
                        />
                        <span className="pointer-events-none absolute left-10 top-1/2 min-w-[112px] -translate-y-1/2 rounded-md border border-line bg-white px-3 py-2 text-left opacity-0 shadow-[0_6px_18px_-16px_rgba(39,51,31,0.38)] transition-opacity duration-[180ms] ease-in-out group-hover/sub:opacity-100 group-focus-visible/sub:opacity-100">
                          <span className="block text-[11px] font-medium leading-none tracking-[0.12em] text-ink-faint">
                            03.{solutionSubsections.findIndex((item) => item.id === subsection.id) + 1}
                          </span>
                          <span className="mt-1.5 block whitespace-nowrap text-[13px] font-semibold leading-none text-ink">
                            {subsection.label}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
