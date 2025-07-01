import { sqliteTable, int, text } from 'drizzle-orm/sqlite-core'
import { users } from './users'
import { _timestamps, _uuid } from './_'

export const contacts = sqliteTable('contacts', {
  ..._uuid,
  user: text().references(() => users.id, { onDelete: 'cascade' }),
  unread: int({ mode: 'boolean' }).default(true),
  name: text().default(''),
  email: text().default(''),
  phone: int().notNull(),
  subject: text().default(''),
  message: text().default(''),
  ..._timestamps
})
export type Contact = typeof contacts.$inferSelect
