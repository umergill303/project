export default defineEventHandler(async event => {
  const db = useDb()

  try {
    const session = await getUserSession(event)
    const userId = session?.user?.id
    const isGuest = !userId
    const guestId = isGuest ? getCookie(event, 'user_id') : null

    // Validate we have either a user or guest ID
    if (!userId && !guestId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No user or guest session found'
      })
    }

    // Get the cart for the user or guest
    const cart = await db
      .select()
      .from(tables.carts)
      .where(
        userId
          ? eq(tables.carts.user, userId)
          : eq(tables.carts.guest, guestId)
      )
      .get()

    if (!cart) {
      return {
        success: false,
        message: 'Cart not found',
        cartProducts: []
      }
    }

    // First get all cart products without variant options
    const cartProducts = await db
      .select({
        id: tables.cartProducts.id,
        qty: tables.cartProducts.qty,
        productId: tables.cartProducts.product,
        name: tables.products.name,
        salePrice: sql`COALESCE(${tables.variants.salePrice}, ${tables.products.salePrice})`.as('salePrice'),
        discount: sql`COALESCE(${tables.variants.discount}, ${tables.products.discount})`.as('discount'),
        stock: sql`COALESCE(${tables.variants.stock}, ${tables.products.stock})`.as('stock'),
        thumbnail: tables.products.thumbnail,
        done: tables.cartProducts.done,
        variantId: tables.variants.id,
        sku: tables.variants.sku,
        minShippingProducts: tables.products.minShippingProducts,
        shippingCost: tables.products.shippingCost,
        maxShippingProducts: tables.products.maxShippingProducts,
        baseSalePrice: tables.products.salePrice,
        baseDiscount: tables.products.discount,
        baseStock: tables.products.stock
      })
      .from(tables.cartProducts)
      .leftJoin(
        tables.products,
        eq(tables.products.id, tables.cartProducts.product)
      )
      .leftJoin(
        tables.variants,
        eq(tables.cartProducts.variant, tables.variants.id)
      )
      .where(
        and(
          eq(tables.cartProducts.cart, cart.id),
          eq(tables.cartProducts.done, true) // ONLY include done products
        )
      )
      .all()

    // Get variant IDs from cart products
    const variantIds = cartProducts
      .map(p => p.variantId)
      .filter(Boolean) as number[]

    // Get options for these variants through the junction table
    const options = variantIds.length > 0
      ? await db
        .select({
          variantId: tables.variantOptions.variant,
          optionId: tables.options.id,
          optionName: tables.options.name,
          color: tables.options.color,
          image: tables.options.image,
          attributeId: tables.attributes.id,
          attributeName: tables.attributes.name
        })
        .from(tables.variantOptions)
        .innerJoin(
          tables.options,
          eq(tables.variantOptions.option, tables.options.id)
        )
        .leftJoin(
          tables.attributes,
          eq(tables.options.attribute, tables.attributes.id)
        )
        .where(inArray(tables.variantOptions.variant, variantIds))
        .all()
      : []

    // Group options by variant
    const optionsByVariant = options.reduce((acc, option) => {
      if (!acc[option.variantId]) {
        acc[option.variantId] = []
      }
      acc[option.variantId].push({
        id: option.optionId,
        name: option.optionName,
        color: option.color,
        image: option.image,
        attribute: option.attributeId
          ? {
              id: option.attributeId,
              name: option.attributeName
            }
          : null
      })
      return acc
    }, {} as Record<number, any[]>)

    // Process final cart products
    const processedCartProducts = cartProducts.map(product => {
      const variant = product.variantId
        ? {
            id: product.variantId,
            salePrice: Number(product.salePrice),
            discount: Number(product.discount),
            stock: Number(product.stock),
            sku: product.sku,
            options: optionsByVariant[product.variantId] || []
          }
        : null

      return {
        cartProductId: product.id,
        qty: product.qty,
        productId: product.productId.toString(),
        name: product.name,
        salePrice: Number(product.salePrice),
        discount: Number(product.discount),
        stock: Number(product.stock),
        thumbnail: product.thumbnail ? JSON.parse(product.thumbnail) : [],
        done: Boolean(product.done),
        minShippingProducts: product.minShippingProducts,
        shippingCost: product.shippingCost,
        maxShippingProducts: product.maxShippingProducts,
        baseSalePrice: product.baseSalePrice,
        baseDiscount: product.baseDiscount,
        baseStock: product.baseStock,
        variant
      }
    })

    return {
      success: true,
      message: 'Cart products fetched successfully',
      cartProducts: processedCartProducts
    }
  }
  catch (error) {
    console.error('Error fetching cart:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch cart products',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
})
