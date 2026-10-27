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
  size = 40,
  showText = true,
  variant = 'badge',
  includePredict = true,
}) => {
  const isWhite = variant === 'white';

  return (
    <div className={`inline-flex items-center space-x-2.5 sm:space-x-3 select-none ${className}`}>
      {/* Official CloudboyX Logo (New Cloud & 3D 'X' Mark) - replaces the previous blue square */}
      <div className="shrink-0 flex items-center justify-center transition-transform group-hover:scale-105">
        <img
          src="/assets/aistudio/4000cb__1__92a1d8de.png"
          alt="CloudboyX Logo"
          className="h-9 sm:h-10 md:h-11 w-auto max-w-[130px] object-contain rounded-lg shadow-xs"
          style={{ height: size ? Math.max(size, 34) : 40 }}
          loading="eager"
        />
      </div>

      {/* CloudboyX Typography Lockup */}
      {showText && (
        <div className="flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap min-w-0">
          <span
            className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-none ${
              isWhite ? 'text-white' : 'text-[#03045e] dark:text-white'
            }`}
          >
            Cloudboy
            <span className="bg-gradient-to-tr from-[#00d4ff] via-[#0077b6] to-[#7c3aed] bg-clip-text text-transparent ml-0.5">
              X
            </span>
          </span>
          {includePredict && (
            <span
              className={`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-none ${
                isWhite ? 'text-[#90e0ef]' : 'text-[#0077b6] dark:text-[#38bdf8]'
              }`}
            >
              Predict
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CloudboyXLogo;

