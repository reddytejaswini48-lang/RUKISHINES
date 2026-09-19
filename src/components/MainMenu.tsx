import React from 'react';
import { Volume2, VolumeX, Play, HelpCircle, Gamepad2, Sparkles, Award } from 'lucide-react';
import { GaneshaArtwork } from './GaneshaArtwork';
import { sound } from '../utils/audio';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenHowToPlay: () => void;
  onOpenControls: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  completedLevels: number[];
  onSelectLevel: (lvl: 1 | 2 | 3) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenHowToPlay,
  onOpenControls,
  soundEnabled,
  onToggleSound,
  completedLevels,
  onSelectLevel,
}) => {
  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-[#2e0505] via-[#480812] to-[#1c0204] text-amber-100 select-none overflow-y-auto">
      
      {/* Decorative Traditional Toran Overhead */}
      <div className="w-full max-w-4xl flex items-center justify-between px-4 py-2 border-b border-amber-500/40 text-xs sm:text-sm font-cinzel text-amber-300 font-bold tracking-widest z-10">
        <span>ॐ श्री गणेशाय नमः</span>
        <span className="hidden sm:inline">✦ GANESH CHATURTHI FESTIVAL ✦</span>
        <span>शुभ लाभ</span>
      </div>

      {/* Main Title & Subtitle */}
      <div className="text-center my-3 sm:my-5 z-10">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 border border-amber-400/50 text-amber-300 px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase mb-2 shadow-inner">
          <Sparkles size={16} className="text-yellow-400 fill-yellow-400" />
          FAMILY-FRIENDLY FESTIVAL GAME
          <Sparkles size={16} className="text-yellow-400 fill-yellow-400" />
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-cinzel font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 drop-shadow-[0_5px_15px_rgba(245,158,11,0.5)]">
          GANESHA FESTIVAL
        </h1>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-cinzel font-black tracking-widest text-amber-200 drop-shadow-md -mt-1 sm:-mt-2">
          ADVENTURE
        </h2>
        
        <p className="text-xs sm:text-sm text-amber-200/85 max-w-lg mx-auto mt-2 font-medium">
          Celebrate Ganesh Chaturthi through 3 festival adventures: Modak Slice, Pandal Puzzle, Puja Collector!
        </p>
      </div>

      {/* Center Artwork: Respectful Lord Ganesha with Diyas */}
      <div className="relative w-full max-w-sm sm:max-w-md my-auto flex items-center justify-center z-10">
        {/* Glow backdrop */}
        <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-radial from-amber-500/30 via-amber-900/10 to-transparent blur-3xl -z-10" />
        <GaneshaArtwork size="md" showDiyas={true} />
      </div>

      {/* 4 Primary Main Menu Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3 sm:gap-3.5 my-2 z-10">
        
        {/* 1. START GAME */}
        <button
          id="main-start-btn"
          onClick={() => {
            sound.playClick();
            sound.startFestiveMusic();
            onStartGame();
          }}
          className="w-full py-3.5 sm:py-4 px-6 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-maroon-950 font-cinzel font-black text-lg sm:text-xl rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.5)] border-2 border-yellow-200 flex items-center justify-center gap-3 transition-transform active:scale-95 cursor-pointer"
        >
          <Play size={22} className="fill-maroon-950" />
          START GAME
        </button>

        {/* 2. HOW TO PLAY */}
        <button
          id="main-how-to-play-btn"
          onClick={() => {
            sound.playClick();
            onOpenHowToPlay();
          }}
          className="w-full py-3 px-5 bg-amber-950/70 hover:bg-amber-900 border-2 border-amber-600/50 text-amber-200 font-cinzel font-bold text-sm sm:text-base rounded-2xl shadow-lg flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer"
        >
          <HelpCircle size={20} />
          HOW TO PLAY
        </button>

        {/* 3. CONTROLS */}
        <button
          id="main-controls-btn"
          onClick={() => {
            sound.playClick();
            onOpenControls();
          }}
          className="w-full py-3 px-5 bg-amber-950/70 hover:bg-amber-900 border-2 border-amber-600/50 text-amber-200 font-cinzel font-bold text-sm sm:text-base rounded-2xl shadow-lg flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer"
        >
          <Gamepad2 size={20} />
          CONTROLS
        </button>

        {/* 4. SOUND ON/OFF */}
        <button
          id="main-sound-btn"
          onClick={onToggleSound}
          className={`w-full py-3 px-5 border-2 rounded-2xl flex items-center justify-center gap-2.5 font-cinzel font-bold text-sm sm:text-base transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-amber-800/80 hover:bg-amber-700 text-amber-200 border-amber-500'
              : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 border-zinc-700'
          }`}
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          {soundEnabled ? 'SOUND ON' : 'SOUND OFF'}
        </button>
      </div>

      {/* Level Selection Pill if player has completed earlier levels */}
      {completedLevels.length > 0 && (
        <div className="w-full max-w-sm bg-black/40 border border-amber-600/30 p-2.5 rounded-2xl flex items-center justify-between text-xs text-amber-200 mb-2 z-10">
          <span className="font-bold flex items-center gap-1 text-amber-300">
            <Award size={16} /> Jump to Level:
          </span>
          <div className="flex gap-1.5 sm:gap-2">
            {[1, 2, 3].map((lvl) => {
              const isUnlocked = lvl === 1 || completedLevels.includes(lvl - 1);
              return (
                <button
                  key={lvl}
                  id={`jump-lvl-${lvl}-btn`}
                  disabled={!isUnlocked}
                  onClick={() => {
                    sound.playClick();
                    onSelectLevel(lvl as 1 | 2 | 3);
                  }}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg font-cinzel font-bold text-xs transition ${
                    isUnlocked
                      ? 'bg-amber-500 hover:bg-amber-400 text-maroon-950 cursor-pointer'
                      : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  L{lvl}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-[11px] sm:text-xs text-amber-400/60 font-medium py-1 z-10">
        Created for Student Presentation • Playable on Desktop & Mobile
      </footer>
    </div>
  );
};
