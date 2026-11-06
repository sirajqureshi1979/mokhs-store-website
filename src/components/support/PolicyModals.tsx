import React from 'react';
import { X, ShieldCheck, Truck, RotateCcw, Lock, FileText } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const PolicyModals: React.FC = () => {
  const { activePolicyModal, setActivePolicyModal } = useStore();

  if (!activePolicyModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[88vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            {activePolicyModal === 'warranty' && (
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            )}
            {activePolicyModal === 'returns' && <RotateCcw className="w-5 h-5 text-amber-600" />}
            {activePolicyModal === 'shipping' && <Truck className="w-5 h-5 text-emerald-600" />}
            {activePolicyModal === 'privacy' && <Lock className="w-5 h-5 text-slate-700" />}
            {activePolicyModal === 'terms' && <FileText className="w-5 h-5 text-slate-700" />}

            <h3 className="text-base font-bold text-slate-900 capitalize">
              {activePolicyModal === 'warranty' && '1-Year Official Brand Warranty Policy'}
              {activePolicyModal === 'returns' && 'Returns & 7-Day Replacement Guarantee'}
              {activePolicyModal === 'shipping' && 'Nationwide Express Shipping Policy'}
              {activePolicyModal === 'privacy' && 'Customer Privacy & Data Protection Policy'}
              {activePolicyModal === 'terms' && 'Store Terms & Conditions of Sale'}
            </h3>
          </div>

          <button
            onClick={() => setActivePolicyModal(null)}
            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto text-xs sm:text-sm text-slate-600 space-y-4 leading-relaxed flex-1">
          {activePolicyModal === 'warranty' && (
            <>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900">
                <h4 className="font-bold text-sm">100% Genuine Pakistani Warranty Commitment</h4>
                <p className="mt-1 text-xs">
                  Every electronic product sold on MOKHS.STORE is brand-new, factory-sealed, and backed by either official manufacturer warranty or MOKHS Replacement Warranty.
                </p>
              </div>

              <h4 className="font-bold text-slate-900 text-sm">1. Mobile Phones & PTA Compliance</h4>
              <p>
                All smartphones and cellular devices sold are 100% PTA Approved (tax paid). You can verify the IMEI upon parcel receipt by sending it to 8484 or via the official PTA DIRBS online portal.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">2. Authorized Service Centers</h4>
              <p>
                Warranty claims can be brought to any authorized service center in Pakistan with the original box, stamped warranty card, and your MOKHS digital tax invoice.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">3. What is Covered</h4>
              <p>
                Internal hardware defects, motherboards, display failures not caused by drops, and charging controller faults under normal usage conditions.
              </p>
            </>
          )}

          {activePolicyModal === 'returns' && (
            <>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
                <h4 className="font-bold text-sm">7-Day Hassle-Free Replacement Policy</h4>
                <p className="mt-1 text-xs">
                  We want you to be completely satisfied with your electronics purchase. We offer a 7-day window for transit damages or out-of-the-box faults.
                </p>
              </div>

              <h4 className="font-bold text-slate-900 text-sm">1. Eligibility for Replacement</h4>
              <p>
                The item must include the original manufacturer box, all accessories, plastic wraps, and manual. Any damage in transit will be resolved immediately with a free replacement.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">2. Doorstep Pickup Process</h4>
              <p>
                Contact our customer support via WhatsApp (+92 300 1234567) with your Order ID and photo/video of the issue. We arrange a TCS reverse pickup from your doorstep at zero cost to you.
              </p>
            </>
          )}

          {activePolicyModal === 'shipping' && (
            <>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900">
                <h4 className="font-bold text-sm">Fast 24-48 Hour Courier Dispatch</h4>
                <p className="mt-1 text-xs">
                  We partner with Pakistan&apos;s leading logistics networks: TCS Express, Leopards Courier, Trax, and Call Courier.
                </p>
              </div>

              <h4 className="font-bold text-slate-900 text-sm">1. Delivery Timeline</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Lahore:</strong> Same-day or next-day delivery (within 24 hours).</li>
                <li><strong>Karachi & Islamabad/Rawalpindi:</strong> 24 to 48 hours.</li>
                <li><strong>Other Pakistani Cities & Towns:</strong> 2 to 3 working days.</li>
              </ul>

              <h4 className="font-bold text-slate-900 text-sm">2. Shipping Charges</h4>
              <p>
                <strong>FREE Shipping</strong> on all orders of Rs. 3,000 or above! For orders below Rs. 3,000, a flat nominal delivery fee of Rs. 250 is applied.
              </p>
            </>
          )}

          {(activePolicyModal === 'privacy' || activePolicyModal === 'terms') && (
            <>
              <h4 className="font-bold text-slate-900 text-sm">Security & Privacy Terms</h4>
              <p>
                MOKHS.STORE is committed to protecting your privacy. We never sell, rent, or share customer contact details or delivery addresses with third parties except the courier partner responsible for delivering your parcel.
              </p>
              <p>
                Payment information entered for online card payments is processed via 256-bit encrypted banking gateways. No card numbers or CVVs are stored on our servers.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={() => setActivePolicyModal(null)}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
