"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const COLLECTIONS = [
  {
    name: "Beauté du Geometry",
    centerImg: "/female.jpg",
    leftImgs: ["/products/Bracelets-removebg-preview.png", "/products/ItalianBracelets-removebg-preview.png"],
    rightImgs: ["/products/Necklaces-removebg-preview.png", "/products/MatchingBracelets-removebg-preview.png"],
    centerPos: "center 15%",
  },
  {
    name: "Le Voyage Précieux",
    centerImg: "/male.jpg",
    leftImgs: ["/products/Charms-removebg-preview.png", "/products/Bracelets-removebg-preview.png"],
    rightImgs: ["/products/ItalianBracelets-removebg-preview.png", "/products/Necklaces-removebg-preview.png"],
    centerPos: "center 25%",
  },
];

function CollectionName({ name, visible }: { name: string; visible: boolean }) {
  const words = name.split(" ");
  return (
    <span>
      {words.map((word, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block", marginRight: "0.3em" }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.6, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export default function ThreePanelSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Panels shift horizontally at different speeds
  const xLeft   = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const xCenter = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const xRight  = useTransform(scrollYProgress, [0, 1], ["0%",  "22%"]);

  // Center image parallax — slower than container
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  // Collection transition at ~50% scroll
  const col0Opacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [1, 1, 0, 0]);
  const col1Opacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 0, 1, 1]);

  return (
    <section
      ref={containerRef}
      style={{ height: "280vh", position: "relative" }}
    >
      <div
        className="sticky top-0 overflow-hidden"
        style={{ height: "100vh", backgroundColor: "var(--color-canvas)" }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>

          {/* Three-column grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 1fr", width: "100%", height: "calc(100% - 52px)" }}>

            {/* Left — product images on parchment */}
            <motion.div
              style={{
                backgroundColor: "#E7E2D9",
                x: xLeft,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "12px",
                padding: "40px 24px",
                position: "relative",
                overflow: "hidden",
                willChange: "transform",
              }}
            >
              {COLLECTIONS.map((col, ci) => (
                <motion.div
                  key={ci}
                  style={{
                    position: ci === 0 ? "relative" : "absolute",
                    inset: ci === 0 ? undefined : 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "12px",
                    padding: "40px 24px",
                    opacity: ci === 0 ? col0Opacity : col1Opacity,
                    width: "100%",
                  }}
                >
                  {col.leftImgs.map((src, i) => (
                    <div
                      key={i}
                      style={{
                        background: "var(--color-canvas)",
                        padding: "20px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <img src={src} alt="" style={{ width: "140px", height: "140px", objectFit: "contain" }} />
                    </div>
                  ))}
                </motion.div>
              ))}
            </motion.div>

            {/* Center — dark with model image + parallax */}
            <motion.div
              style={{ position: "relative", overflow: "hidden", x: xCenter, willChange: "transform" }}
            >
              {COLLECTIONS.map((col, ci) => (
                <motion.div
                  key={ci}
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: ci === 0 ? col0Opacity : col1Opacity,
                    backgroundColor: "#1D3A61",
                  }}
                >
                  <motion.img
                    src={col.centerImg}
                    alt={col.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: col.centerPos,
                      opacity: 0.7,
                      y: imgY,
                      willChange: "transform",
                    }}
                  />
                </motion.div>
              ))}

              {/* Collection name overlay */}
              <div style={{ position: "absolute", bottom: "36px", left: "24px", right: "24px", zIndex: 2 }}>
                {COLLECTIONS.map((col, ci) => (
                  <motion.div
                    key={ci}
                    style={{
                      position: ci === 0 ? "relative" : "absolute",
                      bottom: ci === 0 ? undefined : 0,
                      left: ci === 0 ? undefined : 0,
                      opacity: ci === 0 ? col0Opacity : col1Opacity,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-cormorant)",
                        color: "white",
                        fontSize: "clamp(18px, 2.2vw, 30px)",
                        letterSpacing: "0.06em",
                        fontStyle: "italic",
                        fontWeight: 300,
                      }}
                    >
                      {col.name}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right — product images on parchment */}
            <motion.div
              style={{
                backgroundColor: "#E7E2D9",
                x: xRight,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "12px",
                padding: "40px 24px",
                position: "relative",
                overflow: "hidden",
                willChange: "transform",
              }}
            >
              {COLLECTIONS.map((col, ci) => (
                <motion.div
                  key={ci}
                  style={{
                    position: ci === 0 ? "relative" : "absolute",
                    inset: ci === 0 ? undefined : 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "12px",
                    padding: "40px 24px",
                    opacity: ci === 0 ? col0Opacity : col1Opacity,
                    width: "100%",
                  }}
                >
                  {col.rightImgs.map((src, i) => (
                    <div
                      key={i}
                      style={{
                        background: "var(--color-canvas)",
                        padding: "20px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <img src={src} alt="" style={{ width: "140px", height: "140px", objectFit: "contain" }} />
                    </div>
                  ))}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              height: "52px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 28px",
              borderTop: "1px solid rgba(29,58,97,0.1)",
              backgroundColor: "var(--color-canvas)",
            }}
          >
            <span style={{ fontFamily: "var(--font-inter)", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-ink)" }}>
              Adorne Universe
            </span>
            <a
              href="#"
              style={{ fontFamily: "var(--font-inter)", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-ink)", textDecoration: "underline", textUnderlineOffset: "4px" }}
            >
              Discover
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
