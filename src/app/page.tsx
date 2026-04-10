"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SplitParallax from "@/components/SplitParallax";
import Footer from "@/components/Footer";
import LuxuryShowcase from "@/components/LuxuryShowcase";
import TextMaskSection from "@/components/TextMaskSection";
import FeaturedCampaign from "@/components/FeaturedCampaign";
import ServiceCards from "@/components/ServiceCards";
import LookbookSection from "@/components/LookbookSection";
import MarqueeTicker from "@/components/MarqueeTicker";
import LuxuryCursor from "@/components/LuxuryCursor";

export default function HomePage() {
  const [introPhase, setIntroPhase] = useState(0);
  const [isReturn, setIsReturn] = useState(false);

  useEffect(() => {
    // Return visit: skip the loader wait entirely
    if (sessionStorage.getItem("adorne-intro-done")) {
      setIsReturn(true);
      setIntroPhase(3);
      return;
    }
    // First visit: full intro sequence
    const timers = [
      setTimeout(() => setIntroPhase(1), 100),
      setTimeout(() => setIntroPhase(2), 400),
      setTimeout(() => {
        setIntroPhase(3);
        sessionStorage.setItem("adorne-intro-done", "1");
      }, 2500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <main style={{ position: "relative", overflowX: "clip", backgroundColor: "var(--color-canvas)" }}>
      <LuxuryCursor />
      <Navbar introPhase={introPhase} />
      <Hero introPhase={introPhase} isReturn={isReturn} />
      <MarqueeTicker />
      <SplitParallax />
      <LuxuryShowcase />
      <TextMaskSection />
      <FeaturedCampaign />
      <div style={{ marginTop: "-100dvh" }}>
        <ServiceCards />
      </div>
      <LookbookSection />
      <Footer />
    </main>
  );
}
