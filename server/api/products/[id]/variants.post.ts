export default defineEventHandler(async event => {
  const db = useDb()
  const productId = getRouterParam(event, 'id')
  const body = await readBody(event)

  // Validate input
  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required',
    })
  }

  const { attributes: attributesData, variants: variantsData } = body

  if (!attributesData || !variantsData) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing attributes or variants data',
    })
  }

  if (!Array.isArray(attributesData)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Attributes must be an array',
    })
  }

  if (!Array.isArray(variantsData)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Variants must be an array',
    })
  }

  try {
    const createdVariants = []
    const optionIdMap = new Map()

    // 1. Create/Update attributes and options
    for (const attr of attributesData) {
      // Validate attribute
      if (!attr.name) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Attribute name is required',
        })
      }

      let attributeId = attr.id

      // Create new attribute if it doesn't have a real ID (starts with 'attr_')
      const isTempAttributeId = typeof attributeId === 'string' && attributeId.startsWith('attr_')
      if (!attributeId || isTempAttributeId) {
        const newAttr = await db
          .insert(tables.attributes)
          .values({
            name: attr.name,
            order: attr.order || 0,
            product: productId,
            attributeType: attr.attributeType || 'Button',
          })
          .returning()
          .get()

        attributeId = newAttr.id
      }

      // Validate options
      if (!attr.options || !Array.isArray(attr.options)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Attribute options must be an array',
        })
      }

      for (const option of attr.options) {
        if (!option.name) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Option name is required',
          })
        }

        // Create new option if it doesn't have a real ID (starts with 'opt_')
        const isTempOptionId = typeof option.id === 'string' && option.id.startsWith('opt_')
        if (!option.id || isTempOptionId) {
          const newOption = await db
            .insert(tables.options)
            .values({
              attribute: attributeId,
              name: option.name,
              hint: option.hint || '',
              color: option.color || '',
              image: option.image || '',
              order: option.order || 0,
            })
            .returning()
            .get()

          // Map the temporary/frontend ID to the real database ID
          const tempId = option.id || `${attr.id}-${option.name}`
          optionIdMap.set(tempId, newOption.id)
        }
        else {
          // If it's already a real ID, map it to itself
          optionIdMap.set(option.id, option.id)
        }
      }
    }

    // 2. Create variants
    for (const variant of variantsData) {
      // Validate variant
      if (variant.salePrice === undefined || variant.salePrice === null) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Sale price is required',
        })
      }

      const newVariant = await db
        .insert(tables.variants)
        .values({
          product: productId,
          purchasePrice: parseFloat(variant.purchasePrice) || 0,
          salePrice: parseFloat(variant.salePrice) || 0,
          discount: parseInt(variant.discount) || 0,
          stock: variant.stock !== null ? parseInt(variant.stock) : null,
          sku: variant.sku || '',
          order: variant.order || 0,
          active: variant.active ?? true,
        })
        .returning()
        .get()

      // 3. Link variant to selected options
      if (variant.selectedOptions && typeof variant.selectedOptions === 'object') {
        const variantOptionData = []

        // Handle selectedOptions as an object (attributeId -> optionId)
        for (const [_attributeId, optionId] of Object.entries(variant.selectedOptions)) {
          const realOptionId = optionIdMap.get(optionId) || optionId
          if (!realOptionId) {
            console.warn(`Invalid option reference: ${optionId}`)
            continue
          }
          variantOptionData.push({
            variant: newVariant.id,
            option: realOptionId,
          })
        }

        if (variantOptionData.length > 0) {
          // Insert variant options one by one for D1 compatibility
          for (const variantOption of variantOptionData) {
            await db.insert(tables.variantOptions).values(variantOption)
          }
        }
      }

      createdVariants.push(newVariant)
    }

    await db.update(tables.products)
      .set({ activeVariants: true })
      .where(eq(tables.products.id, productId))

    return {
      success: true,
      variants: createdVariants,
      message: `Successfully created ${createdVariants.length} variants`
    }
  }
  catch (error) {
    console.error('Variant creation error:', error)
  }
})
