export default defineEventHandler(async event => {
  try {
    const db = useDb()
    const { id } = getRouterParams(event)
    const form = await readFormData(event)
    const files = form.getAll('files') as File[]
    const data = JSON.parse(form.get('data') as string)

    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Attribute ID is required' })
    }

    // 1. Upload images
    const imageBlob = await Promise.all(
      files.map(async file => {
        ensureBlob(file, { maxSize: '8MB', types: ['image'] })
        return (await hubBlob().put(file.name, file, {
          addRandomSuffix: true,
          prefix: 'product-variant-thumbnails',
        })).pathname
      })
    )

    // 2. Insert the option
    const insertedOption = await db.insert(tables.options)
      .values({ ...data, image: JSON.stringify(imageBlob) })
      .returning()
      .get()

    // 3. Get the attribute record to find product ID
    const attribute = await db.select()
      .from(tables.attributes)
      .where(eq(tables.attributes.id, data.attribute)) // `data.attribute` is assumed to be the FK
      .get()

    if (!attribute) {
      throw createError({ statusCode: 404, statusMessage: 'Attribute not found' })
    }

    const productId = attribute.product
    console.log('Product ID (from attribute):', productId)

    // 4. Set active = false for variants of that product
    await db.update(tables.products)
      .set({ activeVariants: false })
      .where(eq(tables.products.id, productId))

    return insertedOption
  }
  catch (error) {
    console.error('Image upload or DB operation failed:', error)
    return createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})
