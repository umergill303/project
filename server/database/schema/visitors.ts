import { sqliteTable, integer } from 'drizzle-orm/sqlite-core'
import { _id } from './_'

export const visitors = sqliteTable('visitors', {
  ..._id,
  timestamp: integer('timestamp').notNull(),
  count: integer('count').notNull(),
})

// export const visitors = sqliteTable('visitors', {
//   id: integer('id').primaryKey({ autoIncrement: true }),
//   timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
//   count: integer('count').notNull(),
//   updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
// })
