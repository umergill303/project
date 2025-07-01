export default defineEventHandler(async event => {
  try {
    const db = useDb()
    const query = getQuery(event)
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const offset = (page - 1) * limit
    const search = query.q ? `%${query.q}%` : null
    const category = query.category
    const featured = query.featured === 'true'

    const conditions = []

    if (query.published === 'true') {
      conditions.push(eq(tables.products.published, true))
    }
    else if (query.published === 'false') {
      conditions.push(eq(tables.products.published, false))
    }

    if (search) {
      conditions.push(
        or(
          like(tables.brands.name, search),
          like(tables.products.name, search),
          like(tables.categories.name, search)
        )
      )
    }

    if (category && category !== 'all') {
      conditions.push(eq(tables.products.category, Number(category)))
    }

    if (featured) {
      conditions.push(eq(tables.products.featured, true))
    }

    const whereClause = conditions.length ? and(...conditions) : undefined

    const productsQuery = db
      .select({
        id: tables.products.id,
        sku: tables.products.sku,
        brand: tables.brands.name,
        name: tables.products.name,
        sold: tables.products.sold,
        stock: tables.products.stock,
        category: tables.categories.name,
        // salePrice: tables.products.salePrice,
        // discount: tables.products.discount,
        salePrice: sql<number>`COALESCE(
          (SELECT MIN(${tables.variants.salePrice})
          FROM ${tables.variants}
          WHERE ${tables.variants.product} = ${tables.products.id}),
          ${tables.products.salePrice}
        )`.as('salePrice'),
        discount: sql<number>`COALESCE(
          (SELECT ${tables.variants.discount}
          FROM ${tables.variants}
          WHERE ${tables.variants.product} = ${tables.products.id}
          ORDER BY ${tables.variants.salePrice} ASC
          LIMIT 1),
          ${tables.products.discount}
        )`.as('discount'),
        thumbnail: tables.products.thumbnail,
        featured: tables.products.featured,
        hVariants: tables.products.hVariants,
        published: tables.products.published,
        createdAt: tables.products.createdAt
      })
      .from(tables.products)
      .leftJoin(tables.brands, eq(tables.products.brand, tables.brands.id))
      .leftJoin(tables.categories, eq(tables.products.category, tables.categories.id))
      .orderBy(asc(tables.products.createdAt))

    if (whereClause) {
      productsQuery.where(whereClause).limit(limit).offset(offset)
    }
    else {
      productsQuery.limit(limit).offset(offset)
    }

    const products = await productsQuery

    const totalProducts = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(tables.products)
      .leftJoin(tables.brands, eq(tables.products.brand, tables.brands.id))
      .leftJoin(tables.categories, eq(tables.products.category, tables.categories.id))
      .where(whereClause)
      .then(res => res[0]?.count ?? 0)

    const data = products.map(product => ({ ...product, thumbnail: product.thumbnail ? JSON.parse(product.thumbnail)[0] || null : null }))

    return { data, total: totalProducts, page, limit }
  }
  catch {
    throw createError({ statusCode: 500, message: 'Internal Server Error' })
  }
})
