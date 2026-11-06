import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  ShieldCheck,
  Truck,
  Menu,
  X,
  SlidersHorizontal,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Smartphone,
  CheckCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatPKR } from '../../utils/formatters';
import { MokhsLogo } from '../common/MokhsLogo';

export const Navbar: React.FC = () => {
  const {
    cartCount,
    cartSubtotal,
    wishlist,
    currentUser,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    setIsCartOpen,
    setIsAuthModalOpen,
    setActiveView,
    activeView,
    switchUserRole,
    logoutUser,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const isAdmin = currentUser && currentUser.role !== 'customer';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* 1. Top Announcement Bar */}
      <div className="bg-slate-900 text-slate-100 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Truck className="w-3.5 h-3.5" />
              <span>Express Delivery Across Pakistan (TCS / Leopards)</span>
            </span>
            <span className="hidden md:inline text-slate-500">·</span>
            <span className="hidden md:inline text-amber-300 font-semibold">
              ⚡ Startup Launch: Vintage T9 Trimmer Ready for Dispatch!
            </span>
            <span className="hidden lg:inline text-slate-500">·</span>
            <span className="hidden lg:flex items-center gap-1 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Genuine MOKHS Warranty</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => {
                setActiveView('tracking');
                setMobileMenuOpen(false);
              }}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Track Order
            </button>
            <span className="text-slate-700">|</span>
            <span className="text-slate-300">UAN: +92 300 1234567</span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar - Strictly follows the Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-18">
          {/* Zone 1: Brand Wordmark with Custom Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setActiveView('store');
                setSelectedCategory(null);
                setSearchQuery('');
              }}
              className="flex items-center text-left cursor-pointer group"
            >
              <MokhsLogo variant="full" size="md" theme="light" />
            </button>
          </div>

          {/* Search Bar (Centered on Desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg relative">
            <div className="w-full relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search phones, laptops, smartwatches, earbuds..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeView !== 'store') setActiveView('store');
                }}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 hover:bg-slate-200/80 focus:bg-white text-slate-900 placeholder:text-slate-600 rounded-lg border border-transparent focus:border-blue-600 focus:outline-hidden transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 shrink-0">
            <button
              onClick={() => {
                setActiveView('store');
                setSelectedCategory(null);
              }}
              className={`transition-colors whitespace-nowrap cursor-pointer ${
                activeView === 'store' && !selectedCategory
                  ? 'text-blue-600 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => {
                setActiveView('store');
                setSelectedCategory('cat-mobile-phones');
              }}
              className="hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer"
            >
              Mobiles
            </button>
            <button
              onClick={() => {
                setActiveView('store');
                setSelectedCategory('cat-laptops-computers');
              }}
              className="hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer"
            >
              Laptops
            </button>
            <button
              onClick={() => {
                setActiveView('tracking');
              }}
              className={`transition-colors whitespace-nowrap cursor-pointer ${
                activeView === 'tracking'
                  ? 'text-blue-600 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Order Tracking
            </button>
            <button
              onClick={() => {
                setActiveView('orders');
              }}
              className={`transition-colors whitespace-nowrap cursor-pointer ${
                activeView === 'orders'
                  ? 'text-blue-600 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              My Orders
            </button>
          </nav>

          {/* Zone 3: Interactive Controls (Search, Wishlist, User, Cart) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => setActiveView('wishlist')}
              className="relative p-2 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="My Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* User Account / Role Menu */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
                  {currentUser ? currentUser.name.charAt(0) : <User className="w-4 h-4" />}
                </div>
                <span className="hidden xl:inline text-xs truncate max-w-[100px]">
                  {currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  {currentUser ? (
                    <>
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                        <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                        <span className="inline-block mt-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          Role: {currentUser.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => setActiveView('admin')}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Admin Control Panel</span>
                        </button>
                      )}

                      <button
                        onClick={() => setActiveView('orders')}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4 text-slate-400" />
                        <span>Order History & Invoices</span>
                      </button>

                      <button
                        onClick={() => setActiveView('tracking')}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Truck className="w-4 h-4 text-slate-400" />
                        <span>Track a Parcel</span>
                      </button>

                      {/* Fast Role Switcher for Verification */}
                      <div className="border-t border-slate-100 px-4 py-2 bg-slate-50/50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Quick Role Switch (Demo Mode)
                        </p>
                        <div className="grid grid-cols-2 gap-1 text-[11px]">
                          <button
                            onClick={() => switchUserRole('super_admin')}
                            className="px-2 py-1 text-left rounded hover:bg-white text-slate-700 font-medium border border-transparent hover:border-slate-200"
                          >
                            Super Admin
                          </button>
                          <button
                            onClick={() => switchUserRole('store_manager')}
                            className="px-2 py-1 text-left rounded hover:bg-white text-slate-700 font-medium border border-transparent hover:border-slate-200"
                          >
                            Store Manager
                          </button>
                          <button
                            onClick={() => switchUserRole('order_manager')}
                            className="px-2 py-1 text-left rounded hover:bg-white text-slate-700 font-medium border border-transparent hover:border-slate-200"
                          >
                            Order Manager
                          </button>
                          <button
                            onClick={() => switchUserRole('customer')}
                            className="px-2 py-1 text-left rounded hover:bg-white text-slate-700 font-medium border border-transparent hover:border-slate-200"
                          >
                            Customer
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={logoutUser}
                          className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-3">
                      <p className="text-xs text-slate-600 mb-3">
                        Sign in to access your orders, saved addresses, and wishlist.
                      </p>
                      <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg text-center shadow-xs"
                      >
                        Sign In / Register
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 w-4.5 h-4.5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold tabular-nums hidden sm:inline">
                {cartSubtotal > 0 ? formatPKR(cartSubtotal) : 'Cart'}
              </span>
            </button>

            {/* Admin Direct Button (When logged in as Admin) */}
            {isAdmin && (
              <button
                onClick={() => setActiveView(activeView === 'admin' ? 'store' : 'admin')}
                className={`hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  activeView === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{activeView === 'admin' ? 'Exit Admin' : 'Admin'}</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-slate-950 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Category Horizontal Quick-Bar */}
        <div className="hidden md:flex items-center gap-2 py-2 overflow-x-auto border-t border-slate-100 text-xs no-scrollbar">
          <button
            onClick={() => {
              setSelectedCategory(null);
              if (activeView !== 'store') setActiveView('store');
            }}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            All Electronics
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                if (activeView !== 'store') setActiveView('store');
              }}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <button
              onClick={() => {
                setActiveView('store');
                setSelectedCategory(null);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-900 rounded-lg hover:bg-slate-50"
            >
              Shop All Products
            </button>
            <button
              onClick={() => {
                setActiveView('tracking');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-900 rounded-lg hover:bg-slate-50"
            >
              Track Your Order
            </button>
            <button
              onClick={() => {
                setActiveView('orders');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-900 rounded-lg hover:bg-slate-50"
            >
              My Orders & Invoices
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  setActiveView('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-bold text-blue-600 rounded-lg hover:bg-blue-50"
              >
                Open Admin Dashboard
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Browse Categories
            </p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setActiveView('store');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700 truncate"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start pt-16 px-4">
          <div className="w-full max-w-md mx-auto bg-white rounded-2xl p-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search products in Pakistan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm text-slate-900 focus:outline-hidden"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => {
                setShowSearchModal(false);
                setActiveView('store');
              }}
              className="w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg text-center"
            >
              Show Results
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
