export default defineEventHandler(async event => {
  try {
    const db = useDb()
    const { id } = getRouterParams(event)
    const form = await readFormData(event)
    const file = form.get('file') as File
    const data = JSON.parse(form.get('data') as string)

    const slider = await db.select().from(tables.slider).where(eq(tables.slider.id, id)).get()

    let newImage = slider?.image
    if (file && file.size) {
      newImage = (await hubBlob().put(`slider-images/${file.name}`, file)).pathname
      if (slider?.image && slider.image !== newImage) {
        await hubBlob().del(slider.image.replace(/^\/+/, ''))
      }
      else {
        console.error(`Failed to delete old logo from Nuxt Hub`)
      }
    }

    return await db.update(tables.slider)
      .set({ ...data, image: newImage }).where(eq(tables.slider.id, id)).returning().get()
  }
  catch (error) {
    console.log('[Patch Api] Failed to update brand', error)
  }
})
