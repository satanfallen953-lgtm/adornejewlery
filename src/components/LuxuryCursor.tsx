"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function LuxuryCursor() {
  const dotX = useMotionValue(-200);
  const dotY = useMotionValue(-200);

  // Ring lags behind with spring physics
  const ringX = useSpring(dotX, { damping: 26, stiffness: 240, mass: 0.6 });
  const ringY = useSpring(dotY, { damping: 26, stiffness: 240, mass: 0.6 });

  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    // Only activate on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const move = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
    };

    const checkTarget = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const clickable = el.closest(
        "a, button, [role='button'], input, select, textarea, label, [tabindex], [data-cursor='pointer']"
      );
      setIsPointer(!!clickable);
    };

    const hide = () => setIsHidden(true);
    const show = () => setIsHidden(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", checkTarget);
    document.addEventListener("mouseleave", hide);
    document.addEventListener("mouseenter", show);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", checkTarget);
      document.removeEventListener("mouseleave", hide);
      document.removeEventListener("mouseenter", show);
    };
  }, [dotX, dotY]);

  return (
    <>
      {/* Dot — snaps instantly */}
      <motion.div
        aria-hidden="true"
        animate={{
          width: isPointer ? 10 : 6,
          height: isPointer ? 10 : 6,
          opacity: isHidden ? 0 : 1,
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        style={{
          position: "fixed",
          left: dotX,
          top: dotY,
          x: "-50%",
          y: "-50%",
          borderRadius: "50%",
          backgroundColor: "var(--color-ink)",
          pointerEvents: "none",
          zIndex: 99999,
          mixBlendMode: "multiply",
        }}
      />

      {/* Ring — lags with spring */}
      <motion.div
        aria-hidden="true"
        animate={{
          width: isPointer ? 54 : 38,
          height: isPointer ? 54 : 38,
          opacity: isHidden ? 0 : isPointer ? 0.55 : 0.28,
          borderColor: isPointer
            ? "var(--color-gold)"
            : "var(--color-ink)",
        }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        style={{
          position: "fixed",
          left: ringX,
          top: ringY,
          x: "-50%",
          y: "-50%",
          borderRadius: "50%",
          border: "1px solid var(--color-ink)",
          pointerEvents: "none",
          zIndex: 99999,
          mixBlendMode: "multiply",
        }}
      />
    </>
  );
}
