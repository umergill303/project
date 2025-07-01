export default defineEventHandler(async event => {
  const db = useDb()
  const offerId = event.context.params?.offerId
  // const productId = event.context.params?.productId
  const body = await readBody<{ productIds: string[] | string }>(event)

  if (!offerId || !body.productIds) throw createError({ statusCode: 400, statusMessage: 'Offer ID and Product ID are required' })

  const productIds = Array.isArray(body.productIds) ? body.productIds : [body.productIds]

  const deleted = await db.delete(tables.offerProducts).where(
    and(eq(tables.offerProducts.offerId, offerId), inArray(tables.offerProducts.productId, productIds))
  )

  if (deleted.changes === 0) throw createError({ statusCode: 404, statusMessage: 'Product not found in this offer' })

  await db.update(tables.products).set({ discount: 0 }).where(inArray(tables.products.id, productIds)).execute()

  return { success: true, message: 'Product removed from offer successfully' }
})
