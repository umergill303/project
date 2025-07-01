export default defineEventHandler(async () => {
  const db = useDb()

  // Helper functions
  const randomPrice = (min: number, max: number) => Number((Math.random() * (max - min) + min).toFixed(2))
  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
  const randomBool = (probability = 0.7) => Math.random() < probability // Default 70% chance of true

  const generateSKU = (productId: string, index: number) => {
    if (!productId) throw new Error('Product ID is required')
    const base = productId.slice(0, 4).toUpperCase()
    return `VAR-${base}-${String(index + 1).padStart(3, '0')}`
  }

  // Convert date to ISO string for D1 compatibility
  const toD1Date = (date: Date) => date.toISOString()

  // Enhanced attribute/option generation
  const generateAttributesAndOptions = async (productId: string) => {
    const attributeTypes = Object.values(AttributeType)
    const now = new Date()
    const nowISO = toD1Date(now)

    // Define all possible attribute configurations
    const attributeConfigs = [
      {
        name: 'Size',
        type: AttributeType.Button,
        options: ['XS', 'S', 'M', 'L', 'XL'].map(name => ({
          name,
          hint: '',
          color: '',
        }))
      },
      {
        name: 'Color',
        type: AttributeType.Color,
        options: [
          { name: 'Red', color: '#FF0000' },
          { name: 'Blue', color: '#0000FF' },
          { name: 'Green', color: '#00FF00' },
          { name: 'Black', color: '#000000' },
          { name: 'White', color: '#FFFFFF' },
          { name: 'Yellow', color: '#FFFF00' },
          { name: 'Purple', color: '#800080' },
          { name: 'Pink', color: '#FFC0CB' },
        ]
      },
      {
        name: 'Material',
        type: AttributeType.Select,
        options: [
          { name: 'Cotton', color: '', hint: '100% Cotton' },
          { name: 'Polyester', color: '', hint: 'Durable Polyester' },
          { name: 'Wool', color: '', hint: 'Premium Wool' }
        ]
      }
    ]

    // Select 1-2 random attributes
    const selectedAttributes = attributeConfigs
      .sort(() => Math.random() - 0.5)
      .slice(0, randomInt(1, 2))

    // Insert attributes
    const insertedAttributes = await db.insert(tables.attributes)
      .values(selectedAttributes.map((attr, idx) => ({
        name: attr.name,
        order: idx,
        product: productId,
        attributeType: attr.type,
      })))
      .returning({ id: tables.attributes.id, name: tables.attributes.name })

    // Insert options for each attribute
    for (const attr of insertedAttributes) {
      const config = selectedAttributes.find(a => a.name === attr.name)
      if (!config) continue

      await db.insert(tables.options).values(
        config.options.map((opt, idx) => ({
          attribute: attr.id,
          name: opt.name,
          color: opt.color,
          hint: opt.hint,
          order: idx,
        }))
      )
    }

    return insertedAttributes
  }

  // Get all products that could have variants
  const allProducts = await db.query.products.findMany({
    where: (product, { eq }) => eq(product.hVariants, true),
    columns: {
      id: true,
      name: true,
      purchasePrice: true,
      salePrice: true
    },
  })

  if (!allProducts.length) {
    return { result: 'success', message: 'No products needing variants found' }
  }

  // Select 80% of products randomly
  const selectedCount = Math.ceil(allProducts.length * 0.8)
  const products = allProducts
    .sort(() => Math.random() - 0.5)
    .slice(0, selectedCount)

  let totalVariants = 0
  let activeVariants = 0
  let inactiveVariants = 0

  for (const product of products) {
    try {
      // Skip if variants exist
      const existing = await db.select()
        .from(tables.variants)
        .where(eq(tables.variants.product, product.id))
        .limit(1)

      if (existing.length) continue

      // Get or create attributes
      let attributes = await db.query.attributes.findMany({
        where: (attr, { eq }) => eq(attr.product, product.id),
        with: { options: true },
      })

      if (!attributes.length || attributes.every(a => !a.options.length)) {
        await generateAttributesAndOptions(product.id)
        attributes = await db.query.attributes.findMany({
          where: (attr, { eq }) => eq(attr.product, product.id),
          with: { options: true },
        })
      }

      // Generate all possible combinations
      const optionGroups = attributes
        .map(attr => attr.options)
        .filter(group => group.length > 0)

      if (!optionGroups.length) continue

      // Generate cartesian product of all options
      const combinations = optionGroups.reduce((acc, group) =>
        acc.flatMap(combo =>
          group.map(option => [...combo, option])
        ), [[]] as any[][]).filter(arr => arr.length)

      // Create variants
      const now = new Date()
      const nowISO = toD1Date(now)

      for (const [index, combo] of combinations.entries()) {
        try {
          const basePrice = product.purchasePrice || randomPrice(10, 100)
          const purchasePrice = randomPrice(basePrice * 0.8, basePrice * 1.2)
          const salePrice = randomPrice(purchasePrice * 1.1, purchasePrice * 1.8)

          // Make some variants inactive (30% chance)
          const isActive = randomBool(0.7)
          if (isActive) {
            activeVariants++
          }
          else {
            inactiveVariants++
          }

          const [variant] = await db.insert(tables.variants)
            .values({
              product: product.id,
              purchasePrice,
              salePrice,
              discount: randomInt(0, 30),
              stock: randomInt(0, 100),
              sku: generateSKU(product.id, index),
              order: index,
              active: isActive,
            })
            .returning({ id: tables.variants.id })

          await db.insert(tables.variantOptions)
            .values(combo.map(opt => ({
              variant: variant.id,
              option: opt.id,
            })))

          totalVariants++
        }
        catch (error) {
          console.error(`Variant creation error for ${product.name}:`, error)
        }
      }
    }
    catch (error) {
      console.error(`Product processing error for ${product.name}:`, error)
    }
  }

  return {
    result: 'success',
    message: `Created ${totalVariants} variants (${activeVariants} active, ${inactiveVariants} inactive) for ${products.length} of ${allProducts.length} products`,
    stats: {
      totalProducts: allProducts.length,
      processedProducts: products.length,
      totalVariants,
      activeVariants,
      inactiveVariants
    }
  }
})
