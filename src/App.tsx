import { useState } from "react";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ProblemSolution from "@/components/ProblemSolution";
import ProductFeatures from "@/components/ProductFeatures";
import ClinicalFramework from "@/components/ClinicalFramework";
import CharacterDesign from "@/components/CharacterDesign";
import Team from "@/components/Team";
import Vision from "@/components/Vision";
import Footer from "@/components/Footer";
import DemoExperience from "@/components/demo/DemoExperience";

/** 初始 URL 是否带 ?mode=guided / ?mode=free（用于直接访问对应模式）。 */
function urlHasDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  const m = new URLSearchParams(window.location.search).get("mode");
  return m === "guided" || m === "free";
}

/** 清除 URL 中的 mode 参数（退出 Demo 时使用）。 */
function clearDemoModeParam() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has("mode")) return;
  url.searchParams.delete("mode");
  window.history.replaceState(
    {},
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

export default function App() {
  const [demoOpen, setDemoOpen] = useState(() => urlHasDemoMode());

  const closeDemo = () => {
    setDemoOpen(false);
    clearDemoModeParam();
  };

  return (
    <div className="min-h-screen bg-white font-body text-ink antialiased">
      <div aria-hidden={demoOpen}>
        <Nav onOpenDemo={() => setDemoOpen(true)} />
        <main>
          <Hero onOpenDemo={() => setDemoOpen(true)} />
          <ProblemSolution />
          <ProductFeatures />
          <ClinicalFramework />
          <CharacterDesign />
          <Team />
          <Vision />
        </main>
        <Footer />
      </div>

      {demoOpen && <DemoExperience onClose={closeDemo} />}
    </div>
  );
}
