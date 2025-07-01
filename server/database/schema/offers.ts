import { sqliteTable, int, text } from 'drizzle-orm/sqlite-core'
import { _timestamps, _uuid } from './_'

export const offers = sqliteTable('offers', {
  ..._uuid,
  name: text('name').default(''),
  description: text('description').default(''),
  discount: int('discount').notNull(),
  active: int({ mode: 'boolean' }).default(false),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  ..._timestamps
})

export const Offer = offers.$inferSelect
