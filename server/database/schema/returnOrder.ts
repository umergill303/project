import { sqliteTable, text, int } from 'drizzle-orm/sqlite-core'
import { orders } from './orders'
import { _timestamps, _uuid } from './_'

export const returnOrders = sqliteTable('return_orders', {
  ..._uuid,

  order: text('order')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),

  name: text('name').notNull().default(''),
  email: text('email').notNull(),
  phone: text('phone').notNull().default(''),

  country: text('country').notNull().default(''),
  city: text('city').notNull().default(''),
  street: text('street').notNull().default(''),
  postalCode: text('postal_Code').notNull().default(''),

  reason: text('reason').notNull().default(''),
  method: text('method').default(''),

  status: text('status')
    .$type<'requested' | 'approved' | 'processing' | 'shipped' | 'received' | 'refunded' | 'rejected'>()
    .notNull()
    .default('requested'),

  // Flag for completion
  // isProcessed: int('is_processed', { mode: 'boolean' }).notNull().default(false), // Indicates if the return process is complete (e.g., refunded, exchanged, rejected)

  // isReturned: int({ mode: 'boolean' }).default(false),

  notes: text('notes').default(''),
  ..._timestamps
})
