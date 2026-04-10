"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

const PANELS = [
  { img: "/female.jpg", label: "FINE JEWELLERY", sub: "New Arrivals", pos: "center 20%" },
  { img: "/male.jpg",   label: "LUXURY ESSENTIALS", sub: "Signature Edit", pos: "center 25%" },
];

function Panel({ panel, index }: { panel: typeof PANELS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const yImg = useTransform(
    scrollYProgress,
    [0, 1],
    index === 0 ? ["-15%", "15%"] : ["-20%", "10%"]
  );
  const scale = useTransform(scrollYProgress, [0, 0.4], [1.12, 1]);

  const textY = useTransform(scrollYProgress, [0.15, 0.45], ["40px", "0px"]);
  const textOpacity = useTransform(scrollYProgress, [0.15, 0.4], [0, 1]);

  return (
    // Outer wrapper: scroll-triggered fade + slide-up entrance for the whole panel
    <motion.div
      style={{ position: "relative", width: "100%", height: "100%" }}
      initial={{ opacity: 0, y: 72 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 1.1,
        delay: index * 0.18,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* Inner ref div for scroll tracking */}
      <div ref={ref} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
        {/* Parallax + scale image */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            top: "-20%",
            height: "140%",
            y: yImg,
            scale,
            willChange: "transform",
          }}
        >
          <img
            src={panel.img}
            alt={panel.label}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: panel.pos,
              display: "block",
            }}
          />
        </motion.div>

        {/* Permanent dark overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(29,58,97,0.35)" }} />

        {/* Text block — parallaxed entrance */}
        <motion.div
          style={{
            position: "absolute",
            bottom: "56px",
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
            y: textY,
            opacity: textOpacity,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "10px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(243,246,250,0.6)",
            }}
          >
            {panel.sub}
          </p>
          <h2
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(22px, 3.5vw, 44px)",
              color: "#F3F6FA",
              fontWeight: 300,
              letterSpacing: "0.08em",
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            {panel.label}
          </h2>
          <Link
            href="/jewelry"
            style={{
              display: "inline-block",
              padding: "11px 36px",
              border: "1px solid rgba(243,246,250,0.7)",
              color: "#F3F6FA",
              background: "transparent",
              cursor: "pointer",
              letterSpacing: "0.2em",
              fontSize: "9px",
              textTransform: "uppercase",
              textDecoration: "none",
              fontFamily: "var(--font-inter)",
              transition: "background 0.35s ease, border-color 0.35s ease",
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "rgba(243,246,250,0.12)";
              el.style.borderColor = "rgba(243,246,250,1)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "transparent";
              el.style.borderColor = "rgba(243,246,250,0.7)";
            }}
          >
            Shop Now
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function SplitParallax() {
  return (
    <section className="w-full h-auto md:h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full">
        {PANELS.map((panel, i) => (
          <div key={i} className="h-[70vh] md:h-full">
            <Panel panel={panel} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
