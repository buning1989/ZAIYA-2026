import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import ReducingOverwhelm from "@/components/ReducingOverwhelm";
import FeatureSection from "@/components/FeatureSection";
import RecentPress from "@/components/RecentPress";
import Team from "@/components/Team";
import Hiring from "@/components/Hiring";
import Footer from "@/components/Footer";
import { characterLinks, researchLinks } from "@/data/content";

export default function App() {
  return (
    <div className="min-h-screen bg-canvas font-body text-ink antialiased">
      <Nav />
      <main>
        <Hero />
        <Stats />
        <ReducingOverwhelm />
        <FeatureSection
          id="character"
          eyebrow="Character & Craft"
          title="Warm, fun, and natural — without pretending to be human."
          body="Through our work on character design, embodiment, and interactivity, we've created an experience that feels genuinely warm, fun, and natural without pretending to be human."
          links={characterLinks}
        />
        <FeatureSection
          id="research"
          eyebrow="Research & Development"
          title="The real work is what we add on top."
          body="We're building on top of the leading AI models, but the real work is in what we add on top — the complex systems that shape how a Tolan listens, responds, remembers, and knows when to step back."
          links={researchLinks}
        />
        <RecentPress />
        <Team />
        <Hiring />
      </main>
      <Footer />
    </div>
  );
}
