export default defineEventHandler(async event => {
  const db = useDb()
  const offerId = getRouterParam(event, 'id')
  if (!offerId) throw createError({ statusCode: 400, message: 'Offer ID is required' })

  // Check if the offer exists
  const existingOffer = await db.select().from(tables.offers).where(eq(tables.offers.id, offerId)).execute()
  if (!existingOffer.length) throw createError({ statusCode: 404, message: 'Offer not found' })

  const associatedProducts = await db
    .select({ productId: tables.offerProducts.productId })
    .from(tables.offerProducts).where(eq(tables.offerProducts.offerId, offerId)).execute()

  const productIds = associatedProducts.map(p => p.productId)

  // Reset discount to 0 for all associated products
  if (productIds.length > 0) {
    await db
      .update(tables.products).set({ discount: 0 })
      .where(inArray(tables.products.id, productIds)).execute()
  }

  // Remove all product associations with this offer
  await db
    .delete(tables.offerProducts)
    .where(eq(tables.offerProducts.offerId, offerId)).execute()

  // Delete the offer itself
  await db
    .delete(tables.offers)
    .where(eq(tables.offers.id, offerId)).execute()

  return { success: true, message: 'Offer and its associated products removed successfully' }
})
