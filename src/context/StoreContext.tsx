import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  Order,
  Customer,
  CartItem,
  UserRole,
} from '../types';
import { StoreDatabase } from '../services/db';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface StoreContextType {
  // Catalog Data
  products: Product[];
  categories: Category[];
  orders: Order[];
  currentUser: Customer | null;
  
  // Cart & Wishlist
  cart: CartItem[];
  wishlist: string[];
  cartCount: number;
  cartSubtotal: number;
  
  // Navigation & Filtering
  selectedCategory: string | null;
  searchQuery: string;
  sortBy: 'featured' | 'price_low' | 'price_high' | 'rating' | 'newest';
  selectedBrand: string | null;
  inStockOnly: boolean;
  activeView: 'store' | 'admin' | 'tracking' | 'wishlist' | 'orders';
  
  // Modals & Panels
  selectedProduct: Product | null;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isAuthModalOpen: boolean;
  isContactModalOpen: boolean;
  activePolicyModal: 'shipping' | 'returns' | 'warranty' | 'privacy' | 'terms' | null;
  lastOrder: Order | null;
  
  // Setters & Actions
  setSelectedCategory: (catId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'featured' | 'price_low' | 'price_high' | 'rating' | 'newest') => void;
  setSelectedBrand: (brand: string | null) => void;
  setInStockOnly: (val: boolean) => void;
  setActiveView: (view: 'store' | 'admin' | 'tracking' | 'wishlist' | 'orders') => void;
  
  setSelectedProduct: (prod: Product | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsContactModalOpen: (open: boolean) => void;
  setActivePolicyModal: (policy: 'shipping' | 'returns' | 'warranty' | 'privacy' | 'terms' | null) => void;
  setLastOrder: (order: Order | null) => void;
  
  // Cart Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Wishlist Actions
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  
  // Auth & Roles
  switchUserRole: (role: UserRole) => void;
  loginUser: (email: string) => boolean;
  logoutUser: () => void;
  registerUser: (name: string, email: string, phone: string) => void;
  
  // DB Sync
  refreshData: () => void;
  resetAllData: () => void;
  
  // Toasts
  toasts: Toast[];
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'mokhs_active_cart_v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating' | 'newest'>('featured');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [activeView, setActiveView] = useState<'store' | 'admin' | 'tracking' | 'wishlist' | 'orders'>('store');
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [activePolicyModal, setActivePolicyModal] = useState<'shipping' | 'returns' | 'warranty' | 'privacy' | 'terms' | null>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load initial data
  const refreshData = () => {
    setProducts(StoreDatabase.getProducts());
    setCategories(StoreDatabase.getCategories());
    setOrders(StoreDatabase.getOrders());
    setCurrentUser(StoreDatabase.getCurrentUser());
    setWishlist(StoreDatabase.getWishlist());
  };

  useEffect(() => {
    refreshData();
    // Load stored cart
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.warn('Failed to load cart from storage', e);
    }
  }, []);

  // Save cart to storage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  }, [cart]);

  // Toast Helper
  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart Management
  const addToCart = (product: Product, quantity = 1) => {
    if (product.status === 'out_of_stock' || product.stockQuantity <= 0) {
      showToast('Out of Stock', `${product.name} is currently out of stock.`, 'error');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stockQuantity) {
          showToast('Stock Limit Reached', `Only ${product.stockQuantity} units available in stock.`, 'error');
          return prev.map((item) =>
            item.product.id === product.id ? { ...item, quantity: product.stockQuantity } : item
          );
        }
        showToast('Cart Updated', `Increased quantity of ${product.name} to ${newQty}.`, 'success');
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        const initialQty = Math.min(quantity, product.stockQuantity);
        showToast('Added to Cart', `${product.name} added to your shopping cart.`, 'success');
        return [...prev, { product, quantity: initialQty }];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item Removed', 'Product removed from your cart.', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          if (quantity > item.product.stockQuantity) {
            showToast('Stock Limit', `Maximum available stock is ${item.product.stockQuantity}.`, 'error');
            return { ...item, quantity: item.product.stockQuantity };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist Management
  const toggleWishlist = (productId: string) => {
    const isAdded = StoreDatabase.toggleWishlist(productId);
    setWishlist(StoreDatabase.getWishlist());
    const prod = products.find((p) => p.id === productId);
    if (isAdded) {
      showToast('Wishlist', `${prod ? prod.name : 'Item'} added to your wishlist.`, 'success');
    } else {
      showToast('Wishlist', 'Item removed from wishlist.', 'info');
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  // Auth & Roles
  const switchUserRole = (role: UserRole) => {
    const customers = StoreDatabase.getCustomers();
    const userWithRole = customers.find((c) => c.role === role);
    if (userWithRole) {
      StoreDatabase.setCurrentUser(userWithRole);
      setCurrentUser(userWithRole);
      showToast('Profile Switched', `Logged in as ${userWithRole.name} (${userWithRole.role})`, 'info');
    }
  };

  const loginUser = (email: string): boolean => {
    const customers = StoreDatabase.getCustomers();
    const found = customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
    if (found) {
      StoreDatabase.setCurrentUser(found);
      setCurrentUser(found);
      showToast('Welcome back', `Logged in as ${found.name}`, 'success');
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    StoreDatabase.setCurrentUser(null);
    setCurrentUser(null);
    showToast('Logged Out', 'You have been logged out.', 'info');
  };

  const registerUser = (name: string, email: string, phone: string) => {
    const newCustomer = StoreDatabase.registerCustomer(name, email, phone);
    setCurrentUser(newCustomer);
    showToast('Registration Complete', `Welcome to MOKHS.STORE, ${name}!`, 'success');
  };

  const resetAllData = () => {
    StoreDatabase.resetToDefaults();
    refreshData();
    setCart([]);
    showToast('Data Reset', 'Store data reset to official factory defaults.', 'info');
  };

  // Computed Cart metrics
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => {
    const price = item.product.discountedPrice ?? item.product.regularPrice;
    return total + price * item.quantity;
  }, 0);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        orders,
        currentUser,
        cart,
        wishlist,
        cartCount,
        cartSubtotal,
        selectedCategory,
        searchQuery,
        sortBy,
        selectedBrand,
        inStockOnly,
        activeView,
        selectedProduct,
        isCartOpen,
        isCheckoutOpen,
        isAuthModalOpen,
        isContactModalOpen,
        activePolicyModal,
        lastOrder,
        setSelectedCategory,
        setSearchQuery,
        setSortBy,
        setSelectedBrand,
        setInStockOnly,
        setActiveView,
        setSelectedProduct,
        setIsCartOpen,
        setIsCheckoutOpen,
        setIsAuthModalOpen,
        setIsContactModalOpen,
        setActivePolicyModal,
        setLastOrder,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        switchUserRole,
        loginUser,
        logoutUser,
        registerUser,
        refreshData,
        resetAllData,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
