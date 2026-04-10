"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

interface CollectionCardProps {
  image: string;
  label: string;
  alt: string;
}

function CollectionCard({ image, label, alt }: CollectionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: false, margin: "-10%" });

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  // Image scale from 1.0 to 1.05 on scroll into view
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.05, 1.05]);

  return (
    <div
      ref={cardRef}
      className="relative w-full h-full overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image with scroll-based scale */}
      <motion.div className="absolute inset-0" style={{ scale }}>
        <img
          src={image}
          alt={alt}
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      {/* Navy overlay on hover */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: "var(--color-ink)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.4 : 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* Text and button */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-16"
        animate={{ y: isHovered ? -8 : 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Label - slides up from bottom on scroll */}
        <motion.h2
          className="text-white text-[32px] tracking-[0.12em] mb-6"
          style={{ fontFamily: "var(--font-playfair)" }}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {label}
        </motion.h2>

        <motion.button
          className="px-8 py-3 border border-canvas text-canvas rounded-full small-caps bg-transparent cursor-pointer hover:bg-canvas hover:text-ink transition-colors duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            duration: 0.9,
            delay: 0.15,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          Shop Now
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function HerHisSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section ref={sectionRef} className="w-full" style={{ height: "90vh" }}>
      <div className="flex w-full h-full">
        <div className="w-1/2 h-full">
          <CollectionCard
            image="/female.jpg"
            label="HER COLLECTION"
            alt="ADORNE Women's Collection"
          />
        </div>
        <div className="w-1/2 h-full">
          <CollectionCard
            image="/male.jpg"
            label="HIS COLLECTION"
            alt="ADORNE Men's Collection"
          />
        </div>
      </div>
    </section>
  );
}
