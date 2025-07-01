import { sqliteTable, int, text, real } from 'drizzle-orm/sqlite-core'
import { brands } from './brands'
import { categories } from './categories'
import { _timestamps, _uuid } from './_'

export const products = sqliteTable('products', {
  ..._uuid,
  sku: text('sku').unique(),

  name: text('name').default(''),
  description: text().default(''),
  overview: text().default(''),
  features: text().default(''),
  highlights: text().default(''),

  thumbnail: text().default(''),
  video: text().default(''),

  // Publishing & Status
  published: int('published', { mode: 'boolean' }).default(false), // Is the product visible?
  featured: int('featured', { mode: 'boolean' }).default(false), // Is it a featured product?
  fetched: int('fetched', { mode: 'boolean' }).default(false), // Was data fetched from external source?
  hVariants: int('h_variants', { mode: 'boolean' }).default(false), // Has variants (e.g., size, color)?
  activeVariants: int('active_variants', { mode: 'boolean' }).default(false), // Has variants (e.g., size, color)?

  // SEO Fields - Keep together for easier queries
  seoTitle: text('seo_title').default(''),
  seoDescription: text('seo_description').default(''),
  seoTags: text('seo_tags').default('[]'),
  ogImg: text('og_img').default(''), // Open Graph image

  // Categorization & Relationships
  tags: text('tags').default('[]'),
  brand: int('brand').references(() => brands.id, { onDelete: 'set null' }),
  category: int('category').references(() => categories.id, { onDelete: 'set null' }),

  season: text('season').default(''),

  // Product Specifications & Delivery
  specs: text('specs').default('{}'),
  estimatedDelivery: text('estimated_delivery').default(''), // e.g., "3-5 business days"

  // Pricing & Inventory - Use `real` for monetary values
  salePrice: real('sale_price').default(0),
  purchasePrice: real('purchase_price').default(0),
  discount: real('discount').default(0),
  shippingCost: real('shipping_cost').default(0),

  maxShippingProducts: int('max_shipping_products').default(5),
  minShippingProducts: int('min_shipping_products').default(1),
  freeShipping: int('free_shipping', { mode: 'boolean' }).default(false),

  // Sales & Engagement Metrics
  sold: int('sold').default(0),
  view: int('view').default(0), // Total views
  stock: int('stock').default(0),
  likes: int('likes').default(0),
  shares: int('shares').default(0),
  rating: real('rating').default(0), // Changed to real for fractional ratings (e.g., 4.5)

  // Warranty Information
  brandWarranty: int('brand_warranty', { mode: 'boolean' }).default(false),
  brandWrtDuration: text('brand_wrt_duration').default(''), // e.g., "1 year", "6 months"
  sellerWarranty: int('seller_warranty', { mode: 'boolean' }).default(false),
  sellerWrtDuration: text('seller_wrt_duration').default(''), // e.g., "30 days"

  ..._timestamps
})

export type Product = typeof products.$inferSelect
