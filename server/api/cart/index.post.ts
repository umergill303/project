import { eq, and, sql } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const db = useDb()
  const { count, productId, variantId, guestId } = await readBody(event)

  // Validate input
  if (!count || !productId) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }

  // Check if product exists
  const productExists = await db
    .select({ id: tables.products.id })
    .from(tables.products)
    .where(eq(tables.products.id, productId))
    .get()

  if (!productExists) {
    throw createError({ statusCode: 404, message: 'Product not found' })
  }

  // Validate variant if provided
  if (variantId) {
    const variantExists = await db
      .select({ id: tables.variants.id })
      .from(tables.variants)
      .where(
        and(
          eq(tables.variants.id, variantId),
          eq(tables.variants.product, productId)
        )
      )
      .get()

    if (!variantExists) {
      throw createError({ statusCode: 400, message: 'Invalid variant for this product' })
    }
  }

  const session = await getUserSession(event)
  const userId = session?.user?.id
  const isGuest = !userId

  // Get or create cart
  let cart = await db
    .select({ id: tables.carts.id })
    .from(tables.carts)
    .where(
      isGuest
        ? eq(tables.carts.guest, guestId)
        : eq(tables.carts.user, userId)
    )
    .get()

  if (!cart) {
    cart = await db
      .insert(tables.carts)
      .values(isGuest ? { guest: guestId } : { user: userId })
      .returning({ id: tables.carts.id })
      .get()
  }

  if (!cart?.id) {
    throw createError({ statusCode: 500, message: 'Cart creation failed' })
  }

  // Check cart limit
  const cartProductCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tables.cartProducts)
    .where(eq(tables.cartProducts.cart, cart.id))
    .then(res => res[0]?.count || 0)

  if (cartProductCount >= 10) {
    throw createError({ statusCode: 400, message: 'Cart limit reached (10 items)' })
  }

  // Check if product variant already in cart
  const existingItem = await db
    .select({ id: tables.cartProducts.id })
    .from(tables.cartProducts)
    .where(
      and(
        eq(tables.cartProducts.cart, cart.id),
        eq(tables.cartProducts.product, productId),
        variantId ? eq(tables.cartProducts.variant, variantId) : undefined
      )
    )
    .get()

  if (existingItem) {
    throw createError({ statusCode: 400, message: 'Product already in cart' })
  }

  // Add to cart
  await db
    .insert(tables.cartProducts)
    .values({
      cart: cart.id,
      product: productId,
      qty: count,
      variant: variantId || null,
    })

  return { success: true, message: 'Product added to cart' }
})
