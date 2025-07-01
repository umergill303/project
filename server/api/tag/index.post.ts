export default defineEventHandler(async event => {
  const data = await readBody(event)
  return await useDb().insert(tables.tags).values(data).returning().all()
})
