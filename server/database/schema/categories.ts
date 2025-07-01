import { sqliteTable, text, int } from 'drizzle-orm/sqlite-core'
import { _id } from './_'

export const categories = sqliteTable('categories', {
  ..._id,
  name: text().default(''),
  logo: text().default(''),
  featured: int('featured', { mode: 'boolean' }).default(false),
})

export type Category = typeof categories.$inferSelect
