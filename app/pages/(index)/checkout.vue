<script setup lang="ts">
const { data } = await useFetch('/api/cart/checkout')

// Process products to ensure consistent thumbnail format
// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.checkoutPageTitle || checkoutPage.title, // Fallback title
  description: pageSeoData.value.checkoutPageDescription || checkoutPage.description, // Fallback description
})
</script>

<template>
  <UMain>
    <UContainer class="py-4 sm:py-6 lg:py-8">
      <AppBreadcrumbs class="mb-4" />
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <CheckoutForm :products="data?.cartProducts" class="md:col-span-1 lg:col-span-2" />
        <CheckoutReviewCart :products="data?.cartProducts" />
      </div>
    </UContainer>
  </UMain>
</template>
