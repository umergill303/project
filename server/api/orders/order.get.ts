export default defineEventHandler(async event => {
  const db = useDb()

  try {
    const session = await getUserSession(event)
    const userId = session?.user?.id

    if (!userId) {
      return {
        success: false,
        message: 'User not authenticated.',
      }
    }

    // Get pagination parameters
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 5
    const offset = (page - 1) * limit

    // Get total count of orders
    const totalCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(tables.orders)
      .where(eq(tables.orders.user, userId))
      .then(res => res[0]?.count || 0)

    // Fetch paginated orders
    const orders = await db
      .select()
      .from(tables.orders)
      .where(eq(tables.orders.user, userId))
      .limit(limit)
      .offset(offset)
      .all()

    return {
      success: true,
      orders,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  }
  catch (error) {
    console.error('Error fetching orders:', error)

    return {
      success: false,
      message: 'An error occurred while fetching orders.',
    }
  }
})
