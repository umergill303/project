export default defineEventHandler(async event => {
  const data = await readBody(event)
  return await useDb().insert(tables.coupons).values(data).returning().all()
})
