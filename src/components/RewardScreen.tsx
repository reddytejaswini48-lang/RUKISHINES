import React from 'react';
import { RotateCcw, Home, Sparkles, Star, Award, Heart } from 'lucide-react';
import { sound } from '../utils/audio';

interface RewardScreenProps {
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const RewardScreen: React.FC<RewardScreenProps> = ({
  onPlayAgain,
  onMainMenu,
}) => {
  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-[#2a0505] via-[#450812] to-[#1a0204] text-amber-100 select-none overflow-y-auto">
      
      {/* Top Header */}
      <div className="text-center mt-2 sm:mt-6 z-10">
        <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/50 text-amber-300 px-4 py-1 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase mb-2">
          <Star size={16} className="fill-amber-400 text-amber-400" />
          FESTIVAL ADVENTURE CONQUERED
          <Star size={16} className="fill-amber-400 text-amber-400" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 drop-shadow-lg tracking-wider">
          YOU DID IT!
        </h1>
        <h2 className="text-lg sm:text-2xl font-cinzel font-bold text-amber-300 mt-1">
          YOUR FESTIVAL REWARD
        </h2>
        <p className="text-xs sm:text-sm text-amber-200/80 max-w-md mx-auto mt-1">
          You have successfully sliced the holy modaks, solved the pandal puzzle, and gathered all sacred offerings!
        </p>
      </div>

      {/* Centerpiece: Animated Kaju Katli Sweet */}
      <div className="relative flex flex-col items-center justify-center my-4 sm:my-auto z-10">
        
        {/* Divine Golden Radial Rays behind */}
        <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-r from-yellow-400/30 via-amber-500/20 to-transparent blur-2xl animate-pulse pointer-events-none" />

        {/* Ornate Brass Thali Plate holding the Kaju Katli */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
          
          <svg viewBox="0 0 300 300" className="w-full h-full">
            <defs>
              <radialGradient id="brassThali" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="60%" stopColor="#f59e0b" />
                <stop offset="90%" stopColor="#b45309" />
                <stop offset="100%" stopColor="#78350f" />
              </radialGradient>

              {/* Cashew Paste ivory color */}
              <linearGradient id="cashewBase" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fefce8" />
                <stop offset="40%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#fef9c3" />
              </linearGradient>

              {/* Edible Silver Foil (Vark) Shimmer */}
              <linearGradient id="silverVark" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.4" />
                <stop offset="25%" stopColor="#f8fafc" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="75%" stopColor="#e2e8f0" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Golden Puja Thali Plate */}
            <circle cx="150" cy="150" r="135" fill="url(#brassThali)" stroke="#78350f" strokeWidth="4" />
            <circle cx="150" cy="150" r="120" fill="none" stroke="#fde047" strokeWidth="2" strokeDasharray="6 4" />
            <circle cx="150" cy="150" r="110" fill="#78350f" opacity="0.3" />

            {/* Marigold flower petals scattered on plate */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const px = 150 + Math.cos(rad) * 105;
              const py = 150 + Math.sin(rad) * 105;
              return (
                <ellipse
                  key={i}
                  cx={px}
                  cy={py}
                  rx="9"
                  ry="5"
                  fill={i % 2 === 0 ? '#ea580c' : '#fbbf24'}
                  transform={`rotate(${angle} ${px} ${py})`}
                />
              );
            })}

            {/* 3D-styled Diamond Kaju Katli Sweet */}
            <g id="kaju-katli" transform="translate(150, 150) rotate(20)">
              {/* Drop Shadow */}
              <polygon points="0,-75 90,0 0,75 -90,0" fill="rgba(0,0,0,0.5)" transform="translate(8, 12)" />

              {/* Sweet Side Thickness (3D Edge) */}
              <polygon points="0,75 90,0 90,14 0,89" fill="#ca8a04" stroke="#78350f" strokeWidth="1" />
              <polygon points="-90,0 0,75 0,89 -90,14" fill="#a16207" stroke="#78350f" strokeWidth="1" />

              {/* Main Diamond Top Surface */}
              <polygon
                points="0,-75 90,0 0,75 -90,0"
                fill="url(#cashewBase)"
                stroke="#d97706"
                strokeWidth="1.5"
              />

              {/* Silver Foil (Vark) Pattern on Top */}
              <polygon
                points="-15,-50 75,-5 25,55 -65,10"
                fill="url(#silverVark)"
                opacity="0.85"
              />

              {/* Garnishing: Pistachio & Kesar (Saffron) slivers */}
              {/* Pistachio pieces */}
              <ellipse cx="10" cy="-15" rx="5" ry="2.5" fill="#65a30d" transform="rotate(35 10 -15)" />
              <ellipse cx="-20" cy="18" rx="4" ry="2" fill="#4d7c0f" transform="rotate(-20 -20 18)" />
              <ellipse cx="25" cy="20" rx="4" ry="2" fill="#65a30d" transform="rotate(50 25 20)" />

              {/* Saffron Strands */}
              <path d="M -5 -25 Q 5 -30 2 -18" stroke="#dc2626" strokeWidth="1.5" fill="none" />
              <path d="M -15 0 Q -25 5 -18 10" stroke="#dc2626" strokeWidth="1.5" fill="none" />
              <path d="M 12 5 Q 22 2 18 14" stroke="#dc2626" strokeWidth="1.5" fill="none" />

              {/* Animated Light Glint Sparkle */}
              <circle cx="-10" cy="-35" r="3" fill="#ffffff" filter="drop-shadow(0 0 6px #ffffff)" />
            </g>
          </svg>
        </div>

        {/* Blessed Prasad Title Tag */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-maroon-950 px-6 py-1.5 rounded-full shadow-xl font-cinzel font-black text-sm sm:text-base tracking-wider mt-2 border border-yellow-200 animate-bounce">
          ✦ ROYAL KAJU KATLI PRASAD ✦
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-4 z-10">
        <button
          id="reward-play-again-btn"
          onClick={() => {
            sound.playClick();
            onPlayAgain();
          }}
          className="w-full sm:flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-maroon-950 font-cinzel font-black text-base sm:text-lg rounded-2xl shadow-xl border border-amber-300 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
        >
          <RotateCcw size={20} />
          PLAY AGAIN
        </button>

        <button
          id="reward-main-menu-btn"
          onClick={() => {
            sound.playClick();
            onMainMenu();
          }}
          className="w-full sm:flex-1 py-3 px-6 bg-amber-950/80 hover:bg-amber-900 border-2 border-amber-500/60 text-amber-200 font-cinzel font-bold text-base sm:text-lg rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
        >
          <Home size={20} />
          MAIN MENU
        </button>
      </div>
    </div>
  );
};
