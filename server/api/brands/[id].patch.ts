export default defineEventHandler(async event => {
  try {
    const db = useDb()
    const { id } = getRouterParams(event)
    const form = await readFormData(event)
    const file = form.get('file') as File
    const data = JSON.parse(form.get('data') as string)

    const brand = await db.select().from(tables.brands).where(eq(tables.brands.id, Number(id))).get()

    let newLogo = brand?.logo
    if (file && file.size) {
      newLogo = (await hubBlob().put(`brands-logo/${file.name}`, file)).pathname
      if (brand?.logo && brand.logo !== newLogo) {
        await hubBlob().del(brand.logo.replace(/^\/+/, ''))
      }
      else {
        console.error(`Failed to delete old logo from Nuxt Hub`)
      }
    }

    return await db.update(tables.brands)
      .set({ ...data, logo: newLogo }).where(eq(tables.brands.id, Number(id))).returning().get()
  }
  catch (error) {
    console.log('[Patch Api] Failed to update brand', error)
  }
})
