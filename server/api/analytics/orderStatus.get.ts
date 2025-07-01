export default defineEventHandler(async () => {
  const kv = hubKV()

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'canceled', 'returned']
  const statusCounts: Record<string, number> = {}

  for (const status of statuses) {
    const [result] = await useDb()
      .select({ count: sql<number>`count(*)`.as('count') })
      .from(tables.orders)
      .where(eq(tables.orders.status, status))

    statusCounts[status] = result?.count ?? 0
  }

  await kv.set('dashboard:order-status', statusCounts)
  return statusCounts
})
