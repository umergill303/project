import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { products } from './products'
import { offers } from './offers'
import { _timestamps, _uuid } from './_'

export const offerProducts = sqliteTable('offerProducts', {
  ..._uuid,
  offerId: text('offer_id').notNull().references(() => offers.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  ..._timestamps
})
export const OfferProduct = typeof offerProducts.$inferSelect
// export const NewOfferProduct = typeof offerProducts.$inferInsert
