import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { PlayerAttireState } from '../types';
import {
  Sparkles,
  Music,
  Heart,
  Volume2,
  Award,
  Zap,
  Flame,
  ArrowRight,
  Smile,
  Disc,
} from 'lucide-react';

interface GaneshaDanceGameProps {
  onComplete: () => void;
  onLoseLife: () => void;
  isPaused: boolean;
  playerAttire?: PlayerAttireState;
  onUpdateProgress: (score: number, target: number) => void;
  onUpdateTimeLeft?: (seconds: number) => void;
}

type DanceMove = 'idle' | 'thumka' | 'spin' | 'damru_strike' | 'modak_juggle' | 'sync_jump';
type RatMove = 'idle' | 'rat_spin' | 'rat_breakdance' | 'rat_juggle' | 'rat_cheer';

interface HitEffect {
  id: number;
  text: string;
  hindiText: string;
  color: string;
  x: number;
  y: number;
}

interface BeatNote {
  id: number;
  type: 0 | 1 | 2 | 3; // 0: Left, 1: Down, 2: Up, 3: Right
  targetTime: number; // in seconds
  hit: boolean;
}

const MOVE_NAMES = [
  { label: 'Thumka Step', hindi: 'थुमक ताल', icon: '💃', key: 'Left / A', dir: 'left' },
  { label: 'Damru Strike', hindi: 'डमरू थाप', icon: '🪘', key: 'Down / S', dir: 'down' },
  { label: 'Modak Jump', hindi: 'मोदक छलांग', icon: '🥟', key: 'Up / W', dir: 'up' },
  { label: 'Mushak Spin', hindi: 'मूषक चक्कर', icon: '🐭', key: 'Right / D', dir: 'right' },
];

export const GaneshaDanceGame: React.FC<GaneshaDanceGameProps> = ({
  onComplete,
  onLoseLife,
  isPaused,
  playerAttire,
  onUpdateProgress,
  onUpdateTimeLeft,
}) => {
  // Game Play & Score
  const TARGET_JOY = 25; // 25 on-beat dance hits to complete
  const [joyScore, setJoyScore] = useState<number>(0);
  const [comboStreak, setComboStreak] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [danceTimeLeft, setDanceTimeLeft] = useState<number>(75);

  // Animation states
  const [ganeshaMove, setGaneshaMove] = useState<DanceMove>('idle');
  const [ratMove, setRatMove] = useState<RatMove>('idle');
  const [beatPulse, setBeatPulse] = useState<boolean>(false);
  const [damruTwirling, setDamruTwirling] = useState<boolean>(false);
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);
  const [activeLanePress, setActiveLanePress] = useState<number | null>(null);

  // Rhythm beat notes stream
  const [beatNotes, setBeatNotes] = useState<BeatNote[]>([]);
  const gameTimeRef = useRef<number>(0);
  const nextNoteIdRef = useRef<number>(1);
  const lastSpawnBeatRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Beat interval: 132 BPM => 1 beat every 60/132 ≈ 0.4545s
  const BEAT_INTERVAL = 60 / 132;

  // Initialize or start Level 5 music
  useEffect(() => {
    sound.playTrackForLevel('LEVEL_5');
  }, []);

  // Sync HUD progress
  useEffect(() => {
    onUpdateProgress(joyScore, TARGET_JOY);
  }, [joyScore, onUpdateProgress]);

  // Main countdown timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setDanceTimeLeft((prev) => {
        const next = Math.max(0, prev - 1);
        if (onUpdateTimeLeft) onUpdateTimeLeft(next);
        if (next <= 0) {
          clearInterval(interval);
          if (joyScore < TARGET_JOY) {
            onLoseLife();
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, joyScore, onLoseLife, onUpdateTimeLeft]);

  // Rhythm generator and beat dispatcher
  useEffect(() => {
    if (isPaused) return;

    let animFrame: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      gameTimeRef.current += dt;

      const currentTime = gameTimeRef.current;

      // Pulse on every beat
      const beatFraction = (currentTime % BEAT_INTERVAL) / BEAT_INTERVAL;
      if (beatFraction < 0.15) {
        setBeatPulse(true);
      } else {
        setBeatPulse(false);
      }

      // Spawn upcoming rhythm notes 2 seconds in advance
      const currentBeatIndex = Math.floor((currentTime + 2.0) / BEAT_INTERVAL);
      if (currentBeatIndex > lastSpawnBeatRef.current) {
        lastSpawnBeatRef.current = currentBeatIndex;
        // 75% chance of note on beat
        if (currentBeatIndex % 2 === 0 || Math.random() < 0.6) {
          const type = (Math.floor(Math.random() * 4)) as (0 | 1 | 2 | 3);
          setBeatNotes((prev) => [
            ...prev,
            {
              id: nextNoteIdRef.current++,
              type,
              targetTime: currentBeatIndex * BEAT_INTERVAL,
              hit: false,
            },
          ]);
        }
      }

      // Cleanup past notes
      setBeatNotes((prev) => prev.filter((n) => !n.hit && n.targetTime > currentTime - 0.5));

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [isPaused, BEAT_INTERVAL]);

  // Trigger dance animations
  const triggerDanceMove = useCallback((move: DanceMove, rat: RatMove) => {
    setGaneshaMove(move);
    setRatMove(rat);
    setDamruTwirling(true);

    setTimeout(() => {
      setDamruTwirling(false);
    }, 450);

    setTimeout(() => {
      setGaneshaMove('idle');
      setRatMove('idle');
    }, 650);
  }, []);

  // Show floating hit text
  const addHitEffect = (rating: 'PERFECT' | 'GREAT' | 'GOOD') => {
    const id = Date.now() + Math.random();
    let text = 'GREAT!';
    let hindiText = 'सुंदर!';
    let color = 'text-amber-300';

    if (rating === 'PERFECT') {
      text = 'PERFECT! ★';
      hindiText = 'वाह! अद्भुत!';
      color = 'text-yellow-300';
    } else if (rating === 'GREAT') {
      text = 'GREAT BEAT!';
      hindiText = 'शानदार ताल!';
      color = 'text-emerald-300';
    } else {
      text = 'NICE!';
      hindiText = 'बढ़िया!';
      color = 'text-cyan-300';
    }

    setHitEffects((prev) => [
      ...prev.slice(-3),
      {
        id,
        text,
        hindiText,
        color,
        x: 45 + (Math.random() * 10 - 5),
        y: 45 + (Math.random() * 8 - 4),
      },
    ]);

    setTimeout(() => {
      setHitEffects((prev) => prev.filter((e) => e.id !== id));
    }, 900);
  };

  // Process hit on a rhythm lane
  const handleLaneHit = useCallback(
    (laneIndex: 0 | 1 | 2 | 3) => {
      if (isPaused) return;

      setActiveLanePress(laneIndex);
      setTimeout(() => setActiveLanePress(null), 180);

      const currentTime = gameTimeRef.current;
      const HIT_WINDOW = 0.35; // +/- 350ms window

      // Find closest unhit note in this lane
      const candidateNote = beatNotes.find(
        (n) => !n.hit && n.type === laneIndex && Math.abs(n.targetTime - currentTime) < HIT_WINDOW
      );

      // Play authentic Damru sound
      sound.playDamruTap(laneIndex % 2 === 1);

      if (candidateNote) {
        // Mark as hit
        candidateNote.hit = true;
        const diff = Math.abs(candidateNote.targetTime - currentTime);

        let rating: 'PERFECT' | 'GREAT' | 'GOOD' = 'GOOD';
        if (diff < 0.12) {
          rating = 'PERFECT';
          sound.playTempleGhanta(undefined, 'bright', 0.25, true);
        } else if (diff < 0.24) {
          rating = 'GREAT';
          sound.playManjira();
        }

        addHitEffect(rating);

        setComboStreak((prev) => {
          const next = prev + 1;
          setMaxCombo((m) => Math.max(m, next));
          if (next % 5 === 0) {
            sound.playDamruRoll(0, 4, 0.05, 0.3);
            confetti({
              particleCount: 20,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#f59e0b', '#fbbf24', '#ec4899', '#3b82f6'],
            });
          }
          return next;
        });

        // Increase Joy Score
        setJoyScore((prev) => {
          const next = prev + 1;
          if (next >= TARGET_JOY) {
            // Level Completed!
            setTimeout(() => {
              confetti({
                particleCount: 75,
                spread: 90,
                origin: { y: 0.6 },
                colors: ['#f59e0b', '#10b981', '#fbbf24', '#ffffff'],
              });
              onComplete();
            }, 500);
          }
          return Math.min(TARGET_JOY, next);
        });

        // Trigger matching dance choreography
        if (laneIndex === 0) triggerDanceMove('thumka', 'rat_spin');
        else if (laneIndex === 1) triggerDanceMove('damru_strike', 'rat_breakdance');
        else if (laneIndex === 2) triggerDanceMove('modak_juggle', 'rat_juggle');
        else if (laneIndex === 3) triggerDanceMove('spin', 'rat_cheer');
      } else {
        // Free rhythm tap without missing note
        sound.playManjira();
        // Still allow free dance joy for kids
        setJoyScore((prev) => {
          const next = Math.min(TARGET_JOY, prev + 0.5);
          if (next >= TARGET_JOY) {
            setTimeout(onComplete, 500);
          }
          return next;
        });

        if (laneIndex === 0) triggerDanceMove('thumka', 'rat_spin');
        else if (laneIndex === 1) triggerDanceMove('damru_strike', 'rat_breakdance');
        else if (laneIndex === 2) triggerDanceMove('modak_juggle', 'rat_juggle');
        else if (laneIndex === 3) triggerDanceMove('spin', 'rat_cheer');
      }
    },
    [beatNotes, isPaused, onComplete, triggerDanceMove]
  );

  // Keyboard controls listener (A/S/W/D or Left/Down/Up/Right)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleLaneHit(0);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleLaneHit(1);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        e.preventDefault();
        handleLaneHit(2);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleLaneHit(3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleLaneHit, isPaused]);

  // Joy percentage
  const joyPercentage = Math.min(100, Math.round((joyScore / TARGET_JOY) * 100));

  return (
    <div
      id="ganesha-dance-stage"
      className="relative w-full h-full flex flex-col items-center justify-between p-3 sm:p-5 overflow-hidden select-none bg-gradient-to-b from-[#1b0826] via-[#2c0b38] to-[#120317] text-amber-50"
    >
      {/* Background Sacred Mount Kailash & Twinkling Festive Lights */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-radial from-fuchsia-600/25 via-amber-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Animated dancing spotlights */}
        <div
          className={`absolute top-4 left-1/4 w-36 h-96 bg-gradient-to-b from-amber-400/20 to-transparent blur-2xl transform -rotate-12 transition-transform duration-700 ${
            beatPulse ? 'scale-110 opacity-70' : 'scale-95 opacity-30'
          }`}
        />
        <div
          className={`absolute top-4 right-1/4 w-36 h-96 bg-gradient-to-b from-fuchsia-400/20 to-transparent blur-2xl transform rotate-12 transition-transform duration-700 ${
            beatPulse ? 'scale-110 opacity-70' : 'scale-95 opacity-30'
          }`}
        />
      </div>

      {/* Top Banner: Song Name & Dance Joy Meter */}
      <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-2 z-10 bg-black/40 border border-fuchsia-500/30 px-4 py-2 rounded-2xl backdrop-blur-md shadow-lg">
        {/* Song Info */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-fuchsia-600 flex items-center justify-center text-xl shadow-md ${
              damruTwirling ? 'rotate-45 scale-110' : ''
            } transition-transform`}
          >
            🪘
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-cinzel font-black tracking-wider text-amber-300">
                SHANKAR JI KA DAMRU
              </span>
              <span className="text-[10px] bg-fuchsia-500/30 text-fuchsia-200 px-2 py-0.5 rounded-full font-bold border border-fuchsia-400/40">
                132 BPM
              </span>
            </div>
            <p className="text-[11px] text-amber-200/80">
              शंकर जी का डमरू बोले डम डम डम • Make Ganesha & Mushak Dance!
            </p>
          </div>
        </div>

        {/* Dance Joy Progress Bar */}
        <div className="w-full sm:w-64 flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-bold text-amber-200">
            <span className="flex items-center gap-1">
              <Sparkles size={14} className="text-amber-400" />
              Dance Joy (उमंग)
            </span>
            <span className="font-mono text-amber-300">{joyPercentage}%</span>
          </div>
          <div className="w-full h-3.5 bg-black/60 rounded-full border border-amber-500/40 p-0.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-fuchsia-500 to-yellow-400 transition-all duration-200 shadow-[0_0_12px_rgba(236,72,153,0.7)]"
              style={{ width: `${joyPercentage}%` }}
            />
          </div>
        </div>

        {/* Combo Streak */}
        <div className="flex items-center gap-2 bg-fuchsia-950/70 border border-fuchsia-500/40 px-3 py-1 rounded-xl">
          <Flame size={16} className="text-amber-400 animate-bounce" />
          <div className="text-right">
            <span className="text-[10px] text-fuchsia-200 uppercase tracking-widest block font-bold">
              Combo
            </span>
            <span className="text-sm font-black text-amber-300 font-mono leading-none">
              {comboStreak}x
            </span>
          </div>
        </div>
      </div>

      {/* Center Stage: Ganesha & Mushak Dance Floor */}
      <div className="relative w-full max-w-2xl flex-1 flex flex-col items-center justify-center min-h-[260px] sm:min-h-[320px] my-auto z-10">
        
        {/* Circular Glowing Mandala Dance Platform */}
        <div
          className={`absolute bottom-6 w-[340px] sm:w-[460px] h-28 sm:h-36 rounded-[50%] bg-gradient-to-b from-fuchsia-500/30 via-amber-500/20 to-transparent border-2 border-amber-400/50 blur-[1px] transition-all duration-300 ${
            beatPulse ? 'scale-105 border-amber-300' : 'scale-95'
          }`}
        />

        {/* Lord Shiva Sacred Trishul & Twirling Damru in Background */}
        <div className="absolute top-2 right-6 sm:right-12 flex flex-col items-center opacity-85">
          <div
            className={`cursor-pointer transition-transform ${
              damruTwirling ? 'rotate-[360deg] scale-125' : 'hover:scale-110'
            }`}
            onClick={() => sound.playDamruRoll(0, 4, 0.05, 0.3)}
            title="Click to twirl Damru!"
          >
            {/* SVG Damru with beads */}
            <svg width="56" height="56" viewBox="0 0 100 100" className="drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">
              {/* Hourglass body */}
              <path
                d="M 25 15 L 75 15 C 65 40, 60 48, 50 50 C 40 48, 35 40, 25 15 Z"
                fill="#d97706"
                stroke="#fef08a"
                strokeWidth="3"
              />
              <path
                d="M 25 85 L 75 85 C 65 60, 60 52, 50 50 C 40 52, 35 60, 25 85 Z"
                fill="#b45309"
                stroke="#fef08a"
                strokeWidth="3"
              />
              {/* Central Bindu band */}
              <ellipse cx="50" cy="50" rx="12" ry="5" fill="#f59e0b" stroke="#fef08a" strokeWidth="2" />
              {/* Left string & bead */}
              <line x1="42" y1="50" x2="20" y2={damruTwirling ? '30' : '65'} stroke="#fef08a" strokeWidth="2.5" />
              <circle cx="20" cy={damruTwirling ? '30' : '65'} r="5" fill="#ef4444" stroke="#fef08a" strokeWidth="1.5" />
              {/* Right string & bead */}
              <line x1="58" y1="50" x2="80" y2={damruTwirling ? '70' : '35'} stroke="#fef08a" strokeWidth="2.5" />
              <circle cx="80" cy={damruTwirling ? '70' : '35'} r="5" fill="#ef4444" stroke="#fef08a" strokeWidth="1.5" />
            </svg>
          </div>
          <span className="text-[10px] font-cinzel font-bold text-amber-300 mt-1">
            डमरू बाजे!
          </span>
        </div>

        {/* Floating Hit Feedback Text */}
        {hitEffects.map((effect) => (
          <div
            key={effect.id}
            className={`absolute z-30 font-cinzel font-black text-xl sm:text-2xl pointer-events-none animate-bounce drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] ${effect.color}`}
            style={{ top: `${effect.y}%`, left: `${effect.x}%` }}
          >
            <div>{effect.text}</div>
            <div className="text-xs text-amber-200 font-sans tracking-wide text-center">
              {effect.hindiText}
            </div>
          </div>
        ))}

        {/* Main Dancing Characters: Bal Ganesha & Mushak side by side */}
        <div className="relative flex items-end justify-center gap-4 sm:gap-8 z-20">
          
          {/* Cute Dancing Bal Ganesha */}
          <div
            className={`relative transition-all duration-200 flex flex-col items-center ${
              ganeshaMove === 'thumka'
                ? 'rotate-6 translate-y-[-12px] scale-105'
                : ganeshaMove === 'spin'
                ? 'rotate-[360deg] scale-110'
                : ganeshaMove === 'damru_strike'
                ? '-rotate-6 translate-y-[-8px]'
                : ganeshaMove === 'modak_juggle'
                ? 'translate-y-[-20px] scale-105'
                : beatPulse
                ? 'translate-y-[-4px] scale-[1.02]'
                : 'translate-y-0 scale-100'
            }`}
          >
            {/* Crown Sway / Halo */}
            <div className="absolute -top-6 w-32 h-32 bg-radial from-amber-400/40 to-transparent blur-xl -z-10 animate-pulse" />

            {/* SVG Bal Ganesha Dancing Figure */}
            <svg width="200" height="230" viewBox="0 0 200 230" className="drop-shadow-[0_10px_25px_rgba(245,158,11,0.6)]">
              <defs>
                <linearGradient id="ganeshaGold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
                <linearGradient id="ganeshaSkin" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fed7aa" />
                  <stop offset="70%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
                <linearGradient id="dhotiMaroon" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="60%" stopColor="#b91c1c" />
                  <stop offset="100%" stopColor="#7f1d1d" />
                </linearGradient>
              </defs>

              {/* Royal Crown (Mukut) */}
              <g className={`transition-transform duration-200 ${beatPulse ? '-translate-y-1' : ''}`}>
                <polygon points="100,10 120,45 80,45" fill="url(#ganeshaGold)" stroke="#fef08a" strokeWidth="2" />
                <polygon points="100,20 135,50 65,50" fill="url(#ganeshaGold)" stroke="#b45309" strokeWidth="1.5" />
                <circle cx="100" cy="18" r="4" fill="#dc2626" />
                {/* Kalgi Peacock Feather */}
                <ellipse cx="100" cy="8" rx="3" ry="7" fill="#06b6d4" stroke="#fef08a" strokeWidth="1" />
              </g>

              {/* Large Gentle Ears */}
              {/* Left Ear */}
              <path
                d="M 75 60 C 35 45, 25 80, 45 105 C 60 115, 75 100, 75 90 Z"
                fill="url(#ganeshaSkin)"
                stroke="#ea580c"
                strokeWidth="2"
                className={`transition-transform duration-150 origin-[75px_80px] ${
                  beatPulse ? '-rotate-6' : 'rotate-2'
                }`}
              />
              <path d="M 68 70 C 45 60, 40 85, 55 95" fill="none" stroke="#fed7aa" strokeWidth="2.5" />

              {/* Right Ear */}
              <path
                d="M 125 60 C 165 45, 175 80, 155 105 C 140 115, 125 100, 125 90 Z"
                fill="url(#ganeshaSkin)"
                stroke="#ea580c"
                strokeWidth="2"
                className={`transition-transform duration-150 origin-[125px_80px] ${
                  beatPulse ? 'rotate-6' : '-rotate-2'
                }`}
              />
              <path d="M 132 70 C 155 60, 160 85, 145 95" fill="none" stroke="#fed7aa" strokeWidth="2.5" />

              {/* Chubby Round Head */}
              <circle cx="100" cy="85" r="32" fill="url(#ganeshaSkin)" stroke="#ea580c" strokeWidth="2" />

              {/* Sacred Tilak on Forehead */}
              <path d="M 94 65 Q 100 70 106 65 Q 100 80 94 65 Z" fill="#dc2626" />
              <line x1="91" y1="67" x2="109" y2="67" stroke="#fef08a" strokeWidth="2" />
              <line x1="93" y1="71" x2="107" y2="71" stroke="#fef08a" strokeWidth="2" />

              {/* Gentle Smiling Eyes */}
              <ellipse cx="88" cy="82" rx="4" ry="2.5" fill="#451a03" />
              <ellipse cx="112" cy="82" rx="4" ry="2.5" fill="#451a03" />
              <circle cx="89" cy="81" r="1.2" fill="#ffffff" />
              <circle cx="113" cy="81" r="1.2" fill="#ffffff" />

              {/* Curved Sweet Trunk (Swinging with dance moves!) */}
              <path
                d={
                  ganeshaMove === 'thumka'
                    ? 'M 100 90 Q 95 110, 80 120 Q 70 125, 68 115'
                    : ganeshaMove === 'damru_strike'
                    ? 'M 100 90 Q 105 110, 125 115 Q 135 120, 130 110'
                    : 'M 100 90 Q 98 115, 88 122 Q 80 125, 78 118'
                }
                fill="none"
                stroke="url(#ganeshaSkin)"
                strokeWidth="11"
                strokeLinecap="round"
              />
              {/* Modak on trunk tip */}
              <circle cx={ganeshaMove === 'thumka' ? 68 : ganeshaMove === 'damru_strike' ? 130 : 78} cy={ganeshaMove === 'thumka' ? 115 : ganeshaMove === 'damru_strike' ? 110 : 118} r="5" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />

              {/* Chubby Cute Belly */}
              <ellipse cx="100" cy="145" rx="36" ry="32" fill="url(#ganeshaSkin)" stroke="#ea580c" strokeWidth="2" />
              <ellipse cx="100" cy="148" rx="26" ry="22" fill="#fed7aa" opacity="0.6" />
              {/* Cute Navel */}
              <circle cx="100" cy="154" r="2.5" fill="#c2410c" />

              {/* Royal Maroon & Gold Festive Dhoti */}
              <path
                d="M 66 150 C 70 185, 80 195, 96 195 C 104 195, 120 185, 134 150 C 120 160, 80 160, 66 150 Z"
                fill="url(#dhotiMaroon)"
                stroke="#fef08a"
                strokeWidth="2"
              />
              {/* Golden Pleats */}
              <line x1="100" y1="155" x2="100" y2="195" stroke="#fef08a" strokeWidth="3" />
              <line x1="93" y1="160" x2="93" y2="190" stroke="#fef08a" strokeWidth="1.5" />
              <line x1="107" y1="160" x2="107" y2="190" stroke="#fef08a" strokeWidth="1.5" />

              {/* Upper Arms (Dancing Positions) */}
              {/* Upper Left Hand (Holding sacred Modak or Lotus) */}
              <g className={`transition-transform duration-200 ${ganeshaMove === 'thumka' ? '-rotate-12' : ''}`}>
                <path d="M 70 125 Q 45 105, 52 85" fill="none" stroke="url(#ganeshaSkin)" strokeWidth="8" strokeLinecap="round" />
                <circle cx="52" cy="85" r="7" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
              </g>

              {/* Upper Right Hand (Holding Mini Damru) */}
              <g className={`transition-transform duration-200 ${damruTwirling ? 'rotate-12' : ''}`}>
                <path d="M 130 125 Q 155 105, 150 85" fill="none" stroke="url(#ganeshaSkin)" strokeWidth="8" strokeLinecap="round" />
                {/* Damru in hand */}
                <polygon points="144,78 156,78 152,85 156,92 144,92 148,85" fill="#f59e0b" stroke="#fef08a" strokeWidth="1" />
              </g>

              {/* Dancing Feet with Ghunghroo Bells */}
              <g className={`transition-transform duration-150 ${beatPulse ? 'translate-y-[-3px]' : ''}`}>
                <ellipse cx="82" cy="198" rx="12" ry="7" fill="url(#ganeshaSkin)" stroke="#ea580c" strokeWidth="1.5" />
                <ellipse cx="118" cy="198" rx="12" ry="7" fill="url(#ganeshaSkin)" stroke="#ea580c" strokeWidth="1.5" />
                {/* Ghunghroo gold beads */}
                <circle cx="76" cy="194" r="2" fill="#fef08a" />
                <circle cx="82" cy="194" r="2" fill="#fef08a" />
                <circle cx="88" cy="194" r="2" fill="#fef08a" />
                <circle cx="112" cy="194" r="2" fill="#fef08a" />
                <circle cx="118" cy="194" r="2" fill="#fef08a" />
                <circle cx="124" cy="194" r="2" fill="#fef08a" />
              </g>
            </svg>

            {/* Subtitle tag */}
            <span className="text-[11px] font-cinzel font-bold text-amber-200 mt-1 bg-black/60 px-3 py-0.5 rounded-full border border-amber-500/30">
              श्री बालगणेश (Dancing Ganesha)
            </span>
          </div>

          {/* Cute Dancing Mushak (The Mouse Vehicle) */}
          <div
            className={`relative transition-all duration-200 flex flex-col items-center ${
              ratMove === 'rat_spin'
                ? 'rotate-[360deg] translate-y-[-16px] scale-110'
                : ratMove === 'rat_breakdance'
                ? '-rotate-24 translate-y-[-10px] scale-105'
                : ratMove === 'rat_juggle'
                ? 'translate-y-[-24px] scale-115'
                : beatPulse
                ? 'translate-y-[-6px]'
                : 'translate-y-0'
            }`}
          >
            {/* SVG Cute Mushak Character */}
            <svg width="105" height="130" viewBox="0 0 100 120" className="drop-shadow-[0_6px_16px_rgba(236,72,153,0.5)]">
              {/* Wavy Dancing Tail */}
              <path
                d={
                  beatPulse
                    ? 'M 25 90 Q 5 70, 10 45 Q 15 25, 5 15'
                    : 'M 25 90 Q 0 80, 5 60 Q 10 40, 18 30'
                }
                fill="none"
                stroke="#a8a29e"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-150"
              />

              {/* Chubby Grey Mouse Body */}
              <ellipse cx="50" cy="85" rx="22" ry="24" fill="#78716c" stroke="#d6d3d1" strokeWidth="1.5" />
              <ellipse cx="50" cy="86" rx="15" ry="18" fill="#e7e5e4" />

              {/* Yellow Festive Scarf / Dhoti */}
              <path d="M 38 88 Q 50 96 62 88 L 60 102 Q 50 108 40 102 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="1.2" />

              {/* Head */}
              <circle cx="50" cy="50" r="18" fill="#78716c" stroke="#d6d3d1" strokeWidth="1.5" />

              {/* Little Festive Orange Turban on Mouse */}
              <ellipse cx="50" cy="36" rx="14" ry="7" fill="#f97316" stroke="#fef08a" strokeWidth="1" />
              <circle cx="50" cy="33" r="2.5" fill="#facc15" />

              {/* Cute Round Ears */}
              <circle cx="34" cy="38" r="8" fill="#a8a29e" stroke="#d6d3d1" strokeWidth="1.2" />
              <circle cx="34" cy="38" r="5" fill="#f472b6" />
              <circle cx="66" cy="38" r="8" fill="#a8a29e" stroke="#d6d3d1" strokeWidth="1.2" />
              <circle cx="66" cy="38" r="5" fill="#f472b6" />

              {/* Big Expressive Cartoon Eyes */}
              <ellipse cx="43" cy="48" rx="3.5" ry="4" fill="#1c1917" />
              <ellipse cx="57" cy="48" rx="3.5" ry="4" fill="#1c1917" />
              <circle cx="44" cy="46" r="1.3" fill="#ffffff" />
              <circle cx="58" cy="46" r="1.3" fill="#ffffff" />

              {/* Pink Nose & Whiskers */}
              <polygon points="48,54 52,54 50,57" fill="#f472b6" />
              {/* Whiskers */}
              <line x1="38" y1="53" x2="26" y2="51" stroke="#e7e5e4" strokeWidth="1.2" />
              <line x1="38" y1="56" x2="27" y2="58" stroke="#e7e5e4" strokeWidth="1.2" />
              <line x1="62" y1="53" x2="74" y2="51" stroke="#e7e5e4" strokeWidth="1.2" />
              <line x1="62" y1="56" x2="73" y2="58" stroke="#e7e5e4" strokeWidth="1.2" />

              {/* Tiny Clapping Dancing Paws */}
              <ellipse cx="40" cy="72" rx="4" ry="4" fill="#f472b6" />
              <ellipse cx="60" cy="72" rx="4" ry="4" fill="#f472b6" />
              {/* Little Juggled Modak */}
              {ratMove === 'rat_juggle' && (
                <circle cx="50" cy="20" r="5" fill="#fbbf24" stroke="#b45309" strokeWidth="1" className="animate-bounce" />
              )}

              {/* Dancing Feet with little bells */}
              <ellipse cx="40" cy="110" rx="6" ry="3.5" fill="#f472b6" />
              <ellipse cx="60" cy="110" rx="6" ry="3.5" fill="#f472b6" />
            </svg>

            {/* Subtitle tag */}
            <span className="text-[10px] font-cinzel font-bold text-fuchsia-300 mt-1 bg-black/60 px-2.5 py-0.5 rounded-full border border-fuchsia-500/30">
              मूषक राज (Dancing Rat)
            </span>
          </div>
        </div>
      </div>

      {/* Rhythm Track & Dance Hit Pads */}
      <div className="w-full max-w-xl z-20 flex flex-col items-center gap-2">
        {/* Scrolling Rhythm Beats Visualizer Bar */}
        <div className="w-full h-12 bg-black/70 border-2 border-fuchsia-500/40 rounded-2xl relative overflow-hidden backdrop-blur-md flex items-center px-4 shadow-inner">
          {/* Hit Target Line (on the left side) */}
          <div className="absolute left-8 sm:left-12 top-0 bottom-0 w-3 bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_15px_rgba(245,158,11,1)] z-10 flex items-center justify-center">
            <div className="w-1 h-8 bg-white rounded-full animate-pulse" />
          </div>

          <span className="absolute left-2 sm:left-4 top-1 text-[9px] font-bold uppercase text-amber-300/80 font-cinzel">
            HIT ZONE
          </span>

          {/* Incoming Beat Markers */}
          {beatNotes.map((note) => {
            const timeDiff = note.targetTime - gameTimeRef.current;
            // Travel across bar from right (100%) to hit target (~12%) in 1.8 seconds
            const progress = (1.8 - timeDiff) / 1.8;
            const leftPercent = Math.max(0, Math.min(100, 10 + progress * 80));

            if (timeDiff < -0.3 || note.hit) return null;

            const laneColors = [
              'from-rose-500 to-red-600 border-rose-300',
              'from-amber-500 to-yellow-500 border-yellow-200',
              'from-emerald-500 to-green-600 border-emerald-300',
              'from-blue-500 to-cyan-500 border-cyan-300',
            ];
            const laneIcons = ['💃', '🪘', '🥟', '🐭'];

            return (
              <div
                key={note.id}
                className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br ${laneColors[note.type]} border-2 shadow-lg flex items-center justify-center text-xs font-bold transition-all`}
                style={{ left: `${leftPercent}%` }}
              >
                {laneIcons[note.type]}
              </div>
            );
          })}
        </div>

        {/* 4 Interactive Dance Move Pads / Buttons (Touch & Click) */}
        <div className="w-full grid grid-cols-4 gap-2 sm:gap-3">
          {MOVE_NAMES.map((move, index) => {
            const isPressed = activeLanePress === index;
            const colorStyles = [
              'from-rose-600/90 to-red-700/90 border-rose-400/60 hover:border-rose-300 text-rose-100',
              'from-amber-600/90 to-yellow-600/90 border-amber-400/60 hover:border-amber-300 text-amber-100',
              'from-emerald-600/90 to-green-700/90 border-emerald-400/60 hover:border-emerald-300 text-emerald-100',
              'from-blue-600/90 to-cyan-700/90 border-cyan-400/60 hover:border-cyan-300 text-cyan-100',
            ];

            return (
              <button
                key={move.label}
                id={`dance-pad-${index}`}
                onClick={() => handleLaneHit(index as 0 | 1 | 2 | 3)}
                className={`flex flex-col items-center justify-center py-2.5 sm:py-3 px-1 rounded-2xl bg-gradient-to-b ${
                  colorStyles[index]
                } border-2 shadow-xl backdrop-blur-md cursor-pointer transition-all active:scale-90 ${
                  isPressed ? 'scale-90 brightness-150 ring-4 ring-yellow-300' : 'hover:scale-[1.03]'
                }`}
              >
                <span className="text-2xl sm:text-3xl mb-0.5">{move.icon}</span>
                <span className="text-xs sm:text-sm font-cinzel font-black tracking-wide leading-tight text-center">
                  {move.label}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium opacity-90 leading-none mt-0.5">
                  {move.hindi}
                </span>
                <span className="text-[9px] font-mono opacity-60 mt-1 uppercase bg-black/40 px-1.5 py-0.5 rounded">
                  {move.key}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Help & Freestyle Twirl Prompt */}
        <div className="w-full flex items-center justify-between text-[11px] text-amber-300/80 px-2">
          <span>✨ Tap pads or use keys [A, S, W, D] to match the Damru rhythm!</span>
          <span className="hidden sm:inline font-mono">Time Left: {danceTimeLeft}s</span>
        </div>
      </div>
    </div>
  );
};
