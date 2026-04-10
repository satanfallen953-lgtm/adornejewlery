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
   Hand wireframe loading screen
   ═══════════════════════════════════════════ */
function LoadingScreen() {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 36,
        zIndex: 50,
      }}
    >
      {/* Hand + bracelet wireframe */}
      <motion.svg
        width="130"
        height="190"
        viewBox="0 0 130 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        stroke="#1D3A61"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Wrist / lower arm */}
        <path d="M42 190 L42 130 Q42 116 65 114 Q88 116 88 130 L88 190" />

        {/* Lateral wrist edges to palm */}
        <path d="M42 130 Q38 116 39 104" />
        <path d="M88 130 Q92 116 91 104" />

        {/* Index finger */}
        <path d="M39 104 Q33 84 35 62 Q37 46 41 32" />
        {/* Middle finger */}
        <path d="M52 99 Q48 76 49 54 Q50 38 53 22" />
        {/* Ring finger */}
        <path d="M67 98 Q64 75 65 54 Q66 38 68 22" />
        {/* Pinky */}
        <path d="M80 100 Q79 82 78 65 Q77 51 75 42" />

        {/* Thumb */}
        <path d="M42 122 Q26 119 17 108 Q10 97 14 86 Q19 76 31 80" />

        {/* Bracelet — dashed oval */}
        <ellipse
          cx="65"
          cy="134"
          rx="26"
          ry="8"
          strokeDasharray="5 3"
          opacity="0.9"
        />
        {/* Bracelet gem dots */}
        <circle cx="55" cy="128" r="1.5" fill="#1D3A61" stroke="none" opacity="0.7" />
        <circle cx="65" cy="126.5" r="1.5" fill="#1D3A61" stroke="none" opacity="0.7" />
        <circle cx="75" cy="128" r="1.5" fill="#1D3A61" stroke="none" opacity="0.7" />
      </motion.svg>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        style={{
          fontFamily: "var(--font-inter, sans-serif)",
          fontSize: 10,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "rgba(29,58,97,0.45)",
          margin: 0,
        }}
      >
        Loading…
      </motion.p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Draggable + pinch-to-resize + two-finger-rotate bracelet
   ═══════════════════════════════════════════ */
interface OverlayState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

function DraggableBracelet({
  src,
  name,
  containerRef,
}: {
  src: string;
  name: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [pos, setPos] = useState<OverlayState>({ x: 0, y: 0, scale: 1.2, rotation: 0 });
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const gestureRef = useRef<{ dist: number; angle: number; scale: number; rotation: number } | null>(null);

  /* Default: center-x, 58% down (wrist zone) */
  useEffect(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    setPos({ x: width / 2, y: height * 0.58, scale: 1.2, rotation: 0 });
  }, [containerRef]);

  /* Touch: drag + pinch + rotate */
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        dragRef.current = {
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          ox: pos.x,
          oy: pos.y,
        };
      } else if (e.touches.length === 2) {
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        gestureRef.current = {
          dist: Math.hypot(dx, dy),
          angle: Math.atan2(dy, dx),
          scale: pos.scale,
          rotation: pos.rotation,
        };
        dragRef.current = null;
      }
    },
    [pos]
  );

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
      const scaleRatio = dist / gestureRef.current.dist;
      const angleDelta = angle - gestureRef.current.angle;
      setPos((prev) => ({
        ...prev,
        scale: Math.max(0.3, Math.min(5, gestureRef.current!.scale * scaleRatio)),
        rotation: gestureRef.current!.rotation + (angleDelta * 180) / Math.PI,
      }));
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    dragRef.current = null;
    gestureRef.current = null;
  }, []);

  /* Mouse drag (desktop preview) */
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
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
    },
    [pos]
  );

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setPos((prev) => ({
      ...prev,
      scale: Math.max(0.3, Math.min(5, prev.scale - e.deltaY * 0.002)),
    }));
  }, []);

  const SIZE = 200;

  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
      style={{
        position: "absolute",
        left: pos.x - (SIZE * pos.scale) / 2,
        top: pos.y - (SIZE * pos.scale) / 2,
        width: SIZE,
        height: SIZE,
        transform: `scale(${pos.scale}) rotate(${pos.rotation}deg)`,
        transformOrigin: "center center",
        cursor: "grab",
        touchAction: "none",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      {/* Primary: multiply blend to sit naturally on skin */}
      <img
        src={src}
        alt={name}
        data-overlay="true"
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          pointerEvents: "none",
          mixBlendMode: "multiply",
        }}
      />
      {/* Screen pass: restore highlights & shine */}
      <img
        src={src}
        alt=""
        aria-hidden
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          pointerEvents: "none",
          mixBlendMode: "screen",
          opacity: 0.18,
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════
   Capture → composite video + overlay
   ═══════════════════════════════════════════ */
async function captureSnapshot(container: HTMLDivElement, video: HTMLVideoElement) {
  const canvas = document.createElement("canvas");
  const w = video.videoWidth || container.clientWidth;
  const h = video.videoHeight || container.clientHeight;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(video, 0, 0, w, h);
  const overlayImgs = container.querySelectorAll<HTMLImageElement>("img[data-overlay]");
  for (const img of overlayImgs) {
    const rect = img.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    const sx = w / cRect.width;
    const sy = h / cRect.height;
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(
      img,
      (rect.left - cRect.left) * sx,
      (rect.top - cRect.top) * sy,
      rect.width * sx,
      rect.height * sy
    );
  }
  ctx.globalCompositeOperation = "source-over";
  return canvas;
}

/* ═══════════════════════════════════════════
   Icon components (inline SVG, no deps)
   ═══════════════════════════════════════════ */
function IconBack() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function IconFlip() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4v6h6" />
      <path d="M23 20v-6h-6" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10" />
      <path d="M3.51 15a9 9 0 0 0 14.85 3.36L23 14" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
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

  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [showHint, setShowHint] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [flash, setFlash] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { videoRef, ready, denied } = useCamera(facingMode);

  /* Hide hint after 3.5s */
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setShowHint(false), 3500);
    return () => clearTimeout(t);
  }, [ready]);

  /* Lock portrait */
  useEffect(() => {
    const orientation = (screen as unknown as { orientation?: { lock?: (t: string) => Promise<void> } }).orientation;
    orientation?.lock?.("portrait").catch(() => {});
  }, []);

  /* Capture photo */
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
        await navigator.share({ files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setCapturing(false);
    }
  }, [videoRef, capturing]);

  /* Share (without capture) */
  const handleShare = useCallback(async () => {
    if (!containerRef.current || !videoRef.current) return;
    setCapturing(true);
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
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setCapturing(false);
    }
  }, [videoRef, product]);

  if (!product) {
    return (
      <div style={{ minHeight: "100svh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(0,0,0,0.35)", fontFamily: "var(--font-inter,sans-serif)", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Product not found
        </p>
      </div>
    );
  }

  const braceletImage = product.images[0];

  return (
    <div
      ref={containerRef}
      style={{ position: "fixed", inset: 0, background: "#000", overflow: "hidden" }}
    >
      {/* ── Camera feed ── */}
      <video
        ref={videoRef}
        playsInline
        muted
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: ready ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      />

      {/* ── Loading screen ── */}
      <AnimatePresence>
        {!ready && !denied && <LoadingScreen />}
      </AnimatePresence>

      {/* ── Denied screen ── */}
      <AnimatePresence>
        {denied && (
          <motion.div
            key="denied"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              padding: "0 48px",
              textAlign: "center",
              zIndex: 50,
            }}
          >
            {/* Camera-off icon */}
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(29,58,97,0.35)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34" />
            </svg>
            <p style={{ fontFamily: "var(--font-inter,sans-serif)", fontSize: 13, color: "rgba(29,58,97,0.6)", lineHeight: 1.7, margin: 0 }}>
              Camera access was denied.
              <br />
              Enable it in your browser settings and reload.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 8,
                padding: "11px 32px",
                background: "#1D3A61",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontFamily: "var(--font-inter,sans-serif)",
                fontSize: 9,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bracelet overlay ── */}
      {ready && (
        <DraggableBracelet
          src={braceletImage}
          name={product.name}
          containerRef={containerRef}
        />
      )}

      {/* ── Camera-flash feedback ── */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key="flash"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "#fff",
              pointerEvents: "none",
              zIndex: 40,
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Hint toast ── */}
      <AnimatePresence>
        {showHint && ready && (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4, ease: EASE }}
            style={{
              position: "absolute",
              top: "calc(env(safe-area-inset-top, 0px) + 72px)",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              padding: "10px 22px",
              borderRadius: 2,
              zIndex: 20,
              maxWidth: "82vw",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <p style={{
              color: "rgba(255,255,255,0.9)",
              fontFamily: "var(--font-inter,sans-serif)",
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              margin: 0,
              lineHeight: 1.6,
            }}>
              Hold camera over your wrist
              <br />
              <span style={{ opacity: 0.55, fontSize: 9 }}>Drag · Pinch to resize · Two fingers to rotate</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top bar: close + flip ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          padding: "env(safe-area-inset-top, 14px) 20px 16px",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Close */}
        <button
          onClick={() => router.back()}
          aria-label="Close"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.3)",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Product name — center */}
        <div style={{ textAlign: "center" }}>
          <p style={{
            fontFamily: "var(--font-inter,sans-serif)",
            fontSize: 7.5,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            margin: 0,
          }}>
            Virtual Try-On
          </p>
          <p style={{
            fontFamily: "var(--font-cormorant,serif)",
            fontSize: 14,
            fontStyle: "italic",
            fontWeight: 300,
            color: "#fff",
            margin: "2px 0 0",
          }}>
            {product.name}
          </p>
        </div>

        {/* Flip camera */}
        <button
          onClick={() => setFacingMode((m) => (m === "environment" ? "user" : "environment"))}
          aria-label="Flip camera"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.3)",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconFlip />
        </button>
      </div>

      {/* ── Bottom bar: back · shutter · share ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          paddingBottom: "env(safe-area-inset-bottom, 20px)",
          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 52px env(safe-area-inset-bottom, 28px)",
        }}
      >
        {/* Back */}
        <button
          onClick={() => router.back()}
          aria-label="Back to product"
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.22)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconBack />
        </button>

        {/* Shutter */}
        <button
          onClick={handleCapture}
          disabled={capturing || !ready}
          aria-label="Capture photo"
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "transparent",
            border: "3px solid rgba(255,255,255,0.85)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.1s ease",
            transform: capturing ? "scale(0.93)" : "scale(1)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              background: capturing ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.88)",
              transition: "background 0.15s ease",
            }}
          />
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          disabled={capturing || !ready}
          aria-label="Share photo"
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.22)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconShare />
        </button>
      </div>
    </div>
  );
}
