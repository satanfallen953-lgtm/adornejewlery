"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import styles from "./LuxuryShowcase.module.css";

const PRODUCTS = [
  { img: "/products/Bracelets-removebg-preview.png",        name: "Diamond Bracelet",  href: "/jewelry" },
  { img: "/products/Charms-removebg-preview.png",           name: "Gold Charms",        href: "/jewelry" },
  { img: "/products/ItalianBracelets-removebg-preview.png", name: "Italian Bracelet",   href: "/jewelry" },
  { img: "/products/MatchingBracelets-removebg-preview.png",name: "Matching Set",       href: "/jewelry" },
  { img: "/products/Necklaces-removebg-preview.png",        name: "Diamond Necklace",   href: "/jewelry" },
];

const TRACK = [...PRODUCTS, ...PRODUCTS, ...PRODUCTS];

function TiltCard({ product }: { product: (typeof TRACK)[0] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, shine: { x: 50, y: 50 } });
  const [hovered, setHovered] = useState(false);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current!.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top)  / rect.height;
    setTilt({ x: (py - 0.5) * -14, y: (px - 0.5) * 14, shine: { x: px * 100, y: py * 100 } });
  };
  const handleLeave = () => {
    setTilt({ x: 0, y: 0, shine: { x: 50, y: 50 } });
    setHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleLeave}
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div
        style={{
          width: "clamp(200px, 50vw, 280px)",
          flexShrink: 0,
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: hovered
            ? `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(10px)`
            : "perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
          transition: hovered
            ? "transform 0.08s ease-out"
            : "transform 0.7s cubic-bezier(0.16,1,0.3,1)",
          willChange: "transform",
        }}
      >
        <Link href={product.href} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Image wrapper with subtle glass background on hover */}
          <div
            style={{
              width: "clamp(200px, 50vw, 280px)",
              height: "clamp(260px, 65vw, 360px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
              borderRadius: "4px",
              background: hovered
                ? "rgba(255,255,255,0.45)"
                : "transparent",
              boxShadow: hovered
                ? "0 20px 60px rgba(29,58,97,0.14), 0 4px 16px rgba(29,58,97,0.08)"
                : "none",
              transition: "background 0.4s ease, box-shadow 0.4s ease",
            }}
          >
            {/* Shine on hover */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(circle at ${tilt.shine.x}% ${tilt.shine.y}%, rgba(255,255,255,0.28) 0%, transparent 55%)`,
                opacity: hovered ? 1 : 0,
                transition: "opacity 0.3s ease",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
            <img
              src={product.img}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                background: "transparent",
                transform: hovered ? "scale(1.07)" : "scale(1)",
                transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1)",
                position: "relative",
                zIndex: 0,
              }}
            />
          </div>

          {/* Card info */}
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <p
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(15px, 1.4vw, 20px)",
                fontWeight: 300,
                fontStyle: "italic",
                letterSpacing: "0.04em",
                color: "var(--color-ink)",
                margin: 0,
                transition: "opacity 0.25s ease",
                opacity: hovered ? 1 : 0.85,
              }}
            >
              {product.name}
            </p>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                marginTop: "8px",
                fontFamily: "var(--font-inter)",
                fontSize: "9px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--color-ink)",
                opacity: hovered ? 0.75 : 0.35,
                transition: "opacity 0.3s ease",
              }}
            >
              Explore
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M0 4h8M5 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function LuxuryShowcase() {
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", width: "100%", overflow: "hidden" }}>

      {/* ── Section header ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          textAlign: "center",
          padding: "clamp(56px, 8vw, 96px) 0 clamp(32px, 5vw, 56px)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "9px",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "var(--color-ink)",
            opacity: 0.42,
            marginBottom: "12px",
          }}
        >
          Curated Selection
        </p>
        <h2
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(26px, 4vw, 52px)",
            fontWeight: 300,
            fontStyle: "italic",
            color: "var(--color-ink)",
            letterSpacing: "0.04em",
            lineHeight: 1.1,
          }}
        >
          The Collection
        </h2>
      </motion.div>

      {/* ── Infinite marquee strip with tilt cards ── */}
      <div
        style={{
          display: "flex",
          width: "100%",
          overflow: "hidden",
          paddingBottom: "clamp(48px, 8vw, 88px)",
        }}
      >
        <div className={styles.marqueeTrack}>
          {TRACK.map((product, i) => (
            <TiltCard key={i} product={product} />
          ))}
        </div>
      </div>

    </div>
  );
}
