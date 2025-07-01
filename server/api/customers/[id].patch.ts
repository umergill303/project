export default defineEventHandler(async event => {
  const { id } = getRouterParams(event)
  const data = await readBody(event)
  return await useDb().update(tables.users).set(data).where(eq(tables.users.id, id)).execute()
})
