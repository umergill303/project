import type { Features } from './types'

export const features: Features = {
  auth: false,

  // --- Core Shopping Experience ---
  cart: false, // Essential: Basic shopping cart functionality
  checkout: false, // Essential: Core checkout process
  guestCheckout: false, // Allow users to checkout without creating an account
  paymentGateways: false, // Note: Actual payment integration is complex config
  // quickCheckout: false, // One-click checkout for returning customers
  // cartSharing: false, // Share cart via link/email functionality
  // giftWrapping: false, // Offer gift wrapping service at checkout

  // --- Product Discovery & Catalog ---
  search: false, // Basic keyword search for products
  productFiltering: false, // Filter products by attributes
  productSorting: false, // Allow sorting product lists
  categories: false, // Ability to browse products by category trees/pages
  productVariants: false, // Support for products with variations
  productTags: false, // Tagging products for alternative organization
  productComparison: false, // Compare products side-by-side
  recommendations: false, // Show related products
  recommended: false, // Show recommended products
  featured: false, // Show featured products
  // productBadges: false, // Display "New", "Bestseller" etc. labels
  // stockNotifications: false, // Notify when out-of-stock items return
  // bundles: false, // Sell product bundles/kits together

  // --- User Account & Engagement ---
  userAccounts: false, // User registration, login, profile management
  wishlist: false, // Users can save products to a wishlist
  productReviews: false, // Allow users to leave reviews
  reviewModeration: false, // Admin approval for reviews
  savedAddresses: false, // Save multiple shipping addresses
  orderHistory: false, // View past orders
  // loyaltyTiers: false, // VIP/reward tiers system
  // sizeRecommendation: false, // AI-powered size suggestions
  // accountActivity: false, // View login history/security events

  // --- Marketing & Promotions ---
  discountCodes: false, // Coupon/discount codes
  promotions: false, // Feature products/sales banners
  salePrices: false, // Show original/sale price
  socialSharing: false, // Share products on social media
  newsletterSubscription: false, // Newsletter signup
  giftCards: false, // Purchase/redeem gift cards
  loyaltyProgram: false, // Points system
  affiliateProgram: false, // Affiliate marketing
  // abandonedCart: false, // Email reminders for abandoned carts
  // flashSales: false, // Time-limited discount events
  // referralProgram: false, // Customer referral incentives

  // --- Order Management (User-Facing) ---
  orderTracking: false, // View order status/tracking
  returnsManagement: false, // Initiate return requests
  orderCancellation: false, // Request order cancellation
  orderReturn: false, // Request order return
  invoicing: false, // Download order invoices
  // deliverySlots: false, // Choose specific delivery windows
  // partialReturns: false, // Return individual order items
  // orderComments: false, // Add special instructions to orders

  // --- Content & SEO ---
  blog: false, // Integrated blog functionality
  cmsPages: false, // Create static pages
  seo: false, // Basic SEO meta tags
  // schemaMarkup: false, // Rich product snippets for SEO
  // blogComments: false, // User comments on blog posts
  // helpCenter: false, // FAQ/knowledge base system

  // --- Advanced & Niche Features ---
  subscriptions: false, // Recurring subscription products
  digitalProducts: false, // Downloadable files/keys
  inventoryManagement: false, // Basic stock tracking
  advancedInventory: false, // Multi-warehouse inventory
  multiLanguage: false, // Multiple language support
  multiCurrency: false, // Multiple currency support
  b2bFeatures: false, // Business-to-business features
  // arPreview: false, // AR product visualization
  // productConfigurator: false, // Custom product builder
  // localPickup: false, // In-store pickup option

  // --- Multi-Vendor Specific ---
  vendorDashboard: false, // Seller management portal
  vendorProductManagement: false, // Vendor product control
  vendorOrderManagement: false, // Vendor order processing
  vendorPayouts: false, // Commission calculations
  // vendorVerification: false, // KYC for marketplace sellers
  // vendorReviews: false, // Rate and review sellers
  // multiVendorCart: false, // Cart with items from multiple vendors

  // --- Analytics & Reporting ---
  // basicAnalytics: false, // Sales/conversion reports
  // customerInsights: false, // Purchase behavior analysis
  // exportReports: false, // Export data to CSV/Excel
  // productPerformance: false, // Track views/conversions

  // --- Mobile Experience ---
  // pwa: false, // Progressive Web App features
  // appBanners: false, // Promote native app install
  // mobileOptimized: false, // Enhanced mobile experience

  // --- Accessibility ---
  // highContrast: false, // Accessibility mode toggle
  // screenReaderOpt: false, // Enhanced screen reader support
}
