import type { OfferType } from '#shared/types/offer'

export default defineEventHandler(async event => {
  const offerId = getRouterParam(event, 'id')
  if (!offerId) throw createError({ statusCode: 400, message: 'Offer ID is required' })

  const db = useDb()
  const body = await readBody(event)

  // Check if the offer exists
  const existingOffer = await db.select().from(tables.offers).where(eq(tables.offers.id, offerId)).execute()
  if (!existingOffer.length) throw createError({ statusCode: 404, message: 'Offer not found' })

  // Prepare update fields
  const updateFields: Partial<OfferType> = {}
  if (body.name !== undefined) updateFields.name = body.name
  if (body.discount !== undefined) updateFields.discount = body.discount
  if (body.description !== undefined) updateFields.description = body.description
  if (body.startDate !== undefined) updateFields.startDate = body.startDate
  if (body.endDate !== undefined) updateFields.endDate = body.endDate
  if (body.active !== undefined) updateFields.active = !!body.active

  // Update the offer
  if (Object.keys(updateFields).length > 0) {
    await db.update(tables.offers).set(updateFields).where(eq(tables.offers.id, offerId)).execute()
  }

  // Get associated product IDs
  const existingProducts = await db
    .select({ productId: tables.offerProducts.productId })
    .from(tables.offerProducts).where(eq(tables.offerProducts.offerId, offerId)).execute()

  const productIds = existingProducts.map(p => p.productId)

  // Apply or reset discount depending on active status
  const shouldBeActive = body.active === true || body.active === 1
  const offerDiscount = body.discount ?? existingOffer[0].discount

  if (productIds.length > 0) {
    await db.update(tables.products)
      .set({ discount: shouldBeActive ? offerDiscount : 0 })
      .where(inArray(tables.products.id, productIds)).execute()
  }

  // Insert new products into the offer if provided
  if (Array.isArray(body.productIds) && body.productIds.length > 0) {
    await db.insert(tables.offerProducts).values(
      body.productIds.map((productId: string) => ({ offerId, productId }))
    ).execute()
  }

  return { success: true, message: 'Offer updated successfully' }
})
