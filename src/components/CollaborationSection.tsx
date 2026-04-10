"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function CollaborationSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Center image: scale from 1.08 → 1 (zoom-out parallax as you scroll in)
  const imgScale = useTransform(scrollYProgress, [0, 0.6], [1.1, 1]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  // Text fade up
  const textOpacity = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.3, 0.6], ["24px", "0px"]);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "var(--color-canvas)",
        paddingTop: "clamp(60px, 10vw, 100px)",
        paddingBottom: "clamp(60px, 10vw, 100px)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column" as const,
        justifyContent: "center",
      }}
    >
      {/* Marquee background text — scrolls right to left, behind everything */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 0,
        }}
        aria-hidden="true"
      >
        <motion.div
          style={{
            display: "flex",
            whiteSpace: "nowrap",
            willChange: "transform",
          }}
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 14,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(90px, 20vw, 280px)",
                color: "var(--color-ink)",
                opacity: 0.07,
                lineHeight: 1,
                letterSpacing: "-0.03em",
                paddingRight: "0.4em",
              }}
            >
              ADORNE
            </span>
          ))}
        </motion.div>
      </div>

      {/* Center content */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Model image with scroll parallax */}
        <div
          style={{
            width: "min(400px, 75vw)",
            aspectRatio: "3/4",
            overflow: "hidden",
          }}
        >
          <motion.img
            src="/female.jpg"
            alt="Adorne Signature Collection"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 10%",
              scale: imgScale,
              y: imgY,
              willChange: "transform, opacity",
            }}
          />
        </div>

        {/* Text below */}
        <motion.div
          style={{
            textAlign: "center",
            marginTop: "36px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
            opacity: textOpacity,
            y: textY,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "10px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "var(--color-ink)",
            }}
          >
            <span style={{ color: "var(--color-gold)" }}>Adorne</span>
            {" × "}
            Signature Collection
          </p>
          <a
            href="#"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "10px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--color-ink)",
              textDecoration: "underline",
              textUnderlineOffset: "5px",
              textDecorationColor: "rgba(26,28,41,0.4)",
              transition: "text-decoration-color 0.3s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.textDecorationColor = "var(--color-ink)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.textDecorationColor = "rgba(26,28,41,0.4)"; }}
          >
            Discover
          </a>
        </motion.div>
      </div>
    </section>
  );
}
