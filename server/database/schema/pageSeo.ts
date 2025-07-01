import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const pageSeo = sqliteTable('pageSeo', {
  key: text().primaryKey(),
  value: text().notNull(),
})
