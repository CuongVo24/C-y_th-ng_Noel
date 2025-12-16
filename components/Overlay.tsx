import React, { useState, useEffect, useCallback } from 'react';
import { GameState, CeremonyState } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../utils/audio';

interface OverlayProps {
  gameState: GameState;
  onStart: (name: string, color: string) => void;
  ceremony: CeremonyState; 
  onPowerClick: () => void; 
  activeGiftMessage: string | null;
  onCloseGift: () => void;
  isLightsOn: boolean;
}

// Internal Floating Text Component
interface FloatingText {
    id: number;
    text: string;
    timestamp: number;
}

const FloatingTextManager = ({ activeMessage }: { activeMessage: string | null }) => {
    const [messages, setMessages] = useState<FloatingText[]>([]);

    useEffect(() => {
        if (activeMessage) {
            const newItem = {
                id: Date.now(),
                text: activeMessage,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, newItem]);
        }
    }, [activeMessage]);

    // Cleanup old messages
    const removeMessage = (id: number) => {
        setMessages(prev => prev.filter(m => m.id !== id));
    };

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-[60]">
            <AnimatePresence>
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1.1 }}
                        exit={{ opacity: 0, y: -80, scale: 0.9, transition: { duration: 0.5 } }}
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                        onAnimationComplete={() => {
                            // Auto remove after animation holds for a bit
                            setTimeout(() => removeMessage(msg.id), 4000);
                        }}
                        className="mb-4 w-full flex justify-center"
                    >
                        <div className="text-center max-w-[85vw] md:max-w-[60vw]">
                            <h3 
                                // CHANGED: Used 'Playfair Display' for Vietnamese support
                                // CHANGED: Added break-words, leading-relaxed for wrapping
                                className="font-['Playfair_Display'] text-3xl md:text-5xl text-[#ffd700] font-bold tracking-wider px-6 py-4 break-words leading-relaxed"
                                style={{ 
                                    textShadow: '0px 0px 10px rgba(255, 215, 0, 0.8), 0px 2px 4px rgba(0,0,0,0.8)'
                                }}
                            >
                                {msg.text}
                            </h3>
                            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#ffd700] to-transparent opacity-80 mt-1" />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

export const Overlay: React.FC<OverlayProps> = ({ 
  gameState, 
  onStart, 
  activeGiftMessage,
  onCloseGift,
  isLightsOn,
  onPowerClick
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCharging, setIsCharging] = useState(false);

  // Clear the active gift message in parent after a short delay so it can be re-triggered
  useEffect(() => {
      if (activeGiftMessage) {
          const t = setTimeout(onCloseGift, 100); // Hand off to local manager immediately
          return () => clearTimeout(t);
      }
  }, [activeGiftMessage, onCloseGift]);

  const toggleMute = () => {
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  const handleStart = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const generatedName = `Guest ${randomId}`;
    const festiveColors = ['#ff0000', '#00ff00', '#ffff00', '#00ffff', '#ff00ff', '#ffaa00'];
    const randomColor = festiveColors[Math.floor(Math.random() * festiveColors.length)];
    onStart(generatedName, randomColor);
    audioManager.startAmbience();
  };

  const handlePowerInteraction = () => {
      if (isCharging) return;
      if (isLightsOn) {
          audioManager.playPowerDown();
          onPowerClick();
      } else {
          setIsCharging(true);
          audioManager.playPowerUp();
          setTimeout(() => {
              onPowerClick();
              setIsCharging(false);
          }, 1500);
      }
  };

  // LOBBY SCREEN
  if (gameState === 'LOBBY') {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 text-white font-['Playfair_Display']">
        <div className="absolute top-8 right-8 group flex flex-col items-center gap-1 cursor-help">
             <div className="w-16 h-10 bg-red-600 relative rounded-sm shadow-lg overflow-hidden border border-yellow-500/30">
                <div className="absolute inset-0 flex items-center justify-center text-yellow-400 text-3xl" style={{ transform: 'translateY(-2px)' }}>★</div>
             </div>
             <span className="text-xs text-yellow-500/80 font-sans tracking-widest">VIETNAM</span>
        </div>
        <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in-up px-4">
            <div className="text-center space-y-4">
                <h1 className="text-5xl md:text-7xl text-yellow-400 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] tracking-wider font-bold">SNOW GLOBE LIVE</h1>
                <p className="text-gray-400 text-lg font-[Lato] tracking-widest uppercase">A Cinematic Holiday Experience</p>
            </div>
            <button 
              onClick={handleStart}
              className="group relative px-12 py-4 bg-transparent border border-yellow-500/50 text-yellow-400 font-bold text-xl tracking-[0.2em] transition-all duration-500 hover:bg-yellow-500/10 hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(255,215,0,0.3)]"
            >
              <span className="relative z-10">ENTER SNOW GLOBE</span>
              <div className="absolute inset-0 bg-yellow-400/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </button>
        </div>
      </div>
    );
  }

  const buttonBorder = isCharging ? 'border-yellow-300' : isLightsOn ? 'border-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.6)]' : 'border-gray-500 hover:border-yellow-200';
  const buttonBg = isCharging ? 'bg-yellow-900' : isLightsOn ? 'bg-yellow-900/80' : 'bg-gray-900';

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-auto">
         <div className="text-white">
           <h2 className="text-xl font-['Playfair_Display'] font-bold text-yellow-100 shadow-black drop-shadow-md">Snow Globe Live</h2>
           <p className="text-xs font-[Lato] opacity-70">Drag items to decorate • Click stars</p>
         </div>
         <div className="flex gap-4">
             <button onClick={toggleMute} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 flex items-center justify-center text-white transition-colors">
                 {isMuted ? '🔇' : '🔊'}
             </button>
         </div>
      </div>

      <div className="absolute bottom-8 left-8 pointer-events-auto">
          <motion.button
            onClick={handlePowerInteraction}
            disabled={isCharging}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all relative overflow-hidden ${buttonBorder} ${buttonBg}`}
          >
              {isCharging && <motion.div initial={{ height: '0%' }} animate={{ height: '100%' }} transition={{ duration: 1.5, ease: "linear" }} className="absolute bottom-0 left-0 w-full bg-yellow-500 z-0" />}
              <span className={`relative z-10 text-3xl filter drop-shadow-lg ${isLightsOn ? 'text-yellow-100' : 'text-gray-400'}`}>
                  {isCharging ? '⚡' : isLightsOn ? '💡' : '🔌'}
              </span>
          </motion.button>
          <div className="text-center mt-2 text-yellow-500/80 font-['Playfair_Display'] text-sm uppercase tracking-wider font-bold">
              {isCharging ? 'Charging...' : isLightsOn ? 'Power Off' : 'Power Up'}
          </div>
      </div>

      {/* Floating Cinematic Text for Gifts */}
      <FloatingTextManager activeMessage={activeGiftMessage} />
    </div>
  );
};