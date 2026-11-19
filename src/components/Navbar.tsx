import React from 'react';

export function MokhsMark({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="mokhsTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7ff0ff" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="mokhsLeft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22b8ff" />
          <stop offset="100%" stopColor="#1a5cff" />
        </linearGradient>
        <linearGradient id="mokhsRight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a63ff" />
          <stop offset="100%" stopColor="#2d1ec4" />
        </linearGradient>
      </defs>
      <path d="M100 8L184 56L100 104L16 56Z" fill="url(#mokhsTop)" />
      <path d="M16 56L100 104V196L16 148Z" fill="url(#mokhsLeft)" />
      <path d="M184 56L100 104V196L184 148Z" fill="url(#mokhsRight)" />
      <path
        d="M44 152V86L100 122L156 86V152"
        fill="none"
        stroke="#ffffff"
        strokeWidth="17"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="100" cy="56" r="9" fill="#ffffff" />
    </svg>
  );
}

const NAV_LINKS = [
  { href: '#bottles', label: '3-Bottle Drop' },
  { href: '#assembly', label: 'Assembly' },
  { href: '#features', label: 'Features' },
  { href: '#install', label: 'Setup' },
  { href: '#real', label: 'Photos' },
];

export const Navbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 border-b border-sky-200/12 bg-[#030b17]/90">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-8 px-5 sm:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#hero"
          className="flex shrink-0 items-center gap-2.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400"
          aria-label="MOKHS home"
        >
          <MokhsMark className="h-8 w-8 shrink-0" />
          <span className="font-display text-lg font-extrabold tracking-[0.16em] text-white">
            MOKHS
          </span>
        </a>

        {/* Zone 2: 5 concise single-line text nav links */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-7 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="shrink-0 whitespace-nowrap text-sm font-medium text-slate-300 transition-colors duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="shrink-0">
          <a
            href="#order"
            className="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-sky-400 px-5 text-sm font-semibold text-slate-950 transition-colors duration-150 hover:bg-sky-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            Order Now
          </a>
        </div>
      </div>
    </header>
  );
};
