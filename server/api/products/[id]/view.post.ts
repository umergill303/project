export default defineEventHandler(async event => {
  const { id } = getRouterParams(event)

  // Validate product ID
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw createError({ statusCode: 400, message: 'Invalid Product ID' })
  }

  try {
    // Get current view count
    const product = await useDb()
      .select({ view: tables.products.view })
      .from(tables.products).where(eq(tables.products.id, id)).get()

    if (!product) { throw createError({ statusCode: 404, message: 'Product not found' }) }

    // Increment view count
    const newViewCount = (product.view || 0) + 1

    await useDb().update(tables.products)
      .set({ view: newViewCount }).where(eq(tables.products.id, id)).run()

    return { success: true, views: newViewCount }
  }
  catch (error) {
    console.error('Error updating view count:', error)
  }
})
