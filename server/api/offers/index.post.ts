export default defineEventHandler(async event => {
  const db = useDb()
  const body = await readBody(event)

  // Insert new offer
  const newOffer = await db.insert(tables.offers).values({
    name: body.name,
    description: body.description || '',
    discount: body.discount,
    active: body.active ?? false,
    startDate: body.startDate,
    endDate: body.endDate,
  }).returning().get()

  // Add associated products if provided
  if (Array.isArray(body.productIds) && body.productIds.length > 0) {
    await db.insert(tables.offerProducts).values(
      body.productIds.map((productId: string) => ({
        offerId: newOffer.id,
        productId,
      }))
    ).execute()

    await db.update(tables.products)
      .set({ discount: body.discount })
      .where(inArray(tables.products.id, body.productIds))
      .execute()
  }

  return { success: true, message: 'Offer created successfully', newOffer }
})
