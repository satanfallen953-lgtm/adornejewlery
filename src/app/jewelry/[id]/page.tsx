"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { getProductById, getRelatedProducts, type Product } from "@/data/products";

/* ═══════════════════════════════════════════
   Constants & helpers
   ═══════════════════════════════════════════ */
const EASE = [0.16, 1, 0.3, 1] as const;
const INK = "var(--color-ink)";
const CANVAS = "var(--color-canvas)";
const GOLD = "var(--color-gold)";
const TRAY = "var(--color-tray)";

function fmt(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

/* ═══════════════════════════════════════════
   SVG icons
   ═══════════════════════════════════════════ */
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

function ArrowLeft() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? INK : "none"} stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
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

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <polyline points="6 9 12 15 18 9" />
    </motion.svg>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function TryOnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   Top header — reused from collection page
   ═══════════════════════════════════════════ */
function ShopTopBar() {
  return (
    <motion.header
      style={{
        position: "sticky", top: 0, zIndex: 40,
        backgroundColor: CANVAS,
        borderBottom: `1px solid ${TRAY}`,
      }}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
    >
      <div className="flex items-center justify-between" style={{ padding: "0 clamp(14px, 4vw, 48px)", height: 60 }}>
        {/* Left — back */}
        <Link href="/jewelry" className="no-underline flex items-center gap-[7px] cursor-pointer"
          style={{
            fontFamily: "var(--font-inter)", fontSize: 8, letterSpacing: "0.20em",
            textTransform: "uppercase", color: "rgba(29,58,97,0.38)",
            transition: "color 0.18s ease", minWidth: 60,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = INK)}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(29,58,97,0.38)")}
        >
          <ArrowLeft /> Back
        </Link>

        {/* Center — ADORNE logo */}
        <Link href="/" className="no-underline flex flex-col items-center select-none"
          style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          <span className="flex items-center">
            <span style={{ fontFamily: "var(--font-playfair)", color: INK, fontSize: 24, letterSpacing: "0.28em", fontWeight: 400, marginRight: "-0.12em" }}>AD</span>
            <span style={{ padding: "0 5px" }}><DiamondRingSVG color={INK} /></span>
            <span style={{ fontFamily: "var(--font-playfair)", color: INK, fontSize: 24, letterSpacing: "0.28em", fontWeight: 400 }}>RNE</span>
          </span>
          <span style={{ marginTop: 3, fontSize: 5.5, letterSpacing: "0.44em", textTransform: "uppercase", color: GOLD, fontFamily: "var(--font-inter)", opacity: 0.75 }}>Fine Jewelry</span>
        </Link>

        {/* Right — icons */}
        <div className="flex items-center gap-4 md:gap-5" style={{ minWidth: 60, justifyContent: "flex-end" }}>
          {[
            { icon: <HeartIcon />, label: "Saved", hideOnMobile: true },
            { icon: <SearchIcon />, label: "Search", hideOnMobile: true },
            { icon: <BagIcon />, label: "Bag", hideOnMobile: false },
          ].map(({ icon, label, hideOnMobile }) => (
            <button key={label} aria-label={label}
              className={`cursor-pointer flex items-center ${hideOnMobile ? "hidden md:flex" : ""}`}
              style={{ background: "none", border: "none", color: "rgba(29,58,97,0.38)", transition: "color 0.18s ease", padding: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = INK)}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(29,58,97,0.38)")}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </motion.header>
  );
}

/* ═══════════════════════════════════════════
   Breadcrumb
   ═══════════════════════════════════════════ */
function Breadcrumb({ product }: { product: Product }) {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Jewelry", href: "/jewelry" },
    { label: product.category.charAt(0).toUpperCase() + product.category.slice(1).replace("-", " "), href: `/jewelry?category=${product.category}` },
    { label: product.name, href: null },
  ];

  return (
    <motion.div
      className="flex items-center flex-wrap"
      style={{ padding: "12px clamp(14px, 4vw, 48px)", gap: 8, borderBottom: `1px solid ${TRAY}` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
    >
      {crumbs.map((crumb, i, arr) => (
        <span key={crumb.label} className="flex items-center" style={{ gap: 10 }}>
          {crumb.href ? (
            <Link href={crumb.href} className="no-underline"
              style={{
                fontFamily: "var(--font-inter)", fontSize: 8, letterSpacing: "0.22em",
                textTransform: "uppercase", color: "rgba(29,58,97,0.38)",
                transition: "color 0.18s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = INK)}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(29,58,97,0.38)")}
            >
              {crumb.label}
            </Link>
          ) : (
            <span style={{
              fontFamily: "var(--font-inter)", fontSize: 8, letterSpacing: "0.22em",
              textTransform: "uppercase", color: INK, fontWeight: 500,
            }}>{crumb.label}</span>
          )}
          {i < arr.length - 1 && (
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 8, color: "rgba(29,58,97,0.18)" }}>/</span>
          )}
        </span>
      ))}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Image Gallery
   ═══════════════════════════════════════════ */
function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  }, []);

  return (
    <motion.div
      className="w-full md:w-auto md:sticky md:self-start"
      style={{ top: 80 }}
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
    >
      <div className="flex flex-col md:flex-row md:gap-4">
        {/* Desktop: vertical thumbnails on left */}
        <div className="hidden md:flex flex-col gap-2" style={{ width: 72, flexShrink: 0 }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="cursor-pointer"
              aria-label={`View image ${i + 1}`}
              style={{
                width: 72, height: 72,
                border: active === i ? `1.5px solid ${INK}` : `1px solid ${TRAY}`,
                padding: 0, background: "#F3F2EE",
                opacity: active === i ? 1 : 0.6,
                transition: "all 0.25s ease",
                overflow: "hidden",
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (active !== i) e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={e => { if (active !== i) e.currentTarget.style.opacity = "0.6"; }}
            >
              <img src={img} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Main image */}
        <div
          ref={imgRef}
          onClick={() => setZoomed(z => !z)}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setZoomed(false)}
          className="relative cursor-zoom-in w-full"
          style={{
            maxWidth: 520,
            aspectRatio: "4 / 5",
            backgroundColor: "#F3F2EE",
            overflow: "hidden",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={active}
              src={images[active]}
              alt={name}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                scale: zoomed ? 1.8 : 1,
                transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
              }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 0.3 }, scale: { duration: 0.35, ease: EASE } }}
            />
          </AnimatePresence>

          {/* Image counter */}
          <span style={{
            position: "absolute", bottom: 14, right: 16,
            fontFamily: "var(--font-inter)", fontSize: 8, letterSpacing: "0.18em",
            color: "rgba(29,58,97,0.4)", textTransform: "uppercase",
          }}>
            {active + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Mobile: horizontal thumbnail strip below main image */}
      <div className="flex md:hidden gap-2 mt-3 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: "touch" as const }}>
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="cursor-pointer flex-shrink-0"
            aria-label={`View image ${i + 1}`}
            style={{
              width: 60, height: 60,
              border: active === i ? `1.5px solid ${INK}` : `1px solid ${TRAY}`,
              padding: 0, background: "#F3F2EE",
              opacity: active === i ? 1 : 0.55,
              transition: "all 0.25s ease",
              overflow: "hidden",
            }}
          >
            <img src={img} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Accordion section
   ═══════════════════════════════════════════ */
function Accordion({ title, children, defaultOpen = false }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ borderBottom: `1px solid ${TRAY}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full cursor-pointer"
        style={{
          padding: "20px 0", background: "none", border: "none",
          fontFamily: "var(--font-inter)", fontSize: 10, letterSpacing: "0.22em",
          textTransform: "uppercase", color: INK, fontWeight: 500,
        }}
      >
        {title}
        <ChevronDown open={open} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ paddingBottom: 24 }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Virtual Try-On modal
   ═══════════════════════════════════════════ */
function TryOnModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [tryOnUrl, setTryOnUrl] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setTryOnUrl(`${window.location.origin}/try-on/${product.id}`);
    setIsMobile(navigator.maxTouchPoints > 1 || /Mobi|Android|iPhone/i.test(navigator.userAgent));
  }, [product.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      key="tryon-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        backgroundColor: "rgba(10,16,26,0.72)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <motion.div
        key="tryon-card"
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.32, ease: EASE }}
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: CANVAS,
          padding: "48px 56px",
          maxWidth: 440, width: "90%",
          display: "flex", flexDirection: "column", alignItems: "center",
          position: "relative",
          boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: 18, right: 22,
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(29,58,97,0.4)", fontSize: 20, lineHeight: 1,
            transition: "color 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = INK)}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(29,58,97,0.4)")}
        >
          ✕
        </button>

        {/* Phone icon */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GOLD}
          strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 20 }}>
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2" />
        </svg>

        {/* Heading */}
        <span style={{
          fontFamily: "var(--font-inter)", fontSize: 8, letterSpacing: "0.30em",
          textTransform: "uppercase", color: GOLD, marginBottom: 8,
        }}>Virtual Try-On</span>
        <h3 style={{
          fontFamily: "var(--font-cormorant)", fontSize: 26, fontWeight: 300,
          fontStyle: "italic", color: INK, margin: "0 0 6px",
          textAlign: "center", lineHeight: 1.25,
        }}>{product.name}</h3>
        <p style={{
          fontFamily: "var(--font-inter)", fontSize: 10.5, color: INK,
          opacity: 0.52, letterSpacing: "0.04em", margin: "0 0 32px",
          textAlign: "center", lineHeight: 1.6,
        }}>
          {isMobile ? "Tap below to try this piece on your wrist using your camera." : "Scan with your phone to see how this piece looks on your wrist."}
        </p>

        {isMobile ? (
          /* Mobile — direct link */
          <Link
            href={`/try-on/${product.id}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "14px 36px", backgroundColor: INK, color: CANVAS,
              fontFamily: "var(--font-inter)", fontSize: 9,
              letterSpacing: "0.22em", textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" /><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
            </svg>
            Open Try-On Camera
          </Link>
        ) : (
          /* Desktop — QR code */
          <>
            <div style={{
              padding: 16, border: `1px solid ${TRAY}`,
              backgroundColor: "#fff", marginBottom: 22,
            }}>
              {tryOnUrl ? (
                <QRCodeSVG
                  value={tryOnUrl}
                  size={168}
                  bgColor="#ffffff"
                  fgColor="#1D3A61"
                  level="M"
                />
              ) : (
                <div style={{ width: 168, height: 168, backgroundColor: TRAY }} />
              )}
            </div>
            <p style={{
              fontFamily: "var(--font-inter)", fontSize: 9, letterSpacing: "0.18em",
              textTransform: "uppercase", color: INK, opacity: 0.4, textAlign: "center",
            }}>Point your phone camera at the code</p>
          </>
        )}

        {/* Divider + product snippet */}
        <div style={{ width: "100%", marginTop: 28, paddingTop: 24, borderTop: `1px solid ${TRAY}` }}>
          <div className="flex items-center gap-3">
            <img src={product.images[0]} alt={product.name}
              style={{ width: 40, height: 40, objectFit: "cover", backgroundColor: "#F3F2EE" }} />
            <div>
              <p style={{
                fontFamily: "var(--font-inter)", fontSize: 10.5, fontWeight: 600,
                letterSpacing: "0.06em", textTransform: "uppercase", color: INK, margin: 0,
              }}>{product.name}</p>
              <p style={{
                fontFamily: "var(--font-cormorant)", fontSize: 13, fontStyle: "italic",
                color: INK, opacity: 0.6, margin: "2px 0 0",
              }}>{product.material}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Product Info panel (right side)
   ═══════════════════════════════════════════ */
function ProductInfo({ product, onTryOn }: { product: Product; onTryOn: () => void }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[1] ?? "");
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToBag, setAddedToBag] = useState(false);
  const [shared, setShared] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const handleAddToBag = () => {
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 2200);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = product.name;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <motion.div
      className="flex flex-col"
      style={{ maxWidth: 440, width: "100%" }}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
    >
      {/* Collection badge */}
      <motion.span
        style={{
          fontFamily: "var(--font-inter)", fontSize: 8, letterSpacing: "0.28em",
          textTransform: "uppercase", color: GOLD, fontWeight: 500,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {product.collection} Collection
      </motion.span>

      {/* Product name */}
      <motion.h1
        style={{
          fontFamily: "var(--font-cormorant)", fontSize: "clamp(32px, 4vw, 46px)",
          fontWeight: 300, fontStyle: "italic", letterSpacing: "0.04em",
          color: INK, lineHeight: 1.15, margin: "14px 0 0",
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5, ease: EASE }}
      >
        {product.name}
      </motion.h1>

      {/* Material */}
      <motion.p
        style={{
          fontFamily: "var(--font-cormorant)", fontSize: 16, fontStyle: "italic",
          letterSpacing: "0.04em", color: INK, opacity: 0.6, marginTop: 6,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.5 }}
      >
        {product.material}
      </motion.p>

      {/* Price */}
      <motion.p
        style={{
          fontFamily: "var(--font-inter)", fontSize: 18, fontWeight: 500,
          letterSpacing: "0.03em", color: INK, marginTop: 20,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
        {fmt(product.price)}
      </motion.p>

      {/* Ref */}
      <p style={{
        fontFamily: "var(--font-inter)", fontSize: 8, letterSpacing: "0.22em",
        textTransform: "uppercase", color: "rgba(29,58,97,0.35)", marginTop: 6,
      }}>
        Ref. {product.ref}
      </p>

      {/* Gold divider */}
      <motion.div
        style={{ height: 1, backgroundColor: GOLD, opacity: 0.4, marginTop: 28 }}
        initial={{ width: 0 }}
        animate={{ width: 48 }}
        transition={{ duration: 0.5, delay: 0.6, ease: EASE }}
      />

      {/* Description */}
      <p style={{
        fontFamily: "var(--font-inter)", fontSize: 12.5, lineHeight: 1.75,
        color: INK, opacity: 0.72, marginTop: 24, letterSpacing: "0.01em",
      }}>
        {product.description}
      </p>

      {/* Size selector */}
      {product.sizes && product.sizes.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div className="flex items-center justify-between">
            <span style={{
              fontFamily: "var(--font-inter)", fontSize: 9, letterSpacing: "0.22em",
              textTransform: "uppercase", color: INK, fontWeight: 500,
            }}>
              Select Size
            </span>
            <button onClick={() => setShowSizeGuide(true)} className="cursor-pointer" style={{
              background: "none", border: "none", fontFamily: "var(--font-inter)",
              fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
              color: GOLD, textDecoration: "underline", textUnderlineOffset: 3,
            }}>
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2" style={{ marginTop: 14 }}>
            {product.sizes.map(size => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className="cursor-pointer"
                  style={{
                    padding: "10px 16px",
                    border: isSelected ? `1.5px solid ${INK}` : `1px solid ${TRAY}`,
                    backgroundColor: isSelected ? INK : "transparent",
                    color: isSelected ? CANVAS : INK,
                    fontFamily: "var(--font-inter)", fontSize: 10,
                    letterSpacing: "0.06em", fontWeight: isSelected ? 500 : 400,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = INK; } }}
                  onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = TRAY; } }}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3" style={{ marginTop: 36 }}>
        {/* Add to Bag */}
        <motion.button
          onClick={handleAddToBag}
          className="cursor-pointer flex items-center justify-center gap-3"
          style={{
            width: "100%", padding: "16px 0",
            backgroundColor: addedToBag ? "#2a5a3a" : INK,
            color: CANVAS, border: "none",
            fontFamily: "var(--font-inter)", fontSize: 10,
            letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 500,
            transition: "background-color 0.3s ease",
          }}
          whileHover={{ opacity: 0.9 }}
          whileTap={{ scale: 0.985 }}
        >
          <BagIcon />
          {addedToBag ? "Added to Bag" : "Add to Shopping Bag"}
        </motion.button>

        <div className="flex gap-3">
          {/* Try On */}
          <motion.button
            onClick={onTryOn}
            className="cursor-pointer flex items-center justify-center gap-2 flex-1"
            style={{
              padding: "14px 0",
              backgroundColor: "transparent",
              color: INK, border: `1px solid ${TRAY}`,
              fontFamily: "var(--font-inter)", fontSize: 9,
              letterSpacing: "0.20em", textTransform: "uppercase", fontWeight: 400,
              transition: "border-color 0.2s ease",
            }}
            whileHover={{ borderColor: INK }}
            whileTap={{ scale: 0.985 }}
          >
            <TryOnIcon />
            Virtual Try-On
          </motion.button>

          {/* Wishlist */}
          <motion.button
            onClick={() => setWishlisted(w => !w)}
            className="cursor-pointer flex items-center justify-center"
            aria-label="Add to wishlist"
            style={{
              width: 52, height: 48,
              backgroundColor: "transparent",
              color: INK, border: `1px solid ${TRAY}`,
              transition: "border-color 0.2s ease",
            }}
            whileHover={{ borderColor: INK }}
            whileTap={{ scale: 0.92 }}
          >
            <HeartIcon filled={wishlisted} />
          </motion.button>

          {/* Share */}
          <motion.button
            onClick={handleShare}
            className="cursor-pointer flex items-center justify-center"
            aria-label={shared ? "Link copied" : "Share"}
            title={shared ? "Link copied!" : "Share"}
            style={{
              width: 52, height: 48,
              backgroundColor: shared ? "rgba(62,111,163,0.08)" : "transparent",
              color: INK, border: `1px solid ${shared ? "rgba(62,111,163,0.4)" : TRAY}`,
              transition: "border-color 0.2s ease, background-color 0.2s ease",
            }}
            whileHover={{ borderColor: INK }}
          >
            <ShareIcon />
          </motion.button>
        </div>
      </div>

      {/* Complimentary services banner */}
      <div className="flex items-center gap-3" style={{
        marginTop: 28, padding: "14px 18px",
        backgroundColor: "rgba(62,111,163,0.04)",
        border: `1px solid rgba(62,111,163,0.08)`,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 12V22H4V12" /><path d="M22 7H2v5h20V7z" /><line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
        <span style={{
          fontFamily: "var(--font-inter)", fontSize: 9, letterSpacing: "0.14em",
          textTransform: "uppercase", color: INK, opacity: 0.65,
        }}>
          Complimentary gift wrapping & shipping
        </span>
      </div>

      {/* Accordions */}
      <div style={{ marginTop: 32 }}>
        <Accordion title="The Details" defaultOpen>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {product.details.map((d, i) => (
              <li key={i} className="flex items-start gap-2" style={{ marginTop: i > 0 ? 8 : 0 }}>
                <span style={{ color: GOLD, fontSize: 6, marginTop: 5 }}>&#9670;</span>
                <span style={{
                  fontFamily: "var(--font-inter)", fontSize: 11.5,
                  lineHeight: 1.65, color: INK, opacity: 0.68, letterSpacing: "0.01em",
                }}>{d}</span>
              </li>
            ))}
          </ul>
        </Accordion>

        <Accordion title="Specifications">
          <div className="flex flex-col" style={{ gap: 0 }}>
            {product.specifications.map((spec, i) => (
              <div key={i} className="flex justify-between items-baseline"
                style={{
                  padding: "9px 0",
                  borderBottom: i < product.specifications.length - 1 ? `1px solid rgba(231,226,217,0.5)` : "none",
                }}>
                <span style={{
                  fontFamily: "var(--font-inter)", fontSize: 10, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: "rgba(29,58,97,0.5)",
                }}>{spec.label}</span>
                <span style={{
                  fontFamily: "var(--font-inter)", fontSize: 11.5,
                  color: INK, opacity: 0.75,
                }}>{spec.value}</span>
              </div>
            ))}
          </div>
        </Accordion>

        <Accordion title="Shipping & Returns">
          <div className="flex flex-col gap-4">
            <div>
              <p style={{
                fontFamily: "var(--font-inter)", fontSize: 10, letterSpacing: "0.18em",
                textTransform: "uppercase", color: INK, fontWeight: 500, marginBottom: 8,
              }}>Complimentary Shipping</p>
              <p style={{
                fontFamily: "var(--font-inter)", fontSize: 11.5, lineHeight: 1.65,
                color: INK, opacity: 0.65,
              }}>
                Free standard shipping on all orders. Express delivery available at checkout. Orders are dispatched within 1–2 business days.
              </p>
            </div>
            <div>
              <p style={{
                fontFamily: "var(--font-inter)", fontSize: 10, letterSpacing: "0.18em",
                textTransform: "uppercase", color: INK, fontWeight: 500, marginBottom: 8,
              }}>Returns & Exchanges</p>
              <p style={{
                fontFamily: "var(--font-inter)", fontSize: 11.5, lineHeight: 1.65,
                color: INK, opacity: 0.65,
              }}>
                We accept returns within 30 days of delivery. Items must be unworn and in original packaging. Engraved or personalised pieces are final sale.
              </p>
            </div>
            <div>
              <p style={{
                fontFamily: "var(--font-inter)", fontSize: 10, letterSpacing: "0.18em",
                textTransform: "uppercase", color: INK, fontWeight: 500, marginBottom: 8,
              }}>Packaging</p>
              <p style={{
                fontFamily: "var(--font-inter)", fontSize: 11.5, lineHeight: 1.65,
                color: INK, opacity: 0.65,
              }}>
                Every piece arrives in a signature ADORNE box, wrapped in tissue and sealed with a wax emblem.
              </p>
            </div>
          </div>
        </Accordion>
      </div>

      {/* Size Guide modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSizeGuide(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              backgroundColor: "rgba(29,58,97,0.55)",
              backdropFilter: "blur(6px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.35, ease: EASE }}
              onClick={e => e.stopPropagation()}
              style={{
                backgroundColor: CANVAS, padding: "40px 44px",
                maxWidth: 440, width: "90%",
                border: `1px solid ${TRAY}`,
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
                <span style={{
                  fontFamily: "var(--font-inter)", fontSize: 9, letterSpacing: "0.28em",
                  textTransform: "uppercase", color: INK, fontWeight: 600,
                }}>Size Guide</span>
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="cursor-pointer"
                  style={{ background: "none", border: "none", color: INK, opacity: 0.5, fontSize: 18, lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
              <p style={{
                fontFamily: "var(--font-cormorant)", fontSize: 15, fontStyle: "italic",
                color: INK, opacity: 0.7, marginBottom: 24,
              }}>
                Measure your wrist snugly and add 1–2 cm for comfort.
              </p>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${TRAY}` }}>
                    {["Size", "Wrist (cm)", "Bracelet (cm)"].map(h => (
                      <th key={h} style={{
                        fontFamily: "var(--font-inter)", fontSize: 8.5,
                        letterSpacing: "0.18em", textTransform: "uppercase",
                        color: "rgba(29,58,97,0.5)", fontWeight: 500,
                        textAlign: "left", paddingBottom: 10,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["XS", "13.5–14.5", "15.5"],
                    ["S",  "15.0–16.0", "17.0"],
                    ["M",  "16.5–17.5", "18.5"],
                    ["L",  "18.0–19.0", "20.0"],
                    ["XL", "19.5–20.5", "21.5"],
                  ].map(([sz, wrist, bracelet], i) => (
                    <tr key={sz} style={{
                      borderBottom: i < 4 ? `1px solid ${TRAY}` : "none",
                    }}>
                      {[sz, wrist, bracelet].map((cell, j) => (
                        <td key={j} style={{
                          fontFamily: "var(--font-inter)", fontSize: 12,
                          color: INK, opacity: 0.8, padding: "10px 0",
                        }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{
                fontFamily: "var(--font-inter)", fontSize: 10, color: INK,
                opacity: 0.45, marginTop: 20, letterSpacing: "0.04em",
              }}>
                Need help? Contact our concierge at hello@adorne.com
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>

  );
}

/* ═══════════════════════════════════════════
   Sticky Add-to-Bag bar (on scroll)
   ═══════════════════════════════════════════ */
function StickyBar({ product }: { product: Product }) {
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
            backgroundColor: CANVAS, borderTop: `1px solid ${TRAY}`,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center justify-between" style={{ padding: "12px clamp(14px, 4vw, 48px)", maxWidth: 1400, margin: "0 auto" }}>
            {/* Left — product info (hidden on very small screens) */}
            <div className="hidden sm:flex items-center gap-4">
              <img src={product.images[0]} alt={product.name}
                style={{ width: 44, height: 44, objectFit: "cover", backgroundColor: "#F3F2EE" }} />
              <div>
                <p style={{
                  fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 600,
                  letterSpacing: "0.06em", textTransform: "uppercase", color: INK,
                }}>{product.name}</p>
                <p style={{
                  fontFamily: "var(--font-inter)", fontSize: 12, color: INK,
                  opacity: 0.7, marginTop: 2,
                }}>{fmt(product.price)}</p>
              </div>
            </div>

            {/* Mobile: price only */}
            <p className="sm:hidden" style={{
              fontFamily: "var(--font-inter)", fontSize: 13, fontWeight: 500,
              color: INK,
            }}>{fmt(product.price)}</p>

            {/* Right — button */}
            <motion.button
              onClick={handleAdd}
              className="cursor-pointer flex items-center gap-2"
              style={{
                padding: "12px clamp(20px, 4vw, 36px)",
                backgroundColor: added ? "#2a5a3a" : INK,
                color: CANVAS, border: "none",
                fontFamily: "var(--font-inter)", fontSize: 9,
                letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 500,
                transition: "background-color 0.3s ease",
              }}
              whileHover={{ opacity: 0.9 }}
              whileTap={{ scale: 0.985 }}
            >
              <BagIcon /> {added ? "Added to Bag" : "Add to Bag"}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════
   "You May Also Like" section
   ═══════════════════════════════════════════ */
function RelatedProducts({ product }: { product: Product }) {
  const related = getRelatedProducts(product, 4);
  if (related.length === 0) return null;

  return (
    <motion.section
      style={{ padding: "clamp(48px, 8vw, 80px) clamp(16px, 4vw, 48px) clamp(60px, 8vw, 100px)", borderTop: `1px solid ${TRAY}` }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {/* Section heading */}
      <div className="flex flex-col items-center" style={{ marginBottom: 48 }}>
        <span style={{
          fontFamily: "var(--font-inter)", fontSize: 8, letterSpacing: "0.30em",
          textTransform: "uppercase", color: "rgba(29,58,97,0.4)",
        }}>Curated for you</span>
        <h2 style={{
          fontFamily: "var(--font-cormorant)", fontSize: "clamp(28px, 4vw, 42px)",
          fontWeight: 300, fontStyle: "italic", letterSpacing: "0.04em",
          color: INK, marginTop: 10,
        }}>You May Also Like</h2>
        <div style={{ width: 40, height: 1, backgroundColor: GOLD, opacity: 0.4, marginTop: 18 }} />
      </div>

      {/* Product grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-4"
        style={{ gap: "clamp(24px, 4vw, 40px) clamp(10px, 2vw, 24px)", maxWidth: 1100, margin: "0 auto" }}
      >
        {related.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.08, ease: EASE }}
          >
            <Link href={`/jewelry/${item.id}`} className="group no-underline cursor-pointer block">
              <div className="relative overflow-hidden" style={{ aspectRatio: "1/1", backgroundColor: "#F3F2EE" }}>
                <img src={item.images[0]} alt={item.name}
                  className="w-full h-full object-cover"
                  style={{ transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1)" }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                />
                <div className="absolute left-0 right-0 bottom-0 flex items-center justify-between opacity-0 group-hover:opacity-100"
                  style={{
                    padding: "10px 14px", background: "rgba(243,242,238,0.92)",
                    transition: "opacity 0.24s ease", backdropFilter: "blur(2px)",
                  }}>
                  <span style={{
                    fontFamily: "var(--font-inter)", fontSize: 8.5,
                    letterSpacing: "0.20em", textTransform: "uppercase",
                    color: INK, fontWeight: 500,
                  }}>View Piece</span>
                  <span style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: INK, lineHeight: 1 }}>+</span>
                </div>
              </div>
              <div style={{ paddingTop: 14 }}>
                <p style={{
                  fontFamily: "var(--font-inter)", fontSize: 12, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: INK, fontWeight: 700, lineHeight: 1.5, margin: 0,
                }}>{item.name}</p>
                <p style={{
                  fontFamily: "var(--font-inter)", fontSize: 13, letterSpacing: "0.03em",
                  color: INK, fontWeight: 500, opacity: 0.9, margin: "6px 0 0",
                }}>{fmt(item.price)}</p>
                <p style={{
                  fontFamily: "var(--font-cormorant)", fontSize: 15, letterSpacing: "0.04em",
                  fontStyle: "italic", color: INK, opacity: 0.72, margin: "4px 0 0",
                }}>{item.material}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════
   Main page component
   ═══════════════════════════════════════════ */
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const product = getProductById(id);
  const [showTryOn, setShowTryOn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(navigator.maxTouchPoints > 1 || /Mobi|Android|iPhone/i.test(navigator.userAgent));
  }, []);

  if (!product) {
    return (
      <div style={{ backgroundColor: CANVAS, minHeight: "100vh" }}>
        <ShopTopBar />
        <div className="flex flex-col items-center justify-center" style={{ padding: "clamp(60px, 10vw, 120px) clamp(16px, 5vw, 48px)", textAlign: "center" }}>
          <h1 style={{
            fontFamily: "var(--font-cormorant)", fontSize: 36, fontWeight: 300,
            fontStyle: "italic", color: INK,
          }}>Piece Not Found</h1>
          <p style={{
            fontFamily: "var(--font-inter)", fontSize: 12, color: INK,
            opacity: 0.5, marginTop: 16, letterSpacing: "0.06em",
          }}>
            The jewelry piece you are looking for could not be found.
          </p>
          <Link href="/jewelry" className="no-underline" style={{
            marginTop: 32, padding: "12px 32px",
            backgroundColor: INK, color: CANVAS,
            fontFamily: "var(--font-inter)", fontSize: 9,
            letterSpacing: "0.22em", textTransform: "uppercase",
          }}>
            Return to Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: CANVAS, minHeight: "100vh" }}>
      <ShopTopBar />
      <Breadcrumb product={product} />

      {/* ── Main PDP layout: gallery left, info right ── */}
      <div className="flex flex-col md:flex-row" style={{ padding: "clamp(20px, 4vw, 48px)", gap: "clamp(24px, 4vw, 60px)", maxWidth: 1280, margin: "0 auto" }}>
        <ImageGallery images={product.images} name={product.name} />
        <ProductInfo product={product} onTryOn={() => {
          if (isMobile) {
            router.push(`/try-on/${product.id}`);
          } else {
            setShowTryOn(true);
          }
        }} />
      </div>

      {/* ── You May Also Like ── */}
      <RelatedProducts product={product} />

      {/* ── Sticky bottom bar ── */}
      <StickyBar product={product} />

      {/* ── Virtual Try-On modal ── */}
      <AnimatePresence>
        {showTryOn && (
          <TryOnModal product={product} onClose={() => setShowTryOn(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
