export interface Features {
  // --- Authentication ---
  auth?: boolean // @default: false - Enable authentication system

  // --- Core Shopping Experience ---
  cart?: boolean // @default: false - Basic shopping cart functionality
  checkout?: boolean // @default: false - Core checkout process
  guestCheckout?: boolean // @default: false - Allow checkout without account
  paymentGateways?: boolean // @default: false - Payment gateway UI sections (integration requires separate config)

  // --- Product Discovery & Catalog ---
  search?: boolean // @default: false - Basic keyword product search
  productFiltering?: boolean // @default: false - Filter by attributes (price, size, color)
  productSorting?: boolean // @default: false - Sort products (price, name, popularity)
  categories?: boolean // @default: false - Browse by category hierarchy
  productVariants?: boolean // @default: false - Support product variations (size/color)
  productTags?: boolean // @default: false - Alternative product organization
  productComparison?: boolean // @default: false - Side-by-side product comparison
  recommendations?: boolean // @default: false - "Frequently bought together" suggestions
  recommended?: boolean // @default: false - "Frequently bought together" suggestions
  featured?: boolean // @default: false - "Frequently bought together" suggestions

  // --- User Account & Engagement ---
  userAccounts?: boolean // @default: false - User registration/login/profile
  wishlist?: boolean // @default: false - Save products to wishlist
  productReviews?: boolean // @default: false - Customer product reviews
  reviewModeration?: boolean // @default: false - Admin approval for reviews
  savedAddresses?: boolean // @default: false - Multiple saved addresses (requires userAccounts)
  orderHistory?: boolean // @default: false - View past orders (requires userAccounts)

  // --- Marketing & Promotions ---
  discountCodes?: boolean // @default: false - Coupon/discount code system
  promotions?: boolean // @default: false - Sales banners/featured products
  salePrices?: boolean // @default: false - Original/sale price display
  socialSharing?: boolean // @default: false - Share products on social media
  newsletterSubscription?: boolean // @default: false - Email newsletter signup
  giftCards?: boolean // @default: false - Purchase/redeem gift cards
  loyaltyProgram?: boolean // @default: false - Customer rewards points
  affiliateProgram?: boolean // @default: false - Affiliate marketing system

  // --- Order Management ---
  orderTracking?: boolean // @default: false - Order status and tracking
  returnsManagement?: boolean // @default: false - Return merchandise authorization
  orderCancellation?: boolean // @default: false - Order cancellation requests
  orderReturn?: boolean // @default: false - Order return requests
  invoicing?: boolean // @default: false - Downloadable order invoices

  // --- Content & SEO ---
  blog?: boolean // @default: false - Integrated marketing blog
  cmsPages?: boolean // @default: false - Static content pages (About, FAQ)
  seo?: boolean // @default: false - Basic SEO meta tags

  // --- Advanced Features ---
  subscriptions?: boolean // @default: false - Recurring subscription products
  digitalProducts?: boolean // @default: false - Downloadable files/license keys
  inventoryManagement?: boolean // @default: false - Basic stock level tracking
  advancedInventory?: boolean // @default: false - Multi-warehouse inventory
  multiLanguage?: boolean // @default: false - Multi-language storefront
  multiCurrency?: boolean // @default: false - Multiple currency support
  b2bFeatures?: boolean // @default: false - Tiered pricing/quote requests

  // --- Multi-Vendor ---
  vendorDashboard?: boolean // @default: false - Vendor management portal
  vendorProductManagement?: boolean // @default: false - Vendor product control
  vendorOrderManagement?: boolean // @default: false - Vendor order processing
  vendorPayouts?: boolean // @default: false - Commission calculations

}
