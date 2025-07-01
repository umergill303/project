export default defineEventHandler(async event => {
  const body = await readBody<{ ids: string[] }>(event)
  return await useDb().delete(tables.users)
    .where(inArray(tables.users.id, body.ids)).returning().all()
})
