export default defineEventHandler(async event => {
  const { id } = getRouterParams(event)

  const deleteOrder = await useDb().delete(tables.orders)
    .where(eq(tables.orders.id, id)).returning().get()

  await hubKV().del('dashboard:orders-analytics')

  return deleteOrder
})
