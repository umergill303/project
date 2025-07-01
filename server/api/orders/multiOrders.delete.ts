export default defineEventHandler(async event => {
  const body = await readBody<{ ids: string [] }>(event)

  await useDb().delete(tables.orders)
    .where(inArray(tables.orders.id, body.ids)).returning().all()

  await hubKV().del('dashboard:orders-analytics')

  return { success: true }
})
