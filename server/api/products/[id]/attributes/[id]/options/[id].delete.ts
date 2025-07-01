export default defineEventHandler(async event => {
  const { id } = getRouterParams(event)
  const db = useDb()

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Option ID is required' })
  }

  // 1. Get the option (with attribute id)
  const option = await db.select()
    .from(tables.options)
    .where(eq(tables.options.id, Number(id)))
    .get()

  if (!option) {
    throw createError({ statusCode: 404, statusMessage: 'Variant option not found' })
  }

  const attributeId = option.attribute

  // 2. Get the product ID from the attribute
  const attribute = await db.select()
    .from(tables.attributes)
    .where(eq(tables.attributes.id, attributeId))
    .get()

  if (!attribute) {
    throw createError({ statusCode: 404, statusMessage: 'Attribute not found' })
  }

  const productId = attribute.product
  console.log('Product ID:', productId)

  // 3. Delete associated images from hub blob
  if (option.image) {
    try {
      const images = typeof option.image === 'string' ? JSON.parse(option.image) : option.image
      if (Array.isArray(images)) {
        await Promise.all(images.map(image =>
          hubBlob().del(image.replace(/^\/+/, ''))
        ))
      }
      else if (typeof images === 'string') {
        await hubBlob().del(images.replace(/^\/+/, ''))
      }
    }
    catch (err) {
      console.error(`Failed to delete variant images from Nuxt Hub: ${err}`)
    }
  }

  // 4. Delete the option
  await db.delete(tables.options).where(eq(tables.options.id, Number(id)))

  // 5. Set active = false on variant(s) for the product
  await db.update(tables.products)
    .set({ activeVariants: false })
    .where(eq(tables.products.id, productId))

  return 'success'
})
