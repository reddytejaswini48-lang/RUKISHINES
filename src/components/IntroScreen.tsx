import React, { useEffect, useState } from 'react';
import { Play, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface IntroScreenProps {
  onFinishIntro: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onFinishIntro }) => {
  const [countdown, setCountdown] = useState<number>(7);

  useEffect(() => {
    sound.startFestiveMusic();

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onFinishIntro();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onFinishIntro]);

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#2e0505] via-[#480812] to-[#1c0204] text-amber-100 select-none text-center">
      
      {/* Outer Card with festive border */}
      <div className="relative max-w-lg w-full bg-[#3b0712]/90 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.4)] backdrop-blur-md">
        
        <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/50 text-amber-300 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
          <Sparkles size={14} className="text-yellow-400" />
          FESTIVAL COMMENCES
          <Sparkles size={14} className="text-yellow-400" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 mb-3 tracking-wide">
          WELCOME, DEVOTEE!
        </h2>

        <p className="text-sm sm:text-base text-amber-100 leading-relaxed font-medium mb-4">
          The auspicious Ganesh Chaturthi festival has arrived! Lord Ganesha is visiting our grand pandal.
        </p>

        <div className="bg-black/40 border border-amber-600/30 rounded-2xl p-4 text-xs sm:text-sm text-amber-200/90 text-left space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-base">🥟</span>
            <span><strong>Level 1:</strong> Slice fresh modaks for the holy offering!</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">🌸</span>
            <span><strong>Level 2:</strong> Assemble the grand Pandal puzzle!</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">🏃</span>
            <span><strong>Level 3:</strong> Gather the 5 sacred Puja items for the evening Aarti!</span>
          </div>
        </div>

        {/* Skip / Start Button */}
        <button
          id="intro-start-now-btn"
          onClick={() => {
            sound.playClick();
            onFinishIntro();
          }}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-maroon-950 font-cinzel font-black text-base sm:text-lg rounded-2xl shadow-xl border border-amber-200 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
        >
          <span>START LEVEL 1</span>
          <Play size={18} className="fill-maroon-950" />
        </button>

        <p className="text-xs text-amber-300/60 font-mono mt-3">
          Auto-starting in {countdown} seconds...
        </p>
      </div>
    </div>
  );
};
