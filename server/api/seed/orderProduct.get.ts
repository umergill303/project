export default defineEventHandler(async () => {
  const orders = await useDb().select().from(tables.orders)
  const products = await useDb().select().from(tables.products)
  const variants = await useDb().select().from(tables.variants)

  if (!orders.length || !products.length) {
    return { error: 'Need orders and products first' }
  }

  const fakeOrderProducts = []

  for (const order of orders) {
    // Add 1-4 products to each order
    const productCount = Math.floor(Math.random() * 4) + 1

    for (let i = 0; i < productCount; i++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const productVariants = variants.filter(v => v.product === product.id)
      const variant = productVariants.length > 0
        ? productVariants[Math.floor(Math.random() * productVariants.length)]
        : null

      const quantity = Math.floor(Math.random() * 3) + 1
      const price = variant?.salePrice || product.salePrice || Math.floor(Math.random() * 5000) + 500
      const discount = Math.floor(Math.random() * 20)

      const orderProduct = {
        id: uuid4(),
        order: order.id,
        product: product.id,
        variant: variant?.id || null,
        name: product.name,
        thumbnail: product.thumbnail || '/Noimage.jpg',
        quantity,
        salePrice: price,
        purchasePrice: price * 0.8, // 20% less than sale price
        discount,
        shippingCost: i === 0 ? Math.floor(Math.random() * 300) + 100 : 0
      }

      await useDb().insert(tables.orderProducts).values(orderProduct)
      fakeOrderProducts.push(orderProduct)
    }
  }

  return {
    success: true,
    count: fakeOrderProducts.length,
    sample: fakeOrderProducts[0]
  }
})
