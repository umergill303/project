export default defineEventHandler(async () => {
  const db = useDb()
  const kv = hubKV()

  const cacheKey = 'dashboard:index-analytics'
  const cached = await kv.get(cacheKey)

  if (Array.isArray(cached) && cached[0]?.label && cached[0]?.value !== undefined) {
    return cached
  }

  if (cached) {
    console.warn('[Analytics] Invalid cached data found. Deleting...')
    await kv.del(cacheKey)
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 60 * 60 * 24 * 30 * 1000)

  const startUnix = thirtyDaysAgo.getTime()
  const endUnix = now.getTime()
  const durationInSeconds = endUnix - startUnix
  const prevStartUnix = startUnix - durationInSeconds
  const prevEndUnix = endUnix - durationInSeconds

  const days = Math.ceil(durationInSeconds / (60 * 60 * 24))
  const compareLabel
    = days === 1
      ? 'vs. yesterday'
      : days === 7
        ? 'vs. last 7 days'
        : days === 30
          ? 'vs. last month'
          : days >= 365
            ? 'vs. last year'
            : `vs. previous ${days} days`

  try {
    const [totalProducts, totalProductsPrev] = await Promise.all([
      db.select({ count: sql<number>`COUNT(*)` }).from(tables.products),
      db.select({ count: sql<number>`COUNT(*)` }).from(tables.products)
    ])

    const [totalOrders, totalOrdersPrev] = await Promise.all([
      db.select({ count: sql<number>`COUNT(*)` })
        .from(tables.orders)
        .then(res => res[0]?.count ?? 0),
      db.select({ count: sql<number>`COUNT(*)` })
        .from(tables.orders)
        .where(sql`created_at BETWEEN ${prevStartUnix} AND ${prevEndUnix}`)
        .then(res => res[0]?.count ?? 0)
    ])

    const [totalCustomers, totalCustomersPrev] = await Promise.all([
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(tables.users)
        .then(res => res[0]?.count ?? 0),
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(tables.users)
        .where(
          and(
            sql`created_at >= ${prevStartUnix} AND created_at < ${prevEndUnix}`
          )
        )
        .then(res => res[0]?.count ?? 0)
    ])

    const [totalSales, totalSalesPrev] = await Promise.all([
      db.select({ total: sql<number>`SUM(${tables.orders.totalPrice})` })
        .from(tables.orders)
        .where(sql`${tables.orders.status} = 'delivered'`)
        .then(res => res[0]?.total ?? 0),

      db.select({ total: sql<number>`SUM(${tables.orders.totalPrice})` })
        .from(tables.orders)
        .where(sql`${tables.orders.status} = 'delivered' AND created_at BETWEEN ${prevStartUnix} AND ${prevEndUnix}`)
        .then(res => res[0]?.total ?? 0)
    ])

    // const [totalSales, totalSalesPrev] = await Promise.all([
    //   db.select({ total: sql<number>`SUM(${tables.orders.totalPrice})` })
    //     .from(tables.orders)
    //     .then(res => res[0]?.total ?? 0),
    //   db.select({ total: sql<number>`SUM(${tables.orders.totalPrice})` })
    //     .from(tables.orders)
    //     .where(sql`created_at BETWEEN ${prevStartUnix} AND ${prevEndUnix}`)
    //     .then(res => res[0]?.total ?? 0)
    // ])

    function format(label: string, value: number, compareValue: number) {
      const diff = value - compareValue
      const percent = compareValue === 0 ? 100 : (diff / compareValue) * 100
      return {
        label,
        value: value,
        compareValue: compareValue.toLocaleString(),
        change: `${diff >= 0 ? '' : '-'}${Math.abs(percent).toFixed(1)}%`,
        compare: compareLabel
      }
    }

    const analytics = [
      format('Total Sale', totalSales, totalSalesPrev),
      format('Total Product', totalProducts[0].count, totalProductsPrev[0].count),
      format('Total Order', totalOrders, totalOrdersPrev),
      format('Total Customer', totalCustomers, totalCustomersPrev)
    ]

    await kv.set(cacheKey, analytics, { ttl: 60 })
    return analytics
  }
  catch (err) {
    console.error('Analytics error:', err)
    throw createError({ statusCode: 500, message: 'Failed to fetch analytics' })
  }
})
