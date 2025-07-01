export default defineEventHandler(async event => {
  const { id } = getRouterParams(event)

  const product = await useDb().select().from(tables.products).where(eq(tables.products.id, id)).get()
  if (!product) throw createError({ statusCode: 404, message: 'Product not found' })

  if (product.thumbnail) {
    try {
      const images = JSON.parse(product.thumbnail) as string[]
      if (Array.isArray(images)) {
        await Promise.all(images.map(image => hubBlob().del(image.replace(/^\/+/, ''))))
      }
    }
    catch (err) {
      console.error(`Failed to delete thumbnail from Nuxt Hub: ${err}`)
    }
  }

  if (product.ogImg) {
    await hubBlob().del(product.ogImg.replace(/^\/+/, ''))
  }
  else {
    console.error(`Failed to delete product ogImg from Nuxt Hub`)
  }

  if (product.video) {
    await hubBlob().del(product.video.replace(/^\/+/, ''))
  }
  else {
    console.error(`Failed to delete product video from Nuxt Hub`)
  }

  const deleteProduct = await useDb().delete(tables.products).where(eq(tables.products.id, id)).returning().get()
  await hubKV().del('dashboard:products-analytics')
  return deleteProduct
})
