import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function CinematicScene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    // Slow cinematic camera movement
    camera.position.y = Math.sin(clock.getElapsedTime() * 0.3) * 2;
    camera.position.z = 10 + Math.cos(clock.getElapsedTime() * 0.2) * 1;
    camera.lookAt(0, 0, 0);

    // Slow rotation of background
    if (meshRef.current) {
      meshRef.current.rotation.z = clock.getElapsedTime() * 0.05;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.3;
    }
  });

  return (
    <>
      <fog attach="fog" args={["#0a0a1a", 5, 40]} />
      <color attach="background" args={["#000000"]} />
      
      {/* Animated volumetric fog planes */}
      <mesh position={[0, 0, -10]} ref={meshRef}>
        <planeGeometry args={[50, 50, 32, 32]} />
        <shaderMaterial
          uniforms={{
            time: { value: 0 },
            color: { value: new THREE.Color(0x4a148c) },
          }}
          vertexShader={`
            uniform float time;
            varying float vNoise;
            
            float noise(vec3 p) {
              return sin(p.x * 0.5 + time * 0.3) * cos(p.y * 0.5) * sin(p.z * 0.5);
            }
            
            void main() {
              vNoise = noise(position + vec3(time));
              vec3 pos = position;
              pos.z += sin(uv.x * 6.28 + time) * 0.5;
              pos.z += cos(uv.y * 6.28 + time * 0.7) * 0.5;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 color;
            varying float vNoise;
            
            void main() {
              float alpha = abs(sin(vNoise)) * 0.3;
              gl_FragColor = vec4(color, alpha);
            }
          `}
          transparent
          wireframe={false}
        />
      </mesh>

      {/* Glowing particles */}
      <PointLights />
    </>
  );
}

function PointLights() {
  const lightRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    lightRef.current.children.forEach((light, i) => {
      const angle = (clock.getElapsedTime() + i) * 0.5;
      light.position.x = Math.cos(angle) * 15;
      light.position.y = Math.sin(angle * 0.7) * 8;
      light.position.z = Math.sin(angle * 0.3) * 10;
    });
  });

  return (
    <group ref={lightRef}>
      <pointLight position={[10, 10, 5]} intensity={1} color="#4a148c" />
      <pointLight position={[-10, 5, 5]} intensity={0.8} color="#ffb300" />
      <pointLight position={[0, -5, 10]} intensity={0.6} color="#1e3a8a" />
      <hemisphereLight args={["#1e3a8a", "#000000", 0.5]} />
    </group>
  );
}

export function CinematicBackground() {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <CinematicScene />
      </Canvas>
    </div>
  );
}
