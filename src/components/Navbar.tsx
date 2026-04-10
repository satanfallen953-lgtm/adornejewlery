"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, LayoutGroup } from "framer-motion";

const NAV_LINKS = [
  "All Jewelry",
  "Bracelets",
  "Necklaces",
  "Earrings",
  "Rings",
  "For Him",
  "Collections",
];

const NAV_HREFS: Record<string, string> = {
  "All Jewelry":  "/jewelry",
  "Bracelets":    "/jewelry?category=bracelets",
  "Necklaces":    "/jewelry?category=necklaces",
  "Earrings":     "/jewelry?category=earrings",
  "Rings":        "/jewelry?category=rings",
  "For Him":      "/jewelry?category=for-him",
  "Collections":  "/jewelry?category=collections",
};

function DiamondRingSVG({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ display: "inline-block", verticalAlign: "middle" }}>
      <polygon points="20,2 28,14 20,22 12,14" fill="none" stroke={color} strokeWidth="1.5" />
      <line x1="12" y1="14" x2="28" y2="14" stroke={color} strokeWidth="1" />
      <line x1="20" y1="2" x2="20" y2="22" stroke={color} strokeWidth="0.75" />
      <ellipse cx="20" cy="38" rx="14" ry="16" fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="24" height="14" viewBox="0 0 24 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <line x1="0" y1="1" x2="24" y2="1" />
      <line x1="4" y1="13" x2="24" y2="13" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function LogoContent({ color }: { color: string }) {
  return (
    <>
      <span
        className="text-[24px] md:text-[32px] tracking-[0.22em] font-normal"
        style={{ fontFamily: "var(--font-playfair)", color, marginRight: "-0.28em" }}
      >AD</span>
      <div className="px-[4px] md:px-[5px]">
        <DiamondRingSVG className="w-[15px] h-[21px] md:w-[20px] md:h-[28px] -mt-[2px]" color={color} />
      </div>
      <span
        className="text-[24px] md:text-[32px] tracking-[0.22em] font-normal"
        style={{ fontFamily: "var(--font-playfair)", color }}
      >RNE</span>
    </>
  );
}

const LAYOUT_TRANSITION = {
  duration: 1.2,
  ease: [0.16, 1, 0.3, 1] as const,
};

export default function Navbar({ introPhase }: { introPhase?: number }) {
  const [menuOpen, setMenuOpen] = useState(false);
  // Always start true — useEffect corrects it client-side (avoids SSR hydration mismatch)
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 120) setHidden(true);
    else if (latest < previous) setHidden(false);
    setIsScrolled(latest > 30);
  });

  useEffect(() => {
    // If loader already played this session, skip it immediately
    if (sessionStorage.getItem("adorne_loaded") === "1") {
      setIsLoading(false);
      return;
    }
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => {
      setIsLoading(false);
      sessionStorage.setItem("adorne_loaded", "1");
      document.body.classList.add("loaded");
      document.body.style.overflow = "";
    }, 2400);
    return () => { clearTimeout(timer); document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (!isLoading) document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen, isLoading]);

  return (
    <LayoutGroup>
      {/* ===== LOADER OVERLAY ===== */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader-overlay"
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
            style={{ backgroundColor: "var(--color-canvas)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <motion.div
              layoutId="brand-logo"
              className="flex items-center justify-center"
              style={{ scale: 2.2 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                opacity: { duration: 1, ease: "easeOut" },
                layout: LAYOUT_TRANSITION,
              }}
            >
              <LogoContent color="var(--color-ink)" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== STICKY NAVBAR ===== */}
      <motion.header
        className="sticky top-0 z-50 w-full"
        style={{
          backgroundColor: isScrolled ? "rgba(243, 246, 250, 0.92)" : "var(--color-canvas)",
          backdropFilter: isScrolled ? "blur(24px) saturate(180%)" : "none",
          WebkitBackdropFilter: isScrolled ? "blur(24px) saturate(180%)" : "none",
          borderBottom: "1px solid var(--color-tray)",
          transition: "background-color 0.5s ease, backdrop-filter 0.5s ease",
        }}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Thin gold accent line — appears on scroll */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ backgroundColor: "var(--color-gold)", transformOrigin: "left" }}
          animate={{ scaleX: isScrolled ? 1 : 0, opacity: isScrolled ? 0.45 : 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* ── Brand row ── */}
        <div className="flex items-center justify-between px-4 md:px-8 lg:px-10 pt-3 md:pt-4 pb-1">

          {/* Left: hamburger (mobile+tablet) | invisible spacer (desktop) */}
          <div className="w-10 md:w-14 lg:w-28 flex items-center">
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden cursor-pointer p-1 -ml-1 hover:opacity-55 transition-opacity duration-200"
              style={{ color: "var(--color-ink)" }}
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>
          </div>

          {/* Center: tagline + logo */}
          <div className="flex flex-col items-center">
            <motion.p
              className="hidden lg:block tracking-[0.38em] uppercase text-[9px] mb-1"
              style={{ color: "var(--color-gold)", fontFamily: "var(--font-inter)" }}
              initial={{ opacity: 0 }}
              animate={isLoading ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Crafted with Intention
            </motion.p>

            {!isLoading ? (
              <Link href="/" className="no-underline">
                <motion.div
                  layoutId="brand-logo"
                  className="flex items-center justify-center cursor-pointer select-none"
                  transition={{ layout: LAYOUT_TRANSITION }}
                >
                  <LogoContent color="var(--color-ink)" />
                </motion.div>
              </Link>
            ) : (
              <div className="flex items-center justify-center" style={{ opacity: 0, pointerEvents: "none" }}>
                <LogoContent color="var(--color-ink)" />
              </div>
            )}
          </div>

          {/* Right: search + bag */}
          <div className="w-10 md:w-14 lg:w-28 flex items-center justify-end gap-3 lg:gap-4" style={{ color: "var(--color-ink)" }}>
            <motion.button
              className="cursor-pointer hover:opacity-50 transition-opacity duration-200 p-1"
              initial={{ opacity: 0 }}
              animate={isLoading ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.1 }}
              aria-label="Search"
            >
              <SearchIcon />
            </motion.button>
            <motion.button
              className="cursor-pointer hover:opacity-50 transition-opacity duration-200 p-1"
              initial={{ opacity: 0 }}
              animate={isLoading ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.2 }}
              aria-label="Bag"
            >
              <BagIcon />
            </motion.button>
          </div>
        </div>

        {/* ── Nav links row (desktop only) ── */}
        <div
          className="hidden lg:flex items-center justify-center border-t py-[11px] px-12"
          style={{ borderColor: "var(--color-tray)" }}
        >
          <nav className="flex items-center gap-8 lg:gap-11 xl:gap-14">
            {NAV_LINKS.map((link, i) => {
              const href = NAV_HREFS[link] ?? "/jewelry";
              return (
                <motion.div key={link} className="relative group"
                  initial={{ opacity: 0, y: -5 }}
                  animate={isLoading ? { opacity: 0, y: -5 } : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: isLoading ? 0 : 0.6 + i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <Link
                    href={href}
                    className="relative no-underline"
                    style={{
                      color: "var(--color-ink)",
                      fontFamily: "var(--font-inter)",
                      fontSize: "10px",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                    }}
                  >
                    {link}
                  </Link>
                  {/* Gold underline sweep on hover */}
                  <span
                    className="absolute -bottom-[3px] left-0 h-[1px] w-0 group-hover:w-full"
                    style={{
                      backgroundColor: "var(--color-gold)",
                      transition: "width 0.38s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  />
                </motion.div>
              );
            })}
          </nav>
        </div>
      </motion.header>

      {/* ===== FULL-SCREEN MOBILE MENU ===== */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
            style={{ backgroundColor: "var(--color-ink)" }}
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Close button */}
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-7 right-6 cursor-pointer hover:opacity-60 transition-opacity"
              style={{ color: "var(--color-canvas)" }}
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>

            {/* Logo */}
            <motion.div
              className="mb-3 flex items-center justify-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <LogoContent color="var(--color-canvas)" />
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="tracking-[0.35em] uppercase text-[9px] mb-12"
              style={{ color: "var(--color-gold)", fontFamily: "var(--font-inter)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.22 }}
            >
              Fine Jewelry
            </motion.p>

            {/* Divider */}
            <motion.div
              className="mb-10 w-[1px] bg-gold"
              style={{ backgroundColor: "var(--color-gold)", opacity: 0.35 }}
              initial={{ height: 0 }}
              animate={{ height: 32 }}
              transition={{ duration: 0.45, delay: 0.25 }}
            />

            {/* Nav links */}
            <nav className="flex flex-col items-center gap-[22px]">
              {NAV_LINKS.map((link, i) => {
                const href = NAV_HREFS[link] ?? "/jewelry";
                return (
                  <motion.div key={link} className="relative group flex justify-center"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.38, delay: 0.12 + i * 0.055 }}
                  >
                    <Link
                      href={href}
                      className="no-underline tracking-[0.22em] uppercase"
                      style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "var(--color-canvas)" }}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link}
                    </Link>
                    <span
                      className="absolute -bottom-[3px] left-0 h-[1px] w-0 group-hover:w-full"
                      style={{ backgroundColor: "var(--color-gold)", transition: "width 0.38s cubic-bezier(0.16, 1, 0.3, 1)" }}
                    />
                  </motion.div>
                );
              })}
            </nav>

            {/* Bottom icons row */}
            <motion.div
              className="absolute bottom-10 flex items-center gap-10"
              style={{ color: "var(--color-canvas)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <button className="cursor-pointer flex flex-col items-center gap-[6px] hover:opacity-55 transition-opacity" aria-label="Search">
                <SearchIcon />
                <span className="text-[8px] tracking-[0.22em] uppercase" style={{ fontFamily: "var(--font-inter)", color: "var(--color-gold)" }}>Search</span>
              </button>
              <button className="cursor-pointer flex flex-col items-center gap-[6px] hover:opacity-55 transition-opacity" aria-label="Bag">
                <BagIcon />
                <span className="text-[8px] tracking-[0.22em] uppercase" style={{ fontFamily: "var(--font-inter)", color: "var(--color-gold)" }}>Bag</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
