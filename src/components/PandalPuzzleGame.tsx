import React, { useState, useEffect } from 'react';
import { PandalScene, LEVEL_TWO_PUZZLES, PuzzleInfo } from './PandalScene';
import { sound } from '../utils/audio';
import {
  Eye,
  CheckCircle2,
  Shuffle,
  Sparkles,
  Trophy,
  ArrowRight,
  Split,
  Maximize2,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface PandalPuzzleGameProps {
  onComplete: () => void;
  onLoseLife: () => void;
  isPaused: boolean;
  onUpdateProgress: (correctCount: number, total: number) => void;
  onUpdateTimeLeft: (seconds: number) => void;
}

const PIECES_PER_PUZZLE = 6; // 3 cols x 2 rows = 6 pieces per puzzle
const PUZZLE_TIME_LIMIT = 70; // 70 seconds per puzzle

export const PandalPuzzleGame: React.FC<PandalPuzzleGameProps> = ({
  onComplete,
  onLoseLife,
  isPaused,
  onUpdateProgress,
  onUpdateTimeLeft,
}) => {
  // Current active puzzle (0: Pandal, 1: Ganesha & Mushak, 2: Maha Modak, 3: Deepotsav Aarti)
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  const [completedPuzzles, setCompletedPuzzles] = useState<boolean[]>([false, false, false, false]);

  // Array representing which piece index (0..5) is in which board slot (0..5) for the active puzzle
  const [pieces, setPieces] = useState<number[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(PUZZLE_TIME_LIMIT);
  const [isCurrentCompleted, setIsCurrentCompleted] = useState<boolean>(false);
  const [draggedSlot, setDraggedSlot] = useState<number | null>(null);
  const [ringingBell, setRingingBell] = useState<'left' | 'right' | null>(null);

  // Visibility modes:
  // ghostGuide: Faint complete picture underneath tiles (defaults to true so whole puzzle is always visible)
  const [ghostGuide, setGhostGuide] = useState<boolean>(true);
  // viewMode: 'dual' (Reference + Board side-by-side) or 'focus' (Full-size interactive board)
  const [viewMode, setViewMode] = useState<'dual' | 'focus'>('dual');
  // showGridNumbers: displays tile slot numbers 1..6
  const [showGridNumbers, setShowGridNumbers] = useState<boolean>(true);

  // Transition modal between puzzles
  const [transitionState, setTransitionState] = useState<{
    show: boolean;
    solvedPuzzle: PuzzleInfo;
    nextPuzzleIndex: number | null;
  } | null>(null);

  const activePuzzle = LEVEL_TWO_PUZZLES[currentPuzzleIndex];

  // Ring the sacred Mandir Ghanta (Temple Bell)
  const ringTempleBell = (side: 'left' | 'right') => {
    sound.playTempleGhanta(undefined, side === 'left' ? 'deep' : 'resonant', 0.45, true);
    setRingingBell(side);
    setTimeout(() => {
      setRingingBell(null);
    }, 1400);
  };

  // Shuffle pieces helper
  const shufflePiecesForPuzzle = () => {
    let arr = [0, 1, 2, 3, 4, 5];
    let correct = 6;

    // Ensure it's not solved initially (at most 1 piece in correct place)
    while (correct > 1) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      correct = arr.filter((piece, slot) => piece === slot).length;
    }

    setPieces(arr);
    setSelectedIndex(null);
    setIsCurrentCompleted(false);
    setTimeLeft(PUZZLE_TIME_LIMIT);
    setShowPreviewModal(false);
  };

  // Switch to a specific puzzle
  const handleSelectPuzzle = (idx: number) => {
    if (idx === currentPuzzleIndex) return;
    sound.playClick();
    setCurrentPuzzleIndex(idx);
    setTransitionState(null);
  };

  // Initialize or re-shuffle when currentPuzzleIndex changes
  useEffect(() => {
    shufflePiecesForPuzzle();
  }, [currentPuzzleIndex]);

  // Update HUD progress
  useEffect(() => {
    const totalSolved = completedPuzzles.filter(Boolean).length;
    onUpdateProgress(totalSolved, LEVEL_TWO_PUZZLES.length);
  }, [completedPuzzles, onUpdateProgress]);

  // Timer countdown
  useEffect(() => {
    if (isPaused || isCurrentCompleted || transitionState?.show) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        onUpdateTimeLeft(next);
        if (next <= 0) {
          clearInterval(timer);
          onLoseLife();
        }
        return Math.max(0, next);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isCurrentCompleted, transitionState, onLoseLife, onUpdateTimeLeft]);

  // Swap pieces logic
  const swapPieces = (slotA: number, slotB: number) => {
    if (slotA === slotB || isCurrentCompleted || isPaused) return;

    const newPieces = [...pieces];
    [newPieces[slotA], newPieces[slotB]] = [newPieces[slotB], newPieces[slotA]];
    setPieces(newPieces);
    setSelectedIndex(null);
    sound.playPuzzleSwap();

    // Check if current puzzle is solved
    const correctCount = newPieces.filter((piece, slot) => piece === slot).length;

    if (correctCount === PIECES_PER_PUZZLE) {
      // Solved current puzzle!
      setIsCurrentCompleted(true);
      sound.playTempleGhantaCascade();

      const newCompleted = [...completedPuzzles];
      newCompleted[currentPuzzleIndex] = true;
      setCompletedPuzzles(newCompleted);

      // Check if all 4 puzzles are completed
      const allDone = newCompleted.every(Boolean);

      if (allDone) {
        sound.playLevelComplete();
        setTimeout(() => {
          onComplete();
        }, 1200);
      } else {
        const nextIdx = (currentPuzzleIndex + 1) % LEVEL_TWO_PUZZLES.length;
        setTransitionState({
          show: true,
          solvedPuzzle: LEVEL_TWO_PUZZLES[currentPuzzleIndex],
          nextPuzzleIndex: nextIdx,
        });
      }
    } else if (newPieces[slotB] === slotB || newPieces[slotA] === slotA) {
      sound.playTempleGhanta(undefined, 'resonant', 0.38, true);
    }
  };

  // Continue from transition modal to next puzzle
  const handleProceedToNext = () => {
    if (!transitionState || transitionState.nextPuzzleIndex === null) return;
    sound.playClick();
    const next = transitionState.nextPuzzleIndex;
    setTransitionState(null);
    setCurrentPuzzleIndex(next);
  };

  // Click / tap handler
  const handlePieceClick = (slotIndex: number) => {
    if (isCurrentCompleted || isPaused) return;

    if (selectedIndex === null) {
      sound.playClick();
      setSelectedIndex(slotIndex);
    } else if (selectedIndex === slotIndex) {
      setSelectedIndex(null);
    } else {
      swapPieces(selectedIndex, slotIndex);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (slotIndex: number) => {
    if (isCurrentCompleted || isPaused) return;
    setDraggedSlot(slotIndex);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetSlot: number) => {
    if (draggedSlot !== null && draggedSlot !== targetSlot) {
      swapPieces(draggedSlot, targetSlot);
    }
    setDraggedSlot(null);
  };

  const currentCorrectPieces = pieces.filter((piece, slot) => piece === slot).length;
  const completedPuzzlesCount = completedPuzzles.filter(Boolean).length;

  return (
    <div className="relative w-full h-full min-h-0 flex flex-col justify-between p-1.5 sm:p-3 bg-gradient-to-b from-[#250407] via-[#35070d] to-[#160204] overflow-hidden select-none">
      
      {/* Top Bar: Bells, Title & 4 Stage Selector Tabs (Streamlined Height) */}
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-1 z-10 shrink-0">
        <div className="flex items-center justify-between px-1">
          {/* Left Temple Bell */}
          <button
            id="temple-bell-left-btn"
            onClick={() => ringTempleBell('left')}
            className="flex items-center gap-1 group cursor-pointer transition transform active:scale-90 bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500/40 px-2 py-0.5 rounded-lg"
            title="Ring Left Mandir Bell (Deep Tone)"
          >
            <span
              className={`text-lg sm:text-xl filter drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] ${
                ringingBell === 'left' ? 'animate-bell-swing' : 'group-hover:scale-110 transition-transform'
              }`}
            >
              🔔
            </span>
            <span className="text-[10px] font-cinzel font-bold text-amber-300 hidden sm:inline">
              Left Bell
            </span>
          </button>

          {/* Center Title & Current Active Puzzle Info */}
          <div className="text-center px-1">
            <h2 className="text-sm sm:text-base font-cinzel font-black text-amber-300 drop-shadow flex items-center justify-center gap-1.5">
              <span>🌸 LEVEL 2: FESTIVAL PUZZLE STAGES</span>
            </h2>
            <p className="text-[10px] sm:text-xs text-amber-200/90 font-medium">
              {activePuzzle.icon} <span className="font-bold text-yellow-300">{activePuzzle.title}</span> ({activePuzzle.hindiTitle})
            </p>
          </div>

          {/* Right Temple Bell */}
          <button
            id="temple-bell-right-btn"
            onClick={() => ringTempleBell('right')}
            className="flex items-center gap-1 group cursor-pointer transition transform active:scale-90 bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500/40 px-2 py-0.5 rounded-lg"
            title="Ring Right Mandir Bell (Resonant Tone)"
          >
            <span className="text-[10px] font-cinzel font-bold text-amber-300 hidden sm:inline">
              Right Bell
            </span>
            <span
              className={`text-lg sm:text-xl filter drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] ${
                ringingBell === 'right' ? 'animate-bell-swing' : 'group-hover:scale-110 transition-transform'
              }`}
            >
              🔔
            </span>
          </button>
        </div>

        {/* 4 Puzzle Selector Tabs */}
        <div className="grid grid-cols-4 gap-1 sm:gap-1.5 w-full">
          {LEVEL_TWO_PUZZLES.map((p, idx) => {
            const isActive = currentPuzzleIndex === idx;
            const isDone = completedPuzzles[idx];

            return (
              <button
                key={p.id}
                id={`puzzle-tab-${idx}`}
                onClick={() => handleSelectPuzzle(idx)}
                className={`relative py-1 px-1 sm:px-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer border text-center ${
                  isActive
                    ? 'bg-amber-900/90 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.4)] scale-101 ring-1 ring-yellow-400/60'
                    : isDone
                    ? 'bg-emerald-950/60 border-emerald-500/60 hover:bg-emerald-900/60 text-emerald-200'
                    : 'bg-black/40 border-amber-800/40 hover:bg-amber-950/50 text-amber-300/70'
                }`}
              >
                <span className="text-xs sm:text-sm">{p.icon}</span>
                <span className="text-[10px] sm:text-xs font-cinzel font-bold truncate">
                  {idx + 1}. {p.title.split(' ')[0]}
                </span>
                {isDone && (
                  <CheckCircle2 size={11} className="text-emerald-400 stroke-[3] shrink-0" />
                )}
                {isActive && (
                  <div className="absolute -bottom-0.5 w-6 h-0.5 bg-yellow-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls & Visibility Toolbar (Ghost Guide, Dual View, Full Preview, Reshuffle) */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between px-1 py-1 z-10 shrink-0 text-xs">
        {/* Progress Counters */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="bg-amber-950/80 border border-amber-500/50 px-2 sm:px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Sparkles size={12} className="text-yellow-400" />
            <span className="font-cinzel font-bold text-[10px] sm:text-xs text-amber-200">
              Pieces:{' '}
              <span className="text-yellow-400 font-mono font-black">
                {currentCorrectPieces}/{PIECES_PER_PUZZLE}
              </span>
            </span>
          </div>

          <div className="bg-amber-950/80 border border-amber-600/40 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-cinzel font-bold text-amber-300 hidden sm:flex items-center gap-1">
            <Trophy size={12} className="text-yellow-400" />
            <span>Solved: {completedPuzzlesCount}/4</span>
          </div>
        </div>

        {/* Visibility Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end">
          {/* Dual View / Single Board Toggle */}
          <button
            id="toggle-dual-view-btn"
            onClick={() => setViewMode(viewMode === 'dual' ? 'focus' : 'dual')}
            className={`px-2 py-0.5 rounded-lg border text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition active:scale-95 cursor-pointer ${
              viewMode === 'dual'
                ? 'bg-amber-700/80 border-yellow-400 text-yellow-200 shadow-[0_0_8px_rgba(250,204,21,0.3)]'
                : 'bg-amber-950/70 border-amber-600/40 text-amber-300 hover:bg-amber-900/60'
            }`}
            title="Toggle side-by-side view of the whole complete picture and interactive board"
          >
            <Split size={12} />
            <span className="hidden xs:inline">
              {viewMode === 'dual' ? 'Side-by-Side: ON' : 'Dual View'}
            </span>
          </button>

          {/* Ghost Guide Toggle (Faint target picture on tiles) */}
          <button
            id="toggle-ghost-guide-btn"
            onClick={() => setGhostGuide(!ghostGuide)}
            className={`px-2 py-0.5 rounded-lg border text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition active:scale-95 cursor-pointer ${
              ghostGuide
                ? 'bg-amber-800/80 border-amber-400 text-yellow-200 shadow-[0_0_6px_rgba(245,158,11,0.4)]'
                : 'bg-black/50 border-amber-800/40 text-amber-300/70 hover:bg-amber-950'
            }`}
            title="Toggle faint watermark of the whole puzzle directly underneath the pieces"
          >
            <Layers size={12} />
            <span>Ghost: {ghostGuide ? 'ON' : 'OFF'}</span>
          </button>

          {/* Show Tile Numbers Toggle */}
          <button
            id="toggle-grid-numbers-btn"
            onClick={() => setShowGridNumbers(!showGridNumbers)}
            className="px-1.5 sm:px-2 py-0.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-600/40 text-amber-300 text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition active:scale-95 cursor-pointer"
            title="Toggle slot numbers (1-6) on the puzzle pieces"
          >
            <span>#</span>
            <span className="hidden sm:inline">{showGridNumbers ? 'Numbers' : 'No #'}</span>
          </button>

          {/* Inspect Full Screen Artwork */}
          <button
            id="puzzle-preview-btn"
            onClick={() => setShowPreviewModal(true)}
            className="px-2 py-0.5 rounded-lg bg-amber-900/70 hover:bg-amber-800 text-amber-200 border border-amber-500/40 text-[10px] sm:text-xs font-semibold flex items-center gap-1 shadow transition active:scale-95 cursor-pointer"
            title="Inspect whole complete sacred artwork in full screen"
          >
            <Maximize2 size={12} />
            <span>Full Art</span>
          </button>

          {/* Shuffle pieces */}
          <button
            id="puzzle-shuffle-btn"
            onClick={shufflePiecesForPuzzle}
            className="p-1 sm:px-2 py-0.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-600/40 text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition active:scale-95 cursor-pointer"
            title="Reshuffle current puzzle pieces"
          >
            <Shuffle size={12} />
            <span className="hidden md:inline">Shuffle</span>
          </button>
        </div>
      </div>

      {/* Main Play Area: Adapts between Dual-View (Whole Puzzle on Left + Interactive Grid on Right) or Single-Focus View */}
      <div className="flex-1 min-h-0 w-full max-w-5xl mx-auto flex items-center justify-center p-0.5 sm:p-1 overflow-hidden z-10">
        <div
          className={`w-full h-full max-h-full flex items-center justify-center gap-2 sm:gap-4 ${
            viewMode === 'dual' ? 'flex-col md:flex-row' : 'flex-col'
          }`}
        >
          {/* PANEL 1: THE WHOLE COMPLETE PUZZLE REFERENCE (संपूर्ण चित्र) */}
          {viewMode === 'dual' && (
            <div className="flex-1 min-h-0 max-h-full w-full flex flex-col items-center justify-center animate-fade-in">
              <div className="relative w-auto h-full max-h-full aspect-[3/2] bg-[#1a0204] border-3 border-amber-400/90 rounded-xl p-1 shadow-[0_0_25px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden group">
                {/* Panel Header Pill */}
                <div className="absolute top-1.5 left-1.5 z-20 bg-black/85 backdrop-blur-sm px-2 py-0.5 rounded-md border border-amber-400/60 text-[10px] sm:text-xs font-cinzel font-bold text-yellow-300 flex items-center gap-1 shadow">
                  <Eye size={12} className="text-yellow-400" />
                  <span>WHOLE PUZZLE REFERENCE</span>
                </div>

                <div className="absolute top-1.5 right-1.5 z-20 bg-amber-950/90 px-1.5 py-0.5 rounded border border-amber-500/50 text-[9px] font-semibold text-amber-200 hidden sm:block">
                  Target / लक्ष्य
                </div>

                {/* The Complete Uncut Artwork */}
                <div className="relative w-full h-full rounded-lg overflow-hidden bg-[#2d050c]">
                  <PandalScene puzzleIndex={currentPuzzleIndex} />

                  {/* Grid Lines Overlay showing where pieces belong */}
                  {showGridNumbers && (
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 pointer-events-none border border-amber-400/20">
                      {[0, 1, 2, 3, 4, 5].map((slot) => (
                        <div
                          key={slot}
                          className="border border-dashed border-yellow-300/30 flex items-start justify-start p-1"
                        >
                          <span className="bg-black/65 text-yellow-300 text-[8px] font-mono px-1 rounded">
                            {slot + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Click to Expand Overlay */}
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Click to view full size"
                >
                  <span className="bg-amber-900/90 border border-yellow-400 text-yellow-200 text-xs font-cinzel font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                    <Maximize2 size={13} />
                    View Full Art
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* PANEL 2: THE INTERACTIVE 6-PIECE PUZZLE BOARD */}
          <div className="flex-1 min-h-0 max-h-full w-full flex flex-col items-center justify-center">
            <div className="relative w-auto h-full max-h-full aspect-[3/2] bg-[#1a0204] border-3 sm:border-4 border-amber-500/90 rounded-xl sm:rounded-2xl p-1 sm:p-2 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex flex-col overflow-hidden">
              
              {/* Header Label on Board */}
              <div className="absolute top-1.5 left-1.5 z-20 flex items-center gap-1">
                <div className="bg-black/85 backdrop-blur-sm px-2 py-0.5 rounded-md border border-amber-500/60 text-[10px] sm:text-xs font-cinzel font-bold text-amber-200 flex items-center gap-1 shadow">
                  <Sparkles size={11} className="text-yellow-400" />
                  <span>INTERACTIVE BOARD</span>
                </div>
                {isCurrentCompleted && (
                  <div className="bg-emerald-700 text-white font-cinzel font-black px-2 py-0.5 rounded-md text-[10px] shadow flex items-center gap-1 animate-pulse">
                    <CheckCircle2 size={11} />
                    <span>SOLVED!</span>
                  </div>
                )}
              </div>

              {/* Mobile Target Preview Thumbnail (Shown when Dual View is toggled off or on narrow phones) */}
              {viewMode === 'focus' && (
                <button
                  id="mobile-target-thumbnail-btn"
                  onClick={() => setShowPreviewModal(true)}
                  className="absolute top-1.5 right-1.5 z-20 bg-black/80 hover:bg-black p-0.5 rounded-md border border-amber-400/80 shadow-lg group cursor-pointer flex items-center gap-1 text-[9px] text-amber-200 px-1.5 py-0.5"
                  title="View Target Reference Image"
                >
                  <Eye size={11} className="text-yellow-400" />
                  <span className="font-bold font-cinzel">Target Reference</span>
                </button>
              )}

              {/* Underneath Ghost Guide (Faint Complete Target Image) */}
              {ghostGuide && (
                <div
                  className="absolute inset-1 sm:inset-2 rounded-lg sm:rounded-xl overflow-hidden pointer-events-none transition-opacity duration-300 z-0 opacity-35"
                  title="Ghost Guide: Target artwork underneath"
                >
                  <PandalScene puzzleIndex={currentPuzzleIndex} />
                </div>
              )}

              {/* Interactive 6-Tile Grid (3 Columns x 2 Rows) */}
              <div className="relative grid grid-cols-3 grid-rows-2 gap-1 sm:gap-2 w-full h-full z-10">
                {pieces.map((pieceId, slotIndex) => {
                  const isSelected = selectedIndex === slotIndex;
                  const isCorrect = pieceId === slotIndex;

                  return (
                    <div
                      key={slotIndex}
                      id={`puzzle-tile-${slotIndex}`}
                      onClick={() => handlePieceClick(slotIndex)}
                      draggable
                      onDragStart={() => handleDragStart(slotIndex)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(slotIndex)}
                      className={`relative rounded-lg sm:rounded-xl overflow-hidden cursor-pointer transition-all duration-150 transform border-2 ${
                        isSelected
                          ? 'border-yellow-300 scale-102 shadow-[0_0_18px_#fde047] z-30 ring-2 sm:ring-4 ring-yellow-400/70'
                          : isCorrect
                          ? 'border-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.35)] hover:border-amber-300'
                          : 'border-amber-700/60 hover:border-amber-400 hover:scale-101'
                      } ${ghostGuide ? 'bg-[#3b0712]/80' : 'bg-[#3b0712]'}`}
                    >
                      {/* SVG Slice corresponding to pieceId for currentPuzzleIndex */}
                      <div className="w-full h-full">
                        <PandalScene puzzleIndex={currentPuzzleIndex} tileIndex={pieceId} />
                      </div>

                      {/* Correct Position Badge */}
                      {isCorrect && (
                        <div className="absolute top-1 right-1 bg-emerald-600/90 text-white rounded-full p-0.5 shadow">
                          <CheckCircle2 size={12} className="stroke-[3]" />
                        </div>
                      )}

                      {/* Selection Highlight */}
                      {isSelected && (
                        <div className="absolute inset-0 border-2 border-yellow-300 bg-yellow-400/25 pointer-events-none animate-pulse" />
                      )}

                      {/* Piece Slot Number */}
                      {showGridNumbers && (
                        <div className="absolute bottom-0.5 left-0.5 bg-black/75 text-amber-200 text-[8px] sm:text-[9px] px-1 rounded font-mono">
                          Slot {slotIndex + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Hint Footer */}
      <div className="text-center text-[10px] sm:text-xs text-amber-300/80 font-medium shrink-0 pt-0.5">
        <span>💡 Tap or drag tiles to swap. Use <strong>Side-by-Side</strong> or <strong>Ghost Guide</strong> to see the whole puzzle!</span>
      </div>

      {/* FULL ARTWORK PREVIEW MODAL */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="relative w-full max-w-3xl aspect-[3/2] bg-[#1a0204] border-3 border-amber-400 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.5)] p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
              <div className="bg-black/85 px-3 py-1 rounded-full border border-amber-500/60 text-xs sm:text-sm font-cinzel font-bold text-yellow-300 flex items-center gap-2 shadow">
                <span>{activePuzzle.icon}</span>
                <span>{activePuzzle.title} ({activePuzzle.hindiTitle})</span>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="pointer-events-auto bg-amber-900/90 hover:bg-amber-800 text-amber-100 text-xs font-bold px-3 py-1 rounded-full border border-amber-400 cursor-pointer shadow transition active:scale-95"
              >
                ✕ Close Preview
              </button>
            </div>

            {/* Whole Complete Artwork */}
            <div className="w-full h-full rounded-xl overflow-hidden bg-[#2d050c] pt-7">
              <PandalScene puzzleIndex={currentPuzzleIndex} />
            </div>
          </div>
        </div>
      )}

      {/* PUZZLE SOLVED TRANSITION TOAST / MODAL */}
      {transitionState?.show && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#240407] border-3 border-yellow-400 rounded-2xl p-5 max-w-sm w-full text-center shadow-[0_0_50px_rgba(245,158,11,0.6)] flex flex-col items-center">
            <div className="text-4xl mb-2 animate-bounce">
              🔔✨
            </div>
            <h3 className="text-xl sm:text-2xl font-cinzel font-black text-yellow-300 drop-shadow">
              PUZZLE {currentPuzzleIndex + 1} SOLVED!
            </h3>
            <p className="text-sm font-semibold text-amber-100 mt-1">
              "{transitionState.solvedPuzzle.title}" ({transitionState.solvedPuzzle.hindiTitle})
            </p>
            <p className="text-xs text-amber-300/80 max-w-xs mt-2">
              The sacred temple bells ring in celebration!
            </p>

            <div className="mt-5 flex items-center gap-3">
              <button
                id="next-puzzle-proceed-btn"
                onClick={handleProceedToNext}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-cinzel font-black text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.6)] cursor-pointer transition transform active:scale-95"
              >
                <span>Continue to Puzzle {(transitionState.nextPuzzleIndex ?? 0) + 1}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
