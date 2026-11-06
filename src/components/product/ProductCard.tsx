import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, ShieldCheck, Check, Clock, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatPKR } from '../../utils/formatters';
import { MokhsLogo } from '../common/MokhsLogo';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist, setSelectedProduct } = useStore();
  const [imageError, setImageError] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const price = product.discountedPrice ?? product.regularPrice;
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.regularPrice;
  const savings = hasDiscount ? product.regularPrice - product.discountedPrice! : 0;
  const discountPercent = hasDiscount
    ? Math.round(((product.regularPrice - product.discountedPrice!) / product.regularPrice) * 100)
    : 0;

  const isComingSoon = product.status === 'coming_soon';
  const isOutOfStock = (product.status === 'out_of_stock' || product.stockQuantity <= 0) && !isComingSoon;
  const isLaunchFlagship = product.id === 'prod-vintage-t9-dragon-trimmer';

  return (
    <div
      className={`group bg-white rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
        isLaunchFlagship
          ? 'border-2 border-blue-600 shadow-lg ring-4 ring-blue-600/10'
          : 'border border-slate-200/80 hover:border-slate-300'
      }`}
    >
      {/* Product Image Slot (65-75% emphasis) */}
      <div
        className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer"
        onClick={() => setSelectedProduct(product)}
      >
        {!imageError && product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${
              isComingSoon ? 'grayscale-30 opacity-90' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-300 p-4 text-center">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              {product.brand}
            </span>
            <span className="text-sm font-bold text-white mt-1">{product.name}</span>
          </div>
        )}

        {/* MOKHS Official Brand Seal on Product */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/85 backdrop-blur-md rounded-lg border border-slate-700/60 shadow-md">
          <MokhsLogo variant="icon" size="sm" />
          <span className="text-[10px] font-bold text-white tracking-wider">
            {isLaunchFlagship ? 'STARTUP LAUNCH' : 'MOKHS.STORE'}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
            inWishlist
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/80 hover:bg-white text-slate-700 hover:text-rose-500'
          }`}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label="Wishlist toggle"
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Status Badge */}
        {isComingSoon ? (
          <div className="absolute bottom-2 inset-x-2 py-1.5 px-2 bg-amber-950/95 backdrop-blur-md text-amber-200 border border-amber-500/60 text-[11px] font-bold rounded-lg text-center flex items-center justify-center gap-1.5 shadow-md">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Coming Soon · We Will Buy Later</span>
          </div>
        ) : isLaunchFlagship ? (
          <div className="absolute bottom-2 inset-x-2 py-1 px-2 bg-blue-600/95 backdrop-blur-md text-white text-[11px] font-bold rounded-lg text-center flex items-center justify-center gap-1 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Active Startup Launch · Ready for Dispatch</span>
          </div>
        ) : isOutOfStock ? (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-medium rounded">
            Out of Stock
          </div>
        ) : hasDiscount ? (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-blue-600/90 backdrop-blur-xs text-white text-[11px] font-medium rounded">
            Save {discountPercent}%
          </div>
        ) : null}
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category Quiet Metadata */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              {product.brand}
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{product.categoryName}</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => setSelectedProduct(product)}
            className="text-sm sm:text-base font-semibold text-slate-900 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer leading-snug"
          >
            {product.name}
          </h3>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="ml-1 font-semibold text-slate-700 tabular-nums">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">({product.reviewCount} verified reviews)</span>
          </div>

          {/* Key Warranty note */}
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{product.warranty}</span>
          </div>
        </div>

        {/* Pricing and Action Strip */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-base sm:text-lg font-bold text-slate-950 font-mono tabular-nums leading-none">
              {formatPKR(price)}
            </div>
            {hasDiscount && (
              <div className="text-xs text-slate-400 line-through font-mono tabular-nums mt-0.5">
                {formatPKR(product.regularPrice)}
              </div>
            )}
          </div>

          {isComingSoon ? (
            <button
              onClick={() => setSelectedProduct(product)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold rounded-xl transition-colors cursor-pointer text-center"
              title="Coming Soon - We will buy later"
            >
              Coming Soon
            </button>
          ) : (
            <button
              onClick={() => addToCart(product, 1)}
              disabled={isOutOfStock}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
              }`}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Order Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
