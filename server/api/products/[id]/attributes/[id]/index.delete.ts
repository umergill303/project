export default defineEventHandler(async event => {
  const { id } = getRouterParams(event)
  const db = useDb()

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Attribute ID is required' })
  }

  try {
    // 1. Get the attribute
    const attribute = await db.select()
      .from(tables.attributes).where(eq(tables.attributes.id, Number(id))).get()

    if (!attribute) {
      throw createError({ statusCode: 404, statusMessage: 'Attribute not found' })
    }

    const productId = attribute.product
    console.log('Product ID from attribute:', productId)

    // 2. Get all options for this attribute
    const options = await db.select()
      .from(tables.options).where(eq(tables.options.attribute, Number(id))).all()

    // 3. Delete images for each option
    for (const option of options) {
      if (option.image) {
        try {
          const images = typeof option.image === 'string' ? JSON.parse(option.image) : option.image
          if (Array.isArray(images)) {
            await Promise.all(images.map(img =>
              hubBlob().del(img.replace(/^\/+/, ''))
            ))
          }
          else if (typeof images === 'string') {
            await hubBlob().del(images.replace(/^\/+/, ''))
          }
        }
        catch (err) {
          console.error(`Failed to delete option image from Hub: ${err}`)
        }
      }
    }

    // 4. Delete all options
    await db.delete(tables.options)
      .where(eq(tables.options.attribute, Number(id)))

    // 5. Delete the attribute
    await db.delete(tables.attributes)
      .where(eq(tables.attributes.id, Number(id)))

    // 6. Set activeVariants = false on product
    await db.update(tables.products)
      .set({ activeVariants: false })
      .where(eq(tables.products.id, productId))

    return 'success'
  }
  catch (error) {
    console.error('Error deleting attribute and associated options/images:', error)
    return 'catch block'
  }
})
