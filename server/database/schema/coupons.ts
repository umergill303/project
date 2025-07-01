import { sqliteTable, text, int } from 'drizzle-orm/sqlite-core'
import { _timestamps, _uuid } from './_'

export const coupons = sqliteTable('coupons', {
  ..._uuid,
  code: text('code').default('').unique(),
  description: text('description').default(''),
  discount: int('discount').default(0),
  minOrderAmount: int('min_order_amount').default(0),
  firstOrderOnly: int('first_order_only', { mode: 'boolean' }).default(false),
  active: int('active', { mode: 'boolean' }).default(false),
  usageLimit: int('usage_limit').default(0),
  usedCount: int('used_count').default(0),
  startDate: text('start_date').default(''),
  endDate: text('end_date').default(''),
  ..._timestamps
})

export type Coupon = typeof coupons.$inferInsert
