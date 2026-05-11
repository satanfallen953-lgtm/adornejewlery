"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProductById } from "@/data/products";
import type { HandLandmarker as HandLandmarkerType } from "@mediapipe/tasks-vision";

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
          video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
          videoRef.current.onloadeddata = () => { if (!cancelled) setReady(true); };
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
   Hand-tracking hook (MediaPipe HandLandmarker)
   ═══════════════════════════════════════════ */
interface WristPose {
  /** Bracelet centre, in screen pixels relative to viewport */
  x: number;
  y: number;
  /** Rotation in degrees (matches the angle of the wrist line) */
  rotation: number;
  /** Bracelet width in pixels (matches detected wrist width) */
  width: number;
}

function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  ready: boolean,
  mirrored: boolean,
) {
  const [pose, setPose] = useState<WristPose | null>(null);
  const [tracking, setTracking] = useState(false);
  const landmarkerRef = useRef<HandLandmarkerType | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastDetectMsRef = useRef<number>(0);

  useEffect(() => {
    if (!ready || !videoRef.current) return;
    let cancelled = false;

    async function init() {
      try {
        // Lazy-import so the wasm only loads when we actually need it
        const mp = await import("@mediapipe/tasks-vision");
        const vision = await mp.FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm",
        );
        if (cancelled) return;
        const landmarker = await mp.HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;
        loop();
      } catch (err) {
        console.error("[hand-tracking] init failed", err);
      }
    }

    // Smoothed pose (exponential moving average) so the bracelet doesn't jitter
    const smooth = { x: 0, y: 0, rot: 0, w: 0, set: false };
    const SMOOTH = 0.4; // 0 = no movement, 1 = instant snap

    function loop() {
      if (cancelled) return;
      const video = videoRef.current;
      const lm = landmarkerRef.current;
      if (!video || !lm || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const now = performance.now();
      // Throttle to ~30fps to save battery
      if (now - lastDetectMsRef.current < 33) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      lastDetectMsRef.current = now;

      let result;
      try {
        result = lm.detectForVideo(video, now);
      } catch {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      if (result.landmarks && result.landmarks.length > 0) {
        const lms = result.landmarks[0];
        const wrist = lms[0];
        const indexMcp = lms[5];
        const pinkyMcp = lms[17];

        // The video element uses object-fit: cover. Map normalized [0,1]
        // landmark coords back to screen pixels accounting for the crop.
        const rect = video.getBoundingClientRect();
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const videoAspect = vw / vh;
        const dispAspect = rect.width / rect.height;

        let scaleFit, cropX = 0, cropY = 0;
        if (videoAspect > dispAspect) {
          // Video is wider than display — left/right are cropped
          scaleFit = rect.height / vh;
          cropX = (vw * scaleFit - rect.width) / 2;
        } else {
          // Video is taller than display — top/bottom are cropped
          scaleFit = rect.width / vw;
          cropY = (vh * scaleFit - rect.height) / 2;
        }

        const toScreen = (nx: number, ny: number) => {
          // If the video is CSS-mirrored (selfie cam), flip x
          const px = (mirrored ? 1 - nx : nx) * vw * scaleFit - cropX + rect.left;
          const py = ny * vh * scaleFit - cropY + rect.top;
          return [px, py] as const;
        };

        const [wx, wy] = toScreen(wrist.x, wrist.y);
        const [ix, iy] = toScreen(indexMcp.x, indexMcp.y);
        const [pxk, pyk] = toScreen(pinkyMcp.x, pinkyMcp.y);

        // Palm centre (midpoint of index-mcp and pinky-mcp)
        const palmCx = (ix + pxk) / 2;
        const palmCy = (iy + pyk) / 2;

        // Hand axis: vector from wrist toward palm (i.e. toward the fingers).
        // The bracelet should sit just past the wrist, opposite the fingers.
        const hdX = palmCx - wx;
        const hdY = palmCy - wy;
        const hdLen = Math.hypot(hdX, hdY) || 1;

        // Position bracelet ~30% of palm-length below the wrist landmark
        // (i.e. on the forearm, where a watch would sit).
        const OFFSET = 0.35;
        const bx = wx - (hdX / hdLen) * hdLen * OFFSET;
        const by = wy - (hdY / hdLen) * hdLen * OFFSET;

        // Rotation: align bracelet horizontal axis with the line between
        // the index-mcp and pinky-mcp (perpendicular to the arm).
        let rot = (Math.atan2(pyk - iy, pxk - ix) * 180) / Math.PI;
        // Normalise to [-180,180] then keep close to previous to avoid 360° flips
        if (smooth.set) {
          while (rot - smooth.rot > 180) rot -= 360;
          while (rot - smooth.rot < -180) rot += 360;
        }

        // Bracelet width: roughly 1.55× palm width feels natural for a wrist
        const palmWidth = Math.hypot(pxk - ix, pyk - iy);
        const targetW = palmWidth * 1.55;

        if (!smooth.set) {
          smooth.x = bx; smooth.y = by; smooth.rot = rot; smooth.w = targetW;
          smooth.set = true;
        } else {
          smooth.x += (bx - smooth.x) * SMOOTH;
          smooth.y += (by - smooth.y) * SMOOTH;
          smooth.rot += (rot - smooth.rot) * SMOOTH;
          smooth.w += (targetW - smooth.w) * SMOOTH;
        }

        setPose({ x: smooth.x, y: smooth.y, rotation: smooth.rot, width: smooth.w });
        setTracking(true);
      } else {
        setTracking(false);
        // keep last pose so the bracelet doesn't disappear if the hand briefly leaves
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    init();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [ready, videoRef, mirrored]);

  return { pose, tracking };
}

/* ═══════════════════════════════════════════
   Loading screen — Cartier-style
   ═══════════════════════════════════════════ */
function LoadingScreen({ productName, sub }: { productName: string; sub: string }) {
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
          {sub}
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
   Tracking status pill (top under product name)
   ═══════════════════════════════════════════ */
function TrackingStatus({ tracking }: { tracking: boolean }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tracking ? "on" : "off"}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.35, ease: EASE }}
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 14px) + 64px)",
          left: "50%", transform: "translateX(-50%)",
          zIndex: 25, pointerEvents: "none",
          background: tracking ? "rgba(20,80,40,0.65)" : "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          padding: "6px 12px", borderRadius: 999,
          display: "flex", alignItems: "center", gap: 8,
        }}
      >
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: tracking ? "#5fffaa" : "#ffd24f",
          boxShadow: `0 0 8px ${tracking ? "#5fffaa" : "#ffd24f"}`,
        }} />
        <span style={{
          fontFamily: "var(--font-inter, sans-serif)",
          fontSize: 10, color: "rgba(255,255,255,0.95)",
          letterSpacing: "0.14em", textTransform: "uppercase",
        }}>
          {tracking ? "Wrist locked" : "Show your wrist"}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════
   Bracelet overlay — auto-positioned by tracking
   ═══════════════════════════════════════════ */
function TrackedBracelet({
  src, name, pose, visible,
}: {
  src: string; name: string;
  pose: WristPose | null;
  visible: boolean;
}) {
  if (!pose) return null;
  // Asset is a 500x500 square PNG of the bangle in 3D perspective.
  // The bangle fills ~78% of the width; size the wrapper so pose.width
  // corresponds to the actual bracelet width, not the transparent padding.
  const ASSET_FILL = 0.78;
  const wrapperW = pose.width / ASSET_FILL;
  // Square asset → square wrapper. The bangle's vertical extent is shorter
  // than its horizontal, but `object-fit: contain` keeps it correctly placed.
  const wrapperH = wrapperW;

  return (
    <div
      style={{
        position: "absolute",
        left: pose.x - wrapperW / 2,
        top: pose.y - wrapperH / 2,
        width: wrapperW,
        height: wrapperH,
        transform: `rotate(${pose.rotation}deg)`,
        transformOrigin: "center center",
        zIndex: 10,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.45s ease",
        // Soft contact shadow so the bracelet feels grounded on the wrist
        filter:
          "drop-shadow(0 6px 10px rgba(0,0,0,0.45)) drop-shadow(0 1px 3px rgba(0,0,0,0.35))",
        willChange: "transform, left, top, width, height",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        data-overlay="true"
        draggable={false}
        style={{
          width: "100%", height: "100%",
          objectFit: "contain",
          pointerEvents: "none",
          WebkitUserSelect: "none", userSelect: "none",
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════
   Capture snapshot (composites video + overlay)
   ═══════════════════════════════════════════ */
async function captureSnapshot(container: HTMLDivElement, video: HTMLVideoElement) {
  const canvas = document.createElement("canvas");
  const w = video.videoWidth || container.clientWidth;
  const h = video.videoHeight || container.clientHeight;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const cRect = container.getBoundingClientRect();
  const videoAspect = w / h;
  const containerAspect = cRect.width / cRect.height;
  let drawW = w, drawH = h, drawX = 0, drawY = 0;
  if (videoAspect > containerAspect) {
    drawW = h * containerAspect;
    drawX = (w - drawW) / 2;
  } else {
    drawH = w / containerAspect;
    drawY = (h - drawH) / 2;
  }
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(video, drawX, drawY, drawW, drawH, 0, 0, w, h);

  const sx = w / cRect.width;
  const sy = h / cRect.height;

  // Composite each overlay <img> at its current bounding rect (with rotation)
  const overlays = container.querySelectorAll<HTMLImageElement>("img[data-overlay]");
  for (const img of overlays) {
    const wrap = img.parentElement as HTMLElement | null;
    if (!wrap) continue;
    const rect = wrap.getBoundingClientRect();
    const cx = (rect.left + rect.width / 2 - cRect.left) * sx;
    const cy = (rect.top + rect.height / 2 - cRect.top) * sy;
    // Read rotation from the wrapper's transform matrix
    const tr = getComputedStyle(wrap).transform;
    let rotation = 0;
    if (tr && tr.startsWith("matrix(")) {
      const m = tr.slice(7, -1).split(",").map(Number);
      rotation = Math.atan2(m[1], m[0]);
    }
    const drawWp = rect.width * sx;
    const drawHp = rect.height * sy;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 10 * sx;
    ctx.shadowOffsetY = 6 * sy;
    ctx.drawImage(img, -drawWp / 2, -drawHp / 2, drawWp, drawHp);
    ctx.restore();
  }

  return canvas;
}

/* ═══════════════════════════════════════════
   Bottom card — WRIST SIZE + MATERIAL panes
   ═══════════════════════════════════════════ */
function BottomCard({ sizes, material }: { sizes: string[]; material: string }) {
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
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
   Desktop gate — shown when screen ≥ 768px
   ═══════════════════════════════════════════ */
function DesktopGate({ productName, qrUrl }: { productName: string; qrUrl: string }) {
  const router = useRouter();
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=1D3A61&bgcolor=ffffff&data=${encodeURIComponent(qrUrl)}&qzone=2`;

  return (
    <div style={{
      minHeight: "100svh", background: "#F3F6FA",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 24px",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 12px 60px rgba(29,58,97,0.10), 0 2px 8px rgba(29,58,97,0.06)",
          padding: "clamp(40px, 6vw, 72px) clamp(32px, 5vw, 80px)",
          maxWidth: 520, width: "100%",
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 0, textAlign: "center",
        }}
      >
        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{
            position: "absolute" as const, top: 0, left: 0,
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: "#1D3A61", opacity: 0.55,
            fontFamily: "var(--font-inter, sans-serif)",
            fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
          }}
        />

        {/* Gold rule */}
        <div style={{
          width: 32, height: 1.5, background: "linear-gradient(90deg, #B8965A, #D4AF7A, #B8965A)",
          borderRadius: 99, marginBottom: 28,
        }} />

        {/* Label */}
        <p style={{
          fontFamily: "var(--font-inter, sans-serif)",
          fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
          color: "#1D3A61", opacity: 0.5, margin: "0 0 14px",
        }}>Virtual Try‑On</p>

        {/* Heading */}
        <h2 style={{
          fontFamily: "var(--font-cormorant, serif)",
          fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 600,
          color: "#1D3A61", margin: "0 0 10px", lineHeight: 1.25,
          letterSpacing: "-0.01em",
        }}>
          {productName}
        </h2>

        {/* Sub */}
        <p style={{
          fontFamily: "var(--font-inter, sans-serif)",
          fontSize: 13, color: "rgba(29,58,97,0.55)", lineHeight: 1.7,
          margin: "0 0 36px", maxWidth: 340,
        }}>
          This experience is designed for your phone camera.<br />
          Scan the code below to try it on — no app needed.
        </p>

        {/* QR */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.65, ease: EASE }}
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 16,
            border: "1.5px solid rgba(29,58,97,0.10)",
            boxShadow: "0 4px 24px rgba(29,58,97,0.08)",
            marginBottom: 28,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrSrc}
            alt="QR code to open try-on on mobile"
            width={180}
            height={180}
            style={{ display: "block", borderRadius: 8 }}
          />
        </motion.div>

        {/* Scan hint */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
          <div style={{ height: 1, width: 40, background: "rgba(29,58,97,0.12)" }} />
          <p style={{
            fontFamily: "var(--font-inter, sans-serif)",
            fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase",
            color: "rgba(29,58,97,0.38)", margin: 0, whiteSpace: "nowrap",
          }}>Point your phone camera here</p>
          <div style={{ height: 1, width: 40, background: "rgba(29,58,97,0.12)" }} />
        </div>

        {/* Steps */}
        <div style={{
          display: "flex", gap: 24, flexWrap: "wrap" as const, justifyContent: "center",
          marginBottom: 40,
        }}>
          {[
            { n: "01", label: "Scan QR code" },
            { n: "02", label: "Allow camera" },
            { n: "03", label: "Show your wrist" },
          ].map(({ n, label }) => (
            <div key={n} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 6 }}>
              <span style={{
                fontFamily: "var(--font-cormorant, serif)",
                fontSize: 22, fontWeight: 600, color: "#1D3A61", opacity: 0.18,
                lineHeight: 1,
              }}>{n}</span>
              <span style={{
                fontFamily: "var(--font-inter, sans-serif)",
                fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
                color: "rgba(29,58,97,0.55)",
              }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Back link */}
        <button
          onClick={() => router.back()}
          style={{
            background: "none", border: "1.5px solid rgba(29,58,97,0.18)",
            padding: "10px 28px", borderRadius: 999,
            fontFamily: "var(--font-inter, sans-serif)",
            fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
            color: "#1D3A61", cursor: "pointer",
            transition: "border-color 0.2s, background 0.2s",
          }}
        >
          ← Back to product
        </button>
      </motion.div>
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

  // Detect desktop (screen width ≥ 768px) — evaluated client-side only
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    setIsDesktop(window.innerWidth >= 768);
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [capturing, setCapturing] = useState(false);
  const [flash, setFlash] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { videoRef, ready, denied } = useCamera(facingMode);

  // Selfie cam (user-facing) is mirrored via CSS — flip x for landmark mapping
  const mirrored = facingMode === "user";
  const { pose, tracking } = useHandTracking(videoRef, ready, mirrored);

  // Mark hand-landmarker model loaded once we get the first detection or after 4s
  useEffect(() => {
    if (!ready) return;
    if (tracking) { setModelLoading(false); return; }
    const t = setTimeout(() => setModelLoading(false), 4000);
    return () => clearTimeout(t);
  }, [ready, tracking]);

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

  // Show desktop gate before starting camera / MediaPipe
  if (isDesktop) {
    const qrUrl = typeof window !== "undefined"
      ? window.location.href
      : `https://vibrant-kalam-5fc654.vercel.app/try-on/${id}`;
    return <DesktopGate productName={product.name} qrUrl={qrUrl} />;
  }

  const overlaySrc = product.tryOnImage ?? product.images[0];
  const showLoading = !ready || modelLoading;

  return (
    <div ref={containerRef} style={{ position: "fixed", inset: 0, background: "#000", overflow: "hidden" }}>

      {/* ── Camera feed ── */}
      <video
        ref={videoRef}
        playsInline
        muted
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover",
          opacity: ready ? 1 : 0,
          transition: "opacity 0.7s ease",
          transform: mirrored ? "scaleX(-1)" : "none",
        }}
      />

      {/* ── Loading screen ── */}
      <AnimatePresence>
        {showLoading && !denied && (
          <LoadingScreen
            productName={product.name}
            sub={!ready ? "Loading camera..." : "Calibrating wrist tracking..."}
          />
        )}
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

      {/* ── Bracelet overlay (auto-positioned by hand tracking) ── */}
      {ready && (
        <TrackedBracelet
          src={overlaySrc}
          name={product.name}
          pose={pose}
          visible={tracking || pose !== null}
        />
      )}

      {/* ── Tracking status pill ── */}
      {ready && !showLoading && <TrackingStatus tracking={tracking} />}

      {/* ── Flash feedback ── */}
      <AnimatePresence>
        {flash && (
          <motion.div key="flash" initial={{ opacity: 0.85 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }} style={{ position: "absolute", inset: 0, background: "#fff", pointerEvents: "none", zIndex: 40 }} />
        )}
      </AnimatePresence>

      {/* ── Top bar — product name (centered) + close (right) + flip cam (left) ── */}
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
          maxWidth: "70%", lineHeight: 1.35,
          textShadow: "0 1px 12px rgba(255,255,255,0.45)",
        }}>
          {product.name}
        </p>

        <button
          onClick={() => setFacingMode((m) => (m === "environment" ? "user" : "environment"))}
          aria-label="Flip camera"
          style={{
            position: "absolute",
            top: "calc(env(safe-area-inset-top, 14px) + 10px)",
            left: 16,
            width: 38, height: 38, borderRadius: "50%",
            background: "rgba(255,255,255,0.92)",
            border: "none", color: "#0c0f14", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
            pointerEvents: "auto",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 4v6h6" /><path d="M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10" />
            <path d="M3.51 15a9 9 0 0 0 14.85 3.36L23 14" />
          </svg>
        </button>

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
      {ready && <BottomCard sizes={product.sizes ?? []} material={product.material} />}
    </div>
  );
}
