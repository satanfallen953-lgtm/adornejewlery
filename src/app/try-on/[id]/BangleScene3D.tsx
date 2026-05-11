"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";

export interface WristPose3D {
  /** Bracelet centre, in viewport pixels */
  x: number;
  y: number;
  /** Rotation in degrees — angle of the wrist line (index-mcp → pinky-mcp) */
  rotation: number;
  /** Bracelet width in viewport pixels */
  width: number;
}

interface BangleMeshProps {
  modelUrl: string;
  poseRef: React.MutableRefObject<WristPose3D | null>;
  onLoad?: () => void;
}

/* ──────────────────────────────────────────────
   The 3D model — driven each frame by the pose ref
   ────────────────────────────────────────────── */
function BangleMesh({ modelUrl, poseRef, onLoad }: BangleMeshProps) {
  const { scene } = useGLTF(modelUrl);
  const groupRef = useRef<THREE.Group>(null);
  const { size } = useThree();
  // Normalised model — re-centred and scaled to unit size on first load.
  const normalisedRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!scene) return;
    // Clone so we don't mutate the cached GLB
    const clone = scene.clone(true);

    // Centre + uniform-scale so the bangle's largest dim = 1 unit.
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);

    const sizeV = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(sizeV.x, sizeV.y, sizeV.z) || 1;
    clone.scale.setScalar(1 / maxDim);

    // Materials tweak — make it look like polished gold/silver,
    // respect existing material textures if present.
    clone.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true;
        o.receiveShadow = false;
        const m = o.material;
        if (m instanceof THREE.MeshStandardMaterial) {
          m.envMapIntensity = 1.3;
          m.metalness = Math.max(m.metalness, 0.75);
          m.roughness = Math.min(m.roughness, 0.35);
        }
      }
    });

    normalisedRef.current = clone;
    groupRef.current?.add(clone);
    onLoad?.();

    return () => {
      groupRef.current?.remove(clone);
      clone.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const m = o.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose();
        }
      });
      normalisedRef.current = null;
    };
  }, [scene, onLoad]);

  useFrame(() => {
    const g = groupRef.current;
    const p = poseRef.current;
    if (!g) return;
    if (!p) { g.visible = false; return; }
    g.visible = true;

    // size = R3F canvas pixel size; we use an orthographic camera
    // matched to viewport pixels, so 1 world unit = 1 px.
    // Place the bangle at (pose.x, pose.y) measured from top-left,
    // converting to Three's center-origin coords (y flipped).
    g.position.x = p.x - size.width / 2;
    g.position.y = -(p.y - size.height / 2);
    g.position.z = 0;

    // Scale: bangle width in viewport px → world units.
    // Multiplier > 1 because the bangle's *front edge* is what looks
    // like its width on screen, while the model's diameter is bigger.
    const targetWidth = p.width * 1.55;
    g.scale.setScalar(targetWidth);

    // Rotation: spin around Z (screen depth axis) so the bangle aligns
    // with the line through index-mcp ↔ pinky-mcp.
    g.rotation.z = (-p.rotation * Math.PI) / 180;
    // Slight forward tilt so we see a bit of perspective on the band
    g.rotation.x = 0.25;
  });

  return <group ref={groupRef} />;
}

/* ──────────────────────────────────────────────
   Scene root — ortho camera locked to viewport
   ────────────────────────────────────────────── */
export default function BangleScene3D({
  modelUrl,
  poseRef,
  onModelLoaded,
}: {
  modelUrl: string;
  poseRef: React.MutableRefObject<WristPose3D | null>;
  onModelLoaded?: () => void;
}) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 1000], near: 0.1, far: 5000, zoom: 1 }}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
        background: "transparent",
      }}
    >
      {/* Lighting — soft key from upper-front, warm fill, rim from behind */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[400, 600, 500]} intensity={1.4} color="#fff5e0" />
      <directionalLight position={[-300, -200, 400]} intensity={0.45} color="#cfe0ff" />
      <directionalLight position={[0, 0, -500]} intensity={0.8} color="#ffd9a0" />

      <Suspense fallback={null}>
        {/* HDR environment for realistic gold/silver reflections */}
        <Environment preset="studio" />
        <BangleMesh modelUrl={modelUrl} poseRef={poseRef} onLoad={onModelLoaded} />
      </Suspense>
    </Canvas>
  );
}

// Pre-warm the GLTF loader cache
useGLTF.preload("/products/italian-bracelet.glb");
