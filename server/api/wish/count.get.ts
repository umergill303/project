export default defineEventHandler(async event => {
  const db = useDb()

  try {
    const session = await getUserSession(event)
    const userId = session?.user?.id
    const guestId = getCookie(event, 'user_id')
    const isGuest = !userId && !!guestId

    if (!userId && !guestId) {
      return {
        success: false,
        message: 'User not authenticated and no guest ID found',
        count: 0,
      }
    }

    const wishCondition = isGuest
      ? eq(tables.wishes.guest, guestId)
      : eq(tables.wishes.user, userId)

    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(tables.wishes)
      .where(wishCondition)

    const wishCount = result[0]?.count || 0

    return {
      success: true,
      wishCount,
    }
  }
  catch (err) {
    console.error('Error fetching wishlist count:', err)
    return {
      success: false,
      message: 'Failed to fetch wishlist count',
      count: 0,
    }
  }
})
