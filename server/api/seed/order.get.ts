export default defineEventHandler(async () => {
  // Get existing users
  const users = await useDb().select().from(tables.users).limit(20)
  if (!users.length) {
    return { error: 'No users found. Create users first.' }
  }

  // Pakistani cities by province
  const pakistaniLocations = {
    Punjab: ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala'],
    Sindh: ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana'],
    'Khyber Pakhtunkhwa': ['Peshawar', 'Abbottabad', 'Mardan', 'Swat'],
    Balochistan: ['Quetta', 'Gwadar', 'Turbat'],
    'Gilgit-Baltistan': ['Gilgit', 'Skardu']
  }

  const paymentMethods = ['Cash On Delivery', 'Credit Card', 'JazzCash', 'EasyPaisa', 'Bank Transfer']
  const orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled']
  const locationTypes = ['Home', 'Office', 'Shop']

  const fakeOrders = []

  // Create 50 fake orders
  for (let i = 0; i < 100; i++) {
    const user = users[Math.floor(Math.random() * users.length)]
    const province = Object.keys(pakistaniLocations)[Math.floor(Math.random() * 5)]
    const city = pakistaniLocations[province][Math.floor(Math.random() * pakistaniLocations[province].length)]
    const orderDate = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)]

    // Generate random phone number if not available
    const phone = user.phone || `0300${Math.floor(1000000 + Math.random() * 9000000)}`

    // Base order data
    const order: typeof orders.$inferInsert = {
      id: uuid4(),
      user: user.id,
      payment: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      status,
      lines: 0, // Will be updated when adding products
      salePrice: 0, // Will be sum of product sale prices
      purchasePrice: 0, // Will be sum of product purchase prices
      discount: 0, // Will be sum of product discounts
      extraPrice: parseFloat((Math.random() * 500).toFixed(2)),
      shippingCost: 0, // Will be calculated based on products
      totalPrice: 0, // Will be calculated
      name: user.name || `Customer ${i + 1}`,
      phone,
      email: user.email || `customer${i + 1}@example.com`,
      country: 'Pakistan',
      province,
      city,
      district: `${city} District`,
      address: `House #${Math.floor(Math.random() * 100)}, Street ${Math.floor(Math.random() * 50)}, ${city}`,
      zipCode: Math.floor(10000 + Math.random() * 90000).toString(),
      location: locationTypes[Math.floor(Math.random() * locationTypes.length)],
      date: orderDate,
      createdAt: orderDate,
      Confirmed: Math.random() > 0.3, // 70% confirmed
      Paid: status === 'Delivered' ? true : Math.random() > 0.5 // 50% paid unless delivered
    }

    // Set status timestamps
    switch (status) {
      case 'Pending':
        order.pending = orderDate
        break
      case 'Processing':
        order.processing = orderDate
        break
      case 'Shipped':
        order.shipped = new Date(new Date(orderDate).getTime() + 86400000).toISOString() // +1 day
        break
      case 'Delivered':
        order.delivered = new Date(new Date(orderDate).getTime() + 172800000).toISOString() // +2 days
        break
      case 'Canceled':
        order.canceled = new Date(new Date(orderDate).getTime() + 3600000).toISOString() // +1 hour
        break
    }

    // First create the order with initial values
    await useDb().insert(tables.orders).values(order)

    // Now add products to the order and calculate correct totals
    const products = await useDb().select().from(tables.products)
    const variants = await useDb().select().from(tables.variants)
    const productCount = Math.floor(Math.random() * 4) + 1 // 1-4 products

    let totalSalePrice = 0
    let totalPurchasePrice = 0
    let totalDiscountedPrice = 0
    let shippingCost = 0

    const orderProducts = []

    for (let i = 0; i < productCount; i++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const productVariants = variants.filter(v => v.product === product.id)
      const variant = productVariants.length > 0
        ? productVariants[Math.floor(Math.random() * productVariants.length)]
        : null

      const quantity = Math.floor(Math.random() * 3) + 1
      const price = variant?.salePrice || product.salePrice || Math.floor(Math.random() * 5000) + 500
      const discount = (variant?.discount || product.discount || 0)
      const purchasePrice = variant?.purchasePrice || product.purchasePrice || price * 0.8
      const productShippingCost = product.shippingCost || Math.floor(Math.random() * 300) + 100

      const productTotal = price * quantity
      const productDiscountedPrice = (price * (1 - (discount / 100))) * quantity

      totalSalePrice += productTotal
      totalPurchasePrice += purchasePrice * quantity
      totalDiscountedPrice += productDiscountedPrice
      shippingCost += productShippingCost * quantity // Match your API's shipping calculation

      const orderProduct = {
        id: uuid4(),
        order: order.id,
        product: product.id,
        variant: variant?.id || null,
        name: product.name,
        thumbnail: product.thumbnail || '/Noimage.jpg',
        quantity,
        salePrice: price,
        purchasePrice: purchasePrice,
        discount: discount,
        shippingCost: productShippingCost
      }

      orderProducts.push(orderProduct)
    }

    // Calculate total discount amount
    const totalDiscount = totalSalePrice - totalDiscountedPrice

    // Insert all order products at once
    await useDb().insert(tables.orderProducts).values(orderProducts)

    // Update the order with correct totals
    order.lines = productCount
    order.salePrice = parseFloat(totalSalePrice.toFixed(2))
    order.purchasePrice = parseFloat(totalPurchasePrice.toFixed(2))
    order.discount = parseFloat(totalDiscount.toFixed(2))
    order.shippingCost = parseFloat(shippingCost.toFixed(2))
    order.totalPrice = parseFloat((
      totalDiscountedPrice + shippingCost + order.extraPrice
    ).toFixed(2))

    // Update the order in database
    await useDb()
      .update(tables.orders)
      .set({
        lines: order.lines,
        salePrice: order.salePrice,
        purchasePrice: order.purchasePrice,
        discount: order.discount,
        shippingCost: order.shippingCost,
        totalPrice: order.totalPrice
      })
      .where(eq(tables.orders.id, order.id))

    fakeOrders.push(order)
  }

  return {
    success: true,
    count: fakeOrders.length,
    sample: fakeOrders[0],
    stats: {
      totalRevenue: fakeOrders.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2),
      averageOrder: (fakeOrders.reduce((sum, o) => sum + o.totalPrice, 0) / fakeOrders.length).toFixed(2),
      statusDistribution: orderStatuses.map(status => ({
        status,
        count: fakeOrders.filter(o => o.status === status).length
      }))
    }
  }
})
