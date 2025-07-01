export default defineEventHandler(async event => {
  const { id } = getRouterParams(event)
  return await useDb().delete(tables.tags).where(eq(tables.tags.id, Number(id))).returning().all()
})
