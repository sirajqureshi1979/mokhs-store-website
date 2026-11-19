import React from 'react';
import { ArrowDown, Pause, Play } from 'lucide-react';
import { BOTTLE_SPECS, type BottleIndex, type DropPhase } from '../three/types';

interface BottleDropSectionProps {
  activeBottle: BottleIndex;
  dropPhase: DropPhase;
  autoDrop: boolean;
  scrollProgress: number;
  onSelectBottle: (bottle: BottleIndex) => void;
  onToggleAutoDrop: () => void;
}

const PHASE_LABEL: Record<DropPhase, string> = {
  lifting: 'Step 1 · Lifting clear of bottle neck',
  swapping: 'Step 2 · Aligning next bottle size',
  dropping: 'Step 3 · Dropping onto neck collar',
  seated: 'Sealed on neck · Ready to pour',
};

function BottleSilhouette({ index, active }: { index: BottleIndex; active: boolean }) {
  const stroke = active ? '#38bdf8' : '#7ea2c2';
  const fill = active ? 'rgba(56, 189, 248, 0.22)' : 'rgba(126, 162, 194, 0.1)';

  if (index === 0) {
    return (
      <svg viewBox="0 0 44 62" className="h-12 w-9 shrink-0" aria-hidden="true">
        <path
          d="M18 3h8v6c0 3 13 6 13 14v33c0 2-1.5 3-3 3H8c-1.5 0-3-1-3-3V23c0-8 13-11 13-14z"
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
        />
        <path d="M6 34h32M6 45h32" stroke={stroke} strokeOpacity="0.55" strokeWidth="1.5" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 44 62" className="h-12 w-9 shrink-0" aria-hidden="true">
        <path
          d="M17 11h8v5c0 2.5 9 4.5 9 10v29c0 1.8-1.2 3-3 3H11c-1.8 0-3-1.2-3-3V26c0-5.5 9-7.5 9-10z"
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
        />
        <path
          d="M34 30c6 0 6 15 0 15"
          fill="none"
          stroke={stroke}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 44 62" className="h-12 w-9 shrink-0" aria-hidden="true">
      <path
        d="M19 18h6v4c0 2 5 3.5 5 8v25c0 1.5-1 2.5-2.5 2.5h-11C15 57.5 14 56.5 14 55V30c0-4.5 5-6 5-8z"
        fill={active ? 'rgba(52, 211, 153, 0.22)' : fill}
        stroke={active ? '#34d399' : stroke}
        strokeWidth="2"
      />
      <rect
        x="14"
        y="37"
        width="16"
        height="9"
        fill={active ? 'rgba(52, 211, 153, 0.35)' : 'rgba(126, 162, 194, 0.2)'}
      />
    </svg>
  );
}

export const BottleDropSection: React.FC<BottleDropSectionProps> = ({
  activeBottle,
  dropPhase,
  autoDrop,
  scrollProgress,
  onSelectBottle,
  onToggleAutoDrop,
}) => {
  const currentSpec = BOTTLE_SPECS[activeBottle];

  return (
    <section
      id="bottles"
      data-scene="bottles"
      className="relative z-10 min-h-[290vh] px-5 pt-24 pb-20 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="sticky top-24 max-w-[530px] rounded-2xl border border-sky-200/14 bg-[#051022]/88 p-6 sm:p-8 lg:w-[44vw] lg:bg-[#051022]/80">
          {/* Header & Step Counter */}
          <div className="flex items-center justify-between gap-4 text-xs font-medium text-sky-300">
            <span className="tracking-wide">One pump · Three bottle sizes</span>
            <span className="font-mono tabular-nums text-slate-400">
              0{activeBottle + 1} / 03
            </span>
          </div>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
            Drops onto every bottle, step by step.
          </h2>

          <p className="mt-3 text-[15px] leading-relaxed text-slate-300">
            Scroll down to watch the MOKHS pump lift, swap sizes, and seat directly
            onto a 5-gallon barrel, a 3-gallon handle jug, and a 1.5 L travel bottle.
          </p>

          {/* Live Choreography Readout (clean unboxed text) */}
          <div className="mt-5 flex items-center justify-between gap-3 border-y border-sky-200/12 py-3 text-xs">
            <span className="font-medium text-sky-200">{PHASE_LABEL[dropPhase]}</span>
            <span className="font-mono tabular-nums text-slate-400">
              {currentSpec.neckDiameter}
            </span>
          </div>

          {/* Interactive 3-Step Bottle Drop Cards */}
          <div className="mt-5 grid grid-cols-3 gap-2.5" role="tablist" aria-label="Bottle size drop steps">
            {BOTTLE_SPECS.map((spec) => {
              const isSelected = activeBottle === spec.id;
              return (
                <button
                  key={spec.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onSelectBottle(spec.id)}
                  className={`flex flex-col items-center rounded-xl border px-2.5 py-3.5 text-center transition-all duration-200 focus-visible:outline-2 focus-visible:outline-sky-400 ${
                    isSelected
                      ? 'border-sky-400/80 bg-sky-400/14 text-white'
                      : 'border-sky-200/12 bg-[#071730]/70 text-slate-300 hover:border-sky-300/35 hover:text-white'
                  }`}
                >
                  <span className="mb-1.5 font-mono text-[11px] tabular-nums text-sky-300">
                    Step 0{spec.id + 1}
                  </span>
                  <BottleSilhouette index={spec.id} active={isSelected} />
                  <span className="mt-2 whitespace-nowrap text-xs font-semibold">
                    {spec.shortLabel}
                  </span>
                  <span className="mt-0.5 whitespace-nowrap text-[11px] text-slate-400">
                    {spec.volume}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Bottle Technical Detail */}
          <div className="mt-5 space-y-1.5">
            <h3 className="text-base font-semibold text-white">
              {currentSpec.title}
            </h3>
            <p className="text-sm leading-relaxed text-slate-300">
              {currentSpec.description}
            </p>
            <p className="text-xs text-slate-400">
              {currentSpec.fitDetail} · {currentSpec.heightCm}
            </p>
          </div>

          {/* Step Scroll Progress Bar + Auto-Play Action */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onToggleAutoDrop}
              className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-sky-400 px-4 text-xs font-semibold text-slate-950 transition-colors duration-150 hover:bg-sky-300 focus-visible:outline-2 focus-visible:outline-sky-300"
            >
              {autoDrop ? (
                <>
                  <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                  Pause Auto-Drop
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  Auto-Play 3-Bottle Drop
                </>
              )}
            </button>

            <div className="flex flex-1 items-center gap-2.5">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-sky-400 transition-transform duration-150 ease-out origin-left"
                  style={{
                    transform: `scaleX(${Math.max(0.06, scrollProgress)})`,
                  }}
                />
              </div>
              <span className="inline-flex items-center gap-1 whitespace-nowrap font-mono text-[11px] text-slate-400">
                <ArrowDown className="h-3 w-3" aria-hidden="true" />
                Scroll
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
