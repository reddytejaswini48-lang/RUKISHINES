import React from 'react';
import { Volume2, VolumeX, Play, RotateCcw, Home, HelpCircle, X, ShieldAlert, Award } from 'lucide-react';
import { sound } from '../utils/audio';

// 1. Pause Menu Modal
interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestartLevel: () => void;
  onOpenControls: () => void;
  onMainMenu: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestartLevel,
  onOpenControls,
  onMainMenu,
  soundEnabled,
  onToggleSound,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-gradient-to-b from-[#3b0712] to-[#1e0404] border-2 border-amber-500/80 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center text-amber-100">
        <h2 className="text-3xl font-cinzel font-black text-amber-300 mb-1 tracking-wider drop-shadow-md">
          PAUSED
        </h2>
        <p className="text-xs text-amber-200/70 mb-6 font-medium">
          Ganesha Festival Adventure
        </p>

        <div className="space-y-3">
          <button
            id="pause-resume-btn"
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-maroon-950 font-cinzel font-bold text-base rounded-xl shadow-lg border border-amber-300 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Play size={18} className="fill-maroon-950" />
            RESUME
          </button>

          <button
            id="pause-restart-btn"
            onClick={() => {
              sound.playClick();
              onRestartLevel();
            }}
            className="w-full py-2.5 px-4 bg-amber-950/70 hover:bg-amber-900 border border-amber-600/50 text-amber-200 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw size={18} />
            RESTART LEVEL
          </button>

          <button
            id="pause-controls-btn"
            onClick={() => {
              sound.playClick();
              onOpenControls();
            }}
            className="w-full py-2.5 px-4 bg-amber-950/70 hover:bg-amber-900 border border-amber-600/50 text-amber-200 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <HelpCircle size={18} />
            CONTROLS
          </button>

          <button
            id="pause-sound-btn"
            onClick={onToggleSound}
            className={`w-full py-2.5 px-4 border rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-amber-800/80 hover:bg-amber-700 text-amber-200 border-amber-500'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-zinc-600'
            }`}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            {soundEnabled ? 'SOUND ON' : 'SOUND OFF'}
          </button>

          <button
            id="pause-mainmenu-btn"
            onClick={() => {
              sound.playClick();
              onMainMenu();
            }}
            className="w-full py-2.5 px-4 bg-red-950/60 hover:bg-red-900 border border-red-700/50 text-red-200 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Home size={18} />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Level Failed Modal
interface LevelFailedModalProps {
  isOpen: boolean;
  levelNumber: number;
  onReplayLevel: () => void;
  onMainMenu: () => void;
}

export const LevelFailedModal: React.FC<LevelFailedModalProps> = ({
  isOpen,
  levelNumber,
  onReplayLevel,
  onMainMenu,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-gradient-to-b from-[#450a0a] to-[#1e0404] border-2 border-red-600 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center text-amber-100">
        <div className="w-16 h-16 bg-red-950/80 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400">
          <ShieldAlert size={36} />
        </div>

        <h2 className="text-2xl sm:text-3xl font-cinzel font-black text-red-400 mb-1 tracking-wider drop-shadow-md">
          LEVEL FAILED
        </h2>
        <p className="text-sm text-amber-200/80 mb-2 font-medium">
          Out of lives!
        </p>
        <p className="text-xs text-amber-300/70 mb-6 bg-black/30 p-2.5 rounded-lg border border-amber-600/30">
          Don't worry, devotee! All previously completed levels remain safely unlocked.
        </p>

        <div className="space-y-3">
          <button
            id="fail-replay-btn"
            onClick={() => {
              sound.playClick();
              onReplayLevel();
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-maroon-950 font-cinzel font-bold text-base rounded-xl shadow-lg border border-amber-300 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <RotateCcw size={18} />
            REPLAY LEVEL
          </button>

          <button
            id="fail-mainmenu-btn"
            onClick={() => {
              sound.playClick();
              onMainMenu();
            }}
            className="w-full py-2.5 px-4 bg-amber-950/70 hover:bg-amber-900 border border-amber-600/50 text-amber-200 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Home size={18} />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Level Complete Modal / Banner
interface LevelCompleteModalProps {
  isOpen: boolean;
  levelNumber: number;
  title: string;
  onNext: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  isOpen,
  levelNumber,
  title,
  onNext,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-gradient-to-b from-[#4a0b17] via-[#2d050c] to-[#180306] border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(245,158,11,0.5)] text-center text-amber-100">
        <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-full flex items-center justify-center mx-auto mb-4 text-maroon-950 shadow-lg border-2 border-amber-200 animate-bounce">
          <Award size={44} />
        </div>

        <h2 className="text-3xl sm:text-4xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-amber-400 mb-2 tracking-wider drop-shadow">
          LEVEL {levelNumber} COMPLETE!
        </h2>
        <p className="text-base text-amber-200 font-semibold mb-6">
          {title}
        </p>

        <button
          id="level-complete-next-btn"
          onClick={() => {
            sound.playClick();
            onNext();
          }}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-maroon-950 font-cinzel font-black text-lg rounded-2xl shadow-xl border border-amber-200 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
        >
          <span>
            {levelNumber === 5
              ? 'ENTER GRAND CELEBRATION!'
              : levelNumber === 4
              ? 'CONTINUE TO LEVEL 5 (DAMRU DANCE)'
              : levelNumber === 3
              ? 'CONTINUE TO LEVEL 4 (SHRINGAR)'
              : `CONTINUE TO LEVEL ${levelNumber + 1}`}
          </span>
          <Play size={20} className="fill-maroon-950" />
        </button>
      </div>
    </div>
  );
};

// 4. How to Play Modal
interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
      <div className="bg-gradient-to-b from-[#3b0712] to-[#1e0404] border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-amber-100 my-auto">
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-4">
          <h2 className="text-2xl font-cinzel font-bold text-amber-300 flex items-center gap-2">
            <span>✨ HOW TO PLAY</span>
          </h2>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-amber-300 hover:bg-amber-900/60 transition"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-4 text-sm text-amber-200/90 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          {/* Level 1 */}
          <div className="bg-black/30 p-4 rounded-xl border border-amber-500/30">
            <h3 className="font-cinzel font-bold text-amber-300 text-base mb-1 flex items-center gap-2">
              <span className="bg-amber-500 text-maroon-950 px-2 py-0.5 rounded text-xs">L1</span>
              MODAK SLICE
            </h3>
            <p className="mb-2 text-xs text-amber-200/80">
              "Slice 5 Modaks. Avoid the obstacles!"
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-amber-100">
              <li>Swipe your finger (mobile) or drag left mouse button (PC) across rising Modaks.</li>
              <li>Slice exactly 5 delicious Modaks to win.</li>
              <li>Avoid spiky husks & obstacles to save your 3 lives!</li>
            </ul>
          </div>

          {/* Level 2 */}
          <div className="bg-black/30 p-4 rounded-xl border border-amber-500/30">
            <h3 className="font-cinzel font-bold text-amber-300 text-base mb-1 flex items-center gap-2">
              <span className="bg-amber-500 text-maroon-950 px-2 py-0.5 rounded text-xs">L2</span>
              SACRED FESTIVAL PUZZLES (4 STAGES)
            </h3>
            <p className="mb-2 text-xs text-amber-200/80">
              "Solve all 4 sacred festival puzzles to complete the pandal preparation!"
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-amber-100">
              <li>Solve 4 unique scenes: <strong>Temple Pandal</strong>, <strong>Lord Ganesha & Mushak</strong>, <strong>Maha Modak Thali</strong>, and <strong>Deepotsav Aarti</strong>.</li>
              <li>Tap/click one piece, then tap another to swap positions (or drag & drop).</li>
              <li>Ring the sacred temple bells on the top header for divine blessings!</li>
              <li>Use the "Preview" button anytime to peek at the original artwork.</li>
            </ul>
          </div>

          {/* Level 3 */}
          <div className="bg-black/30 p-4 rounded-xl border border-amber-500/30">
            <h3 className="font-cinzel font-bold text-amber-300 text-base mb-1 flex items-center gap-2">
              <span className="bg-amber-500 text-maroon-950 px-2 py-0.5 rounded text-xs">L3</span>
              PUJA COLLECTOR
            </h3>
            <p className="mb-2 text-xs text-amber-200/80">
              "Collect 5 Puja items and reach the finish!"
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-amber-100">
              <li>Run down the 3-lane festival street toward the grand illuminated pandal.</li>
              <li>Collect Durva grass, Hibiscus flowers, Diyas, Kalash, and Modaks.</li>
              <li>Jump over boxes, slide under garland gates, and dodge barriers!</li>
            </ul>
          </div>

          {/* Level 4 */}
          <div className="bg-black/30 p-4 rounded-xl border border-amber-500/30">
            <h3 className="font-cinzel font-bold text-amber-300 text-base mb-1 flex items-center gap-2">
              <span className="bg-amber-500 text-maroon-950 px-2 py-0.5 rounded text-xs">L4</span>
              GET READY WITH ME (GRWM): BAL GANESHA
            </h3>
            <p className="mb-2 text-xs text-amber-200/80">
              "Help Bal Ganesha get dressed and adorned for Ganesh Chaturthi in this interactive GRWM experience!"
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-amber-100">
              <li>Adorn Bal Ganesha across 8 anatomical levels: <strong>Level 1 (Crown Mukut)</strong>, <strong>Level 2 (Forehead Tilak)</strong>, <strong>Level 3 (Ears & Kundal)</strong>, <strong>Level 4 (Neck & Mala)</strong>, <strong>Level 5 (Angavastram & Janeu)</strong>, <strong>Level 6 (Wrists & Kadas)</strong>, <strong>Level 7 (Pitambar Dhoti)</strong>, and <strong>Level 8 (Modak Thali)</strong>.</li>
              <li>Tap an item from Ganesha's wardrobe tray, then tap its body level slot (or drag & drop).</li>
              <li>Listen to Bal Ganesha's cute reactions and dialogue as each sacred item is placed!</li>
              <li>Interact with Bal Ganesha: Tap the <strong>Camera</strong> to strike a blessing pose, tap the <strong>Smile</strong> button to flutter his cute elephant ears, or shower <strong>Pushpa Varsha</strong> petals!</li>
            </ul>
          </div>

          {/* Level 5 */}
          <div className="bg-black/30 p-4 rounded-xl border border-amber-500/30">
            <h3 className="font-cinzel font-bold text-amber-300 text-base mb-1 flex items-center gap-2">
              <span className="bg-amber-500 text-maroon-950 px-2 py-0.5 rounded text-xs">L5</span>
              SHANKAR JI KA DAMRU (GANESHA & MUSHAK DANCE)
            </h3>
            <p className="mb-2 text-xs text-amber-200/80">
              "Make Bal Ganesha and his rat Mushak dance to the favorite cartoon song 'Shankar Ji Ka Damru'!"
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-amber-100">
              <li>Hit incoming Damru notes on the rhythm bar using keys <strong>[A, S, W, D]</strong> or tap the 4 on-screen dance pads.</li>
              <li>Trigger joyful moves: <strong>Thumka Step</strong>, <strong>Damru Strike</strong>, <strong>Modak Jump</strong>, and <strong>Mushak Twirl</strong>!</li>
              <li>Fill the Dance Joy Meter to 100% to lead Bappa and Mushak into the Grand Festival Aarti!</li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full mt-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-maroon-950 font-cinzel font-bold rounded-xl shadow-lg border border-amber-300"
        >
          GOT IT!
        </button>
      </div>
    </div>
  );
};

// 5. Controls Modal
interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
      <div className="bg-gradient-to-b from-[#3b0712] to-[#1e0404] border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-amber-100 my-auto">
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-4">
          <h2 className="text-2xl font-cinzel font-bold text-amber-300 flex items-center gap-2">
            <span>🎮 CONTROLS GUIDE</span>
          </h2>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-amber-300 hover:bg-amber-900/60 transition"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-1">
          {/* PC Keyboard & Mouse */}
          <div className="bg-black/30 p-4 rounded-xl border border-amber-500/30">
            <h3 className="font-cinzel font-bold text-amber-300 text-base mb-2">
              💻 PC & Laptop
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-amber-100">
              <div className="bg-amber-950/40 p-2 rounded border border-amber-600/30">
                <span className="font-bold text-amber-300">Level 1 Slice:</span> Left Click & Drag mouse
              </div>
              <div className="bg-amber-950/40 p-2 rounded border border-amber-600/30">
                <span className="font-bold text-amber-300">Level 2 Puzzle:</span> Click piece A, Click piece B to swap
              </div>
              <div className="bg-amber-950/40 p-2 rounded border border-amber-600/30">
                <span className="font-bold text-amber-300">Move Left / Right:</span> A / D or ← / →
              </div>
              <div className="bg-amber-950/40 p-2 rounded border border-amber-600/30">
                <span className="font-bold text-amber-300">Jump:</span> W or ↑ or SPACEBAR
              </div>
              <div className="bg-amber-950/40 p-2 rounded border border-amber-600/30">
                <span className="font-bold text-amber-300">Slide:</span> S or ↓
              </div>
              <div className="bg-amber-950/40 p-2 rounded border border-amber-600/30">
                <span className="font-bold text-amber-300">Level 4 GRWM:</span> Click or Drag item to Bal Ganesha's level slot (1-8)
              </div>
              <div className="bg-amber-950/40 p-2 rounded border border-amber-600/30">
                <span className="font-bold text-amber-300">Level 5 Dance:</span> [A, S, W, D] or Arrow Keys to hit beats
              </div>
              <div className="bg-amber-950/40 p-2 rounded border border-amber-600/30">
                <span className="font-bold text-amber-300">Pause:</span> ESC or P key
              </div>
            </div>
          </div>

          {/* Mobile & Tablet */}
          <div className="bg-black/30 p-4 rounded-xl border border-amber-500/30">
            <h3 className="font-cinzel font-bold text-amber-300 text-base mb-2">
              📱 Mobile & Tablet
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-amber-100">
              <div className="bg-amber-950/40 p-2 rounded border border-amber-600/30">
                <span className="font-bold text-amber-300">Level 1 Slice:</span> Swipe finger across Modaks
              </div>
              <div className="bg-amber-950/40 p-2 rounded border border-amber-600/30">
                <span className="font-bold text-amber-300">Level 2 Puzzle:</span> Tap piece A, then tap piece B
              </div>
              <div className="bg-amber-950/40 p-2 rounded border border-amber-600/30">
                <span className="font-bold text-amber-300">Change Lanes:</span> Swipe Left or Swipe Right
              </div>
              <div className="bg-amber-950/40 p-2 rounded border border-amber-600/30">
                <span className="font-bold text-amber-300">Jump / Slide:</span> Swipe UP (Jump), Swipe DOWN (Slide)
              </div>
              <div className="bg-amber-950/40 p-2 rounded border border-amber-600/30 col-span-2">
                <span className="font-bold text-amber-300">Level 4 GRWM:</span> Tap item in tray, then tap matching body level on Bal Ganesha (1-8)
              </div>
            </div>
            <p className="text-xs text-amber-300/80 mt-2 italic">
              *On-screen touch buttons are also available during Level 3 for effortless one-touch play on mobile!
            </p>
          </div>

          {/* Devotional Music Jukebox */}
          <div className="bg-black/30 p-4 rounded-xl border border-amber-500/30">
            <h3 className="font-cinzel font-bold text-amber-300 text-base mb-1.5 flex items-center gap-1.5">
              <span>🪈 Auspicious Music Jukebox</span>
            </h3>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              Use the music player in the menu and header to switch between 4 authentic devotional tracks:
              <strong> Jai Ganesh Deva</strong> (Aarti), <strong>Dhol-Tasha Utsav</strong> (Procession Beats), <strong>Divine Temple Flute</strong> (Raga Bhupali), and <strong>Sukh Karta Dukh Harta</strong> (Traditional Marathi Aarti).
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full mt-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-maroon-950 font-cinzel font-bold rounded-xl shadow-lg border border-amber-300"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};
