import { eq } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const { id } = getRouterParams(event)
  try {
    const db = useDb()

    // First get all order products
    const orderProducts = await db
      .select({
        id: tables.orderProducts.id,
        name: tables.orderProducts.name, // Use the snapshot name from orderProducts
        productId: tables.orderProducts.product,
        variantId: tables.orderProducts.variant,
        discount: tables.orderProducts.discount,
        salePrice: tables.orderProducts.salePrice,
        purchasePrice: tables.orderProducts.purchasePrice,
        thumbnail: tables.orderProducts.thumbnail,
        quantity: tables.orderProducts.quantity,
        shippingCost: tables.orderProducts.shippingCost,
        isReturned: tables.orderProducts.isReturned,
        returnReason: tables.orderProducts.returnReason,
        // Current product data (optional - only if you need current state)
        productName: tables.products.name,
        delivery: tables.products.estimatedDelivery,
        productDescription: tables.products.description,
        category: tables.categories.name,
      })
      .from(tables.orderProducts)
      .leftJoin(tables.products, eq(tables.products.id, tables.orderProducts.product))
      .leftJoin(tables.categories, eq(tables.products.category, tables.categories.id))
      .where(eq(tables.orderProducts.order, id))
      .all()

    // For each product with variant, get its options
    const productsWithVariants = await Promise.all(
      orderProducts.map(async product => {
        if (!product.variantId) {
          return {
            ...product,
            variant: null,
            variantAttributes: null
          }
        }

        // Get variant details
        const variant = await db
          .select()
          .from(tables.variants)
          .where(eq(tables.variants.id, product.variantId))
          .get()

        // Get options for this variant
        const variantOptions = await db
          .select({
            option: {
              id: tables.options.id,
              name: tables.options.name,
              hint: tables.options.hint,
              color: tables.options.color,
              image: tables.options.image,
              attribute: {
                id: tables.attributes.id,
                name: tables.attributes.name,
                type: tables.attributes.attributeType
              }
            }
          })
          .from(tables.variantOptions)
          .innerJoin(tables.options, eq(tables.options.id, tables.variantOptions.option))
          .innerJoin(tables.attributes, eq(tables.attributes.id, tables.options.attribute))
          .where(eq(tables.variantOptions.variant, product.variantId))
          .all()

        // Process thumbnail
        let firstThumbnail = '/Noimage.jpg'
        try {
          if (typeof product.thumbnail === 'string') {
            const parsed = JSON.parse(product.thumbnail)
            if (Array.isArray(parsed) && parsed.length > 0) {
              firstThumbnail = parsed[0]
            }
          }
        }
        catch (error) {
          console.error('Error parsing thumbnail:', error)
        }

        return {
          ...product,
          thumbnail: firstThumbnail,
          finalPrice: variant?.salePrice || product.salePrice,
          finalDiscount: variant?.discount || product.discount,
          variant: variant
            ? {
                id: variant.id,
                purchasePrice: variant.purchasePrice,
                salePrice: variant.salePrice,
                discount: variant.discount,
                stock: variant.stock
              }
            : null,
          variantAttributes: variantOptions.map(vo => ({
            attributeId: vo.option.attribute.id,
            attributeName: vo.option.attribute.name,
            attributeType: vo.option.attribute.type,
            optionId: vo.option.id,
            optionName: vo.option.name,
            hint: vo.option.hint,
            color: vo.option.color,
            image: vo.option.image
          }))
        }
      })
    )

    // Get the order details
    const order = await db
      .select()
      .from(tables.orders)
      .where(eq(tables.orders.id, id))
      .get()

    return {
      orderProducts: productsWithVariants,
      order
    }
  }
  catch (error) {
    console.error('Error fetching order:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to fetch order details'
    })
  }
})
