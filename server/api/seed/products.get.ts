export default defineEventHandler(async () => {
  const db = useDb()
  const allCategories = await db.select().from(tables.categories)
  const allBrands = await db.select().from(tables.brands)
  const allTags = await db.select().from(tables.tags)

  if (!allCategories.length || !allBrands.length || !allTags.length) {
    console.error('Error: Missing required data!')
    return { result: 'failure', message: 'Missing categories, brands, or tags.' }
  }

  const getRandomElement = (list: { id: number }[]): number =>
    list[Math.floor(Math.random() * list.length)].id

  const productNames = [
    'Wireless Earbuds', 'Smartphone Case', 'Bluetooth Speaker',
    'Portable Charger', 'Laptop Stand', 'Gaming Mouse',
    '4K Monitor', 'Mechanical Keyboard', 'Smartwatch', 'LED Desk Lamp'
  ]

  const generateFeatures = (): string => {
    const featureCount = Math.floor(Math.random() * 4) + 2
    const features = []
    const possibleFeatures = [
      'High-quality materials',
      'Durable construction',
      'Ergonomic design',
      'Advanced technology',
      'Energy efficient'
    ]

    while (features.length < featureCount) {
      const randomFeature = possibleFeatures[Math.floor(Math.random() * possibleFeatures.length)]
      if (!features.includes(randomFeature)) {
        features.push(randomFeature)
      }
    }
    return JSON.stringify(features)
  }

  const totalProducts = 50
  const featuredCount = 10
  const featuredIndices = new Set<number>()
  while (featuredIndices.size < featuredCount) {
    featuredIndices.add(Math.floor(Math.random() * totalProducts))
  }

  // Track products with variants
  const productsWithVariants: string[] = []
  const productsWithActiveVariants: string[] = []

  for (let i = 0; i < totalProducts; i++) {
    const productName = productNames[Math.floor(Math.random() * productNames.length)]
    const purchasePrice = Math.floor(Math.random() * 50) + 50
    const salePrice = purchasePrice + Math.floor(Math.random() * 100) + 1

    // Determine if product will have variants (40% chance)
    const hasVariants = Math.random() < 0.4
    // For products with variants, 60% chance to have both active
    const hasActiveVariants = hasVariants && Math.random() < 0.6

    if (hasVariants) {
      productsWithVariants.push(productName)
      if (hasActiveVariants) {
        productsWithActiveVariants.push(productName)
      }
    }

    const product = {
      sku: `SKU-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      name: productName,
      overview: `Premium ${productName} with advanced features`,
      features: generateFeatures(),
      highlights: generateFeatures(),
      thumbnail: '',
      ogImg: '',
      seoTitle: `Buy ${productName} Online`,
      seoDescription: `Best ${productName} with warranty`,
      seoTags: JSON.stringify([getRandomElement(allTags)]),
      category: getRandomElement(allCategories),
      brand: getRandomElement(allBrands),
      tags: JSON.stringify([getRandomElement(allTags)]),
      description: `This ${productName} offers excellent performance and durability.`,
      estimatedDelivery: `${Math.floor(Math.random() * 5) + 1} days`,
      specs: JSON.stringify({
        color: ['Red', 'Blue', 'Black'][Math.floor(Math.random() * 3)],
        weight: `${Math.floor(Math.random() * 500)}g`
      }),
      season: ['Winter', 'Summer', 'All Seasons'][Math.floor(Math.random() * 3)],
      purchasePrice,
      salePrice,
      discount: Math.floor(Math.random() * 20),
      shippingCost: Math.floor(Math.random() * 50),
      maxShippingProducts: 5,
      minShippingProducts: 1,
      freeShipping: Math.random() > 0.5,
      fetched: Math.random() > 0.5,
      featured: featuredIndices.has(i),
      hVariants: hasVariants, // Set if product has variants
      activeVariants: hasActiveVariants, // 60% of variant products will have this true
      sold: Math.floor(Math.random() * 10),
      view: Math.floor(Math.random() * 500),
      stock: Math.floor(Math.random() * 100) + 1,
      likes: Math.floor(Math.random() * 200),
      shares: Math.floor(Math.random() * 50),
      brandWarranty: Math.random() > 0.5,
      sellerWarranty: Math.random() > 0.5,
      brandWrtDuration: Math.random() > 0.5 ? `${Math.floor(Math.random() * 12) + 1} months` : '',
      sellerWrtDuration: Math.random() > 0.5 ? `${Math.floor(Math.random() * 6) + 1} months` : '',
      published: Math.random() < 0.7,
      rating: (Math.random() * 5).toFixed(1),
    }

    await db.insert(tables.products).values(product)
  }

  return {
    result: 'success',
    message: `${totalProducts} products generated (${productsWithVariants.length} with variants, ${productsWithActiveVariants.length} with active variants)`,
    productsWithVariants,
    productsWithActiveVariants
  }
})
