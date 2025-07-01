export default defineEventHandler(async event => {
  const { id, status } = await readBody(event)
  // const session = await getUserSession(event)
  // const phone = session?.user?.phone
  // debug log
  // console.log('Session************************:', session) // debug log
  if (!status) {
    return { error: 'Status is required' }
  }

  const db = useDb()
  await hubKV().del('dashboard:orders-analytics')

  try {
    const orderProducts = await db.select()
      .from(tables.orderProducts).where(eq(tables.orderProducts.order, id))

    console.log('orderProducts:', orderProducts)

    const updatedOrder = await db.update(tables.orders)
      .set({ status }).where(eq(tables.orders.id, id)).returning().get()

    const phone = updatedOrder.phone
    console.log('Phone************************:', phone)

    if (status === 'canceled') {
      for (const item of orderProducts) {
        await db
          .update(tables.products)
          .set({ stock: sql`${tables.products.stock} + ${item.quantity}` })
          .where(eq(tables.products.id, item.product))

        // Optional: Decrease sold count
        await db.update(tables.products)
          .set({ sold: sql`${tables.products.sold} - ${item.quantity}` })
          .where(eq(tables.products.id, item.product))
      }
    }
    if (status === 'processing') {
      await $fetch('/api/orders/status/sms', { method: 'POST', body: { phone: phone } })
    }

    if (status === 'delivered') {
      for (const item of orderProducts) {
        await db
          .update(tables.products)
          .set({ stock: sql`${tables.products.stock} - ${item.quantity}` })
          .where(eq(tables.products.id, item.product))

        // Optional: Decrease sold count
        await db.update(tables.products)
          .set({ sold: sql`${tables.products.sold} + ${item.quantity}` })
          .where(eq(tables.products.id, item.product))
      }
    }

    return {
      message: 'Order status updated successfully',
      status: updatedOrder.status,
    }
  }
  catch (error) {
    console.error('Error updating order:', error)
    return { error: 'Failed to update order status', details: error }
  }
})
