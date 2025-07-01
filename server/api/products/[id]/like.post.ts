export default defineEventHandler(async event => {
  const { id } = getRouterParams(event)
  const body = await readBody(event)
  const { increment = true } = body

  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw createError({ statusCode: 400, message: 'Invalid Product ID' })
  }

  try {
    const product = await useDb()
      .select({ likes: tables.products.likes })
      .from(tables.products).where(eq(tables.products.id, id)).get()

    if (!product) {
      throw createError({ statusCode: 404, message: 'Product not found' })
    }

    const currentLikes = product.likes || 0
    const newLikes = increment ? currentLikes + 1 : Math.max(0, currentLikes - 1)

    await useDb().update(tables.products)
      .set({ likes: newLikes }).where(eq(tables.products.id, id)).run()

    return { success: true, likes: newLikes }
  }
  catch (error) {
    console.error('Error updating like count:', error)
  }
})
