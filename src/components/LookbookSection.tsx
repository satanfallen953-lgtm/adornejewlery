"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const CARD_H = "clamp(360px, 52vw, 640px)";
const GAP    = "clamp(8px, 1.5vw, 20px)";

type Hotspot = { x: string; y: string; label: string };

// Positions are % of the VISIBLE CARD area (what you see on screen)
const PAIRS = [
  {
    female: {
      img: "/lookbook/female1.jpg", label: "Her. I", tag: "New Arrivals",
      hotspots: [
        { x: "25%", y: "23%", label: "Earrings"  },  // hoop earring — left side of face
        { x: "52%", y: "54%", label: "Necklace"  },  // layered chain at chest
        { x: "13%", y: "79%", label: "Bracelet"  },  // dark beaded bracelet — left of watch
      ] as Hotspot[],
    },
    male: {
      img: "/lookbook/male1.jpg", label: "Him. I", tag: "Signature Edit",
      hotspots: [
        { x: "53%", y: "57%", label: "Pendant"   },  // circular coin pendant
        { x: "42%", y: "73%", label: "Bracelet"  },  // bracelet on wrist
      ] as Hotspot[],
    },
  },
  {
    female: {
      img: "/lookbook/female2.jpg", label: "Her. II", tag: "Fine Jewellery",
      pos: "50% 77%",  // frame shifts down: shows chest→wrist, revealing necklace + watch + bracelet
      hotspots: [
        { x: "50%", y: "27%", label: "Necklace"  },  // heart pendant — upper card
        { x: "87%", y: "70%", label: "Watch"     },  // gold watch — right wrist
        { x: "8%",  y: "86%", label: "Bracelet"  },  // thin bracelet — left wrist
      ] as Hotspot[],
    },
    male: {
      img: "/lookbook/male2.jpg", label: "Him. II", tag: "Essentials",
      hotspots: [
        { x: "54%", y: "50%", label: "Pendant"   },  // gold coin pendant
        { x: "63%", y: "72%", label: "Watch"     },  // watch on wrist
      ] as Hotspot[],
    },
  },
  {
    female: {
      img: "/lookbook/female3.jpg", label: "Her. III", tag: "The Collection",
      hotspots: [
        { x: "66%", y: "21%", label: "Earrings"  },  // earring right side
        { x: "52%", y: "51%", label: "Necklace"  },  // delicate chain necklace
        { x: "43%", y: "73%", label: "Bracelet"  },  // chunky gold bracelet
      ] as Hotspot[],
    },
    male: {
      img: "/lookbook/male3.jpg", label: "Him. III", tag: "For Him",
      hotspots: [
        { x: "50%", y: "47%", label: "Necklace"  },  // gold cross necklace
        { x: "36%", y: "72%", label: "Bracelet"  },  // steel bracelet
      ] as Hotspot[],
    },
  },
];

function SparkleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1.5l1.8 8.7L22.5 12l-8.7 1.8L12 22.5l-1.8-8.7L1.5 12l8.7-1.8L12 1.5z" />
    </svg>
  );
}

function HotspotDot({ x, y, label }: Hotspot) {
  return (
    <div
      style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", zIndex: 4 }}
      className="group/dot"
    >
      <span style={{
        position: "absolute", inset: "-6px", borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.5)",
        animation: "hotspot-pulse 2.4s ease-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        width: "34px", height: "34px", borderRadius: "50%",
        backgroundColor: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
        border: "1px solid rgba(255,255,255,0.95)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "var(--color-ink)",
        boxShadow: "0 2px 14px rgba(29,58,97,0.3)",
        transition: "transform 0.2s ease",
      }} className="hover:scale-110">
        <SparkleIcon />
      </div>
      {/* Tooltip */}
      <div style={{
        position: "absolute", bottom: "calc(100% + 9px)", left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "var(--color-ink)", color: "#F3F6FA",
        fontFamily: "var(--font-inter)", fontSize: "8px",
        letterSpacing: "0.22em", textTransform: "uppercase",
        padding: "5px 10px", whiteSpace: "nowrap", pointerEvents: "none",
        transition: "opacity 0.2s ease",
      }} className="opacity-0 group-hover/dot:opacity-100">
        {label}
      </div>
    </div>
  );
}

function ArrowIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {dir === "right"
        ? <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>
        : <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>
      }
    </svg>
  );
}

function PairedCard({ pair, delay }: { pair: typeof PAIRS[0]; delay: number }) {
  const [showMale, setShowMale] = useState(false);
  const [cardHovered, setCardHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  // Image layer: ±10% of image div height (= 1.24 × card height)
  const imgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  // Hotspot layer: must travel same PIXEL distance as image layer.
  // Image layer is 124% of card height, so 10% of image = 12.4% of card (hotspot div height).
  const dotY = useTransform(scrollYProgress, [0, 1], ["-12.4%", "12.4%"]);

  const SLIDE = { duration: 0.75, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <motion.div
      style={{ height: CARD_H }}
      initial={{ opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        ref={cardRef}
        className="relative overflow-hidden cursor-pointer w-full h-full"
        onMouseEnter={() => setCardHovered(true)}
        onMouseLeave={() => setCardHovered(false)}
      >
        {/* ── Female image ── */}
        <motion.div
          style={{ position: "absolute", inset: 0, top: "-12%", height: "124%", y: imgY, willChange: "transform" }}
          animate={{ x: showMale ? "-100%" : "0%" }}
          transition={SLIDE}
        >
          <img src={pair.female.img} alt={pair.female.label}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </motion.div>

        {/* ── Male image ── */}
        <motion.div
          style={{ position: "absolute", inset: 0, top: "-12%", height: "124%", y: imgY, willChange: "transform" }}
          animate={{ x: showMale ? "0%" : "100%" }}
          transition={SLIDE}
        >
          <img src={pair.male.img} alt={pair.male.label}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </motion.div>

        {/* Bottom vignette */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "linear-gradient(to top, rgba(29,58,97,0.62) 0%, transparent 48%)",
        }} />

        {/* Gender pill */}
        <div style={{
          position: "absolute", top: "16px", left: "16px", zIndex: 3,
          fontFamily: "var(--font-inter)", fontSize: "8px",
          letterSpacing: "0.3em", textTransform: "uppercase",
          color: "rgba(243,246,250,0.75)",
          background: "rgba(29,58,97,0.45)",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          padding: "5px 12px",
          border: "1px solid rgba(255,255,255,0.18)",
        }}>
          {showMale ? "Him" : "Her"}
        </div>

        {/* ── Female hotspot layer — slides with female image, y-locked to it ── */}
        <motion.div
          style={{
            position: "absolute", inset: 0,
            y: dotY,  // same pixel displacement as imgY on image layer
            zIndex: 4,
            pointerEvents: showMale ? "none" : "auto",
          }}
          animate={{ x: showMale ? "-100%" : "0%" }}
          transition={SLIDE}
        >
          {pair.female.hotspots.map((hs) => <HotspotDot key={hs.label} {...hs} />)}
        </motion.div>

        {/* ── Male hotspot layer — slides with male image ── */}
        <motion.div
          style={{
            position: "absolute", inset: 0,
            y: dotY,
            zIndex: 4,
            pointerEvents: showMale ? "auto" : "none",
          }}
          animate={{ x: showMale ? "0%" : "100%" }}
          transition={SLIDE}
        >
          {pair.male.hotspots.map((hs) => <HotspotDot key={hs.label} {...hs} />)}
        </motion.div>

        {/* ── Toggle arrow ── */}
        <motion.button
          onClick={() => setShowMale((v) => !v)}
          aria-label={showMale ? "Show female model" : "Show male model"}
          style={{
            position: "absolute", top: "50%",
            right: showMale ? undefined : "clamp(14px, 3%, 24px)",
            left:  showMale ? "clamp(14px, 3%, 24px)" : undefined,
            transform: "translateY(-50%)",
            width: "44px", height: "44px", borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.95)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--color-ink)",
            boxShadow: "0 4px 20px rgba(29,58,97,0.35)",
            zIndex: 5,
          }}
          animate={{ opacity: 1, scale: showMale || cardHovered ? 1 : 0.85 }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <ArrowIcon dir={showMale ? "left" : "right"} />
        </motion.button>

        {/* Bottom label */}
        <div style={{
          position: "absolute", bottom: "clamp(16px, 3%, 28px)",
          left: 0, right: 0, zIndex: 2,
          display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
          pointerEvents: "none",
        }}>
          <p style={{
            fontFamily: "var(--font-inter)", fontSize: "9px",
            letterSpacing: "0.3em", textTransform: "uppercase",
            color: "rgba(243,246,250,0.65)",
          }}>
            {showMale ? pair.male.tag : pair.female.tag}
          </p>
          <p style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(16px, 1.8vw, 24px)",
            fontStyle: "italic", fontWeight: 300,
            color: "#F3F6FA", letterSpacing: "0.04em",
          }}>
            {showMale ? pair.male.label : pair.female.label}
          </p>
          <a href="#" style={{
            fontFamily: "var(--font-inter)", fontSize: "9px",
            letterSpacing: "0.26em", textTransform: "uppercase",
            color: "#F3F6FA", textDecoration: "none",
            borderBottom: "1px solid var(--color-gold)", paddingBottom: "3px",
            pointerEvents: "all",
          }}>
            Shop Look
          </a>
        </div>

        <style>{`
          @keyframes hotspot-pulse {
            0%   { transform: scale(1);   opacity: 0.7; }
            70%  { transform: scale(1.9); opacity: 0;   }
            100% { transform: scale(1.9); opacity: 0;   }
          }
        `}</style>
      </div>
    </motion.div>
  );
}

export default function LookbookSection() {
  return (
    <section style={{
      position: "relative", overflow: "hidden",
      backgroundColor: "var(--color-canvas)",
      padding: "clamp(60px, 10vw, 120px) 0",
    }}>
      {/* Background ADORNE marquee */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center",
        overflow: "hidden", pointerEvents: "none",
        userSelect: "none", zIndex: 0,
      }}>
        <motion.div
          style={{ display: "flex", whiteSpace: "nowrap", willChange: "transform" }}
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 16, ease: "linear", repeat: Infinity }}
        >
          {[...Array(8)].map((_, i) => (
            <span key={i} style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(90px, 20vw, 280px)",
              color: "var(--color-ink)", opacity: 0.07,
              lineHeight: 1, letterSpacing: "-0.03em", paddingRight: "0.4em",
            }}>ADORNE</span>
          ))}
        </motion.div>
      </div>

      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: "1300px", margin: "0 auto",
        padding: `0 clamp(16px, 5vw, 60px)`,
      }}>
        {/* Header */}
        <motion.div
          style={{ textAlign: "center", marginBottom: "clamp(40px, 6vw, 80px)" }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p style={{
            fontFamily: "var(--font-inter)", fontSize: "9px",
            letterSpacing: "0.38em", textTransform: "uppercase",
            color: "var(--color-gold)", marginBottom: "12px",
          }}>
            New Season — 2026
          </p>
          <h2 style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(36px, 5vw, 72px)",
            fontStyle: "italic", fontWeight: 300,
            color: "var(--color-ink)", letterSpacing: "0.04em", lineHeight: 1,
          }}>
            The Edit
          </h2>
          <p style={{
            fontFamily: "var(--font-inter)", fontSize: "9px",
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "var(--color-ink)", opacity: 0.4, marginTop: "16px",
          }}>
            Tap the arrow → to explore her or him
          </p>
        </motion.div>

        {/* 3 paired cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          style={{ gap: GAP }}
        >
          {PAIRS.map((pair, i) => (
            <PairedCard key={i} pair={pair} delay={i * 0.12} />
          ))}
        </div>
      </div>
    </section>
  );
}
