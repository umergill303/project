import { sqliteTable, int, text } from 'drizzle-orm/sqlite-core'
import { products } from './products'
import { variants } from './variants'
import { _id, _timestamps } from './_'

export const stocks = sqliteTable('stocks', {
  ..._id,

  product: text('product').references(() => products.id, { onDelete: 'cascade' }),
  variant: int('variant').references(() => variants.id, { onDelete: 'cascade' }),
  quantity: int('quantity').notNull().default(0),

  ..._timestamps
})
export const Stock = typeof stocks.$inferSelect
export const NewStock = typeof stocks.$inferInsert
