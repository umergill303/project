export default defineEventHandler(async event => {
  try {
    const { id } = getRouterParams(event)

    // if (!id || !validateUuid(id)) {
    //   throw createError({ statusCode: 400, message: 'Invalid UUID' })
    // }

    const db = useDb()
    const relatedProducts = await db
      .select()
      .from(tables.products)
      .where(
        and(
          eq(
            tables.products.category,
            db
              .select({ categoryId: tables.products.category })
              .from(tables.products)
              .where(eq(tables.products.id, id))
          ),
          ne(tables.products.id, id),
          eq(tables.products.published, true) // Add this condition
        )
      )
      .all()

    return relatedProducts.map(product => ({ ...product, thumbnail: product.thumbnail ? JSON.parse(product.thumbnail)[0] || null : null
    }))
    // const data = products.map(product => ({ ...product, thumbnail: product.thumbnail ? JSON.parse(product.thumbnail)[0] || null : null }))
  }
  catch {
    throw createError({ statusCode: 500, message: 'Internal Server Error' })
  }
})
