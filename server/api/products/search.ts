import { between, gte, lte, and, inArray, like, eq, sql } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const query = getQuery(event)

  /* ---------- Pagination ---------- */
  const requestedPage = Math.max(Number(query.page) || 1, 1)
  const limit = Math.max(Number(query.limit) || 12, 1)

  /* ---------- Filters from URL ---------- */
  const search = query.q as string | undefined
  const selectedCategories = typeof query.category === 'string' ? query.category.split(',') : []
  const selectedBrands = typeof query.brand === 'string' ? query.brand.split(',') : []

  const minPrice = query.min != null ? Number(query.min) : null
  const maxPrice = query.max != null ? Number(query.max) : null

  const db = useDb()

  /* ---------- Individual conditions ---------- */
  const searchCondition
    = search ? like(tables.products.name, `%${search}%`) : undefined

  const categoryCondition
    = selectedCategories.length
      ? inArray(tables.products.category, selectedCategories.map(Number))
      : undefined

  const brandCondition
    = selectedBrands.length
      ? inArray(tables.products.brand, selectedBrands.map(Number))
      : undefined

  /* priceCondition: let Drizzle infer the type */
  let priceCondition
  if (minPrice != null && maxPrice != null) {
    priceCondition = between(tables.products.salePrice, minPrice, maxPrice)
  }
  else if (minPrice != null) {
    priceCondition = gte(tables.products.salePrice, minPrice)
  }
  else if (maxPrice != null) {
    priceCondition = lte(tables.products.salePrice, maxPrice)
  }

  /* ---------- Collect non‑undefined conditions ---------- */
  const finalConditions = [
    eq(tables.products.published, true), // Always filter for published: true
    searchCondition,
    categoryCondition,
    brandCondition,
    priceCondition,
  ].filter(Boolean) as (typeof searchCondition)[] // safe cast for Drizzle

  const whereClause = finalConditions.length
    ? and(...finalConditions)
    : undefined

  /* ---------- Total count ---------- */
  const totalCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tables.products)
    .leftJoin(tables.brands, eq(tables.products.brand, tables.brands.id))
    .leftJoin(tables.categories, eq(tables.products.category, tables.categories.id))
    .where(whereClause)
    .then(r => r[0]?.count ?? 0)

  const totalPages = totalCount ? Math.ceil(totalCount / limit) : 1
  const page = Math.min(requestedPage, totalPages)
  const offset = (page - 1) * limit

  /* ---------- Fetch paginated products ---------- */
  const matchingProducts = await db
    .select({
      id: tables.products.id,
      sku: tables.products.sku,
      brandId: tables.products.brand,
      brand: tables.brands.name,
      name: tables.products.name,
      sold: tables.products.sold,
      stock: tables.products.stock,
      thumbnail: tables.products.thumbnail,
      categoryId: tables.products.category,
      category: tables.categories.name,
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
    })
    .from(tables.products)
    .leftJoin(tables.brands, eq(tables.products.brand, tables.brands.id))
    .leftJoin(tables.categories, eq(tables.products.category, tables.categories.id))
    .where(whereClause).limit(limit).offset(offset).all()

  /* ---------- Related brands & categories ---------- */
  const brandIds = [...new Set(matchingProducts.map(p => p.brandId))].filter(Boolean)
  const relatedBrands = brandIds.length
    ? await db
      .select({ id: tables.brands.id, name: tables.brands.name })
      .from(tables.brands).where(inArray(tables.brands.id, brandIds))
    : []

  const categoryIds = [...new Set(matchingProducts.map(p => p.categoryId))].filter(Boolean)
  const relatedCategories = categoryIds.length
    ? await db
      .select({ id: tables.categories.id, name: tables.categories.name })
      .from(tables.categories).where(inArray(tables.categories.id, categoryIds))
    : []

  /* ---------- Response ---------- */
  return {
    success: true,
    products: matchingProducts.map(p => ({
      ...p,
      thumbnail: p.thumbnail ? JSON.parse(p.thumbnail as string) : [],
    })),
    categories: relatedCategories,
    brands: relatedBrands,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages,
    },
  }
})
