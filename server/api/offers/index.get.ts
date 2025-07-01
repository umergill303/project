import type { OfferType } from '#shared/types/offer'

export default defineEventHandler(async () => {
  const db = useDb()

  const offersWithProducts = await db
    .select({
      offerId: tables.offers.id,
      offerName: tables.offers.name,
      offerActive: tables.offers.active,
      offerEndDate: tables.offers.endDate,
      offerDes: tables.offers.description,
      offerDiscount: tables.offers.discount,
      offerStartDate: tables.offers.startDate,
      //
      productId: tables.products.id,
      productSku: tables.products.sku,
      productBrand: tables.brands.name,
      productName: tables.products.name,
      productSold: tables.products.sold,
      productCate: tables.categories.name,
      productDiscount: tables.products.discount,
      productSalePrice: tables.products.salePrice,
    })
    .from(tables.offers)
    .leftJoin(tables.offerProducts, eq(tables.offers.id, tables.offerProducts.offerId))
    .leftJoin(tables.products, eq(tables.offerProducts.productId, tables.products.id))
    .leftJoin(tables.brands, eq(tables.brands.id, tables.products.brand))
    .leftJoin(tables.categories, eq(tables.categories.id, tables.products.category))
    .orderBy(sql`RANDOM()`)
    .limit(8)
    .all()

  const groupedOffers = offersWithProducts.reduce<Record<string, OfferType>>((acc, item) => {
    if (!acc[item.offerId]) {
      acc[item.offerId] = {
        id: item.offerId,
        name: item.offerName,
        active: item.offerActive,
        endDate: item.offerEndDate,
        description: item.offerDes,
        discount: item.offerDiscount,
        startDate: item.offerStartDate,
        totalProducts: 0,
        products: [],
      } as OfferType
    }
    if (item.productId) {
      acc[item.offerId]?.products?.push({
        id: item.productId,
        sku: item.productSku ?? '',
        sold: item.productSold ?? 0,
        name: item.productName ?? '',
        brand: item.productBrand ?? '',
        category: item.productCate ?? '',
        discount: item.productDiscount ?? 0,
        salePrice: item.productSalePrice ?? 1,
      })
    }
    return acc
  }, {})

  return { offer_data: Object.values(groupedOffers) }
})
