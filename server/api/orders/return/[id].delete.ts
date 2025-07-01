export default defineEventHandler(async event => {
  const { id } = getRouterParams(event)
  return await useDb().delete(tables.returnOrders)
    .where(eq(tables.returnOrders.id, id)).returning().get()
})
