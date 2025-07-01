export default defineEventHandler(async () => {
  const db = useDb()
  const kv = hubKV()

  const cacheKey = 'dashboard:visitors-analytics'

  interface VisitorAnalyticsData {
    value: number
    change: string
    chart: { date: string, amount: number }[]
  }

  const cached = await kv.get<VisitorAnalyticsData>(cacheKey)

  if (
    cached
    && typeof cached === 'object'
    && typeof cached.value === 'number'
    && Array.isArray(cached.chart)
  ) {
    return cached
  }

  if (cached) {
    console.warn('[Visitors Analytics] Invalid cached data found. Deleting...')
    await kv.del(cacheKey)
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const startUnix = Math.floor(thirtyDaysAgo.getTime() / 1000)
  const endUnix = Math.floor(now.getTime() / 1000)
  const durationInSeconds = endUnix - startUnix
  const prevStartUnix = startUnix - durationInSeconds
  const prevEndUnix = endUnix - durationInSeconds

  try {
    const [totalVisitors, totalVisitorsPrev] = await Promise.all([
      db.select({ count: sql<number>`SUM(count)` })
        .from(tables.visitors)
        .where(sql`timestamp BETWEEN ${startUnix} AND ${endUnix}`)
        .then(res => res[0]?.count ?? 0),
      db.select({ count: sql<number>`SUM(count)` })
        .from(tables.visitors)
        .where(sql`timestamp BETWEEN ${prevStartUnix} AND ${prevEndUnix}`)
        .then(res => res[0]?.count ?? 0),
    ])

    const diff = totalVisitors - totalVisitorsPrev
    const percent = totalVisitorsPrev === 0 ? 100 : (diff / totalVisitorsPrev) * 100
    const change = `${diff >= 0 ? '' : '-'}${Math.abs(percent).toFixed(1)}%`

    const dailyVisitors = await db
      .select({
        date: sql<string>`date(datetime(timestamp, 'unixepoch'), 'localtime')`.as('date'),
        amount: sql<number>`SUM(count)`.as('amount'),
      })
      .from(tables.visitors)
      .where(sql`timestamp BETWEEN ${startUnix} AND ${endUnix}`)
      .groupBy(sql`date(datetime(timestamp, 'unixepoch'), 'localtime')`)
      .orderBy(sql`date ASC`)

    const chart: { date: string, amount: number }[] = []
    for (let i = 0; i <= 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 86400000)
      const isoDate = date.toISOString().split('T')[0] // YYYY-MM-DD
      const existing = dailyVisitors.find(d => d.date === isoDate)
      chart.push({
        date: date.toISOString(),
        amount: existing?.amount ?? 0,
      })
    }

    const result: VisitorAnalyticsData = {
      value: totalVisitors,
      change,
      chart,
    }

    await kv.set(cacheKey, result, { ttl: 1 })
    return result
  }
  catch (err) {
    console.error('Visitors Analytics error:', err)
    throw createError({ statusCode: 500, message: 'Failed to fetch visitors analytics' })
  }
})
