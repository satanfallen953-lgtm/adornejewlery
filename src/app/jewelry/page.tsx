"use client";

import { Suspense, useRef, useState } from "react";
import { useSearchParams as useNextSearchParams } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import ShopSidebar from "@/components/ShopSidebar";
import CollectionHero from "@/components/CollectionHero";
import CollectionTransition from "@/components/CollectionTransition";
import Navbar from "@/components/Navbar";

const CATEGORY_TITLES: Record<string, string> = {
  all:                    "All Jewelry",
  "mens-accessories":     "Men's Accessories",
  "watch-belt-n-charms":  "Watch Belt N Charms",
  "italian-bracelets":    "Italian Bracelet",
  bracelets:              "Bracelets",
  "engraved-jewellery":   "Engraved Jewellery",
  "matching-bracelets":   "Matching Bracelets",
  anklets:                "Anklets",
  charms:                 "Charms",
  necklaces:              "Necklaces",
  earrings:               "Earrings",
  "jewelry-sets":         "Jewelry Sets",
  rings:                  "Rings",
};

import { PRODUCTS } from "@/data/products";

const ITEMS = PRODUCTS.map(p => ({
  id:       p.id,
  img:      p.images[0],
  hoverImg: p.images[1],
  name:     p.name,
  price:    `$${p.price}`,
  material: p.material,
  isNew:    p.isNew,
}));

/* ── SVG icons ── */
function DiamondRingSVG({ color = "currentColor" }: { color?: string }) {
  return (
    <svg viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle", width: 11, height: 16 }}>
      <polygon points="20,2 28,14 20,22 12,14" fill="none" stroke={color} strokeWidth="1.5" />
      <line x1="12" y1="14" x2="28" y2="14" stroke={color} strokeWidth="1" />
      <line x1="20" y1="2" x2="20" y2="22" stroke={color} strokeWidth="0.75" />
      <ellipse cx="20" cy="38" rx="14" ry="16" fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

/* ── Cartier-style full-width breadcrumb bar ── */
function BreadcrumbBar() {
  const searchParams = useNextSearchParams();
  const category = searchParams.get("category") ?? "all";
  const title = (CATEGORY_TITLES[category] ?? "All Jewelry").toUpperCase();

  return (
    <motion.div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        height: 44,
        borderBottom: "1px solid var(--color-tray)",
        backgroundColor: "var(--color-canvas)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Left — breadcrumb path */}
      <div className="flex items-center" style={{ gap: "10px" }}>
        {[
          { label: "Home", href: "/" },
          { label: "Jewelry", href: "/jewelry" },
          { label: title, href: null },
        ].map((crumb, i, arr) => (
          <span key={crumb.label} className="flex items-center" style={{ gap: "10px" }}>
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="no-underline"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 8,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(29,58,97,0.32)",
                  transition: "color 0.18s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--color-ink)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(29,58,97,0.32)")}
              >
                {crumb.label}
              </Link>
            ) : (
              <span style={{
                fontFamily: "var(--font-inter)",
                fontSize: 8,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--color-ink)",
                fontWeight: 500,
              }}>
                {crumb.label}
              </span>
            )}
            {i < arr.length - 1 && (
              <span style={{
                fontFamily: "var(--font-inter)",
                fontSize: 8,
                color: "rgba(29,58,97,0.18)",
                letterSpacing: 0,
              }}>/</span>
            )}
          </span>
        ))}
      </div>

      {/* Right — piece count */}
      <span style={{
        fontFamily: "var(--font-inter)",
        fontSize: 8,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "rgba(29,58,97,0.32)",
      }}>
        {ITEMS.length} Pieces
      </span>
    </motion.div>
  );
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  all:                   "A complete edit — every piece crafted with intention",
  "mens-accessories":    "Refined masculinity — understated strength in every piece",
  "watch-belt-n-charms": "The details that define a look — watches, belts and charms for him",
  "italian-bracelets":   "Heritage Italian craftsmanship, reimagined for the modern wearer",
  bracelets:             "From delicate chains to bold cuffs, each wrist deserves elegance",
  "engraved-jewellery":  "Personalised pieces that carry a name, a date, a memory",
  "matching-bracelets":  "Worn together, remembered always — sets made to be shared",
  anklets:               "Delicate chains that move with you, season after season",
  charms:                "Build a story, one charm at a time",
  necklaces:             "Layered or worn alone — the centrepiece of every look",
  earrings:              "From subtle studs to dramatic drops",
  "jewelry-sets":        "Curated pairs and sets designed to move as one",
  rings:                 "Mark every moment with a piece that endures",
};

/* ── Cartier-style full-width collection intro ── */
function CollectionIntroBlock() {
  const searchParams = useNextSearchParams();
  const category = searchParams.get("category") ?? "all";
  const title = CATEGORY_TITLES[category] ?? "All Jewelry";
  const description = CATEGORY_DESCRIPTIONS[category] ?? CATEGORY_DESCRIPTIONS.all;

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -48]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const dividerScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.6]);

  return (
    <motion.section
      ref={sectionRef}
      style={{
        backgroundColor: "var(--color-canvas)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "clamp(36px, 8vw, 64px) clamp(16px, 5vw, 48px) clamp(32px, 7vw, 52px)",
        borderBottom: "1px solid var(--color-tray)",
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Collection name — parallax drift on scroll */}
      <motion.h1
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(40px, 6vw, 82px)",
          fontWeight: 300,
          fontStyle: "italic",
          letterSpacing: "0.06em",
          color: "var(--color-ink)",
          lineHeight: 1,
          margin: 0,
          y: titleY,
          opacity: titleOpacity,
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {title}
      </motion.h1>

      {/* Gold divider — shrinks on scroll */}
      <motion.div
        style={{
          height: 1, backgroundColor: "var(--color-gold)", opacity: 0.55, marginTop: 28,
          scaleX: dividerScale, transformOrigin: "center",
        }}
        initial={{ width: 56, scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Description */}
      <motion.p
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: "clamp(9px, 1vw, 11px)",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "rgba(29,58,97,0.75)",
          marginTop: 20,
          lineHeight: 1.8,
          maxWidth: 520,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.55 }}
      >
        {description}
      </motion.p>

      {/* Category tabs */}
      <motion.nav
        className="flex items-center flex-wrap justify-center"
        style={{ gap: "10px 20px", marginTop: 36 }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.65 }}
      >
        {Object.entries(CATEGORY_TITLES).map(([slug, label]) => {
          const isActive = category === slug;
          const href = slug === "all" ? "/jewelry" : `/jewelry?category=${slug}`;
          return (
            <Link
              key={slug}
              href={href}
              className="no-underline relative group"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "clamp(10px, 1.2vw, 11px)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: isActive ? "var(--color-ink)" : "rgba(29,58,97,0.62)",
                fontWeight: isActive ? 600 : 400,
                padding: "6px 2px",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--color-ink)"; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "rgba(29,58,97,0.62)"; }}
            >
              {label}
              {/* Active underline */}
              <span style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: "var(--color-ink)",
                opacity: isActive ? 1 : 0,
                transition: "opacity 0.2s ease",
              }} />
              {/* Hover underline */}
              {!isActive && (
                <span
                  className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full"
                  style={{
                    backgroundColor: "rgba(29,58,97,0.3)",
                    transition: "width 0.3s cubic-bezier(0.16,1,0.3,1)",
                  }}
                />
              )}
            </Link>
          );
        })}
      </motion.nav>

      {/* Piece count — Cartier right-aligns this, we'll show it below tabs */}
      <motion.p
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 8,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(29,58,97,0.28)",
          marginTop: 24,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        {ITEMS.length} Pieces
      </motion.p>
    </motion.section>
  );
}

/* ── Top header bar (Mejuri-style two rows) ── */
function ShopTopBar({ title }: { title: string }) {
  return (
    <motion.header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        backgroundColor: "var(--color-canvas)",
        borderBottom: "1px solid var(--color-tray)",
      }}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Row 1 — back | ADORNE | icons */}
      <div className="flex items-center justify-between" style={{ padding: "0 48px", height: 60 }}>
        {/* Left */}
        <Link
          href="/"
          className="no-underline flex items-center gap-[7px] cursor-pointer"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 8,
            letterSpacing: "0.20em",
            textTransform: "uppercase",
            color: "rgba(29,58,97,0.38)",
            transition: "color 0.18s ease",
            minWidth: 90,
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--color-ink)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(29,58,97,0.38)"}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Home
        </Link>

        {/* Center — ADORNE */}
        <Link href="/" className="no-underline flex flex-col items-center select-none"
          style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          <span className="flex items-center">
            <span style={{
              fontFamily: "var(--font-playfair)", color: "var(--color-ink)",
              fontSize: 24, letterSpacing: "0.28em", fontWeight: 400, marginRight: "-0.12em",
            }}>AD</span>
            <span style={{ padding: "0 5px" }}>
              <DiamondRingSVG color="var(--color-ink)" />
            </span>
            <span style={{
              fontFamily: "var(--font-playfair)", color: "var(--color-ink)",
              fontSize: 24, letterSpacing: "0.28em", fontWeight: 400,
            }}>RNE</span>
          </span>
          <span style={{
            marginTop: 3, fontSize: 5.5, letterSpacing: "0.44em",
            textTransform: "uppercase", color: "var(--color-gold)",
            fontFamily: "var(--font-inter)", opacity: 0.75,
          }}>Fine Jewelry</span>
        </Link>

        {/* Right — icons */}
        <div className="flex items-center gap-5" style={{ minWidth: 90, justifyContent: "flex-end" }}>
          {[
            { icon: HeartIcon, label: "Saved" },
            { icon: SearchIcon, label: "Search" },
            { icon: BagIcon, label: "Bag" },
          ].map(({ icon: Icon, label }) => (
            <button key={label} aria-label={label}
              className="cursor-pointer flex items-center"
              style={{ background: "none", border: "none", color: "rgba(29,58,97,0.38)", transition: "color 0.18s ease", padding: 0 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--color-ink)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(29,58,97,0.38)"}
            >
              <Icon />
            </button>
          ))}
        </div>
      </div>

      {/* Row 2 — breadcrumb left | count right */}
      <div className="flex items-center justify-between"
        style={{ padding: "0 48px", height: 34, borderTop: "1px solid var(--color-tray)" }}>
        <div className="flex items-center gap-[7px]" style={{
          fontFamily: "var(--font-inter)", fontSize: 8, letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}>
          <Link href="/jewelry" className="no-underline" style={{ color: "rgba(29,58,97,0.35)", transition: "color 0.18s ease" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--color-ink)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(29,58,97,0.35)"}
          >Shop All</Link>
          <span style={{ color: "rgba(29,58,97,0.18)" }}>/</span>
          <span style={{ color: "var(--color-ink)", fontWeight: 500 }}>{title}</span>
        </div>
        <span style={{
          fontFamily: "var(--font-inter)", fontSize: 8, letterSpacing: "0.18em",
          textTransform: "uppercase", color: "rgba(29,58,97,0.30)",
        }}>{ITEMS.length} Pieces</span>
      </div>
    </motion.header>
  );
}

/* ── Product grid ── */
function ProductGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start end", "end start"],
  });
  // Watermark drifts upward at 30% of scroll speed
  const wmY = useTransform(scrollYProgress, [0, 1], ["8%", "-18%"]);

  return (
    <div ref={gridRef} className="flex flex-col flex-1" style={{ position: "relative" }}>

      {/* Parallax background watermark */}
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          y: wmY,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <span style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(100px, 22vw, 320px)",
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: "rgba(29,58,97,0.04)",
          userSelect: "none",
          whiteSpace: "nowrap",
        }}>
          ADORNE
        </span>
      </motion.div>

      <div
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
        style={{
          padding: "clamp(20px, 4vw, 36px) clamp(12px, 3vw, 24px) 80px",
          gap: "clamp(24px, 4vw, 48px) clamp(8px, 2vw, 16px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {ITEMS.map((item, idx) => {
          const col = idx % 4;
          // Even columns (0,2) enter from 28px, odd columns (1,3) from 52px — depth stagger
          const yStart = col % 2 === 0 ? 28 : 52;
          const colDelay = col * 0.07;

          return (
          <motion.div
            key={item.id}
            className="group cursor-pointer"
            initial={{ opacity: 0, y: yStart }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.7, delay: colDelay, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href={`/jewelry/${item.id}`} className="no-underline block">

              {/* ── Image container ── */}
              <div
                className="relative overflow-hidden"
                style={{ aspectRatio: "1/1", backgroundColor: "#FFFFFF" }}
              >
                {/* Product image — fades out on group hover */}
                <img
                  src={item.img}
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover:opacity-0"
                  style={{ transition: "opacity 0.65s cubic-bezier(0.16,1,0.3,1)" }}
                  onError={e => { e.currentTarget.src = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80"; }}
                />

                {/* Model image — fades in on group hover */}
                <img
                  src={item.hoverImg}
                  alt={`${item.name} — worn`}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100"
                  style={{ transition: "opacity 0.65s cubic-bezier(0.16,1,0.3,1)" }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />

                {/* NEW badge */}
                {item.isNew && (
                  <span style={{
                    position: "absolute", top: 12, left: 12, zIndex: 2,
                    fontFamily: "var(--font-inter)", fontSize: 7,
                    letterSpacing: "0.26em", textTransform: "uppercase",
                    color: "var(--color-ink)", backgroundColor: "#FFFFFF",
                    padding: "3px 8px",
                  }}>New</span>
                )}

                {/* ADD + button — slides up on group hover */}
                <div
                  className="absolute bottom-0 left-0 right-0 flex justify-center pb-[14px] z-[3] opacity-0 translate-y-[6px] group-hover:opacity-100 group-hover:translate-y-0"
                  style={{ transition: "opacity 0.28s ease, transform 0.38s cubic-bezier(0.16,1,0.3,1)" }}
                >
                  <span style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 8,
                    letterSpacing: "0.26em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    color: "var(--color-ink)",
                    backgroundColor: "#FFFFFF",
                    padding: "7px 18px",
                  }}>
                    ADD +
                  </span>
                </div>
              </div>

              {/* ── Info ── */}
              <div style={{ paddingTop: 12 }}>
                <p style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 11,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "var(--color-ink)",
                  fontWeight: 500,
                  lineHeight: 1.5,
                  margin: 0,
                }}>
                  {item.name}
                </p>
                <p style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 12,
                  letterSpacing: "0.02em",
                  color: "var(--color-ink)",
                  opacity: 0.75,
                  margin: "5px 0 0",
                  fontWeight: 400,
                }}>
                  {item.price}
                </p>
                <p style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: 14,
                  letterSpacing: "0.04em",
                  fontStyle: "italic",
                  color: "var(--color-ink)",
                  opacity: 0.55,
                  margin: "3px 0 0",
                  lineHeight: 1.4,
                }}>
                  {item.material}
                </p>
              </div>

            </Link>
          </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Parallax editorial strip ── */
function EditorialStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const quoteY = useTransform(scrollYProgress, [0, 1], [32, -32]);
  const lineW = useTransform(scrollYProgress, [0.1, 0.5], [0, 64]);

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: "var(--color-ink)",
        overflow: "hidden",
        position: "relative",
        padding: "clamp(48px, 8vw, 72px) clamp(16px, 5vw, 48px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Parallax large background text */}
      <motion.span
        aria-hidden
        style={{
          position: "absolute",
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(90px, 18vw, 260px)",
          fontWeight: 700,
          letterSpacing: "0.14em",
          color: "rgba(255,255,255,0.04)",
          userSelect: "none",
          whiteSpace: "nowrap",
          y: useTransform(scrollYProgress, [0, 1], [24, -24]),
        }}
      >
        COLLECTION
      </motion.span>

      {/* Quote block */}
      <motion.div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          y: quoteY,
        }}
      >
        <motion.div
          style={{
            height: 1,
            backgroundColor: "var(--color-gold)",
            opacity: 0.6,
            marginBottom: 28,
            width: lineW,
          }}
        />
        <p style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(22px, 3.5vw, 42px)",
          fontWeight: 300,
          fontStyle: "italic",
          letterSpacing: "0.05em",
          color: "rgba(255,255,255,0.92)",
          margin: 0,
          lineHeight: 1.4,
          maxWidth: 640,
        }}>
          Every piece is a quiet conversation between craft and the wearer.
        </p>
        <motion.div
          style={{
            height: 1,
            backgroundColor: "var(--color-gold)",
            opacity: 0.6,
            marginTop: 28,
            width: lineW,
          }}
        />
        <p style={{
          fontFamily: "var(--font-inter)",
          fontSize: 8,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
          marginTop: 22,
        }}>
          ADORNE — Est. 2018, Milan
        </p>
      </motion.div>
    </div>
  );
}

export default function JewelryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ backgroundColor: "var(--color-canvas)" }}>
      <CollectionTransition />
      <Navbar />
      <CollectionHero />
      <Suspense>
        <CollectionIntroBlock />
      </Suspense>
      <EditorialStrip />

      {/* Mobile filter bar — visible only below lg */}
      <div
        className="lg:hidden flex items-center justify-between"
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--color-tray)",
          backgroundColor: "var(--color-canvas)",
          position: "sticky",
          top: 56,
          zIndex: 30,
        }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center cursor-pointer"
          style={{
            gap: 8,
            background: "none",
            border: "1px solid var(--color-tray)",
            padding: "7px 14px",
            fontFamily: "var(--font-inter)",
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--color-ink)",
          }}
        >
          <svg width="13" height="11" viewBox="0 0 13 11" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <line x1="0" y1="1.5" x2="13" y2="1.5" />
            <line x1="2" y1="5.5" x2="11" y2="5.5" />
            <line x1="4" y1="9.5" x2="9" y2="9.5" />
          </svg>
          Filter &amp; Sort
        </button>
        <span style={{
          fontFamily: "var(--font-inter)", fontSize: 8,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "rgba(29,58,97,0.38)",
        }}>
          {ITEMS.length} Pieces
        </span>
      </div>

      <div className="flex min-h-screen">
        <Suspense>
          <ShopSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <motion.div
            className="flex flex-col flex-1"
            style={{ minWidth: 0 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <ProductGrid />
          </motion.div>
        </Suspense>
      </div>
    </div>
  );
}
