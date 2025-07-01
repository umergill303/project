export default defineEventHandler(async event => {
  const body = await readBody<{ ids: string [] }>(event)
  return await useDb().delete(tables.returnOrders)
    .where(inArray(tables.returnOrders.id, body.ids)).returning().all()
})
