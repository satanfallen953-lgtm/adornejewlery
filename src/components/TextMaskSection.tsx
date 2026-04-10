"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const SEGMENTS = [
  { text: "Jewelry is more than" },
  { text: "just an accessory," },
  { text: "it's an expression" },
  { text: "of timeless beauty." },
];

// Splits text into individual characters with staggered blur+fade entrance
function CharReveal({ text, lineDelay }: { text: string; lineDelay: number }) {
  return (
    <motion.span
      style={{ display: "block", lineHeight: 1.25 }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, filter: "blur(8px)", y: 18 },
            visible: {
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
              transition: {
                duration: 0.65,
                delay: lineDelay + i * 0.028,
                ease: [0.16, 1, 0.3, 1],
              },
            },
          }}
          style={{
            display: "inline-block",
            // Preserve space characters
            whiteSpace: char === " " ? "pre" : undefined,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export default function TextMaskSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const sectionY = useTransform(scrollYProgress, [0, 1], ["40px", "-40px"]);

  // Scroll-driven colour shift: ink → blue-mid
  const textColor = useTransform(
    scrollYProgress,
    [0.2, 0.8],
    ["#1D3A61", "#3E6FA3"]
  );

  return (
    <section
      ref={sectionRef}
      style={{
        width: "100%",
        backgroundColor: "var(--color-canvas)",
        padding: "clamp(64px, 12vw, 120px) 0 clamp(72px, 14vw, 140px)",
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative ring */}
      <motion.div
        style={{
          position: "absolute",
          width: "min(700px, 90vw)",
          height: "min(700px, 90vw)",
          borderRadius: "50%",
          border: "1px solid rgba(29,58,97,0.06)",
          top: "50%",
          left: "50%",
          x: "-50%",
          y: "-50%",
          rotate: useTransform(scrollYProgress, [0, 1], [0, 25]),
          pointerEvents: "none",
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          width: "min(450px, 60vw)",
          height: "min(450px, 60vw)",
          borderRadius: "50%",
          border: "1px solid rgba(29,58,97,0.04)",
          top: "50%",
          left: "50%",
          x: "-50%",
          y: "-50%",
          rotate: useTransform(scrollYProgress, [0, 1], [0, -15]),
          pointerEvents: "none",
        }}
      />

      <motion.div
        style={{
          y: sectionY,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 clamp(16px, 5vw, 32px)",
          willChange: "transform",
        }}
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "9px",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "var(--color-ink)",
            opacity: 0.42,
            marginBottom: "28px",
          }}
        >
          Our Philosophy
        </motion.p>

        {/* Main text with per-character reveal */}
        <motion.div
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(32px, 6.5vw, 88px)",
            color: textColor,
            textAlign: "center",
            fontStyle: "italic",
            fontWeight: 300,
            lineHeight: 1.25,
            maxWidth: "1100px",
          }}
        >
          {SEGMENTS.map((seg, i) => (
            <CharReveal key={i} text={seg.text} lineDelay={i * 0.08} />
          ))}
        </motion.div>

        {/* Decorative rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: "clamp(40px, 6vw, 80px)",
            height: "1px",
            background: "linear-gradient(to right, transparent, var(--color-ink), transparent)",
            marginTop: "clamp(28px, 4vw, 48px)",
            transformOrigin: "center",
          }}
        />
      </motion.div>
    </section>
  );
}
