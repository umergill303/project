export default defineEventHandler(async event => {
  const db = useDb()
  const productId = getRouterParam(event, 'id')

  // Validate input
  if (!productId) {
    throw createError({ statusCode: 400, statusMessage: 'Product ID is required' })
  }
  try {
    return await db.query.attributes.findMany({
      where: (attributes, { eq }) => eq(attributes.product, productId),
      with: { options: true }
    })
  }
  catch {
    console.log('catch block')
    return 'catch block'
  }
})
