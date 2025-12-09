import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { audioManager } from '../utils/audio';

interface SantaAirdropProps {
  isActive: boolean;
  onComplete: () => void;
  onExplode: () => void; // Trigger to spawn items
}

export const SantaAirdrop: React.FC<SantaAirdropProps> = ({ isActive, onComplete, onExplode }) => {
  const boxRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const [phase, setPhase] = useState<'IDLE' | 'APPROACH' | 'DROP' | 'IMPACT'>('IDLE');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (isActive && phase === 'IDLE') {
        setPhase('APPROACH');
        audioManager.playSleighBells();
        setTimer(0);
    }
  }, [isActive, phase]);

  useFrame((state, delta) => {
    if (phase === 'IDLE') return;

    setTimer(prev => prev + delta);

    if (phase === 'APPROACH') {
        // Shadow moves across ground
        if (shadowRef.current) {
            shadowRef.current.position.x = THREE.MathUtils.lerp(-10, 0, timer / 3);
            const material = shadowRef.current.material as THREE.MeshBasicMaterial;
            if (material) {
                material.opacity = Math.min(0.5, timer * 0.2);
            }
        }
        if (timer > 3) {
            setPhase('DROP');
            setTimer(0);
        }
    } else if (phase === 'DROP') {
        // Box falls from sky
        if (boxRef.current) {
            // Start at Y=20, land at Y=0.5
            const progress = Math.min(1, timer * 1.5); // Fall speed
            const eased = progress * progress; // Quadratic ease in
            boxRef.current.position.y = 20 - eased * 19.5;
            
            // Spin while falling
            boxRef.current.rotation.x += delta * 5;
            boxRef.current.rotation.z += delta * 3;

            if (boxRef.current.position.y <= 0.5) {
                audioManager.playThud();
                setPhase('IMPACT');
                setTimer(0);
                // Reset rotation to flat
                boxRef.current.rotation.set(0, 0, 0);
                boxRef.current.position.y = 0.5;
            }
        }
    } else if (phase === 'IMPACT') {
        // Wobble after impact
        if (boxRef.current) {
            boxRef.current.scale.setScalar(1 + Math.sin(timer * 20) * 0.1 * (1 - timer));
        }
        
        // Explode after 1 second
        if (timer > 1.0) {
            onExplode(); // Spawn items
            onComplete(); // Reset parent state
            setPhase('IDLE');
        }
    }
  });

  if (phase === 'IDLE') return null;

  return (
    <group>
        {/* Giant Gift Box */}
        {phase !== 'APPROACH' && (
            <group ref={boxRef} position={[0, 20, 0]}>
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshStandardMaterial color="#d32f2f" roughness={0.2} />
                </mesh>
                <mesh position={[0, 0, 0]}>
                     <boxGeometry args={[2.05, 2.05, 0.3]} />
                     <meshStandardMaterial color="#ffd700" metalness={0.8} />
                </mesh>
                <mesh position={[0, 0, 0]}>
                     <boxGeometry args={[0.3, 2.05, 2.05]} />
                     <meshStandardMaterial color="#ffd700" metalness={0.8} />
                </mesh>
            </group>
        )}

        {/* Approaching Shadow Plane */}
        <mesh 
            ref={shadowRef} 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[-10, 0.1, 0]}
        >
            <planeGeometry args={[4, 4]} />
            <meshBasicMaterial color="black" transparent opacity={0} />
        </mesh>
    </group>
  );
};