// /api/orders/return/orderProducts/[id].ts
export default defineEventHandler(async event => {
  const db = useDb()
  const { id } = getRouterParams(event) // This is the ORDER ID

  // First find the return order that references this order
  const returnOrder = await db.select()
    .from(tables.returnOrders)
    .where(eq(tables.returnOrders.order, id))
    .get()

  if (!returnOrder) return []

  // Then get products for this return order
  const returnOrderProducts = await db.select()
    .from(tables.returnOrderProducts)
    .where(eq(tables.returnOrderProducts.return, returnOrder.id))
    .all()

  const processedOrderProducts = returnOrderProducts.map(product => ({
    ...product,
    thumbnail: product.thumbnail ? JSON.parse(product.thumbnail) : []
  }))

  return processedOrderProducts
})
