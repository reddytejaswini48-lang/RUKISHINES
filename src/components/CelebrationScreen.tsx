import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { GaneshaArtwork } from './GaneshaArtwork';
import { sound } from '../utils/audio';
import { Sparkles, Award, ArrowRight, Crown, Check } from 'lucide-react';
import { PlayerAttireState } from '../types';
import { COSTUME_CATALOG, HEADWEAR_CATALOG, NECKLACE_CATALOG } from './FestivalDressUpGame';

interface CelebrationScreenProps {
  onContinueToReward: () => void;
  playerAttire?: PlayerAttireState;
}

export const CelebrationScreen: React.FC<CelebrationScreenProps> = ({
  onContinueToReward,
  playerAttire,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25);

  const equippedCostume = playerAttire
    ? COSTUME_CATALOG.find((c) => c.id === playerAttire.costumeId)
    : undefined;
  const equippedHeadwear = playerAttire
    ? HEADWEAR_CATALOG.find((h) => h.id === playerAttire.headwearId)
    : undefined;
  const equippedNecklace = playerAttire
    ? NECKLACE_CATALOG.find((n) => n.id === playerAttire.necklaceId)
    : undefined;

  useEffect(() => {
    // Play celebratory bells & music
    sound.playCelebrate();
    sound.startFestiveMusic();

    // Launch celebratory confetti bursts
    const end = Date.now() + 18 * 1000;
    const colors = ['#f59e0b', '#fbbf24', '#f43f5e', '#10b981', '#ffffff', '#fb923c'];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Auto-advance countdown
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onContinueToReward();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onContinueToReward]);

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-[#3b0712] via-[#500818] to-[#1e0404] text-amber-100 overflow-y-auto select-none">
      
      {/* Decorative Traditional Toran Overhead */}
      <div className="w-full max-w-4xl flex items-center justify-between px-4 py-2 border-b border-amber-500/40 text-xs sm:text-sm font-cinzel text-amber-300 font-bold tracking-widest z-10">
        <span>ॐ श्री गणेशाय नमः</span>
        <span>✦ GRAND FESTIVAL AARTI CELEBRATION ✦</span>
        <span>गणपति बाप्पा मोरया!</span>
      </div>

      {/* Main Celebration Banner */}
      <div className="text-center my-2 sm:my-4 z-10">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-maroon-950 font-cinzel font-black px-6 py-2 rounded-full shadow-2xl text-base sm:text-xl tracking-wider mb-2 animate-pulse">
          <Sparkles size={20} className="fill-maroon-950" />
          🎉 FESTIVAL UNLOCKED! 🎉
          <Sparkles size={20} className="fill-maroon-950" />
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 drop-shadow-[0_4px_12px_rgba(245,158,11,0.6)]">
          GANESHOTSAV CELEBRATION
        </h1>
        <p className="text-xs sm:text-base text-amber-200/90 font-medium max-w-lg mx-auto mt-1">
          With all 5 sacred offerings gathered and the pandal blessed, the grand festival Aarti commences with joy and devotion!
        </p>
      </div>

      {/* Center Stage: Lord Ganesha in Majestic Pandal with Devotees */}
      <div className="relative w-full max-w-2xl flex flex-col items-center justify-center my-auto z-10">
        
        {/* Glow Halo behind */}
        <div className="absolute inset-0 bg-radial from-amber-500/30 via-amber-900/10 to-transparent blur-3xl -z-10" />

        {/* Lord Ganesha Divine Murti */}
        <div className="w-full max-w-[340px] sm:max-w-[420px] filter drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]">
          <GaneshaArtwork size="lg" showDiyas={true} />
        </div>

        {/* Respectful Family / Devotees celebrating on either side */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-10 -mt-6 sm:-mt-10 text-center">
          <div className="bg-black/60 border border-amber-500/50 p-2.5 sm:p-3 rounded-2xl backdrop-blur-md max-w-[280px] shadow-lg">
            <div className="text-2xl">🙏 🪔 ✨</div>
            <p className="text-xs text-amber-300 font-cinzel font-bold mt-1">
              Your Adorned Devotee
            </p>
            {equippedCostume && (
              <p className="text-[11px] text-amber-200/90 font-medium truncate mt-0.5">
                {equippedCostume.name}
              </p>
            )}
            {equippedHeadwear && (
              <p className="text-[10px] text-amber-300/75 truncate">
                {equippedHeadwear.name}
              </p>
            )}
          </div>

          <div className="bg-black/60 border border-amber-500/50 p-2.5 sm:p-3 rounded-2xl backdrop-blur-md max-w-[280px] shadow-lg">
            <div className="text-2xl">🥁 🔔 💐</div>
            <p className="text-xs text-amber-300 font-cinzel font-bold mt-1">
              Temple Drums & Joy
            </p>
            <p className="text-[11px] text-amber-200/90 font-medium mt-0.5">
              Ganpati Bappa Morya!
            </p>
            <p className="text-[10px] text-amber-300/75">
              Auspicious Maha Aarti
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer with Skip/Continue Option */}
      <div className="w-full max-w-md flex flex-col items-center gap-2 mt-4 z-10">
        <button
          id="celebration-reward-btn"
          onClick={() => {
            sound.playClick();
            onContinueToReward();
          }}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-maroon-950 font-cinzel font-black text-lg sm:text-xl rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.6)] border-2 border-yellow-200 flex items-center justify-center gap-3 transition-transform active:scale-95 cursor-pointer"
        >
          <span>CLAIM FESTIVAL REWARD</span>
          <ArrowRight size={22} className="stroke-[3]" />
        </button>

        <p className="text-xs text-amber-300/70 font-mono">
          Auto-advancing in {secondsRemaining}s...
        </p>
      </div>
    </div>
  );
};
