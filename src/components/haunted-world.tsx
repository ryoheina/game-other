import { Canvas, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function CameraBreath() {
  useFrame(({ camera, clock }) => {
    const time = clock.getElapsedTime();
    camera.position.x = Math.sin(time * 0.11) * 0.12;
    camera.position.y = Math.cos(time * 0.16) * 0.07;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Dust() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(420 * 3);
    for (let index = 0; index < values.length; index += 3) {
      values[index] = (Math.random() - 0.5) * 14;
      values[index + 1] = (Math.random() - 0.5) * 9;
      values[index + 2] = -Math.random() * 12;
    }
    return values;
  }, []);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.012;
    ref.current.position.y = Math.sin(performance.now() * 0.00012) * 0.18;
  });
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial color="#c8efff" size={0.025} transparent opacity={0.42} depthWrite={false} sizeAttenuation /></points>;
}

function ShaderFog() {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uTint: { value: new THREE.Color("#6bbde8") } }), []);
  useFrame(({ clock }) => { if (material.current) material.current.uniforms.uTime.value = clock.getElapsedTime(); });
  return <mesh position={[0, 0, -4]} scale={[16, 10, 1]}><planeGeometry args={[1, 1]} /><shaderMaterial ref={material} transparent depthWrite={false} uniforms={uniforms} vertexShader={`varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`} fragmentShader={`uniform float uTime; uniform vec3 uTint; varying vec2 vUv; float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);} float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);} void main(){vec2 uv=vUv; float n=noise(uv*4.0+vec2(uTime*.025,-uTime*.012)); n+=.5*noise(uv*8.0-vec2(uTime*.04,uTime*.018)); float band=smoothstep(.82,.15,abs(uv.y-.48+sin(uv.x*4.0+uTime*.12)*.11)); float a=smoothstep(.38,1.05,n)*band*.25; gl_FragColor=vec4(uTint,a);}`} /> </mesh>;
}

function Moonlight() {
  const light = useRef<THREE.PointLight>(null);
  useEffect(() => {
    if (!light.current) return;
    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 3.5 });
    timeline.to(light.current, { intensity: 3.2, duration: 0.09 }).to(light.current, { intensity: 1.15, duration: 0.5 }).to(light.current, { intensity: 2.25, duration: 0.1 }).to(light.current, { intensity: 1.15, duration: 1.5 });
    return () => timeline.kill();
  }, []);
  return <><pointLight ref={light} position={[1, 2.5, 2]} color="#9de3ff" intensity={1.15} distance={12} /><mesh position={[2.8, 2.2, -5]}><circleGeometry args={[0.9, 48]} /><meshBasicMaterial color="#dff7ff" transparent opacity={0.3} /></mesh></>;
}

function Scene() { return <><color attach="background" args={["#020406"]} /><fog attach="fog" args={["#020406", 2, 12]} /><ambientLight color="#33506b" intensity={0.45} /><Moonlight /><Dust /><ShaderFog /><CameraBreath /></>; }

export function HauntedWorld() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;
  return <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"><Canvas dpr={[1, 1.35]} camera={{ position: [0, 0, 6], fov: 58 }} gl={{ alpha: false, antialias: false, powerPreference: "low-power" }}><Scene /></Canvas></div>;
}
