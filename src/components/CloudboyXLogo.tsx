import React from 'react';

interface CloudboyXLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  variant?: 'navy' | 'white' | 'badge';
  includePredict?: boolean;
}

export const CloudboyXLogo: React.FC<CloudboyXLogoProps> = ({
  className = '',
  size = 46,
  showText = true,
  variant = 'badge',
  includePredict = true,
}) => {
  const isWhite = variant === 'white';
  const isBadge = variant === 'badge';
  const strokeColor = isWhite || isBadge ? '#ffffff' : '#03045e';

  return (
    <div className={`inline-flex items-center space-x-2.5 sm:space-x-3 select-none ${className}`}>
      {/* Mountain-Cloud Infinity Emblem from cbffinal.png */}
      <div
        className={`shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 ${
          isBadge
            ? 'p-2 sm:p-2.5 rounded-2xl bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8] shadow-md border border-[#90e0ef]/60'
            : ''
        }`}
        style={{ width: isBadge ? size + 14 : size, height: isBadge ? size + 14 : size }}
      >
        <svg
          viewBox="0 0 540 250"
          width={size}
          height={Math.round((size * 250) / 540)}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 drop-shadow-xs"
          aria-label="CloudboyX Infinity Mountain-Cloud Emblem"
        >
          <defs>
            <linearGradient id="cbxInfinityX" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="40%" stopColor="#0077b6" />
              <stop offset="75%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <filter id="cbxSoftGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#03045e" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Infinity Mountain-Cloud Contour */}
          <g stroke={strokeColor} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Mountain Peak (Left side of infinity) */}
            <path d="M 68 200 L 172 32 L 242 138" />
            <path d="M 68 200 C 54 200, 48 185, 56 172 L 172 32" />

            {/* Mountain Inner Ridge / 'F' Facet */}
            <path d="M 172 32 L 142 85 L 165 92" />
            <path d="M 142 85 L 124 122 L 148 128" />

            {/* Cloud Lobes (Right side of infinity) */}
            <path d="M 235 130 C 245 105, 265 80, 298 75 C 328 70, 355 88, 362 105 C 382 72, 435 68, 460 102 C 485 135, 475 180, 452 200 C 420 228, 350 228, 295 210 C 260 198, 240 170, 222 142 C 200 108, 140 200, 68 200" />

            {/* Lower crossover link */}
            <path d="M 242 138 C 255 160, 275 185, 305 200" />
          </g>
        </svg>
      </div>

      {/* CloudboyX Typography Lockup */}
      {showText && (
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 whitespace-nowrap min-w-0">
          <span className="text-xl sm:text-2xl md:text-3xl font-black text-[#03045e] tracking-tight leading-none">
            Cloudboy
            <span className="bg-gradient-to-tr from-[#00d4ff] via-[#0077b6] to-[#7c3aed] bg-clip-text text-transparent ml-0.5">
              X
            </span>
          </span>
          {includePredict && (
            <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0077b6] tracking-tight leading-none">
              Predict
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CloudboyXLogo;
