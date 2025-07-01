export default defineEventHandler(async event => {
  const { id } = getRouterParams(event)
  return await useDb().delete(tables.coupons)
    .where(eq(tables.coupons.id, id)).returning().all()
})
