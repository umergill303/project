import { sqliteTable, int, real, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { users } from './users'
import { _timestamps, _uuid } from './_'

export const orders = sqliteTable('orders', {
  ..._uuid,
  user: text('user').references(() => users.id, { onDelete: 'cascade' }),

  payment: text().default('Cash On Delivery'), // FIXME: should be changed by paymentMethod

  // Payment details
  paymentMethod: text('payment_method').notNull().default('Cash On Delivery'),
  // Consider a separate `payments` table for complex payment flows (transaction IDs, statuses, etc.)

  // Financial - Use real for monetary values, ensure notNull
  lines: int('lines').notNull().default(0), // Number of distinct items/lines in the order
  salePrice: real('sale_price').notNull().default(0), // Total product sale price
  purchasePrice: real('purchase_price').notNull().default(0), // Total product purchase price (cost)
  discount: real('discount').notNull().default(0), // Total discount applied
  extraPrice: real('extra_price').notNull().default(0), // Any additional charges
  shippingCost: real('shipping_cost').notNull().default(0),
  totalPrice: real('total_price').notNull().default(0), // Final total price of the order

  // Dates and Timestamps
  date: text('date').notNull().default(sql`(datetime('now'))`),

  // Order Status Tracking - Use a single status column, possibly with an enum for valid states
  // FIXME: use status enum as defined below
  status: text('status').notNull().default('Pending'), // Current primary status: Pending, Processing, Shipped, Delivered, Canceled, Rejected, Returned

  // status: text('status')
  //   .$type<'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled' | 'rejected' | 'returned'>()
  //   .notNull()
  //   .default('pending'),

  // FIXME: use options with at
  pending: text().default(''),
  processing: text().default(''),
  shipped: text().default(''),
  delivered: text().default(''),
  canceled: text().default(''),
  rejected: text().default('rejected_at'),
  return: text().default('return'),

  // pendingAt: text('pending_at'), // When the order was first created/pending
  // processingAt: text('processing_at'), // When it moved to processing
  // shippedAt: text('shipped_at'), // When it was shipped
  // deliveredAt: text('delivered_at'), // When it was delivered
  // canceledAt: text('canceled_at'), // When it was canceled
  // rejectedAt: text('rejected_at'), // When it was rejected
  // returnedAt: text('returned_at'), // When it was returned

  Confirmed: int({ mode: 'boolean' }).default(false), // FIXME: why single word capitalized? and should be like isConfirmed
  Paid: int({ mode: 'boolean' }).default(false), // FIXME: why single word capitalized? and should be like isPaid

  // Boolean flags for quick checks
  isConfirmed: int('is_confirmed', { mode: 'boolean' }).notNull().default(false), // Is the order confirmed?
  isPaid: int('is_paid', { mode: 'boolean' }).notNull().default(false), // Is the order paid?

  // Customer Shipping/Billing Information
  name: text('name', { length: 100 }).notNull().default(''), // Increased length, notNull
  phone: text('phone', { length: 50 }).notNull().default(''), // Not null
  email: text('email', { length: 254 }), // Can be null if not provided
  // Consider separating billing/shipping address into an `addresses` table and linking via FKs

  country: text('country').notNull().default('Pakistan'),
  province: text('province').notNull().default(''),
  district: text('district').notNull().default(''),
  city: text('city').notNull().default(''),
  address: text('address', { length: 250 }).notNull().default(''),
  zipCode: text('zip_code', { length: 50 }).default(''), // Can be null if not all countries use it

  location: text('location')
    .$type<'home' | 'office' | 'pick-up'>()
    .notNull().default('home'), // e.g., Home, Office, Pick-up point

  ..._timestamps
})
export type Order = typeof orders.$inferSelect
