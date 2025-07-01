import { getCookie } from 'h3'

export default defineEventHandler(async event => {
  const db = useDb()
  const { id: productId } = getRouterParams(event)
  const session = await getUserSession(event)
  const userId = session?.user?.id
  const guestId = getCookie(event, 'user_id') // may be undefined

  // try {
  // Require either userId or guestId
  if (!userId && !guestId) {
    return {
      success: false,
      message: 'User is not authenticated and no guest ID found.',
    }
  }

  // Fetch the cart by user or guest
  const cart = userId
    ? await db
      .select()
      .from(tables.carts)
      .where(eq(tables.carts.user, userId))
      .get()
    : await db
      .select()
      .from(tables.carts)
      .where(eq(tables.carts.guest, String(guestId)))
      .get()

  if (!cart) {
    return {
      success: false,
      message: 'Cart not found.',
    }
  }

  // Delete the product from the cart
  const del = await db
    .delete(tables.cartProducts)
    .where(
      and(
        eq(tables.cartProducts.product, productId),
        eq(tables.cartProducts.cart, cart.id)
      )
    )
    .run()

  if (del?.affectedRows === 0) {
    return {
      success: false,
      message: 'Product not found in the cart.',
    }
  }

  return {
    success: true,
    message: 'Product removed from the cart successfully.',
    deleted: del,
  }
  // }
  // catch (error) {
  //   console.error('Error processing the request:', error)
  //   return {
  //     success: false,
  //     message: 'An error occurred while removing the product from the cart.',
  //     error: error instanceof Error ? error.message : String(error),
  //   }
  // }
})
