export default defineEventHandler(async event => {
  const db = useDb()
  const session = await getUserSession(event)

  const authUserId = session?.user?.id
  const guestId = getCookie(event, 'user_id') // assuming this is the guest ID
  const isGuest = !authUserId && !!guestId

  const { productId } = await readBody(event)
  console.log('Product ID:', productId)
  console.log('Auth User ID:', authUserId)
  console.log('Guest ID:', guestId)

  if (!authUserId && !guestId) {
    return {
      success: false,
      message: 'User not authenticated and no guest ID found',
    }
  }

  try {
    // Check if product is already in wishlist
    const existingWishProduct = await db
      .select()
      .from(tables.wishes)
      .where(
        and(
          eq(tables.wishes.product, productId),
          isGuest
            ? eq(tables.wishes.guest, guestId)
            : eq(tables.wishes.user, authUserId)
        )
      )
      .get()

    if (existingWishProduct) {
      return {
        success: false,
        message: 'Product is already in your wishlist',
      }
    }

    const values: Record<string, any> = {
      product: productId,
    }

    if (isGuest) {
      values.guest = guestId
    }
    else {
      values.user = authUserId
    }

    const [wishProduct] = await db
      .insert(tables.wishes)
      .values(values)
      .returning({ id: tables.wishes.id })

    return {
      success: true,
      message: 'Product added to wishlist successfully',
      wishProductId: wishProduct.id,
    }
  }
  catch (err) {
    console.error('Error handling request:', err)
    return {
      success: false,
      message: 'Internal server error',
    }
  }
})
