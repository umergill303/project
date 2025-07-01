import { sqliteTable, int, text, real } from 'drizzle-orm/sqlite-core'
import { returnOrders } from './returnOrder'
import { products } from './products'
import { variants } from './variants'
import { _uuid } from './_'

export const returnOrderProducts = sqliteTable('return_order_products', {
  ..._uuid,

  return: text()
    .notNull()
    .references(() => returnOrders.id, { onDelete: 'cascade' }),

  product: text()
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),

  variant: text().references(() => variants.id, {
    onDelete: 'set null',
  }),

  quantity: int().default(0),
  salePrice: real('sale_price').default(0),
  discount: int().default(0),
  purchasePrice: real('purchase_price').default(0),
  shippingCost: real('shipping_cost').default(0),
  thumbnail: text().default(''),
  name: text().default(''),

  variantName: text('variant_name').default(''),
  variantColor: text('variant_color').default(''),
  variantImage: text('variant_image').default(''),
  variantOptions: text('variant_options').default(''), // JSON string of all options

})
