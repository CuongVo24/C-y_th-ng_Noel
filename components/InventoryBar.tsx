import React from 'react';
import { DecorationType } from '../types';

interface InventoryBarProps {
  selectedType: DecorationType;
  onSelect: (type: DecorationType) => void;
}

export const InventoryBar: React.FC<InventoryBarProps> = ({ selectedType, onSelect }) => {
  const items: { type: DecorationType; label: string; icon: string }[] = [
    { type: 'orb', label: 'Magic Orb', icon: '🔮' },
    { type: 'star', label: 'Bright Star', icon: '⭐' },
    { type: 'candy', label: 'Candy Cane', icon: '🍬' },
    { type: 'stocking', label: 'Stocking', icon: '🧦' },
  ];

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 flex gap-4 pointer-events-auto z-50">
      {items.map((item) => (
        <button
          key={item.type}
          onClick={() => onSelect(item.type)}
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            selectedType === item.type 
              ? 'scale-110 text-yellow-400' 
              : 'text-white/70 hover:text-white hover:scale-105'
          }`}
        >
          <div className={`w-10 h-10 flex items-center justify-center text-2xl bg-white/10 rounded-full border ${selectedType === item.type ? 'border-yellow-400 bg-yellow-400/20' : 'border-transparent'}`}>
            {item.icon}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider">{item.label}</span>
        </button>
      ))}
    </div>
  );
};
