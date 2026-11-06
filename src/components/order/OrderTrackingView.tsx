import React, { useState } from 'react';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import { formatPKR, formatDateTime, formatDate } from '../../utils/formatters';
import { StoreDatabase } from '../../services/db';

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'pending', label: 'Order Placed', desc: 'Received & awaiting verification' },
  { status: 'confirmed', label: 'Confirmed', desc: 'Order verified by MOKHS team' },
  { status: 'processing', label: 'Processing', desc: 'Picked & securely packed' },
  { status: 'shipped', label: 'Shipped', desc: 'Handed over to courier' },
  { status: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider is on the way' },
  { status: 'delivered', label: 'Delivered', desc: 'Handed over to customer' },
];

export const OrderTrackingView: React.FC = () => {
  const { lastOrder, setLastOrder, setActiveView } = useStore();
  const [searchInput, setSearchInput] = useState(lastOrder?.orderNumber || '');
  const [foundOrder, setFoundOrder] = useState<Order | null>(lastOrder || null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearchAttempted(true);
    const order = StoreDatabase.getOrderByNumber(searchInput.trim());
    setFoundOrder(order || null);
  };

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
      case 'payment_pending':
        return 0;
      case 'confirmed':
      case 'paid':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'out_for_delivery':
        return 4;
      case 'delivered':
        return 5;
      default:
        return 0;
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-150">
      {/* Top Breadcrumb / Return */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('store')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Electronics Store</span>
        </button>

        <div className="text-xs text-slate-500">
          UAN Courier Helpline: <span className="font-semibold text-slate-800">+92 300 1234567</span>
        </div>
      </div>

      {/* Search Header Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="max-w-xl space-y-3">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Pakistan Nationwide Dispatch
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Track Your Order Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Enter your unique MOKHS order number (e.g. <strong className="font-mono text-white">MOKHS-PK-88421</strong>) to view real-time courier updates.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="e.g. MOKHS-PK-88421"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              className="w-full pl-10 pr-4 py-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shrink-0 shadow-md"
          >
            Track Parcel
          </button>
        </form>
      </div>

      {/* Found Order Card */}
      {foundOrder ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden space-y-6 p-6 sm:p-8">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Order Tracking ID:</span>
                <span className="text-base font-extrabold font-mono text-blue-600">
                  {foundOrder.orderNumber}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 capitalize">
                  {foundOrder.orderStatus.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Placed on {formatDateTime(foundOrder.createdAt)} · Payment:{' '}
                <strong className="uppercase font-mono">{foundOrder.paymentMethod}</strong> (
                {foundOrder.paymentStatus})
              </p>
            </div>

            <button
              onClick={handlePrintInvoice}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Printer className="w-4 h-4" />
              <span>Print Tax Invoice</span>
            </button>
          </div>

          {/* Visual Step-by-Step Milestone Timeline */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-6">
              Live Delivery Milestone Progress
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative">
              {STATUS_STEPS.map((step, idx) => {
                const currentIdx = getStepIndex(foundOrder.orderStatus);
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step.status} className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="text-xs font-bold font-mono">{idx + 1}</span>
                      )}
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-blue-600' : isPassed ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier Details Strip */}
          {foundOrder.trackingNumber && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    Courier Partner: {foundOrder.courier || 'TCS Express Pakistan'}
                  </div>
                  <div className="text-slate-500">
                    Consignment Tracking #: <strong className="font-mono text-slate-800">{foundOrder.trackingNumber}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                <ShieldCheck className="w-4 h-4" />
                <span>Sealed Parcel Protected</span>
              </div>
            </div>
          )}

          {/* 2-Column: Delivery Address & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            {/* Left: Address */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Delivery Address (Pakistan)</span>
              </h4>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900">{foundOrder.customerName}</p>
                <p>{foundOrder.deliveryAddress.addressLine}</p>
                <p>
                  {foundOrder.deliveryAddress.city}, {foundOrder.deliveryAddress.province}{' '}
                  {foundOrder.deliveryAddress.postalCode}
                </p>
                <p className="font-mono text-slate-500 pt-1">Phone: {foundOrder.customerPhone}</p>
                {foundOrder.customerNotes && (
                  <p className="text-[11px] text-blue-700 italic pt-1">
                    Note: &quot;{foundOrder.customerNotes}&quot;
                  </p>
                )}
              </div>
            </div>

            {/* Right: Payment & Amount */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Payment Summary
              </h4>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Product Subtotal</span>
                  <span className="font-mono tabular-nums">{formatPKR(foundOrder.subtotal)}</span>
                </div>
                {foundOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount Applied</span>
                    <span className="font-mono tabular-nums">-{formatPKR(foundOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charges</span>
                  <span className="font-mono tabular-nums">
                    {foundOrder.deliveryCharge === 0 ? 'FREE' : formatPKR(foundOrder.deliveryCharge)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-950 text-sm">
                  <span>Total Amount</span>
                  <span className="font-mono text-blue-600 tabular-nums">
                    {formatPKR(foundOrder.totalAmount)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Method: <strong className="uppercase">{foundOrder.paymentMethod}</strong> (
                  {foundOrder.paymentMethod === 'cod'
                    ? 'Pay cash upon delivery'
                    : 'Transaction ref: ' + (foundOrder.paymentTransactionRef || 'Verified')}
                  )
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Itemized Products ({foundOrder.items.length})
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Item</th>
                    <th className="py-2.5 px-4">SKU</th>
                    <th className="py-2.5 px-4">Price</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {foundOrder.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                        <span className="font-semibold text-slate-900">{item.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{item.sku}</td>
                      <td className="py-3 px-4 font-mono tabular-nums">{formatPKR(item.price)}</td>
                      <td className="py-3 px-4 text-center font-mono">{item.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-slate-900">
                        {formatPKR(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : searchAttempted ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Order Not Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn&apos;t locate an order with number &quot;{searchInput}&quot;. Please verify the order number from your confirmation SMS or email.
          </p>
        </div>
      ) : null}
    </div>
  );
};
