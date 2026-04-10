"use client";

import { useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  MeshTransmissionMaterial,
  Float,
  Environment,
  Preload,
} from "@react-three/drei";
import * as THREE from "three";

interface GemProps {
  mouseX: number;
  mouseY: number;
}

function DiamondGem({ mouseX, mouseY }: GemProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Elongated octahedron = diamond silhouette
  const geo = useMemo(() => new THREE.OctahedronGeometry(1.1, 0), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    // Slow auto-spin
    meshRef.current.rotation.y += delta * 0.22;
    // Mouse-reactive tilt (lerp for smoothness)
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      mouseY * 0.28,
      0.045
    );
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      mouseX * -0.18,
      0.045
    );
  });

  return (
    <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.9}>
      <mesh ref={meshRef} geometry={geo} scale={[0.68, 1.18, 0.68]}>
        <MeshTransmissionMaterial
          backside
          samples={8}
          thickness={0.38}
          chromaticAberration={0.09}
          anisotropy={0.2}
          distortion={0.12}
          distortionScale={0.22}
          temporalDistortion={0.04}
          color="#5F8EBB"
          attenuationColor="#1D3A61"
          attenuationDistance={1.6}
          roughness={0.015}
          ior={2.42}
          transmission={0.96}
          transparent
        />
      </mesh>
    </Float>
  );
}

// Smaller accent gems orbiting the main diamond
function AccentGem({
  position,
  scale,
  speed,
}: {
  position: [number, number, number];
  scale: number;
  speed: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => new THREE.OctahedronGeometry(0.3, 0), []);
  const t = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!ref.current) return;
    t.current += delta * speed;
    ref.current.rotation.y += delta * 0.4;
    ref.current.position.y = position[1] + Math.sin(t.current) * 0.12;
  });

  return (
    <mesh ref={ref} geometry={geo} position={position} scale={scale}>
      <meshStandardMaterial
        color="#3E6FA3"
        metalness={0.9}
        roughness={0.05}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

interface DiamondSceneProps {
  mouseX: number;
  mouseY: number;
}

export default function DiamondScene({ mouseX, mouseY }: DiamondSceneProps) {
  return (
    <Canvas
      camera={{ fov: 40, position: [0, 0, 5.8], near: 0.1, far: 100 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.55} color="#F3F6FA" />
      <directionalLight position={[4, 6, 4]} intensity={1.1} color="#EEF2F8" />
      <pointLight position={[-4, 2, -2]} intensity={1.1} color="#3E6FA3" />
      <pointLight position={[3, -2, 3]} intensity={0.7} color="#5F8EBB" />
      <pointLight position={[0, 4, 0]} intensity={0.4} color="#F3F6FA" />

      <Suspense fallback={null}>
        <DiamondGem mouseX={mouseX} mouseY={mouseY} />
        <AccentGem position={[-1.6, 0.6, -0.4]} scale={0.55} speed={0.9} />
        <AccentGem position={[1.5, -0.8, -0.6]} scale={0.38} speed={1.2} />
        <AccentGem position={[0.6, 1.5, -0.8]} scale={0.28} speed={0.7} />
        <Environment preset="city" />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
