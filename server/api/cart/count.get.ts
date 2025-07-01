export default defineEventHandler(async event => {
  const db = useDb()
  const session = await getUserSession(event)
  const userId = session?.user?.id
  const guestId = !userId ? getCookie(event, 'user_id') : null

  const cart = await db
    .select()
    .from(tables.carts)
    .where(userId ? eq(tables.carts.user, userId) : eq(tables.carts.guest, guestId))
    .get()

  const count = cart
    ? await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(tables.cartProducts)
      .where(eq(tables.cartProducts.cart, cart.id))
      .then(res => res[0]?.count || 0)
    : 0

  return { count }
})
