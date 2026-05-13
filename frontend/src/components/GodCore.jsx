import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function CoreMesh({ progress = 0 }) {
  const meshRef = useRef();
  
  // Dynamic scale based on progress
  const scale = useMemo(() => 1 + (progress / 100) * 0.5, [progress]);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.2;
      meshRef.current.rotation.y = t * 0.3;
    }
  });

  return (
    <Float speed={4} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={scale}>
        <MeshDistortMaterial
          color={progress >= 100 ? "#00E5CC" : "#BCFF47"}
          speed={3}
          distort={0.4}
          radius={1}
          metalness={0.8}
          roughness={0.2}
          emissive={progress >= 100 ? "#00E5CC" : "#BCFF47"}
          emissiveIntensity={0.5}
        />
      </Sphere>
    </Float>
  );
}

export default function GodCore({ progress = 0 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.6 }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} color="#BCFF47" intensity={1} />
        <CoreMesh progress={progress} />
      </Canvas>
    </div>
  );
}
