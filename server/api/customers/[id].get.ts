export default defineEventHandler(async event => {
  const { id } = getRouterParams(event)

  const db = useDb()
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const offset = (page - 1) * limit

  // Fetch customer data
  const getUser = await useDb().select().from(tables.users).where(eq(tables.users.id, id)).get()
  if (!getUser) throw createError({ statusCode: 404, message: 'User not found' })

  let totalPurchase = 0

  const totalOrders = await db
    .select({ count: sql<number>`COUNT(*)` }).from(tables.orders)
    .where(and(eq(tables.orders.user, id))).then(res => res[0]?.count ?? 0)

  const customerOrders = await db
    .select().from(tables.orders).where(eq(tables.orders.user, id))
    .orderBy(asc(tables.orders.createdAt)).limit(limit).offset(offset).all()

  const ordersWithProducts = await Promise.all(
    customerOrders.map(async order => {
      const orderProducts = await db
        .select({
          sku: tables.products.sku,
          name: tables.products.name,
          orderProductId: tables.orderProducts.id,
          quantity: tables.orderProducts.quantity,
          product: tables.orderProducts.product,
          salePrice: tables.products.salePrice,
          discount: tables.products.discount,
          shippingCost: tables.products.shippingCost,
          thumbnail: tables.products.thumbnail,
        })
        .from(tables.orderProducts)
        .leftJoin(tables.products, eq(tables.products.id, tables.orderProducts.product))
        .where(eq(tables.orderProducts.order, order.id))

      const orderTotal = orderProducts.reduce((sum, product) => {
        const salePrice = product.salePrice ?? 0
        const discount = product.discount ?? 0
        const quantity = product.quantity ?? 1

        const finalPrice = (salePrice - discount) * quantity
        return sum + finalPrice
      }, 0)

      totalPurchase += orderTotal

      const data = orderProducts.map(product => ({ ...product, thumbnail: product.thumbnail ? JSON.parse(product.thumbnail)[0] || null : null }))

      return { ...order, products: data, orderTotal }
    })
  )

  return {
    customer: { ...getUser, page, limit, totalOrders },
    orders: ordersWithProducts,
    totalPurchase
  }
})
