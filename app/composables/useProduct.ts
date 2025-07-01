import type { Product, Tag } from '~~/server/database/schema'

type ProductWithBrandLogo = Product & {
  tags?: Tag[]
  seoTags?: Tag[]
  brandId?: number
  categoryId?: number
  thumbnail?: string[] | string | null

}
export const useProduct = async (id: string) => {
  const product = await $fetch<ProductWithBrandLogo | null>(`/api/products/${id}`)
  return {
    product,
    tags: product?.tags ?? [],
    seoTags: product?.seoTags ?? [],
    thumbnails: product?.thumbnail ? JSON.parse(product?.thumbnail) : []
  }
}
