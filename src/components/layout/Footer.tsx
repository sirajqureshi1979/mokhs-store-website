import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Mail,
  Phone,
  MapPin,
  Check,
  CreditCard,
  Banknote,
  Send,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { MokhsLogo } from '../common/MokhsLogo';

export const Footer: React.FC = () => {
  const { setActiveView, setSelectedCategory, setActivePolicyModal, showToast } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Invalid Email', 'Please enter a valid email address.', 'error');
      return;
    }
    setSubscribed(true);
    showToast(
      'Exclusive Discount Code',
      'Use code MOKHS10 for 10% off your first electronics order!',
      'success'
    );
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-sm mt-16 border-t border-slate-800">
      {/* 4-Pillar Trust Strip */}
      <div className="border-b border-slate-800/80 bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">Nationwide Delivery</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fast 24-48h dispatch via TCS, Leopards & Trax across all Pakistani cities.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">Cash on Delivery</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inspect the parcel and pay cash at your doorstep safely with zero hassle.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-indigo-600/10 text-indigo-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">100% Genuine & PTA</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  All smartphones and electronics are 100% brand authentic with official warranty.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-amber-600/10 text-amber-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">7-Day Replacement</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Instant replacement guarantee for any manufacturing defects or transit issues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col with Logo */}
          <div className="lg:col-span-2 space-y-4">
            <MokhsLogo variant="full" size="md" theme="dark" />
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Smart Electronics. Better Living. Pakistan&apos;s trusted startup electronics store launching with our flagship Vintage T9 Professional Cordless Trimmer, with nationwide Cash on Delivery and replacement warranty.
            </p>

            <div className="pt-2 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Suite 402, Al-Hafeez Heights, Main Boulevard, Gulberg III, Lahore, Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>UAN / WhatsApp: +92 300 1234567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>support@mokhs.store</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Categories</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('cat-mobile-phones');
                    setActiveView('store');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Mobile Phones (PTA Approved)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('cat-laptops-computers');
                    setActiveView('store');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Laptops & Computers
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('cat-headphones-earbuds');
                    setActiveView('store');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Headphones & ANC Earbuds
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('cat-smart-watches');
                    setActiveView('store');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Smart Watches & Trackers
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('cat-powerbanks-chargers');
                    setActiveView('store');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  GaN Chargers & Power Banks
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('cat-routers-wifi');
                    setActiveView('store');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Routers & Wi-Fi 6 Gear
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Customer Support</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    setActiveView('tracking');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Track Order / Courier Status
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('warranty')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  1-Year Official Warranty Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('returns')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Returns & 7-Day Refund Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('shipping')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Nationwide Shipping Information
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('privacy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">MOKHS Insider</h4>
            <p className="text-xs text-slate-400">
              Subscribe for exclusive flash deals, price drops, and tech launches in Pakistan.
            </p>

            {subscribed ? (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 text-xs">
                <div className="flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Subscribed Successfully!</span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-200">
                  Use coupon <span className="font-mono font-bold text-white bg-emerald-900/80 px-1 py-0.5 rounded">MOKHS10</span> at checkout for 10% off.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Instant Rs. 500 or 10% discount coupon upon subscribing.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Payment Gateways Strip */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-400 text-xs">Supported Payment Options in Pakistan:</span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-200 rounded font-medium">
              💵 Cash on Delivery (COD)
            </span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-200 rounded font-medium">
              📱 JazzCash
            </span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-200 rounded font-medium">
              ⚡ Easypaisa
            </span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-200 rounded font-medium">
              💳 Visa / Mastercard
            </span>
          </div>

          <div className="text-xs text-slate-400">
            © {new Date().getFullYear()} MOKHS.STORE. All rights reserved. Registered in Pakistan.
          </div>
        </div>
      </div>
    </footer>
  );
};
