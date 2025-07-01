import { eq, and, inArray } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const db = useDb()
  const productId = getRouterParam(event, 'id')
  const variantId = getRouterParam(event, 'variantId')

  // Validate input
  if (!productId || !variantId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID and Variant ID are required',
    })
  }

  try {
    // Check if variant exists and belongs to the product
    const existingVariant = await db
      .select()
      .from(tables.variants)
      .where(
        and(
          eq(tables.variants.id, variantId), // No parseInt - ID is text
          eq(tables.variants.product, productId)
        )
      )
      .get()

    if (!existingVariant) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Variant not found or does not belong to this product'
      })
    }

    // Get all option IDs for this variant before deletion
    const variantOptions = await db
      .select({ optionId: tables.variantOptions.option })
      .from(tables.variantOptions)
      .where(eq(tables.variantOptions.variant, variantId)) // No parseInt
      .all()

    // Delete variant options (junction table entries) first
    await db
      .delete(tables.variantOptions)
      .where(eq(tables.variantOptions.variant, variantId)) // No parseInt

    // Delete the variant itself
    const deletedVariant = await db
      .delete(tables.variants)
      .where(eq(tables.variants.id, variantId)) // No parseInt
      .returning()
      .get()

    const cleanupStats = {
      deletedOptions: 0,
      deletedAttributes: 0,
      orphanedOptionIds: [] as string[],
      orphanedAttributeIds: [] as string[]
    }

    // Now check for orphaned options and attributes
    if (variantOptions.length > 0) {
      const optionIds = variantOptions.map(vo => vo.optionId)

      // Find which options are still being used by other variants
      const stillUsedOptions = await db
        .selectDistinct({ optionId: tables.variantOptions.option })
        .from(tables.variantOptions)
        .where(inArray(tables.variantOptions.option, optionIds))
        .all()

      const stillUsedOptionIds = stillUsedOptions.map(suo => suo.optionId)

      // Find options that are no longer used
      const orphanedOptionIds = optionIds.filter(id => !stillUsedOptionIds.includes(id))

      if (orphanedOptionIds.length > 0) {
        // Get the attributes associated with these orphaned options
        const optionsWithAttributes = await db
          .select({
            optionId: tables.options.id,
            attributeId: tables.options.attribute
          })
          .from(tables.options)
          .where(inArray(tables.options.id, orphanedOptionIds))
          .all()

        // Delete the orphaned options
        await db
          .delete(tables.options)
          .where(inArray(tables.options.id, orphanedOptionIds))

        cleanupStats.deletedOptions = orphanedOptionIds.length
        cleanupStats.orphanedOptionIds = orphanedOptionIds

        // Check for orphaned attributes
        const affectedAttributeIds = [...new Set(optionsWithAttributes.map(oa => oa.attributeId))]

        if (affectedAttributeIds.length > 0) {
          // Find which attributes still have options
          const attributesWithOptions = await db
            .selectDistinct({ attributeId: tables.options.attribute })
            .from(tables.options)
            .where(inArray(tables.options.attribute, affectedAttributeIds))
            .all()

          const attributesStillInUse = attributesWithOptions.map(awo => awo.attributeId)
          const orphanedAttributeIds = affectedAttributeIds.filter(id => !attributesStillInUse.includes(id))

          if (orphanedAttributeIds.length > 0) {
            await db
              .delete(tables.attributes)
              .where(
                and(
                  eq(tables.attributes.product, productId),
                  inArray(tables.attributes.id, orphanedAttributeIds)
                )
              )

            cleanupStats.deletedAttributes = orphanedAttributeIds.length
            cleanupStats.orphanedAttributeIds = orphanedAttributeIds
          }
        }
      }
    }

    // Generate appropriate message
    let message = 'Variant deleted successfully.'
    if (cleanupStats.deletedOptions > 0 && cleanupStats.deletedAttributes > 0) {
      message += ` Cleaned up ${cleanupStats.deletedOptions} orphaned options and ${cleanupStats.deletedAttributes} orphaned attributes.`
    }
    else if (cleanupStats.deletedOptions > 0) {
      message += ` Cleaned up ${cleanupStats.deletedOptions} orphaned options.`
    }
    else if (cleanupStats.deletedAttributes > 0) {
      message += ` Cleaned up ${cleanupStats.deletedAttributes} orphaned attributes.`
    }
    else {
      message += ' No cleanup needed.'
    }

    return {
      success: true,
      deletedVariant,
      cleanupStats,
      message
    }
  }
  catch (error) {
    console.error('Variant deletion error:', error)
  }
})
