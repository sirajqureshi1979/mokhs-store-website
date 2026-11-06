import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Truck,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatPKR } from '../../utils/formatters';
import { StoreDatabase } from '../../services/db';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    setIsCheckoutOpen,
    showToast,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const freeShippingThreshold = 3000;
  const deliveryCharge = cartSubtotal >= freeShippingThreshold || cart.length === 0 ? 0 : 250;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalAmount = Math.max(0, cartSubtotal - discountAmount + deliveryCharge);
  const freeShippingNeeded = Math.max(0, freeShippingThreshold - cartSubtotal);
  const progressPercent = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponInput.trim()) return;

    const res = StoreDatabase.validateCoupon(couponInput, cartSubtotal);
    if (!res.valid || !res.coupon) {
      setCouponError(res.error || 'Invalid coupon code');
      showToast('Coupon Error', res.error || 'Invalid coupon code', 'error');
      return;
    }

    let calculatedDiscount = 0;
    if (res.coupon.discountType === 'percentage') {
      calculatedDiscount = (cartSubtotal * res.coupon.value) / 100;
      if (res.coupon.maxDiscount) {
        calculatedDiscount = Math.min(calculatedDiscount, res.coupon.maxDiscount);
      }
    } else {
      calculatedDiscount = res.coupon.value;
    }

    setAppliedCoupon({
      code: res.coupon.code,
      discountAmount: calculatedDiscount,
    });
    setCouponInput('');
    showToast('Coupon Applied', `Code ${res.coupon.code} applied! Saved ${formatPKR(calculatedDiscount)}`, 'success');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    showToast('Coupon Removed', 'Discount coupon removed.', 'info');
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Your Shopping Cart</h2>
            <span className="text-xs text-slate-500 font-mono">({cart.length} items)</span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-6 py-2.5 text-xs">
          {freeShippingNeeded > 0 ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-blue-900">
                <span className="flex items-center gap-1.5 font-medium">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Add <strong className="font-mono">{formatPKR(freeShippingNeeded)}</strong> more for FREE Shipping!</span>
                </span>
                <span className="font-bold tabular-nums">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-1.5 bg-blue-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>You have unlocked FREE Nationwide Delivery!</span>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-6 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Your cart is empty</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Explore our catalog of smartphones, headphones, laptops, and gadgets with Cash on Delivery nationwide.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Start Shopping Now
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const itemPrice = item.product.discountedPrice ?? item.product.regularPrice;
              return (
                <div key={item.product.id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200/80">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          {item.product.brand}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 line-clamp-1 mt-0.5">
                        {item.product.name}
                      </h4>
                      <p className="text-xs font-mono font-bold text-slate-900 mt-1 tabular-nums">
                        {formatPKR(itemPrice)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs font-mono font-semibold text-slate-700 tabular-nums">
                        {formatPKR(itemPrice * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions & Price Breakdown */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/60 space-y-4">
            {/* Coupon Code Section */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>
                      Coupon <strong className="font-mono">{appliedCoupon.code}</strong> applied (-{formatPKR(appliedCoupon.discountAmount)})
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-rose-600 font-semibold hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code (e.g. MOKHS10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-blue-600 uppercase font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{couponError}</span>
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-medium tabular-nums">{formatPKR(cartSubtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span className="font-mono tabular-nums">-{formatPKR(appliedCoupon.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Nationwide Shipping</span>
                <span className="font-mono tabular-nums">
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-600 font-semibold">FREE</span>
                  ) : (
                    formatPKR(deliveryCharge)
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-slate-950 font-bold text-sm sm:text-base">
                <span>Total Payable</span>
                <span className="font-mono text-blue-600 text-lg tabular-nums">
                  {formatPKR(totalAmount)}
                </span>
              </div>
            </div>

            {/* Checkout CTA Button */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
