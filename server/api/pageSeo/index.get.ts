export default defineEventHandler(async () => {
  const pageSeo = await useDb().select().from(tables.pageSeo)

  return pageSeo.reduce((acc, seo) => {
    acc[seo.key] = seo.value
    return acc
  }, {} as Record<string, string>)
})
