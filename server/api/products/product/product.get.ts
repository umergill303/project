export default defineEventHandler(async event => {
  const query = getQuery(event)
  // Ensure we have a valid array of IDs
  const ids = query.ids ? (Array.isArray(query.ids) ? query.ids : [query.ids]) : []

  if (!ids || ids.length === 0) {
    throw createError({ statusCode: 400, message: 'No product IDs provided' })
  }

  try {
    // Convert all IDs to strings for consistent comparison
    const stringIds = ids.map(id => String(id))

    const products = await useDb()
      .select({
        id: tables.products.id,
        name: tables.products.name,
        salePrice: tables.products.salePrice,
        stock: tables.products.stock,
        freeShipping: tables.products.freeShipping,
        shippingCost: tables.products.shippingCost,
        purchasePrice: tables.products.purchasePrice,
        discount: tables.products.discount,
        categoryId: tables.products.category,
        category: tables.categories.name,
        brandId: tables.products.brand,
        brand: tables.brands.name,
        brandLogo: tables.brands.logo,
        tagId: tables.products.tags,
        tag: tables.tags.name,
        description: tables.products.description,
        overview: tables.products.overview,
        season: tables.products.season,
        specs: tables.products.specs,
        features: tables.products.features,
        brandWrtDuration: tables.products.brandWrtDuration,
        sellerWrtDuration: tables.products.sellerWrtDuration,
        sellerWarranty: tables.products.sellerWarranty,
        sku: tables.products.sku,
        brandWarranty: tables.products.brandWarranty,
        thumbnail: tables.products.thumbnail,
        minShippingProducts: tables.products.minShippingProducts,
        maxShippingProducts: tables.products.maxShippingProducts,
      })
      .from(tables.products)
      .leftJoin(tables.categories, eq(tables.products.category, tables.categories.id))
      .leftJoin(tables.brands, eq(tables.products.brand, tables.brands.id))
      .leftJoin(tables.tags, eq(tables.products.tags, tables.tags.id))
      .where(inArray(tables.products.id, stringIds))
      .all()

    if (!products || products.length === 0) {
      return [] // Return empty list instead of error
    }

    // Map the products to ensure all required fields are present
    const formattedProducts = products.map(product => {
      const formatted = { ...product, thumbnail: product.thumbnail ? JSON.parse(product.thumbnail) : [] }
      const stock = formatted.stock || 0
      return {
        ...formatted,
        salePrice: formatted.salePrice || 0,
        discount: formatted.discount || 0,
        stock: stock,
        minShippingProducts: formatted.minShippingProducts || 1,
        maxShippingProducts: Math.min(formatted.maxShippingProducts || 10, stock),
        shippingCost: formatted.shippingCost || 0
      }
    })

    return formattedProducts
  }
  catch (error) {
    console.error('Error fetching products:', error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Internal Server Error'
    })
  }
})
