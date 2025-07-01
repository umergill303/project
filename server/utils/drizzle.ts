import { drizzle } from 'drizzle-orm/d1'

import * as schema from '../database/schema'

export { sql, eq, ne, and, or, like, asc, count, inArray, lt, lte, gt, gte, not } from 'drizzle-orm'

export { sqliteTable, int, real, text } from 'drizzle-orm/sqlite-core'
export { v4 as uuid4 } from 'uuid'

export const tables = schema
export const useDb = () => drizzle(hubDatabase(), { schema })
