/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { StorefrontView } from './components/home/StorefrontView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { OrderTrackingView } from './components/order/OrderTrackingView';
import { CustomerOrdersView } from './components/order/CustomerOrdersView';
import { WishlistView } from './components/product/WishlistView';
import { ProductDetailModal } from './components/product/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { AuthModal } from './components/auth/AuthModal';
import { ContactModal } from './components/support/ContactModal';
import { PolicyModals } from './components/support/PolicyModals';
import { WhatsAppButton } from './components/support/WhatsAppButton';
import { ToastContainer } from './components/common/ToastContainer';

const MainAppContent: React.FC = () => {
  const { activeView, selectedProduct, setSelectedProduct } = useStore();

  if (activeView === 'admin') {
    return (
      <div className="min-h-screen bg-slate-900">
        <AdminDashboard />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      <Navbar />

      <main className="flex-1">
        {activeView === 'store' && <StorefrontView />}
        {activeView === 'tracking' && <OrderTrackingView />}
        {activeView === 'orders' && <CustomerOrdersView />}
        {activeView === 'wishlist' && <WishlistView />}
      </main>

      <Footer />

      {/* Global Overlays & Modals */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      <CartDrawer />
      <CheckoutModal />
      <AuthModal />
      <ContactModal />
      <PolicyModals />
      <WhatsAppButton />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}
