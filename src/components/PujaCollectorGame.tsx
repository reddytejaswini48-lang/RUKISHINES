import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../utils/audio';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';

interface PujaCollectorGameProps {
  onComplete: () => void;
  onLoseLife: () => void;
  isPaused: boolean;
  onUpdateProgress: (collected: number, total: number) => void;
  onUpdateTimeLeft: (seconds: number) => void;
}

interface RunnerItem {
  id: number;
  type: 'ITEM';
  itemName: string;
  itemIcon: string;
  lane: 0 | 1 | 2; // 0: Left, 1: Center, 2: Right
  z: number; // distance from player (starts at 1000, player is at 50)
  collected: boolean;
}

interface RunnerObstacle {
  id: number;
  type: 'BOX' | 'GATE' | 'BARRIER' | 'URN';
  lane: 0 | 1 | 2;
  z: number;
  hit: boolean;
  dodgedLogged?: boolean;
}

interface RunnerBonus {
  id: number;
  lane: 0 | 1 | 2;
  z: number;
  type: 'FLOWER' | 'MODAK';
  y: number; // 0 for ground, 50 for airborne
  collected: boolean;
}

interface FloatingMessage {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

const TARGET_ITEMS = 5;
const LEVEL_TIME = 65; // 65 seconds generous time

const SACRED_ITEMS = [
  { name: 'Durva Grass', icon: '🌿', color: '#4ade80' },
  { name: 'Red Hibiscus', icon: '🌺', color: '#f43f5e' },
  { name: 'Brass Diya', icon: '🪔', color: '#f59e0b' },
  { name: 'Holy Kalash', icon: '🥥', color: '#fb923c' },
  { name: 'Golden Modak', icon: '🥟', color: '#facc15' },
];

export const PujaCollectorGame: React.FC<PujaCollectorGameProps> = ({
  onComplete,
  onLoseLife,
  isPaused,
  onUpdateProgress,
  onUpdateTimeLeft,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [collectedCount, setCollectedCount] = useState<number>(0);
  const [collectedItems, setCollectedItems] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(LEVEL_TIME);
  const [finishVisible, setFinishVisible] = useState<boolean>(false);
  const [speedPace, setSpeedPace] = useState<'slow' | 'medium' | 'fast'>('slow');
  const speedPaceRef = useRef<'slow' | 'medium' | 'fast'>('slow');

  // Mutable Game State in Ref for 60fps RequestAnimationFrame
  const stateRef = useRef({
    lane: 1 as 0 | 1 | 2, // 0: left, 1: center, 2: right
    targetLane: 1 as 0 | 1 | 2,
    playerX: 0, // smoothed position
    playerY: 0, // jump height (0 = ground)
    jumpVelocity: 0,
    isJumping: false,
    isSliding: false,
    slideTimer: 0,
    invincibleTimer: 0,
    speed: 4.2, // Starts VERY SLOW for gentle learning, gradually accelerates up to 10.8 (little fast)
    distanceTraveled: 0,
    itemsCollected: 0,
    items: [] as RunnerItem[],
    obstacles: [] as RunnerObstacle[],
    bonuses: [] as RunnerBonus[],
    floatingMessages: [] as FloatingMessage[],
    particles: [] as any[],
    pandalGateZ: 999999, // approaches when 5 items collected
    finished: false,
    screenShake: 0,
    isPaused: false,
    idCounter: 1000,
  });

  useEffect(() => {
    stateRef.current.isPaused = isPaused;
  }, [isPaused]);

  // Generate continuous procedural course of obstacles & sacred items
  useEffect(() => {
    const items: RunnerItem[] = [];
    const obstacles: RunnerObstacle[] = [];
    const bonuses: RunnerBonus[] = [];

    // 5 Sacred Items spaced across the festival procession
    const itemDistances = [480, 1350, 2250, 3150, 4050];
    const itemLanes: (0 | 1 | 2)[] = [1, 0, 2, 1, 2];

    itemDistances.forEach((z, idx) => {
      items.push({
        id: idx + 1,
        type: 'ITEM',
        itemName: SACRED_ITEMS[idx].name,
        itemIcon: SACRED_ITEMS[idx].icon,
        lane: itemLanes[idx],
        z,
        collected: false,
      });
    });

    // Procedurally generate continuous obstacles from z = 320 to z = 20,000
    const obstacleTypes: RunnerObstacle['type'][] = [
      'BOX', // Jump over or steer
      'GATE', // Slide under or steer
      'BARRIER', // Steer around
      'URN', // Steer around
      'BOX',
      'GATE',
    ];

    let currentZ = 320;
    let obsId = 100;
    let bonusId = 500;

    while (currentZ < 20000) {
      // Check if near any sacred item; if so, leave a clear 180 unit safety buffer!
      const isNearItem = items.some((it) => Math.abs(it.z - currentZ) < 180);

      if (!isNearItem) {
        // Decide 1 or 2 obstacles at this Z (never block all 3 lanes!)
        const placeTwo = Math.random() < 0.28;
        const primaryLane: 0 | 1 | 2 = Math.floor(Math.random() * 3) as 0 | 1 | 2;
        const type1 =
          obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

        obstacles.push({
          id: obsId++,
          type: type1,
          lane: primaryLane,
          z: currentZ,
          hit: false,
        });

        // Add bonus flower right above boxes so jumping scoops them up!
        if (type1 === 'BOX' && Math.random() < 0.8) {
          bonuses.push({
            id: bonusId++,
            lane: primaryLane,
            z: currentZ,
            type: 'FLOWER',
            y: 50, // airborne
            collected: false,
          });
        }

        // Add bonus modak right under gates so sliding scoops them up!
        if (type1 === 'GATE' && Math.random() < 0.8) {
          bonuses.push({
            id: bonusId++,
            lane: primaryLane,
            z: currentZ,
            type: 'MODAK',
            y: 0, // low
            collected: false,
          });
        }

        if (placeTwo) {
          const otherLanes = ([0, 1, 2] as (0 | 1 | 2)[]).filter(
            (l) => l !== primaryLane
          );
          const secondLane =
            otherLanes[Math.floor(Math.random() * otherLanes.length)];
          const type2 =
            obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

          obstacles.push({
            id: obsId++,
            type: type2,
            lane: secondLane,
            z: currentZ,
            hit: false,
          });
        }
      }

      currentZ += 280 + Math.floor(Math.random() * 140);
    }

    stateRef.current.items = items;
    stateRef.current.obstacles = obstacles;
    stateRef.current.bonuses = bonuses;
    stateRef.current.itemsCollected = 0;
    stateRef.current.distanceTraveled = 0;
  }, []);

  // Level Countdown Timer
  useEffect(() => {
    if (isPaused || stateRef.current.finished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        onUpdateTimeLeft(next);
        if (next <= 0 && stateRef.current.itemsCollected < TARGET_ITEMS) {
          clearInterval(timer);
          onLoseLife();
        }
        return Math.max(0, next);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, onLoseLife, onUpdateTimeLeft]);

  // Actions: Move Left, Move Right, Jump, Slide
  const moveLeft = useCallback(() => {
    if (stateRef.current.targetLane > 0) {
      sound.playClick();
      stateRef.current.targetLane = (stateRef.current.targetLane - 1) as 0 | 1 | 2;
    }
  }, []);

  const moveRight = useCallback(() => {
    if (stateRef.current.targetLane < 2) {
      sound.playClick();
      stateRef.current.targetLane = (stateRef.current.targetLane + 1) as 0 | 1 | 2;
    }
  }, []);

  const jump = useCallback(() => {
    if (!stateRef.current.isJumping && !stateRef.current.isSliding) {
      sound.playJump();
      stateRef.current.isJumping = true;
      stateRef.current.jumpVelocity = 14;
    }
  }, []);

  const slide = useCallback(() => {
    if (!stateRef.current.isJumping && !stateRef.current.isSliding) {
      sound.playSlide();
      stateRef.current.isSliding = true;
      stateRef.current.slideTimer = 28; // ~0.5 second slide
    }
  }, []);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stateRef.current.isPaused) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          moveLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          moveRight();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
          e.preventDefault();
          jump();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          slide();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveLeft, moveRight, jump, slide]);

  // Touch Swipe Gesture Controls
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 25) {
      if (absX > absY) {
        if (dx > 0) moveRight();
        else moveLeft();
      } else {
        if (dy < 0) jump();
        else slide();
      }
    }
    touchStartRef.current = null;
  };

  // Main 2.5D Runner Render Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      if (!stateRef.current.isPaused) {
        const state = stateRef.current;
        const w = canvas.width;
        const h = canvas.height;

        // Dynamic Speed Progression: Starts very slow (~4.2), then gradually speeds up to little fast (~10.8)
        const distProgress = Math.min(1, state.distanceTraveled / 3600);
        const itemProgress = Math.min(1, state.itemsCollected / TARGET_ITEMS);
        const targetSpeed = 4.2 + (distProgress * 4.2) + (itemProgress * 2.4);
        state.speed += (targetSpeed - state.speed) * 0.02;

        // Keep pace state updated for HUD badge (only triggers re-render on tier boundary)
        const newPace: 'slow' | 'medium' | 'fast' =
          state.speed < 6.0 ? 'slow' : state.speed < 8.5 ? 'medium' : 'fast';
        if (newPace !== speedPaceRef.current) {
          speedPaceRef.current = newPace;
          setSpeedPace(newPace);
        }

        // 1. Advance distance
        state.distanceTraveled += state.speed;

        // Smooth lane change
        const targetX = (state.targetLane - 1) * 160;
        state.playerX += (targetX - state.playerX) * 0.22;

        // Jump physics
        if (state.isJumping) {
          state.playerY += state.jumpVelocity;
          state.jumpVelocity -= 0.8; // gravity
          if (state.playerY <= 0) {
            state.playerY = 0;
            state.isJumping = false;
            state.jumpVelocity = 0;
          }
        }

        // Slide timer
        if (state.isSliding) {
          state.slideTimer--;
          if (state.slideTimer <= 0) {
            state.isSliding = false;
          }
        }

        // Invincibility cooldown
        if (state.invincibleTimer > 0) {
          state.invincibleTimer--;
        }

        // Check if finished pandal entrance reached
        if (state.itemsCollected >= TARGET_ITEMS && state.pandalGateZ === 999999) {
          state.pandalGateZ = state.distanceTraveled + 600;
          setFinishVisible(true);
        }

        if (state.pandalGateZ <= state.distanceTraveled && !state.finished) {
          state.finished = true;
          sound.playLevelComplete();
          setTimeout(() => {
            onComplete();
          }, 800);
        }

        // 2. Clear canvas with screen shake
        ctx.save();
        if (state.screenShake > 0) {
          const sx = (Math.random() - 0.5) * state.screenShake;
          const sy = (Math.random() - 0.5) * state.screenShake;
          ctx.translate(sx, sy);
          state.screenShake = Math.max(0, state.screenShake - 1);
        }

        ctx.clearRect(0, 0, w, h);

        // 3. Draw Background & Festival Street with 2.5D Perspective
        const horizonY = h * 0.42;

        // Twilight Festive Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGrad.addColorStop(0, '#1c0307');
        skyGrad.addColorStop(0.5, '#3e0610');
        skyGrad.addColorStop(1, '#66101f');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, horizonY);

        // Festival Fairy Lights & Star Sparkles
        for (let i = 0; i < 15; i++) {
          const starX = (w * ((i * 37) % 100)) / 100;
          const starY = (horizonY * ((i * 23) % 80)) / 100;
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(starX, starY, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Grand Illuminated Ganesha Pandal at the Horizon Center
        const pandalScale = Math.min(
          1.8,
          0.8 + (state.distanceTraveled / 4000) * 0.8
        );
        ctx.save();
        ctx.translate(w / 2, horizonY - 10);
        ctx.scale(pandalScale, pandalScale);
        drawHorizonPandal(ctx);
        ctx.restore();

        // 4. Paved Festival Street & 3 Lanes
        const streetGrad = ctx.createLinearGradient(0, horizonY, 0, h);
        streetGrad.addColorStop(0, '#4a0812');
        streetGrad.addColorStop(0.4, '#781525');
        streetGrad.addColorStop(1, '#3b060f');
        ctx.fillStyle = streetGrad;
        ctx.fillRect(0, horizonY, w, h - horizonY);

        // Perspective Road Polygon
        const topRoadWidth = w * 0.22;
        const bottomRoadWidth = w * 0.85;
        const roadLeftTop = (w - topRoadWidth) / 2;
        const roadRightTop = (w + topRoadWidth) / 2;
        const roadLeftBottom = (w - bottomRoadWidth) / 2;
        const roadRightBottom = (w + bottomRoadWidth) / 2;

        // Street pavement with gold trim
        ctx.fillStyle = '#5c0d1b';
        ctx.beginPath();
        ctx.moveTo(roadLeftTop, horizonY);
        ctx.lineTo(roadRightTop, horizonY);
        ctx.lineTo(roadRightBottom, h);
        ctx.lineTo(roadLeftBottom, h);
        ctx.closePath();
        ctx.fill();

        // Gold border rails
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Lane divider dashed lines (rushing backward)
        const offset = (state.distanceTraveled % 120);
        for (let laneDiv = 1; laneDiv <= 2; laneDiv++) {
          const ratio = laneDiv / 3;
          const topX = roadLeftTop + topRoadWidth * ratio;
          const botX = roadLeftBottom + bottomRoadWidth * ratio;

          ctx.save();
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([25, 20]);
          ctx.lineDashOffset = -offset;
          ctx.beginPath();
          ctx.moveTo(topX, horizonY);
          ctx.lineTo(botX, h);
          ctx.stroke();
          ctx.restore();
        }

        // Animated Diyas lining the sidewalks
        const diyaCount = 8;
        for (let i = 0; i < diyaCount; i++) {
          const dProgress = ((state.distanceTraveled * 0.5 + i * 150) % 1200) / 1200;
          const diyaY = horizonY + (h - horizonY) * dProgress;
          const tWidth = topRoadWidth + (bottomRoadWidth - topRoadWidth) * dProgress;
          const diyaLeftX = (w - tWidth) / 2 - 25 * dProgress;
          const diyaRightX = (w + tWidth) / 2 + 25 * dProgress;

          drawSidewalkDiya(ctx, diyaLeftX, diyaY, dProgress);
          drawSidewalkDiya(ctx, diyaRightX, diyaY, dProgress);
        }

        // Dynamic Fast Speed Streaks / Festival Rush Wind Lines
        if (state.speed > 6.8) {
          const streakAlpha = Math.min(0.45, ((state.speed - 6.8) / 4.0) * 0.45);
          ctx.save();
          ctx.strokeStyle = `rgba(254, 240, 138, ${streakAlpha})`;
          ctx.lineWidth = 1.8;
          ctx.setLineDash([40, 120]);
          ctx.lineDashOffset = -(state.distanceTraveled * 2.2);

          for (let laneIdx = 0; laneIdx < 3; laneIdx++) {
            const ratio = (laneIdx + 0.5) / 3;
            const topX = roadLeftTop + topRoadWidth * ratio;
            const botX = roadLeftBottom + bottomRoadWidth * ratio;
            ctx.beginPath();
            ctx.moveTo(topX, horizonY + 20);
            ctx.lineTo(botX, h);
            ctx.stroke();
          }
          ctx.restore();
        }

        // 5. Draw Obstacles, Items, & Bonuses Sorted by Z-distance (back to front)
        const renderQueue: any[] = [];

        // Check if an uncollected sacred item was missed behind player, respawn ahead smoothly!
        state.items.forEach((it) => {
          if (!it.collected && (it.z - state.distanceTraveled) < -90) {
            it.z = state.distanceTraveled + 850 + Math.random() * 250;
            it.lane = Math.floor(Math.random() * 3) as 0 | 1 | 2;
          }
        });

        // Add Items
        state.items.forEach((item) => {
          const relZ = item.z - state.distanceTraveled;
          if (relZ > -50 && relZ < 1400) {
            renderQueue.push({ type: 'ITEM', obj: item, relZ });
          }
        });

        // Add Obstacles
        state.obstacles.forEach((obs) => {
          const relZ = obs.z - state.distanceTraveled;
          if (relZ > -50 && relZ < 1400) {
            renderQueue.push({ type: 'OBSTACLE', obj: obs, relZ });
          }
        });

        // Add Bonuses
        state.bonuses.forEach((b) => {
          if (b.collected) return;
          const relZ = b.z - state.distanceTraveled;
          if (relZ > -50 && relZ < 1400) {
            renderQueue.push({ type: 'BONUS', obj: b, relZ });
          }
        });

        // Add Finish Gate if in range
        if (state.pandalGateZ !== 999999) {
          const relZ = state.pandalGateZ - state.distanceTraveled;
          if (relZ > -50 && relZ < 1400) {
            renderQueue.push({ type: 'GATEWAY', relZ });
          }
        }

        // Sort descending (farthest first)
        renderQueue.sort((a, b) => b.relZ - a.relZ);

        // Render objects in 2.5D
        renderQueue.forEach((item) => {
          const relZ = item.relZ;
          const depthProgress = Math.max(0, 1 - relZ / 1400); // 0 at horizon, 1 at player
          const screenY = horizonY + (h - horizonY) * Math.pow(depthProgress, 1.4);
          const currentRoadW = topRoadWidth + (bottomRoadWidth - topRoadWidth) * depthProgress;
          const laneOffset = ((item.obj?.lane ?? 1) - 1) * (currentRoadW / 3);
          const screenX = w / 2 + laneOffset;
          const scale = 0.3 + depthProgress * 1.1;

          if (item.type === 'ITEM') {
            drawPujaItem(ctx, item.obj, screenX, screenY, scale);
            // Collision check with player
            if (!item.obj.collected && relZ < 100 && relZ > 10) {
              if (item.obj.lane === state.targetLane) {
                // Collect item!
                item.obj.collected = true;
                sound.playCollect();

                const newCount = state.itemsCollected + 1;
                state.itemsCollected = newCount;
                setCollectedCount(newCount);
                setCollectedItems((prev) => [...prev, item.obj.itemName]);
                onUpdateProgress(newCount, TARGET_ITEMS);

                state.floatingMessages.push({
                  id: state.idCounter++,
                  text: `🎉 ${item.obj.itemName}! (${newCount}/5)`,
                  x: screenX,
                  y: screenY - 50,
                  color: '#fef08a',
                  alpha: 1,
                  life: 0,
                  maxLife: 45,
                });

                // Sparkle burst
                for (let i = 0; i < 24; i++) {
                  state.particles.push({
                    x: screenX,
                    y: screenY,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6 - 3,
                    color: '#fde047',
                    size: 3 + Math.random() * 4,
                    life: 0,
                    maxLife: 28,
                  });
                }
              }
            }
          } else if (item.type === 'BONUS') {
            drawRunnerBonus(ctx, item.obj, screenX, screenY, scale);
            if (!item.obj.collected && relZ < 85 && relZ > 10) {
              if (item.obj.lane === state.targetLane) {
                const isAirborne = item.obj.y > 20;
                const canReach = isAirborne ? state.playerY > 20 : true;
                if (canReach) {
                  item.obj.collected = true;
                  sound.playCollect();

                  state.floatingMessages.push({
                    id: state.idCounter++,
                    text:
                      item.obj.type === 'FLOWER'
                        ? '🌸 BLESSING! +25'
                        : '🥟 MODAK! +50',
                    x: screenX,
                    y: screenY - 30,
                    color: item.obj.type === 'FLOWER' ? '#fb7185' : '#facc15',
                    alpha: 1,
                    life: 0,
                    maxLife: 35,
                  });

                  for (let i = 0; i < 12; i++) {
                    state.particles.push({
                      x: screenX,
                      y: screenY - (isAirborne ? 25 : 0),
                      vx: (Math.random() - 0.5) * 4,
                      vy: (Math.random() - 0.5) * 4 - 2,
                      color:
                        item.obj.type === 'FLOWER' ? '#f43f5e' : '#fde047',
                      size: 3 + Math.random() * 3,
                      life: 0,
                      maxLife: 22,
                    });
                  }
                }
              }
            }
          } else if (item.type === 'OBSTACLE') {
            drawRunnerObstacle(ctx, item.obj, screenX, screenY, scale);
            // Collision check
            if (!item.obj.hit && relZ < 80 && relZ > 15) {
              if (item.obj.lane === state.targetLane && state.invincibleTimer === 0) {
                let dodged = false;
                if (item.obj.type === 'BOX' && state.playerY > 26) {
                  dodged = true; // jumped over box!
                  if (!item.obj.dodgedLogged) {
                    item.obj.dodgedLogged = true;
                    state.floatingMessages.push({
                      id: state.idCounter++,
                      text: '✨ JUMPED OVER! +50',
                      x: screenX,
                      y: screenY - 45,
                      color: '#fde047',
                      alpha: 1,
                      life: 0,
                      maxLife: 35,
                    });
                  }
                } else if (item.obj.type === 'GATE' && state.isSliding) {
                  dodged = true; // slid under gate!
                  if (!item.obj.dodgedLogged) {
                    item.obj.dodgedLogged = true;
                    state.floatingMessages.push({
                      id: state.idCounter++,
                      text: '✨ SLID UNDER! +50',
                      x: screenX,
                      y: screenY - 35,
                      color: '#fb923c',
                      alpha: 1,
                      life: 0,
                      maxLife: 35,
                    });
                  }
                }

                if (!dodged) {
                  // Hit!
                  item.obj.hit = true;
                  sound.playObstacleHit();
                  state.screenShake = 14;
                  state.invincibleTimer = 60; // 1 second invulnerability
                  onLoseLife();
                }
              }
            }
          } else if (item.type === 'GATEWAY') {
            drawFinishGateway(ctx, w / 2, screenY, scale);
          }
        });

        // 6. Draw Player Character in Foreground
        const playerScreenX = w / 2 + state.playerX;
        const playerScreenY = h * 0.85 - state.playerY;
        const isBlinking = state.invincibleTimer > 0 && Math.floor(state.invincibleTimer / 4) % 2 === 0;

        if (!isBlinking) {
          drawPlayerCharacter(
            ctx,
            playerScreenX,
            playerScreenY,
            state.isJumping,
            state.isSliding,
            state.distanceTraveled
          );
        }

        // 7. Update & Draw Floating Messages
        for (let i = state.floatingMessages.length - 1; i >= 0; i--) {
          const fm = state.floatingMessages[i];
          fm.y -= 1.2;
          fm.life++;
          fm.alpha = Math.max(0, 1 - fm.life / fm.maxLife);

          ctx.save();
          ctx.globalAlpha = fm.alpha;
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 8;
          ctx.fillStyle = fm.color;
          ctx.font = `bold 16px 'Cinzel', serif, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(fm.text, fm.x, fm.y);
          ctx.restore();

          if (fm.life >= fm.maxLife) {
            state.floatingMessages.splice(i, 1);
          }
        }

        // 7. Update & Draw Particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
          const alpha = 1 - p.life / p.maxLife;

          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          if (p.life >= p.maxLife) {
            state.particles.splice(i, 1);
          }
        }
        ctx.globalAlpha = 1;

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [onComplete, onLoseLife, onUpdateProgress]);

  // Helper Drawing Functions
  const drawHorizonPandal = (ctx: CanvasRenderingContext2D) => {
    // Grand Golden Pandal Arch at the horizon
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, -25, 45, Math.PI, 0);
    ctx.lineTo(45, 0);
    ctx.lineTo(-45, 0);
    ctx.closePath();
    ctx.fill();

    // Inner arch
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(0, -20, 32, Math.PI, 0);
    ctx.lineTo(32, 0);
    ctx.lineTo(-32, 0);
    ctx.closePath();
    ctx.fill();

    // Divine golden Ganesha silhouette glowing inside
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(0, -18, 12, 0, Math.PI * 2);
    ctx.fill();

    // Glowing halo
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const drawSidewalkDiya = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * 0.9, scale * 0.9);

    // Brass bowl
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(0, 5, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flame
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.quadraticCurveTo(-4, 0, 0, 4);
    ctx.quadraticCurveTo(4, 0, 0, -8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawPujaItem = (
    ctx: CanvasRenderingContext2D,
    item: RunnerItem,
    x: number,
    y: number,
    scale: number
  ) => {
    if (item.collected) return;
    ctx.save();
    ctx.translate(x, y - 25 * scale);
    ctx.scale(scale, scale);

    // Divine Sky Pillar Light Ray
    const rayGrad = ctx.createLinearGradient(0, -180, 0, 0);
    rayGrad.addColorStop(0, 'rgba(253, 224, 71, 0)');
    rayGrad.addColorStop(0.7, 'rgba(253, 224, 71, 0.18)');
    rayGrad.addColorStop(1, 'rgba(251, 191, 36, 0.45)');
    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(-18, -180);
    ctx.lineTo(18, -180);
    ctx.lineTo(26, 0);
    ctx.lineTo(-26, 0);
    ctx.closePath();
    ctx.fill();

    // Floating bob
    const bob = Math.sin(Date.now() * 0.006 + item.id) * 6;
    ctx.translate(0, bob);

    // Golden Aura Pulsing Circle
    const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.12;
    ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
    ctx.beginPath();
    ctx.arc(0, 0, 26 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Rotating mini stars around sacred offering
    const rot = Date.now() * 0.003;
    for (let i = 0; i < 3; i++) {
      const angle = rot + (i * Math.PI * 2) / 3;
      const sx = Math.cos(angle) * 32;
      const sy = Math.sin(angle) * 32;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Emoji icon
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.itemIcon, 0, 2);

    // Sacred Item Label Pill
    ctx.fillStyle = 'rgba(120, 53, 15, 0.9)';
    ctx.beginPath();
    ctx.roundRect(-36, 30, 72, 18, 9);
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(item.itemName, 0, 39);

    ctx.restore();
  };

  const drawRunnerBonus = (
    ctx: CanvasRenderingContext2D,
    bonus: RunnerBonus,
    x: number,
    y: number,
    scale: number
  ) => {
    if (bonus.collected) return;
    ctx.save();
    ctx.translate(x, y - (15 + bonus.y) * scale);
    ctx.scale(scale * 0.85, scale * 0.85);

    // Gentle floating bob
    const bob = Math.sin(Date.now() * 0.008 + bonus.id) * 4;
    ctx.translate(0, bob);

    if (bonus.type === 'FLOWER') {
      // Golden Marigold Flower Blessing
      ctx.fillStyle = 'rgba(251, 146, 60, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      // Petals
      ctx.fillStyle = '#f97316';
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * 9, Math.sin(ang) * 9, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Miniature Golden Modak
      ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      // Golden Modak teardrop
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.quadraticCurveTo(12, -2, 9, 10);
      ctx.quadraticCurveTo(0, 14, -9, 10);
      ctx.quadraticCurveTo(-12, -2, 0, -14);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Top pinch
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(0, -12, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawRunnerObstacle = (
    ctx: CanvasRenderingContext2D,
    obs: RunnerObstacle,
    x: number,
    y: number,
    scale: number
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    if (obs.type === 'BOX') {
      // Decorative Festive Sweet Chest / Box (Requires Jump!)
      // Box Body
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(-24, -34, 48, 34, 4);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Brass corner protectors
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-24, -34, 6, 6);
      ctx.fillRect(18, -34, 6, 6);
      ctx.fillRect(-24, -6, 6, 6);
      ctx.fillRect(18, -6, 6, 6);

      // Saffron & Gold gift ribbons
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-5, -34, 10, 34);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-2, -34, 4, 34);

      // Prominent Glowing JUMP Badge
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.roundRect(-22, -26, 44, 18, 4);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('▲ JUMP ▲', 0, -17);
    } else if (obs.type === 'GATE') {
      // Overhead Festive Toran Arch Gate (Requires Slide!)
      // Wooden Side posts
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-34, -72, 8, 72);
      ctx.fillRect(26, -72, 8, 72);

      // Gold base shoes
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-37, -6, 14, 6);
      ctx.fillRect(23, -6, 14, 6);

      // High floral garland crossbar
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.roundRect(-38, -74, 76, 20, 5);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Hanging marigold floral tassels
      ctx.fillStyle = '#fbbf24';
      for (let i = -30; i <= 30; i += 10) {
        ctx.beginPath();
        ctx.arc(i, -64, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ea580c';
      for (let i = -25; i <= 25; i += 10) {
        ctx.beginPath();
        ctx.arc(i, -53, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Prominent Glowing SLIDE Badge
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.roundRect(-24, -45, 48, 17, 4);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('▼ SLIDE ▼', 0, -36);
    } else if (obs.type === 'URN') {
      // Sacred Festival Kalash / Brass Pot (Requires Steering/Dodge!)
      ctx.fillStyle = '#b45309';
      // Base
      ctx.beginPath();
      ctx.ellipse(0, -4, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pot Belly
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(0, -20, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sacred red ribbon on pot
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-18, -23, 36, 6);

      // Mango leaves around rim
      ctx.fillStyle = '#16a34a';
      for (let ang = -0.7; ang <= 0.7; ang += 0.35) {
        const lx = Math.sin(ang) * 16;
        const ly = -38 - Math.cos(ang) * 10;
        ctx.beginPath();
        ctx.ellipse(lx, ly, 4, 10, ang, 0, Math.PI * 2);
        ctx.fill();
      }

      // Coconut on top
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(0, -42, 9, 0, Math.PI * 2);
      ctx.fill();

      // DODGE badge
      ctx.fillStyle = '#450a0a';
      ctx.beginPath();
      ctx.roundRect(-24, -14, 48, 16, 4);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#fca5a5';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('◄ DODGE ►', 0, -6);
    } else {
      // Brass Festival Aarti Cart Barrier (Requires Steering/Dodge!)
      // Cart Table top
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(-28, -36, 56, 12);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.strokeRect(-28, -36, 56, 12);

      // Table legs
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-24, -24, 6, 24);
      ctx.fillRect(18, -24, 6, 24);

      // Burning Diyas on table
      for (let dx = -20; dx <= 20; dx += 20) {
        // Diya dish
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(dx, -36, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Flickering flame
        const flameH = 7 + (Math.sin(Date.now() * 0.02 + dx) + 1) * 2;
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.moveTo(dx, -38);
        ctx.quadraticCurveTo(dx - 3, -38 - flameH * 0.5, dx, -38 - flameH);
        ctx.quadraticCurveTo(dx + 3, -38 - flameH * 0.5, dx, -38);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(dx, -39 - flameH * 0.3, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Red ceremonial banner
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(-28, -24, 56, 10);

      // DODGE text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('◄ DODGE ►', 0, -19);
    }

    ctx.restore();
  };

  const drawFinishGateway = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * 1.6, scale * 1.6);

    // Grand Golden Toran Archway
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-90, -120, 180, 25);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.strokeRect(-90, -120, 180, 25);

    // Pillars
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-85, -95, 18, 95);
    ctx.fillRect(67, -95, 18, 95);

    // Banner Text
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 13px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 GRAND PANDAL ENTRANCE 🎉', 0, -103);

    ctx.restore();
  };

  const drawPlayerCharacter = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isJumping: boolean,
    isSliding: boolean,
    dist: number
  ) => {
    ctx.save();
    ctx.translate(x, y);

    // Shadow on the ground
    const shadowScale = isJumping ? 0.6 : 1;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 5, 24 * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isSliding) {
      // Sliding low to ground
      ctx.fillStyle = '#ea580c'; // Saffron Kurta
      ctx.beginPath();
      ctx.ellipse(0, -12, 22, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(14, -14, 8, 0, Math.PI * 2);
      ctx.fill();

      // Brass Puja Thali
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(18, -10, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Upright Running Devotee
      const runBob = isJumping ? 0 : Math.sin(dist * 0.15) * 4;
      ctx.translate(0, runBob);

      // Legs / Dhoti
      ctx.fillStyle = '#991b1b';
      const legOffset = Math.sin(dist * 0.18) * 8;
      ctx.fillRect(-10, -22, 7, 22 + (isJumping ? -4 : legOffset));
      ctx.fillRect(3, -22, 7, 22 + (isJumping ? -4 : -legOffset));

      // Royal Saffron Kurta
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.roundRect(-14, -52, 28, 32, 6);
      ctx.fill();

      // Golden Sash
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-14, -36, 28, 6);

      // Devotee Head & Tilak
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -62, 11, 0, Math.PI * 2);
      ctx.fill();
      // Red Tilak
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, -63, 2, 0, Math.PI * 2);
      ctx.fill();

      // Holding Gleaming Golden Puja Thali (Plate) in front
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(0, -42, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Flower & Diya on Thali
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(-4, -43, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(4, -44, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none bg-[#1a0204]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
    >
      {/* 2.5D Perspective Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />

      {/* Top Banner Objective Pill */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none z-20">
        <div className="bg-amber-950/90 border border-amber-500/60 px-5 py-2 rounded-full backdrop-blur-md shadow-xl text-center flex items-center gap-3">
          <span className="text-yellow-400 font-cinzel font-black text-xs sm:text-sm">
            PUJA ITEMS: {collectedCount} / {TARGET_ITEMS}
          </span>
          <div className="flex gap-1">
            {SACRED_ITEMS.map((item, idx) => {
              const isDone = idx < collectedCount;
              return (
                <span
                  key={idx}
                  className={`text-base sm:text-lg transition-transform ${
                    isDone ? 'scale-120 drop-shadow-[0_0_6px_#fde047]' : 'opacity-30 grayscale'
                  }`}
                  title={item.name}
                >
                  {item.icon}
                </span>
              );
            })}
          </div>

          <div className="h-4 w-px bg-amber-500/40 mx-1 hidden sm:block" />

          {/* Dynamic Speed Progression Badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
              speedPace === 'slow'
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50'
                : speedPace === 'medium'
                ? 'bg-amber-900/70 text-amber-300 border-amber-500/50'
                : 'bg-rose-950/80 text-rose-300 border-rose-500/60 animate-pulse'
            }`}
          >
            <span>
              {speedPace === 'slow'
                ? '🐢 Pace: Very Slow'
                : speedPace === 'medium'
                ? '🏃 Pace: Accelerating'
                : '⚡ Pace: Fast Rush!'}
            </span>
          </div>
        </div>

        {/* Mobile-only compact pace pill */}
        <div
          className={`sm:hidden flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold border shadow-md transition-colors ${
            speedPace === 'slow'
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
              : speedPace === 'medium'
              ? 'bg-amber-900/80 text-amber-300 border-amber-500/50'
              : 'bg-rose-950/85 text-rose-300 border-rose-500/60 animate-pulse'
          }`}
        >
          <span>
            {speedPace === 'slow'
              ? '🐢 Pace: Very Slow'
              : speedPace === 'medium'
              ? '🏃 Pace: Accelerating'
              : '⚡ Pace: Fast Rush!'}
          </span>
        </div>
      </div>

      {/* Finish Gateway approaching notice */}
      {finishVisible && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-maroon-950 font-cinzel font-black px-6 py-1.5 rounded-full shadow-2xl z-20 animate-bounce text-xs sm:text-sm">
          🎉 ALL 5 COLLECTED! REACH THE PANDAL GATE! 🎉
        </div>
      )}

      {/* On-Screen Touch Controls (Mobile Friendly!) */}
      <div className="absolute bottom-4 inset-x-4 flex justify-between items-end pointer-events-none z-20 max-w-lg mx-auto">
        {/* Left & Right Steering */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            id="runner-left-btn"
            onClick={moveLeft}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-950/80 border-2 border-amber-500 text-amber-200 flex items-center justify-center shadow-2xl active:scale-90 active:bg-amber-800 transition-transform cursor-pointer"
            aria-label="Move Left"
          >
            <ArrowLeft size={28} />
          </button>
          <button
            id="runner-right-btn"
            onClick={moveRight}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-950/80 border-2 border-amber-500 text-amber-200 flex items-center justify-center shadow-2xl active:scale-90 active:bg-amber-800 transition-transform cursor-pointer"
            aria-label="Move Right"
          >
            <ArrowRight size={28} />
          </button>
        </div>

        {/* Controls Indicator Hint */}
        <div className="hidden sm:flex flex-col items-center bg-amber-950/75 border border-amber-500/50 px-4 py-1.5 rounded-xl backdrop-blur-sm text-[11px] text-amber-200 font-medium tracking-tight pointer-events-none mb-1 shadow-xl">
          <div className="flex items-center gap-2">
            <span>← → Steer</span>
            <span className="text-amber-500">•</span>
            <span>↑ Space: Jump</span>
            <span className="text-amber-500">•</span>
            <span>↓ Slide</span>
          </div>
          <span className="text-[10px] text-yellow-300 font-bold mt-0.5">▲ Jump Boxes • ▼ Slide Garlands • ◄ Dodge Carts ►</span>
        </div>

        {/* Jump & Slide */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            id="runner-slide-btn"
            onClick={slide}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-950/80 border-2 border-amber-500 text-amber-200 flex flex-col items-center justify-center shadow-2xl active:scale-90 active:bg-amber-800 transition-transform cursor-pointer"
            aria-label="Slide"
          >
            <ArrowDown size={24} />
            <span className="text-[9px] font-bold tracking-tighter">SLIDE</span>
          </button>
          <button
            id="runner-jump-btn"
            onClick={jump}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-t from-amber-600 to-yellow-500 border-2 border-yellow-200 text-maroon-950 flex flex-col items-center justify-center shadow-2xl active:scale-90 transition-transform cursor-pointer"
            aria-label="Jump"
          >
            <ArrowUp size={24} className="stroke-[3]" />
            <span className="text-[10px] font-black tracking-tighter">JUMP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
