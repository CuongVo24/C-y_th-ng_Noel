import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/three';
import { Gift } from '../types';

interface GiftBoxProps {
  gift: Gift;
  onOpen: (msg: string) => void;
}

const GiftBox: React.FC<GiftBoxProps> = ({ gift, onOpen }) => {
  const [active, setActive] = useState(false);
  
  const { scale, lidRotation } = useSpring({
    scale: active ? 1.1 : 1,
    lidRotation: active ? -Math.PI / 1.5 : 0,
    config: { tension: 200, friction: 10 }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    setActive(!active);
    if (!active) {
        onOpen(gift.message);
    }
  };

  return (
    // @ts-ignore
    <animated.group position={gift.position} scale={scale} onClick={handleClick} rotation={[0, Math.random() * Math.PI, 0]}>
      {/* Box Body */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={gift.color} roughness={0.5} />
      </mesh>
      
      {/* Ribbon Vertical */}
      <mesh position={[0, 0.25, 0]}>
         <boxGeometry args={[0.51, 0.51, 0.1]} />
         <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Ribbon Horizontal */}
      <mesh position={[0, 0.25, 0]}>
         <boxGeometry args={[0.1, 0.51, 0.51]} />
         <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Lid Group */}
      {/* @ts-ignore */}
      <animated.group position={[0, 0.5, -0.25]} rotation-x={lidRotation} rotation-y={0} rotation-z={0}>
         {/* Lid Pivot offset logic: pivot is at back edge */}
         <group position={[0, 0, 0.25]}> 
            <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[0.55, 0.1, 0.55]} />
                <meshStandardMaterial color={gift.color} roughness={0.5} />
            </mesh>
            {/* Bow */}
            <mesh position={[0, 0.15, 0]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
         </group>
      </animated.group>
    </animated.group>
  );
};

export const Gifts: React.FC<{ onOpen: (msg: string) => void }> = ({ onOpen }) => {
    // Static mock gifts for demo with Vietnamese wishes
    const gifts: Gift[] = [
        { id: 'g1', position: [1.5, 0, 1.5], color: '#d32f2f', message: 'Giáng sinh an lành! Merry Christmas!', sender: 'Mom', opened: false },
        { id: 'g2', position: [-1.2, 0, 1], color: '#1976d2', message: 'Chúc bạn một mùa đông ấm áp bên gia đình.', sender: 'Dev', opened: false },
        { id: 'g3', position: [0.5, 0, -1.5], color: '#388e3c', message: 'Peace and Joy to the world.', sender: 'Santa', opened: false },
        { id: 'g4', position: [2.5, 0, 0.5], color: '#ffeb3b', message: 'Năm mới phát tài phát lộc!', sender: 'Friend', opened: false },
        { id: 'g5', position: [-2, 0, -2], color: '#9c27b0', message: 'Happy Holidays!', sender: 'Secret Santa', opened: false },
        { id: 'g6', position: [3, 0, -1], color: '#00bcd4', message: 'Chúc mừng giáng sinh!', sender: 'Bro', opened: false },
        { id: 'g7', position: [-3.5, 0, 1.5], color: '#ff5722', message: 'Mong mọi điều ước của bạn thành hiện thực.', sender: 'Sis', opened: false },
        { id: 'g8', position: [0, 0, 3], color: '#e91e63', message: 'Love and Happiness.', sender: 'Dad', opened: false },
        { id: 'g9', position: [-1.5, 0, 2.5], color: '#795548', message: 'Giáng sinh vui vẻ nhé!', sender: 'Neighbor', opened: false },
        { id: 'g10', position: [2, 0, 2.5], color: '#607d8b', message: 'Merry Xmas!', sender: 'Colleague', opened: false },
    ];

    return (
        <group>
            {gifts.map(g => <GiftBox key={g.id} gift={g} onOpen={onOpen} />)}
        </group>
    );
};
