import { sqliteTable, text, int } from 'drizzle-orm/sqlite-core'
import { products } from './products'
import { categories } from './categories'
import { _timestamps, _uuid } from './_'

export const slider = sqliteTable('slider', {
  ..._uuid,
  label: text('label').notNull().default(''),
  image: text('image').notNull().default(''),
  layout: text('layout').default(''),
  buttonText: text('button_text').default(''),
  description: text('description').default(''),
  buttonColor: text('button_color').default('neutral'),
  category: int('category').references(() => categories.id, { onDelete: 'cascade' }),
  product: text('product').references(() => products.id, { onDelete: 'cascade' }),
  ..._timestamps
})

export type Slider = typeof slider.$inferInsert
