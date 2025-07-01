import { sqliteTable, int, text } from 'drizzle-orm/sqlite-core'
import { carts } from './carts'
import { products } from './products'
import { variants } from './variants'
import { _uuid } from './_'

export const cartProducts = sqliteTable('cart_product', {
  ..._uuid,
  cart: text().references(() => carts.id, { onDelete: 'cascade' }),
  product: text().references(() => products.id, {
    onDelete: 'cascade',
  }),
  qty: int().notNull().default(10),
  variant: int().references(() => variants.id, {
    onDelete: 'set null',
  }),
  done: int({ mode: 'boolean' }).default(false),
})
export const CartProduct = typeof cartProducts.$inferSelect
// export const NewCartProduct = typeof cartProducts.$inferInsert
