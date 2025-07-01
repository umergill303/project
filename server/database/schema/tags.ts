import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { _id } from './_'

export const tags = sqliteTable('tags', {
  ..._id,
  name: text().default(''),
})

export type Tag = typeof tags.$inferSelect
