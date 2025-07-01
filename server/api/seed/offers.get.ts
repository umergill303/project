export default defineEventHandler(async () => {
  // Get existing products
  const existingProducts = await useDb().select().from(tables.products).limit(100)
  if (!existingProducts.length) {
    return { error: 'No products found. Create products first.' }
  }

  const fakeOffers = []
  const fakeOfferProducts = []

  // Create 10-15 fake offers
  const offerCount = Math.floor(Math.random() * 6) + 10 // 10-15 offers

  for (let i = 0; i < offerCount; i++) {
    // Random dates (offer lasts 7-30 days)
    const startDate = new Date(Date.now() - Math.floor(Math.random() * 15 * 24 * 60 * 60 * 1000)) // 0-15 days ago
    const endDate = new Date(startDate.getTime() + (7 + Math.floor(Math.random() * 24)) * 24 * 60 * 60 * 1000) // 7-30 days duration

    const offerTypes = [
      'Summer Sale',
      'Winter Clearance',
      'Flash Deal',
      'Weekend Special',
      'Festival Offer',
      'Buy More Save More',
      'Limited Time Discount'
    ]

    const offer = {
      id: uuid4(),
      name: `${offerTypes[Math.floor(Math.random() * offerTypes.length)]} ${Math.floor(Math.random() * 50) + 1}`,
      description: `Special limited time offer. ${['Hurry!', 'Limited stock!', 'While supplies last!'][Math.floor(Math.random() * 3)]}`,
      discount: Math.floor(Math.random() * 30) + 5, // 5-35% discount
      active: Math.random() > 0.3, // 70% active
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }

    await useDb().insert(tables.offers).values(offer)
    fakeOffers.push(offer)

    // Add 3-10 products to this offer
    const productCount = Math.floor(Math.random() * 8) + 3
    const selectedProducts = [...existingProducts]
      .sort(() => 0.5 - Math.random())
      .slice(0, productCount)

    for (const product of selectedProducts) {
      const offerProduct = {
        id: uuid4(),
        offerId: offer.id,
        productId: product.id
      }

      await useDb().insert(tables.offerProducts).values(offerProduct)
      fakeOfferProducts.push(offerProduct)
    }
  }

  return {
    success: true,
    stats: {
      offersCreated: fakeOffers.length,
      offerProductsCreated: fakeOfferProducts.length,
      activeOffers: fakeOffers.filter(o => o.active).length,
      averageDiscount: (fakeOffers.reduce((sum, o) => sum + o.discount, 0) / fakeOffers.length).toFixed(1) + '%'
    },
    sampleOffer: fakeOffers[0],
    sampleOfferProducts: fakeOfferProducts.filter(op => op.offerId === fakeOffers[0].id).slice(0, 3)
  }
})
