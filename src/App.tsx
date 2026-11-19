import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { AssemblySection } from './components/AssemblySection';
import { BottleDropSection } from './components/BottleDropSection';
import { FeaturesAndMedia } from './components/FeaturesAndMedia';
import { MokhsMark, Navbar } from './components/Navbar';
import { OrderSection } from './components/OrderSection';
import { StudioDock } from './components/StudioDock';
import { MotionAIStudio } from './components/MotionAIStudio';
import { IntroSplash } from './components/IntroSplash';
import { PumpSceneEngine } from './three/PumpSceneEngine';
import type {
  BottleIndex,
  DropPhase,
  PumpFinish,
  SceneControlState,
  SceneId,
} from './three/types';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<PumpSceneEngine | null>(null);

  const [activeBottle, setActiveBottle] = useState<BottleIndex>(0);
  const [finish, setFinish] = useState<PumpFinish>('white');
  const [pourEnabled, setPourEnabled] = useState<boolean>(true);
  const [autoDrop, setAutoDrop] = useState<boolean>(false);
  const [dropPhase, setDropPhase] = useState<DropPhase>('seated');
  const [bottlesProgress, setBottlesProgress] = useState<number>(0);
  const [assemblyProgress, setAssemblyProgress] = useState<number>(0);
  const [webglLost, setWebglLost] = useState<boolean>(false);

  // Motion AI director state (driven by engine callbacks)
  const [directing, setDirecting] = useState<boolean>(false);
  const [motionShot, setMotionShot] = useState<{ index: number; caption: string }>({
    index: 0,
    caption: '',
  });

  // Track whether user explicitly picked a bottle while inside #bottles so scroll doesn't fight manual click
  const lastScrollBottleStepRef = useRef<BottleIndex>(0);

  const stateRef = useRef<SceneControlState>({
    activeSection: 'hero',
    bottlesProgress: 0,
    assemblyProgress: 0,
    activeBottle: 0,
    finish: 'white',
    pourEnabled: true,
    autoDrop: false,
    scrollY: 0,
    reducedMotion: false,
  });

  // Keep mutable engine ref synced with React state
  useEffect(() => {
    stateRef.current.activeBottle = activeBottle;
  }, [activeBottle]);

  useEffect(() => {
    stateRef.current.finish = finish;
  }, [finish]);

  useEffect(() => {
    stateRef.current.pourEnabled = pourEnabled;
  }, [pourEnabled]);

  useEffect(() => {
    stateRef.current.autoDrop = autoDrop;
  }, [autoDrop]);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    stateRef.current.reducedMotion = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      stateRef.current.reducedMotion = e.matches;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Mount Three.js engine once in isolated container ref
  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    const engine = new PumpSceneEngine(mountEl, stateRef, {
      onPhaseChange: (phase) => setDropPhase(phase),
      onBottleCycle: (nextBottle) => {
        setActiveBottle(nextBottle);
        stateRef.current.activeBottle = nextBottle;
      },
      onPumpClick: () => {
        setPourEnabled((prev) => {
          const next = !prev;
          stateRef.current.pourEnabled = next;
          return next;
        });
      },
      onContextLost: (lost) => setWebglLost(lost),
      onDirectorShot: (index, shot) => {
        setDirecting(true);
        setMotionShot({ index, caption: shot.caption ?? '' });
      },
      onDirectorEnd: () => setDirecting(false),
      onDirectorFinish: (f) => setFinish(f),
    });

    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Scroll choreography: section detection, step-by-step 3-bottle drop, exploded assembly
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('section[data-scene]'),
    );
    const bottlesEl = document.getElementById('bottles');
    const assemblyEl = document.getElementById('assembly');

    const updateFromScroll = () => {
      const sy = window.scrollY;
      const vh = window.innerHeight;
      stateRef.current.scrollY = sy;

      const midpoint = sy + vh * 0.48;
      let detected: SceneId = 'hero';
      for (const sec of sections) {
        if (sec.offsetTop <= midpoint) {
          detected = sec.dataset.scene as SceneId;
        }
      }
      stateRef.current.activeSection = detected;

      // Step-by-step 3-bottle scroll progression inside #bottles
      if (bottlesEl) {
        const span = Math.max(1, bottlesEl.offsetHeight - vh * 0.72);
        const raw = (sy - bottlesEl.offsetTop + vh * 0.15) / span;
        const clamped = Math.max(0, Math.min(1, raw));
        stateRef.current.bottlesProgress = clamped;
        setBottlesProgress(clamped);

        if (detected === 'bottles' && !stateRef.current.autoDrop) {
          const stepIndex: BottleIndex =
            clamped < 0.34 ? 0 : clamped < 0.68 ? 1 : 2;
          if (stepIndex !== lastScrollBottleStepRef.current) {
            lastScrollBottleStepRef.current = stepIndex;
            setActiveBottle(stepIndex);
            stateRef.current.activeBottle = stepIndex;
          }
        }
      }

      // Exploded engineering assembly scroll progression inside #assembly
      if (assemblyEl) {
        const span = Math.max(1, assemblyEl.offsetHeight - vh * 0.65);
        const raw = (sy - assemblyEl.offsetTop + vh * 0.3) / span;
        const clamped = Math.max(0, Math.min(1, raw));
        stateRef.current.assemblyProgress = clamped;
        setAssemblyProgress(clamped);
      }
    };

    updateFromScroll();
    window.addEventListener('scroll', updateFromScroll, { passive: true });
    window.addEventListener('resize', updateFromScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateFromScroll);
      window.removeEventListener('resize', updateFromScroll);
    };
  }, []);

  // While a motion plays: hide the page UI and lock scrolling so the 3D film is clean
  useEffect(() => {
    const root = document.documentElement;
    if (directing) {
      root.dataset.motion = 'on';
      setAutoDrop(false);
      stateRef.current.autoDrop = false;
    } else {
      delete root.dataset.motion;
    }
    return () => {
      delete root.dataset.motion;
    };
  }, [directing]);

  const handleSelectBottle = useCallback((bottle: BottleIndex) => {
    setAutoDrop(false);
    stateRef.current.autoDrop = false;
    lastScrollBottleStepRef.current = bottle;
    setActiveBottle(bottle);
    stateRef.current.activeBottle = bottle;
    engineRef.current?.triggerBottleDrop(bottle);
  }, []);

  const handleToggleAutoDrop = useCallback(() => {
    setAutoDrop((prev) => {
      const next = !prev;
      stateRef.current.autoDrop = next;
      if (next) {
        const nextBottle = ((stateRef.current.activeBottle + 1) % 3) as BottleIndex;
        setActiveBottle(nextBottle);
        stateRef.current.activeBottle = nextBottle;
        engineRef.current?.triggerBottleDrop(nextBottle);
      }
      return next;
    });
  }, []);

  const handleTogglePour = useCallback(() => {
    setPourEnabled((prev) => {
      const next = !prev;
      stateRef.current.pourEnabled = next;
      engineRef.current?.triggerButtonPress();
      return next;
    });
  }, []);

  const handleSelectFinish = useCallback((nextFinish: PumpFinish) => {
    setFinish(nextFinish);
    stateRef.current.finish = nextFinish;
  }, []);

  return (
    <div className="relative min-h-screen text-[#eaf4ff]">
      {/* Dedicated isolated WebGL canvas container (never re-created by React renders) */}
      <div
        ref={canvasMountRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 h-screen w-screen"
      />

      {webglLost && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-[#030b17]/95 p-8 text-center">
          <div className="max-w-md rounded-2xl border border-sky-200/18 bg-[#051022] p-6">
            <img
              src="/assets/images/real-pour.jpg"
              alt="MOKHS Automatic Water Pump pouring water"
              className="mx-auto h-52 w-full rounded-xl object-cover"
            />
            <p className="mt-4 text-sm text-slate-300">
              3D WebGL context paused — reload the page to restore interactive 3D motion.
            </p>
          </div>
        </div>
      )}

      {/* Top Navigation (Strict 3-zone Top Bar Contract) */}
      <Navbar />

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section
          id="hero"
          data-scene="hero"
          className="relative flex min-h-screen items-center px-5 pt-24 pb-24 sm:px-10 lg:px-16"
        >
          <div className="mx-auto w-full max-w-[1360px]">
            <div className="max-w-[540px] lg:w-[46vw]">
              <p className="text-xs font-medium tracking-wide text-sky-300">
                MOKHS Aqua · Smart Automatic Water Pump
              </p>

              <h1 className="mt-4 text-5xl font-extrabold leading-[1.03] tracking-tight text-white sm:text-6xl lg:text-[4.25rem]">
                One touch.
                <br />
                <span className="bg-gradient-to-b from-[#d9fbff] via-[#38bdf8] to-[#1d6ee8] bg-clip-text text-transparent">
                  Pure flow.
                </span>
              </h1>

              <p className="mt-5 max-w-[460px] text-base leading-relaxed text-slate-300 sm:text-lg">
                Turn any 5-gallon barrel, 3-gallon jug, or 1.5 L bottle into an
                instant automatic dispenser. No lifting, no tipping, no spills.
              </p>

              <p className="mt-2.5 text-sm font-semibold text-sky-200/90">
                Bas aik touch — aur saaf paani glass mein.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#order"
                  className="inline-flex h-12 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-sky-400 px-6 text-sm font-semibold text-slate-950 transition-colors duration-150 hover:bg-sky-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                >
                  Order — Cash on Delivery
                </a>
                <a
                  href="#bottles"
                  className="inline-flex h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-sky-200/20 bg-[#051022]/85 px-5 text-sm font-semibold text-slate-100 transition-colors duration-150 hover:border-sky-400/50 hover:text-white focus-visible:outline-2 focus-visible:outline-sky-400"
                >
                  Watch 3-Bottle Drop
                  <ArrowDown className="h-4 w-4 text-sky-400" aria-hidden="true" />
                </a>
              </div>

              {/* Clean unboxed inline metadata (zero static pill clutter) */}
              <div className="mt-8 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-slate-400">
                <span>Fits 1.5 L to 19 L bottles</span>
                <span aria-hidden="true">·</span>
                <span>USB rechargeable</span>
                <span aria-hidden="true">·</span>
                <span>Whisper-quiet motor</span>
                <span aria-hidden="true">·</span>
                <span className="text-sky-300">Click the 3D pump to pour</span>
              </div>
            </div>
          </div>
        </section>

        {/* STEP-BY-STEP 3-BOTTLE DROP FULL-MOTION SHOWCASE */}
        <BottleDropSection
          activeBottle={activeBottle}
          dropPhase={dropPhase}
          autoDrop={autoDrop}
          scrollProgress={bottlesProgress}
          onSelectBottle={handleSelectBottle}
          onToggleAutoDrop={handleToggleAutoDrop}
        />

        {/* EXPLODED ENGINEERING ASSEMBLY */}
        <AssemblySection assemblyProgress={assemblyProgress} />

        {/* FEATURES, SPECS, 4-STEP SETUP & REAL PHOTOS */}
        <FeaturesAndMedia />

        {/* ORDER CONFIGURATOR */}
        <OrderSection
          activeBottle={activeBottle}
          finish={finish}
          onSelectBottle={handleSelectBottle}
          onSelectFinish={handleSelectFinish}
        />
      </main>

      {/* QUIET FOOTER */}
      <footer className="relative z-10 border-t border-sky-200/12 bg-[#020812]/95 px-5 py-10 pb-28 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-6">
          <a href="#hero" className="flex items-center gap-2.5">
            <MokhsMark className="h-7 w-7" />
            <span className="font-display text-base font-extrabold tracking-[0.16em] text-white">
              MOKHS
            </span>
          </a>

          <p className="text-xs text-slate-400">
            Smart Electronics. Better Living. ·{' '}
            <a
              href="https://www.mokhs.store/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 underline decoration-sky-400/40 underline-offset-4 hover:text-white"
            >
              mokhs.store
            </a>
          </p>

          <p className="text-xs text-slate-500">© 2026 MOKHS · Pakistan</p>
        </div>
      </footer>

      {/* COLLAPSIBLE BOTTOM 3D STUDIO CONTROL DOCK */}
      <StudioDock
        activeBottle={activeBottle}
        finish={finish}
        pourEnabled={pourEnabled}
        autoDrop={autoDrop}
        onSelectBottle={handleSelectBottle}
        onToggleAutoDrop={handleToggleAutoDrop}
        onTogglePour={handleTogglePour}
        onSelectFinish={handleSelectFinish}
      />

      {/* Intro reel shown while the site loads (once per visit) */}
      <IntroSplash />

      {/* MOKHS MOTION AI — owner tool, hidden from customers. Open the site with #studio to use it. */}
      <MotionAIStudio
        engineRef={engineRef}
        directing={directing}
        shotIndex={motionShot.index}
        caption={motionShot.caption}
      />
    </div>
  );
}
