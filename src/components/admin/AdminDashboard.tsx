import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  CreditCard,
  Tag,
  AlertTriangle,
  Settings,
  Mail,
  Star,
  Database,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle,
  Truck,
  Eye,
  LogOut,
  RefreshCw,
  Copy,
  Check,
  Shield,
  ArrowLeft,
  GitBranch,
  Globe,
  ExternalLink,
  Terminal,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import {
  Product,
  Category,
  Order,
  OrderStatus,
  PaymentStatus,
  Coupon,
  PaymentGatewaysConfig,
  StoreSettings,
} from '../../types';
import { formatPKR, formatDate, formatDateTime } from '../../utils/formatters';
import { StoreDatabase } from '../../services/db';
import { MokhsLogo } from '../common/MokhsLogo';

type AdminTab =
  | 'overview'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'gateways'
  | 'coupons'
  | 'inventory'
  | 'enquiries'
  | 'reviews'
  | 'settings'
  | 'supabase'
  | 'github';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    categories,
    orders,
    currentUser,
    setActiveView,
    refreshData,
    resetAllData,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Product Editing / Creation State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [productSearch, setProductSearch] = useState('');

  // Category Editing / Creation State
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // New Coupon Form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState(3000);

  // Payment Gateways Settings State
  const [gateways, setGateways] = useState<PaymentGatewaysConfig>(() =>
    StoreDatabase.getPaymentGateways()
  );

  // Store Settings State
  const [settings, setSettings] = useState<StoreSettings>(() =>
    StoreDatabase.getStoreSettings()
  );

  // Enquiries State
  const [enquiries, setEnquiries] = useState(() => StoreDatabase.getEnquiries());
  const [reviews, setReviews] = useState(() => StoreDatabase.getReviews());

  // Copy Schema status
  const [copiedSQL, setCopiedSQL] = useState(false);

  // GitHub & Custom Domain State
  const [githubUser, setGithubUser] = useState('sirajwuhan-bot');
  const [githubRepo, setGithubRepo] = useState('MOKHS');
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(label);
    setTimeout(() => setCopiedCommand(null), 2000);
    showToast('Copied to Clipboard', label, 'info');
  };

  // Role Security Check
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isStoreManager = currentUser?.role === 'store_manager' || isSuperAdmin;
  const isOrderManager = currentUser?.role === 'order_manager' || isStoreManager;

  // Overview metrics calculation
  const totalSales = orders.reduce((sum, o) => (o.paymentStatus === 'paid' ? sum + o.totalAmount : sum), 0);
  const totalOrdersCount = orders.length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'payment_pending');
  const completedOrders = orders.filter((o) => o.orderStatus === 'delivered');
  const lowStockProducts = products.filter((p) => p.stockQuantity <= 5);
  const totalCustomers = StoreDatabase.getCustomers().length;

  // Save Product Handler
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.brand || !editingProduct?.regularPrice) {
      showToast('Validation Error', 'Name, brand, and regular price are required.', 'error');
      return;
    }

    const prodId = editingProduct.id || `prod-${Date.now()}`;
    const slug =
      editingProduct.slug ||
      editingProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const cat = categories.find((c) => c.id === editingProduct.categoryId) || categories[0];

    const updated: Product = {
      id: prodId,
      name: editingProduct.name,
      slug,
      brand: editingProduct.brand,
      model: editingProduct.model || 'Model 2026',
      categoryId: cat.id,
      categoryName: cat.name,
      subcategory: editingProduct.subcategory || 'General',
      regularPrice: Number(editingProduct.regularPrice),
      discountedPrice: editingProduct.discountedPrice ? Number(editingProduct.discountedPrice) : undefined,
      stockQuantity: Number(editingProduct.stockQuantity ?? 10),
      description: editingProduct.description || 'Premium smart electronics with official warranty.',
      specifications: editingProduct.specifications || { Warranty: '1 Year Brand Warranty' },
      warranty: editingProduct.warranty || '1 Year Official Warranty',
      sku: editingProduct.sku || `MOKHS-${Math.floor(1000 + Math.random() * 9000)}`,
      status: (editingProduct.status === 'coming_soon'
        ? 'coming_soon'
        : Number(editingProduct.stockQuantity) <= 0
        ? 'out_of_stock'
        : Number(editingProduct.stockQuantity) <= 5
        ? 'low_stock'
        : 'in_stock') as any,
      rating: editingProduct.rating ?? 5.0,
      reviewCount: editingProduct.reviewCount ?? 1,
      isFeatured: Boolean(editingProduct.isFeatured),
      isBestSeller: Boolean(editingProduct.isBestSeller),
      isNewArrival: Boolean(editingProduct.isNewArrival),
      images: editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images : ['/src/assets/images/hero_smart_electronics_1793943578482.jpg'],
      createdAt: editingProduct.createdAt || new Date().toISOString(),
    };

    StoreDatabase.saveProduct(updated);
    refreshData();
    setEditingProduct(null);
    showToast('Product Saved', `${updated.name} has been updated in database.`, 'success');
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this product?')) {
      StoreDatabase.deleteProduct(id);
      refreshData();
      showToast('Product Deleted', 'Item removed from store catalog.', 'info');
    }
  };

  // Category Handlers
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;
    const catId = editingCategory.id || `cat-${Date.now()}`;
    const slug =
      editingCategory.slug ||
      editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const updatedCat: Category = {
      id: catId,
      name: editingCategory.name,
      slug,
      iconName: editingCategory.iconName || 'Layers',
      description: editingCategory.description || 'Electronic category',
      itemCount: products.filter((p) => p.categoryId === catId).length,
      displayOrder: editingCategory.displayOrder || categories.length + 1,
    };

    StoreDatabase.saveCategory(updatedCat);
    refreshData();
    setEditingCategory(null);
    showToast('Category Saved', `Category ${updatedCat.name} updated.`, 'success');
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      StoreDatabase.deleteCategory(id);
      refreshData();
      showToast('Category Deleted', 'Category removed.', 'info');
    }
  };

  // Order Update Handlers
  const handleUpdateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    paymentStatus?: PaymentStatus,
    courier?: 'TCS' | 'Leopards' | 'Call Courier' | 'Trax' | 'M&P',
    trackingNum?: string
  ) => {
    StoreDatabase.updateOrderStatus(orderId, status, paymentStatus, courier, trackingNum);
    refreshData();
    if (selectedOrder && selectedOrder.id === orderId) {
      const updated = StoreDatabase.getOrderById(orderId);
      if (updated) setSelectedOrder(updated);
    }
    showToast('Order Updated', `Order status updated to ${status}.`, 'success');
  };

  // Coupon Handlers
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const newCoupon: Coupon = {
      code: newCouponCode.trim().toUpperCase(),
      discountType: newCouponType,
      value: Number(newCouponValue),
      minOrderAmount: Number(newCouponMin),
      isActive: true,
      expiresAt: '2027-12-31',
      usageCount: 0,
    };
    StoreDatabase.saveCoupon(newCoupon);
    setNewCouponCode('');
    refreshData();
    showToast('Coupon Created', `Promo code ${newCoupon.code} created.`, 'success');
  };

  const handleDeleteCoupon = (code: string) => {
    StoreDatabase.deleteCoupon(code);
    refreshData();
    showToast('Coupon Deleted', `Code ${code} removed.`, 'info');
  };

  // Save Gateways
  const handleSaveGateways = (e: React.FormEvent) => {
    e.preventDefault();
    StoreDatabase.savePaymentGateways(gateways);
    showToast('Gateways Updated', 'Payment gateway settings saved successfully.', 'success');
  };

  // Save Store Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StoreDatabase.saveStoreSettings(settings);
    showToast('Store Settings Saved', 'Business contact, address and shipping threshold updated.', 'success');
  };

  const handleCopySQL = () => {
    const sql = StoreDatabase.generateSupabaseSQLSchema();
    navigator.clipboard.writeText(sql);
    setCopiedSQL(true);
    showToast('SQL Copied', 'Supabase PostgreSQL schema copied to clipboard!', 'success');
    setTimeout(() => setCopiedSQL(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveView('store')}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2.5">
            <MokhsLogo variant="icon" size="sm" />
            <span className="font-bold text-sm text-white font-sans">
              MOKHS.STORE Admin Control Center
            </span>
            <span className="text-[10px] bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded font-mono">
              {currentUser?.role.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetAllData}
            title="Reset store data to clean factory defaults"
            className="px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-950/40 rounded-lg border border-amber-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Seeds</span>
          </button>

          <button
            onClick={() => setActiveView('store')}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Exit to Store
          </button>
        </div>
      </header>

      {/* Main Admin Grid */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Admin Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800/80 p-3 space-y-1 shrink-0 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Management Modules
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Catalog ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories (15)</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4" />
              <span>Orders & Courier</span>
            </div>
            {pendingOrders.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 font-mono">
                {pendingOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Inventory & Alerts</span>
            </div>
            {lowStockProducts.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white font-mono">
                {lowStockProducts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customers ({totalCustomers})</span>
          </button>

          <button
            onClick={() => setActiveTab('gateways')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'gateways'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pakistani Gateways</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'coupons'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Discount Coupons</span>
          </button>

          <button
            onClick={() => setActiveTab('enquiries')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'enquiries'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Customer Messages ({enquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Product Reviews ({reviews.length})</span>
          </button>

          <div className="pt-3 border-t border-slate-800 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            System & Database
          </div>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'supabase'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Supabase SQL & RLS</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'github'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <span>GitHub & mokhs.store</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Store Configuration</span>
          </button>
        </aside>

        {/* Admin Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Store Analytics & Operational Overview</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time sales, order fulfillment, and Pakistani logistics metrics.
                </p>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400">Total Revenue (PKR)</span>
                  <div className="text-2xl font-extrabold text-white font-mono tabular-nums mt-1">
                    {formatPKR(totalSales)}
                  </div>
                  <span className="text-[11px] text-emerald-400 mt-1 block">
                    From confirmed & paid orders
                  </span>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400">Total Orders</span>
                  <div className="text-2xl font-extrabold text-white font-mono tabular-nums mt-1">
                    {totalOrdersCount}
                  </div>
                  <span className="text-[11px] text-blue-400 mt-1 block">
                    {pendingOrders.length} pending processing
                  </span>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400">Available Products</span>
                  <div className="text-2xl font-extrabold text-white font-mono tabular-nums mt-1">
                    {products.length}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Across 15 categories
                  </span>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400">Registered Customers</span>
                  <div className="text-2xl font-extrabold text-white font-mono tabular-nums mt-1">
                    {totalCustomers}
                  </div>
                  <span className="text-[11px] text-emerald-400 mt-1 block">
                    Karachi, Lahore, Islamabad
                  </span>
                </div>
              </div>

              {/* Recent Orders Quick Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Recent Customer Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    View All Orders
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="py-2.5 px-4">Order #</th>
                        <th className="py-2.5 px-4">Customer</th>
                        <th className="py-2.5 px-4">City</th>
                        <th className="py-2.5 px-4">Amount</th>
                        <th className="py-2.5 px-4">Payment</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-900/40">
                          <td className="py-3 px-4 font-mono font-bold text-blue-400">
                            {ord.orderNumber}
                          </td>
                          <td className="py-3 px-4 text-white font-medium">{ord.customerName}</td>
                          <td className="py-3 px-4 text-slate-400">{ord.deliveryAddress.city}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-white tabular-nums">
                            {formatPKR(ord.totalAmount)}
                          </td>
                          <td className="py-3 px-4 uppercase text-slate-300">
                            {ord.paymentMethod} ({ord.paymentStatus})
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold capitalize bg-blue-950 text-blue-300 border border-blue-800">
                              {ord.orderStatus.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrder(ord);
                                setActiveTab('orders');
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Product Catalog Management</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Add, edit, change prices, update stock, and assign categories dynamically.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setEditingProduct({
                      name: '',
                      brand: '',
                      model: '',
                      regularPrice: 0,
                      stockQuantity: 10,
                      categoryId: categories[0]?.id || '',
                      warranty: '1 Year Brand Warranty',
                      specifications: {},
                      images: ['/src/assets/images/hero_smart_electronics_1793943578482.jpg'],
                    })
                  }
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Product Edit / Create Modal */}
              {editingProduct && (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-white">
                      {editingProduct.id ? 'Edit Product Details' : 'Create New Electronics Product'}
                    </h3>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="sm:col-span-2">
                        <label className="block text-slate-300 font-medium mb-1">Product Name *</label>
                        <input
                          type="text"
                          required
                          value={editingProduct.name || ''}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, name: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          placeholder="e.g. Zenith 15 Pro Titanium 5G"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Brand Name *</label>
                        <input
                          type="text"
                          required
                          value={editingProduct.brand || ''}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, brand: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          placeholder="e.g. Zenith Mobile"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Category *</label>
                        <select
                          value={editingProduct.categoryId || categories[0]?.id}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, categoryId: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Regular Price (PKR) *</label>
                        <input
                          type="number"
                          required
                          value={editingProduct.regularPrice || ''}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, regularPrice: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Discounted Price (PKR)</label>
                        <input
                          type="number"
                          value={editingProduct.discountedPrice || ''}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              discountedPrice: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                          placeholder="Optional"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Available Stock Qty *</label>
                        <input
                          type="number"
                          required
                          value={editingProduct.stockQuantity ?? 10}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Model Number</label>
                        <input
                          type="text"
                          value={editingProduct.model || ''}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, model: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-medium mb-1">SKU</label>
                        <input
                          type="text"
                          value={editingProduct.sku || ''}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, sku: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Warranty Details</label>
                        <input
                          type="text"
                          value={editingProduct.warranty || ''}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, warranty: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          placeholder="e.g. 1 Year Official Brand Warranty"
                        />
                      </div>
                    </div>

                    <div className="text-xs">
                      <label className="block text-slate-300 font-medium mb-1">Product Description</label>
                      <textarea
                        rows={3}
                        value={editingProduct.description || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, description: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>

                    <div className="flex items-center gap-4 text-xs pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editingProduct.isFeatured)}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })
                          }
                          className="rounded text-blue-600"
                        />
                        <span>Featured on Homepage</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editingProduct.isBestSeller)}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })
                          }
                          className="rounded text-blue-600"
                        />
                        <span>Best Seller Badge</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editingProduct.isNewArrival)}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, isNewArrival: e.target.checked })
                          }
                          className="rounded text-blue-600"
                        />
                        <span>New Arrival</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer"
                      >
                        Save Product to Database
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Products Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="py-2.5 px-4">Product</th>
                        <th className="py-2.5 px-4">Brand</th>
                        <th className="py-2.5 px-4">Category</th>
                        <th className="py-2.5 px-4">Price (PKR)</th>
                        <th className="py-2.5 px-4">Stock</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-900/40">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 object-cover rounded-lg border border-slate-700 shrink-0"
                            />
                            <div>
                              <div className="font-semibold text-white line-clamp-1">{prod.name}</div>
                              <div className="font-mono text-[11px] text-slate-400">{prod.sku}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-300">{prod.brand}</td>
                          <td className="py-3 px-4 text-slate-400">{prod.categoryName}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-white tabular-nums">
                            {formatPKR(prod.discountedPrice ?? prod.regularPrice)}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-200">
                            {prod.stockQuantity}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold inline-flex items-center gap-1 ${
                                prod.status === 'coming_soon'
                                  ? 'bg-amber-950/80 text-amber-300 border border-amber-700/80'
                                  : prod.id === 'prod-vintage-t9-dragon-trimmer'
                                  ? 'bg-blue-950 text-cyan-300 border border-blue-500 font-bold'
                                  : prod.status === 'out_of_stock'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : prod.status === 'low_stock'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              }`}
                            >
                              {prod.status === 'coming_soon'
                                ? 'COMING SOON · BUY LATER'
                                : prod.id === 'prod-vintage-t9-dragon-trimmer'
                                ? 'ACTIVE LAUNCH (IN STOCK)'
                                : prod.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => setEditingProduct(prod)}
                              className="p-1.5 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-800"
                              title="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORY MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Category Management</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Organize, add, edit, or remove categories dynamically without changing code.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setEditingCategory({
                      name: '',
                      iconName: 'Layers',
                      description: '',
                      displayOrder: categories.length + 1,
                    })
                  }
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Category</span>
                </button>
              </div>

              {/* Editing Category Form */}
              {editingCategory && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white">
                    {editingCategory.id ? 'Edit Category' : 'Create Category'}
                  </h3>
                  <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-300 mb-1">Category Name *</label>
                        <input
                          type="text"
                          required
                          value={editingCategory.name || ''}
                          onChange={(e) =>
                            setEditingCategory({ ...editingCategory, name: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1">Icon Type</label>
                        <select
                          value={editingCategory.iconName || 'Layers'}
                          onChange={(e) =>
                            setEditingCategory({ ...editingCategory, iconName: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        >
                          <option value="Smartphone">Smartphone</option>
                          <option value="Laptop">Laptop</option>
                          <option value="Headphones">Headphones</option>
                          <option value="Volume2">Audio / Speaker</option>
                          <option value="Watch">Watch</option>
                          <option value="Gamepad2">Gaming</option>
                          <option value="Wifi">Wi-Fi Router</option>
                          <option value="ShieldAlert">Security CCTV</option>
                          <option value="Home">Smart Home</option>
                          <option value="BatteryCharging">Power Bank</option>
                          <option value="Cpu">Gadgets</option>
                          <option value="Layers">General</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1">Display Order</label>
                        <input
                          type="number"
                          value={editingCategory.displayOrder || 1}
                          onChange={(e) =>
                            setEditingCategory({
                              ...editingCategory,
                              displayOrder: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">Description</label>
                      <input
                        type="text"
                        value={editingCategory.description || ''}
                        onChange={(e) =>
                          setEditingCategory({ ...editingCategory, description: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="px-3 py-1.5 text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                      >
                        Save Category
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => {
                  const count = products.filter((p) => p.categoryId === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-start justify-between"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-blue-400 uppercase">
                          Order #{cat.displayOrder} · {cat.iconName}
                        </span>
                        <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1">{cat.description}</p>
                        <span className="text-xs text-slate-500 font-mono block pt-1">
                          {count} Products Linked
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingCategory(cat)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Order Management & Fulfillment</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update order status, change payment state, assign courier tracking numbers (TCS / Leopards).
                </p>
              </div>

              {/* Order Detail Modal / Editor */}
              {selectedOrder && (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-mono font-bold text-blue-400">
                        {selectedOrder.orderNumber}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">
                        Customer: {selectedOrder.customerName} ({selectedOrder.customerPhone})
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Close Details
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Order Status</label>
                      <select
                        value={selectedOrder.orderStatus}
                        onChange={(e) =>
                          handleUpdateOrderStatus(
                            selectedOrder.id,
                            e.target.value as OrderStatus,
                            selectedOrder.paymentStatus,
                            selectedOrder.courier,
                            selectedOrder.trackingNumber
                          )
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Payment Status</label>
                      <select
                        value={selectedOrder.paymentStatus}
                        onChange={(e) =>
                          handleUpdateOrderStatus(
                            selectedOrder.id,
                            selectedOrder.orderStatus,
                            e.target.value as PaymentStatus,
                            selectedOrder.courier,
                            selectedOrder.trackingNumber
                          )
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="pending">Pending (Cash on Delivery)</option>
                        <option value="paid">Paid & Verified</option>
                        <option value="payment_pending">Payment Pending (API Sandbox)</option>
                        <option value="failed">Failed / Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Assign Courier Partner</label>
                      <select
                        value={selectedOrder.courier || 'TCS'}
                        onChange={(e) =>
                          handleUpdateOrderStatus(
                            selectedOrder.id,
                            selectedOrder.orderStatus,
                            selectedOrder.paymentStatus,
                            e.target.value as any,
                            selectedOrder.trackingNumber
                          )
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="TCS">TCS Express Pakistan</option>
                        <option value="Leopards">Leopards Courier</option>
                        <option value="Call Courier">Call Courier</option>
                        <option value="Trax">Trax Logistics</option>
                        <option value="M&P">M&P Express</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">
                        Consignment Tracking Number
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={selectedOrder.trackingNumber || ''}
                          onChange={(e) => {
                            selectedOrder.trackingNumber = e.target.value;
                            setSelectedOrder({ ...selectedOrder });
                          }}
                          placeholder="e.g. TCS-PK-9912384"
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateOrderStatus(
                              selectedOrder.id,
                              selectedOrder.orderStatus,
                              selectedOrder.paymentStatus,
                              selectedOrder.courier,
                              selectedOrder.trackingNumber
                            )
                          }
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                        >
                          Save Tracking #
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
                      <span className="font-semibold block text-white">Delivery Destination:</span>
                      <span>
                        {selectedOrder.deliveryAddress.addressLine}, {selectedOrder.deliveryAddress.city}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="py-2.5 px-4">Order #</th>
                        <th className="py-2.5 px-4">Customer</th>
                        <th className="py-2.5 px-4">City</th>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Amount</th>
                        <th className="py-2.5 px-4">Payment</th>
                        <th className="py-2.5 px-4">Order Status</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-900/40">
                          <td className="py-3 px-4 font-mono font-bold text-blue-400">
                            {ord.orderNumber}
                          </td>
                          <td className="py-3 px-4 text-white font-medium">{ord.customerName}</td>
                          <td className="py-3 px-4 text-slate-400">{ord.deliveryAddress.city}</td>
                          <td className="py-3 px-4 text-slate-400">{formatDate(ord.createdAt)}</td>
                          <td className="py-3 px-4 font-mono font-bold text-white tabular-nums">
                            {formatPKR(ord.totalAmount)}
                          </td>
                          <td className="py-3 px-4 uppercase text-slate-300">
                            {ord.paymentMethod} ({ord.paymentStatus})
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold capitalize bg-blue-950 text-blue-300 border border-blue-800">
                              {ord.orderStatus.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                            >
                              Manage Order
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PAKISTANI PAYMENT GATEWAYS */}
          {activeTab === 'gateways' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Pakistani Payment Gateway Integrations</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure Cash on Delivery, official JazzCash Merchant API, Easypaisa Store ID, and Credit Cards.
                </p>
              </div>

              <form onSubmit={handleSaveGateways} className="space-y-6">
                {/* 1. Cash on Delivery (COD) */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-lg">
                        💵
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Cash on Delivery (COD)</h3>
                        <p className="text-xs text-slate-400">
                          Primary payment method across Pakistan. TCS / Leopards delivery collection.
                        </p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gateways.cod.enabled}
                        onChange={(e) =>
                          setGateways({
                            ...gateways,
                            cod: { ...gateways.cod, enabled: e.target.checked },
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      <span className="text-xs font-semibold text-emerald-400">Active</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Gateway Display Title
                      </label>
                      <input
                        type="text"
                        value={gateways.cod.title}
                        onChange={(e) =>
                          setGateways({
                            ...gateways,
                            cod: { ...gateways.cod, title: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Maximum COD Order Limit (PKR)
                      </label>
                      <input
                        type="number"
                        value={gateways.cod.maxOrderLimit}
                        onChange={(e) =>
                          setGateways({
                            ...gateways,
                            cod: { ...gateways.cod, maxOrderLimit: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. JazzCash Official Merchant API */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-950 text-red-400 flex items-center justify-center font-bold text-xs">
                        JC
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">JazzCash Online Gateway</h3>
                        <p className="text-xs text-slate-400">
                          Official HTTP POST / REST API for JazzCash Mobile Account & Card Checkout.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
                      {gateways.jazzcash.status === 'awaiting_credentials'
                        ? 'Awaiting Production Credentials'
                        : 'Active'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Merchant ID (pp_MerchantID)
                      </label>
                      <input
                        type="text"
                        placeholder="MC12345"
                        value={gateways.jazzcash.merchantId}
                        onChange={(e) =>
                          setGateways({
                            ...gateways,
                            jazzcash: { ...gateways.jazzcash, merchantId: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Merchant Password (pp_Password)
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={gateways.jazzcash.password}
                        onChange={(e) =>
                          setGateways({
                            ...gateways,
                            jazzcash: { ...gateways.jazzcash, password: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Integrity Salt / Hash Key
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={gateways.jazzcash.hashKey}
                        onChange={(e) =>
                          setGateways({
                            ...gateways,
                            jazzcash: { ...gateways.jazzcash, hashKey: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gateways.jazzcash.sandbox}
                        onChange={(e) =>
                          setGateways({
                            ...gateways,
                            jazzcash: { ...gateways.jazzcash, sandbox: e.target.checked },
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      <span>Sandbox / Test Environment Mode</span>
                    </label>
                  </div>
                </div>

                {/* 3. Easypaisa Official Merchant API */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        EP
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Easypaisa Direct Gateway</h3>
                        <p className="text-xs text-slate-400">
                          Direct wallet integration via Telenor Microfinance Bank API.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
                      {gateways.easypaisa.status === 'awaiting_credentials'
                        ? 'Awaiting Store ID'
                        : 'Active'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Store ID</label>
                      <input
                        type="text"
                        placeholder="e.g. 10492"
                        value={gateways.easypaisa.storeId}
                        onChange={(e) =>
                          setGateways({
                            ...gateways,
                            easypaisa: { ...gateways.easypaisa, storeId: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Hash / Secret Key</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={gateways.easypaisa.hashKey}
                        onChange={(e) =>
                          setGateways({
                            ...gateways,
                            easypaisa: { ...gateways.easypaisa, hashKey: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Save All Gateway Configurations
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: DISCOUNT & COUPON MANAGEMENT */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Discount & Coupon Management</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Create promo codes for percentage or fixed PKR discounts.
                </p>
              </div>

              {/* Add Coupon Box */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-3">Create New Discount Coupon</h3>
                <form onSubmit={handleAddCoupon} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1">Coupon Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SUMMER20"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Discount Type</label>
                    <select
                      value={newCouponType}
                      onChange={(e) => setNewCouponType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed PKR (Rs.)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Discount Value</label>
                    <input
                      type="number"
                      required
                      value={newCouponValue}
                      onChange={(e) => setNewCouponValue(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Min Order (PKR)</label>
                    <input
                      type="number"
                      required
                      value={newCouponMin}
                      onChange={(e) => setNewCouponMin(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg"
                    >
                      Create Coupon
                    </button>
                  </div>
                </form>
              </div>

              {/* Coupons List */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-2.5 px-4">Code</th>
                      <th className="py-2.5 px-4">Discount</th>
                      <th className="py-2.5 px-4">Minimum Order</th>
                      <th className="py-2.5 px-4">Redemptions</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {StoreDatabase.getCoupons().map((c) => (
                      <tr key={c.code} className="hover:bg-slate-900/40">
                        <td className="py-3 px-4 font-mono font-bold text-blue-400">{c.code}</td>
                        <td className="py-3 px-4 text-white font-semibold">
                          {c.discountType === 'percentage' ? `${c.value}% OFF` : `Rs. ${c.value} FLAT`}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {formatPKR(c.minOrderAmount)}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">{c.usageCount} orders</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteCoupon(c.code)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: INVENTORY & LOW STOCK */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Inventory Control & Stock Warnings</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Monitor remaining warehouse stock and prevent out-of-stock orders.
                </p>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-2.5 px-4">Product Name</th>
                      <th className="py-2.5 px-4">SKU</th>
                      <th className="py-2.5 px-4">Current Stock</th>
                      <th className="py-2.5 px-4">Inventory Status</th>
                      <th className="py-2.5 px-4 text-right">Quick Restock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-4 font-semibold text-white">{p.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{p.sku}</td>
                        <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                          {p.stockQuantity} units
                        </td>
                        <td className="py-3 px-4">
                          {p.stockQuantity <= 0 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                              OUT OF STOCK
                            </span>
                          ) : p.stockQuantity <= 5 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                              LOW STOCK
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                              HEALTHY
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              p.stockQuantity += 10;
                              p.status = 'in_stock';
                              StoreDatabase.saveProduct(p);
                              refreshData();
                              showToast('Stock Added', `Added +10 units to ${p.name}`, 'success');
                            }}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold text-xs"
                          >
                            +10 Units
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: CUSTOMER ENQUIRIES */}
          {activeTab === 'enquiries' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Customer Support Enquiries</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inquiries submitted via the Contact Us form and WhatsApp requests.
                </p>
              </div>

              <div className="space-y-4">
                {enquiries.map((enq) => (
                  <div
                    key={enq.id}
                    className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{enq.name}</span>
                        <span className="text-slate-400">({enq.email} · {enq.phone})</span>
                      </div>
                      <span className="text-slate-500 font-mono">{formatDateTime(enq.createdAt)}</span>
                    </div>
                    <div className="font-semibold text-blue-400 text-sm">{enq.subject}</div>
                    <p className="text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                      {enq.message}
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => {
                          StoreDatabase.updateEnquiryStatus(enq.id, 'resolved');
                          setEnquiries(StoreDatabase.getEnquiries());
                          showToast('Enquiry Resolved', 'Marked as resolved.', 'success');
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-xs"
                      >
                        Mark as Resolved
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Customer Ratings & Reviews</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified customer feedback from across Pakistan.
                </p>
              </div>

              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{rev.customerName}</span>
                        <span className="text-slate-400">({rev.city})</span>
                        <div className="flex items-center text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <span className="text-slate-500 font-mono">{formatDate(rev.date)}</span>
                    </div>
                    <h4 className="font-semibold text-white">{rev.title}</h4>
                    <p className="text-slate-300">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Registered Customer Accounts</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customer profiles, contact numbers, and delivery addresses.
                </p>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-4">Email</th>
                      <th className="py-2.5 px-4">Mobile Number</th>
                      <th className="py-2.5 px-4">Role</th>
                      <th className="py-2.5 px-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {StoreDatabase.getCustomers().map((c) => (
                      <tr key={c.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-4 font-semibold text-white">{c.name}</td>
                        <td className="py-3 px-4 text-slate-300">{c.email}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{c.phone}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800 capitalize">
                            {c.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{formatDate(c.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 11: SUPABASE SQL & RLS */}
          {activeTab === 'supabase' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Supabase PostgreSQL Database & Row Level Security
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ready-to-execute SQL script to provision categories, products, orders, customers, and RLS policies in your Supabase project.
                  </p>
                </div>

                <button
                  onClick={handleCopySQL}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {copiedSQL ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSQL ? 'Copied to Clipboard!' : 'Copy Full SQL Schema'}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="p-4 bg-blue-950/40 border border-blue-800/80 rounded-xl text-xs text-blue-200 space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span>How to connect external Supabase project:</span>
                  </h4>
                  <ol className="list-decimal pl-5 space-y-1 text-slate-300">
                    <li>Create a new project at <strong>supabase.com</strong>.</li>
                    <li>Open <strong>SQL Editor</strong> in your Supabase dashboard.</li>
                    <li>Paste the SQL script below and click <strong>Run</strong>.</li>
                    <li>Paste your project URL and Anon Key in Store Settings tab or .env.</li>
                  </ol>
                </div>

                <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed">
                  {StoreDatabase.generateSupabaseSQLSchema()}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 12: STORE CONFIGURATION SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Store Settings & Business Identity</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure business name, Pakistani address, phone numbers, and delivery thresholds.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1">Store Name</label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Tagline</label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1">Official WhatsApp</label>
                    <input
                      type="text"
                      value={settings.whatsapp}
                      onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">UAN / Phone</label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Support Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block text-slate-300 mb-1">Physical Business Address (Pakistan)</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1">Free Delivery Threshold (PKR)</label>
                    <input
                      type="number"
                      value={settings.freeDeliveryThreshold}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          freeDeliveryThreshold: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Standard Delivery Fee (PKR)</label>
                    <input
                      type="number"
                      value={settings.standardDeliveryCharge}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          standardDeliveryCharge: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Save Store Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 13: GitHub & Custom Domain Hosting (mokhs.store) */}
          {activeTab === 'github' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
                      <GitBranch className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-bold text-white">
                      GitHub Hosting & Custom Domain (mokhs.store)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Connect this codebase to your personal or organization GitHub account and host directly on{' '}
                    <strong className="text-cyan-400 font-mono">https://mokhs.store/</strong> with automatic CI/CD.
                  </p>
                </div>

                <a
                  href="https://github.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors w-fit"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Create Repo on GitHub</span>
                </a>
              </div>

              {/* Status Bar Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Git Repository</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-white font-bold font-mono text-sm">Initialized (main)</div>
                  <p className="text-[11px] text-slate-400">Ready for remote push</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">CNAME Record</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-cyan-400 font-bold font-mono text-sm">mokhs.store</div>
                  <p className="text-[11px] text-slate-400">Configured in /public/CNAME</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">GitHub Actions CI/CD</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-white font-bold font-mono text-sm">deploy.yml</div>
                  <p className="text-[11px] text-slate-400">Auto-builds & deploys on push</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Production Domain</span>
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-white font-bold font-mono text-sm">https://mokhs.store</div>
                  <p className="text-[11px] text-slate-400">Custom SSL & Apex routing</p>
                </div>
              </div>

              {/* Step 1: Push Code to GitHub */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      Step 1: Push Code to Your GitHub Repository
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">One-time setup</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Your GitHub Username or Organization
                    </label>
                    <input
                      type="text"
                      value={githubUser}
                      onChange={(e) => setGithubUser(e.target.value)}
                      placeholder="e.g. SirajQureshi"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Repository Name
                    </label>
                    <input
                      type="text"
                      value={githubRepo}
                      onChange={(e) => setGithubRepo(e.target.value)}
                      placeholder="mokhs-store"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Run these commands in your local terminal:</span>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `git remote add origin https://github.com/${githubUser || 'YOUR_USERNAME'}/${githubRepo || 'mokhs-store'}.git\ngit branch -M main\ngit push -u origin main`,
                          'Git Remote & Push Commands'
                        )
                      }
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      {copiedCommand === 'Git Remote & Push Commands' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Commands</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-4 bg-slate-900 rounded-xl text-cyan-300 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
{`git remote add origin https://github.com/${githubUser || 'YOUR_USERNAME'}/${githubRepo || 'mokhs-store'}.git
git branch -M main
git push -u origin main`}
                  </pre>
                </div>
              </div>

              {/* Step 2: Configure GitHub Pages Settings */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    Step 2: Enable GitHub Pages in Repository Settings
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="font-bold text-white">A. Build and deployment</div>
                    <p className="text-slate-400 leading-relaxed">
                      In GitHub repository, click <strong>Settings</strong> &gt; <strong>Pages</strong>. Under <em>Source</em>, select <strong>GitHub Actions</strong>.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="font-bold text-white">B. Custom Domain</div>
                    <p className="text-slate-400 leading-relaxed">
                      Under <em>Custom domain</em>, verify <strong className="text-cyan-300 font-mono">mokhs.store</strong> is populated from the included <code className="text-amber-300">public/CNAME</code> file.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="font-bold text-white">C. Enforce HTTPS</div>
                    <p className="text-slate-400 leading-relaxed">
                      Check <strong>Enforce HTTPS</strong> to ensure free Let's Encrypt SSL is issued automatically for <span className="text-emerald-400">https://mokhs.store</span>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: DNS Records for mokhs.store */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      Step 3: Point Your Domain DNS to GitHub Pages
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">At your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)</span>
                </div>

                <p className="text-xs text-slate-400">
                  Log into your domain registrar's DNS Management panel for <strong className="text-white">mokhs.store</strong> and add the following 4 A records and 1 CNAME record:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">Type</th>
                        <th className="py-2.5 px-4 font-semibold">Host / Name</th>
                        <th className="py-2.5 px-4 font-semibold">Points to / Value</th>
                        <th className="py-2.5 px-4 font-semibold">TTL</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {[
                        { type: 'A', name: '@', value: '185.199.108.153' },
                        { type: 'A', name: '@', value: '185.199.109.153' },
                        { type: 'A', name: '@', value: '185.199.110.153' },
                        { type: 'A', name: '@', value: '185.199.111.153' },
                        { type: 'CNAME', name: 'www', value: `${githubUser || 'SirajQureshi'}.github.io` },
                      ].map((record, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-4 text-cyan-400 font-bold">{record.type}</td>
                          <td className="py-2.5 px-4 text-white">{record.name}</td>
                          <td className="py-2.5 px-4 text-slate-300 font-bold">{record.value}</td>
                          <td className="py-2.5 px-4 text-slate-400">Automatic / 3600</td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={() => copyToClipboard(record.value, `${record.type} record ${record.value}`)}
                              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded text-[11px] font-sans cursor-pointer"
                            >
                              Copy
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-blue-950/40 rounded-xl border border-blue-900/60 flex items-start gap-3 text-xs text-blue-200">
                  <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-white">Automated Free SSL / TLS Certificate</div>
                    <p className="text-blue-300/90 leading-relaxed">
                      Once DNS propagates (usually 10–60 minutes), GitHub automatically provisions a trusted Let's Encrypt SSL certificate for both <code className="text-cyan-300 font-mono">https://mokhs.store</code> and <code className="text-cyan-300 font-mono">https://www.mokhs.store</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
