export default defineEventHandler(async event => {
  const db = useDb()
  const query = getQuery(event)
  const page = Number(query.page)
  const limit = Number(query.limit)
  const offset = (page - 1) * limit
  const search = query.search ? `%${query.search}%` : null

  let whereClause = undefined
  if (search) {
    const searchClause = or(
      like(tables.users.name, search),
      like(tables.users.email, search),
      like(tables.users.phone, search),
      like(tables.users.country, search),
      like(tables.users.status, search),
      like(tables.users.city, search),
      like(tables.users.street, search),
    )

    whereClause = and(
      searchClause,
      // ne(tables.users.role, 'admin')
      sql`NOT EXISTS (SELECT 1 FROM json_each(${tables.users.roles}) WHERE json_each.value = 'admin')`
    )
  }
  else {
    // whereClause = ne(tables.users.role, 'admin')
    whereClause = sql`NOT EXISTS (SELECT 1 FROM json_each(${tables.users.roles}) WHERE json_each.value = 'admin')`
  }

  const users = await db
    .select().from(tables.users).where(whereClause)
    .orderBy(asc(tables.users.id)).limit(limit).offset(offset)

  const totalUsers = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tables.users).where(whereClause).then(res => res[0]?.count ?? 0)

  const orderStats = await db
    .select({
      userId: tables.orders.user,
      ordersCount: count(tables.orders.id).as('ordersCount'),
      totalPurchase: sql<number>`SUM((products.sale_price - products.discount) * order_products.quantity)`.as('totalPurchase')
    })
    .from(tables.orders)
    .leftJoin(tables.orderProducts, eq(tables.orderProducts.order, tables.orders.id))
    .leftJoin(tables.products, eq(tables.products.id, tables.orderProducts.product))
    .groupBy(tables.orders.user)

  const statsMap = new Map(orderStats.map(stat => [stat.userId, stat]))

  return {
    data: users.map(user => {
      const stat = statsMap.get(user.id)
      return {
        ...user,
        ordersCount: stat?.ordersCount ?? 0,
        totalPurchase: Number(stat?.totalPurchase ?? 0),
      }
    }),
    page,
    limit,
    total: totalUsers,
  }
})
