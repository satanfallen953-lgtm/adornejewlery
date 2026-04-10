"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import FadeUp from "./FadeUp";

export default function ParallaxGridSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -120]);

  return (
    <section ref={containerRef} className="relative w-full py-40 overflow-hidden bg-[#f9f7f4]">
      {/* Rotated text */}
      <div className="absolute left-8 md:left-24 top-1/2 -translate-y-1/2 -rotate-90 origin-left hidden lg:block z-10 pointer-events-none">
        <span className="text-[#c9a96e] tracking-[0.2em] uppercase text-sm font-semibold whitespace-nowrap">
          Beautés du Geometry
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center">
        <FadeUp delay={0.1}>
          <motion.div style={{ y: y1 }} className="w-full aspect-[3/4] overflow-hidden rounded-sm shadow-md">
            <img src="https://picsum.photos/seed/grid1/600/800" className="w-full h-full object-cover" alt="Geometric Collection 1" />
          </motion.div>
        </FadeUp>
        
        <FadeUp delay={0.25}>
          <motion.div style={{ y: y2 }} className="w-full aspect-[4/5] overflow-hidden rounded-sm shadow-md mt-0 md:mt-24">
            <img src="https://picsum.photos/seed/grid2/600/750" className="w-full h-full object-cover" alt="Geometric Collection 2" />
          </motion.div>
        </FadeUp>

        <FadeUp delay={0.4}>
          <motion.div style={{ y: y3 }} className="w-full aspect-[3/4] overflow-hidden rounded-sm shadow-md mt-0 md:-mt-24">
            <img src="https://picsum.photos/seed/grid3/600/800" className="w-full h-full object-cover" alt="Geometric Collection 3" />
          </motion.div>
        </FadeUp>
      </div>
    </section>
  );
}
