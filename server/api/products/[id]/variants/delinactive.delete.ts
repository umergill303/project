// server/api/products/[id]/variants/delinactive.delete.ts
import { and, eq } from 'drizzle-orm'
// import { variants } from '~/server/db/schema' // adjust the path to your actual schema file

export default defineEventHandler(async event => {
  const db = useDb()
  const productId = getRouterParam(event, 'id')

  if (!productId) {
    throw createError({ statusCode: 400, statusMessage: 'Product ID is required' })
  }

  const deletedVariants = await db
    .delete(tables.variants)
    .where(
      and(
        eq(tables.variants.product, productId),
        eq(tables.variants.active, false)
      )
    )

  return {
    message: 'Inactive variants deleted successfully',
    // .delete() usually returns a result object, not an array
    result: deletedVariants,
  }
})
