import React from 'react';
import { ArrowRight, ShieldCheck, Truck, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { MokhsLogo } from '../common/MokhsLogo';

export const HeroBanner: React.FC = () => {
  const { products, setSelectedProduct, addToCart, setIsCheckoutOpen } = useStore();

  const launchProduct = products.find((p) => p.id === 'prod-vintage-t9-dragon-trimmer') || products[0];

  const handleInstantBuy = () => {
    if (launchProduct) {
      addToCart(launchProduct, 1);
      setIsCheckoutOpen(true);
    }
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6 border border-slate-800 shadow-2xl">
      {/* Background Hero Image with measured contrast scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/aistudio/Screenshot_2026-11-06_at_11.01.44_AM_2c234714.png"
          alt="Vintage T9 Professional Trimmer"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-right sm:object-center opacity-35 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-12 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Col */}
          <div className="lg:col-span-7 space-y-5">
            {/* Logo Badge & Startup Tag */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-900/60 border border-blue-600/80 rounded-full text-xs font-bold text-cyan-300 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>OFFICIAL STARTUP LAUNCH PRODUCT</span>
              </div>
              <span className="text-xs text-amber-300 font-semibold">
                (Other products coming soon · we will buy later)
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans text-balance">
              Vintage T9 Professional <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400">
                Dragon Relief Trimmer
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Engineered with heavy-duty zinc alloy and 0.1mm short-distance zero-gapped stainless T-blade for skin-safe clean close shaving, crisp lining, and precision hair contouring. Features universal Type-C fast charging (15+ haircuts per charge) and 4 guide combs.
            </p>

            {/* Launch Deal Banner */}
            <div className="inline-flex items-baseline gap-3 p-3 bg-slate-900/90 rounded-2xl border border-slate-700">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400">
                Rs. 2,199
              </span>
              <span className="text-xs text-slate-400 line-through font-mono">Rs. 3,499</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                Launch Deal 37% OFF · Cash on Delivery
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleInstantBuy}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Order Now with Cash on Delivery</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedProduct(launchProduct)}
                className="px-5 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 backdrop-blur-xs transition-colors cursor-pointer"
              >
                <span>View Specs & Box Details</span>
              </button>
            </div>

            {/* Adjacency Trust Badges */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300 font-medium">In Stock & Ready for Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-slate-300 font-medium">TCS / Leopards Delivery Nationwide</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-300 font-medium">6 Months MOKHS Replacement Warranty</span>
              </div>
            </div>
          </div>

          {/* Right Product Spotlight Image */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-sm aspect-4/5 rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-2xl bg-slate-900/80 group">
              <img
                src="/assets/aistudio/Screenshot_2026-11-06_at_11.01.44_AM_2c234714.png"
                alt="Vintage T9 Dragon Carving Trimmer"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-3 left-3">
                <MokhsLogo variant="badge" />
              </div>
              <div className="absolute bottom-3 inset-x-3 p-3 bg-slate-950/85 backdrop-blur-md rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-300 uppercase block">
                    Zero-Gapped 0.1mm Head
                  </span>
                  <span className="text-xs font-semibold text-white">Zinc Alloy Heavy Dragon Body</span>
                </div>
                <button
                  onClick={() => setSelectedProduct(launchProduct)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                >
                  Inspect
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
