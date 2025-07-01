import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './users'
import { _uuid } from './_'

export const carts = sqliteTable('carts', {
  ..._uuid,
  user: text().references(() => users.id, { onDelete: 'cascade' }),
  guest: text().unique()
})
export const Cart = typeof carts.$inferSelect
// export const NewCart = typeof carts.$inferInsert
