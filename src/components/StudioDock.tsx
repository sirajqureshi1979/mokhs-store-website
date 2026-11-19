import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Droplets, Pause, Play } from 'lucide-react';
import { BOTTLE_SPECS, type BottleIndex, type PumpFinish } from '../three/types';

interface StudioDockProps {
  activeBottle: BottleIndex;
  finish: PumpFinish;
  pourEnabled: boolean;
  autoDrop: boolean;
  onSelectBottle: (bottle: BottleIndex) => void;
  onToggleAutoDrop: () => void;
  onTogglePour: () => void;
  onSelectFinish: (finish: PumpFinish) => void;
}

export const StudioDock: React.FC<StudioDockProps> = ({
  activeBottle,
  finish,
  pourEnabled,
  autoDrop,
  onSelectBottle,
  onToggleAutoDrop,
  onTogglePour,
  onSelectFinish,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div
      data-ui-interactive="true"
      className="studio-dock pointer-events-none fixed bottom-4 left-1/2 z-30 flex w-[min(94vw,760px)] -translate-x-1/2 flex-col items-center"
    >
      {/* Collapse / Expand toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        className="pointer-events-auto mb-1.5 inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md border border-sky-200/18 bg-[#051022]/92 px-3 text-xs font-medium text-slate-300 transition-colors duration-150 hover:border-sky-400/40 hover:text-white focus-visible:outline-2 focus-visible:outline-sky-400"
      >
        {collapsed ? (
          <>
            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            Show 3D Controls
          </>
        ) : (
          <>
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            Hide Controls
          </>
        )}
      </button>

      {/* Collapsible horizontal control dock */}
      <div
        className={`pointer-events-auto w-full transition-all duration-200 ease-out ${
          collapsed
            ? 'pointer-events-none translate-y-6 opacity-0 h-0 overflow-hidden'
            : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-sky-200/18 bg-[#051022]/94 px-3 py-2.5 shadow-2xl shadow-black/50 sm:flex-nowrap sm:gap-3 sm:px-4">
          {/* Bottle Drop Stepper */}
          <div className="flex items-center gap-1 rounded-lg bg-[#081933] p-1">
            {BOTTLE_SPECS.map((b) => {
              const isActive = activeBottle === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onSelectBottle(b.id)}
                  className={`h-9 shrink-0 whitespace-nowrap rounded-md px-3 text-xs font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-sky-400 ${
                    isActive
                      ? 'bg-sky-400 text-slate-950'
                      : 'text-slate-300 hover:bg-white/6 hover:text-white'
                  }`}
                >
                  {b.shortLabel}
                </button>
              );
            })}
          </div>

          <div className="hidden h-6 w-px bg-sky-200/14 sm:block" aria-hidden="true" />

          {/* Auto-Drop & Pour controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleAutoDrop}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-xs font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-sky-400 ${
                autoDrop
                  ? 'border-sky-400/70 bg-sky-400/18 text-sky-200'
                  : 'border-sky-200/16 bg-[#081933] text-slate-200 hover:border-sky-300/40'
              }`}
            >
              {autoDrop ? (
                <Pause className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {autoDrop ? 'Stop Cycle' : 'Auto-Drop'}
            </button>

            <button
              type="button"
              onClick={onTogglePour}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-xs font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-sky-400 ${
                pourEnabled
                  ? 'border-cyan-400/60 bg-cyan-400/16 text-cyan-200'
                  : 'border-sky-200/16 bg-[#081933] text-slate-300 hover:border-sky-300/40'
              }`}
            >
              <Droplets className="h-3.5 w-3.5" aria-hidden="true" />
              {pourEnabled ? 'Pour On' : 'Pour Off'}
            </button>
          </div>

          <div className="hidden h-6 w-px bg-sky-200/14 sm:block" aria-hidden="true" />

          {/* Finish Swatches */}
          <div className="flex items-center gap-1.5" role="group" aria-label="Pump finish">
            <button
              type="button"
              onClick={() => onSelectFinish('white')}
              title="Pearl White finish"
              aria-pressed={finish === 'white'}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-sky-400 ${
                finish === 'white'
                  ? 'border-sky-400 bg-white/10 text-white'
                  : 'border-sky-200/14 bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              <span className="h-3.5 w-3.5 rounded-full border border-slate-400 bg-[#f4f7fb]" />
              White
            </button>
            <button
              type="button"
              onClick={() => onSelectFinish('black')}
              title="Obsidian Black finish"
              aria-pressed={finish === 'black'}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-sky-400 ${
                finish === 'black'
                  ? 'border-sky-400 bg-white/10 text-white'
                  : 'border-sky-200/14 bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              <span className="h-3.5 w-3.5 rounded-full border border-slate-500 bg-[#121620]" />
              Black
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
