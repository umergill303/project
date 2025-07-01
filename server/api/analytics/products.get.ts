export default defineEventHandler(async event => {
  const db = useDb()
  const kv = hubKV()
  const query = getQuery(event)

  const cacheKey = 'dashboard:products-analytics'
  const forceRefresh = query.forceRefresh === 'true'

  if (!forceRefresh) {
    const cached = await kv.get(cacheKey)
    if (cached) return cached
  }

  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 60 * 60 * 24 * 30 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 60 * 24 * 60 * 1000)

    const startMs = thirtyDaysAgo.getTime()
    const endMs = now.getTime()
    const prevStartMs = sixtyDaysAgo.getTime()
    const prevEndMs = thirtyDaysAgo.getTime()

    const durationInMs = endMs - startMs
    const days = Math.ceil(durationInMs / (1000 * 60 * 60 * 24))

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

    const [totalProducts, totalProductsPrev, lowStock, lowStockPrev,
      draftProducts, draftProductsPrev, publishedProducts, publishedProductsPrev] = await Promise.all([
      db.select({ count: sql<number>`COUNT(*)` })
        .from(tables.products).then(res => res[0]?.count ?? 0),

      db.select({ count: sql<number>`COUNT(*)` })
        .from(tables.products).then(res => res[0]?.count ?? 0),

      db.select({ count: sql<number>`COUNT(*)` })
        .from(tables.products).where(sql`stock < 10`).then(res => res[0]?.count ?? 0),

      db.select({ count: sql<number>`COUNT(*)` })
        .from(tables.products).where(sql`stock < 10`).then(res => res[0]?.count ?? 0),

      db.select({ count: sql<number>`COUNT(*)` })
        .from(tables.products).where(sql`published = false`).then(res => res[0]?.count ?? 0),

      db.select({ count: sql<number>`COUNT(*)` })
        .from(tables.products).where(sql`published = false`).then(res => res[0]?.count ?? 0),

      db.select({ count: sql<number>`COUNT(*)` })
        .from(tables.products).where(sql`published = true`).then(res => res[0]?.count ?? 0),

      db.select({ count: sql<number>`COUNT(*)` })
        .from(tables.products).where(sql`published = true`).then(res => res[0]?.count ?? 0),

      db.select({ count: sql<number>`COUNT(*)` }).from(tables.products)
        .where(sql`created_at >= ${startMs} AND created_at < ${endMs}`).then(res => res[0]?.count ?? 0),

      db.select({ count: sql<number>`COUNT(*)` }).from(tables.products)
        .where(sql`created_at >= ${prevStartMs} AND created_at < ${prevEndMs}`).then(res => res[0]?.count ?? 0)
    ])

    function format(label: string, value: number, compareValue: number) {
      const diff = value - compareValue
      const percentNum = compareValue === 0 ? 100 : (diff / compareValue) * 100
      return {
        label,
        value: value.toLocaleString(),
        compareValue: compareValue.toLocaleString(),
        change: `${diff >= 0 ? '' : '-'}${Math.abs(percentNum).toFixed(1)}%`,
        compare: compareLabel
      }
    }

    const result = [
      format('Total Products', totalProducts, totalProductsPrev),
      format('Low Stock Items', lowStock, lowStockPrev),
      format('Draft', draftProducts, draftProductsPrev),
      format('Published', publishedProducts, publishedProductsPrev),
    ]

    await kv.set(cacheKey, result, { ttl: 10 })
    return result
  }
  catch (err) {
    console.error('Product analytics error:', err)
    throw createError({ statusCode: 500, message: 'Failed to fetch product analytics' })
  }
})
