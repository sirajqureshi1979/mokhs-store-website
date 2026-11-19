import { useEffect, useRef, useState } from 'react';

// Full-screen intro that plays the MOKHS Aqua structural-assembly reel while the 3D site loads.
// Shows once per browser session. Add #no-intro to the URL to skip it.
const SEEN_KEY = 'mokhs-intro-seen';

function shouldShowIntro(): boolean {
  try {
    if (window.location.hash === '#no-intro') return false;
    if (window.sessionStorage.getItem(SEEN_KEY)) return false;
  } catch {
    /* storage blocked: still show */
  }
  return true;
}

export function IntroSplash() {
  const [show, setShow] = useState<boolean>(shouldShowIntro);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const leavingRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const base = import.meta.env.BASE_URL;

  const close = () => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    setLeaving(true);
    try {
      window.sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* ignore */
    }
    window.setTimeout(() => setShow(false), 700);
  };

  useEffect(() => {
    if (!show) return;
    const root = document.documentElement;
    root.style.overflow = 'hidden';
    const v = videoRef.current;
    v?.play().catch(() => {
      /* autoplay blocked: poster + Enter button still shown */
    });
    const safety = window.setTimeout(close, 25000);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = '';
      window.clearTimeout(safety);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!show) return null;

  return (
    <div
      data-ui-interactive="true"
      role="dialog"
      aria-label="MOKHS Aqua intro video"
      className={`fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-[#030b17] transition-opacity duration-700 ${
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {/* Soft blurred backdrop from the poster frame (desktop) */}
      <img
        src={`${base}assets/video/mokhs-intro.jpg`}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 hidden h-full w-full scale-110 object-cover opacity-40 blur-2xl sm:block"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#030b17]/40 via-transparent to-[#030b17]/80" />

      <video
        ref={videoRef}
        src={`${base}assets/video/mokhs-intro.mp4`}
        poster={`${base}assets/video/mokhs-intro.jpg`}
        muted
        autoPlay
        playsInline
        preload="auto"
        onEnded={close}
        onError={close}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (el.duration) setProgress(el.currentTime / el.duration);
        }}
        className={`relative h-full w-full object-cover transition-transform duration-700 sm:aspect-[9/16] sm:h-[88vh] sm:w-auto sm:rounded-[28px] sm:shadow-[0_30px_120px_-20px_rgba(34,199,255,.45)] sm:ring-1 sm:ring-white/10 ${
          leaving ? 'scale-[1.04]' : 'scale-100'
        }`}
      />

      {/* Skip */}
      <button
        type="button"
        onClick={close}
        className="absolute right-4 top-4 z-10 inline-flex h-10 items-center rounded-full border border-white/20 bg-black/50 px-4 text-xs font-semibold text-white backdrop-blur hover:bg-black/70 sm:right-8 sm:top-8"
      >
        Skip intro
      </button>

      {/* Enter + progress */}
      <div className="absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-3 sm:bottom-10">
        <button
          type="button"
          onClick={close}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-sky-400 px-7 text-sm font-bold text-slate-950 shadow-[0_12px_40px_-10px_rgba(56,189,248,.9)] hover:bg-sky-300"
        >
          Enter MOKHS Aqua →
        </button>
        <div className="h-1 w-40 overflow-hidden rounded-full bg-white/15">
          <div className="h-full bg-sky-400" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
