type Offer = {
  id?: string
  name?: string | null
  active?: boolean | null
  endDate?: string
  description?: string | null
  discount: number
  startDate: string
  products: Array<{
    id: string
    sku: string
    name: string
    sold: number
    brand: string
    category: string
    discount: number
    salePrice: number
    thumbnail: string
  }>
}

export default defineEventHandler(async event => {
  const db = useDb()
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const offset = (page - 1) * limit
  const { id } = getRouterParams(event)
  const search = query.search ? `%${query.search}%` : null

  // Base query for offer information
  const offer = await db.select().from(tables.offers).where(eq(tables.offers.id, id)).get()
  if (!offer) throw createError({ statusCode: 404, statusMessage: 'Offer not found' })

  // Query for products with optional search
  let productsQuery = db
    .select({
      id: tables.products.id,
      sku: tables.products.sku,
      name: tables.products.name,
      sold: tables.products.sold,
      brand: tables.brands.name,
      category: tables.categories.name,
      discount: tables.products.discount,
      salePrice: tables.products.salePrice,
      thumbnail: tables.products.thumbnail,
    })
    .from(tables.offerProducts)
    .innerJoin(tables.products, eq(tables.offerProducts.productId, tables.products.id))
    .leftJoin(tables.brands, eq(tables.brands.id, tables.products.brand))
    .leftJoin(tables.categories, eq(tables.categories.id, tables.products.category))
    .where(eq(tables.offerProducts.offerId, id))

  if (search) {
    productsQuery = productsQuery.where(
      or(
        like(tables.products.id, search),
        like(tables.brands.name, search),
        like(tables.products.name, search),
        like(tables.categories.name, search)
      )
    )
  }

  const products = await productsQuery.limit(limit).offset(offset).all()

  // Format thumbnails for all products at once
  const formattedProducts = products.map(product => ({
    ...product,
    thumbnail: product.thumbnail ? JSON.parse(product.thumbnail) : []
  }))

  // Get total count (for pagination)
  const totalCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tables.offerProducts)
    .innerJoin(tables.products, eq(tables.offerProducts.productId, tables.products.id))
    .leftJoin(tables.brands, eq(tables.brands.id, tables.products.brand))
    .leftJoin(tables.categories, eq(tables.categories.id, tables.products.category))
    .where(eq(tables.offerProducts.offerId, id))
    .then(res => res[0]?.count ?? 0)

  const offerData: Offer = {
    id: offer.id,
    name: offer.name,
    active: offer.active,
    endDate: offer.endDate,
    description: offer.description,
    discount: offer.discount,
    startDate: offer.startDate,
    products: formattedProducts.map(item => ({
      id: item.id ?? '',
      sku: item.sku ?? '',
      sold: item.sold ?? 0,
      name: item.name ?? '',
      brand: item.brand ?? '',
      category: item.category ?? '',
      discount: item.discount ?? 0,
      salePrice: item.salePrice ?? 1,
      thumbnail: item.thumbnail ?? '',
    })),
  }

  return { offer: offerData, totalOfferProducts: totalCount, page, limit }
})
