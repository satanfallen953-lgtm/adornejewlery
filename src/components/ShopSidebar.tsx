"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const CATEGORIES = [
  { label: "All Jewelry",        slug: "all" },
  { label: "Men's Accessories",  slug: "mens-accessories" },
  { label: "Watch Belt N Charms",slug: "watch-belt-n-charms" },
  { label: "Italian Bracelet",   slug: "italian-bracelets" },
  { label: "Bracelets",          slug: "bracelets" },
  { label: "Engraved Jewellery", slug: "engraved-jewellery" },
  { label: "Matching Bracelets", slug: "matching-bracelets" },
  { label: "Anklets",            slug: "anklets" },
  { label: "Charms",             slug: "charms" },
  { label: "Necklaces",          slug: "necklaces" },
  { label: "Earrings",           slug: "earrings" },
  { label: "Jewelry Sets",       slug: "jewelry-sets" },
  { label: "Rings",              slug: "rings" },
];

const SORT_OPTIONS = ["Recommended", "Price: Low–High", "Price: High–Low", "New Arrivals"];
const FILTER_OPTIONS = ["New", "Online Exclusive", "Available Online"];

export const SIDEBAR_W = 220;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 8,
      letterSpacing: "0.30em",
      textTransform: "uppercase",
      color: "rgba(29,58,97,0.65)",
      fontFamily: "var(--font-inter)",
      padding: "24px 28px 10px",
      flexShrink: 0,
    }}>{children}</p>
  );
}

function Divider() {
  return <div style={{ height: 1, backgroundColor: "var(--color-tray)", margin: "8px 0", flexShrink: 0 }} />;
}

interface SidebarContentProps {
  activeSlug: string;
  activeSort: string;
  setActiveSort: (s: string) => void;
  activeFilters: string[];
  toggleFilter: (f: string) => void;
  onClose?: () => void;
}

function SidebarContent({ activeSlug, activeSort, setActiveSort, activeFilters, toggleFilter, onClose }: SidebarContentProps) {
  return (
    <>
      {/* Mobile close header */}
      {onClose && (
        <div className="flex items-center justify-between lg:hidden" style={{
          padding: "18px 24px 16px",
          borderBottom: "1px solid var(--color-tray)",
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: "var(--font-inter)", fontSize: 9,
            letterSpacing: "0.28em", textTransform: "uppercase",
            color: "var(--color-ink)", fontWeight: 600,
          }}>Filters</span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-ink)", opacity: 0.45, fontSize: 20, lineHeight: 1, padding: 4 }}
            aria-label="Close filters"
          >
            ×
          </button>
        </div>
      )}

      {/* Sort By */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        style={{ flexShrink: 0 }}
      >
        <SectionLabel>Sort By</SectionLabel>
        <div className="flex flex-col" style={{ padding: "0 28px 14px" }}>
          {SORT_OPTIONS.map(opt => {
            const isActive = activeSort === opt;
            return (
              <button
                key={opt}
                onClick={() => setActiveSort(opt)}
                className="flex items-center gap-[10px] cursor-pointer text-left"
                style={{
                  background: "none", border: "none", padding: "7px 0",
                  fontFamily: "var(--font-inter)", fontSize: 11,
                  letterSpacing: "0.04em",
                  color: isActive ? "var(--color-ink)" : "rgba(29,58,97,0.65)",
                  fontWeight: isActive ? 500 : 400,
                  transition: "color 0.18s ease",
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--color-ink)"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "rgba(29,58,97,0.65)"; }}
              >
                <span style={{
                  width: 11, height: 11, borderRadius: "50%", flexShrink: 0,
                  border: `1.5px solid ${isActive ? "var(--color-ink)" : "rgba(29,58,97,0.45)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "border-color 0.18s ease",
                }}>
                  {isActive && (
                    <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "var(--color-ink)" }} />
                  )}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </motion.div>

      <Divider />

      {/* Filter By */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        style={{ flexShrink: 0 }}
      >
        <SectionLabel>Filter By</SectionLabel>
        <div className="flex flex-col" style={{ padding: "0 28px 14px" }}>
          {FILTER_OPTIONS.map(f => {
            const checked = activeFilters.includes(f);
            return (
              <button
                key={f}
                onClick={() => toggleFilter(f)}
                className="flex items-center gap-[10px] cursor-pointer text-left"
                style={{
                  background: "none", border: "none", padding: "7px 0",
                  fontFamily: "var(--font-inter)", fontSize: 11,
                  letterSpacing: "0.04em",
                  color: checked ? "var(--color-ink)" : "rgba(29,58,97,0.65)",
                  fontWeight: checked ? 500 : 400,
                  transition: "color 0.18s ease",
                }}
                onMouseEnter={e => { if (!checked) (e.currentTarget as HTMLElement).style.color = "var(--color-ink)"; }}
                onMouseLeave={e => { if (!checked) (e.currentTarget as HTMLElement).style.color = "rgba(29,58,97,0.65)"; }}
              >
                <span style={{
                  width: 11, height: 11, flexShrink: 0,
                  border: `1.5px solid ${checked ? "var(--color-ink)" : "rgba(29,58,97,0.45)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "border-color 0.18s ease",
                }}>
                  {checked && (
                    <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                      <polyline points="0.5,3.5 2.5,5.5 6.5,1" stroke="var(--color-ink)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {f}
              </button>
            );
          })}
        </div>
      </motion.div>

      <Divider />

      {/* Category */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        style={{ flexShrink: 0 }}
      >
        <SectionLabel>Category</SectionLabel>
        <nav className="flex flex-col" style={{ padding: "0 0 14px" }}>
          {CATEGORIES.map((cat, i) => {
            const isActive = activeSlug === cat.slug;
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.32, delay: 0.52 + i * 0.04, ease: "easeOut" }}
              >
                <Link
                  href={`/jewelry?category=${cat.slug}`}
                  className="no-underline flex items-center relative"
                  style={{
                    padding: "9px 28px 9px 30px",
                    fontFamily: "var(--font-inter)",
                    fontSize: "11px",
                    letterSpacing: "0.04em",
                    color: isActive ? "var(--color-ink)" : "rgba(29,58,97,0.65)",
                    fontWeight: isActive ? 600 : 400,
                    transition: "color 0.18s ease",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--color-ink)";
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.color = "rgba(29,58,97,0.65)";
                  }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-bar"
                      className="absolute left-0 top-1/2 -translate-y-1/2"
                      style={{
                        width: 2, height: 14,
                        backgroundColor: "var(--color-ink)",
                        borderRadius: 1,
                      }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  {cat.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </motion.div>

      <div style={{ flex: 1 }} />

      {/* Bottom whisper */}
      <motion.p
        style={{
          padding: "16px 28px",
          fontSize: 7,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "rgba(29,58,97,0.22)",
          fontFamily: "var(--font-inter)",
          textAlign: "center",
          flexShrink: 0,
          borderTop: "1px solid var(--color-tray)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.1 }}
      >
        Est. 2018 · Milan
      </motion.p>
    </>
  );
}

export default function ShopSidebar({ mobileOpen = false, onClose }: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("category") ?? "all";
  const [activeSort, setActiveSort] = useState("Recommended");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (f: string) =>
    setActiveFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const contentProps = { activeSlug, activeSort, setActiveSort, activeFilters, toggleFilter };

  return (
    <>
      {/* ── Mobile overlay backdrop ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mob-backdrop"
            className="fixed inset-0 lg:hidden"
            style={{ zIndex: 60, backgroundColor: "rgba(29,58,97,0.42)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile drawer (slide-in from left) ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            key="mob-sidebar"
            className="fixed top-0 left-0 lg:hidden flex flex-col"
            style={{
              zIndex: 70,
              width: Math.min(SIDEBAR_W + 40, 280),
              height: "100dvh",
              backgroundColor: "var(--color-canvas)",
              borderRight: "1px solid var(--color-tray)",
              overflowY: "auto",
            }}
            initial={{ x: -(SIDEBAR_W + 40) }}
            animate={{ x: 0 }}
            exit={{ x: -(SIDEBAR_W + 40) }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          >
            <SidebarContent {...contentProps} onClose={onClose} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar (always visible on lg+) ── */}
      <motion.aside
        className="hidden lg:sticky lg:top-0 lg:h-screen lg:z-50 lg:flex lg:flex-col lg:self-start"
        style={{
          width: SIDEBAR_W,
          backgroundColor: "var(--color-canvas)",
          borderRight: "1px solid var(--color-tray)",
          overflowY: "auto",
        }}
        initial={{ x: -SIDEBAR_W, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <SidebarContent {...contentProps} />
      </motion.aside>
    </>
  );
}
