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
        like(tables.returnOrders.id, search),
        // like(tables.returnOrders.payment, search),
        like(tables.returnOrders.status, search)
      )
    }

    const returnOrders = await db
      .select()
      .from(tables.returnOrders)
      .where(whereClause)
      .orderBy(desc(tables.returnOrders.createdAt)) // Sort by newest first
      .limit(limit)
      .offset(offset)

    const total = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(tables.returnOrders)

      .where(whereClause)
      .then(res => res[0]?.count ?? 0)

    return { data: returnOrders, total, page, limit }
  }
  catch (error) {
    console.log('[Orders get.ts Api failed]', error)
  }
})
