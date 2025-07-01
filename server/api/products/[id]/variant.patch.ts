import { eq } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const db = useDb()
  const productId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!productId) {
    throw createError({ statusCode: 400, statusMessage: 'Product ID is required' })
  }

  if (!body.id) {
    throw createError({ statusCode: 400, statusMessage: 'Variant ID is required' })
  }

  const {
    id: variantId,
    purchasePrice,
    salePrice,
    discount,
    stock,
    sku,
    order,
    active,
  } = body

  try {
    // Update variant
    const updatedVariant = await db
      .update(tables.variants)
      .set({
        purchasePrice: parseFloat(purchasePrice) || 0,
        salePrice: parseFloat(salePrice) || 0,
        discount: parseInt(discount) || 0,
        stock: stock !== null ? parseInt(stock) : null,
        sku: sku || '',
        order: order || 0,
        active: active ?? true,
      })
      .where(eq(tables.variants.id, variantId))
      .returning()
      .get()

    return {
      success: true,
      variant: {
        ...updatedVariant,
      },
      message: 'Variant updated successfully',
    }
  }
  catch (error) {
    console.error('Failed to update variant:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update variant',
    })
  }
})
