import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../utils/audio';

interface ModakSliceGameProps {
  onComplete: () => void;
  onLoseLife: () => void;
  isPaused: boolean;
  onUpdateProgress: (sliced: number, target: number) => void;
  onUpdateTimeLeft: (seconds: number) => void;
}

interface GameObject {
  id: number;
  type:
    | 'MODAK_GOLD'
    | 'MODAK_KESAR'
    | 'MODAK_PISTA'
    | 'MODAK_SILVER'
    | 'OBSTACLE_SPARK'
    | 'OBSTACLE_HUSK'
    | 'BOMB';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  vRot: number;
  sliced: boolean;
  sliceAngle: number;
  halvesOffset: number;
  opacity: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
  life: number;
  maxLife: number;
}

interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

const TARGET_MODAKS = 5;
const LEVEL_TIME = 45; // 45 seconds max

export const ModakSliceGame: React.FC<ModakSliceGameProps> = ({
  onComplete,
  onLoseLife,
  isPaused,
  onUpdateProgress,
  onUpdateTimeLeft,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [slicedCount, setSlicedCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(LEVEL_TIME);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // References for animation loop to avoid stale state closures
  const stateRef = useRef({
    slicedCount: 0,
    timeLeft: LEVEL_TIME,
    isPaused: false,
    objects: [] as GameObject[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    trail: [] as TrailPoint[],
    isDragging: false,
    lastSpawnTime: 0,
    idCounter: 1,
    screenShake: 0,
    completed: false,
    comboCount: 0,
    lastSliceTime: 0,
  });

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current.isPaused = isPaused;
  }, [isPaused]);

  // Handle Level Timer (45 seconds)
  useEffect(() => {
    if (isPaused || stateRef.current.completed) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        stateRef.current.timeLeft = next;
        onUpdateTimeLeft(next);
        if (next <= 0 && stateRef.current.slicedCount < TARGET_MODAKS) {
          clearInterval(timer);
          onLoseLife(); // timeout causes loss of life or fail
        }
        return Math.max(0, next);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, onLoseLife, onUpdateTimeLeft]);

  // Spawn Modak or harmless obstacle with high, elegant arc
  const spawnObject = (width: number, height: number, forceModak = false) => {
    const roll = Math.random();
const isBomb = forceModak ? false : roll < 0.08;
const isObstacle = forceModak ? false : !isBomb && roll < 0.24;// Low obstacle rate so slicing is fun

    let type: GameObject['type'];
    if (isBomb) {
  type = 'BOMB';
} else if (isObstacle) {
  type = Math.random() > 0.5 ? 'OBSTACLE_SPARK' : 'OBSTACLE_HUSK';
} else {
      const rand = Math.random();
      if (rand < 0.42) type = 'MODAK_GOLD';
      else if (rand < 0.72) type = 'MODAK_KESAR';
      else if (rand < 0.88) type = 'MODAK_PISTA';
      else type = 'MODAK_SILVER';
    }

    // Launch from bottom with generous spread
    const startX = width * (0.18 + Math.random() * 0.64);
    const startY = height + 35;

    // Desired apex reaches high up to 14% - 28% from the top (much higher, beautiful visibility!)
    const desiredApexY = height * (0.14 + Math.random() * 0.14);
    const gravity = 0.23; // Floaty, majestic gravity

    // Exact physics calculation: v^2 = 2 * g * distance
    const distToApex = Math.max(250, startY - desiredApexY);
    const vy = -Math.sqrt(2 * gravity * distToApex) * (0.97 + Math.random() * 0.08);

    // Subtle drift towards screen center
    const targetX = width * 0.5 + (Math.random() - 0.5) * (width * 0.45);
    const framesToApex = Math.abs(vy) / gravity;
    const vx = (targetX - startX) / (framesToApex * (1.1 + Math.random() * 0.25));

    stateRef.current.objects.push({
      id: stateRef.current.idCounter++,
      type,
      x: startX,
      y: startY,
      vx,
      vy,
      radius: isObstacle ? 34 : 44, // Generous 44px base radius for modaks (easy to see & slice!)
      rotation: (Math.random() - 0.5) * 0.6,
      vRot: (Math.random() - 0.5) * 0.035, // Gentle rotation
      sliced: false,
      sliceAngle: 0,
      halvesOffset: 0,
      opacity: 1,
    });
  };

  // Check line segment or point intersection with objects (Generous Hitbox!)
  const checkSlice = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    const objects = stateRef.current.objects;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lenSq = dx * dx + dy * dy;

    const now = Date.now();
    let modakSlicedInStroke = 0;

    for (const obj of objects) {
      if (obj.sliced) continue;

      const isObstacle =
        obj.type === 'OBSTACLE_SPARK' || obj.type === 'OBSTACLE_HUSK';
      const isBomb = obj.type === 'BOMB'

      // Modaks get a 1.65x generous hitbox (radius ~72px) making it super easy and satisfying to slash!
      // Obstacles have a precise 0.85x hitbox so players don't accidentally graze them.
     const hitRadius = isObstacle || isBomb
  ? obj.radius * 0.85
  : obj.radius * 1.65;

      let isHit = false;

      if (lenSq < 4) {
        // Direct tap or click!
        const dsq = (obj.x - p1.x) ** 2 + (obj.y - p1.y) ** 2;
        if (dsq < hitRadius * hitRadius) {
          isHit = true;
        }
      } else {
        // Project circle center onto line segment
        const t = Math.max(
          0,
          Math.min(1, ((obj.x - p1.x) * dx + (obj.y - p1.y) * dy) / lenSq)
        );
        const projX = p1.x + t * dx;
        const projY = p1.y + t * dy;
        const distSq = (obj.x - projX) ** 2 + (obj.y - projY) ** 2;

        if (distSq < hitRadius * hitRadius) {
          isHit = true;
        }
      }

      if (isHit) {
        obj.sliced = true;
        obj.sliceAngle = lenSq >= 4 ? Math.atan2(dy, dx) : (Math.random() - 0.5) * 0.6; 
        if (isBomb) {
  obj.sliced = true;
  sound.playObstacleHit();
  stateRef.current.screenShake = 16;
  setWarningMessage('💣 Bomb sliced! -1 life!');
  setTimeout(() => setWarningMessage(null), 1500);
  onLoseLife();
  continue;
}
        if (!isObstacle) {
          modakSlicedInStroke++;
          sound.playSlice();

          // Combo tracking
          if (now - stateRef.current.lastSliceTime < 650) {
            stateRef.current.comboCount++;
          } else {
            stateRef.current.comboCount = 1;
          }
          stateRef.current.lastSliceTime = now;

          const combo = stateRef.current.comboCount;
          if (combo > 1) {
            sound.playCombo();
            stateRef.current.floatingTexts.push({
              id: stateRef.current.idCounter++,
              text: `✨ COMBO x${combo}!`,
              x: obj.x,
              y: obj.y - 35,
              color: '#fef08a',
              alpha: 1,
              scale: 1.3,
              life: 0,
              maxLife: 40,
            });
          }

          // Points based on Modak variety
          let points = 1;
          let label = '+1 Golden Modak! 🥟';
          let textColor = '#facc15';
          let particleColors = ['#facc15', '#f59e0b', '#ffffff'];

          if (obj.type === 'MODAK_KESAR') {
            label = '+1 Kesar Modak! 🌸';
            textColor = '#fb923c';
            particleColors = ['#f97316', '#fbbf24', '#dc2626'];
          } else if (obj.type === 'MODAK_PISTA') {
            label = '+1 Pista Modak! 🌿';
            textColor = '#4ade80';
            particleColors = ['#22c55e', '#86efac', '#facc15'];
          } else if (obj.type === 'MODAK_SILVER') {
            points = 2; // Silver gives +2 progress!
            label = '💎 +2 Silver Vark Modak!';
            textColor = '#e0e7ff';
            particleColors = ['#ffffff', '#c7d2fe', '#818cf8', '#facc15'];
          }

          stateRef.current.floatingTexts.push({
            id: stateRef.current.idCounter++,
            text: label,
            x: obj.x,
            y: obj.y - 10,
            color: textColor,
            alpha: 1,
            scale: 1.1,
            life: 0,
            maxLife: 35,
          });

          // Spawn vibrant splash particles & flower petals
          const particleCount = obj.type === 'MODAK_SILVER' ? 36 : 28;
          for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.5 + Math.random() * 7;
            stateRef.current.particles.push({
              x: obj.x,
              y: obj.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 2.5,
              size: 3 + Math.random() * 5,
              color:
                particleColors[
                  Math.floor(Math.random() * particleColors.length)
                ],
              alpha: 1,
              life: 0,
              maxLife: 32 + Math.random() * 24,
            });
          }

          const newCount = Math.min(
            TARGET_MODAKS,
            stateRef.current.slicedCount + points
          );
          stateRef.current.slicedCount = newCount;
          setSlicedCount(newCount);
          onUpdateProgress(newCount, TARGET_MODAKS);

          if (newCount >= TARGET_MODAKS && !stateRef.current.completed) {
            stateRef.current.completed = true;
            sound.playLevelComplete();
            setTimeout(() => {
              onComplete();
            }, 700);
          }
        } else {
          // Obstacle hit!
          sound.playObstacleHit();
          stateRef.current.screenShake = 16;
          setWarningMessage('Watch out! Avoid thorns and sparks!');
          setTimeout(() => setWarningMessage(null), 1500);

          // Smoke particles
          for (let i = 0; i < 20; i++) {
            stateRef.current.particles.push({
              x: obj.x,
              y: obj.y,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5 - 2,
              size: 4 + Math.random() * 6,
              color: '#ef4444',
              alpha: 1,
              life: 0,
              maxLife: 26,
            });
          }

          onLoseLife();
        }
      }
    }
  };

  // Keyboard spacebar divine slice
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !stateRef.current.isPaused) {
        // Divine slice: slices any airborne modaks near the upper half of screen
        const airborneModaks = stateRef.current.objects.filter(
          (o) =>
            !o.sliced &&
            !o.type.startsWith('OBSTACLE') &&
            o.type !== 'BOMB' &&
            o.y < window.innerHeight * 0.8
        );
        if (airborneModaks.length > 0) {
          const target = airborneModaks[0];
          checkSlice(
            { x: target.x - 70, y: target.y },
            { x: target.x + 70, y: target.y }
          );
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = (time: number) => {
      if (!stateRef.current.isPaused) {
        // 1. Spawning objects (lively pace with combo opportunities!)
        if (time - stateRef.current.lastSpawnTime > 1150) {
          spawnObject(canvas.width, canvas.height);
          // 35% chance to spawn a second modak slightly staggered for double-slice excitement!
          if (Math.random() < 0.35) {
            setTimeout(() => {
              if (canvasRef.current && !stateRef.current.isPaused) {
                spawnObject(canvasRef.current.width, canvasRef.current.height, true);
              }
            }, 180);
          }
          stateRef.current.lastSpawnTime = time;
        }

        // 2. Clear canvas with screen shake
        ctx.save();
        if (stateRef.current.screenShake > 0) {
          const sx = (Math.random() - 0.5) * stateRef.current.screenShake;
          const sy = (Math.random() - 0.5) * stateRef.current.screenShake;
          ctx.translate(sx, sy);
          stateRef.current.screenShake = Math.max(0, stateRef.current.screenShake - 1);
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 3. Update & Draw Particles
        for (let i = stateRef.current.particles.length - 1; i >= 0; i--) {
          const p = stateRef.current.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.12; // floaty particle gravity
          p.life++;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          if (p.life >= p.maxLife) {
            stateRef.current.particles.splice(i, 1);
          }
        }
        ctx.globalAlpha = 1;

        // 4. Update & Draw Game Objects (Modaks & Obstacles) with Floaty Apex Hang Time
        const baseGravity = 0.23;
        for (let i = stateRef.current.objects.length - 1; i >= 0; i--) {
          const obj = stateRef.current.objects[i];

          obj.x += obj.vx;
          obj.y += obj.vy;

          // Apex Float Hang-Time: when near peak of flight (|vy| < 2.2),
          // dramatically reduce gravity so it hangs in the air gracefully for easy slicing!
          const isNearApex = Math.abs(obj.vy) < 2.2 && !obj.sliced;
          const effectiveGravity = isNearApex ? baseGravity * 0.35 : baseGravity;
          obj.vy += effectiveGravity;
          if (isNearApex) {
            obj.vy *= 0.96; // gentle hover dampener
          }

          obj.rotation += obj.vRot;

          // If sliced, split apart smoothly
          if (obj.sliced) {
            obj.halvesOffset += 4.5;
            obj.opacity -= 0.032;
          }

          // Draw Object
          ctx.save();
          ctx.translate(obj.x, obj.y);
          ctx.rotate(obj.rotation);
          ctx.globalAlpha = Math.max(0, obj.opacity);

          if (obj.type.startsWith('OBSTACLE') || obj.type === 'BOMB') {
  drawObstacle(ctx, obj);
} else {
  drawModak(ctx, obj);
}

          ctx.restore();

          // Remove if off-screen or faded
          if (
            (obj.y > canvas.height + 90 && obj.vy > 0) ||
            obj.opacity <= 0
          ) {
            stateRef.current.objects.splice(i, 1);
          }
        }

        // 5. Update & Draw Floating Combo & Point Texts
        for (let i = stateRef.current.floatingTexts.length - 1; i >= 0; i--) {
          const ft = stateRef.current.floatingTexts[i];
          ft.y -= 1.4; // float upwards
          ft.life++;
          ft.alpha = Math.max(0, 1 - ft.life / ft.maxLife);

          ctx.save();
          ctx.globalAlpha = ft.alpha;
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 8;
          ctx.fillStyle = ft.color;
          ctx.font = `bold ${Math.round(20 * ft.scale)}px 'Cinzel', serif, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.restore();

          if (ft.life >= ft.maxLife) {
            stateRef.current.floatingTexts.splice(i, 1);
          }
        }

        // 6. Draw Golden Blade Slice Trail
        const now = Date.now();
        const trail = stateRef.current.trail;
        // Purge old points (> 180ms)
        stateRef.current.trail = trail.filter((pt) => now - pt.time < 180);

        if (trail.length >= 2) {
          ctx.save();
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Golden outer glow
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 20;

          for (let i = 1; i < trail.length; i++) {
            const p1 = trail[i - 1];
            const p2 = trail[i];
            const ageRatio = 1 - (now - p2.time) / 180;
            if (ageRatio <= 0) continue;

            // Outer golden glow line
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(245, 158, 11, ${ageRatio * 0.95})`;
            ctx.lineWidth = 16 * ageRatio;
            ctx.stroke();

            // Inner white radiant core
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${ageRatio})`;
            ctx.lineWidth = 6 * ageRatio;
            ctx.stroke();
          }
          ctx.restore();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Helper: Draw 3D-styled Modak with 4 Delicious Varieties
  const drawModak = (ctx: CanvasRenderingContext2D, obj: GameObject) => {
    const r = obj.radius;

    // If sliced, draw two halves sliding apart
    if (obj.sliced) {
      // Left Half
      ctx.save();
      ctx.translate(-obj.halvesOffset, 0);
      drawModakHalf(ctx, r, obj.type, 'left');
      ctx.restore();

      // Right Half
      ctx.save();
      ctx.translate(obj.halvesOffset, 0);
      drawModakHalf(ctx, r, obj.type, 'right');
      ctx.restore();
      return;
    }

    // Full Modak Teardrop with pleats
    ctx.save();

    // Ambient glow
    if (obj.type === 'MODAK_SILVER') {
      ctx.shadowColor = '#818cf8';
      ctx.shadowBlur = 22;
    } else if (obj.type === 'MODAK_PISTA') {
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 18;
    } else if (obj.type === 'MODAK_KESAR') {
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 18;
    } else {
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 16;
    }

    // Body gradient
    const grad = ctx.createLinearGradient(-r, -r, r, r);
    if (obj.type === 'MODAK_KESAR') {
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.35, '#fbbf24');
      grad.addColorStop(0.75, '#ea580c');
      grad.addColorStop(1, '#9a3412');
    } else if (obj.type === 'MODAK_PISTA') {
      grad.addColorStop(0, '#f0fdf4');
      grad.addColorStop(0.35, '#bbf7d0');
      grad.addColorStop(0.75, '#4ade80');
      grad.addColorStop(1, '#15803d');
    } else if (obj.type === 'MODAK_SILVER') {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#e0e7ff');
      grad.addColorStop(0.65, '#c7d2fe');
      grad.addColorStop(1, '#6366f1');
    } else {
      // Golden Classic
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#fef08a');
      grad.addColorStop(0.7, '#facc15');
      grad.addColorStop(1, '#ca8a04');
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -r); // Top tip
    ctx.bezierCurveTo(r * 1.15, -r * 0.2, r * 1.25, r * 0.8, 0, r); // Right belly to bottom
    ctx.bezierCurveTo(-r * 1.25, r * 0.8, -r * 1.15, -r * 0.2, 0, -r); // Left belly to top
    ctx.closePath();
    ctx.fill();

    // Decorative traditional folds/pleats
    let pleatColor = 'rgba(202, 138, 4, 0.55)';
    if (obj.type === 'MODAK_KESAR') pleatColor = 'rgba(154, 52, 18, 0.55)';
    else if (obj.type === 'MODAK_PISTA') pleatColor = 'rgba(21, 128, 61, 0.55)';
    else if (obj.type === 'MODAK_SILVER') pleatColor = 'rgba(99, 102, 241, 0.55)';

    ctx.strokeStyle = pleatColor;
    ctx.lineWidth = 2.2;
    for (let angle = -0.75; angle <= 0.75; angle += 0.35) {
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(Math.sin(angle) * r * 0.9, r * 0.2, Math.sin(angle) * r * 0.6, r * 0.9);
      ctx.stroke();
    }

    // Top Garnish
    if (obj.type === 'MODAK_SILVER') {
      // Diamond star sparkle on tip
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -r + 5, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (obj.type === 'MODAK_PISTA') {
      // Crushed pistachio green garnish
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(0, -r + 5, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Kesar red saffron dot
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, -r + 5, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawModakHalf = (
    ctx: CanvasRenderingContext2D,
    r: number,
    type: GameObject['type'],
    side: 'left' | 'right'
  ) => {
    ctx.beginPath();
    if (side === 'left') {
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo(-r * 1.25, -r * 0.2, -r * 1.25, r * 0.8, 0, r);
      ctx.lineTo(0, -r);
    } else {
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo(r * 1.25, -r * 0.2, r * 1.25, r * 0.8, 0, r);
      ctx.lineTo(0, -r);
    }
    ctx.closePath();

    let halfColor = '#fde047';
    let borderColor = '#ca8a04';
    if (type === 'MODAK_KESAR') {
      halfColor = '#fb923c';
      borderColor = '#ea580c';
    } else if (type === 'MODAK_PISTA') {
      halfColor = '#86efac';
      borderColor = '#22c55e';
    } else if (type === 'MODAK_SILVER') {
      halfColor = '#e0e7ff';
      borderColor = '#818cf8';
    }

    ctx.fillStyle = halfColor;
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Delicious sweet coconut & jaggery filling inside!
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  // Helper: Draw harmless obstacle (Prickly Coconut or Firecracker Spark)
  const drawObstacle = (ctx: CanvasRenderingContext2D, obj: GameObject) => {
    const r = obj.radius;
    ctx.save();

    if (obj.type === 'BOMB') {
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Fuse
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(r * 0.35, -r * 0.65);
  ctx.quadraticCurveTo(r * 0.65, -r, r * 0.55, -r * 1.15);
  ctx.stroke();

  // Spark
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✦', r * 0.55, -r * 1.15);

} else if (obj.type === 'OBSTACLE_SPARK') {
      // Firecracker Sparkler Ball with danger icon
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 14;

      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Spark spikes
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (r * 0.7), Math.sin(a) * (r * 0.7));
        ctx.lineTo(Math.cos(a) * (r * 1.15), Math.sin(a) * (r * 1.15));
        ctx.stroke();
      }

      // Warning 'X' or '!'
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚠', 0, 2);
    } else {
      // Prickly Coconut Husk
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.8, r * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Spikes
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI) / 5;
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✕', 0, 1);
    }

    ctx.restore();
  };

  // Pointer / Mouse / Touch Events for Golden Slice Blade (With Tap-To-Slice!)
  const handlePointerDown = (e: React.PointerEvent) => {
    stateRef.current.isDragging = true;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    stateRef.current.trail = [{ x, y, time: Date.now() }];

    // Direct tap or click slices immediately!
    checkSlice({ x, y }, { x, y });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!stateRef.current.isDragging && e.pointerType === 'mouse' && e.buttons !== 1) {
      return;
    }
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const trail = stateRef.current.trail;
    if (trail.length > 0) {
      const prev = trail[trail.length - 1];
      checkSlice(prev, { x, y });
    }

    trail.push({ x, y, time: Date.now() });
  };

  const handlePointerUp = () => {
    stateRef.current.isDragging = false;
  };

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#2a0505] via-[#3d080e] to-[#1a0204]"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: 'none' }}
    >
      {/* Canvas for objects and blade slice trail */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10 cursor-crosshair" />

      {/* Decorative Traditional Temple Arch Overlay & Diyas */}
      <div className="absolute top-2 inset-x-0 flex justify-between px-6 pointer-events-none z-0 opacity-40">
        <div className="text-amber-500 font-serif text-2xl font-bold tracking-widest">
          ॐ
        </div>
        <div className="text-amber-500 font-serif text-2xl font-bold tracking-widest">
          श्री गणेशाय नमः
        </div>
        <div className="text-amber-500 font-serif text-2xl font-bold tracking-widest">
          卐
        </div>
      </div>

      {/* Floating Instructions Pill for Classroom Presentation */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-950/80 border border-amber-500/50 px-5 py-2 rounded-full backdrop-blur-md shadow-xl text-center pointer-events-none z-20">
        <p className="text-amber-200 font-cinzel font-bold text-sm sm:text-base tracking-wide flex items-center gap-2">
          <span>🗡️ Swipe or drag to slice</span>
          <span className="text-yellow-400 font-black text-lg">5 MODAKS</span>
        </p>
      </div>

      {/* Warning Toast if obstacle hit */}
      {warningMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-red-950/95 border-2 border-red-500 text-red-200 px-6 py-2.5 rounded-2xl shadow-2xl font-bold text-sm tracking-wide z-30 animate-bounce">
          ⚠️ {warningMessage}
        </div>
      )}

      {/* Bottom Counter & Help */}
      <div className="absolute bottom-6 inset-x-0 flex flex-col items-center pointer-events-none z-20 px-4">
        <div className="bg-black/60 backdrop-blur-md border border-amber-500/40 px-6 py-2.5 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="text-amber-300 font-cinzel font-bold text-base sm:text-lg">
            MODAKS SLICED:{' '}
            <span className="text-yellow-400 font-black text-2xl">
              {slicedCount}
            </span>{' '}
            / {TARGET_MODAKS}
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((idx) => (
              <span
                key={idx}
                className={`text-xl transition-transform ${
                  idx <= slicedCount ? 'scale-125 filter drop-shadow-[0_0_6px_#fbbf24]' : 'opacity-25 grayscale'
                }`}
              >
                🥟
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-amber-300/70 mt-2 font-medium">
          Tip: Swipe finger across screen or drag mouse to slash. Avoid thorns, sparks & bombs!
        </p>
      </div>
    </div>
  );
};
