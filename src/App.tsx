import React, { useState, useEffect, useCallback } from 'react';
import { GameScreen, PlayerAttireState } from './types';
import { sound } from './utils/audio';
import { NavbarHUD } from './components/NavbarHUD';
import { MainMenu } from './components/MainMenu';
import { IntroScreen } from './components/IntroScreen';
import { ModakSliceGame } from './components/ModakSliceGame';
import { PandalPuzzleGame } from './components/PandalPuzzleGame';
import { PujaCollectorGame } from './components/PujaCollectorGame';
import { FestivalDressUpGame } from './components/FestivalDressUpGame';
import { GaneshaDanceGame } from './components/GaneshaDanceGame';
import { CelebrationScreen } from './components/CelebrationScreen';
import { RewardScreen } from './components/RewardScreen';
import {
  PauseModal,
  LevelFailedModal,
  LevelCompleteModal,
  HowToPlayModal,
  ControlsModal,
} from './components/Modals';

const DEFAULT_ATTIRE: PlayerAttireState = {
  avatarGender: 'boy',
  costumeId: 'costume_maroon_dhoti',
  headwearId: 'headwear_puneri_feta',
  necklaceId: 'necklace_navratna_haar',
  armsId: 'arms_temple_kada',
  earringsId: 'earrings_chandbali',
  accessoryId: 'acc_aarti_thali',
  tilakId: 'tilak_chandan_kesar',
};

export default function App() {
  // Screen state
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('MENU');
  const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('ganesha_completed_levels');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Player chosen costume & jewelries state
  const [playerAttire, setPlayerAttire] = useState<PlayerAttireState>(() => {
    try {
      const saved = localStorage.getItem('ganesha_player_attire');
      return saved ? JSON.parse(saved) : DEFAULT_ATTIRE;
    } catch {
      return DEFAULT_ATTIRE;
    }
  });

  // Lives system (3 lives max)
  const [lives, setLives] = useState<number>(3);
  const [warningFlash, setWarningFlash] = useState<boolean>(false);

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sound.isEnabled());

  // Modals & Pause state
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [showLevelFailed, setShowLevelFailed] = useState<boolean>(false);
  const [showLevelComplete, setShowLevelComplete] = useState<boolean>(false);

  // HUD Dynamic Status
  const [hudObjective, setHudObjective] = useState<string>('Slice 5 Modaks');
  const [hudProgress, setHudProgress] = useState<string>('0/5');
  const [hudProgressPercent, setHudProgressPercent] = useState<number>(0);
  const [hudTimeLeft, setHudTimeLeft] = useState<number | undefined>(45);

  // Save completed levels
  useEffect(() => {
    try {
      localStorage.setItem('ganesha_completed_levels', JSON.stringify(completedLevels));
    } catch (e) {
      console.error(e);
    }
  }, [completedLevels]);

  // Save player attire
  useEffect(() => {
    try {
      localStorage.setItem('ganesha_player_attire', JSON.stringify(playerAttire));
    } catch (e) {
      console.error(e);
    }
  }, [playerAttire]);

  // Automatically switch festive background music for each level / screen
  useEffect(() => {
    sound.playTrackForLevel(currentScreen);
  }, [currentScreen]);

  // Global ESC / P pause key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'Escape' || e.key === 'p' || e.key === 'P') &&
        ['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5'].includes(currentScreen)
      ) {
        if (!showLevelComplete && !showLevelFailed) {
          setIsPaused((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen, showLevelComplete, showLevelFailed]);

  // Toggle sound
  const handleToggleSound = () => {
    const next = sound.toggleSound();
    setSoundEnabled(next);
  };

  // Lose life handler
  const handleLoseLife = useCallback(() => {
    sound.playLifeLost();
    setWarningFlash(true);
    setTimeout(() => setWarningFlash(false), 600);

    setLives((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        // Level Failed!
        setShowLevelFailed(true);
        return 0;
      }
      return next;
    });
  }, []);

  // Level Setup Helper
  const startLevel = (lvl: 1 | 2 | 3 | 4 | 5) => {
    setCurrentLevel(lvl);
    setLives(3);
    setIsPaused(false);
    setShowLevelFailed(false);
    setShowLevelComplete(false);

    if (lvl === 1) {
      setHudObjective('Slice 5 Modaks. Avoid obstacles!');
      setHudProgress('0/5');
      setHudProgressPercent(0);
      setHudTimeLeft(45);
      setCurrentScreen('LEVEL_1');
    } else if (lvl === 2) {
      setHudObjective('Solve 4 Sacred Festival Puzzles');
      setHudProgress('0/4 Puzzles');
      setHudProgressPercent(0);
      setHudTimeLeft(70);
      setCurrentScreen('LEVEL_2');
    } else if (lvl === 3) {
      setHudObjective('Collect 5 Puja items and reach finish');
      setHudProgress('0/5');
      setHudProgressPercent(0);
      setHudTimeLeft(60);
      setCurrentScreen('LEVEL_3');
    } else if (lvl === 4) {
      setHudObjective('Get Ready With Me: Adorn Bal Ganesha with Costumes & Jewelries (1-8)');
      setHudProgress('0/8 Adorned');
      setHudProgressPercent(0);
      setHudTimeLeft(undefined);
      setCurrentScreen('LEVEL_4');
    } else if (lvl === 5) {
      setHudObjective('Shankar Ji Ka Damru: Make Ganesha & Mushak Dance!');
      setHudProgress('0/25 Beats');
      setHudProgressPercent(0);
      setHudTimeLeft(75);
      setCurrentScreen('LEVEL_5');
    }
  };

  // Handle Level Completion
  const handleLevelComplete = (lvl: 1 | 2 | 3 | 4 | 5) => {
    // Unlock level in progress
    if (!completedLevels.includes(lvl)) {
      setCompletedLevels((prev) => [...prev, lvl]);
    }

    if (lvl === 1 || lvl === 2 || lvl === 3 || lvl === 4) {
      setShowLevelComplete(true);
    } else if (lvl === 5) {
      // Completed Shankar Ji Ka Damru Dance! Advance to Celebration
      setCurrentScreen('CELEBRATION');
    }
  };

  // Proceed after completion modal
  const handleNextLevelFromModal = () => {
    setShowLevelComplete(false);
    if (currentLevel === 1) {
      startLevel(2);
    } else if (currentLevel === 2) {
      startLevel(3);
    } else if (currentLevel === 3) {
      startLevel(4);
    } else if (currentLevel === 4) {
      startLevel(5);
    } else if (currentLevel === 5) {
      setCurrentScreen('CELEBRATION');
    }
  };

  // Replay Level (after fail or pause restart)
  const handleReplayCurrentLevel = () => {
    setShowLevelFailed(false);
    setIsPaused(false);
    startLevel(currentLevel);
  };

  // Return to Main Menu
  const handleReturnToMainMenu = () => {
    setIsPaused(false);
    setShowLevelFailed(false);
    setShowLevelComplete(false);
    setShowHowToPlay(false);
    setShowControls(false);
    setCurrentScreen('MENU');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#1a0204] text-amber-50 flex flex-col font-sans select-none">
      
      {/* Active Game HUD (during levels 1, 2, 3, 4, 5) */}
      {['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5'].includes(currentScreen) && (
        <NavbarHUD
          levelNumber={currentLevel}
          levelTitle={
            currentLevel === 1
              ? 'MODAK SLICE'
              : currentLevel === 2
              ? 'PANDAL PUZZLE'
              : currentLevel === 3
              ? 'PUJA COLLECTOR'
              : currentLevel === 4
              ? 'GRWM: BAL GANESHA'
              : 'DAMRU DANCE'
          }
          lives={lives}
          objectiveText={hudObjective}
          progressText={hudProgress}
          progressPercent={hudProgressPercent}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onPause={() => setIsPaused(true)}
          onOpenControls={() => setShowControls(true)}
          timeLeft={hudTimeLeft}
          warningFlash={warningFlash}
        />
      )}

      {/* Main Screen Container */}
      <main className="flex-1 w-full min-h-0 relative overflow-hidden">
        
        {/* Screen: Main Menu */}
        {currentScreen === 'MENU' && (
          <MainMenu
            onStartGame={() => setCurrentScreen('INTRO')}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
            onOpenControls={() => setShowControls(true)}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            completedLevels={completedLevels}
            onSelectLevel={(lvl) => startLevel(lvl)}
          />
        )}

        {/* Screen: Intro (5-10s) */}
        {currentScreen === 'INTRO' && (
          <IntroScreen onFinishIntro={() => startLevel(1)} />
        )}

        {/* Screen: Level 1 - Modak Slice */}
        {currentScreen === 'LEVEL_1' && (
          <ModakSliceGame
            key="level-1-game"
            onComplete={() => handleLevelComplete(1)}
            onLoseLife={handleLoseLife}
            isPaused={isPaused || showLevelFailed || showLevelComplete}
            onUpdateProgress={(sliced, target) => {
              setHudProgress(`${sliced}/${target}`);
              setHudProgressPercent((sliced / target) * 100);
            }}
            onUpdateTimeLeft={(sec) => setHudTimeLeft(sec)}
          />
        )}

        {/* Screen: Level 2 - Pandal Puzzle */}
        {currentScreen === 'LEVEL_2' && (
          <PandalPuzzleGame
            key="level-2-game"
            onComplete={() => handleLevelComplete(2)}
            onLoseLife={handleLoseLife}
            isPaused={isPaused || showLevelFailed || showLevelComplete}
            onUpdateProgress={(solved, total) => {
              setHudProgress(`${solved}/${total} Puzzles`);
              setHudProgressPercent((solved / total) * 100);
            }}
            onUpdateTimeLeft={(sec) => setHudTimeLeft(sec)}
          />
        )}

        {/* Screen: Level 3 - Puja Collector */}
        {currentScreen === 'LEVEL_3' && (
          <PujaCollectorGame
            key="level-3-game"
            onComplete={() => handleLevelComplete(3)}
            onLoseLife={handleLoseLife}
            isPaused={isPaused || showLevelFailed || showLevelComplete}
            onUpdateProgress={(collected, total) => {
              setHudProgress(`${collected}/${total}`);
              setHudProgressPercent((collected / total) * 100);
            }}
            onUpdateTimeLeft={(sec) => setHudTimeLeft(sec)}
          />
        )}

        {/* Screen: Level 4 - Festival Costume & Jewelry Selection */}
        {currentScreen === 'LEVEL_4' && (
          <FestivalDressUpGame
            key="level-4-game"
            onComplete={() => handleLevelComplete(4)}
            onLoseLife={handleLoseLife}
            isPaused={isPaused || showLevelFailed || showLevelComplete}
            playerAttire={playerAttire}
            onUpdateAttire={setPlayerAttire}
            onUpdateProgress={(done, total) => {
              setHudProgress(`${done}/${total} Adorned`);
              setHudProgressPercent((done / total) * 100);
            }}
            onUpdateTimeLeft={(sec) => setHudTimeLeft(sec)}
          />
        )}

        {/* Screen: Level 5 - Shankar Ji Ka Damru (Ganesha & Mushak Dance) */}
        {currentScreen === 'LEVEL_5' && (
          <GaneshaDanceGame
            key="level-5-game"
            onComplete={() => handleLevelComplete(5)}
            onLoseLife={handleLoseLife}
            isPaused={isPaused || showLevelFailed || showLevelComplete}
            playerAttire={playerAttire}
            onUpdateProgress={(score, target) => {
              setHudProgress(`${Math.floor(score)}/${target} Joy`);
              setHudProgressPercent((score / target) * 100);
            }}
            onUpdateTimeLeft={(sec) => setHudTimeLeft(sec)}
          />
        )}

        {/* Screen: Final Festival Celebration */}
        {currentScreen === 'CELEBRATION' && (
          <CelebrationScreen
            playerAttire={playerAttire}
            onContinueToReward={() => setCurrentScreen('REWARD')}
          />
        )}

        {/* Screen: Kaju Katli Reward */}
        {currentScreen === 'REWARD' && (
          <RewardScreen
            onPlayAgain={() => startLevel(1)}
            onMainMenu={handleReturnToMainMenu}
          />
        )}
      </main>

      {/* Overlays and Modals */}
      {/* Pause Menu Modal */}
      <PauseModal
        isOpen={isPaused}
        onResume={() => setIsPaused(false)}
        onRestartLevel={handleReplayCurrentLevel}
        onOpenControls={() => setShowControls(true)}
        onMainMenu={handleReturnToMainMenu}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Level Failed Modal (Preserves completedLevels!) */}
      <LevelFailedModal
        isOpen={showLevelFailed}
        levelNumber={currentLevel}
        onReplayLevel={handleReplayCurrentLevel}
        onMainMenu={handleReturnToMainMenu}
      />

      {/* Level Complete Modal */}
      <LevelCompleteModal
        isOpen={showLevelComplete}
        levelNumber={currentLevel}
        title={
          currentLevel === 1
            ? 'Modaks Sliced with Devotion! Ready for the Pandal Puzzle.'
            : currentLevel === 2
            ? 'Festival Pandal Assembled! Ready for the Puja Collector.'
            : currentLevel === 3
            ? 'Puja Offerings Gathered! Ready for Get Ready With Me with Bal Ganesha.'
            : currentLevel === 4
            ? 'Bal Ganesha is Radiantly Adorned! Ready for Shankar Ji Ka Damru Dance.'
            : 'Divine Damru Dance Mastered! Enter the Grand Aarti Festival Celebration.'
        }
        onNext={handleNextLevelFromModal}
      />

      {/* How to Play Modal */}
      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />

      {/* Controls Modal */}
      <ControlsModal
        isOpen={showControls}
        onClose={() => setShowControls(false)}
      />
    </div>
  );
}

