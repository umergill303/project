export default defineEventHandler(async event => {
  const db = useDb()
  const { id } = getRouterParams(event)

  const cate = await db.select().from(tables.categories).where(eq(tables.categories.id, Number(id))).get()
  if (!cate) throw createError({ statusCode: 404, message: 'Brand not found' })

  if (cate.logo) {
    await hubBlob().del(cate.logo.replace(/^\/+/, ''))
  }
  else {
    console.error(`Failed to delete cate logo from Nuxt Hub`)
  }

  return await useDb().delete(tables.categories).where(eq(tables.categories.id, Number(id))).returning().get()
})
