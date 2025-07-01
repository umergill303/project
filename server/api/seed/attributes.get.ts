export default defineEventHandler(async () => {
  console.log('Running DB seed task for attributes...')
  const db = useDb()

  // 1. Fetch all products
  const products = await db.select().from(tables.products)

  // 2. Generate attributes for each product
  const newAttributes = [
    {
      name: 'Color',
      order: 1,
      product: products[0].id,
      attributeType: AttributeType.Color,
    },
    {
      name: 'Size',
      order: 2,
      product: products[0].id,
      attributeType: AttributeType.Button,
    },
  ]

  // 3. Insert attributes
  await db.insert(tables.attributes).values(newAttributes)

  return {
    status: 'success',
    message: `${newAttributes.length} attributes added for ${products.length} products.`,
  }
})
