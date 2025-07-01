<script setup lang="ts">
import { formatCurrency } from '~/utils/formatCurrency'
import { getDiscountedU } from '~/utils/discount'
// const appConfig = useAppConfig()
const page = ref(1)
const itemsPerPage = 8
// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.wishlistPageTitle || wishlistPage.title, // Fallback title
  description: pageSeoData.value.wishlistPageDescription || wishlistPage.description, // Fallback description
})
const { refreshWish } = useCount()
// Fetch wishlist products with API pagination
const { data, refresh } = await useFetch('/api/wish', {
  query: { page, limit: itemsPerPage },
  watch: [page],
})

const { trackLike } = useProductTracking()

// const wishCount = useState('wishCount')
const removeWish = async (id: string | number) => {
  await $fetch(`/api/wish/${id}`, { method: 'DELETE' })
  // wishCount.value = Number(wishCount.value) - 1
  trackLike(id, false)
  showToast('deleteWishlist')
  refresh()
  refreshWish()
}
</script>

<template>
  <UContainer class="py-5 min-h-90">
    <AppBreadcrumbs />

    <div class="flex items-center justify-center py-4">
      <div class="w-full space-y-2">
        <UProductsGrid v-if="data?.wishProducts?.length" title="Your Favorite Products">
          <UProductCard
            v-for="product in data.wishProducts"
            :id="product.productId"
            :key="product.wishProductId"
            :provider="product.thumbnail[0] ? 'cloudflare' : undefined"
            :thumbnail="product.thumbnail && product.thumbnail.length > 0 ? product.thumbnail[0]! : '/Noimage.jpg'"
            :to="`/products/${product?.name.toLowerCase().replace(/\s+/g, '')}-${product.productId}`"
            :name="product.name"
            :price="formatCurrency(product.discount && product.salePrice)"
            :discount-percentage="product.discount"
            :sale-price="formatCurrency(getDiscountedU(product.salePrice, product.discount))"
            in-wish
            @wish="(id) => removeWish(id)" />
        </UProductsGrid>
        <UAlert
          v-else
          class="my-6 h-20"
          title="No Products Found In Wishlist"
          description="Please add some products to your wishlist."
          color="error"
          variant="subtle"
          icon="i-lucide-shield-alert" />

        <div class="mt-4 flex justify-center">
          <UPagination
            v-if="data?.pagination?.total > itemsPerPage"
            v-model:page="page"
            :total="data?.pagination?.total"
            :items-per-page="itemsPerPage"
            :sibling-count="1"
            show-edges
            active-color="neutral"
            color="neutral"
            variant="outline" />
        </div>
      </div>
    </div>
  </UContainer>
</template>
