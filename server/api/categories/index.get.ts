export default defineEventHandler(async event => {
  const query = getQuery(event)
  const featured = query.featured === 'true'

  const db = useDb()
  const categoriesQuery = db.select().from(tables.categories)

  if (featured) {
    categoriesQuery.where(eq(tables.categories.featured, true))
  }

  return await categoriesQuery.all()
})
