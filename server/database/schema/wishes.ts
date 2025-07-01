import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './users'
import { products } from './products'
import { variants } from './variants'
import { _uuid } from './_'

export const wishes = sqliteTable('wishes', {
  ..._uuid,
  user: text().references(() => users.id, { onDelete: 'cascade' }),
  product: text().references(() => products.id, {
    onDelete: 'cascade',
  }),
  variant: text().references(() => variants.id, {
    onDelete: 'set null',
  }),
  guest: text()
})
export const Wish = typeof wishes.$inferSelect
// export const NewWish = typeof wishes.$inferInsert
