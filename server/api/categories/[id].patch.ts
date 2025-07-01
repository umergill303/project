export default defineEventHandler(async event => {
  try {
    const db = useDb()
    const { id } = getRouterParams(event)
    const form = await readFormData(event)
    const file = form.get('file') as File
    const data = JSON.parse(form.get('data') as string)

    const cate = await db.select().from(tables.categories).where(eq(tables.categories.id, Number(id))).get()

    let newLogo = cate?.logo
    if (file && file.size) {
      newLogo = (await hubBlob().put(`categories-logo/${file.name}`, file)).pathname
      if (cate?.logo && cate.logo !== newLogo) {
        await hubBlob().del(cate.logo.replace(/^\/+/, ''))
      }
      else {
        console.error(`Failed to delete old logo from Nuxt Hub`)
      }
    }

    return await db.update(tables.categories)
      .set({ ...data, logo: newLogo }).where(eq(tables.categories.id, Number(id))).returning().get()
  }
  catch (error) {
    console.log('[Patch Api] Failed to update cate', error)
  }
})
