"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const PRODUCTS = [
  {
    name: "Luna Gold Bracelet",
    price: "$1,250",
    image: "https://picsum.photos/seed/adorne1/400/533",
  },
  {
    name: "Celestial Chain Necklace",
    price: "$2,450",
    image: "https://picsum.photos/seed/adorne2/400/533",
  },
  {
    name: "Eternal Diamond Ring",
    price: "$3,800",
    image: "https://picsum.photos/seed/adorne3/400/533",
  },
  {
    name: "Opulent Pearl Earrings",
    price: "$980",
    image: "https://picsum.photos/seed/adorne4/400/533",
  },
  {
    name: "Heritage Gold Anklet",
    price: "$1,650",
    image: "https://picsum.photos/seed/adorne5/400/533",
  },
  {
    name: "Sovereign Cuff",
    price: "$2,100",
    image: "https://picsum.photos/seed/adorne6/400/533",
  },
];

export default function HorizontalScroll() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Horizontal movement: x from 0 to negative (scroll left)
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66%"]);

  // Progress bar width
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: "300vh" }}
    >
      {/* Pinned inner */}
      <div
        className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center"
        style={{ backgroundColor: "#f8f5f0" }}
      >
        {/* Gold progress bar at top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#e8e2d8]">
          <motion.div
            className="h-full"
            style={{ width: progressWidth, backgroundColor: "#c9a96e" }}
          />
        </div>

        {/* Section label */}
        <div className="absolute top-8 left-8">
          <span
            className="small-caps"
            style={{ color: "#1A1C29", fontSize: "11px" }}
          >
            — The Collection
          </span>
        </div>

        {/* Horizontal products */}
        <motion.div
          className="flex items-center gap-8 px-12"
          style={{ x }}
        >
          {PRODUCTS.map((product, i) => (
            <div
              key={i}
              className="flex-shrink-0 group cursor-pointer"
              style={{ width: "320px" }}
            >
              <div className="bg-[#EFECE6] rounded-sm overflow-hidden mb-4 shadow-sm">
                <div
                  className="relative overflow-hidden"
                  style={{ aspectRatio: "3/4" }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
              <h3
                className="text-[16px] tracking-[0.03em] mb-1"
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: "#1A1C29",
                }}
              >
                {product.name}
              </h3>
              <p className="small-caps" style={{ color: "#c9a96e" }}>
                {product.price}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
