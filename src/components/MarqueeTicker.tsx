"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const ITEMS = [
  "Adorne Fine Jewelry",
  "Crafted with Intention",
  "Since 2024",
  "Timeless Pieces",
  "Handcrafted Excellence",
  "Luxury Redefined",
];

function Diamond() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" style={{ display: "inline-block", flexShrink: 0 }}>
      <polygon points="4,0 8,4 4,8 0,4" fill="var(--color-gold)" />
    </svg>
  );
}

export default function MarqueeTicker() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Speed up slightly on scroll for a live feel
  const speed = useTransform(scrollYProgress, [0, 1], [1, 1.3]);

  const repeated = [...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <section
      ref={ref}
      style={{
        width: "100%",
        overflow: "hidden",
        borderTop: "1px solid var(--color-tray)",
        borderBottom: "1px solid var(--color-tray)",
        backgroundColor: "var(--color-canvas)",
        padding: "18px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          animation: "tickerScroll 28s linear infinite",
          whiteSpace: "nowrap",
          willChange: "transform",
        }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "20px",
              paddingRight: "20px",
              fontFamily: "var(--font-inter)",
              fontSize: "10px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--color-ink)",
              opacity: 0.55,
            }}
          >
            {item}
            <Diamond />
          </span>
        ))}
      </div>

      <style>{`
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
}
