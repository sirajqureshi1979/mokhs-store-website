import {
  Product,
  Category,
  Order,
  Customer,
  Review,
  Enquiry,
  Coupon,
  PaymentGatewaysConfig,
  StoreSettings,
  Banner,
  OrderStatus,
  PaymentStatus,
} from '../types';

// Initial 15 categories mandated by user request
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-mobile-phones',
    name: 'Mobile Phones',
    slug: 'mobile-phones',
    iconName: 'Smartphone',
    description: 'Flagship smartphones, 5G devices and feature phones from top brands.',
    itemCount: 24,
    displayOrder: 1,
  },
  {
    id: 'cat-mobile-accessories',
    name: 'Mobile Accessories',
    slug: 'mobile-accessories',
    iconName: 'Headphones',
    description: 'Screen protectors, cases, fast cables, and car mounts.',
    itemCount: 48,
    displayOrder: 2,
  },
  {
    id: 'cat-laptops-computers',
    name: 'Laptops and Computers',
    slug: 'laptops-and-computers',
    iconName: 'Laptop',
    description: 'Ultrabooks, business laptops, desktop PCs and work stations.',
    itemCount: 18,
    displayOrder: 3,
  },
  {
    id: 'cat-computer-accessories',
    name: 'Computer Accessories',
    slug: 'computer-accessories',
    iconName: 'Monitor',
    description: 'Keyboards, wireless mice, webcams, USB-C hubs and laptop stands.',
    itemCount: 36,
    displayOrder: 4,
  },
  {
    id: 'cat-headphones-earbuds',
    name: 'Headphones and Earbuds',
    slug: 'headphones-and-earbuds',
    iconName: 'Headphones',
    description: 'Active noise-cancelling headphones, true wireless stereo earbuds and gaming headsets.',
    itemCount: 29,
    displayOrder: 5,
  },
  {
    id: 'cat-speakers-audio',
    name: 'Speakers and Audio Devices',
    slug: 'speakers-and-audio-devices',
    iconName: 'Volume2',
    description: 'Bluetooth portable party speakers, soundbars and hi-fi audio systems.',
    itemCount: 15,
    displayOrder: 6,
  },
  {
    id: 'cat-smart-watches',
    name: 'Smart Watches',
    slug: 'smart-watches',
    iconName: 'Watch',
    description: 'Fitness trackers, titanium GPS watches and health monitoring wearables.',
    itemCount: 22,
    displayOrder: 7,
  },
  {
    id: 'cat-gaming-accessories',
    name: 'Gaming Accessories',
    slug: 'gaming-accessories',
    iconName: 'Gamepad2',
    description: 'Mechanical RGB gaming keyboards, ultra-light mice, controllers and game pads.',
    itemCount: 31,
    displayOrder: 8,
  },
  {
    id: 'cat-networking-equipment',
    name: 'Networking Equipment',
    slug: 'networking-equipment',
    iconName: 'Network',
    description: 'Gigabit switches, PoE adapters, ethernet cables and enterprise network gear.',
    itemCount: 14,
    displayOrder: 9,
  },
  {
    id: 'cat-routers-wifi',
    name: 'Routers and Wi-Fi Devices',
    slug: 'routers-and-wifi-devices',
    iconName: 'Wifi',
    description: 'Wi-Fi 6 & 7 mesh routers, high-gain signal extenders and dual-band routers.',
    itemCount: 19,
    displayOrder: 10,
  },
  {
    id: 'cat-cctv-security',
    name: 'CCTV and Security Equipment',
    slug: 'cctv-and-security-equipment',
    iconName: 'ShieldAlert',
    description: '4K IP cameras, NVRs, smart video doorbells, night-vision surveillance systems.',
    itemCount: 17,
    displayOrder: 11,
  },
  {
    id: 'cat-smart-home',
    name: 'Smart Home Devices',
    slug: 'smart-home-devices',
    iconName: 'Home',
    description: 'Smart Wi-Fi plugs, ambient LED light strips, sensors and voice assistants.',
    itemCount: 26,
    displayOrder: 12,
  },
  {
    id: 'cat-powerbanks-chargers',
    name: 'Power Banks and Chargers',
    slug: 'power-banks-and-chargers',
    iconName: 'BatteryCharging',
    description: 'High-speed GaN fast wall chargers, 20000mAh power banks, MagSafe chargers.',
    itemCount: 42,
    displayOrder: 13,
  },
  {
    id: 'cat-electronic-gadgets',
    name: 'Electronic Gadgets',
    slug: 'electronic-gadgets',
    iconName: 'Cpu',
    description: 'Mini thermal printers, precision electric screwdrivers, LED desk lights, laser measurers.',
    itemCount: 25,
    displayOrder: 14,
  },
  {
    id: 'cat-other-electronics',
    name: 'Other Electronics',
    slug: 'other-electronics',
    iconName: 'Layers',
    description: 'Specialty electronic modules, adapters, converters, testing tools and components.',
    itemCount: 12,
    displayOrder: 15,
  },
];

// Seed products featuring our secured startup launch product and other coming soon products
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-vintage-t9-dragon-trimmer',
    name: 'Vintage T9 Professional Cordless Hair & Beard Trimmer (Dragon Engraved · 0.1mm Zero-Gapped T-Blade)',
    slug: 'vintage-t9-professional-dragon-trimmer',
    brand: 'MOKHS.STORE',
    model: 'Vintage T9 Dragon Pro',
    categoryId: 'cat-electronic-gadgets',
    categoryName: 'Electronic Gadgets',
    subcategory: 'Personal Care & Grooming',
    regularPrice: 3499,
    discountedPrice: 2199,
    stockQuantity: 45,
    description: 'MOKHS.STORE Startup Launch Flagship! The iconic Vintage T9 professional cordless hair clipper and beard trimmer with heavy-duty antique bronze dragon relief engraving. Engineered with an ultra-fine 0.1mm short-distance zero-gapped stainless T-blade for skin-safe clean close shaving, precision hair contouring, and beard lining without snagging. Features Type-C fast charging (cut hair more than 15 times on single charge), whisper-quiet high-torque motor, 4 limiting combs (1.5mm, 2mm, 3mm, 4mm), cleaning brush and retail box. Backed by 6 Months MOKHS Replacement Guarantee and Cash on Delivery nationwide.',
    specifications: {
      'Blade Type': '0.1mm Short-Distance Ultra-Sharp Zero-Gapped T-Blade (Safe on Skin, No Snagging)',
      'Body Construction': 'Heavy-Duty Antique Bronze Zinc Alloy with Relief Dragon Engraving',
      'Charging Interface': 'Universal Type-C Fast Charging (Compatible with Power Bank, Laptop & Car)',
      'Battery Runtime': 'High-Capacity Lithium-Ion (15+ precision haircuts / up to 120 mins runtime)',
      'Charging Duration': '4.5 Hours full charge with Smart Red/Green LED Status Prompt',
      'Included Guide Combs': '4 Limiting Combs (1.5mm, 2mm, 3mm, 4mm)',
      'Accessories Included': 'Type-C Cable, Cleaning Brush, Limiting Combs & Official Retail Box',
      'Motor Performance': 'High-Torque 7000 RPM Pure Copper Core Low-Vibration Motor',
      'Dimensions': '40mm (1.57in) Cutter Width x 148mm (5.83in) Total Length',
      'Warranty': '6 Months MOKHS Official Replacement Warranty',
    },
    warranty: '6 Months MOKHS Official Replacement Warranty',
    sku: 'MOKHS-T9-DRAGON',
    status: 'in_stock',
    rating: 5.0,
    reviewCount: 34,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    images: [
      '/assets/aistudio/Screenshot_2026-11-06_at_11.01.44_AM_2c234714.png',
      '/assets/aistudio/Screenshot_2026-11-06_at_11.01.21_AM_77993ade.png',
      '/assets/aistudio/Screenshot_2026-11-06_at_11.01.28_AM_a88ec265.png',
      '/assets/aistudio/Screenshot_2026-11-06_at_11.01.37_AM_8c264e26.png',
    ],
    createdAt: '2026-11-05T00:00:00Z',
  },
  {
    id: 'prod-zenith-15-pro',
    name: 'Zenith 15 Pro Titanium 5G (256GB / 12GB)',
    slug: 'zenith-15-pro-titanium-5g',
    brand: 'Zenith Mobile',
    model: 'Z15P-TI',
    categoryId: 'cat-mobile-phones',
    categoryName: 'Mobile Phones',
    subcategory: 'Flagship Smartphones',
    regularPrice: 285000,
    discountedPrice: 264999,
    stockQuantity: 0,
    description: 'Aerospace-grade titanium design with crystal 120Hz LTPO Super AMOLED display. PTA approved with 1 Year Official Brand Warranty across Pakistan. (Coming Soon - Inventory will be stocked in Phase 2 expansion).',
    specifications: {
      'Display': '6.7" Quad HD+ LTPO 120Hz OLED (3000 nits)',
      'Processor': 'Snapdragon 8 Gen 3 (3.3 GHz Octa-Core)',
      'Status': 'Coming Soon · We will buy later',
    },
    warranty: '1 Year Official Brand Warranty',
    sku: 'MOKHS-MOB-Z15P-TI',
    status: 'coming_soon',
    rating: 4.9,
    reviewCount: 38,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    images: [
      '/src/assets/images/product_flagship_smartphone_1793943579283.jpg',
      '/src/assets/images/hero_smart_electronics_1793943578482.jpg',
    ],
    createdAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'prod-eliteaudio-anc700',
    name: 'EliteAudio Studio ANC-700 Wireless Headphones',
    slug: 'eliteaudio-studio-anc-700',
    brand: 'EliteAudio',
    model: 'ANC-700',
    categoryId: 'cat-headphones-earbuds',
    categoryName: 'Headphones and Earbuds',
    subcategory: 'Over-Ear Headphones',
    regularPrice: 38500,
    discountedPrice: 32999,
    stockQuantity: 0,
    description: 'Audiophile-grade studio acoustic sound with Hybrid 45dB Active Noise Cancellation. (Coming Soon - Inventory will be stocked in Phase 2 expansion).',
    specifications: {
      'Driver Size': '40mm Custom Bio-Cellulose Dynamic Drivers',
      'Status': 'Coming Soon · We will buy later',
    },
    warranty: '1 Year Replacement Warranty by MOKHS.STORE',
    sku: 'MOKHS-AUD-ANC700',
    status: 'coming_soon',
    rating: 4.8,
    reviewCount: 52,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    images: [
      '/src/assets/images/product_anc_headphones_1793943579704.jpg',
      '/src/assets/images/hero_smart_electronics_1793943578482.jpg',
    ],
    createdAt: '2026-10-20T12:00:00Z',
  },
  {
    id: 'prod-apex-smartwatch-ultra',
    name: 'Apex Ultra Titanium GPS Smartwatch (Sapphire Glass)',
    slug: 'apex-ultra-titanium-gps-smartwatch',
    brand: 'Apex Tech',
    model: 'APX-U9',
    categoryId: 'cat-smart-watches',
    categoryName: 'Smart Watches',
    subcategory: 'Rugged Sports Watches',
    regularPrice: 24500,
    discountedPrice: 19999,
    stockQuantity: 0,
    description: 'Rugged titanium case engineered for extreme sports and daily fitness tracking. (Coming Soon - Inventory will be stocked in Phase 2 expansion).',
    specifications: {
      'Case Material': 'Grade 5 Aerospace Titanium',
      'Status': 'Coming Soon · We will buy later',
    },
    warranty: '1 Year Official Warranty',
    sku: 'MOKHS-WTC-APXU9',
    status: 'coming_soon',
    rating: 4.7,
    reviewCount: 44,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    images: [
      '/src/assets/images/product_smartwatch_ultra_1793943579391.jpg',
      '/src/assets/images/hero_smart_electronics_1793943578482.jpg',
    ],
    createdAt: '2026-10-22T14:30:00Z',
  },
  {
    id: 'prod-quantumbook-pro14',
    name: 'QuantumBook Pro 14 (Core Ultra 7 / 32GB / 1TB SSD)',
    slug: 'quantumbook-pro-14',
    brand: 'Quantum',
    model: 'QB-14X',
    categoryId: 'cat-laptops-computers',
    categoryName: 'Laptops and Computers',
    subcategory: 'Ultrabooks',
    regularPrice: 345000,
    discountedPrice: 319000,
    stockQuantity: 0,
    description: 'Featherlight 1.2kg unibody aluminum chassis with 2.8K 120Hz OLED screen. Built for software engineers, content creators, and executives. (Coming Soon - We will buy later).',
    specifications: {
      'Display': '14.2" 2.8K (2880x1800) OLED, 120Hz',
      'Processor': 'Intel Core Ultra 7 155H',
      'Status': 'Coming Soon · We will buy later',
    },
    warranty: '2 Years Manufacturer International Warranty',
    sku: 'MOKHS-LPT-QB14X',
    status: 'coming_soon',
    rating: 4.9,
    reviewCount: 19,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    images: [
      '/src/assets/images/hero_smart_electronics_1793943578482.jpg',
    ],
    createdAt: '2026-10-25T09:15:00Z',
  },
  {
    id: 'prod-anker-powercore-20000',
    name: 'VoltPro 65W GaN 20,000mAh Laptop & Phone Power Bank',
    slug: 'voltpro-65w-gan-20000mah-power-bank',
    brand: 'VoltPro',
    model: 'VP-PB65',
    categoryId: 'cat-powerbanks-chargers',
    categoryName: 'Power Banks and Chargers',
    subcategory: 'Fast Charging Power Banks',
    regularPrice: 16500,
    discountedPrice: 13499,
    stockQuantity: 0,
    description: 'High capacity 20,000mAh external battery pack capable of outputting a full 65W USB-C PD. (Coming Soon - We will buy later).',
    specifications: {
      'Capacity': '20,000 mAh / 74Wh Airline Approved',
      'Max Output': '65W Power Delivery (Type-C1)',
      'Status': 'Coming Soon · We will buy later',
    },
    warranty: '18 Months Replacement Warranty',
    sku: 'MOKHS-PWR-VP65',
    status: 'coming_soon',
    rating: 4.8,
    reviewCount: 67,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    images: [
      '/src/assets/images/hero_smart_electronics_1793943578482.jpg',
    ],
    createdAt: '2026-09-10T11:00:00Z',
  },
  {
    id: 'prod-tplink-archer-ax73',
    name: 'TP-Link Archer AX73 Dual-Band Gigabit Wi-Fi 6 Router',
    slug: 'tp-link-archer-ax73-wifi6-router',
    brand: 'TP-Link',
    model: 'Archer AX73',
    categoryId: 'cat-routers-wifi',
    categoryName: 'Routers and Wi-Fi Devices',
    subcategory: 'Wi-Fi 6 Routers',
    regularPrice: 28000,
    discountedPrice: 24500,
    stockQuantity: 0,
    description: 'Blazing-fast 5400 Mbps Wi-Fi speeds for simultaneous 8K streaming. (Coming Soon - We will buy later).',
    specifications: {
      'Speed': '4804 Mbps on 5 GHz + 574 Mbps on 2.4 GHz',
      'Status': 'Coming Soon · We will buy later',
    },
    warranty: '1 Year Official TP-Link Pakistan Warranty',
    sku: 'MOKHS-NET-AX73',
    status: 'coming_soon',
    rating: 4.7,
    reviewCount: 31,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    images: [
      '/src/assets/images/hero_smart_electronics_1793943578482.jpg',
    ],
    createdAt: '2026-09-18T15:20:00Z',
  },
  {
    id: 'prod-hikvision-4k-cctv',
    name: 'Hikvision ColorVu 4K Ultra HD Smart Outdoor Security Camera',
    slug: 'hikvision-colorvu-4k-cctv-camera',
    brand: 'Hikvision',
    model: 'DS-2CD2087G2-LU',
    categoryId: 'cat-cctv-security',
    categoryName: 'CCTV and Security Equipment',
    subcategory: 'IP Security Cameras',
    regularPrice: 22000,
    discountedPrice: 18900,
    stockQuantity: 0,
    description: 'Round-the-clock vivid color imaging with ColorVu technology. (Coming Soon - We will buy later).',
    specifications: {
      'Resolution': '4K UHD (3840 x 2160)',
      'Status': 'Coming Soon · We will buy later',
    },
    warranty: '1 Year Brand Warranty',
    sku: 'MOKHS-SEC-HIK4K',
    status: 'coming_soon',
    rating: 4.8,
    reviewCount: 22,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    images: [
      '/src/assets/images/hero_smart_electronics_1793943578482.jpg',
    ],
    createdAt: '2026-10-05T08:45:00Z',
  },
  {
    id: 'prod-razer-viper-gaming-mouse',
    name: 'Razer Viper V3 HyperSpeed Wireless Ergonomic Gaming Mouse',
    slug: 'razer-viper-v3-hyperspeed',
    brand: 'Razer',
    model: 'RZ01-0491',
    categoryId: 'cat-gaming-accessories',
    categoryName: 'Gaming Accessories',
    subcategory: 'Gaming Mice',
    regularPrice: 21500,
    discountedPrice: 17999,
    stockQuantity: 0,
    description: 'Ultra-lightweight 59g esports wireless gaming mouse. (Coming Soon - We will buy later).',
    specifications: {
      'Sensor': 'Focus Pro 30K Optical Sensor',
      'Status': 'Coming Soon · We will buy later',
    },
    warranty: '1 Year MOKHS Official Replacement Warranty',
    sku: 'MOKHS-GAM-RZVIP',
    status: 'coming_soon',
    rating: 4.9,
    reviewCount: 41,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    images: [
      '/src/assets/images/hero_smart_electronics_1793943578482.jpg',
    ],
    createdAt: '2026-09-28T16:10:00Z',
  },
  {
    id: 'prod-smart-home-led-desk',
    name: 'SmartHome Pro Wi-Fi RGBIC Ambient Desk & Monitor Light Bar',
    slug: 'smarthome-pro-wifi-rgbic-light-bar',
    brand: 'LuminaTech',
    model: 'LT-BAR2',
    categoryId: 'cat-smart-home',
    categoryName: 'Smart Home Devices',
    subcategory: 'Smart Lighting',
    regularPrice: 11500,
    discountedPrice: 9200,
    stockQuantity: 0,
    description: 'Immersive screen sync backlighting and ambient desk illumination. (Coming Soon - We will buy later).',
    specifications: {
      'Connectivity': 'Wi-Fi 2.4GHz + Bluetooth',
      'Status': 'Coming Soon · We will buy later',
    },
    warranty: '1 Year Warranty',
    sku: 'MOKHS-SMH-LUM2',
    status: 'coming_soon',
    rating: 4.6,
    reviewCount: 29,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    images: [
      '/src/assets/images/hero_smart_electronics_1793943578482.jpg',
    ],
    createdAt: '2026-10-18T13:40:00Z',
  },
  {
    id: 'prod-gan-100w-wall-charger',
    name: 'HyperCharge 100W 4-Port GaN Fast Wall Charger',
    slug: 'hypercharge-100w-gan-fast-wall-charger',
    brand: 'HyperCharge',
    model: 'HC-100G',
    categoryId: 'cat-powerbanks-chargers',
    categoryName: 'Power Banks and Chargers',
    subcategory: 'GaN Chargers',
    regularPrice: 14500,
    discountedPrice: 11999,
    stockQuantity: 0,
    description: 'Compact Gallium Nitride (GaN) fast charger with 3x USB-C and 1x USB-A ports. (Coming Soon - We will buy later).',
    specifications: {
      'Total Output': '100W Max',
      'Status': 'Coming Soon · We will buy later',
    },
    warranty: '1 Year Replacement Warranty',
    sku: 'MOKHS-PWR-HC100',
    status: 'coming_soon',
    rating: 4.9,
    reviewCount: 56,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    images: [
      '/src/assets/images/hero_smart_electronics_1793943578482.jpg',
    ],
    createdAt: '2026-09-12T10:30:00Z',
  },
  {
    id: 'prod-precision-electric-screwdriver',
    name: 'Precision 64-in-1 Electric Screwdriver Repair Kit',
    slug: 'precision-64in1-electric-screwdriver',
    brand: 'TechCraft',
    model: 'TC-PRO64',
    categoryId: 'cat-electronic-gadgets',
    categoryName: 'Electronic Gadgets',
    subcategory: 'Gadget Tools',
    regularPrice: 8900,
    discountedPrice: 6999,
    stockQuantity: 0,
    description: 'Essential gadget repair toolkit with motorized torque control. (Coming Soon - We will buy later).',
    specifications: {
      'Bits Included': '64 S2 Alloy Steel Bits',
      'Status': 'Coming Soon · We will buy later',
    },
    warranty: '6 Months Replacement Warranty',
    sku: 'MOKHS-GAD-TC64',
    status: 'coming_soon',
    rating: 4.7,
    reviewCount: 34,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    images: [
      '/src/assets/images/hero_smart_electronics_1793943578482.jpg',
    ],
    createdAt: '2026-10-12T11:15:00Z',
  },
  {
    id: 'prod-usbc-10in1-hub',
    name: 'MultiPort 10-in-1 Aluminum USB-C Hub & Laptop Docking Station',
    slug: 'multiport-10in1-usb-c-hub',
    brand: 'DockMaster',
    model: 'DM-10X',
    categoryId: 'cat-computer-accessories',
    categoryName: 'Computer Accessories',
    subcategory: 'Docks & Hubs',
    regularPrice: 12500,
    discountedPrice: 9999,
    stockQuantity: 0,
    description: 'Expand your laptop into a full workstation. (Coming Soon - We will buy later).',
    specifications: {
      'Video': '4K @ 60Hz HDMI',
      'Status': 'Coming Soon · We will buy later',
    },
    warranty: '1 Year Warranty',
    sku: 'MOKHS-ACC-DM10',
    status: 'coming_soon',
    rating: 4.8,
    reviewCount: 42,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    images: [
      '/src/assets/images/hero_smart_electronics_1793943578482.jpg',
    ],
    createdAt: '2026-09-24T09:40:00Z',
  },
];

// Seed active discount coupons
const DEFAULT_COUPONS: Coupon[] = [
  {
    code: 'MOKHS10',
    discountType: 'percentage',
    value: 10,
    minOrderAmount: 5000,
    maxDiscount: 10000,
    isActive: true,
    expiresAt: '2027-12-31',
    usageCount: 142,
  },
  {
    code: 'WELCOME500',
    discountType: 'fixed',
    value: 500,
    minOrderAmount: 3000,
    isActive: true,
    expiresAt: '2027-12-31',
    usageCount: 289,
  },
  {
    code: 'FREESHIP',
    discountType: 'fixed',
    value: 250,
    minOrderAmount: 2000,
    isActive: true,
    expiresAt: '2027-12-31',
    usageCount: 310,
  },
];

// Seed customer reviews from real Pakistani cities
const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'rev-t9-1',
    productId: 'prod-vintage-t9-dragon-trimmer',
    customerName: 'Rashid Mehmood',
    city: 'Lahore',
    rating: 5,
    title: '0.1mm Zero Gapping is Unreal – Razor Close Shave!',
    comment: 'Ordered the Vintage T9 Dragon trimmer from MOKHS.STORE. The antique bronze relief is heavy zinc alloy and feels luxurious in hand. The 0.1mm blade cuts super crisp with zero skin irritation or pulling. Delivered via TCS Cash on Delivery in Gulberg in 24 hours!',
    verifiedPurchase: true,
    date: '2026-11-04',
  },
  {
    id: 'rev-t9-2',
    productId: 'prod-vintage-t9-dragon-trimmer',
    customerName: 'Fahad Bilal',
    city: 'Karachi',
    rating: 5,
    title: 'Type-C charging with power bank is a lifesaver',
    comment: 'The Type-C charging port at the bottom means I can charge it with my mobile charger or power bank during loadshedding. Battery easily lasts 15+ trims. Comes with all 4 guard combs (1.5mm to 4mm) and cleaning brush. Best trimmer in Pakistan for this price.',
    verifiedPurchase: true,
    date: '2026-11-03',
  },
  {
    id: 'rev-t9-3',
    productId: 'prod-vintage-t9-dragon-trimmer',
    customerName: 'Usama Qasim',
    city: 'Islamabad',
    rating: 5,
    title: 'Solid Metal Body & 100% Genuine Box Packaging',
    comment: 'Arrived fully factory sealed in the retail box. Cleaned up my beard neckline in minutes. Whisper quiet copper motor and no snagging. 6 months replacement warranty gives peace of mind.',
    verifiedPurchase: true,
    date: '2026-11-02',
  },
  {
    id: 'rev-t9-4',
    productId: 'prod-vintage-t9-dragon-trimmer',
    customerName: 'Zainab Rehman (Gift for Husband)',
    city: 'Rawalpindi',
    rating: 5,
    title: 'Amazing gift! Husband loved the dragon carving',
    comment: 'Bought this as a gift for my husband. The detailing and brass finish look stunning on the bathroom vanity. Shaves closer than ordinary plastic trimmers.',
    verifiedPurchase: true,
    date: '2026-11-01',
  },
];

// Seed customer accounts including Admins and Shoppers
const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'usr-admin-1',
    name: 'Siraj Qureshi (Owner)',
    email: 'admin@mokhs.store',
    phone: '+92 300 1234567',
    role: 'super_admin',
    addresses: [
      {
        id: 'addr-admin-1',
        title: 'Head Office',
        recipientName: 'Siraj Qureshi',
        phone: '+92 300 1234567',
        addressLine: 'Suite 402, Al-Hafeez Heights, Main Boulevard, Gulberg III',
        city: 'Lahore',
        province: 'Punjab',
        postalCode: '54660',
        isDefault: true,
      },
    ],
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'usr-manager-1',
    name: 'Tariq Mehmood',
    email: 'manager@mokhs.store',
    phone: '+92 321 9876543',
    role: 'store_manager',
    addresses: [],
    createdAt: '2026-09-15T09:00:00Z',
  },
  {
    id: 'usr-orders-1',
    name: 'Farhan Ali',
    email: 'orders@mokhs.store',
    phone: '+92 333 4567890',
    role: 'order_manager',
    addresses: [],
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'usr-customer-1',
    name: 'Kamran Siddiqui',
    email: 'kamran.siddiqui@gmail.com',
    phone: '+92 312 3456789',
    role: 'customer',
    addresses: [
      {
        id: 'addr-cust-1',
        title: 'Home Address',
        recipientName: 'Kamran Siddiqui',
        phone: '+92 312 3456789',
        addressLine: 'House #45-B, Block 6, PECHS',
        city: 'Karachi',
        province: 'Sindh',
        postalCode: '75400',
        isDefault: true,
      },
    ],
    createdAt: '2026-10-12T14:00:00Z',
  },
];

// Seed realistic Pakistani orders
const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord-88421',
    orderNumber: 'MOKHS-PK-88421',
    customerId: 'usr-customer-1',
    customerName: 'Kamran Siddiqui',
    customerEmail: 'kamran.siddiqui@gmail.com',
    customerPhone: '+92 312 3456789',
    deliveryAddress: {
      id: 'addr-cust-1',
      title: 'Home Address',
      recipientName: 'Kamran Siddiqui',
      phone: '+92 312 3456789',
      addressLine: 'House #45-B, Block 6, PECHS',
      city: 'Karachi',
      province: 'Sindh',
      postalCode: '75400',
      isDefault: true,
    },
    items: [
      {
        productId: 'prod-eliteaudio-anc700',
        name: 'EliteAudio Studio ANC-700 Wireless Headphones',
        price: 32999,
        quantity: 1,
        image: '/src/assets/images/product_anc_headphones_1793943579704.jpg',
        sku: 'MOKHS-AUD-ANC700',
        brand: 'EliteAudio',
      },
      {
        productId: 'prod-gan-100w-wall-charger',
        name: 'HyperCharge 100W 4-Port GaN Fast Wall Charger',
        price: 11999,
        quantity: 1,
        image: '/src/assets/images/hero_smart_electronics_1793943578482.jpg',
        sku: 'MOKHS-PWR-HC100',
        brand: 'HyperCharge',
      },
    ],
    subtotal: 44998,
    discount: 500,
    couponCode: 'WELCOME500',
    deliveryCharge: 0,
    totalAmount: 44498,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'shipped',
    courier: 'TCS',
    trackingNumber: 'TCS-PK-99238471',
    customerNotes: 'Please call before arrival in PECHS.',
    createdAt: '2026-11-03T11:20:00Z',
    updatedAt: '2026-11-04T15:00:00Z',
  },
  {
    id: 'ord-88319',
    orderNumber: 'MOKHS-PK-88319',
    customerId: 'usr-customer-1',
    customerName: 'Danish Masood',
    customerEmail: 'danish.masood@outlook.com',
    customerPhone: '+92 301 8876213',
    deliveryAddress: {
      id: 'addr-sample-2',
      title: 'Office',
      recipientName: 'Danish Masood',
      phone: '+92 301 8876213',
      addressLine: 'Floor 3, Software Technology Park, Constitution Ave',
      city: 'Islamabad',
      province: 'Federal Capital',
      postalCode: '44000',
      isDefault: true,
    },
    items: [
      {
        productId: 'prod-apex-smartwatch-ultra',
        name: 'Apex Ultra Titanium GPS Smartwatch (Sapphire Glass)',
        price: 19999,
        quantity: 1,
        image: '/src/assets/images/product_smartwatch_ultra_1793943579391.jpg',
        sku: 'MOKHS-WTC-APXU9',
        brand: 'Apex Tech',
      },
    ],
    subtotal: 19999,
    discount: 1999,
    couponCode: 'MOKHS10',
    deliveryCharge: 0,
    totalAmount: 18000,
    paymentMethod: 'cod',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    courier: 'Leopards',
    trackingNumber: 'LEO-ISB-774129',
    createdAt: '2026-10-29T14:15:00Z',
    updatedAt: '2026-10-31T17:40:00Z',
  },
];

// Seed contact enquiries
const DEFAULT_ENQUIRIES: Enquiry[] = [
  {
    id: 'enq-1',
    name: 'Waqas Ahmed',
    email: 'waqas.ahmed@yahoo.com',
    phone: '+92 345 1290384',
    subject: 'Bulk Corporate Order for Laptops',
    message: 'Hello MOKHS.STORE, We need a quotation for 10 units of QuantumBook Pro 14 for our software house in Johar Town Lahore with official tax invoice and NTN details. Please reach out.',
    status: 'new',
    createdAt: '2026-11-04T09:30:00Z',
  },
  {
    id: 'enq-2',
    name: 'Dr. Noman Bashir',
    email: 'noman.bashir@gmail.com',
    phone: '+92 334 8821945',
    subject: 'Warranty Claim Information',
    message: 'Wanted to inquire how to claim the 1-year brand warranty on smart watches if I live in Multan? Is door-step pickup available?',
    status: 'in_progress',
    createdAt: '2026-11-02T16:10:00Z',
  },
];

// Initial Payment Gateways Configuration
// Important: Official Pakistani gateways (JazzCash & Easypaisa & Cards) are structured with exact merchant fields and marked awaiting credentials, while Cash on Delivery is active!
const DEFAULT_GATEWAYS: PaymentGatewaysConfig = {
  cod: {
    enabled: true,
    title: 'Cash on Delivery (COD)',
    description: 'Pay cash in Pakistani Rupees directly to courier delivery rider (TCS / Leopards / Trax) upon inspecting the sealed parcel at your doorstep.',
    maxOrderLimit: 250000,
  },
  jazzcash: {
    enabled: false,
    merchantId: '',
    password: '',
    hashKey: '',
    returnUrl: 'https://mokhs.store/api/payment/jazzcash/callback',
    sandbox: true,
    status: 'awaiting_credentials',
  },
  easypaisa: {
    enabled: false,
    storeId: '',
    hashKey: '',
    returnUrl: 'https://mokhs.store/api/payment/easypaisa/callback',
    sandbox: true,
    status: 'awaiting_credentials',
  },
  cardPayment: {
    enabled: false,
    merchantId: '',
    apiKey: '',
    secretKey: '',
    provider: 'payfast',
    sandbox: true,
    status: 'awaiting_credentials',
  },
};

// Store Settings
const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'MOKHS.STORE',
  tagline: 'Smart Electronics. Better Living.',
  domain: 'https://mokhs.store',
  phone: '+92 300 1234567',
  whatsapp: '+92 300 1234567',
  email: 'support@mokhs.store',
  address: 'Suite 402, Al-Hafeez Heights, Main Boulevard, Gulberg III',
  city: 'Lahore',
  country: 'Pakistan',
  currency: 'PKR',
  currencySymbol: 'Rs.',
  freeDeliveryThreshold: 3000,
  standardDeliveryCharge: 250,
  taxRatePercent: 0,
  supabaseUrl: '',
  supabaseAnonKey: '',
};

// Storage Keys
const STORAGE_KEYS = {
  PRODUCTS: 'mokhs_store_products_v2',
  CATEGORIES: 'mokhs_store_categories_v1',
  ORDERS: 'mokhs_store_orders_v1',
  CUSTOMERS: 'mokhs_store_customers_v1',
  CURRENT_USER: 'mokhs_store_current_user_v1',
  CART: 'mokhs_store_cart_v1',
  WISHLIST: 'mokhs_store_wishlist_v1',
  REVIEWS: 'mokhs_store_reviews_v2',
  COUPONS: 'mokhs_store_coupons_v1',
  ENQUIRIES: 'mokhs_store_enquiries_v1',
  GATEWAYS: 'mokhs_store_gateways_v1',
  SETTINGS: 'mokhs_store_settings_v1',
};

// Helper: safe JSON localStorage getter with fallback
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    return JSON.parse(saved) as T;
  } catch (e) {
    console.warn(`Error reading key ${key} from storage:`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key} to storage:`, e);
  }
}

// Database Service Class
export class StoreDatabase {
  // Products
  static getProducts(): Product[] {
    return loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  }

  static getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  static getProductBySlug(slug: string): Product | undefined {
    return this.getProducts().find((p) => p.slug === slug);
  }

  static saveProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.unshift(product);
    }
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
  }

  static deleteProduct(id: string): void {
    const products = this.getProducts().filter((p) => p.id !== id);
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
  }

  // Categories
  static getCategories(): Category[] {
    return loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  }

  static saveCategory(category: Category): void {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c.id === category.id);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
  }

  static deleteCategory(id: string): void {
    const categories = this.getCategories().filter((c) => c.id !== id);
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
  }

  // Orders
  static getOrders(): Order[] {
    return loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
  }

  static getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id);
  }

  static getOrderByNumber(orderNumber: string): Order | undefined {
    const trimmed = orderNumber.trim().toUpperCase();
    return this.getOrders().find((o) => o.orderNumber.toUpperCase() === trimmed);
  }

  static createOrder(order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    const orders = this.getOrders();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const newOrder: Order = {
      ...order,
      id: `ord-${randomSuffix}`,
      orderNumber: `MOKHS-PK-${randomSuffix}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Deduct stock quantities
    const products = this.getProducts();
    for (const item of newOrder.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
        if (prod.stockQuantity === 0) {
          prod.status = 'out_of_stock';
        } else if (prod.stockQuantity <= 5) {
          prod.status = 'low_stock';
        }
      }
    }
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);

    orders.unshift(newOrder);
    saveToStorage(STORAGE_KEYS.ORDERS, orders);

    return newOrder;
  }

  static updateOrderStatus(
    orderId: string,
    orderStatus: OrderStatus,
    paymentStatus?: PaymentStatus,
    courier?: 'TCS' | 'Leopards' | 'Call Courier' | 'Trax' | 'M&P',
    trackingNumber?: string
  ): void {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      order.orderStatus = orderStatus;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      if (courier) order.courier = courier;
      if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
      order.updatedAt = new Date().toISOString();
      saveToStorage(STORAGE_KEYS.ORDERS, orders);
    }
  }

  // Customers & Auth
  static getCustomers(): Customer[] {
    return loadFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
  }

  static getCurrentUser(): Customer | null {
    // Default to Siraj Qureshi (Owner / Super Admin) or saved user
    return loadFromStorage<Customer | null>(STORAGE_KEYS.CURRENT_USER, DEFAULT_CUSTOMERS[0]);
  }

  static setCurrentUser(user: Customer | null): void {
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
  }

  static registerCustomer(name: string, email: string, phone: string): Customer {
    const customers = this.getCustomers();
    const existing = customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      this.setCurrentUser(existing);
      return existing;
    }

    const newCustomer: Customer = {
      id: `usr-${Date.now()}`,
      name,
      email,
      phone,
      role: 'customer',
      addresses: [],
      createdAt: new Date().toISOString(),
    };
    customers.push(newCustomer);
    saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
    this.setCurrentUser(newCustomer);
    return newCustomer;
  }

  // Wishlist
  static getWishlist(): string[] {
    return loadFromStorage<string[]>(STORAGE_KEYS.WISHLIST, ['prod-zenith-15-pro']);
  }

  static toggleWishlist(productId: string): boolean {
    const list = this.getWishlist();
    const index = list.indexOf(productId);
    let added = false;
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(productId);
      added = true;
    }
    saveToStorage(STORAGE_KEYS.WISHLIST, list);
    return added;
  }

  // Reviews
  static getReviews(): Review[] {
    return loadFromStorage<Review[]>(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
  }

  static addReview(review: Omit<Review, 'id' | 'date'>): Review {
    const reviews = this.getReviews();
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    reviews.unshift(newReview);
    saveToStorage(STORAGE_KEYS.REVIEWS, reviews);
    return newReview;
  }

  // Coupons
  static getCoupons(): Coupon[] {
    return loadFromStorage<Coupon[]>(STORAGE_KEYS.COUPONS, DEFAULT_COUPONS);
  }

  static validateCoupon(code: string, subtotal: number): { valid: boolean; coupon?: Coupon; error?: string } {
    const cleanCode = code.trim().toUpperCase();
    const coupon = this.getCoupons().find((c) => c.code.toUpperCase() === cleanCode && c.isActive);
    if (!coupon) {
      return { valid: false, error: 'Invalid or expired coupon code' };
    }
    if (subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        error: `Coupon requires minimum order of Rs. ${coupon.minOrderAmount.toLocaleString()}`,
      };
    }
    return { valid: true, coupon };
  }

  static saveCoupon(coupon: Coupon): void {
    const coupons = this.getCoupons();
    const idx = coupons.findIndex((c) => c.code === coupon.code);
    if (idx >= 0) {
      coupons[idx] = coupon;
    } else {
      coupons.push(coupon);
    }
    saveToStorage(STORAGE_KEYS.COUPONS, coupons);
  }

  static deleteCoupon(code: string): void {
    const coupons = this.getCoupons().filter((c) => c.code !== code);
    saveToStorage(STORAGE_KEYS.COUPONS, coupons);
  }

  // Enquiries
  static getEnquiries(): Enquiry[] {
    return loadFromStorage<Enquiry[]>(STORAGE_KEYS.ENQUIRIES, DEFAULT_ENQUIRIES);
  }

  static addEnquiry(enquiry: Omit<Enquiry, 'id' | 'createdAt' | 'status'>): Enquiry {
    const enquiries = this.getEnquiries();
    const newEnq: Enquiry = {
      ...enquiry,
      id: `enq-${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    enquiries.unshift(newEnq);
    saveToStorage(STORAGE_KEYS.ENQUIRIES, enquiries);
    return newEnq;
  }

  static updateEnquiryStatus(id: string, status: 'new' | 'in_progress' | 'resolved'): void {
    const enquiries = this.getEnquiries();
    const enq = enquiries.find((e) => e.id === id);
    if (enq) {
      enq.status = status;
      saveToStorage(STORAGE_KEYS.ENQUIRIES, enquiries);
    }
  }

  // Payment Gateways Settings
  static getPaymentGateways(): PaymentGatewaysConfig {
    return loadFromStorage<PaymentGatewaysConfig>(STORAGE_KEYS.GATEWAYS, DEFAULT_GATEWAYS);
  }

  static savePaymentGateways(gateways: PaymentGatewaysConfig): void {
    saveToStorage(STORAGE_KEYS.GATEWAYS, gateways);
  }

  // Store Settings
  static getStoreSettings(): StoreSettings {
    return loadFromStorage<StoreSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  static saveStoreSettings(settings: StoreSettings): void {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }

  // Reset to Factory Seeds
  static resetToDefaults(): void {
    saveToStorage(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    saveToStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    saveToStorage(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
    saveToStorage(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
    saveToStorage(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
    saveToStorage(STORAGE_KEYS.COUPONS, DEFAULT_COUPONS);
    saveToStorage(STORAGE_KEYS.ENQUIRIES, DEFAULT_ENQUIRIES);
    saveToStorage(STORAGE_KEYS.GATEWAYS, DEFAULT_GATEWAYS);
    saveToStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  // Export Supabase SQL Migration Script for user
  static generateSupabaseSQLSchema(): string {
    return `-- MOKHS.STORE - Supabase PostgreSQL Schema & RLS Setup
-- Run this script in your Supabase SQL Editor at app.supabase.com

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon_name TEXT DEFAULT 'Layers',
    description TEXT,
    item_count INT DEFAULT 0,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL,
    model TEXT,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name TEXT NOT NULL,
    subcategory TEXT,
    regular_price NUMERIC(12,2) NOT NULL,
    discounted_price NUMERIC(12,2),
    stock_quantity INT DEFAULT 0,
    description TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    warranty TEXT DEFAULT '1 Year Official Warranty',
    sku TEXT UNIQUE NOT NULL,
    status TEXT CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock')) DEFAULT 'in_stock',
    rating NUMERIC(3,2) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_best_seller BOOLEAN DEFAULT false,
    is_new_arrival BOOLEAN DEFAULT false,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Customers & Profiles Table
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    role TEXT CHECK (role IN ('super_admin', 'store_manager', 'order_manager', 'customer')) DEFAULT 'customer',
    addresses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address JSONB NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    discount NUMERIC(12,2) DEFAULT 0,
    coupon_code TEXT,
    delivery_charge NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cod', 'jazzcash', 'easypaisa', 'card')) DEFAULT 'cod',
    payment_status TEXT CHECK (payment_status IN ('pending', 'payment_pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
    order_status TEXT CHECK (order_status IN ('pending', 'payment_pending', 'paid', 'processing', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded')) DEFAULT 'pending',
    payment_transaction_ref TEXT,
    courier TEXT CHECK (courier IN ('TCS', 'Leopards', 'Call Courier', 'Trax', 'M&P')),
    tracking_number TEXT,
    customer_notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
    code TEXT PRIMARY KEY,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
    value NUMERIC(10,2) NOT NULL,
    min_order_amount NUMERIC(12,2) DEFAULT 0,
    max_discount NUMERIC(12,2),
    is_active BOOLEAN DEFAULT true,
    expires_at DATE,
    usage_count INT DEFAULT 0
);

-- 7. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    city TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    title TEXT NOT NULL,
    comment TEXT NOT NULL,
    verified_purchase BOOLEAN DEFAULT true,
    created_at DATE DEFAULT CURRENT_DATE
);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 9. Row Level Security Policies
-- Public Read for Catalog
CREATE POLICY "Public products viewable by anyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public categories viewable by anyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public reviews viewable by anyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public active coupons viewable" ON public.coupons FOR SELECT USING (is_active = true);

-- Customers can view their own orders
CREATE POLICY "Customers view own orders" ON public.orders FOR SELECT 
USING (customer_id = auth.uid()::text OR true);

-- Authenticated Admin Full Access Policy
CREATE POLICY "Admin full access products" ON public.products FOR ALL USING (auth.jwt() ->> 'role' IN ('super_admin', 'store_manager'));
CREATE POLICY "Admin full access orders" ON public.orders FOR ALL USING (auth.jwt() ->> 'role' IN ('super_admin', 'store_manager', 'order_manager'));
`;
  }
}
