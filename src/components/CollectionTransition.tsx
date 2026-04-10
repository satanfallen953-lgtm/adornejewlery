"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

function DiamondRingSVG() {
  return (
    <svg
      viewBox="0 0 40 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle", width: "clamp(22px, 4.4vw, 33px)", height: "clamp(32px, 6.1vw, 46px)" }}
    >
      <polygon points="20,2 28,14 20,22 12,14" fill="none" stroke="#F3F6FA" strokeWidth="1.5" />
      <line x1="12" y1="14" x2="28" y2="14" stroke="#F3F6FA" strokeWidth="1" />
      <line x1="20" y1="2" x2="20" y2="22" stroke="#F3F6FA" strokeWidth="0.75" />
      <ellipse cx="20" cy="38" rx="14" ry="16" fill="none" stroke="#F3F6FA" strokeWidth="1.5" />
    </svg>
  );
}

const LEFT_LETTERS = ["A", "D"];
const RIGHT_LETTERS = ["R", "N", "E"];

export default function CollectionTransition() {
  const [visible, setVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const ringRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const allLetters = letterRefs.current.filter(Boolean);

    const tl = gsap.timeline({
      onComplete: () => setVisible(false),
    });

    // 1 ── Progress line sweeps from left to right (behind everything)
    tl.fromTo(
      progressLineRef.current,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.9, ease: "power2.inOut" },
      0
    );

    // 2 ── Letters stagger up from below, synced with line sweep
    tl.fromTo(
      allLetters,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, stagger: 0.065, ease: "power3.out" },
      0.1
    );

    // 3 ── Diamond ring pops in mid-stagger
    tl.fromTo(
      ringRef.current,
      { scale: 0.4, opacity: 0, rotate: -15 },
      { scale: 1, opacity: 1, rotate: 0, duration: 0.45, ease: "back.out(1.4)" },
      0.25
    );

    // 4 ── Gold rule under logo extends from center
    tl.fromTo(
      lineRef.current,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 0.6, duration: 0.5, ease: "power2.inOut" },
      "-=0.15"
    );

    // 5 ── Subtitle fades in
    tl.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.38, ease: "power2.out" },
      "-=0.2"
    );

    // 6 ── Brief hold then content fades out
    tl.to(
      [allLetters, ringRef.current, lineRef.current, subtitleRef.current, progressLineRef.current],
      { opacity: 0, y: -10, duration: 0.3, stagger: 0, ease: "power2.in" },
      "+=0.22"
    );

    // 7 ── Whole panel slides up (exit)
    tl.to(
      containerRef.current,
      { y: "-100%", duration: 0.72, ease: "power3.inOut" },
      "-=0.1"
    );
  }, { scope: containerRef });

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        backgroundColor: "var(--color-ink)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        overflow: "hidden",
      }}
    >
      {/* Progress sweep line — full-width behind everything */}
      <div
        ref={progressLineRef}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 2,
          width: "100%",
          backgroundColor: "var(--color-gold)",
          opacity: 0,
          transformOrigin: "left center",
        }}
      />

      {/* Logo wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {/* "AD" letters */}
        {LEFT_LETTERS.map((letter, i) => (
          <span
            key={`left-${i}`}
            ref={el => { letterRefs.current[i] = el; }}
            style={{
              fontFamily: "var(--font-playfair)",
              color: "#F3F6FA",
              fontSize: "clamp(36px, 7vw, 52px)",
              letterSpacing: "0.24em",
              fontWeight: 400,
              display: "inline-block",
              opacity: 0,
            }}
          >
            {letter}
          </span>
        ))}

        {/* Diamond ring */}
        <div ref={ringRef} style={{ padding: "0 6px", opacity: 0 }}>
          <DiamondRingSVG />
        </div>

        {/* "RNE" letters */}
        {RIGHT_LETTERS.map((letter, i) => (
          <span
            key={`right-${i}`}
            ref={el => { letterRefs.current[LEFT_LETTERS.length + i] = el; }}
            style={{
              fontFamily: "var(--font-playfair)",
              color: "#F3F6FA",
              fontSize: "clamp(36px, 7vw, 52px)",
              letterSpacing: "0.24em",
              fontWeight: 400,
              display: "inline-block",
              opacity: 0,
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      {/* Gold rule */}
      <div
        ref={lineRef}
        style={{
          height: 1,
          width: 72,
          backgroundColor: "var(--color-gold)",
          opacity: 0,
          transformOrigin: "center",
        }}
      />

      {/* Subtitle */}
      <p
        ref={subtitleRef}
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 8,
          letterSpacing: "0.44em",
          textTransform: "uppercase",
          color: "var(--color-gold)",
          margin: 0,
          opacity: 0,
        }}
      >
        The Collection
      </p>
    </div>
  );
}
