export type SceneId =
  | 'hero'
  | 'bottles'
  | 'assembly'
  | 'features'
  | 'install'
  | 'real'
  | 'order';

export type PumpFinish = 'white' | 'black';

export type BottleIndex = 0 | 1 | 2;

export type DropPhase = 'seated' | 'lifting' | 'swapping' | 'dropping';

export interface BottleSpec {
  id: BottleIndex;
  shortLabel: string;
  title: string;
  volume: string;
  neckDiameter: string;
  heightCm: string;
  description: string;
  fitDetail: string;
  accentHex: string;
}

export const BOTTLE_SPECS: readonly BottleSpec[] = [
  {
    id: 0,
    shortLabel: '5 Gallon',
    title: '5-Gallon Dispenser Barrel',
    volume: '19 L Standard',
    neckDiameter: '55 mm universal crown',
    heightCm: '49 cm barrel height',
    description:
      'Drops straight onto standard 19 L home and office dispenser barrels without removing the inner spill cap.',
    fitDetail: 'Full 55 cm silicone dip tube reaches the very bottom corner.',
    accentHex: '#38bdf8',
  },
  {
    id: 1,
    shortLabel: '3 Gallon',
    title: '3-Gallon Handle Jug',
    volume: '11 L Countertop Jug',
    neckDiameter: '55 mm medium neck',
    heightCm: '36 cm jug height',
    description:
      'Lifts cleanly off the large barrel and seats flush onto mid-size handle jugs for kitchen counters and dining tables.',
    fitDetail: 'Balanced center of gravity with zero wobble on push-button pour.',
    accentHex: '#60a5fa',
  },
  {
    id: 2,
    shortLabel: '1.5 L Bottle',
    title: 'Compact Travel Bottle',
    volume: '1.5 L – 2 L PET',
    neckDiameter: '38–48 mm adapter fit',
    heightCm: '28 cm bottle height',
    description:
      'Descends smoothly onto compact 1.5 L and 2 L bottles for study desks, bedside tables, and road trips.',
    fitDetail: 'Flexible food-grade silicone tube curves effortlessly inside compact bottles.',
    accentHex: '#34d399',
  },
] as const;

export interface AssemblyPartSpec {
  index: number;
  code: string;
  name: string;
  detail: string;
}

export const ASSEMBLY_PARTS: readonly AssemblyPartSpec[] = [
  {
    index: 0,
    code: '01',
    name: 'Food-grade silicone intake tube',
    detail: 'BPA-free 55 cm flexible hose reaches the bottom of every bottle size.',
  },
  {
    index: 1,
    code: '02',
    name: 'Universal bottle-neck collar',
    detail: 'Dual-seal matte collar grips 1.5 L, 3-gallon, and 5-gallon necks securely.',
  },
  {
    index: 2,
    code: '03',
    name: 'Whisper-quiet pump & 1200 mAh battery',
    detail: 'Low-noise copper-wound diaphragm motor powered by USB rechargeable cell.',
  },
  {
    index: 3,
    code: '04',
    name: 'Seamless satin outer shell',
    detail: 'High-density ABS housing paired with a high-gloss rounded arch accent panel.',
  },
  {
    index: 4,
    code: '05',
    name: '304 stainless steel spout',
    detail: '11.4 cm food-grade steel outlet curved at 120 degrees for splash-free pouring.',
  },
  {
    index: 5,
    code: '06',
    name: 'One-touch cyan LED cap',
    detail: 'Press once for smooth automatic flow, press again to stop immediately.',
  },
] as const;

export interface SceneControlState {
  activeSection: SceneId;
  bottlesProgress: number; // 0..1 scroll progress inside #bottles
  assemblyProgress: number; // 0..1 scroll progress inside #assembly
  activeBottle: BottleIndex;
  finish: PumpFinish;
  pourEnabled: boolean;
  autoDrop: boolean;
  scrollY: number;
  reducedMotion: boolean;
}
