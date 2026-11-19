// Built-in motion director: works offline / without a Gemini key.
// Maps slash commands and keywords to ready-made shot lists.
import type { MotionScript, MotionShot } from './types';

export interface VfxPreset {
  command: string; // e.g. "/vfx structural assembly"
  label: string;
  keywords: string[];
  script: MotionScript;
}

const brandEnd: MotionShot = {
  action: 'pour',
  duration: 4,
  bottle: 0,
  camera: 'wide',
  caption: 'MOKHS Aqua · One touch. Pure flow.',
};

export const VFX_PRESETS: VfxPreset[] = [
  {
    command: '/vfx structural assembly',
    label: 'Structural assembly',
    keywords: ['assem', 'build', 'structur', 'together', 'jor'],
    script: {
      title: 'Structural Assembly',
      shots: [
        { action: 'explode', duration: 2, camera: 'wide', speed: 0.6, caption: 'Built piece by piece' },
        { action: 'assemble', duration: 5, camera: 'orbit', speed: 1, caption: 'Silicone tube · steel spout · LED cap' },
        { action: 'closeup', duration: 3, camera: 'close', caption: 'One-touch button' },
        { action: 'drop', duration: 3, bottle: 0, camera: 'wide', caption: 'Fits 5 gallon bottles' },
        brandEnd,
      ],
    },
  },
  {
    command: '/vfx exploded view',
    label: 'Exploded view',
    keywords: ['explod', 'apart', 'parts', 'inside', 'andar'],
    script: {
      title: 'Exploded View',
      shots: [
        { action: 'spin', duration: 3, camera: 'wide', caption: 'What’s inside?' },
        { action: 'explode', duration: 4, camera: 'orbit', speed: 0.8, caption: 'Quiet motor · USB rechargeable' },
        { action: 'assemble', duration: 4, camera: 'low', caption: 'Snaps back together' },
        brandEnd,
      ],
    },
  },
  {
    command: '/vfx 3-bottle drop',
    label: '3-bottle drop',
    keywords: ['drop', 'gallon', 'fit', 'botal', 'size', 'three', '3 bottle', 'teen'],
    script: {
      title: 'One Pump, Three Bottles',
      shots: [
        { action: 'reveal', duration: 3, bottle: 0, camera: 'wide', caption: 'One pump…' },
        { action: 'drop', duration: 3, bottle: 1, camera: 'wide', caption: 'Fits 3 gallon bottles' },
        { action: 'drop', duration: 3, bottle: 2, camera: 'low', caption: 'Small bottles too' },
        { action: 'drop', duration: 3, bottle: 0, camera: 'wide', caption: 'And 5 gallon barrels' },
        { action: 'pour', duration: 4, bottle: 0, camera: 'close', caption: 'MOKHS Aqua · mokhs.store' },
      ],
    },
  },
  {
    command: '/vfx pour shot',
    label: 'Pour shot',
    keywords: ['pour', 'water', 'glass', 'paani', 'pani', 'flow'],
    script: {
      title: 'Pure Flow',
      shots: [
        { action: 'closeup', duration: 3, camera: 'close', caption: 'Press once…' },
        { action: 'pour', duration: 5, bottle: 0, camera: 'low', caption: '…and water pours' },
        { action: 'pour', duration: 4, bottle: 0, camera: 'orbit', speed: 0.6, caption: 'No lifting. No spills.' },
        { action: 'closeup', duration: 3, camera: 'close', caption: 'MOKHS Aqua · One touch. Pure flow.' },
      ],
    },
  },
  {
    command: '/vfx 360 orbit',
    label: '360° orbit',
    keywords: ['360', 'orbit', 'rotate', 'spin', 'ghoom', 'around'],
    script: {
      title: '360° Showcase',
      shots: [
        { action: 'orbit', duration: 6, bottle: 0, camera: 'orbit', speed: 1, caption: 'MOKHS Aqua' },
        { action: 'spin', duration: 4, camera: 'close', speed: 1.4, caption: '13 cm · 8 cm · steel spout' },
        { action: 'orbit', duration: 5, bottle: 0, camera: 'top', speed: 0.8, caption: 'Low-noise motor' },
        brandEnd,
      ],
    },
  },
  {
    command: '/vfx black edition',
    label: 'Black edition',
    keywords: ['black', 'kala', 'dark', 'night'],
    script: {
      title: 'Black Edition',
      shots: [
        { action: 'reveal', duration: 3, bottle: 0, finish: 'black', camera: 'low', caption: 'Black edition' },
        { action: 'orbit', duration: 5, bottle: 0, finish: 'black', camera: 'orbit', speed: 0.8 },
        { action: 'pour', duration: 4, bottle: 0, finish: 'black', camera: 'close', caption: 'MOKHS Aqua · One touch. Pure flow.' },
      ],
    },
  },
  {
    command: '/vfx hero reveal',
    label: 'Hero reveal',
    keywords: ['hero', 'reveal', 'intro', 'launch', 'ad', 'reel', 'promo'],
    script: {
      title: 'Hero Reveal',
      shots: [
        { action: 'reveal', duration: 3, bottle: 0, camera: 'low', caption: 'Meet MOKHS Aqua' },
        { action: 'assemble', duration: 4, camera: 'orbit', caption: 'Smart automatic water pump' },
        { action: 'drop', duration: 3, bottle: 1, camera: 'wide', caption: 'Fits 2–5 gallon bottles' },
        { action: 'drop', duration: 3, bottle: 0, camera: 'wide' },
        { action: 'pour', duration: 4, bottle: 0, camera: 'close', caption: 'Order on mokhs.store · COD' },
      ],
    },
  },
];

const clone = (s: MotionScript): MotionScript => JSON.parse(JSON.stringify(s));

/** Pick the preset that best matches the prompt; falls back to Hero Reveal. */
export function localDirector(prompt: string): MotionScript {
  const p = prompt.toLowerCase().trim();
  const exact = VFX_PRESETS.find((v) => p.startsWith(v.command));
  let chosen = exact;
  if (!chosen) {
    let best = 0;
    for (const v of VFX_PRESETS) {
      const score = v.keywords.reduce((n, k) => n + (p.includes(k) ? 1 : 0), 0);
      if (score > best) {
        best = score;
        chosen = v;
      }
    }
  }
  const script = clone((chosen ?? VFX_PRESETS[VFX_PRESETS.length - 1]).script);

  // Apply simple modifiers the user typed
  const wantBlack = /\bblack\b|kala/.test(p);
  const wantWhite = /\bwhite\b|safaid|safed/.test(p);
  const wantSmall = /small|1\.5|chhot|chot/.test(p);
  const wantSlow = /slow|aahista|ahista/.test(p);
  const wantFast = /fast|quick|tez/.test(p);
  for (const s of script.shots) {
    if (wantBlack) s.finish = 'black';
    if (wantWhite) s.finish = 'white';
    if (wantSmall && (s.action === 'pour' || s.action === 'reveal' || s.action === 'orbit')) s.bottle = 2;
    if (wantSlow) {
      s.duration = Math.min(8, s.duration * 1.4);
      s.speed = (s.speed ?? 1) * 0.6;
    }
    if (wantFast) {
      s.duration = Math.max(1, s.duration * 0.7);
      s.speed = (s.speed ?? 1) * 1.5;
    }
  }
  return script;
}
