import { desc } from 'drizzle-orm' // Adjust the import path if needed

export default defineEventHandler(async event => {
  try {
    const query = getQuery(event)
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const offset = (page - 1) * limit
    const search = query.search ? `%${query.search}%` : null

    const db = useDb()
    let whereClause = undefined

    if (search) {
      whereClause = or(
        like(tables.orders.id, search),
        like(tables.orders.payment, search),
        like(tables.orders.status, search)
      )
    }

    const orders = await db.select().from(tables.orders)
      .where(whereClause).orderBy(desc(tables.orders.createdAt)).limit(limit).offset(offset)

    const total = await db.select({ count: sql<number>`COUNT(*)` })
      .from(tables.orders).where(whereClause).then(res => res[0]?.count ?? 0)

    return { data: orders, total, page, limit }
  }
  catch (error) {
    console.log('[Orders get.ts Api failed]', error)
  }
})
