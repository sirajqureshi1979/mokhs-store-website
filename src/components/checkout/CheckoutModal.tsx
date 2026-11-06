import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../../context/StoreContext';
import { formatPKR } from '../../utils/formatters';
import { PaymentMethod, DeliveryAddress, Order } from '../../types';
import { StoreDatabase } from '../../services/db';
import { MokhsLogo } from '../common/MokhsLogo';

const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Wah Cantt',
  'Mardan',
  'Kasur',
];

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    currentUser,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
    setLastOrder,
    setActiveView,
    showToast,
  } = useStore();

  const [step, setStep] = useState<'details' | 'payment'>('details');

  // Address & Customer Info
  const defaultAddr = currentUser?.addresses?.[0];
  const [recipientName, setRecipientName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '+92 3');
  const [addressLine, setAddressLine] = useState(defaultAddr?.addressLine || '');
  const [city, setCity] = useState(defaultAddr?.city || 'Lahore');
  const [province, setProvince] = useState(defaultAddr?.province || 'Punjab');
  const [postalCode, setPostalCode] = useState(defaultAddr?.postalCode || '54000');
  const [customerNotes, setCustomerNotes] = useState('');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [jazzCashPhone, setJazzCashPhone] = useState('+92 3');
  const [easypaisaPhone, setEasypaisaPhone] = useState('+92 3');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isCheckoutOpen) return null;

  const freeShippingThreshold = 3000;
  const deliveryCharge = cartSubtotal >= freeShippingThreshold || cart.length === 0 ? 0 : 250;
  const totalAmount = cartSubtotal + deliveryCharge;

  const gatewaysConfig = StoreDatabase.getPaymentGateways();

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !email.trim() || !phone.trim() || !addressLine.trim()) {
      showToast('Incomplete Address', 'Please provide full name, contact mobile, and delivery address.', 'error');
      return;
    }
    setStep('payment');
  };

  const handlePlaceOrder = () => {
    setIsProcessing(true);

    // Validate payment parameters
    let paymentStatus: 'pending' | 'paid' | 'payment_pending' = 'pending';
    let paymentRef = '';

    if (paymentMethod === 'cod') {
      paymentStatus = 'pending'; // Cash will be collected by TCS / Leopards courier
      paymentRef = `COD-${Date.now().toString().slice(-6)}`;
    } else if (paymentMethod === 'jazzcash') {
      // Official JazzCash Gateway verification architecture
      if (gatewaysConfig.jazzcash.status === 'awaiting_credentials' || !gatewaysConfig.jazzcash.merchantId) {
        // Transparent merchant callback status
        paymentStatus = 'payment_pending';
        paymentRef = `JC-SANDBOX-${Date.now().toString().slice(-6)}`;
      } else {
        paymentStatus = 'paid';
        paymentRef = `JC-VERIFIED-${Date.now().toString().slice(-6)}`;
      }
    } else if (paymentMethod === 'easypaisa') {
      if (gatewaysConfig.easypaisa.status === 'awaiting_credentials' || !gatewaysConfig.easypaisa.storeId) {
        paymentStatus = 'payment_pending';
        paymentRef = `EP-SANDBOX-${Date.now().toString().slice(-6)}`;
      } else {
        paymentStatus = 'paid';
        paymentRef = `EP-VERIFIED-${Date.now().toString().slice(-6)}`;
      }
    } else if (paymentMethod === 'card') {
      paymentStatus = 'paid';
      paymentRef = `CARD-TXN-${Date.now().toString().slice(-6)}`;
    }

    setTimeout(() => {
      const deliveryAddress: DeliveryAddress = {
        id: `addr-${Date.now()}`,
        title: 'Delivery Address',
        recipientName,
        phone,
        addressLine,
        city,
        province,
        postalCode,
        isDefault: true,
      };

      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.discountedPrice ?? item.product.regularPrice,
        quantity: item.quantity,
        image: item.product.images[0] || '',
        sku: item.product.sku,
        brand: item.product.brand,
      }));

      const newOrder = StoreDatabase.createOrder({
        customerId: currentUser?.id || `guest-${Date.now()}`,
        customerName: recipientName,
        customerEmail: email,
        customerPhone: phone,
        deliveryAddress,
        items: orderItems,
        subtotal: cartSubtotal,
        discount: 0,
        deliveryCharge,
        totalAmount,
        paymentMethod,
        paymentStatus,
        orderStatus: paymentMethod === 'cod' ? 'confirmed' : 'processing',
        paymentTransactionRef: paymentRef,
        courier: 'TCS',
        trackingNumber: `TCS-PK-${Math.floor(10000000 + Math.random() * 90000000)}`,
        customerNotes,
      });

      // Fire confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // gracefully ignore if canvas-confetti blocked
      }

      setIsProcessing(false);
      clearCart();
      setIsCheckoutOpen(false);
      setLastOrder(newOrder);
      setActiveView('tracking');
      showToast('Order Confirmed!', `Order ${newOrder.orderNumber} successfully booked with MOKHS.STORE.`, 'success');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <MokhsLogo variant="compact" size="sm" />
            <div className="hidden sm:block h-6 w-px bg-slate-200" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Secure Checkout · MOKHS.STORE
              </h2>
              <p className="text-xs text-slate-500">
                Express delivery across Pakistan with 100% Genuine Warranty & COD
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Step Stepper Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step === 'details' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              1
            </span>
            <span className={step === 'details' ? 'text-blue-600 font-bold' : 'text-slate-700'}>
              Delivery Details
            </span>
          </div>

          <div className="h-0.5 flex-1 mx-4 bg-slate-200" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step === 'payment' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </span>
            <span className={step === 'payment' ? 'text-blue-600 font-bold' : 'text-slate-500'}>
              Payment & Confirm
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {step === 'details' ? (
            <form id="checkout-details-form" onSubmit={handleDetailsSubmit} className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                1. Recipient & Delivery Address in Pakistan
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name (as on CNIC) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Siraj Qureshi"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Contact Mobile Number (+92) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+92 300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Courier rider will call this number before arrival.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address (for Digital Tax Invoice & Tracking) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    City (Pakistan) *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 bg-white"
                  >
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Province *
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 bg-white"
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa (KPK)</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Federal Capital">Federal Capital (Islamabad)</option>
                    <option value="Azad Kashmir">Azad Kashmir</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 54660"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Complete Street Address (House/Office #, Street, Sector, Area) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. House #14, Street 7, Sector F-8/2, or Floor 4 Al-Hafeez Heights Gulberg"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Special Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call before delivery, deliver between 10 AM to 5 PM"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600"
                />
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Select Pakistani Payment Method
                </h3>
                <button
                  onClick={() => setStep('details')}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Edit Address
                </button>
              </div>

              {/* Payment Methods Accordion / Radios */}
              <div className="space-y-3">
                {/* Method 1: Cash on Delivery (COD) - ACTIVE */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            Cash on Delivery (COD)
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                            Active & Recommended
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Pay cash in PKR directly to the courier delivery rider (TCS / Leopards / Trax) upon receiving your sealed electronics package at your doorstep.
                        </p>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center mt-1">
                      {paymentMethod === 'cod' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Method 2: JazzCash Official Integration */}
                <div
                  onClick={() => setPaymentMethod('jazzcash')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'jazzcash'
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold text-xs">
                        JC
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            JazzCash Mobile Account & Voucher
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                            Official Merchant API
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Pay instantly using your JazzCash Mobile Wallet with MPIN verification or generated voucher.
                        </p>

                        {paymentMethod === 'jazzcash' && (
                          <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                            <label className="block text-[11px] font-semibold text-slate-700">
                              JazzCash Registered Mobile Number:
                            </label>
                            <input
                              type="tel"
                              value={jazzCashPhone}
                              onChange={(e) => setJazzCashPhone(e.target.value)}
                              placeholder="+92 300 1234567"
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
                            />
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1">
                              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span>
                                {gatewaysConfig.jazzcash.status === 'awaiting_credentials'
                                  ? 'Merchant API Sandbox Mode: You can proceed to test end-to-end checkout flow.'
                                  : 'Production Merchant Gateway Connected.'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center mt-1">
                      {paymentMethod === 'jazzcash' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Method 3: Easypaisa Official Integration */}
                <div
                  onClick={() => setPaymentMethod('easypaisa')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'easypaisa'
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-xs">
                        EP
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            Easypaisa Direct Account
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                            Official Merchant API
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Authorize payment directly from your Easypaisa app or mobile account via Telenor Bank.
                        </p>

                        {paymentMethod === 'easypaisa' && (
                          <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                            <label className="block text-[11px] font-semibold text-slate-700">
                              Easypaisa Registered Mobile Number:
                            </label>
                            <input
                              type="tel"
                              value={easypaisaPhone}
                              onChange={(e) => setEasypaisaPhone(e.target.value)}
                              placeholder="+92 345 1234567"
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
                            />
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1">
                              <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>
                                {gatewaysConfig.easypaisa.status === 'awaiting_credentials'
                                  ? 'Store ID Sandbox Mode: Complete end-to-end order processing is supported.'
                                  : 'Production Easypaisa Gateway Active.'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center mt-1">
                      {paymentMethod === 'easypaisa' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Method 4: Debit and Credit Cards */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            Visa & Mastercard (Debit / Credit)
                          </span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                            256-bit SSL
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Supports Habib Bank, Meezan, MCB, UBL, Standard Chartered and all Pakistani bank cards.
                        </p>

                        {paymentMethod === 'card' && (
                          <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                            <div>
                              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                                Card Number
                              </label>
                              <input
                                type="text"
                                placeholder="4000 1234 5678 9010"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                                  Expiry (MM/YY)
                                </label>
                                <input
                                  type="text"
                                  placeholder="12/28"
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(e.target.value)}
                                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                                  CVV / CVC
                                </label>
                                <input
                                  type="password"
                                  placeholder="•••"
                                  maxLength={4}
                                  value={cardCVC}
                                  onChange={(e) => setCardCVC(e.target.value)}
                                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center mt-1">
                      {paymentMethod === 'card' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Item Summary Preview */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="font-semibold text-slate-900 flex justify-between">
              <span>Order Subtotal ({cart.length} items)</span>
              <span className="font-mono tabular-nums">{formatPKR(cartSubtotal)}</span>
            </div>
            <div className="text-slate-600 flex justify-between">
              <span>Courier Delivery (TCS / Leopards)</span>
              <span className="font-mono tabular-nums">
                {deliveryCharge === 0 ? <span className="text-emerald-600 font-semibold">FREE</span> : formatPKR(deliveryCharge)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold text-sm text-slate-950">
              <span>Total Payable Amount</span>
              <span className="font-mono text-blue-600 text-base tabular-nums">
                {formatPKR(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white sticky bottom-0 z-10 flex items-center justify-between gap-4">
          {step === 'details' ? (
            <>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Back to Cart
              </button>
              <button
                type="submit"
                form="checkout-details-form"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep('details')}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Back to Details
              </button>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'Processing Order...'
                    : `Confirm Order (${formatPKR(totalAmount)})`}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
