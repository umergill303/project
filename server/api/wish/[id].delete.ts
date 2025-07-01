export default defineEventHandler(async event => {
  const db = useDb()
  const { id: productId } = getRouterParams(event)
  const session = await getUserSession(event)
  const userId = session?.user?.id
  const guestId = getCookie(event, 'user_id')
  const isGuest = !userId && !!guestId

  if (!userId && !guestId) {
    return {
      success: false,
      message: 'User not authenticated and no guest ID found',
    }
  }

  try {
    // Build where clause dynamically based on user type
    const whereClause = and(
      eq(tables.wishes.product, productId),
      isGuest
        ? eq(tables.wishes.guest, guestId)
        : eq(tables.wishes.user, userId)
    )

    const wish = await db
      .delete(tables.wishes)
      .where(whereClause)
      .returning()
      .get()

    return {
      wish,
      success: true,
      message: 'Wish deleted successfully.',
    }
  }
  catch (error) {
    console.error('Error processing the request:', error)
    return {
      success: false,
      message: 'An error occurred while deleting the wish.',
    }
  }
})
