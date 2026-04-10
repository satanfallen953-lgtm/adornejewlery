"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const TRACK =
  "ADORNE\u00A0\u00A0\u00A0\u00A0ADORNE\u00A0\u00A0\u00A0\u00A0ADORNE\u00A0\u00A0\u00A0\u00A0ADORNE\u00A0\u00A0\u00A0\u00A0ADORNE\u00A0\u00A0\u00A0\u00A0ADORNE\u00A0\u00A0\u00A0\u00A0";

export default function FeaturedCampaign() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track from when section enters viewport-bottom to when it exits viewport-top
  // offset ["start end", "end start"] → progress 0 = section enters, ~0.33 = section pinned at top
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // ── Video: zooms in as section scrolls up from bottom → fullscreen by the time it pins ──
  // progress ~0.33 = section top hits viewport top (pinned). Zoom completes there.
  const scale = useTransform(scrollYProgress, [0, 0.33, 1], [0.62, 1, 1]);
  const radius = useTransform(scrollYProgress, [0, 0.31, 1], [12, 0, 0]);
  const videoOpacity = useTransform(scrollYProgress, [0, 0.18, 1], [0, 1, 1]);

  // ── Bottom label: fades in after zoom completes ───────────────────────────
  const labelOpacity = useTransform(scrollYProgress, [0.35, 0.46, 1], [0, 1, 1]);
  const labelY = useTransform(scrollYProgress, [0.35, 0.46], [20, 0]);

  // ── Exit: fade during sticky phase so it's gone before the panel unpins ──
  // Unpin happens at ~0.67 progress; fade must complete before that
  const panelOpacity = useTransform(scrollYProgress, [0.53, 0.67], [1, 0]);
  const panelScale  = useTransform(scrollYProgress, [0.53, 0.67], [1, 0.94]);

  return (
    // Outer div — 320dvh provides scroll runway
    <div
      ref={containerRef}
      style={{
        position: "relative",
        height: "200dvh",
      }}
    >
      {/* Inner panel — CSS sticky: no JS state, works natively on Android */}
      <motion.div
        style={{
          position: "sticky",
          top: 0,
          height: "100dvh",
          overflow: "hidden",
          touchAction: "pan-y",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--color-canvas)",
          opacity: panelOpacity,
          scale: panelScale,
        }}
      >
        {/* ── Background marquee ── */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              whiteSpace: "nowrap",
              animation: "campaign-marquee 20s linear infinite",
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(80px, 22vw, 440px)",
              fontWeight: 700,
              color: "rgba(29, 58, 97, 0.22)",
              letterSpacing: "0.08em",
              userSelect: "none",
            }}
          >
            <span>{TRACK}</span>
            <span aria-hidden="true">{TRACK}</span>
          </div>
        </div>

        {/* ── Video container ── */}
        <motion.div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100vw",
            height: "100dvh",
            scale,
            borderRadius: radius,
            opacity: videoOpacity,
            overflow: "hidden",
            willChange: "transform, opacity",
            transformOrigin: "center center",
          }}
        >
          <video
            src="/campaign.mp4"
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          {/* Soft edge vignette */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at center, transparent 50%, rgba(243,246,250,0.25) 100%)",
              pointerEvents: "none",
            }}
          />
        </motion.div>

        {/* ── Bottom label ── */}
        <motion.div
          style={{
            position: "absolute",
            bottom: "clamp(24px, 4.5vh, 48px)",
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            zIndex: 2,
            opacity: labelOpacity,
            y: labelY,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(14px, 1.8vw, 22px)",
              fontWeight: 700,
              letterSpacing: "0.35em",
              color: "#F3F6FA",
              textTransform: "uppercase",
              textShadow: "0 2px 16px rgba(0,0,0,0.45)",
            }}
          >
            Adorne Universe
          </span>
          <a
            href="#"
            style={{
              fontFamily: "var(--font-geist-sans, sans-serif)",
              fontSize: "10px",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "rgba(243,246,250,0.72)",
              textDecoration: "none",
              borderBottom: "1px solid rgba(243,246,250,0.45)",
              paddingBottom: "2px",
              cursor: "pointer",
              pointerEvents: "all",
              transition: "color 0.3s ease, border-color 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#F3F6FA";
              e.currentTarget.style.borderBottomColor = "#F3F6FA";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(243,246,250,0.72)";
              e.currentTarget.style.borderBottomColor = "rgba(243,246,250,0.45)";
            }}
          >
            Discover
          </a>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes campaign-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
