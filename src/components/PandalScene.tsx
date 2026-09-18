import React from 'react';

export interface PuzzleInfo {
  id: number;
  title: string;
  hindiTitle: string;
  description: string;
  icon: string;
}

export const LEVEL_TWO_PUZZLES: PuzzleInfo[] = [
  {
    id: 0,
    title: 'Sacred Temple Pandal',
    hindiTitle: 'मंदिर मंडप',
    description: 'The royal festival stage with pillars & marigold toran',
    icon: '🌸',
  },
  {
    id: 1,
    title: 'Lord Ganesha & Mushak',
    hindiTitle: 'श्री गणेश व मूषक',
    description: 'Divine throne with loving Mushak offering sweet modak',
    icon: '👑',
  },
  {
    id: 2,
    title: 'Maha Modak & Royal Prasad',
    hindiTitle: 'महामोदक व नैवेद्य थाली',
    description: 'Golden thali of 21 modaks, coconut, durva & laddus',
    icon: '🥟',
  },
  {
    id: 3,
    title: 'Deepotsav & Mangal Aarti',
    hindiTitle: 'दीपोत्सव व महाआरती',
    description: 'Radiant five-flame Panchaarti, Samai lamps & conch',
    icon: '🪔',
  },
];

interface PandalSceneProps {
  puzzleIndex?: number; // 0..3
  tileIndex?: number; // If undefined, renders full 600x400. If 0..5, renders that 200x200 slice!
  className?: string;
  showLabels?: boolean;
}

export const PANDAL_WIDTH = 600;
export const PANDAL_HEIGHT = 400;
export const TILE_SIZE = 200; // 3 cols x 2 rows = 6 tiles

export const PandalScene: React.FC<PandalSceneProps> = ({
  puzzleIndex = 0,
  tileIndex,
  className = '',
}) => {
  // Determine viewBox: full or sliced 200x200
  let viewBox = `0 0 ${PANDAL_WIDTH} ${PANDAL_HEIGHT}`;
  if (tileIndex !== undefined && tileIndex >= 0 && tileIndex < 6) {
    const col = tileIndex % 3;
    const row = Math.floor(tileIndex / 3);
    const minX = col * TILE_SIZE;
    const minY = row * TILE_SIZE;
    viewBox = `${minX} ${minY} ${TILE_SIZE} ${TILE_SIZE}`;
  }

  return (
    <svg
      viewBox={viewBox}
      className={`w-full h-full select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Global Shared Gradients */}
        <linearGradient id="pandalPillar" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="25%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="75%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        <linearGradient id="goldThali" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#f59e0b" />
          <stop offset="70%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        <linearGradient id="flame" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="40%" stopColor="#f97316" />
          <stop offset="80%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>

        <linearGradient id="dhotiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="70%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>

        <linearGradient id="bodySkin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffedd5" />
          <stop offset="50%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#fdba74" />
        </linearGradient>

        <radialGradient id="sunHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="30%" stopColor="#fde047" stopOpacity="0.8" />
          <stop offset="65%" stopColor="#f59e0b" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="modakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#fef08a" />
          <stop offset="80%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>

      {/* PUZZLE 0: SACRED TEMPLE PANDAL */}
      {puzzleIndex === 0 && (
        <g id="scene-pandal">
          <defs>
            <linearGradient id="pandalSky0" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b0712" />
              <stop offset="40%" stopColor="#500718" />
              <stop offset="85%" stopColor="#701a28" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
            <linearGradient id="pandalFloor0" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#450a0a" />
              <stop offset="50%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#290707" />
            </linearGradient>
          </defs>

          {/* Backdrop Wall */}
          <rect x="0" y="0" width="600" height="280" fill="url(#pandalSky0)" />
          
          {/* Decorative Warm Festival Fairy Light Strands in sky */}
          <path d="M 0 35 Q 150 70 300 35 Q 450 70 600 35" fill="none" stroke="#b45309" strokeWidth="2" />
          {[30, 80, 130, 180, 230, 280, 320, 370, 420, 470, 520, 570].map((x, i) => {
            const y = 35 + Math.sin(i * 0.7) * 14;
            const col = ['#fef08a', '#f43f5e', '#38bdf8', '#4ade80', '#fbbf24'][i % 5];
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="5" fill={col} filter="drop-shadow(0 0 4px #fbbf24)" />
                <circle cx={x} cy={y} r="2" fill="#ffffff" />
              </g>
            );
          })}

          {/* Ornate Pandal Arch */}
          <path d="M 50 0 L 550 0 L 530 45 Q 300 110 70 45 Z" fill="#991b1b" stroke="#f59e0b" strokeWidth="3" />
          <text x="300" y="32" fill="#fef08a" fontSize="17" fontWeight="bold" fontFamily="'Cinzel', serif" textAnchor="middle" letterSpacing="2">
            ✦ शुभ लाभ • ॐ गं गणपतये नमः ✦
          </text>

          {/* Pillars */}
          {/* Left Pillar */}
          <g id="left-pillar">
            <rect x="55" y="45" width="45" height="255" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1.5" />
            <rect x="45" y="40" width="65" height="15" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1.5" />
            <rect x="45" y="290" width="65" height="20" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1.5" />
            {[80, 130, 180, 230].map((y) => (
              <ellipse key={y} cx="77" cy={y} rx="24" ry="7" fill="#ea580c" stroke="#f59e0b" strokeWidth="1" />
            ))}
            <path d="M 77 40 L 77 68" stroke="#f59e0b" strokeWidth="2" />
            <path d="M 68 68 C 68 58, 86 58, 86 68 L 90 82 L 64 82 Z" fill="#facc15" stroke="#78350f" strokeWidth="1" />
            <circle cx="77" cy="85" r="3" fill="#ca8a04" />
          </g>

          {/* Right Pillar */}
          <g id="right-pillar">
            <rect x="500" y="45" width="45" height="255" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1.5" />
            <rect x="490" y="40" width="65" height="15" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1.5" />
            <rect x="490" y="290" width="65" height="20" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1.5" />
            {[80, 130, 180, 230].map((y) => (
              <ellipse key={y} cx="522" cy={y} rx="24" ry="7" fill="#ea580c" stroke="#f59e0b" strokeWidth="1" />
            ))}
            <path d="M 522 40 L 522 68" stroke="#f59e0b" strokeWidth="2" />
            <path d="M 513 68 C 513 58, 531 58, 531 68 L 535 82 L 509 82 Z" fill="#facc15" stroke="#78350f" strokeWidth="1" />
            <circle cx="522" cy="85" r="3" fill="#ca8a04" />
          </g>

          {/* Marigold Toran Garland */}
          <path d="M 80 50 Q 300 135 520 50" fill="none" stroke="#ea580c" strokeWidth="12" strokeDasharray="14 4" />
          <path d="M 80 50 Q 300 135 520 50" fill="none" stroke="#facc15" strokeWidth="8" strokeDasharray="10 6" />

          {/* Floor */}
          <rect x="0" y="280" width="600" height="120" fill="url(#pandalFloor0)" />
          
          {/* Rangoli */}
          <g id="rangoli" transform="translate(300, 360)">
            <ellipse cx="0" cy="0" rx="140" ry="32" fill="#831843" stroke="#f59e0b" strokeWidth="2" />
            <ellipse cx="0" cy="0" rx="110" ry="24" fill="#9d174d" stroke="#fef08a" strokeWidth="2" strokeDasharray="4 4" />
            <ellipse cx="0" cy="0" rx="80" ry="18" fill="#be123c" stroke="#ffffff" strokeWidth="1.5" />
            {[-80, -40, 0, 40, 80].map((rx, idx) => (
              <circle key={idx} cx={rx} cy="0" r="5" fill="#facc15" stroke="#ea580c" strokeWidth="1" />
            ))}
          </g>

          {/* Halo */}
          <circle cx="300" cy="170" r="115" fill="url(#sunHalo)" />
          <circle cx="300" cy="170" r="85" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="5 5" />

          {/* Throne Base */}
          <g transform="translate(300, 275)">
            <ellipse cx="0" cy="20" rx="100" ry="20" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="2" />
            <path d="M -80 15 C -50 -5, -30 25, 0 10 C 30 25, 50 -5, 80 15 C 50 30, -50 30, -80 15 Z" fill="#f43f5e" stroke="#ffe4e6" strokeWidth="1.5" />
          </g>

          {/* Ganesha Figure */}
          <g transform="translate(300, 160)">
            <ellipse cx="0" cy="100" rx="75" ry="28" fill="url(#dhotiGrad)" stroke="#b45309" strokeWidth="2" />
            <ellipse cx="0" cy="55" rx="55" ry="46" fill="url(#bodySkin)" stroke="#fb923c" strokeWidth="2" />
            <path d="M -30 20 Q -5 65 25 95" stroke="#ffffff" strokeWidth="3" strokeDasharray="4 2" fill="none" />
            <path d="M -25 25 Q 0 55 25 25" stroke="url(#pandalPillar)" strokeWidth="6" fill="none" strokeLinecap="round" />
            
            {/* Upper Hands */}
            <path d="M -50 30 C -80 15, -90 -10, -70 -25" stroke="url(#bodySkin)" strokeWidth="11" fill="none" strokeLinecap="round" />
            <line x1="-75" y1="-45" x2="-65" y2="-5" stroke="#f59e0b" strokeWidth="3" />
            
            <path d="M 50 30 C 80 15, 90 -10, 70 -25" stroke="url(#bodySkin)" strokeWidth="11" fill="none" strokeLinecap="round" />
            <circle cx="73" cy="-35" r="9" fill="#f43f5e" />
            <circle cx="73" cy="-35" r="4" fill="#fef08a" />

            {/* Lower Hands */}
            <path d="M 45 55 C 65 65, 75 80, 55 90" stroke="url(#bodySkin)" strokeWidth="11" fill="none" strokeLinecap="round" />
            <ellipse cx="55" cy="85" rx="16" ry="7" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1" />
            <circle cx="55" cy="76" r="4.5" fill="#facc15" />

            <path d="M -45 55 C -65 65, -70 75, -50 85" stroke="url(#bodySkin)" strokeWidth="11" fill="none" strokeLinecap="round" />
            <circle cx="-50" cy="78" r="10" fill="url(#bodySkin)" />
            <text x="-50" y="82" fontSize="9" fontWeight="bold" fill="#dc2626" textAnchor="middle">ॐ</text>

            {/* Ears */}
            <path d="M -40 -20 C -90 -35, -95 15, -40 25 Z" fill="url(#bodySkin)" stroke="#ea580c" strokeWidth="1.5" />
            <path d="M 40 -20 C 90 -35, 95 15, 40 25 Z" fill="url(#bodySkin)" stroke="#ea580c" strokeWidth="1.5" />

            {/* Head & Trunk */}
            <ellipse cx="0" cy="-5" rx="42" ry="36" fill="url(#bodySkin)" stroke="#fb923c" strokeWidth="1.5" />
            <path d="M -5 5 C -5 35, -7 60, -22 72 C -32 80, -42 75, -35 62 C -28 54, -20 45, -18 20 C -16 5, -12 -2, -5 5 Z" fill="url(#bodySkin)" stroke="#ea580c" strokeWidth="1.5" />
            <circle cx="-35" cy="62" r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />

            {/* Eyes & Tilak */}
            <path d="M -22 -12 Q -14 -16 -6 -11 Q -14 -7 -22 -12 Z" fill="#3b0712" />
            <path d="M 6 -11 Q 14 -16 22 -12 Q 14 -7 6 -11 Z" fill="#3b0712" />
            <ellipse cx="0" cy="-28" rx="2.5" ry="5.5" fill="#dc2626" />

            {/* Crown */}
            <path d="M -28 -32 L -18 -68 L 0 -85 L 18 -68 L 28 -32 Z" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="2" />
            <circle cx="0" cy="-60" r="4.5" fill="#dc2626" />
            <ellipse cx="0" cy="-94" rx="5" ry="9" fill="#0284c7" />
          </g>

          {/* Samai Lamps on sides */}
          <g transform="translate(130, 270)">
            <ellipse cx="0" cy="45" rx="22" ry="7" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1.5" />
            <rect x="-4" y="-30" width="8" height="75" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1" />
            <ellipse cx="0" cy="-10" rx="20" ry="6" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1" />
            <path d="M 0 -28 C -5 -19, -5 -11, 0 -9 C 5 -11, 5 -19, 0 -28 Z" fill="url(#flame)" />
          </g>
          <g transform="translate(470, 270)">
            <ellipse cx="0" cy="45" rx="22" ry="7" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1.5" />
            <rect x="-4" y="-30" width="8" height="75" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1" />
            <ellipse cx="0" cy="-10" rx="20" ry="6" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1" />
            <path d="M 0 -28 C -5 -19, -5 -11, 0 -9 C 5 -11, 5 -19, 0 -28 Z" fill="url(#flame)" />
          </g>
        </g>
      )}

      {/* PUZZLE 1: LORD GANESHA & MUSHAK THRONE */}
      {puzzleIndex === 1 && (
        <g id="scene-ganesha-mushak">
          <defs>
            <linearGradient id="gmSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="40%" stopColor="#2e1065" />
              <stop offset="75%" stopColor="#4c0519" />
              <stop offset="100%" stopColor="#1c1917" />
            </linearGradient>
            <radialGradient id="gmAura" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
              <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#b45309" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Majestic Royal Sanctum Backdrop */}
          <rect x="0" y="0" width="600" height="400" fill="url(#gmSky)" />

          {/* Intricate Mandala Sunburst Rays */}
          <g transform="translate(300, 160)" opacity="0.35">
            {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map((deg) => (
              <line
                key={deg}
                x1="0"
                y1="0"
                x2={Math.cos((deg * Math.PI) / 180) * 280}
                y2={Math.sin((deg * Math.PI) / 180) * 280}
                stroke="#facc15"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
            ))}
          </g>

          {/* Divine Golden Halo */}
          <circle cx="300" cy="150" r="140" fill="url(#gmAura)" />
          <circle cx="300" cy="150" r="110" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 4" />

          {/* Top Hanging Royal Brass Bell Garlands */}
          <path d="M 0 20 Q 150 45 300 20 Q 450 45 600 20" fill="none" stroke="#ea580c" strokeWidth="10" strokeDasharray="12 4" />
          <path d="M 0 20 Q 150 45 300 20 Q 450 45 600 20" fill="none" stroke="#facc15" strokeWidth="6" strokeDasharray="8 6" />

          {/* Hanging Mandir Bells */}
          {[90, 200, 400, 510].map((bx, idx) => (
            <g key={bx} transform={`translate(${bx}, 20)`}>
              <line x1="0" y1="0" x2="0" y2="40" stroke="#f59e0b" strokeWidth="2" />
              <path d="M -10 40 C -10 30, 10 30, 10 40 L 14 55 L -14 55 Z" fill="#facc15" stroke="#78350f" strokeWidth="1" />
              <circle cx="0" cy="58" r="3.5" fill="#ea580c" />
            </g>
          ))}

          {/* Golden Lotus Throne Base */}
          <g transform="translate(300, 290)">
            <ellipse cx="0" cy="40" rx="170" ry="38" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="3" />
            {/* Glowing Lotus Petals Layer 1 */}
            {[-120, -70, -20, 30, 80, 130].map((lx, i) => (
              <path
                key={i}
                d={`M ${lx - 30} 40 C ${lx - 20} 5, ${lx + 20} 5, ${lx + 30} 40 Z`}
                fill="#f43f5e"
                stroke="#ffe4e6"
                strokeWidth="1.5"
              />
            ))}
            {/* Glowing Lotus Petals Layer 2 */}
            {[-95, -45, 5, 55, 105].map((lx, i) => (
              <path
                key={i}
                d={`M ${lx - 25} 35 C ${lx - 15} 12, ${lx + 15} 12, ${lx + 25} 35 Z`}
                fill="#fda4af"
                stroke="#fff1f2"
                strokeWidth="1"
              />
            ))}
          </g>

          {/* Close-up Majestic Lord Ganesha */}
          <g transform="translate(300, 160)">
            {/* Pitambara Silk Dhoti */}
            <ellipse cx="0" cy="110" rx="95" ry="34" fill="url(#dhotiGrad)" stroke="#b45309" strokeWidth="2.5" />
            <path d="M -60 100 Q 0 135 60 100 Q 0 145 -60 100 Z" fill="#fef08a" />

            {/* Sacred Belly with Golden Nagabandha / Janeu */}
            <ellipse cx="0" cy="55" rx="66" ry="52" fill="url(#bodySkin)" stroke="#ea580c" strokeWidth="2" />
            <path d="M -40 10 Q -10 65 30 110" stroke="#ffffff" strokeWidth="3.5" strokeDasharray="6 3" fill="none" />
            <path d="M -30 25 Q 0 65 30 25" stroke="url(#pandalPillar)" strokeWidth="8" fill="none" strokeLinecap="round" />
            <circle cx="0" cy="52" r="7" fill="#dc2626" stroke="#fef08a" strokeWidth="1.5" />

            {/* Hands */}
            {/* Upper Right Hand with Axe / Ankusha */}
            <path d="M -60 25 C -95 10, -105 -15, -85 -35" stroke="url(#bodySkin)" strokeWidth="13" fill="none" strokeLinecap="round" />
            <circle cx="-85" cy="-35" r="9" fill="url(#bodySkin)" />
            <line x1="-92" y1="-60" x2="-78" y2="-10" stroke="#f59e0b" strokeWidth="4" />
            <path d="M -89 -55 Q -65 -60 -78 -40" fill="none" stroke="#f59e0b" strokeWidth="3.5" />

            {/* Upper Left Hand holding Sacred Pink Lotus */}
            <path d="M 60 25 C 95 10, 105 -15, 85 -35" stroke="url(#bodySkin)" strokeWidth="13" fill="none" strokeLinecap="round" />
            <circle cx="85" cy="-35" r="9" fill="url(#bodySkin)" />
            <circle cx="88" cy="-48" r="13" fill="#f43f5e" />
            <circle cx="88" cy="-48" r="6" fill="#fef08a" />

            {/* Lower Right Hand - Abhaya Mudra with Auspicious Om */}
            <path d="M -55 55 C -80 65, -85 80, -60 92" stroke="url(#bodySkin)" strokeWidth="13" fill="none" strokeLinecap="round" />
            <circle cx="-60" cy="85" r="12" fill="url(#bodySkin)" stroke="#fb923c" strokeWidth="1" />
            <text x="-60" y="89" fontSize="11" fontWeight="bold" fill="#dc2626" textAnchor="middle">ॐ</text>

            {/* Lower Left Hand holding Golden Modak Katori */}
            <path d="M 55 55 C 80 65, 85 80, 65 92" stroke="url(#bodySkin)" strokeWidth="13" fill="none" strokeLinecap="round" />
            <ellipse cx="65" cy="88" rx="20" ry="9" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1.5" />
            <circle cx="58" cy="83" r="5" fill="#facc15" />
            <circle cx="72" cy="83" r="5" fill="#facc15" />
            <circle cx="65" cy="78" r="6" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />

            {/* Majestic Broad Ears */}
            <path d="M -48 -25 C -115 -45, -120 20, -48 35 Z" fill="url(#bodySkin)" stroke="#ea580c" strokeWidth="2" />
            <path d="M -42 -15 C -95 -30, -100 12, -42 24 Z" fill="#fed7aa" />
            <circle cx="-95" cy="2" r="6" fill="#facc15" stroke="#b45309" strokeWidth="1" />

            <path d="M 48 -25 C 115 -45, 120 20, 48 35 Z" fill="url(#bodySkin)" stroke="#ea580c" strokeWidth="2" />
            <path d="M 42 -15 C 95 -30, 100 12, 42 24 Z" fill="#fed7aa" />
            <circle cx="95" cy="2" r="6" fill="#facc15" stroke="#b45309" strokeWidth="1" />

            {/* Head & Peaceful Countenance */}
            <ellipse cx="0" cy="-8" rx="52" ry="44" fill="url(#bodySkin)" stroke="#ea580c" strokeWidth="2" />

            {/* Graceful Curved Trunk */}
            <path
              d="M -7 5 
                 C -7 42, -9 74, -28 88 
                 C -40 98, -52 92, -44 76 
                 C -36 66, -26 55, -23 24 
                 C -21 5, -16 -4, -7 5 Z"
              fill="url(#bodySkin)"
              stroke="#ea580c"
              strokeWidth="2"
            />
            {/* Steamed Saffron Modak on Trunk Tip */}
            <circle cx="-44" cy="76" r="7" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
            <circle cx="-44" cy="74" r="2" fill="#ea580c" />

            {/* Divine Eyes */}
            <path d="M -28 -16 Q -18 -22 -8 -15 Q -18 -10 -28 -16 Z" fill="#3b0712" />
            <circle cx="-18" cy="-16" r="2" fill="#ffffff" />
            <path d="M 8 -15 Q 18 -22 28 -16 Q 18 -10 8 -15 Z" fill="#3b0712" />
            <circle cx="18" cy="-16" r="2" fill="#ffffff" />

            {/* Pure Ivory Tusks */}
            <polygon points="-15,8 -12,20 -8,8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <polygon points="8,8 14,24 16,8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />

            {/* Sacred Red & Yellow Trishul Tilak */}
            <path d="M -15 -32 Q 0 -38 15 -32" stroke="#facc15" strokeWidth="3.5" fill="none" />
            <path d="M -15 -28 Q 0 -34 15 -28" stroke="#facc15" strokeWidth="3.5" fill="none" />
            <ellipse cx="0" cy="-36" rx="3.5" ry="7.5" fill="#dc2626" />
            <circle cx="0" cy="-26" r="3" fill="#dc2626" />

            {/* Royal Golden Mukut (Crown) */}
            <path d="M -35 -40 L -22 -88 L 0 -110 L 22 -88 L 35 -40 Z" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="2.5" />
            <circle cx="0" cy="-78" r="6" fill="#dc2626" stroke="#fef08a" strokeWidth="1.5" />
            <circle cx="-13" cy="-58" r="4.5" fill="#059669" />
            <circle cx="13" cy="-58" r="4.5" fill="#059669" />
            <ellipse cx="0" cy="-122" rx="7" ry="13" fill="#0284c7" stroke="#facc15" strokeWidth="1.5" />
            <circle cx="0" cy="-122" r="3.5" fill="#facc15" />
          </g>

          {/* Devoted Mushak (Divine Mouse) with Modak Offering on Bottom Left */}
          <g transform="translate(130, 335)">
            {/* Shadow */}
            <ellipse cx="0" cy="22" rx="38" ry="10" fill="#000000" opacity="0.4" />
            
            {/* Curled Tail */}
            <path d="M -25 10 Q -45 5 -40 -15 Q -32 -25 -25 -10" fill="none" stroke="#71717a" strokeWidth="4" strokeLinecap="round" />
            
            {/* Body */}
            <ellipse cx="0" cy="8" rx="26" ry="18" fill="#a1a1aa" stroke="#52525b" strokeWidth="1.5" />
            {/* Cute Head looking up right */}
            <ellipse cx="14" cy="-5" rx="16" ry="13" fill="#a1a1aa" stroke="#52525b" strokeWidth="1.5" />
            {/* Pink Inner Ear */}
            <ellipse cx="6" cy="-16" rx="6" ry="8" fill="#f472b6" stroke="#52525b" strokeWidth="1" />
            
            {/* Black Eye & Snout */}
            <circle cx="20" cy="-8" r="2.5" fill="#18181b" />
            <circle cx="21" cy="-8" r="0.8" fill="#ffffff" />
            <circle cx="28" cy="-3" r="2" fill="#f472b6" />

            {/* Little Paws holding a giant delicious Modak */}
            <path d="M 22 2 C 30 -4, 38 6, 26 12 Z" fill="#facc15" stroke="#b45309" strokeWidth="1.5" />
            <circle cx="26" cy="1" r="1.5" fill="#ea580c" />
            <circle cx="18" cy="6" r="3.5" fill="#d4d4d8" />

            {/* Golden Bell on Mushak Collar */}
            <circle cx="10" cy="5" r="4.5" fill="#facc15" stroke="#78350f" strokeWidth="1" />
            
            <text x="0" y="32" fontSize="10" fontWeight="bold" fontFamily="'Cinzel', serif" fill="#fef08a" textAnchor="middle">
              ✦ श्री मूषकराज ✦
            </text>
          </g>

          {/* Sacred Durva Grass & Hibiscus Flowers on Bottom Right */}
          <g transform="translate(470, 335)">
            <ellipse cx="0" cy="22" rx="42" ry="10" fill="#000000" opacity="0.4" />
            
            {/* Green Durva Grass blades */}
            <path d="M -15 20 Q -25 -5 -10 -25" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M -10 20 Q 0 -15 10 -30" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M -5 20 Q 15 -10 25 -20" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round" />
            
            {/* Red Hibiscus (Jaswand) Offering */}
            <g transform="translate(10, 5)">
              {[0, 72, 144, 216, 288].map((deg) => (
                <path
                  key={deg}
                  d="M 0 0 C 12 -18, -12 -18, 0 0 Z"
                  fill="#dc2626"
                  stroke="#991b1b"
                  strokeWidth="1"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle cx="0" cy="0" r="5" fill="#facc15" />
              <line x1="0" y1="0" x2="6" y2="-12" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
              <circle cx="6" cy="-12" r="2" fill="#ea580c" />
            </g>

            {/* Clay Diya Lamp */}
            <g transform="translate(-25, 10)">
              <ellipse cx="0" cy="5" rx="14" ry="5" fill="#9a3412" stroke="#7c2d12" strokeWidth="1" />
              <path d="M 0 -8 C -4 -4, -4 0, 0 2 C 4 0, 4 -4, 0 -8 Z" fill="url(#flame)" />
            </g>

            <text x="0" y="32" fontSize="10" fontWeight="bold" fontFamily="'Cinzel', serif" fill="#fef08a" textAnchor="middle">
              ✦ दूर्वा व जास्वंद ✦
            </text>
          </g>
        </g>
      )}

      {/* PUZZLE 2: MAHA MODAK & ROYAL PRASAD THALI */}
      {puzzleIndex === 2 && (
        <g id="scene-modak-prasad">
          <defs>
            <linearGradient id="prasadSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#450a0a" />
              <stop offset="50%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#1f1305" />
            </linearGradient>
            <radialGradient id="thaliGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Warm Temple Sanctum Backdrop */}
          <rect x="0" y="0" width="600" height="400" fill="url(#prasadSky)" />

          {/* Floating Floral Water Bowls (Urlis) on Top Corners */}
          <g transform="translate(90, 60)">
            <ellipse cx="0" cy="15" rx="55" ry="16" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="2" />
            <ellipse cx="0" cy="12" rx="48" ry="12" fill="#0284c7" />
            {[-25, 0, 25].map((mx, idx) => (
              <circle key={idx} cx={mx} cy={12} r="9" fill={idx % 2 === 0 ? '#fbbf24' : '#ea580c'} stroke="#ca8a04" strokeWidth="1" />
            ))}
            <circle cx="0" cy="5" r="4" fill="url(#flame)" />
          </g>

          <g transform="translate(510, 60)">
            <ellipse cx="0" cy="15" rx="55" ry="16" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="2" />
            <ellipse cx="0" cy="12" rx="48" ry="12" fill="#0284c7" />
            {[-25, 0, 25].map((mx, idx) => (
              <circle key={idx} cx={mx} cy={12} r="9" fill={idx % 2 === 0 ? '#fbbf24' : '#ea580c'} stroke="#ca8a04" strokeWidth="1" />
            ))}
            <circle cx="0" cy="5" r="4" fill="url(#flame)" />
          </g>

          {/* Header Banner */}
          <text x="300" y="38" fill="#fef08a" fontSize="18" fontWeight="bold" fontFamily="'Cinzel', serif" textAnchor="middle" letterSpacing="3">
            ✦ महामोदक नैवेद्यम् • २१ मोदक अर्पणम् ✦
          </text>

          {/* Glowing Halo around Golden Thali */}
          <circle cx="300" cy="220" r="185" fill="url(#thaliGlow)" />

          {/* Grand Golden Puja Thali (Centerpiece) */}
          <g id="maha-thali" transform="translate(300, 235)">
            {/* Thali Outer Rim & Drop Shadow */}
            <ellipse cx="0" cy="15" rx="230" ry="105" fill="#180c02" opacity="0.6" />
            <ellipse cx="0" cy="0" rx="225" ry="100" fill="url(#goldThali)" stroke="#78350f" strokeWidth="4" />
            <ellipse cx="0" cy="0" rx="205" ry="88" fill="url(#goldThali)" stroke="#fef08a" strokeWidth="2" strokeDasharray="6 3" />
            <ellipse cx="0" cy="0" rx="190" ry="80" fill="#78350f" stroke="#b45309" strokeWidth="2" />

            {/* Banana Leaf Base inside Thali */}
            <ellipse cx="0" cy="2" rx="180" ry="74" fill="#15803d" stroke="#166534" strokeWidth="2" />
            <path d="M -170 0 Q 0 -15 170 0" stroke="#22c55e" strokeWidth="2" fill="none" />

            {/* Red Hibiscus Petals inside Thali */}
            {[-130, -90, 90, 130].map((px, idx) => (
              <circle key={idx} cx={px} cy={idx % 2 === 0 ? 20 : -20} r="10" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
            ))}

            {/* Surrounding Steamed Ukadiche Modaks & Motichoor Laddus */}
            {/* Back Row */}
            <g transform="translate(-80, -35)">
              <path d="M 0 -22 C -15 4, 15 4, 0 -22 Z" fill="url(#modakGrad)" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="0" cy="-20" r="2" fill="#ea580c" />
            </g>
            <g transform="translate(-30, -42)">
              <circle cx="0" cy="0" r="14" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
              <circle cx="-3" cy="-3" r="2" fill="#ffffff" />
            </g>
            <g transform="translate(30, -42)">
              <circle cx="0" cy="0" r="14" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
              <circle cx="-3" cy="-3" r="2" fill="#ffffff" />
            </g>
            <g transform="translate(80, -35)">
              <path d="M 0 -22 C -15 4, 15 4, 0 -22 Z" fill="url(#modakGrad)" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="0" cy="-20" r="2" fill="#ea580c" />
            </g>

            {/* Side Modaks */}
            <g transform="translate(-120, -5)">
              <path d="M 0 -25 C -18 6, 18 6, 0 -25 Z" fill="url(#modakGrad)" stroke="#ca8a04" strokeWidth="1.5" />
              <circle cx="0" cy="-23" r="2.5" fill="#ea580c" />
            </g>
            <g transform="translate(120, -5)">
              <path d="M 0 -25 C -18 6, 18 6, 0 -25 Z" fill="url(#modakGrad)" stroke="#ca8a04" strokeWidth="1.5" />
              <circle cx="0" cy="-23" r="2.5" fill="#ea580c" />
            </g>

            {/* Fresh Coconut Halves on Flanks */}
            <g transform="translate(-145, 25)">
              <ellipse cx="0" cy="0" rx="18" ry="14" fill="#451a03" stroke="#290f02" strokeWidth="2" />
              <ellipse cx="0" cy="0" rx="13" ry="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
              <ellipse cx="0" cy="0" rx="7" ry="5" fill="#f1f5f9" />
            </g>

            <g transform="translate(145, 25)">
              <ellipse cx="0" cy="0" rx="18" ry="14" fill="#451a03" stroke="#290f02" strokeWidth="2" />
              <ellipse cx="0" cy="0" rx="13" ry="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
              <ellipse cx="0" cy="0" rx="7" ry="5" fill="#f1f5f9" />
            </g>

            {/* Front Row Modaks */}
            {[-75, -25, 25, 75].map((fx, i) => (
              <g key={i} transform={`translate(${fx}, ${30 + (i % 2) * 5})`}>
                <path d="M 0 -28 C -20 8, 20 8, 0 -28 Z" fill="url(#modakGrad)" stroke="#ca8a04" strokeWidth="1.5" />
                <circle cx="0" cy="-26" r="2.5" fill="#ea580c" />
              </g>
            ))}

            {/* GIANT MAHA MODAK (Crowned Centerpiece of the Thali) */}
            <g transform="translate(0, -10)">
              {/* Golden Base Shadow */}
              <ellipse cx="0" cy="22" rx="48" ry="16" fill="#78350f" opacity="0.6" />

              {/* Giant Modak Body with Distinct Traditional Steamed Pleats */}
              <path
                d="M 0 -85 
                   C -25 -40, -52 -5, -48 20 
                   C -42 38, 42 38, 48 20 
                   C 52 -5, 25 -40, 0 -85 Z"
                fill="url(#modakGrad)"
                stroke="#b45309"
                strokeWidth="3"
              />

              {/* Individual Authentic Saffron Pleats */}
              <path d="M 0 -85 Q -15 -10 -25 25" stroke="#d97706" strokeWidth="2" fill="none" opacity="0.75" />
              <path d="M 0 -85 Q 15 -10 25 25" stroke="#d97706" strokeWidth="2" fill="none" opacity="0.75" />
              <path d="M 0 -85 Q 0 0 0 28" stroke="#d97706" strokeWidth="2" fill="none" opacity="0.75" />
              <path d="M 0 -85 Q -32 5 -42 20" stroke="#d97706" strokeWidth="1.5" fill="none" opacity="0.5" />
              <path d="M 0 -85 Q 32 5 42 20" stroke="#d97706" strokeWidth="1.5" fill="none" opacity="0.5" />

              {/* Saffron Tika on Tip & Glistening Silver Vark */}
              <circle cx="0" cy="-80" r="5" fill="#dc2626" />
              <circle cx="0" cy="-80" r="2" fill="#fef08a" />
              <circle cx="-12" cy="-20" r="3" fill="#ffffff" opacity="0.85" />
              <circle cx="10" cy="-10" r="2.5" fill="#ffffff" opacity="0.85" />
            </g>
          </g>

          {/* Fragrant Incense (Agarbatti) Stand on Bottom Left */}
          <g transform="translate(60, 335)">
            <ellipse cx="0" cy="18" rx="24" ry="7" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1.5" />
            <line x1="-8" y1="15" x2="-22" y2="-40" stroke="#78350f" strokeWidth="2.5" />
            <line x1="0" y1="15" x2="0" y2="-48" stroke="#78350f" strokeWidth="2.5" />
            <line x1="8" y1="15" x2="22" y2="-40" stroke="#78350f" strokeWidth="2.5" />
            {/* Glowing Tips */}
            <circle cx="-22" cy="-40" r="2.5" fill="#ef4444" />
            <circle cx="0" cy="-48" r="2.5" fill="#ef4444" />
            <circle cx="22" cy="-40" r="2.5" fill="#ef4444" />
            {/* Ethereal Smoke Spirals */}
            <path d="M 0 -50 Q -15 -75 0 -95 Q 15 -115 0 -130" stroke="#e2e8f0" strokeWidth="2" fill="none" opacity="0.5" strokeDasharray="4 2" />
          </g>

          {/* Fresh Yellow Bananas & Green Betel Leaves on Bottom Right */}
          <g transform="translate(540, 335)">
            <ellipse cx="0" cy="18" rx="26" ry="8" fill="#180c02" opacity="0.4" />
            {/* Bananas */}
            <path d="M -15 15 Q -5 -8 20 5" stroke="#eab308" strokeWidth="10" strokeLinecap="round" fill="none" />
            <path d="M -10 20 Q 5 0 25 15" stroke="#facc15" strokeWidth="10" strokeLinecap="round" fill="none" />
            {/* Betel leaf (Paan) */}
            <path d="M -15 10 C -25 0, -5 -15, 5 0 C 15 -15, 35 0, 25 10 Z" fill="#15803d" stroke="#166534" strokeWidth="1" />
            {/* Supari */}
            <circle cx="5" cy="5" r="4" fill="#78350f" />
          </g>
        </g>
      )}

      {/* PUZZLE 3: DEEPOTSAV & MANGAL AARTI */}
      {puzzleIndex === 3 && (
        <g id="scene-deepotsav-aarti">
          <defs>
            <linearGradient id="aartiSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a0505" />
              <stop offset="35%" stopColor="#3d070d" />
              <stop offset="70%" stopColor="#5c0f18" />
              <stop offset="100%" stopColor="#240407" />
            </linearGradient>
            <radialGradient id="panchaartiGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="25%" stopColor="#fef08a" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="85%" stopColor="#dc2626" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#1a0505" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Deep Devotional Night Sanctum */}
          <rect x="0" y="0" width="600" height="400" fill="url(#aartiSky)" />

          {/* Temple Stone Archway with Ringing Temple Bells */}
          <path d="M 0 55 Q 300 -10 600 55 L 600 0 L 0 0 Z" fill="#450a0a" stroke="#b45309" strokeWidth="3" />
          <path d="M 40 60 Q 300 0 560 60" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="8 4" />

          {/* Top Hanging Brass Temple Bells */}
          {[100, 200, 300, 400, 500].map((bx, idx) => (
            <g key={bx} transform={`translate(${bx}, 25)`}>
              <line x1="0" y1="0" x2="0" y2="40" stroke="#f59e0b" strokeWidth="2.5" />
              <path d="M -12 40 C -12 28, 12 28, 12 40 L 16 58 L -16 58 Z" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1.5" />
              <circle cx="0" cy="62" r="4" fill="#ea580c" />
            </g>
          ))}

          {/* Header Aarti Chant */}
          <text x="300" y="32" fill="#fef08a" fontSize="16" fontWeight="bold" fontFamily="'Cinzel', serif" textAnchor="middle" letterSpacing="3">
            ✦ कर्पूरगौरं करुणावतारं • मंगल आरती दीपोत्सव ✦
          </text>

          {/* Majestic 7-Tier Brass Samai Lamps on Sides */}
          {/* Left Samai */}
          <g transform="translate(85, 230)">
            <ellipse cx="0" cy="130" rx="35" ry="12" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="2" />
            <rect x="-6" y="-70" width="12" height="200" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1.5" />
            {[-50, -10, 30, 70].map((sy, i) => (
              <g key={i} transform={`translate(0, ${sy})`}>
                <ellipse cx="0" cy="0" rx={28 - i * 3} ry={8 - i * 0.8} fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1" />
                {/* 2 wicks */}
                <path d={`M ${-(24 - i * 3)} -10 C ${-(27 - i * 3)} -5, ${-(21 - i * 3)} -5, ${-(24 - i * 3)} -10 Z`} fill="url(#flame)" />
                <path d={`M ${24 - i * 3} -10 C ${21 - i * 3} -5, ${27 - i * 3} -5, ${24 - i * 3} -10 Z`} fill="url(#flame)" />
              </g>
            ))}
            {/* Top Flame */}
            <path d="M 0 -88 C -7 -78, -7 -70, 0 -68 C 7 -70, 7 -78, 0 -88 Z" fill="url(#flame)" />
          </g>

          {/* Right Samai */}
          <g transform="translate(515, 230)">
            <ellipse cx="0" cy="130" rx="35" ry="12" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="2" />
            <rect x="-6" y="-70" width="12" height="200" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1.5" />
            {[-50, -10, 30, 70].map((sy, i) => (
              <g key={i} transform={`translate(0, ${sy})`}>
                <ellipse cx="0" cy="0" rx={28 - i * 3} ry={8 - i * 0.8} fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1" />
                <path d={`M ${-(24 - i * 3)} -10 C ${-(27 - i * 3)} -5, ${-(21 - i * 3)} -5, ${-(24 - i * 3)} -10 Z`} fill="url(#flame)" />
                <path d={`M ${24 - i * 3} -10 C ${21 - i * 3} -5, ${27 - i * 3} -5, ${24 - i * 3} -10 Z`} fill="url(#flame)" />
              </g>
            ))}
            <path d="M 0 -88 C -7 -78, -7 -70, 0 -68 C 7 -70, 7 -78, 0 -88 Z" fill="url(#flame)" />
          </g>

          {/* Sacred Floor Rangoli with Lit Diyas */}
          <g transform="translate(300, 340)">
            <ellipse cx="0" cy="20" rx="190" ry="40" fill="#450a0a" stroke="#b45309" strokeWidth="2" />
            <ellipse cx="0" cy="20" rx="150" ry="30" fill="#831843" stroke="#facc15" strokeWidth="2" strokeDasharray="6 4" />
            
            {/* Lit Clay Diyas along Rangoli curve */}
            {[-140, -90, -40, 0, 40, 90, 140].map((dx, idx) => (
              <g key={idx} transform={`translate(${dx}, ${18 + Math.abs(dx) * 0.08})`}>
                <ellipse cx="0" cy="5" rx="11" ry="4" fill="#9a3412" stroke="#7c2d12" strokeWidth="1" />
                <path d="M 0 -7 C -4 -4, -4 -1, 0 1 C 4 -1, 4 -4, 0 -7 Z" fill="url(#flame)" />
              </g>
            ))}
          </g>

          {/* Brilliant Radiant Halo of the Panchaarti */}
          <circle cx="300" cy="180" r="165" fill="url(#panchaartiGlow)" />

          {/* Grand Sacred 5-Flame Brass Panchaarti (Centerpiece) */}
          <g id="panchaarti" transform="translate(300, 205)">
            {/* Peacock Engraved Brass Handle */}
            <path
              d="M 0 120 
                 C 25 100, 40 60, 25 20 
                 C 15 -5, -15 -5, -25 20 
                 C -40 60, -25 100, 0 120 Z"
              fill="url(#pandalPillar)"
              stroke="#78350f"
              strokeWidth="2"
            />
            {/* Peacock head on handle */}
            <circle cx="0" cy="85" r="9" fill="#0284c7" stroke="#facc15" strokeWidth="1" />
            <ellipse cx="0" cy="72" rx="4" ry="7" fill="#059669" />

            {/* Panchaarti Arc Base Plate */}
            <path
              d="M -130 -20 
                 Q 0 25 130 -20 
                 Q 0 5 -130 -20 Z"
              fill="url(#goldThali)"
              stroke="#78350f"
              strokeWidth="2.5"
            />

            {/* 5 Brass Diya Cups & Majestic Holy Aarti Flames */}
            {/* Flame 1: Far Left */}
            <g transform="translate(-110, -26)">
              <ellipse cx="0" cy="4" rx="14" ry="6" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1" />
              <path d="M 0 -38 C -11 -22, -11 -8, 0 -4 C 11 -8, 11 -22, 0 -38 Z" fill="url(#flame)" />
              <circle cx="0" cy="-14" r="3" fill="#ffffff" />
            </g>

            {/* Flame 2: Mid Left */}
            <g transform="translate(-55, -15)">
              <ellipse cx="0" cy="4" rx="15" ry="6" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1" />
              <path d="M 0 -44 C -13 -26, -13 -10, 0 -5 C 13 -10, 13 -26, 0 -44 Z" fill="url(#flame)" />
              <circle cx="0" cy="-16" r="3.5" fill="#ffffff" />
            </g>

            {/* Flame 3: High Center (King Flame with burning camphor / karpoor) */}
            <g transform="translate(0, -6)">
              <ellipse cx="0" cy="5" rx="18" ry="7" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1.5" />
              {/* White Camphor Block in cup */}
              <rect x="-6" y="0" width="12" height="5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
              {/* Giant Towering Sacred Fire */}
              <path d="M 0 -62 C -18 -38, -18 -15, 0 -7 C 18 -15, 18 -38, 0 -62 Z" fill="url(#flame)" />
              <circle cx="0" cy="-22" r="5" fill="#ffffff" />
            </g>

            {/* Flame 4: Mid Right */}
            <g transform="translate(55, -15)">
              <ellipse cx="0" cy="4" rx="15" ry="6" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1" />
              <path d="M 0 -44 C -13 -26, -13 -10, 0 -5 C 13 -10, 13 -26, 0 -44 Z" fill="url(#flame)" />
              <circle cx="0" cy="-16" r="3.5" fill="#ffffff" />
            </g>

            {/* Flame 5: Far Right */}
            <g transform="translate(110, -26)">
              <ellipse cx="0" cy="4" rx="14" ry="6" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1" />
              <path d="M 0 -38 C -11 -22, -11 -8, 0 -4 C 11 -8, 11 -22, 0 -38 Z" fill="url(#flame)" />
              <circle cx="0" cy="-14" r="3" fill="#ffffff" />
            </g>
          </g>

          {/* Sacred White Shankha (Conch Shell) on Tripod Stand on Left */}
          <g transform="translate(175, 295)">
            {/* Brass Stand */}
            <ellipse cx="0" cy="18" rx="20" ry="6" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1" />
            <path d="M -10 18 L -6 6 L 6 6 L 10 18 Z" fill="url(#pandalPillar)" />
            {/* Sacred Pure White Shankha with Red Tilak */}
            <path
              d="M -22 6 
                 C -25 -12, 10 -22, 24 -6 
                 C 28 4, 18 14, 0 10 
                 C -12 8, -20 12, -22 6 Z"
              fill="#f8fafc"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            {/* Spiral lines */}
            <path d="M 12 -4 Q 18 2 12 8" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
            <circle cx="2" cy="0" r="2" fill="#dc2626" />
          </g>

          {/* Sacred Brass Mandir Ghanta (Aarti Bell) on Right */}
          <g transform="translate(425, 295)">
            <ellipse cx="0" cy="18" rx="20" ry="6" fill="#1a0505" opacity="0.4" />
            {/* Bell Body */}
            <path d="M -16 16 C -16 0, 16 0, 16 16 L 20 22 L -20 22 Z" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1.5" />
            {/* Garuda Handle */}
            <rect x="-3" y="-12" width="6" height="16" fill="url(#pandalPillar)" stroke="#78350f" strokeWidth="1" />
            <circle cx="0" cy="-16" r="6" fill="#facc15" stroke="#78350f" strokeWidth="1" />
            <circle cx="0" cy="24" r="3.5" fill="#ca8a04" />
          </g>
        </g>
      )}
    </svg>
  );
};
