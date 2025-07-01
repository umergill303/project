export default defineEventHandler(async event => {
  const body = await readBody<{ ids: string[] }>(event)
  if (!body.ids?.length) {
    throw createError({ statusCode: 400, message: 'No product IDs provided' })
  }

  const db = useDb()
  const products = await db.select()
    .from(tables.products).where(inArray(tables.products.id, body.ids)).all()

  for (const product of products) {
    if (product.thumbnail) {
      try {
        const images = JSON.parse(product.thumbnail) as string[]
        if (Array.isArray(images)) {
          await Promise.all(images.map(image =>
            hubBlob().del(image.replace(/^\/+/, ''))
          ))
        }
      }
      catch (err) {
        console.error(`Failed to delete thumbnails for product ${product.id}:`, err)
      }
    }

    if (product.ogImg) {
      try {
        await hubBlob().del(product.ogImg.replace(/^\/+/, ''))
      }
      catch (err) {
        console.error(`Failed to delete ogImg for product ${product.id}:`, err)
      }
    }
  }

  const deleted = await db.delete(tables.products)
    .where(inArray(tables.products.id, body.ids)).returning().all()

  await hubKV().del('dashboard:products-analytics')

  return deleted
})
