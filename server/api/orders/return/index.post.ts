export default defineEventHandler(async event => {
  const db = useDb()

  try {
    const body = await readBody(event)

    // Validate required fields
    if (!body.order) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required',
      })
    }

    if (!body.products || !Array.isArray(body.products) || body.products.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'At least one product must be selected for return',
      })
    }

    // Check if a return already exists for this order
    const existingReturn = await db
      .select({ id: tables.returnOrders.id })
      .from(tables.returnOrders)
      .where(eq(tables.returnOrders.order, body.order))
      .get()

    if (existingReturn) {
      throw createError({
        statusCode: 400,
        statusMessage: 'A return request for this order already exists',
      })
    }

    // Create the return order
    const [returnOrder] = await db
      .insert(tables.returnOrders)
      .values({
        order: body.order,
        name: body.name || '',
        email: body.email,
        phone: body.phone || '',
        country: body.country || '',
        city: body.city || '',
        street: body.street || '',
        postalCode: body.postalCode || '',
        reason: body.reason || '',
        notes: body.additionalNotes || '',
        method: body.method || '',
        status: 'requested',
        isReturned: false
      })
      .returning({ id: tables.returnOrders.id })

    if (!returnOrder) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create return order',
      })
    }

    // Prepare product data for insertion
    const productIds = body.products.map(p => p.productId)
    const variantIds = body.products
      .filter(p => p.variantId)
      .map(p => parseInt(p.variantId, 10))
      .filter(id => !isNaN(id))

    // Fetch product details
    const productsData = await db
      .select({
        id: tables.products.id,
        name: tables.products.name,
        salePrice: tables.products.salePrice,
        purchasePrice: tables.products.purchasePrice,
        discount: tables.products.discount,
        shippingCost: tables.products.shippingCost,
        thumbnail: tables.products.thumbnail,
      })
      .from(tables.products)
      .where(inArray(tables.products.id, productIds))

    // Fetch variant details with options if needed
    let variantsData = []
    if (variantIds.length > 0) {
      variantsData = await db
        .select({
          variant: {
            id: tables.variants.id,
            product: tables.variants.product,
            salePrice: tables.variants.salePrice,
            purchasePrice: tables.variants.purchasePrice,
            discount: tables.variants.discount,
          },
          options: {
            id: tables.options.id,
            name: tables.options.name,
            color: tables.options.color,
            image: tables.options.image,
          },
          attribute: {
            name: tables.attributes.name,
            type: tables.attributes.attributeType,
          }
        })
        .from(tables.variants)
        .leftJoin(
          tables.variantOptions,
          eq(tables.variants.id, tables.variantOptions.variant)
        )
        .leftJoin(
          tables.options,
          eq(tables.variantOptions.option, tables.options.id)
        )
        .leftJoin(
          tables.attributes,
          eq(tables.options.attribute, tables.attributes.id)
        )
        .where(inArray(tables.variants.id, variantIds))
    }

    // Organize variant data
    const variantMap = new Map()
    variantsData.forEach(({ variant, options, attribute }) => {
      if (!variantMap.has(variant.id)) {
        variantMap.set(variant.id, {
          ...variant,
          options: []
        })
      }
      if (options) {
        variantMap.get(variant.id).options.push({
          ...options,
          attributeName: attribute?.name || '',
          attributeType: attribute?.type || ''
        })
      }
    })

    // Prepare return products data
    const returnProductsData = body.products.map(returnProduct => {
      const product = productsData.find(p => p.id === returnProduct.productId)
      if (!product) {
        throw createError({
          statusCode: 404,
          statusMessage: `Product with ID ${returnProduct.productId} not found`,
        })
      }

      const variantId = returnProduct.variantId ? parseInt(returnProduct.variantId, 10) : null
      const variant = variantId ? variantMap.get(variantId) : null

      // Build variant information
      const variantOptions = []
      let variantName = ''
      let variantColor = ''
      let variantImage = ''

      if (variant?.options?.length) {
        variant.options.forEach(opt => {
          variantOptions.push({
            name: opt.name,
            color: opt.color,
            image: opt.image,
            attributeName: opt.attributeName,
            attributeType: opt.attributeType
          })

          if (opt.attributeType === 'COLOR' && opt.color) {
            variantColor = opt.color
          }
          else if (opt.name) {
            variantName += (variantName ? ' / ' : '') + opt.name
          }

          if (opt.image) variantImage = opt.image
        })
      }

      return {
        return: returnOrder.id,
        product: returnProduct.productId,
        variant: variantId ? returnProduct.variantId : null,
        quantity: returnProduct.quantity || 1,
        salePrice: variant?.salePrice ?? product.salePrice ?? 0,
        purchasePrice: variant?.purchasePrice ?? product.purchasePrice ?? 0,
        discount: variant?.discount ?? product.discount ?? 0,
        shippingCost: product.shippingCost ?? 0,
        thumbnail: product.thumbnail || '',
        name: product.name + (variantName ? ` (${variantName})` : ''),
        variantName,
        variantColor,
        variantImage,
        variantOptions: JSON.stringify(variantOptions)
      }
    })

    // Insert return products
    await db
      .insert(tables.returnOrderProducts)
      .values(returnProductsData)

    return {
      success: true,
      returnId: returnOrder.id,
    }
  }
  catch (error) {
    console.error('Return API Error:', error)

    // Handle known errors
    if (error.statusCode) {
      throw error
    }

    // Handle database errors
    if (error.message.includes('SQLITE_CONSTRAINT')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Database constraint error occurred',
      })
    }

    // Generic error
    throw createError({
      statusCode: 500,
      statusMessage: 'An unexpected error occurred while processing your return',
    })
  }
})
