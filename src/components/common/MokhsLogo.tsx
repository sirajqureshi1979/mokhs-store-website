import React from 'react';

interface MokhsLogoProps {
  variant?: 'full' | 'compact' | 'icon' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'dark' | 'light';
  className?: string;
}

export const MokhsLogo: React.FC<MokhsLogoProps> = ({
  variant = 'compact',
  size = 'md',
  theme = 'light',
  className = '',
}) => {
  // Icon dimensions
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[11px]',
    xl: 'text-xs',
  };

  const isLightMode = theme === 'light';

  // SVG Emblem - Precision Tech Shield with Circuit 'M' & Gold / Electric Blue Accents
  const Emblem = (
    <div
      className={`${iconSizes[size]} relative shrink-0 flex items-center justify-center rounded-xl shadow-md transition-transform duration-200 group-hover:scale-105`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          <linearGradient id="mokhsBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="mokhsGoldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>
          <linearGradient id="shieldBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
        </defs>

        {/* Outer Shield Hexagon Container */}
        <polygon
          points="50,4 92,25 92,75 50,96 8,75 8,25"
          fill="url(#shieldBgGrad)"
          stroke="#1E293B"
          strokeWidth="3"
        />

        {/* Inner Electric Accent Ring */}
        <polygon
          points="50,9 86,28 86,72 50,91 14,72 14,28"
          stroke="url(#mokhsBlueGrad)"
          strokeWidth="2"
          strokeDasharray="4 2"
          fill="none"
          opacity="0.8"
        />

        {/* Architectural 'M' Geometric Monogram */}
        {/* Left Pillar */}
        <path
          d="M26 70 L26 30 L38 30 L48 52 L42 64 L34 46 L34 70 Z"
          fill="url(#mokhsBlueGrad)"
        />
        {/* Right Pillar */}
        <path
          d="M74 70 L74 30 L62 30 L52 52 L58 64 L66 46 L66 70 Z"
          fill="url(#mokhsBlueGrad)"
        />

        {/* Center Precision Crest Apex (Gold & Electric Spark) */}
        <polygon points="50,33 58,48 50,44 42,48" fill="url(#mokhsGoldGrad)" />

        {/* Center Circuit Core Node */}
        <circle cx="50" cy="58" r="4.5" fill="#38BDF8" />
        <circle cx="50" cy="58" r="2" fill="#FFFFFF" />

        {/* Bottom Horizon Accent Bar */}
        <rect x="36" y="74" width="28" height="3" rx="1.5" fill="url(#mokhsGoldGrad)" />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{Emblem}</div>;
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-blue-200/60 bg-blue-50/70 text-slate-800 ${className}`}
      >
        <div className="w-5 h-5">{Emblem}</div>
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-extrabold tracking-tight text-slate-900 leading-none">
            MOKHS<span className="text-blue-600">.STORE</span>
          </span>
          <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wider">
            Official Startup Launch
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {Emblem}

      <div className="flex flex-col text-left">
        <div className="flex items-baseline leading-none">
          <span
            className={`font-extrabold tracking-tight font-sans ${textSizes[size]} ${
              isLightMode ? 'text-slate-950' : 'text-white'
            }`}
          >
            MOKHS
          </span>
          <span className={`font-extrabold text-blue-600 ${textSizes[size]}`}>.STORE</span>
        </div>

        {variant === 'full' && (
          <span
            className={`font-bold tracking-wider uppercase mt-1 ${taglineSizes[size]} ${
              isLightMode ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Smart Electronics · Pakistan
          </span>
        )}
      </div>
    </div>
  );
};
