export default defineEventHandler(async event => {
  const db = useDb()
  const productId = getRouterParam(event, 'id')

  // Validate input
  if (!productId) {
    throw createError({ statusCode: 400, statusMessage: 'Product ID is required' })
  }

  const { active = 'true' } = getQuery(event)

  const isActive = active === 'true'

  const variants = await db.query.variants.findMany({
    where: (variants, { eq, and }) =>
      and(eq(variants.product, productId), eq(variants.active, isActive)),
    with: { variantOptions: { with: { option: true } } }
  })
  return variants
})
