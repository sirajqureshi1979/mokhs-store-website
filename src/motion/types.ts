// MOKHS Motion AI — shared motion-script schema (used by browser AND server).
// Keep this file free of browser/Node-only imports.

export const MOTION_ACTIONS = [
  'reveal', // pump rises into frame on its bottle
  'assemble', // exploded parts fly together (structural assembly VFX)
  'explode', // assembled pump flies apart into parts
  'orbit', // camera circles the assembled pump on its bottle
  'spin', // pump alone turns on a turntable
  'drop', // pump lifts and drops onto a bottle
  'pour', // pump pours water into a glass
  'closeup', // tight hero close-up of the pump
] as const;

export const MOTION_CAMERAS = ['wide', 'close', 'low', 'top', 'orbit'] as const;

export type MotionAction = (typeof MOTION_ACTIONS)[number];
export type MotionCamera = (typeof MOTION_CAMERAS)[number];

export interface MotionShot {
  action: MotionAction;
  duration: number; // seconds, 1..8
  bottle?: 0 | 1 | 2; // 0 = 5 gallon, 1 = 3 gallon, 2 = 1.5 L
  finish?: 'white' | 'black';
  camera?: MotionCamera;
  speed?: number; // 0.4..2.5 (rotation speed multiplier)
  caption?: string; // on-screen text, max 48 chars
}

export interface MotionScript {
  title: string;
  shots: MotionShot[];
}

export const MAX_TOTAL_SECONDS = 45;
export const MAX_SHOTS = 10;

/** Facts the AI is allowed to put in captions. Edit this list when product details are confirmed. */
export const PRODUCT_FACTS = [
  'One-touch button: press to pour, press again to stop',
  'USB rechargeable',
  'Low-noise motor (professional noise reduction)',
  'Fits 2, 3, 4 and 5 gallon water bottles and small bottles',
  'Height 13 cm, width 8 cm, spout 11.4 cm',
  'Steel spout, silicone intake tube',
  'Cash on Delivery, JazzCash and Easypaisa across Pakistan',
  'Brand: MOKHS Aqua — mokhs.store',
];

const clampNum = (v: unknown, lo: number, hi: number, fallback: number) => {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : fallback;
  return Math.min(hi, Math.max(lo, n));
};

/** Turns any untrusted JSON (from the AI or a URL) into a safe, playable script. */
export function sanitizeScript(raw: unknown): MotionScript | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const shotsIn = Array.isArray(r.shots) ? r.shots : [];
  const shots: MotionShot[] = [];
  let total = 0;

  for (const s of shotsIn.slice(0, MAX_SHOTS)) {
    if (!s || typeof s !== 'object') continue;
    const o = s as Record<string, unknown>;
    const action = MOTION_ACTIONS.includes(o.action as MotionAction)
      ? (o.action as MotionAction)
      : null;
    if (!action) continue;
    const duration = clampNum(o.duration, 1, 8, 3);
    if (total + duration > MAX_TOTAL_SECONDS) break;
    total += duration;

    const shot: MotionShot = { action, duration };
    const b = Number(o.bottle);
    if (b === 0 || b === 1 || b === 2) shot.bottle = b;
    if (o.finish === 'white' || o.finish === 'black') shot.finish = o.finish;
    if (MOTION_CAMERAS.includes(o.camera as MotionCamera)) shot.camera = o.camera as MotionCamera;
    if (o.speed !== undefined) shot.speed = clampNum(o.speed, 0.4, 2.5, 1);
    if (typeof o.caption === 'string' && o.caption.trim()) {
      shot.caption = o.caption.replace(/[<>]/g, '').trim().slice(0, 48);
    }
    shots.push(shot);
  }

  if (!shots.length) return null;
  const title =
    typeof r.title === 'string' && r.title.trim()
      ? r.title.replace(/[<>]/g, '').trim().slice(0, 60)
      : 'MOKHS Motion';
  return { title, shots };
}

export const totalDuration = (s: MotionScript) =>
  s.shots.reduce((sum, sh) => sum + sh.duration, 0);

export const MOTION_SYSTEM_PROMPT = `You are "MOKHS Motion AI", a motion director for a 3D product video of the MOKHS Aqua automatic water pump.
Turn the user's request into a short shot list that a 3D engine will play.

Available actions:
- reveal: the pump rises into frame on its bottle
- assemble: exploded parts fly together into the finished pump (structural assembly VFX)
- explode: the finished pump flies apart into its parts (exploded view)
- orbit: camera circles the assembled pump on its bottle
- spin: the pump alone turns like on a turntable
- drop: the pump lifts and drops onto a bottle (set "bottle")
- pour: the pump pours water into a glass
- closeup: tight hero close-up of the pump
Bottles: 0 = 5 gallon (19 L) barrel, 1 = 3 gallon handle jug, 2 = small 1.5 L bottle.
Cameras: wide, close, low, top, orbit. Finish: white or black. speed: 0.4 to 2.5.

Rules:
- 3 to 8 shots, each 1 to 8 seconds, total 10 to 40 seconds unless the user asks for one specific shot.
- "/vfx <name>" is a slash command naming the main effect; build a short sequence around it.
- Captions are optional, max 48 characters, and may ONLY state these facts: ${PRODUCT_FACTS.join('; ')}.
  Never invent specs (battery size, materials, certifications, prices, warranty). Short slogans like "One touch. Pure flow." are fine.
- The user may write in English, Urdu or Roman Urdu; captions follow the user's language.
- End with a strong final shot (pour, orbit or closeup) and a caption with the brand.
Return JSON only, exactly in this shape:
{"title":"Structural Assembly","shots":[{"action":"explode","duration":2,"camera":"wide","caption":"Built piece by piece"},{"action":"assemble","duration":5,"camera":"orbit","speed":1},{"action":"pour","duration":4,"bottle":0,"camera":"close","caption":"MOKHS Aqua · One touch. Pure flow."}]}`;
