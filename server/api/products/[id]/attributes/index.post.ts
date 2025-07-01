export default defineEventHandler(async event => {
  const db = useDb()
  const productId = getRouterParam(event, 'id')

  // Validate input
  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required',
    })
  }

  const { name, type = 'button' } = await readBody(event)

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Attribute name is required',
    })
  }

  try {
    // 1. Insert attribute
    await db.insert(tables.attributes).values({
      name,
      attributeType: type,
      product: productId,
    }).execute()

    // 2. Set active = false on all variants of the product
    await db.update(tables.products)
      .set({ activeVariants: false })
      .where(eq(tables.products.id, productId))

    return 'success'
  }
  catch (error) {
    console.error('Error inserting attribute or updating variants:', error)
    return 'catch block'
  }
})
