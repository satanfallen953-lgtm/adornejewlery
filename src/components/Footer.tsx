"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const FOOTER_LINKS = {
  "Customer Care": ["Book an Appointment", "Contact Us", "FAQ", "Shipping & Returns"],
  "Collections": ["Bracelets", "Necklaces", "Earrings", "Rings", "For Him"],
  "Company": ["Our Story", "Craftsmanship", "Sustainability", "Careers"],
};

const HEADING_WORDS = ["Stay", "in", "the", "World", "of", "Adorne"];
const PARTICLE_X = [8, 20, 35, 50, 65, 80];

function DiamondRingSVG({ color = "currentColor" }: { color?: string }) {
  return (
    <svg viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "inline-block", width: "16px", height: "22px", verticalAlign: "middle" }}>
      <polygon points="20,2 28,14 20,22 12,14" fill="none" stroke={color} strokeWidth="1.5" />
      <line x1="12" y1="14" x2="28" y2="14" stroke={color} strokeWidth="1" />
      <line x1="20" y1="2" x2="20" y2="22" stroke={color} strokeWidth="0.75" />
      <ellipse cx="20" cy="38" rx="14" ry="16" fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function SocialBtn({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <a
      href="#"
      aria-label={label}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 36, height: 36, borderRadius: "50%",
        border: "1px solid rgba(243,246,250,0.3)",
        color: "rgba(243,246,250,0.7)",
        transition: "border-color 0.3s, color 0.3s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(243,246,250,0.8)"; (e.currentTarget as HTMLElement).style.color = "#F3F6FA"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(243,246,250,0.3)"; (e.currentTarget as HTMLElement).style.color = "rgba(243,246,250,0.7)"; }}
    >
      {children}
    </a>
  );
}

export default function Footer() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const imgRef      = useRef<HTMLImageElement>(null);
  const labelRef    = useRef<HTMLParagraphElement>(null);
  const headingRef  = useRef<HTMLHeadingElement>(null);
  const inputRef    = useRef<HTMLDivElement>(null);
  const shimmerRef  = useRef<HTMLDivElement>(null);
  const glowRef     = useRef<HTMLDivElement>(null);
  const btnRef      = useRef<HTMLButtonElement>(null);
  const particleRefs = useRef<(SVGSVGElement | null)[]>([]);

  useGSAP(() => {
    const section = sectionRef.current;

    /* ── 1. BG image parallax ── */
    gsap.fromTo(imgRef.current,
      { yPercent: -10 },
      {
        yPercent: 10, ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
      }
    );

    /* ── 2. Label entrance ── */
    gsap.fromTo(labelRef.current,
      { opacity: 0, y: 22, letterSpacing: "0.55em" },
      {
        opacity: 1, y: 0, letterSpacing: "0.3em",
        duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 72%", once: true },
      }
    );

    /* ── 3. Word-by-word heading reveal ── */
    const words = headingRef.current?.querySelectorAll(".wi");
    if (words?.length) {
      gsap.fromTo(words,
        { y: "108%", rotateZ: 2, opacity: 0 },
        {
          y: 0, rotateZ: 0, opacity: 1,
          stagger: 0.07, duration: 0.88, ease: "power4.out", delay: 0.22,
          scrollTrigger: { trigger: section, start: "top 72%", once: true },
        }
      );
    }

    /* ── 4. Input pill entrance ── */
    gsap.fromTo(inputRef.current,
      { opacity: 0, y: 30, scale: 0.9 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 1.05, ease: "expo.out", delay: 0.68,
        scrollTrigger: { trigger: section, start: "top 72%", once: true },
      }
    );

    /* ── 5. Shimmer sweep (repeating light pass over input) ── */
    gsap.fromTo(shimmerRef.current,
      { left: "-38%" },
      {
        left: "138%",
        duration: 2.2, repeat: -1, repeatDelay: 3.8, delay: 1.6,
        ease: "power1.inOut",
      }
    );

    /* ── 6. Input glow pulse ── */
    gsap.to(glowRef.current, {
      opacity: 0.6, scale: 1.15,
      duration: 2.2, repeat: -1, yoyo: true,
      ease: "sine.inOut",
    });

    /* ── 7. Floating diamond particles ── */
    particleRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.set(el, { left: `${PARTICLE_X[i]}%`, bottom: 0, opacity: 0, y: 0 });
      const tl = gsap.timeline({ repeat: -1, delay: i * 0.95, repeatDelay: 0.6 });
      tl.to(el, { opacity: 0.55, duration: 0.6, ease: "power2.out" })
        .to(el, { y: -(190 + i * 38), duration: 3.8 + i * 0.45, ease: "power1.out" }, 0)
        .to(el, { opacity: 0, duration: 1.1, ease: "power2.in" }, "-=1.1")
        .set(el, { y: 0, opacity: 0 });
    });

  }, { scope: sectionRef });

  /* ── Magnetic button ── */
  const onBtnMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const { left, top, width, height } = btn.getBoundingClientRect();
    gsap.to(btn, {
      x: (e.clientX - (left + width  / 2)) * 0.42,
      y: (e.clientY - (top  + height / 2)) * 0.42,
      duration: 0.25, ease: "power2.out",
    });
  };
  const onBtnLeave = () => {
    gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.55)" });
  };

  return (
    <footer style={{ backgroundColor: "var(--color-ink)" }} className="relative w-full overflow-hidden">

      {/* ── Newsletter section ── */}
      <div ref={sectionRef} className="relative overflow-hidden" style={{ backgroundColor: "rgb(29,58,97)" }}>

        {/* Background model image */}
        <img
          ref={imgRef}
          src="/female.jpg"
          alt=""
          style={{
            position: "absolute",
            inset: 0, width: "100%", height: "120%", top: "-10%",
            objectFit: "cover", objectPosition: "center 15%",
            opacity: 0.35,
          }}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(29,58,97,0.5) 0%, rgba(29,58,97,0.92) 75%, rgba(29,58,97,1) 100%)" }} />

        {/* Floating diamond particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {PARTICLE_X.map((_, i) => (
            <svg
              key={i}
              ref={el => { particleRefs.current[i] = el; }}
              style={{ position: "absolute", width: 7, height: 10 }}
              viewBox="0 0 8 12"
              fill="none"
            >
              <polygon points="4,0 8,5 4,10 0,5" fill="rgba(220,235,255,0.55)" />
              <line x1="0" y1="5" x2="8" y2="5" stroke="rgba(220,235,255,0.4)" strokeWidth="0.5" />
              <line x1="4" y1="0" x2="4" y2="10" stroke="rgba(220,235,255,0.4)" strokeWidth="0.5" />
            </svg>
          ))}
        </div>

        {/* Content */}
        <div
          className="relative z-10 flex flex-col items-center text-center px-8"
          style={{ paddingTop: "80px", paddingBottom: "40px" }}
        >
          {/* Label */}
          <p
            ref={labelRef}
            className="uppercase mb-6"
            style={{
              fontFamily: "var(--font-inter)", fontSize: "11px",
              color: "rgba(243,246,250,0.7)", letterSpacing: "0.3em",
              opacity: 0,
            }}
          >
            Subscribe to Our Newsletter
          </p>

          {/* Heading — word split */}
          <h3
            ref={headingRef}
            className="mb-10"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(28px, 4vw, 48px)",
              color: "#F3F6FA", fontStyle: "italic", letterSpacing: "0.02em",
              lineHeight: 1.3,
            }}
          >
            {HEADING_WORDS.map((word, i) => (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  overflow: "hidden",
                  marginRight: i < HEADING_WORDS.length - 1 ? "0.28em" : 0,
                  verticalAlign: "bottom",
                }}
              >
                <span className="wi" style={{ display: "inline-block" }}>{word}</span>
              </span>
            ))}
          </h3>

          {/* Input pill wrapper */}
          <div ref={inputRef} style={{ position: "relative", width: "100%", maxWidth: "28rem", opacity: 0 }}>

            {/* Glow bloom beneath pill */}
            <div
              ref={glowRef}
              style={{
                position: "absolute",
                bottom: "-18px", left: "15%", right: "15%", height: "28px",
                background: "radial-gradient(ellipse, rgba(100,160,255,0.35) 0%, transparent 70%)",
                filter: "blur(12px)",
                pointerEvents: "none",
                opacity: 0.4,
              }}
            />

            {/* Shimmer sweep overlay */}
            <div
              style={{
                position: "absolute", inset: 0,
                borderRadius: "999px",
                overflow: "hidden",
                pointerEvents: "none",
                zIndex: 2,
              }}
            >
              <div
                ref={shimmerRef}
                style={{
                  position: "absolute",
                  top: 0, bottom: 0,
                  width: "38%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)",
                  borderRadius: "999px",
                }}
              />
            </div>

            {/* Pill */}
            <div
              className="flex items-center"
              style={{
                position: "relative", zIndex: 1,
                border: "1px solid rgba(243,246,250,0.28)",
                borderRadius: "999px",
                overflow: "hidden",
                backgroundColor: "rgba(243,246,250,0.08)",
              }}
            >
              <input
                type="email"
                placeholder="Your e-mail here"
                style={{
                  flex: 1, padding: "14px 24px",
                  background: "transparent", border: "none",
                  color: "#F3F6FA",
                  fontFamily: "var(--font-inter)", fontSize: "12px",
                  letterSpacing: "0.08em", outline: "none",
                }}
              />
              <button
                ref={btnRef}
                onMouseMove={onBtnMove}
                onMouseLeave={onBtnLeave}
                style={{
                  width: 44, height: 44, margin: "4px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(243,246,250,0.15)",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#F3F6FA", flexShrink: 0,
                  transition: "background 0.3s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(243,246,250,0.28)"; }}
                aria-label="Subscribe"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="relative z-10 px-8 py-10" style={{ borderTop: "1px solid rgba(243,246,250,0.08)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10">

            {/* Left: logo + social */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-0">
                <span style={{ fontFamily: "var(--font-playfair)", fontSize: "26px", letterSpacing: "0.22em", color: "#F3F6FA", marginRight: "-0.28em" }}>AD</span>
                <div style={{ padding: "0 5px" }}><DiamondRingSVG color="#F3F6FA" /></div>
                <span style={{ fontFamily: "var(--font-playfair)", fontSize: "26px", letterSpacing: "0.22em", color: "#F3F6FA" }}>RNE</span>
              </div>
              <div className="flex items-center gap-3">
                <SocialBtn label="Instagram">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
                </SocialBtn>
                <SocialBtn label="YouTube">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="currentColor" stroke="none" /></svg>
                </SocialBtn>
                <SocialBtn label="Twitter">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.7 16h4.3L8.3 4H4z" /><path d="M4 20L20 4" /></svg>
                </SocialBtn>
                <SocialBtn label="Facebook">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                </SocialBtn>
                <SocialBtn label="Pinterest">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 21c1-3 2-5 3-8 0 0-1-2 0-4s3-2 3 0c0 2-2 3-1 6 0 1 2 2 4 1s3-5 1-8c-2-4-8-3-9 0-1 2 0 4 1 5" /></svg>
                </SocialBtn>
              </div>
            </div>

            {/* Right: footer links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12">
              {Object.entries(FOOTER_LINKS).map(([category, links]) => (
                <div key={category}>
                  <h4 className="mb-4" style={{ fontFamily: "var(--font-inter)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(243,246,250,0.9)" }}>
                    {category}
                  </h4>
                  <ul className="list-none space-y-2">
                    {links.map(link => (
                      <li key={link}>
                        <a
                          href="#"
                          style={{ fontFamily: "var(--font-inter)", fontSize: "11px", letterSpacing: "0.05em", color: "rgba(243,246,250,0.45)", textDecoration: "none", transition: "color 0.3s" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(243,246,250,0.9)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(243,246,250,0.45)"; }}
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-10 pt-6" style={{ borderTop: "1px solid rgba(243,246,250,0.08)" }}>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: "10px", letterSpacing: "0.12em", color: "rgba(243,246,250,0.3)", textTransform: "uppercase" }}>
              © 2026 Adorne. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
