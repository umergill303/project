import { sqliteTable, int, real, text } from 'drizzle-orm/sqlite-core'
import { variants } from './variants'
import { products } from './products'
import { orders } from './orders'
import { _uuid } from './_'

export const orderProducts = sqliteTable('order_products', {
  ..._uuid,

  order: text('order').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  product: text('product').notNull().references(() => products.id, { onDelete: 'set null' }),
  variant: text('variant').references(() => variants.id, { onDelete: 'set null' }),

  // Denormalized Product Data (Snapshot at time of order)
  // These fields capture the product's state when the order was placed.
  // They should be notNull to ensure completeness of the line item.
  name: text('name').notNull().default(''), // Snapshot of the product's name
  thumbnail: text('thumbnail').notNull().default(''), // Snapshot of the product's thumbnail URL

  // Quantity and Pricing - Ensure notNull for data integrity
  quantity: int('quantity').notNull().default(0),
  salePrice: real('sale_price').notNull().default(0), // Price of this specific product at the time of sale
  purchasePrice: real('purchase_price').notNull().default(0), // Cost of this product
  discount: real('discount').notNull().default(0), // Discount applied to *this line item*
  shippingCost: real('shipping_cost').notNull().default(0), // Shipping cost for *this line item* (if applicable)

  // Return Status
  isReturned: int('is_returned', { mode: 'boolean' }).notNull().default(false),
  returnReason: text('return_reason').default(''), // Only applicable if isReturned is true

})
export const OrderProduct = typeof orderProducts.$inferSelect
// export const NewOrderProduct = typeof orderProducts.$inferInsert
