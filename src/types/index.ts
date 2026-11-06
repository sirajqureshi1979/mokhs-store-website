export type UserRole = 'super_admin' | 'store_manager' | 'order_manager' | 'customer';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  addresses: DeliveryAddress[];
  createdAt: string;
}

export interface DeliveryAddress {
  id: string;
  title: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  itemCount: number;
  displayOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  categoryId: string;
  categoryName: string;
  subcategory?: string;
  regularPrice: number; // In PKR
  discountedPrice?: number; // In PKR
  stockQuantity: number;
  description: string;
  specifications: Record<string, string>;
  warranty: string;
  sku: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'coming_soon';
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  images: string[];
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'cod' | 'jazzcash' | 'easypaisa' | 'card';

export type PaymentStatus = 'pending' | 'payment_pending' | 'paid' | 'failed' | 'refunded';

export type OrderStatus =
  | 'pending'
  | 'payment_pending'
  | 'paid'
  | 'processing'
  | 'confirmed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
  brand: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentTransactionRef?: string;
  courier?: 'TCS' | 'Leopards' | 'Call Courier' | 'Trax' | 'M&P';
  trackingNumber?: string;
  customerNotes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number; // percentage (e.g. 10 for 10%) or fixed PKR
  minOrderAmount: number;
  maxDiscount?: number;
  isActive: boolean;
  expiresAt: string;
  usageCount: number;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  city: string;
  verifiedPurchase: boolean;
  date: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  ctaText: string;
  link: string;
  imageUrl: string;
  active: boolean;
}

export interface PaymentGatewaysConfig {
  cod: {
    enabled: boolean;
    title: string;
    description: string;
    maxOrderLimit: number;
  };
  jazzcash: {
    enabled: boolean;
    merchantId: string;
    password: string;
    hashKey: string;
    returnUrl: string;
    sandbox: boolean;
    status: 'awaiting_credentials' | 'active' | 'disabled';
  };
  easypaisa: {
    enabled: boolean;
    storeId: string;
    hashKey: string;
    returnUrl: string;
    sandbox: boolean;
    status: 'awaiting_credentials' | 'active' | 'disabled';
  };
  cardPayment: {
    enabled: boolean;
    merchantId: string;
    apiKey: string;
    secretKey: string;
    provider: 'payfast' | 'hbl' | 'stripe';
    sandbox: boolean;
    status: 'awaiting_credentials' | 'active' | 'disabled';
  };
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  domain: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  country: string;
  currency: string;
  currencySymbol: string;
  freeDeliveryThreshold: number;
  standardDeliveryCharge: number;
  taxRatePercent: number;
  supabaseUrl: string;
  supabaseAnonKey: string;
}
