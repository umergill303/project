export default defineEventHandler(async event => {
  const { id } = getRouterParams(event)
  const { tagId, ...data } = await readBody(event)
  return await useDb().update(tables.tags).set(data).where(eq(tables.tags.id, Number(id))).returning().all()
})
