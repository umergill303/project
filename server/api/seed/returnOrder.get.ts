import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async () => {
  // Get existing orders with their products
  const existingOrders = await useDb()
    .select({
      order: tables.orders,
      orderProduct: tables.orderProducts
    })
    .from(tables.orders)
    .leftJoin(
      tables.orderProducts,
      eq(tables.orders.id, tables.orderProducts.order)
    )
    .limit(50)

  if (!existingOrders.length) {
    return { error: 'No orders found. Create orders first.' }
  }

  const returnReasons = [
    'Wrong item received',
    'Item damaged',
    'Item not as described',
    'Changed my mind',
    'Better price available',
    'Wrong size ordered'
  ]

  const returnMethods = ['Pickup', 'Drop-off', 'Exchange']
  const returnStatuses = ['requested', 'approved', 'processing', 'shipped', 'received', 'refunded', 'rejected']

  const fakeReturns = []
  const fakeReturnProducts = []

  // Create return orders for about 30% of orders
  const ordersToReturn = existingOrders.filter(() => Math.random() < 0.3)

  for (const { order, orderProduct } of ordersToReturn) {
    // Skip if no order or product exists
    if (!order || !orderProduct) continue

    // Create return order
    const returnOrder = {
      id: uuidv4(),
      order: order.id,
      name: order.name || '',
      email: order.email || '',
      phone: order.phone || '',
      country: order.country || '',
      city: order.city || '',
      street: (order.address?.split(',')[0] || order.address || '').trim(),
      postalCode: order.zipCode || '',
      reason: returnReasons[Math.floor(Math.random() * returnReasons.length)],
      status: returnStatuses[Math.floor(Math.random() * returnStatuses.length)],
      method: returnMethods[Math.floor(Math.random() * returnMethods.length)],
      notes: Math.random() > 0.7 ? 'Customer requested urgent return' : '',
      createdAt: new Date().toISOString()
    }

    try {
      // Insert return order
      await useDb().insert(tables.returnOrders).values(returnOrder)
      fakeReturns.push(returnOrder)

      // Get all products for this order
      const orderProducts = await useDb()
        .select()
        .from(tables.orderProducts)
        .where(eq(tables.orderProducts.order, order.id))

      // Select products to return (1-3 random products)
      const productsToReturn = orderProducts
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(orderProducts.length, Math.floor(Math.random() * 3) + 1))

      for (const product of productsToReturn) {
        // Get variant information if it exists
        let variantData = {
          name: '',
          color: '',
          image: '',
          options: ''
        }

        if (product.variant) {
          const variant = await useDb()
            .select()
            .from(tables.variants)
            .leftJoin(
              tables.options,
              eq(tables.variants.options, tables.options.id)
            )
            .where(eq(tables.variants.id, product.variant))
            .get()

          if (variant) {
            variantData = {
              name: variant.options?.name || '',
              color: variant.options?.color || '',
              image: variant.options?.image || '',
              options: variant.options?.hint || ''
            }
          }
        }

        const returnQuantity = Math.min(
          Math.floor(Math.random() * product.quantity) + 1,
          product.quantity
        )

        const returnProduct = {
          id: uuidv4(),
          return: returnOrder.id,
          product: product.product,
          variant: product.variant || null,
          quantity: returnQuantity,
          salePrice: product.salePrice,
          discount: product.discount || 0,
          purchasePrice: product.purchasePrice,
          shippingCost: product.shippingCost || 0,
          thumbnail: product.thumbnail || '',
          name: product.name || '',
          variantName: variantData.name,
          variantColor: variantData.color,
          variantImage: variantData.image,
          variantOptions: variantData.options
        }

        await useDb().insert(tables.returnOrderProducts).values(returnProduct)
        fakeReturnProducts.push(returnProduct)
      }
    }
    catch (error) {
      console.error('Error creating return order:', error)
      continue
    }
  }

  return {
    success: true,
    stats: {
      returnOrders: fakeReturns.length,
      returnProducts: fakeReturnProducts.length,
      returnRate: `${(fakeReturns.length / existingOrders.length * 100).toFixed(1)}%`,
      statusDistribution: returnStatuses.map(status => ({
        status,
        count: fakeReturns.filter(r => r.status === status).length
      }))
    },
    sampleReturn: fakeReturns[0],
    sampleReturnProduct: fakeReturnProducts[0]
  }
})
