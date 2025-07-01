export default defineEventHandler(async event => {
  const db = useDb()
  const kv = hubKV()

  const cacheKey = 'dashboard:revenue-analytics'
  const forceRefresh = getQuery(event).refresh === 'true'
  const cached = forceRefresh ? null : await kv.get(cacheKey)

  if (cached && !forceRefresh) {
    return cached
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)

  try {
    const currentData = await db.select({
      date: sql<string>`date(${tables.orders.createdAt}, 'localtime') as date`,
      revenue: sql<number>`SUM(${tables.orders.salePrice} - ${tables.orders.purchasePrice} - ${tables.orders.discount} + ${tables.orders.extraPrice} + ${tables.orders.shippingCost}) as revenue`
    })
      .from(tables.orders)
      .where(
        sql`${tables.orders.status} = 'delivered' AND
        ${tables.orders.createdAt} >= datetime('now', '-30 days', 'localtime') AND 
        ${tables.orders.createdAt} <= datetime('now', 'localtime')`
      )
      .groupBy(sql`date(${tables.orders.createdAt}, 'localtime')`)
      .orderBy(sql`date(${tables.orders.createdAt}, 'localtime')`)

    console.log('Current data:', currentData) // Debug log

    const previousData = await db.select({
      date: sql<string>`date(${tables.orders.createdAt}, 'localtime') as date`,
      revenue: sql<number>`SUM(${tables.orders.salePrice} - ${tables.orders.purchasePrice} - ${tables.orders.discount} + ${tables.orders.extraPrice} + ${tables.orders.shippingCost}) as revenue`
    })
      .from(tables.orders)
      .where(
        sql`${tables.orders.createdAt} >= datetime('now', '-60 days', 'localtime') AND 
          ${tables.orders.createdAt} < datetime('now', '-30 days', 'localtime')`
      )
      .groupBy(sql`date(${tables.orders.createdAt}, 'localtime')`)
      .orderBy(sql`date(${tables.orders.createdAt}, 'localtime')`)

    // Calculate totals
    const currentTotal = currentData.reduce((sum, day) => sum + (day.revenue || 0), 0)
    const previousTotal = previousData.reduce((sum, day) => sum + (day.revenue || 0), 0)

    // Format daily data
    const dailyData = currentData.map(day => ({
      date: day.date,
      amount: day.revenue || 0
    }))

    const change = previousTotal === 0
      ? currentTotal === 0 ? '0%' : '100%'
      : `${((currentTotal - previousTotal) / previousTotal * 100).toFixed(1)}%`

    const result = [{
      label: 'Total Revenue',
      value: currentTotal,
      formattedValue: currentTotal.toLocaleString(),
      compareValue: previousTotal,
      formattedCompareValue: previousTotal.toLocaleString(),
      change: change,
      compare: 'vs. previous period',
      dailyData: dailyData
    }]

    await kv.set(cacheKey, result, { ttl: 5 })
    return result
  }
  catch (err) {
    console.error('Revenue analytics error:', err)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch revenue data'
    })
  }
})
