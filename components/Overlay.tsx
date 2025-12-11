import React, { useState, useEffect } from 'react';
import { GameState, CeremonyState } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../utils/audio';

interface OverlayProps {
  gameState: GameState;
  onStart: (name: string, color: string) => void;
  ceremony: CeremonyState; // Kept for type compatibility but replaced with new logic
  onPowerClick: () => void; // Used for new logic now
  activeGiftMessage: string | null;
  onCloseGift: () => void;
  isLightsOn: boolean;
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
  
  // Power Button State
  const [isCharging, setIsCharging] = useState(false);

  const toggleMute = () => {
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  const handleStart = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const generatedName = `Guest ${randomId}`;
    
    // Auto-assign festive color
    const festiveColors = ['#ff0000', '#00ff00', '#ffff00', '#00ffff', '#ff00ff', '#ffaa00'];
    const randomColor = festiveColors[Math.floor(Math.random() * festiveColors.length)];

    onStart(generatedName, randomColor);
    audioManager.startAmbience();
  };

  const handlePowerInteraction = () => {
      if (isCharging) return;
      
      if (isLightsOn) {
          // If lights are ON, turn them OFF immediately
          audioManager.playPowerDown();
          onPowerClick(); // Toggles state in App
      } else {
          // If lights are OFF, play the Power Up sequence
          setIsCharging(true);
          audioManager.playPowerUp();

          // Trigger Lights On after 1.5s
          setTimeout(() => {
              onPowerClick(); // Toggles state in App
              setIsCharging(false);
          }, 1500);
      }
  };

  // LOBBY SCREEN
  if (gameState === 'LOBBY') {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 text-white font-[Cinzel]">
        {/* Vietnamese Flag Badge */}
        <div className="absolute top-8 right-8 group flex flex-col items-center gap-1 cursor-help">
             <div className="w-16 h-10 bg-red-600 relative rounded-sm shadow-lg overflow-hidden border border-yellow-500/30">
                <div className="absolute inset-0 flex items-center justify-center text-yellow-400 text-3xl" style={{ transform: 'translateY(-2px)' }}>
                   ★
                </div>
             </div>
             <span className="text-xs text-yellow-500/80 font-sans tracking-widest">VIETNAM</span>
        </div>

        <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in-up">
            <div className="text-center space-y-4">
                <h1 className="text-6xl text-yellow-400 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] tracking-wider">
                    SNOW GLOBE LIVE
                </h1>
                <p className="text-gray-400 text-lg font-[Lato] tracking-widest uppercase">
                    A Cinematic Holiday Experience
                </p>
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

  // Determine button styles based on state
  const buttonBorder = isCharging 
     ? 'border-yellow-300' 
     : isLightsOn 
        ? 'border-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.6)]' 
        : 'border-gray-500 hover:border-yellow-200';

  const buttonBg = isCharging 
     ? 'bg-yellow-900' 
     : isLightsOn 
        ? 'bg-yellow-900/80' 
        : 'bg-gray-900';

  // MAIN HUD
  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-auto">
         <div className="text-white">
           <h2 className="text-xl font-[Cinzel] text-yellow-100 shadow-black drop-shadow-md">Snow Globe Live</h2>
           <p className="text-xs font-[Lato] opacity-70">Click on the tree to decorate</p>
         </div>
         
         <div className="flex gap-4">
             <button 
                onClick={toggleMute}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 flex items-center justify-center text-white transition-colors"
             >
                 {isMuted ? '🔇' : '🔊'}
             </button>
         </div>
      </div>

      {/* Power / Light Switch Button (Bottom Left) - ALWAYS VISIBLE */}
      <div className="absolute bottom-8 left-8 pointer-events-auto">
          <motion.button
            onClick={handlePowerInteraction}
            disabled={isCharging}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all relative overflow-hidden ${buttonBorder} ${buttonBg}`}
          >
              {/* Charging Fill Animation */}
              {isCharging && (
                  <motion.div 
                    initial={{ height: '0%' }}
                    animate={{ height: '100%' }}
                    transition={{ duration: 1.5, ease: "linear" }}
                    className="absolute bottom-0 left-0 w-full bg-yellow-500 z-0"
                  />
              )}
              
              {/* Icon */}
              <span className={`relative z-10 text-3xl filter drop-shadow-lg ${isLightsOn ? 'text-yellow-100' : 'text-gray-400'}`}>
                  {isCharging ? '⚡' : isLightsOn ? '💡' : '🔌'}
              </span>
          </motion.button>
          <div className="text-center mt-2 text-yellow-500/80 font-[Cinzel] text-sm uppercase tracking-wider">
              {isCharging ? 'Charging...' : isLightsOn ? 'Power Off' : 'Power Up'}
          </div>
      </div>

      {/* Gift Reading Overlay */}
      <AnimatePresence>
        {activeGiftMessage && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/40 backdrop-blur-sm"
                onClick={onCloseGift}
            >
                <div className="bg-[#fff1e6] text-black p-8 max-w-sm w-full shadow-2xl rounded-sm transform rotate-1 border-4 border-double border-red-800">
                    <h3 className="font-[Cinzel] text-red-800 text-xl mb-4 border-b border-red-200 pb-2">A Holiday Greeting</h3>
                    <p className="font-[Lato] text-lg leading-relaxed italic">"{activeGiftMessage}"</p>
                    <div className="mt-6 text-center text-xs text-gray-500 uppercase tracking-widest">Click anywhere to close</div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};