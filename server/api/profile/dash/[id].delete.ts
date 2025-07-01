export default defineEventHandler(async event => {
  const { id } = getRouterParams(event)
  return await useDb().delete(tables.users).where(eq(tables.users.id, id)).returning().get()
})
