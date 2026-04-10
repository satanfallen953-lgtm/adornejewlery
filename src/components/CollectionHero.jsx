"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function CollectionHero() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Subtle parallax on the image only
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <section
      ref={ref}
      className="collection-hero-section"
      style={{
        position: "relative",
        height: "90dvh",
        width: "100%",
        overflow: "hidden",
        touchAction: "pan-y",
        backgroundColor: "#f5f0eb",
      }}
    >
      {/* Parallax image */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          top: "-15%",
          height: "130%",
          y: imgY,
          willChange: "transform",
        }}
      >
        <style>{`
          .collection-hero-img { object-fit: contain; object-position: center center; }
          @media (min-width: 768px) { .collection-hero-img { object-fit: cover; object-position: left center; } }
          .collection-hero-section { height: 90dvh; }
        `}</style>
        <img
          src="/lookbook/couple-hero.jpg"
          alt="ADORNE Collection"
          className="collection-hero-img"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />
      </motion.div>

      {/* Bottom vignette — thin, subtle, only bottom 30% */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.28) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Text block — pinned to bottom center, Cartier-style */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          paddingBottom: "clamp(28px, 4vw, 52px)",
          gap: 0,
        }}
      >
        <motion.h1
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(28px, 3.5vw, 52px)",
            fontWeight: 400,
            fontStyle: "normal",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#ffffff",
            lineHeight: 1,
            margin: 0,
          }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          All Jewelry
        </motion.h1>

        <motion.p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "clamp(9px, 0.9vw, 12px)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.72)",
            marginTop: "clamp(10px, 1.2vw, 16px)",
            lineHeight: 1.6,
            maxWidth: 480,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          Fine jewelry — crafted with intention
        </motion.p>
      </div>
    </section>
  );
}
