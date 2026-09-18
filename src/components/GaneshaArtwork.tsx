import React from 'react';

interface GaneshaArtworkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showDiyas?: boolean;
}

export const GaneshaArtwork: React.FC<GaneshaArtworkProps> = ({
  className = '',
  size = 'md',
  showDiyas = true,
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full max-w-[480px] drop-shadow-2xl select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Radial Gradient for Divine Prabhavali (Halo) */}
          <radialGradient id="haloGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="85%" stopColor="#b45309" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
          </radialGradient>

          {/* Golden Shimmer Gradients */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <linearGradient id="royalMaroon" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#450a0a" />
          </linearGradient>

          <linearGradient id="saffronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="50%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="40%" stopColor="#f97316" />
            <stop offset="80%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffedd5" />
            <stop offset="60%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>

          <linearGradient id="lotusPink" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbcfe8" />
            <stop offset="50%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#be185d" />
          </linearGradient>
        </defs>

        {/* 1. Prabhavali / Divine Golden Halo */}
        <circle cx="250" cy="220" r="170" fill="url(#haloGlow)" />
        <circle
          cx="250"
          cy="220"
          r="135"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="3"
          strokeDasharray="6 8"
          opacity="0.8"
        />
        {/* Halo rays */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 360) / 24;
          return (
            <line
              key={i}
              x1="250"
              y1="220"
              x2="250"
              y2="90"
              stroke="#fbbf24"
              strokeWidth="2"
              opacity="0.5"
              transform={`rotate(${angle} 250 220)`}
            />
          );
        })}

        {/* 2. Lotus Base Pedestal (Padmasana) */}
        <g id="lotus-pedestal">
          {/* Outer back petals */}
          <path d="M 170 410 C 130 380, 110 430, 160 450 Z" fill="url(#lotusPink)" />
          <path d="M 330 410 C 370 380, 390 430, 340 450 Z" fill="url(#lotusPink)" />
          
          {/* Main front petals */}
          <path d="M 210 410 C 170 450, 190 475, 250 475 C 310 475, 330 450, 290 410 Z" fill="url(#lotusPink)" />
          <path d="M 150 435 C 190 470, 220 470, 250 460 C 210 450, 180 435, 150 435 Z" fill="#db2777" />
          <path d="M 350 435 C 310 470, 280 470, 250 460 C 290 450, 320 435, 350 435 Z" fill="#db2777" />
          
          {/* Golden base rim */}
          <ellipse cx="250" cy="465" rx="140" ry="16" fill="url(#goldGrad)" stroke="#78350f" strokeWidth="2" />
        </g>

        {/* 3. Lord Ganesha Divine Form */}
        <g id="ganesha-body">
          {/* Legs folded in padmasana with royal dhoti */}
          <ellipse cx="250" cy="385" rx="110" ry="40" fill="url(#saffronGrad)" stroke="#c2410c" strokeWidth="2" />
          <path d="M 150 380 Q 250 410 350 380 Q 250 425 150 380 Z" fill="url(#goldGrad)" opacity="0.9" />

          {/* Torso / Divine Belly (Lambodara) */}
          <ellipse cx="250" cy="320" rx="78" ry="68" fill="url(#skinGrad)" stroke="#fb923c" strokeWidth="2" />
          
          {/* Golden Pitambara sash & Sacred Thread (Janeu) */}
          <path
            d="M 210 270 Q 240 330 280 375"
            stroke="#ffffff"
            strokeWidth="4"
            fill="none"
            strokeDasharray="4 2"
          />
          {/* Golden necklace (Kanthahara) */}
          <path
            d="M 215 280 Q 250 320 285 280"
            stroke="url(#goldGrad)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="250" cy="305" r="7" fill="#dc2626" stroke="#fef08a" strokeWidth="1.5" />

          {/* Arms */}
          {/* Upper Right Hand with Parashu / Ankusha */}
          <g>
            <path d="M 180 290 C 130 270, 110 230, 140 210" stroke="url(#skinGrad)" strokeWidth="16" strokeLinecap="round" fill="none" />
            <circle cx="140" cy="205" r="10" fill="url(#skinGrad)" />
            {/* Golden Ankusha */}
            <path d="M 130 180 L 150 230" stroke="url(#goldGrad)" strokeWidth="4" />
            <path d="M 135 185 Q 160 175 145 200" fill="none" stroke="url(#goldGrad)" strokeWidth="4" />
          </g>

          {/* Upper Left Hand with Sacred Lotus / Pasha */}
          <g>
            <path d="M 320 290 C 370 270, 390 230, 360 210" stroke="url(#skinGrad)" strokeWidth="16" strokeLinecap="round" fill="none" />
            <circle cx="360" cy="205" r="10" fill="url(#skinGrad)" />
            {/* Sacred Lotus */}
            <circle cx="365" cy="190" r="12" fill="url(#lotusPink)" />
            <circle cx="365" cy="190" r="6" fill="#fef08a" />
          </g>

          {/* Lower Left Hand holding Bowl of Modaks */}
          <g>
            <path d="M 315 325 C 345 340, 355 365, 330 380" stroke="url(#skinGrad)" strokeWidth="15" strokeLinecap="round" fill="none" />
            {/* Golden Bowl */}
            <ellipse cx="325" cy="365" rx="22" ry="10" fill="url(#goldGrad)" stroke="#78350f" strokeWidth="1" />
            {/* Modaks in bowl */}
            <circle cx="320" cy="358" r="6" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="330" cy="358" r="6" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="325" cy="352" r="6" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
          </g>

          {/* Lower Right Hand in Abhaya Mudra (Blessing gesture) */}
          <g>
            <path d="M 185 325 C 160 340, 150 355, 175 365" stroke="url(#skinGrad)" strokeWidth="15" strokeLinecap="round" fill="none" />
            {/* Blessing Palm */}
            <circle cx="178" cy="355" r="13" fill="url(#skinGrad)" />
            {/* Sacred Red OM on palm */}
            <text x="178" y="359" fontSize="11" fontWeight="bold" fill="#dc2626" textAnchor="middle">ॐ</text>
          </g>

          {/* Large Respectful Divine Ears */}
          {/* Left Ear */}
          <path
            d="M 195 200 C 130 180, 110 240, 185 250 Z"
            fill="url(#skinGrad)"
            stroke="#ea580c"
            strokeWidth="2"
          />
          <path
            d="M 185 210 C 145 200, 135 235, 180 240 Z"
            fill="#fed7aa"
            opacity="0.8"
          />
          {/* Right Ear */}
          <path
            d="M 305 200 C 370 180, 390 240, 315 250 Z"
            fill="url(#skinGrad)"
            stroke="#ea580c"
            strokeWidth="2"
          />
          <path
            d="M 315 210 C 355 200, 365 235, 320 240 Z"
            fill="#fed7aa"
            opacity="0.8"
          />

          {/* Divine Head & Cheeks */}
          <ellipse cx="250" cy="215" rx="58" ry="50" fill="url(#skinGrad)" stroke="#fb923c" strokeWidth="2" />

          {/* Graceful Sacred Trunk (curving to left with Modak) */}
          <path
            d="M 242 225 
               C 242 270, 240 310, 215 325
               C 200 335, 185 330, 195 315
               C 205 305, 215 295, 220 260
               C 224 235, 228 220, 242 225 Z"
            fill="url(#skinGrad)"
            stroke="#ea580c"
            strokeWidth="1.5"
          />

          {/* Modak held delicately by trunk tip */}
          <g transform="translate(190, 305)">
            <path
              d="M 8 0 C 1 6, 0 12, 8 16 C 16 12, 15 6, 8 0 Z"
              fill="url(#goldGrad)"
              stroke="#ca8a04"
              strokeWidth="1"
            />
            {/* Kesar strand */}
            <line x1="8" y1="2" x2="8" y2="8" stroke="#dc2626" strokeWidth="1" />
          </g>

          {/* Peaceful, Compassionate Eyes */}
          {/* Left Eye */}
          <path d="M 220 205 Q 232 200 240 206 Q 230 212 220 205 Z" fill="#451a03" />
          <circle cx="230" cy="205" r="2" fill="#ffffff" />
          {/* Right Eye */}
          <path d="M 260 206 Q 268 200 280 205 Q 270 212 260 206 Z" fill="#451a03" />
          <circle cx="270" cy="205" r="2" fill="#ffffff" />

          {/* Tusks: Left whole, right half (Ekadanta) */}
          {/* Right tusk (broken tusk on Ganesha's right / viewer's left) */}
          <polygon points="230,232 233,243 237,232" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          {/* Left tusk (full tusk on viewer's right) */}
          <polygon points="263,232 268,252 271,232" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />

          {/* Sacred Triratna / Tilak on Forehead */}
          <path d="M 235 180 Q 250 175 265 180" stroke="#facc15" strokeWidth="3" fill="none" />
          <path d="M 236 185 Q 250 180 264 185" stroke="#facc15" strokeWidth="3" fill="none" />
          <path d="M 237 190 Q 250 185 263 190" stroke="#facc15" strokeWidth="3" fill="none" />
          {/* Red Kumkum Urdhva Pundra Center */}
          <ellipse cx="250" cy="182" rx="3.5" ry="7" fill="#dc2626" />
          <circle cx="250" cy="193" r="2.5" fill="#dc2626" />

          {/* 4. Royal Golden Mukut (Crown) */}
          <g id="crown">
            {/* Crown Base */}
            <path
              d="M 215 175 C 230 168, 270 168, 285 175 L 282 155 C 265 150, 235 150, 218 155 Z"
              fill="url(#goldGrad)"
              stroke="#78350f"
              strokeWidth="2"
            />
            {/* Crown Main Tower */}
            <path
              d="M 220 155 L 235 110 L 250 85 L 265 110 L 280 155 Z"
              fill="url(#goldGrad)"
              stroke="#78350f"
              strokeWidth="2"
            />
            {/* Ruby and Emerald insets */}
            <circle cx="250" cy="115" r="5" fill="#dc2626" stroke="#fef08a" strokeWidth="1" />
            <circle cx="238" cy="140" r="3.5" fill="#059669" stroke="#fef08a" strokeWidth="1" />
            <circle cx="262" cy="140" r="3.5" fill="#059669" stroke="#fef08a" strokeWidth="1" />
            <circle cx="250" cy="85" r="5" fill="#facc15" />
            {/* Peacock Feather Crest at top */}
            <ellipse cx="250" cy="72" rx="7" ry="12" fill="#0284c7" />
            <ellipse cx="250" cy="72" rx="4" ry="7" fill="#059669" />
            <circle cx="250" cy="72" r="2.5" fill="#facc15" />
          </g>

          {/* Marigold Flower Garland (Toran) across shoulders */}
          <g id="garland">
            {[170, 185, 202, 220, 240, 260, 280, 298, 315, 330].map((x, idx) => {
              const y = 300 + Math.sin(idx * 0.35) * 20;
              const isYellow = idx % 2 === 0;
              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r="7"
                  fill={isYellow ? '#fbbf24' : '#ea580c'}
                  stroke={isYellow ? '#d97706' : '#9a3412'}
                  strokeWidth="1"
                />
              );
            })}
          </g>

          {/* Mooshak (Devoted Mouse) near the foot */}
          <g id="mooshak" transform="translate(140, 420)">
            <ellipse cx="15" cy="15" rx="14" ry="9" fill="#94a3b8" />
            <circle cx="26" cy="11" r="6" fill="#94a3b8" />
            <circle cx="23" cy="6" r="3" fill="#cbd5e1" />
            <circle cx="28" cy="10" r="1" fill="#0f172a" />
            <path d="M 3 17 Q -5 15 -8 22" stroke="#94a3b8" strokeWidth="2" fill="none" />
            {/* Little Modak offered by Mooshak */}
            <circle cx="31" cy="15" r="3.5" fill="#facc15" />
          </g>
        </g>

        {/* 5. Auspicious Brass Diyas (Flanking) */}
        {showDiyas && (
          <>
            {/* Left Diya */}
            <g id="left-diya" transform="translate(45, 380)">
              <ellipse cx="25" cy="45" rx="20" ry="6" fill="url(#goldGrad)" stroke="#78350f" strokeWidth="1.5" />
              <path d="M 22 45 L 28 45 L 26 28 L 24 28 Z" fill="url(#goldGrad)" />
              <ellipse cx="25" cy="28" rx="18" ry="6" fill="url(#goldGrad)" stroke="#78350f" strokeWidth="1.5" />
              {/* Flame with animation */}
              <g className="animate-flame" transform="translate(25, 23)">
                <path
                  d="M 0 -22 C -6 -12, -7 -2, 0 2 C 7 -2, 6 -12, 0 -22 Z"
                  fill="url(#flameGrad)"
                />
                <circle cx="0" cy="-6" r="2" fill="#ffffff" />
              </g>
            </g>

            {/* Right Diya */}
            <g id="right-diya" transform="translate(410, 380)">
              <ellipse cx="25" cy="45" rx="20" ry="6" fill="url(#goldGrad)" stroke="#78350f" strokeWidth="1.5" />
              <path d="M 22 45 L 28 45 L 26 28 L 24 28 Z" fill="url(#goldGrad)" />
              <ellipse cx="25" cy="28" rx="18" ry="6" fill="url(#goldGrad)" stroke="#78350f" strokeWidth="1.5" />
              {/* Flame with animation */}
              <g className="animate-flame" transform="translate(25, 23)">
                <path
                  d="M 0 -22 C -6 -12, -7 -2, 0 2 C 7 -2, 6 -12, 0 -22 Z"
                  fill="url(#flameGrad)"
                />
                <circle cx="0" cy="-6" r="2" fill="#ffffff" />
              </g>
            </g>
          </>
        )}
      </svg>
    </div>
  );
};
