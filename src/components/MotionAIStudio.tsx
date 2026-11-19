import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Clapperboard,
  Download,
  Monitor,
  RotateCcw,
  Smartphone,
  Sparkles,
  Square,
  Video,
  X,
} from 'lucide-react';
import type { PumpSceneEngine } from '../three/PumpSceneEngine';
import { directMotion } from '../motion/client';
import { VFX_PRESETS } from '../motion/localDirector';
import {
  recordingSupported,
  ReelRecorder,
  type RecordingResult,
  type ReelFormat,
} from '../motion/recorder';
import { totalDuration, type MotionScript } from '../motion/types';

interface MotionAIStudioProps {
  engineRef: React.MutableRefObject<PumpSceneEngine | null>;
  directing: boolean;
  shotIndex: number;
  caption: string;
}

type Status = 'idle' | 'thinking' | 'playing' | 'done';

const ACTION_LABEL: Record<string, string> = {
  reveal: 'Reveal',
  assemble: 'Assemble',
  explode: 'Explode',
  orbit: 'Orbit',
  spin: 'Spin',
  drop: 'Drop',
  pour: 'Pour',
  closeup: 'Close-up',
};

export const MotionAIStudio: React.FC<MotionAIStudioProps> = ({
  engineRef,
  directing,
  shotIndex,
  caption,
}) => {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('/vfx structural assembly');
  const [status, setStatus] = useState<Status>('idle');
  const [script, setScript] = useState<MotionScript | null>(null);
  const [source, setSource] = useState<'gemini' | 'built-in' | null>(null);
  const [note, setNote] = useState('');
  const [record, setRecord] = useState(true);
  const [format, setFormat] = useState<ReelFormat>('reel');
  const [video, setVideo] = useState<RecordingResult | null>(null);
  const recorderRef = useRef<ReelRecorder | null>(null);
  const wasDirecting = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const canRecord = useMemo(() => recordingSupported(), []);

  // Slash-command autocomplete like "/vfx structural assem" → suggestions
  const suggestions = useMemo(() => {
    const p = prompt.toLowerCase().trim();
    if (!p.startsWith('/')) return VFX_PRESETS.slice(0, 4);
    const typed = p.replace(/^\/(vfx)?\s*/, '');
    return VFX_PRESETS.filter(
      (v) =>
        v.command.includes(p) ||
        v.label.toLowerCase().includes(typed) ||
        v.keywords.some((k) => typed && typed.includes(k)),
    ).slice(0, 4);
  }, [prompt]);

  // When the engine finishes a script, finish the recording
  useEffect(() => {
    if (wasDirecting.current && !directing) {
      const rec = recorderRef.current;
      const engine = engineRef.current;
      if (engine) {
        engine.setAfterRender(null);
        engine.framingBoost = 1;
      }
      if (rec) {
        recorderRef.current = null;
        rec
          .stop()
          .then((res) => {
            setVideo(res);
            setStatus('done');
          })
          .catch(() => setStatus('done'));
      } else {
        setStatus('done');
      }
    }
    wasDirecting.current = directing;
  }, [directing, engineRef]);

  // Esc stops a running motion
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && engineRef.current?.isDirecting()) engineRef.current.stopMotion();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [engineRef]);

  const play = (s: MotionScript) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (video) {
      URL.revokeObjectURL(video.url);
      setVideo(null);
    }
    if (record && canRecord) {
      const rec = new ReelRecorder(format);
      try {
        rec.start();
        recorderRef.current = rec;
        engine.framingBoost = format === 'reel' ? 1.16 : 1;
        engine.setAfterRender((canvas, st) =>
          rec.drawFrame(canvas, st?.caption ?? '', st?.progress ?? 0),
        );
      } catch {
        recorderRef.current = null;
        setNote('Recording is not available in this browser — playing without recording.');
      }
    }
    setStatus('playing');
    engine.playMotion(s);
  };

  const generate = async (text?: string) => {
    const p = (text ?? prompt).trim();
    if (!p || status === 'thinking' || directing) return;
    setPrompt(p);
    setStatus('thinking');
    setNote('');
    const res = await directMotion(p);
    setScript(res.script);
    setSource(res.source);
    if (res.note) setNote(res.note);
    play(res.script);
  };

  const filename = script
    ? `mokhs-aqua-${script.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
    : 'mokhs-aqua-motion';

  // ---------- Live "on air" overlay while the motion plays ----------
  if (directing && script) {
    const shot = script.shots[Math.min(shotIndex, script.shots.length - 1)];
    return (
      <div className="motion-overlay pointer-events-none fixed inset-0 z-40" data-ui-interactive="true">
        <div className="absolute inset-x-0 top-0 h-[7vh] bg-black/85" />
        <div className="absolute inset-x-0 bottom-0 h-[7vh] bg-black/85" />
        <div className="absolute left-5 top-[calc(7vh+14px)] flex items-center gap-2 text-xs font-semibold text-slate-200">
          {recorderRef.current && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/90 px-2 py-1 text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> REC {format === 'reel' ? '9:16' : '16:9'}
            </span>
          )}
          <span className="rounded-md bg-black/50 px-2 py-1">
            {script.title} · Shot {shotIndex + 1}/{script.shots.length} · {ACTION_LABEL[shot.action]}
          </span>
        </div>
        <button
          type="button"
          onClick={() => engineRef.current?.stopMotion()}
          className="pointer-events-auto absolute right-5 top-[calc(7vh+10px)] inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/20 bg-black/60 px-3 text-xs font-semibold text-white hover:bg-black/80"
        >
          <Square className="h-3.5 w-3.5" aria-hidden="true" /> Stop (Esc)
        </button>
        {caption && (
          <p
            key={`${shotIndex}-${caption}`}
            className="motion-caption absolute inset-x-6 bottom-[calc(7vh+6vh)] text-center font-display text-3xl font-extrabold text-white drop-shadow-[0_4px_18px_rgba(0,0,0,.7)] sm:text-5xl"
          >
            {caption}
          </p>
        )}
        <div className="absolute inset-x-[5%] bottom-[3.2vh] flex gap-1">
          {script.shots.map((s, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-colors duration-300 ${
                i < shotIndex ? 'bg-sky-400' : i === shotIndex ? 'bg-sky-300 animate-pulse' : 'bg-white/15'
              }`}
              style={{ flex: s.duration }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ---------- Launcher ----------
  if (!open) {
    return (
      <button
        type="button"
        data-ui-interactive="true"
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="motion-launcher fixed right-4 bottom-44 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 to-sky-500 px-5 text-sm font-bold text-slate-950 shadow-[0_12px_40px_-10px_rgba(56,189,248,.9)] transition-transform hover:-translate-y-0.5 sm:bottom-28 lg:bottom-24"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" /> Motion AI
      </button>
    );
  }

  // ---------- Composer (styled after the "/vfx structural assembly" prompt box) ----------
  return (
    <div
      data-ui-interactive="true"
      className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-[640px] sm:bottom-6"
      role="dialog"
      aria-label="MOKHS Motion AI"
    >
      <div className="rounded-[28px] border border-white/10 bg-[#0b0d12]/96 p-4 shadow-2xl shadow-black/70 backdrop-blur-xl sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Clapperboard className="h-4 w-4 text-sky-300" aria-hidden="true" />
            MOKHS Motion AI
            <span className="rounded-md bg-white/8 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
              make a product video in under a minute
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close Motion AI"
            className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Result: recorded video */}
        {status === 'done' && video && (
          <div className="mb-4 flex gap-4 rounded-2xl border border-sky-400/25 bg-sky-400/5 p-3">
            <video
              src={video.url}
              controls
              playsInline
              className={`${format === 'reel' ? 'h-48 w-[108px]' : 'h-28 w-[200px]'} shrink-0 rounded-xl bg-black object-cover`}
            />
            <div className="flex min-w-0 flex-col justify-center gap-2 text-sm">
              <p className="font-semibold text-white">Your video is ready</p>
              <p className="text-xs text-slate-400">
                {Math.round(video.seconds)} s · {format === 'reel' ? '9:16 for Reels / TikTok / Status' : '16:9 for YouTube / website'} · .{video.ext}
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={video.url}
                  download={`${filename}.${video.ext}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-sky-400 px-3 text-xs font-bold text-slate-950 hover:bg-sky-300"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </a>
                {script && (
                  <button
                    type="button"
                    onClick={() => play(script)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 px-3 text-xs font-semibold text-white hover:border-sky-300/50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Play again
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Shot plan */}
        {script && status !== 'thinking' && !(status === 'done' && video) && (
          <div className="mb-3 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="mr-1 font-semibold text-slate-300">{script.title}</span>
            {script.shots.map((s, i) => (
              <span key={i} className="rounded-md bg-white/6 px-2 py-1 text-slate-300">
                {ACTION_LABEL[s.action]} {Math.round(s.duration)}s
              </span>
            ))}
            <span className="ml-auto text-slate-500">{Math.round(totalDuration(script))}s total</span>
            {status === 'done' && (
              <button
                type="button"
                onClick={() => play(script)}
                className="inline-flex items-center gap-1 rounded-md border border-white/15 px-2 py-1 text-slate-200 hover:border-sky-300/60"
              >
                <RotateCcw className="h-3 w-3" /> Replay
              </button>
            )}
          </div>
        )}

        <div className="rounded-[22px] border border-white/10 bg-[#14161c] p-3">
          <div className="flex items-start gap-3">
            <img
              src="/assets/images/real-closeup.jpg"
              alt=""
              className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-white/10"
            />
            <form
              className="min-w-0 flex-1"
              onSubmit={(e) => {
                e.preventDefault();
                generate();
              }}
            >
              <input
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="/vfx structural assembly — or describe your shot"
                aria-label="Describe the motion you want"
                className="w-full bg-transparent py-2 text-lg text-white placeholder:text-slate-500 focus:outline-none sm:text-xl"
                disabled={status === 'thinking'}
              />
            </form>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPrompt('/vfx ')}
              title="Show VFX commands"
              className="grid h-10 w-10 place-items-center rounded-full text-2xl leading-none text-slate-300 hover:bg-white/10"
            >
              +
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormat((f) => (f === 'reel' ? 'wide' : 'reel'))}
                title="Video shape"
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3.5 text-xs font-semibold text-slate-200 hover:border-white/25"
              >
                {format === 'reel' ? <Smartphone className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
                {format === 'reel' ? '9:16' : '16:9'}
              </button>
              <button
                type="button"
                onClick={() => setRecord((r) => !r)}
                disabled={!canRecord}
                title={canRecord ? 'Record a downloadable video' : 'Recording not supported in this browser'}
                className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors ${
                  record && canRecord
                    ? 'border-red-400/50 bg-red-500/15 text-red-200'
                    : 'border-white/12 bg-white/5 text-slate-400'
                }`}
              >
                <Video className="h-3.5 w-3.5" /> {record && canRecord ? 'Video ×1' : 'Preview'}
              </button>
              <button
                type="button"
                onClick={() => generate()}
                disabled={status === 'thinking' || !prompt.trim()}
                aria-label="Generate motion"
                className="grid h-12 w-12 place-items-center rounded-full bg-white text-slate-950 transition-transform hover:scale-105 disabled:opacity-50"
              >
                {status === 'thinking' ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                ) : (
                  <ArrowRight className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Suggestion strip (like a keyboard suggestion bar) */}
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((v) => (
            <button
              key={v.command}
              type="button"
              onClick={() => generate(v.command)}
              disabled={status === 'thinking'}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-sky-300/50 hover:text-white"
            >
              {v.command}
            </button>
          ))}
        </div>

        <p className="mt-3 text-[11px] text-slate-500">
          {status === 'thinking'
            ? 'Directing your shots…'
            : note
              ? note
              : source === 'gemini'
                ? 'Shot list written by Gemini.'
                : 'Try: “black pump, slow 360 on the small bottle, then pour” · English, Urdu or Roman Urdu.'}
        </p>
      </div>
    </div>
  );
};
