export default defineEventHandler(async event => {
  const query = getQuery(event)
  const page
    = parseInt(Array.isArray(query.page) ? query.page[0] : query.page || '1')
      || 1
  const db = useDb()
  const pageSize = 5

  const products = await db.select().from(tables.products)
    .limit(pageSize).offset((page - 1) * pageSize).all()

  return products
})
