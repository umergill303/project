import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const about = sqliteTable('about', {
  key: text().primaryKey(),
  value: text().notNull(),
})
