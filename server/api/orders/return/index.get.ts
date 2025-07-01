export default defineEventHandler(async event => {
  const db = useDb()
  const returnOrders = await db.select().from(tables.returnOrders).all()
  return returnOrders
})
