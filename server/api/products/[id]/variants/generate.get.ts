// server/api/products/[id]/variants/generate.get.ts
import { eq, and } from 'drizzle-orm'

// Your existing generateVariantCombinations function
function generateVariantCombinations(attributesData) {
  if (!attributesData || attributesData.length === 0) {
    return []
  }

  let combinations = [{}]

  attributesData.forEach(attribute => {
    const newCombinations = []
    attribute.options.forEach(option => {
      combinations.forEach(combination => {
        newCombinations.push({
          ...combination,
          [attribute.name]: {
            optionId: option.id,
            optionName: option.name,
            attributeId: attribute.id,
            attributeName: attribute.name
          }
        })
      })
    })
    combinations = newCombinations
  })

  return combinations
}

export default defineEventHandler(async event => {
  const db = useDb()
  const productId = getRouterParam(event, 'id')

  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required',
    })
  }

  // Fetch attributes and their options for the specific product
  const productAttributes = await db.query.attributes.findMany({
    where: (attrs, { eq: dEq }) => dEq(attrs.product, productId),
    with: { options: true }
  })

  if (!productAttributes || productAttributes.length === 0) {
    return {
      message: 'No attributes found for this product, no variants generated.',
      generatedVariants: []
    }
  }

  const generatedCombinations = generateVariantCombinations(productAttributes)
  console.log('generatedCombinations', generatedCombinations)

  const createdVariants = []
  const queriesToBatch = [] // Array to store Drizzle statement builders

  // 1. Check for existing active variants for this product
  // This is a read operation, can be done outside the batch if not strictly dependent on prior writes in the same batch.
  // However, if you want this check to be part of the atomic unit with the updates, you'd perform it within the batch
  // or structure the batch differently (e.g., using promises).
  // For simplicity and matching your original intent of a single "transaction-like" operation:
  const existingActiveVariants = await db.query.variants.findMany({
    where: (v, { eq: dEq, and: dAnd }) => dAnd(dEq(v.product, productId), dEq(v.active, true))
  })

  // 2. If active variants exist, mark them as inactive
  if (existingActiveVariants.length > 0) {
    console.log(`Found ${existingActiveVariants.length} active variants. Setting them to inactive...`)
    // Add the update statement to the batch
    queriesToBatch.push(
      db.update(tables.variants)
        .set({ active: false })
        .where(and(eq(tables.variants.product, productId), eq(tables.variants.active, true)))
    )
  }
  else {
    console.log('No active variants found for this product.')
  }

  // 3. Generate and prepare insert statements for new variants with active: true
  for (const combo of generatedCombinations) {
    // Insert into variants table (prepare for batch)
    const newVariantInsertStatement = db.insert(tables.variants).values({
      product: productId,
      purchasePrice: 0, // Default values
      salePrice: 0, // Default values
      stock: 0, // Default values
      sku: `SKU-${productId}-${Object.values(combo).map(o => o.optionName).join('-')}`.toUpperCase(),
      order: 0,
      active: true, // New variants are active
    }).returning({ id: tables.variants.id }) // Crucial for getting the ID back

    queriesToBatch.push(newVariantInsertStatement) // Add to batch

    // Important: We need the ID of the newly inserted variant to link options.
    // Drizzle's batch operations return results in order. We'll need to map
    // the results back to the combinations to get the newVariant.id after the batch executes.
    // This requires a slightly different approach than a direct transaction loop.
    // We'll store the combination itself along with the statement.
    createdVariants.push({ combo, statementIndex: queriesToBatch.length - 1 }) // Store index for later ID retrieval
  }

  // Execute all accumulated queries in a single D1 batch
  try {
    const batchResults = await db.batch(queriesToBatch)

    // After batch execution, process results to link variantOptions
    const variantOptionsInserts = []
    for (const { combo, statementIndex } of createdVariants) {
      const newVariantResult = batchResults[statementIndex] // Get the result from the batch

      if (newVariantResult && newVariantResult.length > 0) {
        const newVariantId = newVariantResult[0].id // Extract the ID
        const variantOptionsToInsert = Object.values(combo).map(optionData => ({
          variant: newVariantId,
          option: optionData.optionId,
        }))
        if (variantOptionsToInsert.length > 0) {
          // Add insert statements for variant options
          variantOptionsInserts.push(db.insert(tables.variantOptions).values(variantOptionsToInsert))
        }
      }
    }

    // Execute the batch for variant options inserts if any
    if (variantOptionsInserts.length > 0) {
      await db.batch(variantOptionsInserts)
    }

    // Reconstruct createdVariants for the final response, using actual IDs
    const finalCreatedVariants = []
    for (let i = 0; i < createdVariants.length; i++) {
      const combo = createdVariants[i].combo
      const newVariantId = batchResults[createdVariants[i].statementIndex][0].id
      finalCreatedVariants.push({
        variantId: newVariantId,
        combination: combo
      })
    }
    await db.update(tables.products)
      .set({ activeVariants: true })
      .where(eq(tables.products.id, productId))
    return {
      message: `Successfully generated and saved ${finalCreatedVariants.length} new active variants.`,
      createdVariants: finalCreatedVariants // Return the variants with their actual IDs
    }
  }
  catch (error) {
    console.error('D1 Batch Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate and save variants due to a database error.',
    })
  }
})
