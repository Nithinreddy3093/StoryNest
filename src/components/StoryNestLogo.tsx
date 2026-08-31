import React from 'react';

interface StoryNestLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const StoryNestLogo: React.FC<StoryNestLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none cursor-pointer group ${className}`}>
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        {/* Glowing book logo mark */}
        <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-md group-hover:bg-amber-500/35 transition-all duration-300"></div>
        <svg
          viewBox="0 0 40 34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-[0_2px_8px_rgba(245,158,11,0.35)]"
        >
          {/* Left open page */}
          <path
            d="M20 28C14 26 6 26 2 28V6C6 4 14 4 20 7V28Z"
            fill="url(#goldGradientLeft)"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Right open page */}
          <path
            d="M20 28C26 26 34 26 38 28V6C34 4 26 4 20 7V28Z"
            fill="url(#goldGradientRight)"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Center spine */}
          <path
            d="M20 7V28"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Page lines */}
          <path d="M7 11C11 10 15 10.5 17 12" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" strokeLinecap="round" />
          <path d="M7 16C11 15 15 15.5 17 17" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" strokeLinecap="round" />
          <path d="M7 21C11 20 15 20.5 17 22" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" strokeLinecap="round" />

          <path d="M23 12C25 10.5 29 10 33 11" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" strokeLinecap="round" />
          <path d="M23 17C25 15.5 29 15 33 16" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" strokeLinecap="round" />
          <path d="M23 22C25 20.5 29 20 33 21" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" strokeLinecap="round" />

          <defs>
            <linearGradient id="goldGradientLeft" x1="2" y1="6" x2="20" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#b45309" />
              <stop offset="1" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="goldGradientRight" x1="20" y1="6" x2="38" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#d97706" />
              <stop offset="1" stopColor="#92400e" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex flex-col justify-center">
        <span className={`font-serif-heading font-bold tracking-wide text-slate-50 leading-none group-hover:text-amber-300 transition-colors ${textSizes[size]}`}>
          Story<span className="text-amber-400 italic font-normal">Nest</span>
        </span>
        {showTagline && (
          <span className="text-[10px] sm:text-[11px] text-amber-200/70 font-sans-ui tracking-wider mt-0.5 whitespace-nowrap">
            Stories that stay with you
          </span>
        )}
      </div>
    </div>
  );
};
