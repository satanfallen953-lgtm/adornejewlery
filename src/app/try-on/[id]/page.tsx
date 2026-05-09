"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProductById } from "@/data/products";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ═══════════════════════════════════════════
   Camera hook
   ═══════════════════════════════════════════ */
function useCamera(facingMode: "user" | "environment") {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    setReady(false);
    setDenied(false);
    let cancelled = false;

    async function start() {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
          setReady(true);
        }
      } catch {
        if (!cancelled) setDenied(true);
      }
    }

    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facingMode]);

  return { videoRef, ready, denied };
}

/* ═══════════════════════════════════════════
   Loading screen — Cartier-style
   ═══════════════════════════════════════════ */
function LoadingScreen({ productName }: { productName: string }) {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55 }}
      style={{
        position: "fixed", inset: 0, background: "#fff",
        display: "flex", flexDirection: "column",
        alignItems: "center", zIndex: 50,
        padding: "env(safe-area-inset-top, 48px) 32px 40px",
      }}
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        style={{
          fontFamily: "var(--font-cormorant, serif)",
          fontSize: "clamp(15px, 4.5vw, 19px)",
          fontWeight: 600, letterSpacing: "0.14em",
          textTransform: "uppercase", color: "#1D3A61",
          textAlign: "center", lineHeight: 1.35,
          marginTop: 16, marginBottom: 0,
        }}
      >
        {productName}
      </motion.p>

      <motion.div
        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.9, ease: EASE }}
      >
        <svg width="280" height="210" viewBox="0 0 280 210" fill="none"
          stroke="#1D3A61" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 108 Q55 104 90 102 Q115 101 135 106 Q155 111 175 109 Q200 107 230 110" />
          <path d="M20 122 Q55 118 90 116 Q115 115 135 120 Q155 125 175 123 Q200 121 230 124" />
          <path d="M118 101 L118 121" strokeWidth="1" opacity="0.35" />
          <path d="M128 101 L128 121" strokeWidth="1" opacity="0.35" />
          <path d="M230 110 Q246 106 254 100 Q260 95 258 88 Q255 82 248 87" />
          <path d="M230 117 Q244 115 252 113 Q260 110 260 103" />
          <path d="M230 124 Q244 124 252 123 Q260 120 260 113" />
          <path d="M230 124 Q238 128 244 128 Q250 127 250 122" />
          <path d="M68 195 Q72 178 78 162 Q82 150 88 140" />
          <path d="M88 140 Q92 130 96 122 Q100 115 106 116 Q110 118 108 126 Q106 133 102 138" />
          <path d="M102 138 Q106 128 110 120 Q114 113 120 114 Q124 117 122 126 Q120 133 116 138" />
          <path d="M116 138 Q118 128 122 120 Q126 114 132 116 Q135 119 133 127 Q131 133 127 138" />
          <path d="M127 138 Q130 130 132 124 Q134 118 138 120 Q141 122 140 129" />
          <path d="M88 155 Q76 152 70 142 Q64 133 68 124 Q73 116 82 121" />
          <ellipse cx="137" cy="115" rx="20" ry="7.5" strokeDasharray="5 3" opacity="0.85" />
          <circle cx="127" cy="110" r="2" fill="#1D3A61" stroke="none" opacity="0.65" />
          <circle cx="137" cy="108.5" r="2" fill="#1D3A61" stroke="none" opacity="0.65" />
          <circle cx="147" cy="110" r="2" fill="#1D3A61" stroke="none" opacity="0.65" />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.7 }}
        style={{ textAlign: "center", paddingBottom: 32 }}
      >
        <p style={{
          fontFamily: "var(--font-inter, sans-serif)",
          fontSize: 14, color: "#1D3A61", opacity: 0.65,
          letterSpacing: "0.02em", marginBottom: 14,
        }}>
          Loading...
        </p>
        <p style={{
          fontFamily: "var(--font-inter, sans-serif)",
          fontSize: 13, color: "#1D3A61", opacity: 0.44,
          lineHeight: 1.7, maxWidth: 290, margin: "0 auto",
        }}>
          While you wait, expose your wrist after<br />removing all accessories
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Subtle hint that auto-fades
   ═══════════════════════════════════════════ */
function GestureHint({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="hint"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{
            position: "absolute", left: "50%", top: "calc(env(safe-area-inset-top, 14px) + 78px)",
            transform: "translateX(-50%)", zIndex: 25,
            pointerEvents: "none",
            background: "rgba(0,0,0,0.42)",
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            padding: "8px 14px", borderRadius: 999,
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.92)"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11V6a3 3 0 0 1 6 0v5" />
            <path d="M9 11h11l-1 8a3 3 0 0 1-3 3H9a5 5 0 0 1-5-5v-3a4 4 0 0 1 5-4z" />
          </svg>
          <span style={{
            fontFamily: "var(--font-inter, sans-serif)",
            fontSize: 11, color: "rgba(255,255,255,0.95)",
            letterSpacing: "0.06em",
          }}>
            Drag to position · Pinch to size
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════
   2-D draggable bracelet overlay (transparent PNG)
   ═══════════════════════════════════════════ */
interface OverlayState { x: number; y: number; scale: number; rotation: number; }

function DraggableBracelet({
  src, name, containerRef, onInteract,
}: {
  src: string; name: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onInteract: () => void;
}) {
  const [pos, setPos] = useState<OverlayState>({ x: 0, y: 0, scale: 0.75, rotation: 0 });
  const [loaded, setLoaded] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const gestureRef = useRef<{ dist: number; angle: number; scale: number; rotation: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    // Default to center horizontally, ~42% from top — where a held-up wrist typically lands
    // Initial scale tuned so bracelet is roughly wrist-width on a typical phone screen
    const baseScale = Math.min(1, Math.max(0.55, width / 480));
    setPos({ x: width / 2, y: height * 0.42, scale: baseScale, rotation: 0 });
  }, [containerRef]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    onInteract();
    if (e.touches.length === 1) {
      dragRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, ox: pos.x, oy: pos.y };
    } else if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      gestureRef.current = { dist: Math.hypot(dx, dy), angle: Math.atan2(dy, dx), scale: pos.scale, rotation: pos.rotation };
      dragRef.current = null;
    }
  }, [pos, onInteract]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && dragRef.current) {
      setPos((prev) => ({
        ...prev,
        x: dragRef.current!.ox + (e.touches[0].clientX - dragRef.current!.startX),
        y: dragRef.current!.oy + (e.touches[0].clientY - dragRef.current!.startY),
      }));
    } else if (e.touches.length === 2 && gestureRef.current) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      setPos((prev) => ({
        ...prev,
        scale: Math.max(0.3, Math.min(4, gestureRef.current!.scale * (dist / gestureRef.current!.dist))),
        rotation: gestureRef.current!.rotation + ((angle - gestureRef.current!.angle) * 180) / Math.PI,
      }));
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    dragRef.current = null;
    gestureRef.current = null;
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onInteract();
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: pos.x, oy: pos.y };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setPos((prev) => ({
        ...prev,
        x: dragRef.current!.ox + (ev.clientX - dragRef.current!.startX),
        y: dragRef.current!.oy + (ev.clientY - dragRef.current!.startY),
      }));
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [pos, onInteract]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    onInteract();
    setPos((prev) => ({ ...prev, scale: Math.max(0.3, Math.min(4, prev.scale - e.deltaY * 0.002)) }));
  }, [onInteract]);

  // Reference-style sizing — bracelet fills ~58% of viewport width at scale 1
  const SIZE = 320;

  return (
    <motion.div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: loaded ? 1 : 0, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      style={{
        position: "absolute",
        left: pos.x - (SIZE * pos.scale) / 2,
        top: pos.y - (SIZE * pos.scale) / 2,
        width: SIZE, height: SIZE,
        transform: `scale(${pos.scale}) rotate(${pos.rotation}deg)`,
        transformOrigin: "center center",
        cursor: "grab", touchAction: "none", userSelect: "none", zIndex: 10,
        // Soft drop shadow grounds the overlay on the wrist
        filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.38)) drop-shadow(0 3px 6px rgba(0,0,0,0.22))",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        data-overlay="true"
        draggable={false}
        onLoad={() => setLoaded(true)}
        style={{
          width: "100%", height: "100%",
          objectFit: "contain",
          pointerEvents: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
        }}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Capture snapshot (composites video + overlay PNG)
   ═══════════════════════════════════════════ */
async function captureSnapshot(container: HTMLDivElement, video: HTMLVideoElement) {
  const canvas = document.createElement("canvas");
  const w = video.videoWidth || container.clientWidth;
  const h = video.videoHeight || container.clientHeight;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Match the CSS object-fit: cover behaviour of the <video> element
  const cRect = container.getBoundingClientRect();
  const videoAspect = w / h;
  const containerAspect = cRect.width / cRect.height;
  let drawW = w, drawH = h, drawX = 0, drawY = 0;
  if (videoAspect > containerAspect) {
    // video is wider than container — crop horizontally
    drawW = h * containerAspect;
    drawX = (w - drawW) / 2;
  } else {
    drawH = w / containerAspect;
    drawY = (h - drawH) / 2;
  }
  // First draw a black backdrop, then the cropped video
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  // Re-scale so the cropped video fills the entire canvas
  const sx = w / cRect.width;
  const sy = h / cRect.height;
  // Draw video to fill output canvas (we'll draw it stretched then overlay items also stretched)
  ctx.drawImage(video, drawX, drawY, drawW, drawH, 0, 0, w, h);

  // Overlay images (transparent PNGs) — copy each at its bounding-rect position
  const overlayImgs = container.querySelectorAll<HTMLImageElement>("img[data-overlay]");
  for (const img of overlayImgs) {
    const rect = img.getBoundingClientRect();
    ctx.save();
    // Apply soft shadow on the snapshot too
    ctx.shadowColor = "rgba(0,0,0,0.38)";
    ctx.shadowBlur = 22 * sx;
    ctx.shadowOffsetY = 14 * sy;
    ctx.drawImage(
      img,
      (rect.left - cRect.left) * sx,
      (rect.top - cRect.top) * sy,
      rect.width * sx,
      rect.height * sy,
    );
    ctx.restore();
  }

  return canvas;
}

/* ═══════════════════════════════════════════
   Bottom card — WRIST SIZE + MATERIAL panes
   ═══════════════════════════════════════════ */
function BottomCard({
  sizes, material,
}: {
  sizes: string[]; material: string;
}) {
  const [activeTab, setActiveTab] = useState<"wrist" | "material" | null>(null);

  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 30,
      background: "#fff",
      borderRadius: "22px 22px 0 0",
      boxShadow: "0 -6px 30px rgba(0,0,0,0.18)",
    }}>
      <div style={{ display: "flex" }}>
        <button
          onClick={() => setActiveTab(activeTab === "wrist" ? null : "wrist")}
          style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: 8, padding: "18px 8px 16px", background: "none", border: "none",
            cursor: "pointer",
            borderBottom: activeTab === "wrist" ? "2px solid #1D3A61" : "2px solid transparent",
            transition: "border-color 0.2s ease",
          }}
        >
          <svg width="28" height="24" viewBox="0 0 28 24" fill="none"
            stroke={activeTab === "wrist" ? "#1D3A61" : "#0c0f14"}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: "stroke 0.2s ease" }}>
            <path d="M5 22 L5 14 Q5 8 14 8 Q23 8 23 14 L23 22" />
            <path d="M8 8 Q7 4 9.5 2.5 Q12 1 13.5 3 Q14.5 4.5 14 7" />
            <path d="M14 7 Q13.5 3 16 2 Q18.5 1 19.5 3 Q20 4.5 19 7" />
            <path d="M19 7 Q19 3 21 2.5 Q23 2 23.5 4 Q24 5.5 23 8" />
            <path d="M5 17 Q2 16 2 13 Q2 10 5 11" />
          </svg>
          <span style={{
            fontFamily: "var(--font-inter, sans-serif)",
            fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#0c0f14", fontWeight: 500,
          }}>Wrist Size</span>
        </button>

        <div style={{ width: 1, background: "rgba(0,0,0,0.08)", margin: "16px 0" }} />

        <button
          onClick={() => setActiveTab(activeTab === "material" ? null : "material")}
          style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: 8, padding: "18px 8px 16px", background: "none", border: "none",
            cursor: "pointer",
            borderBottom: activeTab === "material" ? "2px solid #1D3A61" : "2px solid transparent",
            transition: "border-color 0.2s ease",
          }}
        >
          <svg width="26" height="24" viewBox="0 0 26 24" fill="none"
            stroke={activeTab === "material" ? "#1D3A61" : "#0c0f14"}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: "stroke 0.2s ease" }}>
            <rect x="3" y="3" width="20" height="18" rx="2" />
            <line x1="6" y1="20" x2="20" y2="6" opacity="0.6" />
            <line x1="10" y1="20" x2="20" y2="10" opacity="0.6" />
            <line x1="14" y1="20" x2="20" y2="14" opacity="0.6" />
          </svg>
          <span style={{
            fontFamily: "var(--font-inter, sans-serif)",
            fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#0c0f14", fontWeight: 500,
          }}>Material</span>
        </button>
      </div>

      <AnimatePresence>
        {activeTab === "wrist" && (
          <motion.div key="wrist-tab"
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.26, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "10px 22px 22px", display: "flex", gap: 10, flexWrap: "wrap" }}>
              {sizes.length === 0 && (
                <span style={{
                  fontFamily: "var(--font-inter, sans-serif)", fontSize: 11,
                  color: "rgba(0,0,0,0.5)", letterSpacing: "0.04em",
                }}>One size — adjustable fit</span>
              )}
              {sizes.map((s) => (
                <span key={s} style={{
                  padding: "8px 16px", border: "1px solid rgba(0,0,0,0.18)", borderRadius: 999,
                  fontFamily: "var(--font-inter, sans-serif)", fontSize: 11,
                  letterSpacing: "0.08em", color: "#0c0f14",
                }}>{s}</span>
              ))}
            </div>
          </motion.div>
        )}
        {activeTab === "material" && (
          <motion.div key="material-tab"
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.26, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "10px 22px 22px" }}>
              <p style={{
                fontFamily: "var(--font-inter, sans-serif)", fontSize: 12,
                color: "rgba(0,0,0,0.7)", lineHeight: 1.65, margin: 0,
                letterSpacing: "0.02em",
              }}>
                {material}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ height: "env(safe-area-inset-bottom, 12px)" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main page
   ═══════════════════════════════════════════ */
export default function TryOnPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const product = getProductById(id);

  const [facingMode] = useState<"user" | "environment">("environment");
  const [showHint, setShowHint] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [flash, setFlash] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { videoRef, ready, denied } = useCamera(facingMode);

  // Auto-hide hint 4s after camera is ready, or on first interaction
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(t);
  }, [ready]);

  useEffect(() => {
    const orientation = (screen as unknown as { orientation?: { lock?: (t: string) => Promise<void> } }).orientation;
    orientation?.lock?.("portrait").catch(() => {});
  }, []);

  const handleCapture = useCallback(async () => {
    if (!containerRef.current || !videoRef.current || capturing) return;
    setCapturing(true);
    setFlash(true);
    setTimeout(() => setFlash(false), 180);
    try {
      const canvas = await captureSnapshot(containerRef.current, videoRef.current);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;
      const file = new File([blob], `adorne-tryon-${Date.now()}.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: product?.name, text: "Try on with ADORNE" });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = file.name; a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setCapturing(false);
    }
  }, [videoRef, capturing, product]);

  if (!product) {
    return (
      <div style={{ minHeight: "100svh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(0,0,0,0.35)", fontFamily: "var(--font-inter,sans-serif)", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Product not found
        </p>
      </div>
    );
  }

  const overlaySrc = product.tryOnImage ?? product.images[0];

  return (
    <div ref={containerRef} style={{ position: "fixed", inset: 0, background: "#000", overflow: "hidden" }}>

      {/* ── Camera feed ── */}
      <video ref={videoRef} playsInline muted style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", opacity: ready ? 1 : 0, transition: "opacity 0.7s ease",
      }} />

      {/* ── Loading screen ── */}
      <AnimatePresence>
        {!ready && !denied && <LoadingScreen productName={product.name} />}
      </AnimatePresence>

      {/* ── Camera denied ── */}
      <AnimatePresence>
        {denied && (
          <motion.div key="denied" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ position: "absolute", inset: 0, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "0 48px", textAlign: "center", zIndex: 50 }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(29,58,97,0.35)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34" />
            </svg>
            <p style={{ fontFamily: "var(--font-inter,sans-serif)", fontSize: 13, color: "rgba(29,58,97,0.6)", lineHeight: 1.7, margin: 0 }}>
              Camera access was denied.<br />Enable it in your browser settings and reload.
            </p>
            <button onClick={() => window.location.reload()} style={{
              marginTop: 8, padding: "11px 32px", background: "#1D3A61",
              border: "none", color: "#fff", cursor: "pointer",
              fontFamily: "var(--font-inter,sans-serif)", fontSize: 9,
              letterSpacing: "0.22em", textTransform: "uppercase",
            }}>Retry</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bracelet overlay (transparent PNG, draggable + pinch-scale) ── */}
      {ready && (
        <DraggableBracelet
          src={overlaySrc}
          name={product.name}
          containerRef={containerRef}
          onInteract={() => setShowHint(false)}
        />
      )}

      {/* ── Gesture hint pill ── */}
      {ready && <GestureHint visible={showHint} />}

      {/* ── Flash feedback ── */}
      <AnimatePresence>
        {flash && (
          <motion.div key="flash" initial={{ opacity: 0.85 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }} style={{ position: "absolute", inset: 0, background: "#fff", pointerEvents: "none", zIndex: 40 }} />
        )}
      </AnimatePresence>

      {/* ── Top bar — product name (centered) + close (right) ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 30,
        padding: "calc(env(safe-area-inset-top, 14px) + 14px) 18px 18px",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <p style={{
          fontFamily: "var(--font-inter, sans-serif)",
          fontSize: 13, fontWeight: 600,
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: "#0c0f14", margin: 0, textAlign: "center",
          maxWidth: "75%", lineHeight: 1.35,
          textShadow: "0 1px 12px rgba(255,255,255,0.4)",
        }}>
          {product.name}
        </p>

        <button onClick={() => router.back()} aria-label="Close" style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 14px) + 10px)",
          right: 16,
          width: 38, height: 38, borderRadius: "50%",
          background: "#fff",
          border: "none", color: "#0c0f14", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
          pointerEvents: "auto",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* ── Shutter button (above bottom card) ── */}
      {ready && (
        <motion.button
          onClick={handleCapture}
          disabled={capturing}
          whileTap={{ scale: 0.9 }}
          aria-label="Take photo"
          style={{
            position: "absolute",
            bottom: "calc(env(safe-area-inset-bottom, 12px) + 110px)",
            left: "50%", transform: "translateX(-50%)",
            zIndex: 35, width: 72, height: 72, borderRadius: "50%",
            background: "rgba(255,255,255,0.18)",
            border: "3px solid #fff",
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(0,0,0,0.28)",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </motion.button>
      )}

      {/* ── Bottom card ── */}
      {ready && (
        <BottomCard
          sizes={product.sizes ?? []}
          material={product.material}
        />
      )}
    </div>
  );
}
