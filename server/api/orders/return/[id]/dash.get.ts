export default defineEventHandler(async event => {
  const { id } = getRouterParams(event)
  console.log('Fetching order products for return order ID:', id)

  try {
    const db = useDb()

    const returnOrderProducts = await db
      .select({
        name: tables.products.name,
        productId: tables.products.id,
        category: tables.categories.name,
        discount: tables.returnOrderProducts.discount,
        salePrice: tables.returnOrderProducts.salePrice,
        thumbnail: tables.products.thumbnail,
        quantity: tables.returnOrderProducts.quantity,
        description: tables.products.description,
        shippingCost: tables.returnOrderProducts.shippingCost,
        variantColor: tables.returnOrderProducts.variantColor,
        variantName: tables.returnOrderProducts.variantName,
        variant: tables.returnOrderProducts.variant,
        variantOptions: tables.returnOrderProducts.variantOptions,
      })
      .from(tables.returnOrderProducts)
      .leftJoin(tables.products, eq(tables.products.id, tables.returnOrderProducts.product))
      .leftJoin(tables.categories, eq(tables.products.category, tables.categories.id))
      .where(eq(tables.returnOrderProducts.return, id)).all()

    const processedOrderProducts = returnOrderProducts.map(product => ({
      ...product,
      thumbnail: product.thumbnail ? JSON.parse(product.thumbnail) : []
    }))

    const returnOrders = await db.select()
      .from(tables.returnOrders).where(eq(tables.returnOrders.id, id)).get()

    return { returnOrderProducts: processedOrderProducts, returnOrders }
  }
  catch (error) {
    console.error('Error fetching order products:', error)
    return { returnOrderProducts: [], returnOrders: null }
  }
})
