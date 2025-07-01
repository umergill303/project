import { eq, and, isNull } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const db = useDb()
  try {
    const { products } = await readBody(event) // Receive an array of products with IDs & quantities

    const user = await getUserSession(event)
    const userId = user?.user?.id

    // If no user, get guestId from cookies
    const cookieGuestId = getCookie(event, 'user_id')

    if (!userId && !cookieGuestId) {
      throw new Error('User not authenticated and no guest ID found')
    }

    // Find cart using user ID or guest ID
    const cart = await db
      .select()
      .from(tables.carts)
      .where(userId
        ? eq(tables.carts.user, userId)
        : eq(tables.carts.guest, cookieGuestId!)) // Non-null assertion since we've checked above
      .get()

    if (!cart) {
      throw new Error('Cart not found for the user or guest')
    }

    // Bulk update all product quantities
    for (const { productId, qty, variantId } of products) {
      const conditions = [
        eq(tables.cartProducts.cart, cart.id),
        eq(tables.cartProducts.product, productId)
      ]

      if (variantId) {
        conditions.push(eq(tables.cartProducts.variant, variantId))
      }
      else {
        conditions.push(isNull(tables.cartProducts.variant))
      }

      await db
        .update(tables.cartProducts)
        .set({ qty })
        .where(and(...conditions))
        .run()
    }

    return { success: true }
  }
  catch (error) {
    console.error('Error updating quantities:', error)
    return { success: false, error: error.message || error }
  }
})
