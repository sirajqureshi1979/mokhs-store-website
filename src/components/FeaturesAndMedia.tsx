import React, { useState } from 'react';
import { BatteryCharging, Droplet, Home, Power, VolumeX, Wrench } from 'lucide-react';

const FEATURES = [
  {
    title: 'One-touch pour',
    desc: 'Tap the cyan LED button to pour smoothly; tap once more to stop instantly.',
    Icon: Power,
  },
  {
    title: 'USB rechargeable',
    desc: 'Built-in 1200 mAh battery charges via USB with no wall socket near your water.',
    Icon: BatteryCharging,
  },
  {
    title: 'Whisper-quiet motor',
    desc: 'Noise-reduced diaphragm pump keeps kitchens, bedrooms, and offices calm.',
    Icon: VolumeX,
  },
  {
    title: 'Zero heavy lifting',
    desc: 'Never lift or tip a 19 L barrel again — let the automatic pump do the work.',
    Icon: Droplet,
  },
  {
    title: '304 steel spout',
    desc: 'Curved food-grade stainless outlet pours cleanly into glasses, mugs, and jugs.',
    Icon: Wrench,
  },
  {
    title: 'Home, office & travel',
    desc: 'Compact 13 cm body moves effortlessly from kitchen counter to camping trip.',
    Icon: Home,
  },
];

const SPECS = [
  { label: 'Pump height', value: '13.0 cm · 5.12 in' },
  { label: 'Body diameter', value: '8.0 cm · 3.15 in' },
  { label: 'Spout reach', value: '11.4 cm · 4.50 in' },
  { label: 'Spout drop', value: '3.8 cm · 1.49 in' },
  { label: 'Compatibility', value: '1.5 L, 2, 3, 4 & 5 Gallon' },
  { label: 'Power source', value: 'USB rechargeable Li-ion' },
];

const SETUP_STEPS = [
  {
    num: '01',
    title: 'Push in the steel spout',
    desc: 'Insert the curved 304 stainless steel spout firmly into the front metallic grommet.',
  },
  {
    num: '02',
    title: 'Attach the silicone intake tube',
    desc: 'Slip the food-grade flexible silicone tube onto the intake nozzle beneath the pump.',
  },
  {
    num: '03',
    title: 'Drop directly onto the bottle neck',
    desc: 'Lower the tube into your 5-gallon, 3-gallon, or 1.5 L bottle and press the collar flush.',
  },
  {
    num: '04',
    title: 'Press the top LED button',
    desc: 'Tap once for steady automatic flow into your glass; tap again to shut off cleanly.',
  },
];

const REAL_PHOTOS = [
  {
    src: '/assets/images/real-pour.jpg',
    alt: 'MOKHS automatic water pump pouring fresh water into a clear glass from a 5 gallon bottle',
    caption: 'One-touch pour straight into your glass',
    spanClass: 'md:col-span-5',
  },
  {
    src: '/assets/images/real-closeup.jpg',
    alt: 'MOKHS water pump close-up showing Pearl White and Obsidian Black finishes with cyan LED ring',
    caption: 'Pearl White & Obsidian Black finishes with quiet motor',
    spanClass: 'md:col-span-4',
  },
  {
    src: '/assets/images/real-bottles.jpg',
    alt: 'MOKHS pump fitted across 1.5 L small bottle, 3 gallon handle bottle, and 5 gallon barrel',
    caption: 'Verified fit across 1.5 L, 3-gallon & 5-gallon bottles',
    spanClass: 'md:col-span-3',
  },
];

function ResilientProductPhoto({
  src,
  alt,
  caption,
  spanClass,
}: {
  src: string;
  alt: string;
  caption: string;
  spanClass: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <figure
      className={`group relative overflow-hidden rounded-2xl border border-sky-200/14 bg-[#07152b] ${spanClass}`}
    >
      {failed ? (
        <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#071a36] to-[#030b17] p-6 text-center">
          <Droplet className="h-8 w-8 text-sky-400" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-200">{caption}</p>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-72 w-full bg-white object-cover transition-transform duration-300 group-hover:scale-[1.02] sm:h-80"
        />
      )}
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#020814]/95 via-[#020814]/65 to-transparent px-4 pt-10 pb-3.5 text-xs font-medium text-slate-100">
        {caption}
      </figcaption>
    </figure>
  );
}

export const FeaturesAndMedia: React.FC = () => {
  return (
    <>
      {/* FEATURES & PRECISION SPECS */}
      <section
        id="features"
        data-scene="features"
        className="relative z-10 flex min-h-screen items-center px-5 py-24 sm:px-10 lg:px-16"
      >
        <div className="mx-auto flex w-full max-w-[1360px] justify-end">
          <div className="w-full max-w-[560px] rounded-2xl border border-sky-200/14 bg-[#051022]/88 p-6 sm:p-8 lg:w-[46vw] lg:bg-[#051022]/80">
            <p className="text-xs font-medium tracking-wide text-sky-300">
              Engineered for daily convenience
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
              Compact pump. Effortless pour.
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FEATURES.map(({ title, desc, Icon }) => (
                <div
                  key={title}
                  className="rounded-xl border border-sky-200/10 bg-[#071730]/65 p-4"
                >
                  <Icon className="h-5 w-5 text-sky-400" aria-hidden="true" />
                  <h3 className="mt-3 text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">
                    {desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Technical specifications table with tabular numerals */}
            <div className="mt-6 border-t border-sky-200/12 pt-4">
              <dl className="divide-y divide-sky-200/10 text-sm">
                {SPECS.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-4 py-2.5"
                  >
                    <dt className="text-slate-400">{row.label}</dt>
                    <dd className="font-mono text-xs font-medium tabular-nums text-slate-100">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* FOUR-STEP ZERO-TOOL SETUP */}
      <section
        id="install"
        data-scene="install"
        className="relative z-10 flex min-h-screen items-center px-5 py-24 sm:px-10 lg:px-16"
      >
        <div className="mx-auto w-full max-w-[1360px]">
          <div className="w-full max-w-[530px] rounded-2xl border border-sky-200/14 bg-[#051022]/88 p-6 sm:p-8 lg:w-[44vw] lg:bg-[#051022]/80">
            <p className="text-xs font-medium tracking-wide text-sky-300">
              Ready in under 60 seconds
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
              Four steps. Zero tools.
            </h2>

            <ol className="mt-6 space-y-3">
              {SETUP_STEPS.map((step) => (
                <li
                  key={step.num}
                  className="flex items-start gap-4 rounded-xl border border-sky-200/12 bg-[#071730]/65 p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-400 font-mono text-xs font-bold tabular-nums text-slate-950">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">
                      {step.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* REAL PRODUCT PHOTOGRAPHY */}
      <section
        id="real"
        data-scene="real"
        className="relative z-10 px-5 py-24 sm:px-10 lg:px-16"
      >
        <div className="mx-auto max-w-[1200px]">
          <p className="text-xs font-medium tracking-wide text-sky-300">
            Actual product photography
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              What arrives at your door.
            </h2>
            <p className="text-sm text-slate-400">
              Includes pump unit · 304 steel spout · 55 cm silicone tube · USB cable
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-12">
            {REAL_PHOTOS.map((photo) => (
              <ResilientProductPhoto key={photo.src} {...photo} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
