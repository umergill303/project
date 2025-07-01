// import { and, eq, sql } from 'drizzle-orm'
// import { products } from '~~/server/database/schema'

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
      }
    }

    // Get pagination query params
    const query = getQuery(event)
    const requestedPage = Math.max(parseInt(query.page as string) || 1, 1)
    const limit = Math.max(parseInt(query.limit as string) || 5, 1)

    // Build condition based on user type
    const wishCondition = isGuest
      ? eq(tables.wishes.guest, guestId)
      : eq(tables.wishes.user, userId)

    // Get total count
    const totalCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(tables.wishes)
      .where(wishCondition)

    const totalCount = totalCountResult[0]?.count || 0
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / limit) : 1
    const page = Math.min(requestedPage, totalPages)
    const offset = (page - 1) * limit

    // Fetch wish products
    const wishProducts = await db
      .select({
        wishProductId: tables.wishes.id,
        productId: tables.products.id,
        name: tables.products.name,
        salePrice: tables.products.salePrice,
        discount: tables.products.discount,
        description: tables.products.description,
        minShippingProducts: tables.products.minShippingProducts,
        maxShippingProducts: tables.products.maxShippingProducts,
        stock: tables.products.stock,
        thumbnail: tables.products.thumbnail,
      })
      .from(tables.wishes)
      .leftJoin(tables.products, eq(tables.products.id, tables.wishes.product))
      .where(wishCondition)
      .orderBy(tables.wishes.id)
      .limit(limit)
      .offset(offset)
      .all()

    const processedWishProducts = wishProducts.map(product => ({
      ...product,
      thumbnail: product.thumbnail ? JSON.parse(product.thumbnail) : []
    }))

    return {
      success: true,
      message:
        processedWishProducts.length > 0
          ? 'Wish products fetched successfully'
          : 'No products found in the wishlist',
      wishProducts: processedWishProducts,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
      },
    }
  }
  catch (err) {
    console.error('Error fetching wish products:', err)
    return {
      success: false,
      message: 'Error fetching wish products',
    }
  }
})
