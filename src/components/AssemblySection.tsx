import React from 'react';
import { ASSEMBLY_PARTS } from '../three/types';

interface AssemblySectionProps {
  assemblyProgress: number;
}

export const AssemblySection: React.FC<AssemblySectionProps> = ({
  assemblyProgress,
}) => {
  const lockedCount = Math.min(
    ASSEMBLY_PARTS.length,
    Math.max(0, Math.round(assemblyProgress * 6.3)),
  );
  const percent = Math.round(assemblyProgress * 100);

  return (
    <section
      id="assembly"
      data-scene="assembly"
      className="relative z-10 min-h-[230vh] px-5 pt-24 pb-20 sm:px-10 lg:px-16"
    >
      <div className="mx-auto flex max-w-[1360px] justify-end">
        <div className="sticky top-24 w-full max-w-[530px] rounded-2xl border border-sky-200/14 bg-[#051022]/88 p-6 sm:p-8 lg:w-[44vw] lg:bg-[#051022]/80">
          <div className="flex items-center justify-between gap-4 text-xs font-medium text-sky-300">
            <span className="tracking-wide">Exploded engineering assembly</span>
            <span className="font-mono tabular-nums text-slate-400">
              {percent}% assembled
            </span>
          </div>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
            Built piece by piece.
          </h2>

          <p className="mt-3 text-[15px] leading-relaxed text-slate-300">
            Scroll continuously to snap all six precision-molded components from
            exploded cutaway into a sealed, whisper-quiet dispenser.
          </p>

          <ol className="mt-6 space-y-2.5">
            {ASSEMBLY_PARTS.map((part) => {
              const isLocked = part.index < lockedCount;
              return (
                <li
                  key={part.code}
                  className={`flex items-start gap-3.5 rounded-xl border px-4 py-3 transition-all duration-300 ${
                    isLocked
                      ? 'border-sky-400/50 bg-sky-400/10 opacity-100'
                      : 'border-sky-200/10 bg-[#071730]/50 opacity-50'
                  }`}
                >
                  <span className="mt-0.5 font-mono text-xs font-semibold tabular-nums text-sky-300">
                    {part.code}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white">
                      {part.name}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-300">
                      {part.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full origin-left bg-sky-400 transition-transform duration-150 ease-out"
              style={{ transform: `scaleX(${Math.max(0.03, assemblyProgress)})` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
