// server/api/orders.post.ts
export default defineEventHandler(async event => {
  const db = useDb()
  const kv = hubKV()

  try {
    // Validate user session
    const session = await getUserSession(event)
    const userId = session?.user?.id
    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Please login to place an order',
      })
    }

    // Validate request body
    const body = await readBody(event)
    const { name, email, phone, address, province, city, district } = body
    const country = body.country || 'Pakistan'
    const code = body.code || ''
    const locate = body.locate || 'home'

    // Check required fields
    if (!name || !phone || !address || !province || !city || !district) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Please fill all required shipping information',
      })
    }

    // Get user's cart
    const cart = await db
      .select({ id: tables.carts.id })
      .from(tables.carts)
      .where(eq(tables.carts.user, userId))
      .get()

    if (!cart) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No active cart found',
      })
    }

    // Get cart products
    const cartProducts = await db
      .select({
        id: tables.cartProducts.id,
        qty: tables.cartProducts.qty,
        productId: tables.cartProducts.product,
        variantId: tables.cartProducts.variant,
        name: tables.products.name,
        thumbnail: tables.products.thumbnail,
        stock: tables.products.stock,
        variantStock: tables.variants.stock,
        salePrice: sql`COALESCE(${tables.variants.salePrice}, ${tables.products.salePrice})`.as('salePrice'),
        purchasePrice: sql`COALESCE(${tables.variants.purchasePrice}, ${tables.products.purchasePrice})`.as('purchasePrice'),
        discount: sql`COALESCE(${tables.variants.discount}, ${tables.products.discount})`.as('discount'),
        shippingCost: tables.products.shippingCost,
      })
      .from(tables.cartProducts)
      .innerJoin(tables.products, eq(tables.cartProducts.product, tables.products.id))
      .leftJoin(tables.variants, eq(tables.cartProducts.variant, tables.variants.id))
      .where(
        and(
          eq(tables.cartProducts.cart, cart.id),
          eq(tables.cartProducts.done, true)
        )
      )
      .all()

    if (cartProducts.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No items in cart to checkout',
      })
    }

    // Check stock
    for (const item of cartProducts) {
      const availableStock = item.variantId ? item.variantStock : item.stock
      if (!availableStock || availableStock < item.qty) {
        throw createError({
          statusCode: 400,
          statusMessage: `Not enough stock for ${item.name}`,
        })
      }
    }

    // Calculate totals
    const totals = cartProducts.reduce(
      (acc, item) => {
        const price = Number(item.salePrice)
        const purchase = Number(item.purchasePrice)
        const discount = Number(item.discount)
        const discountedPrice = price - (price * discount) / 100

        acc.subtotal += price * item.qty
        acc.purchase += purchase * item.qty
        acc.discount += (price - discountedPrice) * item.qty
        acc.shipping += Number(item.shippingCost || 0) * item.qty
        acc.total += discountedPrice * item.qty + Number(item.shippingCost || 0) * item.qty
        return acc
      },
      { subtotal: 0, purchase: 0, discount: 0, shipping: 0, total: 0 }
    )

    // Create order
    const [order] = await db
      .insert(tables.orders)
      .values({
        user: userId,
        name,
        email,
        phone,
        address,
        province,
        country,
        city,
        district,
        zipCode: code,
        location: locate,
        paymentMethod: 'Cash On Delivery',
        status: 'pending',
        lines: cartProducts.length,
        salePrice: totals.subtotal,
        purchasePrice: totals.purchase,
        shippingCost: totals.shipping,
        discount: totals.discount,
        totalPrice: totals.total,
      })
      .returning({ id: tables.orders.id })

    if (!order) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create order',
      })
    }

    // Create order products
    const orderProducts = cartProducts.map(item => ({
      order: order.id,
      product: item.productId,
      variant: item.variantId,
      name: item.name,
      quantity: item.qty,
      salePrice: Number(item.salePrice),
      purchasePrice: Number(item.purchasePrice),
      discount: Number(item.discount),
      shippingCost: Number(item.shippingCost || 0),
      thumbnail: item.thumbnail,
    }))

    await db.insert(tables.orderProducts).values(orderProducts)

    // Update product stocks
    for (const item of cartProducts) {
      if (item.variantId) {
        await db
          .update(tables.variants)
          .set({ stock: (item.variantStock || 0) - item.qty })
          .where(eq(tables.variants.id, item.variantId))
      }
      else {
        await db
          .update(tables.products)
          .set({
            stock: (item.stock || 0) - item.qty,
            sold: sql`${tables.products.sold} + ${item.qty}`
          })
          .where(eq(tables.products.id, item.productId))
      }
    }

    // Clear cart
    await db
      .delete(tables.cartProducts)
      .where(eq(tables.cartProducts.cart, cart.id))

    // Clear cache
    await kv.del('dashboard:revenue-analytics')

    return {
      success: true,
      orderId: order.id,
      total: totals.total,
    }
  }
  catch (error: any) {
    console.error('Order error:', error)
    return {
      success: false,
      message: error.message || 'Failed to create order',
    }
  }
})
