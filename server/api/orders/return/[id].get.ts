export default defineEventHandler(async event => {
  const db = useDb()
  const { id } = getRouterParams(event)
  const returnOrder = await db.select().from(tables.returnOrders).where(and(eq(tables.returnOrders.order, id))).all()
  return returnOrder
})
