<script lang="ts" setup>
import { ref, watch } from 'vue'

const { data, refresh: refreshCart } = await useFetch('/api/cart/cartProduct')
const { data: checkout, refresh: refreshCheckout } = await useFetch('/api/cart/checkout', {
  key: 'checkout-data',
  dedupe: 'defer',
})
console.log('checkout', checkout)
const selectedProducts = ref([])

// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.cartPageTitle || cartPage.title, // Fallback title
  description: pageSeoData.value.cartPageDescription || cartPage.description, // Fallback description
})
// Initialize with only done products
watch(
  data,
  newData => {
    if (!newData?.cartProducts) {
      selectedProducts.value = []
      return
    }

    // Only select products that are marked as done
    selectedProducts.value = newData.cartProducts.filter(product => product.done) || []
  },
  { immediate: true }
)

// If checkout has done products, use those instead
watch(
  checkout,
  newCheckout => {
    if (newCheckout?.cartProducts) {
      selectedProducts.value = newCheckout.cartProducts.filter(product => product.done) || []
    }
  },
  { immediate: true }
)
</script>

<template>
  <UMain>
    <UContainer class="py-4 sm:py-6 lg:py-8">
      <AppBreadcrumbs />
      <section v-if="data?.cartProducts.length" class="grid grid-cols-1 gap-2 lg:grid-cols-12 pt-5">
        <div class="lg:col-span-9">
          <div class="rounded-lg">
            <CartProduct
              :products="data?.cartProducts || []"
              @refresh="refreshCart"
              @update:selected-products="selectedProducts = $event" />
          </div>
        </div>
        <CartSummary :products="selectedProducts" @refresh="refreshCheckout" />
      </section>
      <div v-else class="flex flex-col items-center justify-center py-12 gap-4">
        <UIcon name="i-heroicons-shopping-cart" class="w-16 h-16 text-error" />
        <h3 class="text-xl font-semibold text-toned">
          Your cart is empty
        </h3>
        <p class="text-muted">
          Looks like you haven't added any items to your cart yet
        </p>
        <UButton
          label="Continue Shopping"
          to="/"
          class="mt-4" />
      </div>
    </UContainer>
  </UMain>
</template>
