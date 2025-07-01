export default defineEventHandler(async event => {
  const db = useDb()
  const { id } = getRouterParams(event)

  const brand = await db.select().from(tables.brands).where(eq(tables.brands.id, Number(id))).get()
  if (!brand) throw createError({ statusCode: 404, message: 'Brand not found' })

  if (brand.logo) {
    await hubBlob().del(brand.logo.replace(/^\/+/, ''))
  }
  else {
    console.error(`Failed to delete brand logo from Nuxt Hub`)
  }

  return await useDb().delete(tables.brands).where(eq(tables.brands.id, Number(id))).returning().get()
})
