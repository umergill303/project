export default defineEventHandler(async () => {
  const db = useDb()

  // Generate visitor data for the last 30 days
  const now = Math.floor(Date.now() / 1000)
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60)
  const visitorData = []

  for (let day = 0; day < 30; day++) {
    const timestamp = thirtyDaysAgo + (day * 24 * 60 * 60)

    // More visitors on weekends
    const dayOfWeek = new Date(timestamp * 1000).getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const count = isWeekend
      ? Math.floor(Math.random() * 200) + 100 // 100-300 on weekends
      : Math.floor(Math.random() * 150) + 50 // 50-200 on weekdays

    visitorData.push({
      timestamp,
      count
    })
  }

  // Insert all visitor records at once
  await db.insert(tables.visitors).values(visitorData)

  return {
    result: 'success',
    message: `Generated ${visitorData.length} days of visitor data`,
    data: visitorData
  }
})
