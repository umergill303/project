export default defineEventHandler(async () => {
  const db = useDb()
  const products = await db.select().from(tables.products)
    .where(and(eq(tables.products.featured, true), eq(tables.products.published, true))).orderBy(sql`RANDOM()`).limit(8).all()

  // FIXME:
  const data = products.map(product => ({ ...product, thumbnail: product.thumbnail ? JSON.parse(product.thumbnail) : [] }))
  return data
})
