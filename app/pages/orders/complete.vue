<script setup lang="ts">
// useSeoMeta({
//   title: 'Order Complete – Thank You for Shopping with Us!',
//   description: 'Thank you for your purchase! Your order has been successfully placed. Track your shipment and enjoy fast delivery across Pakistan with our trusted online store.'
// })
// Initialize SEO composable
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.orderCompletePageTitle || orderCompletePage.title, // Fallback title
  description: pageSeoData.value.orderCompletePageDescription || orderCompletePage.description, // Fallback description
})
</script>

<template>
  <UMain>
    <UContainer class="py-4 sm:py-6 lg:py-8">
      <AppBreadcrumbs />
      <div>
        <OrdersComplete />
      </div>
    </UContainer>
  </UMain>
</template>
