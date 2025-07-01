export default defineEventHandler(async () => {
  const db = useDb()
  const now = new Date()
  const lastMonth = new Date(now)
  lastMonth.setMonth(now.getMonth() - 1)

  const lastMonthISO = lastMonth.toISOString()

  const getCount = (status: string | null = null, after?: string) => {
    const whereClause = []
    if (status) whereClause.push(sql`status = ${status}`)
    if (after) whereClause.push(sql`created_at >= ${after}`)

    let query = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(tables.returnOrders)

    if (whereClause.length > 0) {
      query = query.where(sql`${sql.join(whereClause, sql` AND `)}`)
    }

    return query.then(r => r[0]?.count ?? 0)
  }

  const totalReturns = await getCount(null, lastMonthISO)
  const requested = await getCount('requested', lastMonthISO)
  const approved = await getCount('approved', lastMonthISO)
  const rejected = await getCount('rejected', lastMonthISO)

  const prevMonth = new Date(lastMonth)
  prevMonth.setMonth(lastMonth.getMonth() - 1)
  const prevMonthISO = prevMonth.toISOString()

  const prevTotalReturns = await getCount(null, prevMonthISO)
  const prevRequested = await getCount('requested', prevMonthISO)
  const prevApproved = await getCount('approved', prevMonthISO)
  const prevRejected = await getCount('rejected', prevMonthISO)

  const format = (label: string, current: number, previous: number) => {
    const change = previous === 0 ? 100 : ((current - previous) / previous) * 100
    return {
      label,
      value: current.toLocaleString(),
      change: `${change >= 0 ? '' : '-'}${Math.abs(change).toFixed(1)}%`,
      compare: 'vs. last month',
      compareValue: previous.toLocaleString(),
    }
  }

  return [
    format('Return orders', totalReturns, prevTotalReturns),
    format('Requested Orders', requested, prevRequested),
    format('Approved Orders', approved, prevApproved),
    format('Rejected Orders', rejected, prevRejected),
  ]
})
