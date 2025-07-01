export default defineEventHandler(async event => {
  const body = await readBody<{ ids: string[] }>(event)

  await useDb().update(tables.products)
    .set({ published: true }).where(inArray(tables.products.id, body.ids)).execute()

  await hubKV().del('dashboard:products-analytics')

  return { success: true }
})
