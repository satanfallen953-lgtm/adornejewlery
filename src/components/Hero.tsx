"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";

interface HeroProps {
  introPhase: number;
  isReturn?: boolean;
}

export default function Hero({ introPhase, isReturn = false }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);

  // ── Scroll parallax ──────────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imgY        = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY       = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  // ── Magnetic button ──────────────────────────────────────────────
  const btnX = useMotionValue(0);
  const btnY = useMotionValue(0);
  const springBtnX = useSpring(btnX, { stiffness: 180, damping: 18 });
  const springBtnY = useSpring(btnY, { stiffness: 180, damping: 18 });

  const handleBtnMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    btnX.set((e.clientX - cx) * 0.38);
    btnY.set((e.clientY - cy) * 0.38);
  };
  const handleBtnLeave = () => { btnX.set(0); btnY.set(0); };

  const ready = introPhase >= 3;

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        height: "100dvh",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "var(--color-tray)",
      }}
    >
      {/* ── Parallax background image ── */}
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
        <img
          src="/hero.jpg"
          alt="Adorne"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "50% 25%",
            display: "block",
            opacity: ready ? 1 : 0,
            transition: isReturn ? "opacity 0.25s ease" : "opacity 1.4s ease 0.2s",
          }}
        />
      </motion.div>

      {/* ── Dark gradient overlay ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(29,58,97,0.06) 0%, rgba(29,58,97,0.52) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Hero text ── */}
      <motion.div
        style={{
          position: "absolute",
          bottom: "clamp(48px, 12%, 120px)",
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "14px",
          y: textY,
          opacity: textOpacity,
          zIndex: 2,
        }}
      >
        <motion.p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "10px",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "rgba(243,246,250,0.7)",
          }}
          initial={isReturn ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={isReturn ? { duration: 0 } : { duration: 0.9, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
        >
          New Collection — 2026
        </motion.p>

        <motion.h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(42px, 8vw, 100px)",
            color: "#F3F6FA",
            fontWeight: 300,
            letterSpacing: "0.06em",
            lineHeight: 1.05,
            textAlign: "center",
            fontStyle: "italic",
          }}
          initial={isReturn ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
          transition={isReturn ? { duration: 0 } : { duration: 1.1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          Timeless Elegance
        </motion.h1>

        <motion.div
          initial={isReturn ? { opacity: 1 } : { opacity: 0 }}
          animate={ready ? { opacity: 1 } : { opacity: 0 }}
          transition={isReturn ? { duration: 0 } : { duration: 0.8, delay: 0.55 }}
        >
          <Link
            href="/jewelry"
            style={{
              marginTop: "6px",
              fontFamily: "var(--font-inter)",
              fontSize: "10px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#F3F6FA",
              textDecoration: "none",
              borderBottom: "1px solid rgba(243,246,250,0.5)",
              paddingBottom: "3px",
            }}
          >
            Build Your Own Bracelet
          </Link>
        </motion.div>

        {/* ── Magnetic "Shop Now" button ── */}
        <motion.div
          initial={isReturn ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={isReturn ? { duration: 0 } : { duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginTop: "18px" }}
          onMouseMove={handleBtnMove}
          onMouseLeave={handleBtnLeave}
        >
          <motion.div style={{ x: springBtnX, y: springBtnY }}>
            <Link
              ref={btnRef}
              href="/jewelry"
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "13px 36px",
                textDecoration: "none",
                overflow: "hidden",
                cursor: "pointer",
                background:
                  "linear-gradient(135deg, #d4d8dd 0%, #f0f2f5 18%, #b8bec7 35%, #e8ecf0 50%, #a8b0bc 65%, #dde2e8 80%, #c0c8d2 100%)",
                border: "1px solid rgba(255,255,255,0.55)",
                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.7) inset, 0 -1px 0 rgba(0,0,0,0.18) inset, 0 8px 32px rgba(29,58,97,0.28), 0 2px 8px rgba(0,0,0,0.22)",
                transition: "box-shadow 0.3s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 1px 0 rgba(255,255,255,0.7) inset, 0 -1px 0 rgba(0,0,0,0.18) inset, 0 14px 48px rgba(29,58,97,0.42), 0 4px 16px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 1px 0 rgba(255,255,255,0.7) inset, 0 -1px 0 rgba(0,0,0,0.18) inset, 0 8px 32px rgba(29,58,97,0.28), 0 2px 8px rgba(0,0,0,0.22)";
              }}
            >
              {/* Grid overlay */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
                  backgroundSize: "10px 10px",
                  pointerEvents: "none",
                }}
              />
              {/* Shine sweep */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.38) 50%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <span
                style={{
                  position: "relative",
                  fontFamily: "var(--font-inter)",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "#1D3A61",
                  zIndex: 1,
                }}
              >
                Shop Now
              </span>
              <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center" }}>
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="M0 5h12M8 1l4 4-4 4" stroke="#1D3A61" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        style={{
          position: "absolute",
          bottom: "clamp(18px, 3vh, 28px)",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "8px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(243,246,250,0.45)",
          }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: "1px",
            height: "28px",
            background: "linear-gradient(to bottom, rgba(243,246,250,0.5), transparent)",
          }}
        />
      </motion.div>

      {/* ── Bottom fade into canvas ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "80px",
          background: "linear-gradient(to bottom, transparent, var(--color-canvas))",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />
    </section>
  );
}
