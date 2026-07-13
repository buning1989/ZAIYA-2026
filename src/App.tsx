import { useState, lazy, Suspense } from "react";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ProblemSolution from "@/components/ProblemSolution";
import ProductFeatures from "@/components/ProductFeatures";
import ClinicalFramework from "@/components/ClinicalFramework";
import CharacterDesign from "@/components/CharacterDesign";
import Team from "@/components/Team";
import Vision from "@/components/Vision";
import Footer from "@/components/Footer";
import { demoExperienceLoader } from "@/lib/moduleLoaders";

/* 性能优化（2026-07-13）：DemoExperience 及其全部子组件（UnifiedDemoStage、
 * 10+ Demo 流程、场景数据等）拆分为独立 chunk，落地页首屏不加载 Demo 代码。
 * 预加载优化：使用集中式 loader，确保预加载与真实渲染复用同一份 Promise。 */
const DemoExperience = lazy(demoExperienceLoader);

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

      {demoOpen && (
        <Suspense fallback={null}>
          <DemoExperience onClose={closeDemo} />
        </Suspense>
      )}
    </div>
  );
}
