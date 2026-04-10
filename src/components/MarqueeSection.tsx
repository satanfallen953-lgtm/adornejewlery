"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function MarqueeSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  return (
    <section ref={containerRef} className="relative w-full overflow-hidden bg-canvas py-24">
      <motion.div
        style={{ x }}
        className="flex whitespace-nowrap"
      >
        <h1
          style={{
            fontSize: "15vw",
            color: "var(--color-ink)",
            opacity: 0.06,
            fontFamily: "var(--font-playfair)",
            margin: 0,
            padding: 0,
            lineHeight: 1
          }}
        >
          ADORNE — FINE JEWELLERY — ADORNE — FINE JEWELLERY — ADORNE — FINE JEWELLERY — ADORNE — FINE JEWELLERY — 
        </h1>
      </motion.div>
    </section>
  );
}
