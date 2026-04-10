"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const CARDS: {
  title: string;
  description: string;
  href: string;
  iconAnim: string;
  icon: React.ReactNode;
}[] = [
  {
    title: "Gift Wrapping",
    description: "Elevate gifting experience for the lovely one",
    href: "#",
    iconAnim: "svc-float 3.2s ease-in-out infinite",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="13" width="24" height="16" rx="1" />
        <rect x="2" y="9" width="28" height="4" rx="1" />
        <path d="M16 9V29" />
        <path d="M16 9C16 9 12 3 9 3C7 3 6 5 6 6C6 8 8 9 16 9Z" />
        <path d="M16 9C16 9 20 3 23 3C25 3 26 5 26 6C26 8 24 9 16 9Z" />
      </svg>
    ),
  },
  {
    title: "Shipping & Return",
    description: "Ensure a trust with our customers",
    href: "#",
    iconAnim: "svc-truck 2.8s ease-in-out infinite",
    icon: (
      <svg width="36" height="28" viewBox="0 0 36 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="1" />
        <path d="M23 9h7l5 6v7h-12V9Z" />
        <circle cx="8" cy="23" r="3" />
        <circle cx="27" cy="23" r="3" />
        <path d="M5 23H1V4" />
        <path d="M11 23h13" />
      </svg>
    ),
  },
  {
    title: "Jewelry Packaging",
    description: "Adds value to the perceived quality of the product",
    href: "#",
    iconAnim: "svc-tilt 3.6s ease-in-out infinite",
    icon: (
      <svg width="30" height="32" viewBox="0 0 30 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 10L15 4L28 10V22L15 28L2 22V10Z" />
        <path d="M2 10L15 16L28 10" />
        <path d="M15 16V28" />
        <path d="M8.5 7L21.5 13" />
      </svg>
    ),
  },
];

const PARALLAX_OFFSETS = [80, 56, 32];

function GlassCard({
  card,
  index,
  sectionRef,
}: {
  card: (typeof CARDS)[0];
  index: number;
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });
  const y       = useTransform(scrollYProgress, [0, 1], [`${PARALLAX_OFFSETS[index]}px`, "0px"]);
  const opacity = useTransform(scrollYProgress, [0, 0.4 + index * 0.1], [0, 1]);

  // ── CSS 3D tilt ──────────────────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current!.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top)  / rect.height;
    setTilt({ x: (py - 0.5) * -16, y: (px - 0.5) * 16 });
    setShine({ x: px * 100, y: py * 100 });
  };
  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  };
  const handleMouseEnter = () => setHovered(true);

  return (
    <motion.div style={{ y, opacity, perspective: "800px" }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: hovered
            ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(8px)`
            : "perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
          transition: hovered
            ? "transform 0.08s ease-out, box-shadow 0.35s ease"
            : "transform 0.6s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease",
          willChange: "transform",
          borderRadius: "8px",
          overflow: "hidden",
          // Liquid glass effect
          background: hovered
            ? "rgba(255,255,255,0.78)"
            : "rgba(255,255,255,0.62)",
          backdropFilter: "blur(18px) saturate(1.5)",
          WebkitBackdropFilter: "blur(18px) saturate(1.5)",
          border: "1px solid rgba(255,255,255,0.72)",
          boxShadow: hovered
            ? "0 24px 64px rgba(29,58,97,0.18), 0 4px 16px rgba(29,58,97,0.1), inset 0 1px 0 rgba(255,255,255,0.9)"
            : "0 8px 32px rgba(29,58,97,0.09), 0 1px 4px rgba(29,58,97,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
          padding: "clamp(36px, 5vw, 64px) clamp(20px, 3vw, 40px)",
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          textAlign: "center" as const,
          gap: "20px",
          cursor: "default",
        }}
      >
        {/* Shine overlay */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.22) 0%, transparent 60%)`,
            pointerEvents: "none",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s ease",
            borderRadius: "8px",
          }}
        />

        {/* Icon circle — 3D lifted */}
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: hovered
              ? "linear-gradient(135deg, #EEF2F8 0%, #dce6f0 100%)"
              : "linear-gradient(135deg, #F3F6FA 0%, #e4eaf3 100%)",
            boxShadow: hovered
              ? "0 12px 28px rgba(29,58,97,0.16), 0 2px 6px rgba(29,58,97,0.1), inset 0 1px 0 rgba(255,255,255,1)"
              : "0 4px 12px rgba(29,58,97,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-ink)",
            flexShrink: 0,
            transform: hovered ? "translateZ(12px)" : "translateZ(0px)",
            transition: "box-shadow 0.35s ease, transform 0.35s ease, background 0.35s ease",
          }}
        >
          <div style={{ animation: card.iconAnim, display: "flex" }}>
            {card.icon}
          </div>
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(12px, 1.4vw, 17px)",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-ink)",
            margin: 0,
            transform: hovered ? "translateZ(8px)" : "translateZ(0)",
            transition: "transform 0.35s ease",
          }}
        >
          {card.title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontFamily: "var(--font-geist-sans, sans-serif)",
            fontSize: "clamp(9px, 0.9vw, 11px)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--color-ink)",
            opacity: 0.55,
            margin: 0,
            lineHeight: 1.7,
            maxWidth: "220px",
          }}
        >
          {card.description}
        </p>

        {/* Learn More */}
        <a
          href={card.href}
          style={{
            fontFamily: "var(--font-geist-sans, sans-serif)",
            fontSize: "10px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--color-ink)",
            textDecoration: "none",
            borderBottom: "1px solid var(--color-ink)",
            paddingBottom: "2px",
            marginTop: "4px",
            opacity: hovered ? 1 : 0.65,
            transition: "opacity 0.25s ease",
            cursor: "pointer",
          }}
        >
          Learn More
        </a>
      </div>
    </motion.div>
  );
}

export default function ServiceCards() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        backgroundColor: "var(--color-canvas)",
        padding: "clamp(64px, 10vw, 120px) clamp(24px, 6vw, 80px)",
      }}
    >
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{
          textAlign: "center",
          marginBottom: "clamp(40px, 6vw, 64px)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "9px",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "var(--color-ink)",
            opacity: 0.45,
            marginBottom: "12px",
          }}
        >
          The Adorne Promise
        </p>
        <h2
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(26px, 4vw, 48px)",
            fontWeight: 300,
            fontStyle: "italic",
            color: "var(--color-ink)",
            letterSpacing: "0.04em",
          }}
        >
          Crafted with Intention
        </h2>
      </motion.div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        style={{
          gap: "clamp(16px, 3vw, 32px)",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {CARDS.map((card, i) => (
          <div
            key={card.title}
            style={{ position: "relative" }}
            className={
              i === CARDS.length - 1
                ? "sm:col-span-2 sm:max-w-[360px] sm:mx-auto lg:col-span-1 lg:max-w-none"
                : ""
            }
          >
            <GlassCard card={card} index={i} sectionRef={sectionRef} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes svc-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes svc-truck {
          0%, 100% { transform: translateX(0); }
          30%       { transform: translateX(4px); }
          70%       { transform: translateX(-2px); }
        }
        @keyframes svc-tilt {
          0%, 100% { transform: rotate(0deg); }
          40%       { transform: rotate(4deg); }
          70%       { transform: rotate(-3deg); }
        }
      `}</style>
    </section>
  );
}
