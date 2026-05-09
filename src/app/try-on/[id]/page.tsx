"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";
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
   Wrist guide overlay
   ═══════════════════════════════════════════ */
function WristGuide({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="wrist-guide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          transition={{ duration: 0.5 }}
          style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            pointerEvents: "none", zIndex: 15,
            paddingBottom: 100,
          }}
        >
          <svg style={{ position: "absolute", top: "10%", left: "6%" }} width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M2 28 L2 2 L28 2" />
          </svg>
          <svg style={{ position: "absolute", top: "10%", right: "6%" }} width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M20 2 L46 2 L46 28" />
          </svg>
          <svg style={{ position: "absolute", bottom: "32%", left: "6%" }} width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M2 20 L2 46 L28 46" />
          </svg>
          <svg style={{ position: "absolute", bottom: "32%", right: "6%" }} width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M20 46 L46 46 L46 20" />
          </svg>

          <svg width="160" height="210" viewBox="0 0 160 210"
            fill="none" stroke="rgba(255,255,255,0.72)"
            strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M46 210 L46 148 Q46 130 80 128 Q114 130 114 148 L114 210" />
            <path d="M46 148 Q38 126 41 96 Q43 74 47 52" />
            <path d="M62 142 Q56 116 57 90 Q58 68 62 46" />
            <path d="M80 140 Q76 114 77 90 Q78 68 81 48" />
            <path d="M97 142 Q95 120 94 98 Q93 80 91 64" />
            <path d="M46 162 Q26 158 16 143 Q8 128 13 114 Q19 100 34 107" />
            <ellipse cx="80" cy="158" rx="34" ry="11" strokeDasharray="7 4" opacity="0.9" />
          </svg>

          <p style={{
            color: "rgba(255,255,255,0.9)",
            fontFamily: "var(--font-inter, sans-serif)",
            fontSize: 13, letterSpacing: "0.04em",
            margin: "12px 0 0", textAlign: "center",
            textShadow: "0 1px 6px rgba(0,0,0,0.4)",
          }}>
            Position your wrist to start
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════
   Shared overlay gesture state
   ═══════════════════════════════════════════ */
interface OverlayState { x: number; y: number; scale: number; rotation: number; }

/* ═══════════════════════════════════════════
   3-D bracelet scene (inside R3F Canvas)
   ═══════════════════════════════════════════ */
function BraceletScene({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  const normalizedScale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    return maxDim > 0 ? 1.7 / maxDim : 1;
  }, [scene]);

  // Very subtle breathing sway — just enough to show 3-D depth
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.45) * 0.12;
    }
  });

  // rotation: tilt bracelet loop toward the camera so it reads as "on wrist"
  return (
    <group ref={groupRef} scale={normalizedScale} rotation={[Math.PI * 0.18, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

/* ═══════════════════════════════════════════
   3-D draggable bracelet overlay
   ═══════════════════════════════════════════ */
function DraggableBracelet3D({
  url, name, containerRef,
}: {
  url: string; name: string; containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [pos, setPos] = useState<OverlayState>({ x: 0, y: 0, scale: 1.2, rotation: 0 });
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const gestureRef = useRef<{ dist: number; angle: number; scale: number; rotation: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    setPos({ x: width / 2, y: height * 0.62, scale: 1.1, rotation: 0 });
  }, [containerRef]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      dragRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, ox: pos.x, oy: pos.y };
    } else if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      gestureRef.current = { dist: Math.hypot(dx, dy), angle: Math.atan2(dy, dx), scale: pos.scale, rotation: pos.rotation };
      dragRef.current = null;
    }
  }, [pos]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && dragRef.current) {
      setPos((prev) => ({ ...prev, x: dragRef.current!.ox + (e.touches[0].clientX - dragRef.current!.startX), y: dragRef.current!.oy + (e.touches[0].clientY - dragRef.current!.startY) }));
    } else if (e.touches.length === 2 && gestureRef.current) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      setPos((prev) => ({ ...prev, scale: Math.max(0.3, Math.min(5, gestureRef.current!.scale * (dist / gestureRef.current!.dist))), rotation: gestureRef.current!.rotation + ((angle - gestureRef.current!.angle) * 180) / Math.PI }));
    }
  }, []);

  const onTouchEnd = useCallback(() => { dragRef.current = null; gestureRef.current = null; }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: pos.x, oy: pos.y };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setPos((prev) => ({ ...prev, x: dragRef.current!.ox + (ev.clientX - dragRef.current!.startX), y: dragRef.current!.oy + (ev.clientY - dragRef.current!.startY) }));
    };
    const onUp = () => { dragRef.current = null; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [pos]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setPos((prev) => ({ ...prev, scale: Math.max(0.3, Math.min(5, prev.scale - e.deltaY * 0.002)) }));
  }, []);

  const SIZE = 260;
  return (
    <div
      onMouseDown={onMouseDown} onTouchStart={onTouchStart}
      onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onWheel={onWheel}
      style={{
        position: "absolute",
        left: pos.x - (SIZE * pos.scale) / 2,
        top: pos.y - (SIZE * pos.scale) / 2,
        width: SIZE, height: SIZE,
        transform: `scale(${pos.scale}) rotate(${pos.rotation}deg)`,
        transformOrigin: "center center",
        cursor: "grab", touchAction: "none", userSelect: "none", zIndex: 10,
      }}
    >
      <Canvas
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        camera={{ position: [0, 0.6, 3.2], fov: 36 }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
        onCreated={({ gl }) => {
          gl.domElement.setAttribute("data-overlay-canvas", "true");
          gl.domElement.setAttribute("aria-label", name);
        }}
      >
        {/* Warm gold-friendly lighting */}
        <ambientLight intensity={0.7} color="#fff5e0" />
        <directionalLight position={[4, 10, 6]} intensity={2.8} color="#fffaf0" castShadow />
        <directionalLight position={[-4, 4, -4]} intensity={0.5} color="#ffd580" />
        <pointLight position={[0, 2, 3]} intensity={1.2} color="#ffe08a" />
        <Environment preset="studio" />
        <Suspense fallback={null}>
          <BraceletScene url={url} />
        </Suspense>
      </Canvas>
    </div>
  );
}

/* ═══════════════════════════════════════════
   2-D flat-image draggable bracelet (fallback)
   ═══════════════════════════════════════════ */
function DraggableBracelet({
  src, name, containerRef, transparent = false,
}: {
  src: string; name: string; containerRef: React.RefObject<HTMLDivElement | null>; transparent?: boolean;
}) {
  const [pos, setPos] = useState<OverlayState>({ x: 0, y: 0, scale: 1.2, rotation: 0 });
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const gestureRef = useRef<{ dist: number; angle: number; scale: number; rotation: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    setPos({ x: width / 2, y: height * 0.52, scale: 1.2, rotation: 0 });
  }, [containerRef]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      dragRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, ox: pos.x, oy: pos.y };
    } else if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      gestureRef.current = { dist: Math.hypot(dx, dy), angle: Math.atan2(dy, dx), scale: pos.scale, rotation: pos.rotation };
      dragRef.current = null;
    }
  }, [pos]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && dragRef.current) {
      setPos((prev) => ({ ...prev, x: dragRef.current!.ox + (e.touches[0].clientX - dragRef.current!.startX), y: dragRef.current!.oy + (e.touches[0].clientY - dragRef.current!.startY) }));
    } else if (e.touches.length === 2 && gestureRef.current) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      setPos((prev) => ({ ...prev, scale: Math.max(0.3, Math.min(5, gestureRef.current!.scale * (dist / gestureRef.current!.dist))), rotation: gestureRef.current!.rotation + ((angle - gestureRef.current!.angle) * 180) / Math.PI }));
    }
  }, []);

  const onTouchEnd = useCallback(() => { dragRef.current = null; gestureRef.current = null; }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: pos.x, oy: pos.y };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setPos((prev) => ({ ...prev, x: dragRef.current!.ox + (ev.clientX - dragRef.current!.startX), y: dragRef.current!.oy + (ev.clientY - dragRef.current!.startY) }));
    };
    const onUp = () => { dragRef.current = null; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [pos]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setPos((prev) => ({ ...prev, scale: Math.max(0.3, Math.min(5, prev.scale - e.deltaY * 0.002)) }));
  }, []);

  const SIZE = 200;
  return (
    <div
      onMouseDown={onMouseDown} onTouchStart={onTouchStart}
      onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onWheel={onWheel}
      style={{
        position: "absolute",
        left: pos.x - (SIZE * pos.scale) / 2,
        top: pos.y - (SIZE * pos.scale) / 2,
        width: SIZE, height: SIZE,
        transform: `scale(${pos.scale}) rotate(${pos.rotation}deg)`,
        transformOrigin: "center center",
        cursor: "grab", touchAction: "none", userSelect: "none", zIndex: 10,
      }}
    >
      <img src={src} alt={name} data-overlay="true" draggable={false}
        style={{
          width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none",
          mixBlendMode: transparent ? "normal" : "multiply",
        }} />
      {!transparent && (
        <img src={src} alt="" aria-hidden draggable={false}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none", mixBlendMode: "screen", opacity: 0.18 }} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Capture snapshot (handles both 2-D and 3-D overlays)
   ═══════════════════════════════════════════ */
async function captureSnapshot(container: HTMLDivElement, video: HTMLVideoElement) {
  const canvas = document.createElement("canvas");
  const w = video.videoWidth || container.clientWidth;
  const h = video.videoHeight || container.clientHeight;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(video, 0, 0, w, h);

  const cRect = container.getBoundingClientRect();
  const sx = w / cRect.width;
  const sy = h / cRect.height;

  // 2-D image overlays
  const overlayImgs = container.querySelectorAll<HTMLImageElement>("img[data-overlay]");
  for (const img of overlayImgs) {
    const rect = img.getBoundingClientRect();
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(img, (rect.left - cRect.left) * sx, (rect.top - cRect.top) * sy, rect.width * sx, rect.height * sy);
  }

  // 3-D WebGL canvas overlays
  const overlayCanvases = container.querySelectorAll<HTMLCanvasElement>("canvas[data-overlay-canvas]");
  for (const cvs of overlayCanvases) {
    const rect = cvs.getBoundingClientRect();
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(cvs, (rect.left - cRect.left) * sx, (rect.top - cRect.top) * sy, rect.width * sx, rect.height * sy);
  }

  ctx.globalCompositeOperation = "source-over";
  return canvas;
}

/* ═══════════════════════════════════════════
   Bottom sheet — WRIST SIZE + MATERIAL tabs
   ═══════════════════════════════════════════ */
function BottomSheet({
  sizes, material, onCapture, onShare, capturing, ready,
}: {
  sizes: string[]; material: string;
  onCapture: () => void; onShare: () => void;
  capturing: boolean; ready: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"wrist" | "material" | null>(null);

  return (
    <>
      <motion.button
        onClick={onCapture}
        disabled={capturing || !ready}
        whileTap={{ scale: 0.9 }}
        style={{
          position: "absolute",
          bottom: activeTab ? 148 : 112,
          left: "50%", transform: "translateX(-50%)",
          zIndex: 35, width: 70, height: 70, borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
          border: "2.5px solid rgba(255,255,255,0.85)",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "bottom 0.3s ease",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </motion.button>

      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 30,
        background: "#fff", borderRadius: "18px 18px 0 0",
        boxShadow: "0 -4px 32px rgba(0,0,0,0.12)",
      }}>
        <div style={{ width: 32, height: 4, background: "rgba(0,0,0,0.12)", borderRadius: 2, margin: "10px auto 0" }} />

        <div style={{ display: "flex", padding: "10px 16px 0" }}>
          <button
            onClick={() => setActiveTab(activeTab === "wrist" ? null : "wrist")}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 5, padding: "10px 8px 12px", background: "none", border: "none",
              cursor: "pointer", borderBottom: activeTab === "wrist" ? "2px solid #1D3A61" : "2px solid transparent",
              transition: "border-color 0.2s ease",
            }}
          >
            <svg width="26" height="22" viewBox="0 0 26 22" fill="none"
              stroke={activeTab === "wrist" ? "#1D3A61" : "rgba(29,58,97,0.38)"}
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: "stroke 0.2s ease" }}>
              <path d="M4 20 L4 13 Q4 7 13 7 Q22 7 22 13 L22 20" />
              <path d="M7 7 Q6 3 8.5 1.5 Q11 0 12.5 2 Q13.5 3.5 13 6" />
              <path d="M13 6 Q12.5 2 15 1 Q17.5 0 18.5 2 Q19 3.5 18 6" />
              <path d="M18 6 Q18 2 20 1.5 Q22 1 22.5 3 Q23 4.5 22 7" />
              <path d="M4 16 Q1 15 1 12 Q1 9 4 10" />
            </svg>
            <span style={{
              fontFamily: "var(--font-inter, sans-serif)", fontSize: 8.5,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: activeTab === "wrist" ? "#1D3A61" : "rgba(29,58,97,0.42)",
              fontWeight: activeTab === "wrist" ? 600 : 400,
              transition: "color 0.2s ease",
            }}>Wrist Size</span>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === "material" ? null : "material")}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 5, padding: "10px 8px 12px", background: "none", border: "none",
              cursor: "pointer", borderBottom: activeTab === "material" ? "2px solid #1D3A61" : "2px solid transparent",
              transition: "border-color 0.2s ease",
            }}
          >
            <svg width="26" height="22" viewBox="0 0 26 22" fill="none"
              stroke={activeTab === "material" ? "#1D3A61" : "rgba(29,58,97,0.38)"}
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: "stroke 0.2s ease" }}>
              <rect x="2" y="2" width="22" height="18" rx="2" />
              <line x1="2" y1="8" x2="24" y2="8" opacity="0.45" />
              <line x1="2" y1="14" x2="24" y2="14" opacity="0.45" />
              <line x1="9" y1="2" x2="9" y2="20" opacity="0.45" />
              <line x1="17" y1="2" x2="17" y2="20" opacity="0.45" />
            </svg>
            <span style={{
              fontFamily: "var(--font-inter, sans-serif)", fontSize: 8.5,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: activeTab === "material" ? "#1D3A61" : "rgba(29,58,97,0.42)",
              fontWeight: activeTab === "material" ? 600 : 400,
              transition: "color 0.2s ease",
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
              <div style={{ padding: "10px 20px 20px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {sizes.map((s) => (
                  <span key={s} style={{
                    padding: "7px 16px", border: "1px solid rgba(29,58,97,0.2)",
                    fontFamily: "var(--font-inter, sans-serif)", fontSize: 10,
                    letterSpacing: "0.1em", color: "#1D3A61",
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
              <div style={{ padding: "10px 20px 20px" }}>
                <p style={{
                  fontFamily: "var(--font-inter, sans-serif)", fontSize: 11,
                  color: "rgba(29,58,97,0.6)", lineHeight: 1.65, margin: 0,
                }}>
                  {material}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ height: "env(safe-area-inset-bottom, 8px)" }} />
      </div>
    </>
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
  const [showGuide, setShowGuide] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [flash, setFlash] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { videoRef, ready, denied } = useCamera(facingMode);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setShowGuide(false), 4000);
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
        a.href = url; a.download = file.name; a.click();
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

      {/* ── Wrist guide ── */}
      {ready && <WristGuide visible={showGuide} />}

      {/* ── Bracelet overlay ── */}
      <AnimatePresence>
        {ready && !showGuide && (
          <motion.div key="bracelet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
            style={{ position: "absolute", inset: 0, zIndex: 10 }}>
            {product.tryOnModel ? (
              <DraggableBracelet3D
                url={product.tryOnModel}
                name={product.name}
                containerRef={containerRef}
              />
            ) : (
              <DraggableBracelet
                src={product.tryOnImage ?? product.images[0]}
                name={product.name}
                containerRef={containerRef}
                transparent={!!product.tryOnImage}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Flash feedback ── */}
      <AnimatePresence>
        {flash && (
          <motion.div key="flash" initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }} style={{ position: "absolute", inset: 0, background: "#fff", pointerEvents: "none", zIndex: 40 }} />
        )}
      </AnimatePresence>

      {/* ── Top bar ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 30,
        padding: "env(safe-area-inset-top, 14px) 18px 16px",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button onClick={() => router.back()} aria-label="Close" style={{
          width: 40, height: 40, borderRadius: "50%", background: "rgba(0,0,0,0.28)",
          border: "none", color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-inter,sans-serif)", fontSize: 7.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", margin: 0 }}>
            Virtual Try-On
          </p>
          <p style={{ fontFamily: "var(--font-cormorant,serif)", fontSize: 14, fontStyle: "italic", fontWeight: 300, color: "#fff", margin: "2px 0 0" }}>
            {product.name}
          </p>
        </div>

        <button onClick={() => { setFacingMode((m) => (m === "environment" ? "user" : "environment")); setShowGuide(true); }}
          aria-label="Flip camera" style={{
            width: 40, height: 40, borderRadius: "50%", background: "rgba(0,0,0,0.28)",
            border: "none", color: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 4v6h6" /><path d="M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10" />
            <path d="M3.51 15a9 9 0 0 0 14.85 3.36L23 14" />
          </svg>
        </button>
      </div>

      {/* ── Bottom sheet ── */}
      {ready && (
        <BottomSheet
          sizes={product.sizes ?? []}
          material={product.material}
          onCapture={handleCapture}
          onShare={handleShare}
          capturing={capturing}
          ready={ready}
        />
      )}
    </div>
  );
}
