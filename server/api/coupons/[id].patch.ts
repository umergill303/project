export default defineEventHandler(async event => {
  const { id } = getRouterParams(event)
  const { patchId, ...data } = await readBody(event)
  return await useDb().update(tables.coupons).set(data).where(eq(tables.coupons.id, id)).returning().all()
})
