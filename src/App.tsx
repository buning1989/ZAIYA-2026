import { useState } from "react";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ProblemSolution from "@/components/ProblemSolution";
import ClinicalFramework from "@/components/ClinicalFramework";
import CharacterDesign from "@/components/CharacterDesign";
import Team from "@/components/Team";
import Vision from "@/components/Vision";
import Footer from "@/components/Footer";
import Demo from "@/components/Demo";

export default function App() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-body text-ink antialiased">
      <div aria-hidden={demoOpen}>
        <Nav onOpenDemo={() => setDemoOpen(true)} />
        <main>
          <Hero onOpenDemo={() => setDemoOpen(true)} />
          <ProblemSolution />
          <ClinicalFramework />
          <CharacterDesign />
          <Team />
          <Vision />
        </main>
        <Footer />
      </div>

      {demoOpen && <Demo onClose={() => setDemoOpen(false)} />}
    </div>
  );
}
