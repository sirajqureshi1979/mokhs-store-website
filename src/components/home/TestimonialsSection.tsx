import React from 'react';
import { Star, CheckCircle, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StoreDatabase } from '../../services/db';

export const TestimonialsSection: React.FC = () => {
  const reviews = StoreDatabase.getReviews();

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Verified Pakistani Buyers
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Customer Reviews & Experiences
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="flex items-center text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <span className="font-bold text-slate-800">4.9 / 5.0 Average</span>
          <span aria-hidden="true">·</span>
          <span>500+ Verified Nationwide Orders</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                {rev.verifiedPurchase && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold flex items-center gap-1 border border-emerald-200">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified Buyer</span>
                  </span>
                )}
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 leading-snug">
                &ldquo;{rev.title}&rdquo;
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                {rev.comment}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">{rev.customerName}</span>
              <span className="text-slate-400 font-medium">{rev.city}, Pakistan</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
