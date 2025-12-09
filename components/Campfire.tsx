import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { audioManager } from '../utils/audio';

export const Campfire: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const fireGroupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  const [flaring, setFlaring] = useState(false);
  const [flareTime, setFlareTime] = useState(0);

  // Enhanced Particle System Data
  const particleCount = 100; // Increased count
  const [initialData] = useState(() => {
      const pos = new Float32Array(particleCount * 3);
      const vel = new Float32Array(particleCount * 3); // Velocity Store
      const colors = new Float32Array(particleCount * 3);
      
      return { pos, vel, colors };
  });

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Base Fire Animation (Logs/Cones)
    if (fireGroupRef.current) {
      fireGroupRef.current.children.forEach((child, i) => {
         child.scale.y = 1 + Math.sin(time * 6 + i * 2) * 0.3;
         child.rotation.z = Math.sin(time * 3 + i) * 0.1;
      });
    }

    // Flare Logic
    if (flaring) {
        setFlareTime(prev => prev + delta);
        
        // Dynamic Light Pulse
        if (lightRef.current) {
            const flashIntensity = 8 * Math.max(0, 1 - flareTime * 1.5); 
            lightRef.current.intensity = 1.5 + flashIntensity + Math.sin(time * 20) * 0.5;
        }

        // Particle Physics
        if (particlesRef.current) {
            const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
            const currentColors = particlesRef.current.geometry.attributes.color.array as Float32Array;
            
            // Gravity and Drag
            const gravity = 0.008; 
            const drag = 0.98;

            for (let i = 0; i < particleCount; i++) {
                // Apply Velocity
                positions[i * 3] += initialData.vel[i * 3];     // X
                positions[i * 3 + 1] += initialData.vel[i * 3 + 1]; // Y
                positions[i * 3 + 2] += initialData.vel[i * 3 + 2]; // Z

                // Apply Gravity to Velocity
                initialData.vel[i * 3 + 1] -= gravity;
                
                // Apply Drag
                initialData.vel[i * 3] *= drag;
                initialData.vel[i * 3 + 2] *= drag;

                // Color Gradient (White -> Orange -> Fade) based on height/time
                const lifeRatio = Math.max(0, 1 - (flareTime / 2.0));
                
                // Mix White (1,1,1) to Orange (1, 0.5, 0)
                if (lifeRatio > 0.8) {
                    currentColors[i * 3] = 1;
                    currentColors[i * 3 + 1] = 1;
                    currentColors[i * 3 + 2] = 0.8;
                } else {
                    currentColors[i * 3] = 1;
                    currentColors[i * 3 + 1] = 0.3 + (lifeRatio * 0.4);
                    currentColors[i * 3 + 2] = 0;
                }
                
                // Hide if below ground
                if (positions[i * 3 + 1] < 0) {
                     positions[i * 3 + 1] = 0;
                     initialData.vel[i * 3 + 1] = 0;
                     // Hide via color
                     currentColors[i * 3] = 0;
                     currentColors[i * 3 + 1] = 0;
                     currentColors[i * 3 + 2] = 0;
                }
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
            particlesRef.current.geometry.attributes.color.needsUpdate = true;
        }

        if (flareTime > 2.0) {
            setFlaring(false);
            setFlareTime(0);
        }
    } else {
        // Reset Particles when not flaring (Hide them)
        if (lightRef.current) {
          lightRef.current.intensity = 1.5 + Math.sin(time * 10) * 0.5 + Math.cos(time * 23) * 0.5;
        }
        if (particlesRef.current) {
            const currentColors = particlesRef.current.geometry.attributes.color.array as Float32Array;
            for(let i=0; i<particleCount; i++) {
                currentColors[i*3] = 0;
                currentColors[i*3+1] = 0;
                currentColors[i*3+2] = 0;
            }
            particlesRef.current.geometry.attributes.color.needsUpdate = true;
        }
    }
  });

  const handleClick = (e: any) => {
      e.stopPropagation();
      setFlaring(true);
      setFlareTime(0);
      audioManager.playFireWhoosh();

      // Reset and Burst Particles
      if (particlesRef.current) {
          const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
              // Start at base
              positions[i * 3] = (Math.random() - 0.5) * 0.3;
              positions[i * 3 + 1] = 0.2 + Math.random() * 0.2;
              positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
              
              // Explosion Velocity
              // High Y for height (2-3 units up)
              initialData.vel[i * 3] = (Math.random() - 0.5) * 0.15; // Spread X
              initialData.vel[i * 3 + 1] = 0.15 + Math.random() * 0.25; // High Upward Burst
              initialData.vel[i * 3 + 2] = (Math.random() - 0.5) * 0.15; // Spread Z
          }
      }
  };

  return (
    <group position={position} onClick={handleClick} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>
      {/* Wood Logs */}
      <group>
         <mesh position={[0, 0.05, 0.2]} rotation={[0.2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.6]} />
            <meshStandardMaterial color="#3e2723" />
         </mesh>
         <mesh position={[0.2, 0.05, -0.1]} rotation={[0.2, 2.1, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.6]} />
            <meshStandardMaterial color="#3e2723" />
         </mesh>
         <mesh position={[-0.2, 0.05, -0.1]} rotation={[0.2, -2.1, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.6]} />
            <meshStandardMaterial color="#3e2723" />
         </mesh>
      </group>

      {/* Small Rocks details */}
      <group>
          {[0, 1, 2, 3, 4].map(i => {
              const angle = (i / 5) * Math.PI * 2;
              return (
                <mesh key={i} position={[Math.cos(angle) * 0.6, 0.05, Math.sin(angle) * 0.6]} rotation={[Math.random(), Math.random(), 0]}>
                    <dodecahedronGeometry args={[0.1, 0]} />
                    <meshStandardMaterial color="#5d4037" />
                </mesh>
              )
          })}
      </group>

      {/* Fire Geometry */}
      <group ref={fireGroupRef} position={[0, 0.1, 0]}>
         <mesh position={[0, 0.2, 0]}>
            <coneGeometry args={[0.2, 0.5, 5]} />
            <meshBasicMaterial color="#ff5722" />
         </mesh>
         <mesh position={[0.1, 0.15, 0.05]} rotation={[0, 1, -0.1]}>
             <coneGeometry args={[0.12, 0.4, 5]} />
            <meshBasicMaterial color="#ff9800" />
         </mesh>
          <mesh position={[-0.1, 0.15, -0.05]} rotation={[0, 2, 0.1]}>
             <coneGeometry args={[0.12, 0.4, 5]} />
            <meshBasicMaterial color="#ffeb3b" />
         </mesh>
      </group>

      {/* Flare Particles */}
      <points ref={particlesRef}>
         <bufferGeometry>
            <bufferAttribute 
                attach="attributes-position"
                count={particleCount}
                array={initialData.pos}
                itemSize={3}
            />
            <bufferAttribute 
                attach="attributes-color"
                count={particleCount}
                array={initialData.colors}
                itemSize={3}
            />
         </bufferGeometry>
         <pointsMaterial 
            size={0.25}
            vertexColors
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
         />
      </points>

      {/* Warm Light */}
      <pointLight ref={lightRef} color="#ff6f00" distance={6} decay={2} castShadow />
    </group>
  );
};