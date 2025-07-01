import { sql } from 'drizzle-orm'
import { v4 as uuid4 } from 'uuid'
import { int, text } from 'drizzle-orm/sqlite-core'

export const _timestamps = {
  createdAt: text('created_at').default(sql`(STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW'))`),
  updatedAt: text('updated_at')
    .default(sql`(STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW'))`)
    .$onUpdate(() => sql`(STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW'))`),
}

export const _id = {
  id: int('id').primaryKey({ autoIncrement: true }),
}

export const _uuid = {
  id: text().primaryKey().$defaultFn(() => uuid4()),
}
