import { z } from 'zod'
import { inArray, eq } from 'drizzle-orm'
// `tables` is auto-imported, no need for explicit import

export default defineEventHandler(async event => {
  const { id } = getRouterParams(event)

  // --- Strict ID Type Check ---
  // The product 'id' is a UUID (string), so no parsing to integer is needed.
  // We'll use the 'id' string directly in the query.
  // Add a basic check to ensure the ID is not empty.
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw createError({
      statusCode: 400,
      message: `Invalid Product ID. Expected a non-empty string ID (UUID).`,
    })
  }

  // Use the ID string directly as 'productId' for the query
  const productId = id

  console.log('DEBUG: Product ID (as string):', productId) // Short log for the string ID

  // --- 1. Fetching Data with Joins ---
  // Perform a series of left joins to gather all necessary data
  // from products, categories, brands, attributes, options, variants, and variantOptions.
  // We explicitly select all desired columns and use aliases where necessary to prevent naming conflicts
  // and structure the output directly for the desired nested format.
  const productData = await useDb()
    .select({
      // Product Fields - using direct names for top-level product data
      id: tables.products.id,
      name: tables.products.name,
      salePrice: tables.products.salePrice,
      stock: tables.products.stock,
      seoTitle: tables.products.seoTitle,
      seoDescription: tables.products.seoDescription,
      ogImg: tables.products.ogImg,
      video: tables.products.video,
      freeShipping: tables.products.freeShipping,
      shippingCost: tables.products.shippingCost, // Check if this column exists in your products table
      purchasePrice: tables.products.purchasePrice,
      discount: tables.products.discount,
      tags: tables.products.tags, // Raw JSON string - check if exists
      seoTags: tables.products.seoTags, // Raw JSON string - check if exists
      rating: tables.products.rating,
      sold: tables.products.sold,
      likes: tables.products.likes,
      view: tables.products.view,
      shares: tables.products.shares,
      description: tables.products.description,
      overview: tables.products.overview,
      season: tables.products.season,
      specs: tables.products.specs, // Raw JSON string - check if exists
      features: tables.products.features,
      brandWarranty: tables.products.brandWarranty,
      brandWrtDuration: tables.products.brandWrtDuration,
      sellerWarranty: tables.products.sellerWarranty,
      sellerWrtDuration: tables.products.sellerWrtDuration,
      estimatedDelivery: tables.products.estimatedDelivery,
      sku: tables.products.sku,
      thumbnail: tables.products.thumbnail,
      featured: tables.products.featured,
      highlights: tables.products.highlights,
      published: tables.products.published,
      minShippingProducts: tables.products.minShippingProducts,
      maxShippingProducts: tables.products.maxShippingProducts,
      hVariants: tables.products.hVariants, // Flag indicating if the product has variants
      activeVariants: tables.products.activeVariants, // Flag indicating if the product has variants

      // Category Fields - aliased for later nesting into a 'category' object
      categoryId: tables.categories.id,
      categoryName: tables.categories.name,

      // Brand Fields - aliased for later nesting into a 'brand' object
      brandId: tables.brands.id,
      brandName: tables.brands.name,
      brandLogo: tables.brands.logo,

      // Attribute Fields - aliased for later nesting into 'attributes' array of objects
      attributeId: tables.attributes.id,
      attributeName: tables.attributes.name,
      attributeOrder: tables.attributes.order,
      attributeType: tables.attributes.attributeType,

      // Option Fields - aliased for later nesting into 'options' arrays (both in attributes and variants)
      optionId: tables.options.id,
      optionName: tables.options.name,
      optionHint: tables.options.hint,
      optionColor: tables.options.color,
      optionImage: tables.options.image,
      optionOrder: tables.options.order,
      optionAttribute: tables.options.attribute, // Renamed to 'attribute' based on schema

      // Variant Fields - aliased for later nesting into 'variants' array of objects
      variantId: tables.variants.id,
      variantPurchasePrice: tables.variants.purchasePrice,
      variantSalePrice: tables.variants.salePrice,
      variantDiscount: tables.variants.discount,
      variantStock: tables.variants.stock,
      variantSku: tables.variants.sku,
      variantOrder: tables.variants.order,
      variantActive: tables.variants.active,

      // VariantOption Junction Table Fields - used for linking options to variants
      // We only need the IDs from the junction table to map the relationships
      junctionVariant: tables.variantOptions.variant, // Renamed to 'variant' based on schema
      junctionOption: tables.variantOptions.option, // Renamed to 'option' based on schema
    })
    .from(tables.products)
    .leftJoin(tables.categories, eq(tables.products.category, tables.categories.id))
    .leftJoin(tables.brands, eq(tables.products.brand, tables.brands.id))
    // Join Attributes associated with the product (if any)
    .leftJoin(tables.attributes, eq(tables.attributes.product, tables.products.id)) // Use .product
    // Join Options associated with the attributes (if any attribute/option exists)
    .leftJoin(tables.options, eq(tables.options.attribute, tables.attributes.id)) // Use .attribute
    // Join Variants associated with the product (if any)
    .leftJoin(
      tables.variants,
      and(
        eq(tables.variants.product, tables.products.id),
        eq(tables.variants.active, true)
      )
    ) // Use .product
    // Join the VariantOptions junction table to link Variants to their specific Options (if any variant/option link exists)
    .leftJoin(tables.variantOptions, eq(tables.variantOptions.variant, tables.variants.id))

    .where(eq(tables.products.id, productId)) // Use productId (string) directly
    .all() // Use .all() because a single product will return multiple rows due to joins

  console.log('DEBUG: Product data rows length AFTER QUERY:', productData.length) // Short log for data length
  if (productData.length > 0) {
    console.log('DEBUG: First row of product data AFTER QUERY:', productData[0]) // Short log for first row
  }
  else {
    console.log('DEBUG: Query returned no product data for ID:', productId) // Log with the string ID
    console.log('DEBUG: About to throw 404 error.') // Log before throwing error
    throw createError({ statusCode: 404, message: 'Product not found' })
  }

  // --- 2. Data Transformation: Reconstructing Nested Objects ---
  // If we reach here, productData has at least one row.
  const rawProductRow = productData[0] // The first row contains the core product data

  const product: any = {
    id: rawProductRow.id,
    name: rawProductRow.name,
    salePrice: rawProductRow.salePrice,
    stock: rawProductRow.stock,
    seoTitle: rawProductRow.seoTitle,
    seoDescription: rawProductRow.seoDescription,
    ogImg: rawProductRow.ogImg,
    video: rawProductRow.video,
    freeShipping: rawProductRow.freeShipping,
    shippingCost: rawProductRow.shippingCost,
    purchasePrice: rawProductRow.purchasePrice,
    discount: rawProductRow.discount,
    tags: rawProductRow.tags,
    seoTags: rawProductRow.seoTags,
    rating: rawProductRow.rating,
    sold: rawProductRow.sold,
    likes: rawProductRow.likes,
    view: (rawProductRow.view || 0) + 1,
    shares: rawProductRow.shares,
    description: rawProductRow.description,
    overview: rawProductRow.overview,
    season: rawProductRow.season,
    specs: rawProductRow.specs,
    features: rawProductRow.features,
    brandWarranty: rawProductRow.brandWarranty,
    brandWrtDuration: rawProductRow.brandWrtDuration,
    sellerWarranty: rawProductRow.sellerWarranty,
    sellerWrtDuration: rawProductRow.sellerWrtDuration,
    estimatedDelivery: rawProductRow.estimatedDelivery,
    sku: rawProductRow.sku,
    thumbnail: rawProductRow.thumbnail,
    featured: rawProductRow.featured,
    highlights: rawProductRow.highlights,
    published: rawProductRow.published,
    minShippingProducts: rawProductRow.minShippingProducts,
    maxShippingProducts: rawProductRow.maxShippingProducts,
    hVariants: rawProductRow.hVariants,
    activeVariants: rawProductRow.activeVariants,

    category: rawProductRow.categoryId
      ? {
          id: rawProductRow.categoryId,
          name: rawProductRow.categoryName,
        }
      : null,
    brand: rawProductRow.brandId
      ? {
          id: rawProductRow.brandId,
          name: rawProductRow.brandName,
          logo: rawProductRow.brandLogo,
        }
      : null,

    attributes: [],
    variants: [],
  }

  const attributesMap = new Map()
  const optionsMap = new Map()
  const variantsMap = new Map()
  const variantOptionIdsSetMap = new Map<number, Set<number>>()

  for (const row of productData) {
    if (row.attributeId && !attributesMap.has(row.attributeId)) {
      attributesMap.set(row.attributeId, {
        id: row.attributeId,
        name: row.attributeName,
        order: row.attributeOrder,
        attributeType: row.attributeType,
        options: [],
      })
    }

    if (row.optionId) {
      if (!optionsMap.has(row.optionId)) {
        optionsMap.set(row.optionId, {
          id: row.optionId,
          name: row.optionName,
          hint: row.optionHint,
          color: row.optionColor,
          image: row.optionImage,
          order: row.optionOrder,
          attribute: row.optionAttribute,
        })
      }
      if (row.attributeId && attributesMap.has(row.attributeId)) {
        const currentAttribute = attributesMap.get(row.attributeId)
        if (!currentAttribute.options.some((o: any) => o.id === row.optionId)) {
          currentAttribute.options.push(optionsMap.get(row.optionId))
        }
      }
    }

    // Process variants (only active variants due to SQL filter)
    if (row.variantId && !variantsMap.has(row.variantId)) {
      variantsMap.set(row.variantId, {
        id: row.variantId,
        purchasePrice: row.variantPurchasePrice,
        salePrice: row.variantSalePrice,
        discount: row.variantDiscount,
        stock: row.variantStock,
        sku: row.variantSku,
        order: row.variantOrder,
        active: row.variantActive,
        options: [],
      })
      variantOptionIdsSetMap.set(row.variantId, new Set<number>())
    }

    if (row.variantId && row.junctionOption && optionsMap.has(row.junctionOption)) {
      const variant = variantsMap.get(row.variantId)
      const option = optionsMap.get(row.junctionOption)
      const optionIdsSet = variantOptionIdsSetMap.get(row.variantId)

      if (variant && option && optionIdsSet && !optionIdsSet.has(option.id)) {
        variant.options.push(option)
        optionIdsSet.add(option.id)
      }
    }
  }

  product.attributes = Array.from(attributesMap.values()).sort((a, b) => a.order - b.order)
  product.variants = Array.from(variantsMap.values()).sort((a, b) => a.order - b.order)

  let specs: Record<string, string> = {}
  try {
    specs = JSON.parse(product.specs || '{}')
  }
  catch (e) {
    console.warn('Invalid `specs` JSON format:', e)
  }

  interface SafeParseNumberArray {
    (input: string | null | undefined): number[]
  }

  const safeParseNumberArray: SafeParseNumberArray = input => {
    try {
      const parsed = JSON.parse(input || '[]')
      if (Array.isArray(parsed)) {
        return z.array(z.number()).parse(parsed)
      }
      else if (typeof parsed === 'number') {
        return [parsed]
      }
      else {
        return []
      }
    }
    catch (err) {
      console.warn('Invalid number array format:', err)
      return []
    }
  }

  const tags = safeParseNumberArray(product.tags)
  const seoTags = safeParseNumberArray(product.seoTags)

  const tagList = tags.length
    ? await useDb().select({ id: tables.tags.id, name: tables.tags.name })
      .from(tables.tags).where(inArray(tables.tags.id, tags)).all()
    : []

  const seoTagList = seoTags.length
    ? await useDb().select({ id: tables.tags.id, name: tables.tags.name })
      .from(tables.tags).where(inArray(tables.tags.id, seoTags)).all()
    : []

  return { ...product, specs, tags: tagList, seoTags: seoTagList }
})
