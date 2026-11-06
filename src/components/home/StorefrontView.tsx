import React, { useMemo } from 'react';
import {
  SlidersHorizontal,
  Flame,
  Sparkles,
  TrendingUp,
  Tag,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  Filter,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { HeroBanner } from './HeroBanner';
import { CategoryGrid } from './CategoryGrid';
import { ProductCard } from '../product/ProductCard';
import { TestimonialsSection } from './TestimonialsSection';
import { FAQSection } from './FAQSection';
import { formatPKR } from '../../utils/formatters';

export const StorefrontView: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedBrand,
    setSelectedBrand,
    inStockOnly,
    setInStockOnly,
  } = useStore();

  // Distinct Brands
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands);
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory && p.categoryId !== selectedCategory) {
          return false;
        }
        // Brand filter
        if (selectedBrand && p.brand !== selectedBrand) {
          return false;
        }
        // Stock filter
        if (inStockOnly && (p.status === 'out_of_stock' || p.stockQuantity <= 0)) {
          return false;
        }
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesBrand = p.brand.toLowerCase().includes(q);
          const matchesModel = p.model.toLowerCase().includes(q);
          const matchesCat = p.categoryName.toLowerCase().includes(q);
          const matchesSku = p.sku.toLowerCase().includes(q);
          if (!matchesName && !matchesBrand && !matchesModel && !matchesCat && !matchesSku) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const priceA = a.discountedPrice ?? a.regularPrice;
        const priceB = b.discountedPrice ?? b.regularPrice;
        if (sortBy === 'price_low') return priceA - priceB;
        if (sortBy === 'price_high') return priceB - priceA;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategory, selectedBrand, inStockOnly, searchQuery, sortBy]);

  // Featured Collection: Active launch flagship first, followed by upcoming roadmap products
  const featuredDisplayProducts = useMemo(() => {
    const launch = products.find((p) => p.id === 'prod-vintage-t9-dragon-trimmer');
    const other = products.filter((p) => p.id !== 'prod-vintage-t9-dragon-trimmer');
    return launch ? [launch, ...other.slice(0, 3)] : products.slice(0, 4);
  }, [products]);

  // Best Sellers
  const bestSellers = products.filter((p) => p.isBestSeller);
  // New Arrivals
  const newArrivals = products.filter((p) => p.isNewArrival);
  // Special Offers (Items with discounts)
  const discountDeals = products.filter((p) => p.discountedPrice && p.discountedPrice < p.regularPrice);

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Promotional Hero Banner */}
      <HeroBanner />

      {/* 2. Shop by Category (All 15 initial categories) */}
      <CategoryGrid />

      {/* 3. Featured Flagship Tech Collection */}
      <section id="featured-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Startup Launch Spotlight & Roadmap</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Featured Electronics
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Vintage T9 Pro Trimmer is in stock & ready for immediate dispatch nationwide. Other models are previewed below (Coming soon · We will buy later).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDisplayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Special Offers & Discounts Strip */}
      <section id="deals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 rounded-3xl text-white border border-blue-800/60 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                <Tag className="w-4 h-4" />
                <span>Special Offers & Price Drops</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                Save up to Rs. 26,000 on Smart Devices
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300">
                Use code <strong className="font-mono text-cyan-300 bg-blue-950/80 px-2 py-1 rounded border border-blue-700">MOKHS10</strong> for extra 10% off
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {discountDeals.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Complete Catalog with Dynamic Filters */}
      <section id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {activeCategoryObj ? activeCategoryObj.name : 'All Electronic Products'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Showing {filteredProducts.length} items available for nationwide delivery across Pakistan
            </p>
          </div>

          {/* Filter Bar Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Brand Filter */}
            <select
              value={selectedBrand || ''}
              onChange={(e) => setSelectedBrand(e.target.value || null)}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 text-slate-700 font-medium cursor-pointer"
            >
              <option value="">All Brands</option>
              {availableBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* In Stock Only Toggle */}
            <label className="flex items-center gap-2 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl cursor-pointer text-slate-700 font-medium select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-blue-600 cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 text-slate-700 font-medium cursor-pointer"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="newest">Newest Arrivals</option>
            </select>

            {(selectedCategory || selectedBrand || inStockOnly || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedBrand(null);
                  setInStockOnly(false);
                  setSearchQuery('');
                }}
                className="px-3 py-2 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-8">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No matching electronics found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing your search query or selecting a different category from above.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedBrand(null);
                  setInStockOnly(false);
                  setSearchQuery('');
                }}
                className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. Why Shop With MOKHS.STORE? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              The MOKHS Distinction
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Why Customers Across Pakistan Trust MOKHS.STORE
            </h2>
            <p className="text-xs text-slate-300">
              We bridge the gap between world-class technology and reliable Pakistani nationwide doorstep service.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto sm:mx-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-white">100% PTA & Brand Sealed</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero refurbished or smuggled inventory. Every smartphone is officially registered with Pakistan Telecommunication Authority.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mx-auto sm:mx-0">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-white">Safe Cash on Delivery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Doorstep cash collection via TCS, Leopards & Trax. Pay only when your sealed parcel arrives in Lahore, Karachi, or Islamabad.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto sm:mx-0">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-white">1-Year Official Warranty</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Backed by local authorized service centers and our Lahore headquarters with stamped warranty cards.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center mx-auto sm:mx-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-white">7-Day Free Replacement</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hassle-free replacement for any out-of-the-box faults. We arrange free reverse courier pickup from your home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Customer Reviews & Testimonials */}
      <TestimonialsSection />

      {/* 8. Frequently Asked Questions */}
      <FAQSection />
    </div>
  );
};
