export default defineEventHandler(async event => {
  const { id, status } = await readBody(event)

  // Validate status input
  const validStatuses = ['requested', 'approved', 'processing', 'shipped', 'received', 'refunded', 'rejected']
  if (!validStatuses.includes(status)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid status value'
    })
  }

  const db = useDb()

  try {
    // Verify return order exists
    const returnOrder = await db.select()
      .from(tables.returnOrders).where(eq(tables.returnOrders.id, id)).then(res => res[0])

    if (!returnOrder) {
      throw createError({ statusCode: 404, message: 'Return order not found' })
    }

    // Update the return order status
    await db.update(tables.returnOrders)
      .set({ status }).where(eq(tables.returnOrders.id, id))

    // If status is 'approved', update the original order status to 'Returned'
    if (status === 'approved') {
      await db.update(tables.orders)
        .set({ status: 'Returned' }).where(eq(tables.orders.id, returnOrder.order))
    }

    // If status is 'refunded', process the stock updates
    if (status === 'refunded') {
      // Get all products in this return order
      const returnProducts = await db.select()
        .from(tables.returnOrderProducts).where(eq(tables.returnOrderProducts.return, id))

      // Update stock for each product
      for (const product of returnProducts) {
        console.log(`Updating stock for product ${product.product} by ${product.quantity} units`)

        // Update product stock using SQL increment
        await db.update(tables.products)
          .set({ stock: sql`${tables.products.stock} + ${product.quantity}` })
          .where(eq(tables.products.id, product.product))

        // Optional: Decrease sold count
        await db.update(tables.products)
          .set({ sold: sql`${tables.products.sold} - ${product.quantity}` })
          .where(eq(tables.products.id, product.product))
      }
    }

    return { success: true, message: 'Return order status updated successfully' }
  }
  catch (error) {
    console.error('Failed to update return order status:', error)
    throw createError({ statusCode: 500, message: 'Failed to update return order status',
    })
  }
})
