"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Lenis intercepts wheel/touch events and drives window.scrollY through its own
// RAF loop — Framer Motion's useScroll reads the smoothed value automatically.
export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Skip Lenis on touch/mobile devices — it fights native Android scroll and causes sticking
    if (typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
      autoRaf: true,
    });

    return () => lenis.destroy();
  }, []);

  return children;
}
