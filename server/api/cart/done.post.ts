import { inArray } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const body = await readBody<{ productIds: string[], done: boolean }>(event)
  console.log(body)

  if (!body.productIds || body.productIds.length === 0) {
    return { success: false, message: 'No products selected' }
  }

  try {
    await useDb()
      .update(tables.cartProducts)
      .set({ done: body.done })
      .where(inArray(tables.cartProducts.product, body.productIds)) // ✅ Corrected

    return { success: true, message: 'Cart items updated successfully' }
  }
  catch (error) {
    console.error('Error updating cart items:', error)
    return { success: false, message: 'Failed to update cart items' }
  }
})
