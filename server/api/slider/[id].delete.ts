export default defineEventHandler(async event => {
  const db = useDb()
  const { id } = getRouterParams(event)

  const slider = await db.select().from(tables.slider).where(eq(tables.slider.id, id)).get()

  if (slider?.image) {
    await hubBlob().delete(slider.image.replace(/^\/+/, ''))
  }
  else {
    console.error(`Failed to delete slider image from Nuxt Hub`)
  }

  return await db.delete(tables.slider).where(eq(tables.slider.id, id)).execute()
})
