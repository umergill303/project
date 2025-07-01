import { sqliteTable, text, int } from 'drizzle-orm/sqlite-core'
import { _id } from './_'

export const brands = sqliteTable('brands', {
  ..._id,
  name: text().default(''),
  logo: text().default(''),
})

export type Brand = typeof brands.$inferSelect
