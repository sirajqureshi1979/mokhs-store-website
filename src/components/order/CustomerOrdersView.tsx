import React from 'react';
import { ShoppingBag, Eye, Truck, ArrowLeft, Calendar, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatPKR, formatDate } from '../../utils/formatters';

export const CustomerOrdersView: React.FC = () => {
  const { orders, currentUser, setActiveView, setLastOrder } = useStore();

  // If customer is logged in, filter their orders, or show sample orders
  const customerOrders = currentUser
    ? orders.filter(
        (o) =>
          o.customerId === currentUser.id ||
          o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
      )
    : orders;

  const handleTrackSingleOrder = (order: (typeof orders)[0]) => {
    setLastOrder(order);
    setActiveView('tracking');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('store')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>

        <h1 className="text-xl font-bold text-slate-900">My Orders & Invoices</h1>
      </div>

      {customerOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No orders placed yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your completed and in-transit orders with official warranty will appear here.
          </p>
          <button
            onClick={() => setActiveView('store')}
            className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {customerOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                <div>
                  <span className="font-mono font-bold text-blue-600 text-sm">
                    {order.orderNumber}
                  </span>
                  <span className="text-slate-500 ml-2">
                    Placed on {formatDate(order.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize bg-blue-50 text-blue-700">
                    {order.orderStatus.replace('_', ' ')}
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatPKR(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div className="flex flex-wrap items-center gap-3">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 object-cover rounded-lg"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 line-clamp-1 max-w-[200px]">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Qty: {item.quantity} · {formatPKR(item.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer row */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-slate-500">
                  Payment: <strong className="uppercase">{order.paymentMethod}</strong> (
                  {order.paymentStatus})
                </div>

                <button
                  onClick={() => handleTrackSingleOrder(order)}
                  className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details & Invoice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
