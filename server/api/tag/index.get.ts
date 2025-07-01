export default defineEventHandler(async () => {
  return await useDb().select().from(tables.tags).all()
})
