import React from 'react';
import { Volume2, VolumeX, Pause, HelpCircle, Heart, Flame, Music } from 'lucide-react';
import { sound } from '../utils/audio';

interface NavbarHUDProps {
  levelTitle: string;
  levelNumber: 1 | 2 | 3 | 4 | 5;
  lives: number; // 0..3
  objectiveText: string;
  progressText: string;
  progressPercent?: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPause: () => void;
  onOpenControls: () => void;
  timeLeft?: number; // Optional countdown timer in seconds
  warningFlash?: boolean;
}

export const NavbarHUD: React.FC<NavbarHUDProps> = ({
  levelTitle,
  levelNumber,
  lives,
  objectiveText,
  progressText,
  progressPercent = 0,
  soundEnabled,
  onToggleSound,
  onPause,
  onOpenControls,
  timeLeft,
  warningFlash = false,
}) => {
  return (
    <header className="w-full bg-[#1e0404]/90 backdrop-blur-md border-b-2 border-amber-600/40 px-3 sm:px-6 py-2.5 shadow-xl select-none z-30 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Level Badge & Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-700 text-maroon-950 font-cinzel font-black px-2.5 py-1 rounded-lg shadow-md border border-amber-300 text-sm sm:text-base tracking-wider">
            LVL {levelNumber}
          </div>
          <div>
            <h2 className="text-amber-300 font-cinzel font-bold text-sm sm:text-lg tracking-wide drop-shadow">
              {levelTitle}
            </h2>
            <div className="text-xs text-amber-200/80 font-medium hidden xs:block">
              {objectiveText}
            </div>
          </div>
        </div>

        {/* Center: Lives System (❤️ ❤️ ❤️) with pulse */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-amber-500/30">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-300 mr-1 hidden sm:inline">
            LIVES:
          </span>
          {[1, 2, 3].map((heartIndex) => {
            const hasHeart = heartIndex <= lives;
            return (
              <span
                key={heartIndex}
                className={`transition-transform duration-300 ${
                  hasHeart
                    ? 'text-red-500 scale-105 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                    : 'text-zinc-600 scale-90 opacity-40'
                } ${warningFlash && heartIndex === lives + 1 ? 'animate-ping' : ''}`}
              >
                <Heart
                  size={20}
                  className={hasHeart ? 'fill-red-500' : 'fill-zinc-700'}
                />
              </span>
            );
          })}
        </div>

        {/* Progress & Optional Timer */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-lg flex items-center gap-2">
            <Flame size={16} className="text-amber-400 fill-amber-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-amber-200 font-mono tracking-wider">
              {progressText}
            </span>
          </div>

          {timeLeft !== undefined && (
            <div
              className={`px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold font-mono border ${
                timeLeft <= 10
                  ? 'bg-red-950/80 text-red-300 border-red-500 animate-pulse'
                  : 'bg-amber-950/60 text-amber-300 border-amber-600/30'
              }`}
            >
              ⏱ {timeLeft}s
            </div>
          )}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Controls button */}
          <button
            id="hud-controls-btn"
            onClick={() => {
              sound.playClick();
              onOpenControls();
            }}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-amber-900/60 hover:bg-amber-800 border border-amber-600/40 text-amber-200 text-xs font-semibold flex items-center gap-1 transition-all"
            title="Controls & How to Play"
          >
            <HelpCircle size={16} />
            <span className="hidden md:inline">Controls</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="hud-sound-btn"
            onClick={onToggleSound}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
              soundEnabled
                ? 'bg-amber-600 hover:bg-amber-500 text-amber-950 border-amber-400'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-zinc-600'
            }`}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="hidden sm:inline">
              {soundEnabled ? 'SOUND ON' : 'SOUND OFF'}
            </span>
          </button>

          {/* Pause Button */}
          <button
            id="hud-pause-btn"
            onClick={() => {
              sound.playClick();
              onPause();
            }}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-maroon-950 font-bold border border-amber-300 text-xs flex items-center gap-1 shadow-md transition-all active:scale-95"
            title="Pause Game (ESC / P)"
          >
            <Pause size={16} className="fill-maroon-950" />
            <span className="hidden sm:inline">PAUSE</span>
          </button>
        </div>
      </div>

      {/* Subtle Progress Bar underneath */}
      <div className="w-full bg-black/50 h-1 mt-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-300 shadow-[0_0_10px_#f59e0b]"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>
    </header>
  );
};
