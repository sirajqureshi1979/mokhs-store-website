import React, { useState } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingBag,
  Heart,
  Check,
  Share2,
  Plus,
  Minus,
  MessageSquare,
  Building,
  Clock,
} from 'lucide-react';
import { Product, Review } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatPKR, formatDate } from '../../utils/formatters';
import { StoreDatabase } from '../../services/db';
import { MokhsLogo } from '../common/MokhsLogo';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart, toggleWishlist, isInWishlist, setIsCheckoutOpen, showToast } = useStore();
  const [selectedImage, setSelectedImage] = useState<string>(
    product.images && product.images.length > 0 ? product.images[0] : ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'desc' | 'reviews' | 'warranty'>('specs');
  
  // Review form state
  const [reviewName, setReviewName] = useState('');
  const [reviewCity, setReviewCity] = useState('Lahore');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [localReviews, setLocalReviews] = useState<Review[]>(() =>
    StoreDatabase.getReviews().filter((r) => r.productId === product.id)
  );

  const inWishlist = isInWishlist(product.id);
  const price = product.discountedPrice ?? product.regularPrice;
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.regularPrice;
  const savings = hasDiscount ? product.regularPrice - product.discountedPrice! : 0;
  const isComingSoon = product.status === 'coming_soon';
  const isOutOfStock = (product.status === 'out_of_stock' || product.stockQuantity <= 0) && !isComingSoon;

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onClose();
    setIsCheckoutOpen(true);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment || !reviewTitle) {
      showToast('Missing Fields', 'Please complete all review fields.', 'error');
      return;
    }
    setSubmittingReview(true);
    const newRev = StoreDatabase.addReview({
      productId: product.id,
      customerName: reviewName,
      city: reviewCity,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
      verifiedPurchase: true,
    });
    setLocalReviews([newRev, ...localReviews]);
    setReviewTitle('');
    setReviewComment('');
    setSubmittingReview(false);
    showToast('Review Submitted', 'Thank you for sharing your experience with MOKHS.STORE!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 uppercase tracking-wider">{product.brand}</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-600">{product.categoryName}</span>
            <span aria-hidden="true">/</span>
            <span className="font-mono text-slate-400">{product.sku}</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-8 flex-1">
          {/* Main 2-Column Product Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Gallery Left */}
            <div className="space-y-4">
              <div className="aspect-4/3 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    Image Preview
                  </div>
                )}
                {hasDiscount && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm">
                    Save {formatPKR(savings)}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        selectedImage === img
                          ? 'border-blue-600 ring-2 ring-blue-600/20'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumb ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Courier Delivery Notes */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Nationwide Express Courier Dispatch</span>
                </div>
                <p>
                  Dispatched from Lahore Hub via TCS / Leopards Courier with tracking number provided via SMS and Email. Typical delivery time: 24-48 hours.
                </p>
              </div>
            </div>

            {/* Contiguous Purchase Module Right */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
                    Model: {product.model}
                  </span>
                  <div className="flex items-center text-amber-500 text-xs">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1 font-bold text-slate-800 tabular-nums">
                      {product.rating.toFixed(1)}
                    </span>
                    <span className="text-slate-400 ml-1">({product.reviewCount} verified reviews)</span>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-950 mt-1.5 leading-snug">
                  {product.name}
                </h1>
              </div>

              {/* Price Block */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-baseline justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono tabular-nums">
                    {formatPKR(price)}
                  </div>
                  {hasDiscount && (
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="text-slate-400 line-through font-mono">
                        {formatPKR(product.regularPrice)}
                      </span>
                      <span className="text-emerald-600 font-semibold">
                        You Save {formatPKR(savings)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  {isComingSoon ? (
                    <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-lg border border-amber-300">
                      Coming Soon · We Will Buy Later
                    </span>
                  ) : isOutOfStock ? (
                    <span className="inline-block px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200">
                      In Stock ({product.stockQuantity} available)
                    </span>
                  )}
                </div>
              </div>

              {/* Official Warranty & Startup Badge */}
              {product.id === 'prod-vintage-t9-dragon-trimmer' ? (
                <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 flex items-start gap-3">
                  <MokhsLogo variant="icon" size="sm" />
                  <div>
                    <span className="font-extrabold text-slate-900 text-xs block">
                      ⚡ MOKHS.STORE Official Startup Launch Product
                    </span>
                    <span className="text-blue-800 text-[11px] leading-tight block mt-0.5">
                      Secured first launch batch. 100% Genuine factory-sealed with 6 Months MOKHS Replacement Guarantee and Cash on Delivery nationwide.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-semibold block">{product.warranty}</span>
                    <span className="text-blue-700 text-[11px]">
                      Includes official stamped warranty card and brand service center support in Pakistan.
                    </span>
                  </div>
                </div>
              )}

              {/* Purchase Actions or Coming Soon Notice */}
              {isComingSoon ? (
                <div className="space-y-3">
                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-amber-900 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-xs text-amber-950">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Coming Soon · We Will Buy Later</span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      We have secured our flagship <strong>Vintage T9 Professional Trimmer</strong> as our initial startup launch product. This item is scheduled for our Phase 2 inventory acquisition.
                    </p>
                  </div>

                  <button
                    disabled
                    className="w-full py-3.5 px-5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed border border-slate-200"
                  >
                    Coming Soon (We Will Buy Later)
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1 || isOutOfStock}
                        className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold text-sm tabular-nums">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                        disabled={quantity >= product.stockQuantity || isOutOfStock}
                        className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                        inWishlist
                          ? 'bg-rose-50 border-rose-200 text-rose-600'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                      title="Save to Wishlist"
                    >
                      <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => addToCart(product, quantity)}
                      disabled={isOutOfStock}
                      className="flex-1 py-3 px-5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Shopping Cart</span>
                    </button>
                  </div>

                  {/* Direct Buy Now with Cash on Delivery */}
                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Order Now with Cash on Delivery ({formatPKR(price * quantity)})</span>
                  </button>
                </div>
              )}

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PTA Approved & Tax Paid</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Doorstep Cash on Delivery</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>7-Day Replacement Guarantee</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Free Shipping on Orders &gt; Rs. 3,000</span>
                </span>
              </div>
            </div>
          </div>

          {/* Deep Dive Tabs: Specs, Description, Reviews, Warranty */}
          <div className="pt-8 border-t border-slate-200">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveTab('specs')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'specs'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Technical Specifications
              </button>
              <button
                onClick={() => setActiveTab('desc')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'desc'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Product Overview
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Customer Reviews ({localReviews.length})
              </button>
              <button
                onClick={() => setActiveTab('warranty')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'warranty'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Warranty & Returns
              </button>
            </div>

            <div className="pt-6">
              {activeTab === 'specs' && (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <tbody className="divide-y divide-slate-100">
                      {Object.entries(product.specifications || {}).map(([key, value], idx) => (
                        <tr key={key} className={idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}>
                          <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">
                            {key}
                          </td>
                          <td className="py-3 px-4 text-slate-900 font-medium">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'desc' && (
                <div className="prose prose-sm max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed space-y-4">
                  <p>{product.description}</p>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 text-xs mb-1">What is in the Box:</h4>
                    <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                      <li>1x {product.name} (Factory Sealed)</li>
                      <li>Official Manufacturer Warranty Card</li>
                      <li>High-Speed Charging Cable & User Manual</li>
                      <li>MOKHS.STORE Genuine Certificate of Authenticity</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Reviews List */}
                  <div className="space-y-4">
                    {localReviews.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4">
                        No reviews yet for this product. Be the first customer in Pakistan to review!
                      </p>
                    ) : (
                      localReviews.map((rev) => (
                        <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-slate-900">{rev.customerName}</span>
                              <span className="text-[11px] text-slate-400">({rev.city}, Pakistan)</span>
                              {rev.verifiedPurchase && (
                                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                                  Verified Buyer
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">{formatDate(rev.date)}</span>
                          </div>

                          <div className="flex items-center text-amber-500 text-xs">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating ? 'fill-current' : 'text-slate-300'
                                }`}
                              />
                            ))}
                            <span className="ml-2 font-bold text-slate-800 text-xs">{rev.title}</span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Review Form */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Write a Customer Review
                    </h4>
                    <form onSubmit={handleReviewSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">
                            Your Full Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Asad Ali"
                            value={reviewName}
                            onChange={(e) => setReviewName(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">
                            City (Pakistan)
                          </label>
                          <select
                            value={reviewCity}
                            onChange={(e) => setReviewCity(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600 bg-white"
                          >
                            <option value="Lahore">Lahore</option>
                            <option value="Karachi">Karachi</option>
                            <option value="Islamabad">Islamabad</option>
                            <option value="Rawalpindi">Rawalpindi</option>
                            <option value="Faisalabad">Faisalabad</option>
                            <option value="Multan">Multan</option>
                            <option value="Peshawar">Peshawar</option>
                            <option value="Quetta">Quetta</option>
                            <option value="Sialkot">Sialkot</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">
                            Star Rating
                          </label>
                          <select
                            value={reviewRating}
                            onChange={(e) => setReviewRating(Number(e.target.value))}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600 bg-white"
                          >
                            <option value={5}>⭐⭐⭐⭐⭐ (5/5 Excellent)</option>
                            <option value={4}>⭐⭐⭐⭐ (4/5 Very Good)</option>
                            <option value={3}>⭐⭐⭐ (3/5 Average)</option>
                            <option value={2}>⭐⭐ (2/5 Below Average)</option>
                            <option value={1}>⭐ (1/5 Poor)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Review Headline
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Genuine sealed phone with fast delivery"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Your Honest Review
                        </label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Share details on device quality, performance, PTA status, and courier packaging..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Submit Verified Review
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'warranty' && (
                <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-emerald-950 text-sm">
                        MOKHS.STORE 100% Authenticity & Official Warranty Pledge
                      </h4>
                      <p className="mt-1 text-emerald-800 text-xs">
                        All products sold on MOKHS.STORE are sourced directly from authorized brand importers in Pakistan. We strictly prohibit refurbished or non-PTA devices.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-200 rounded-xl space-y-1.5">
                      <h5 className="font-bold text-slate-900 text-xs">Claiming Warranty</h5>
                      <p className="text-slate-600">
                        Present the included warranty card and digital tax invoice at any authorized brand service center in Karachi, Lahore, Islamabad, or Rawalpindi.
                      </p>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-xl space-y-1.5">
                      <h5 className="font-bold text-slate-900 text-xs">7-Day Replacement Policy</h5>
                      <p className="text-slate-600">
                        If an item arrives with transit damage or factory malfunction, contact our WhatsApp helpline at +92 300 1234567 for free pickup and instant replacement.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
