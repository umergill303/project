<script setup lang="ts">
const { features } = useRuntimeConfig().public.ecommerce
const route = useRoute()
const id = route.params?.id
const shortId = ('#' + id.toString().slice(0, 8))
const { data: orderData } = useFetch(`/api/orders/order/${id}`)
const { data: returnData } = useFetch(`/api/orders/return/${id}`)
const { data: returnOrderProducts } = useFetch(`/api/orders/return/${id}/orderProduct`)
// useSeoMeta({
//   title: 'Track Your Order – Real-Time Shipment Status | Online Shopping Pakistan',
//   description: 'Easily track your order status in real-time. Stay updated with shipping progress and estimated delivery times for your purchases across Pakistan.'
// })
const { pageSeoData, fetchPageSeo } = usePageSeo()

// Fetch SEO data
await fetchPageSeo()

// Use the SEO data
useSeoMeta({
  title: pageSeoData.value.trackOrderPageTitle || trackOrderPage.title, // Fallback title
  description: pageSeoData.value.trackOrderPageDescription || trackOrderPage.description, // Fallback description
})

console.log('Order Data:', orderData.value)
console.log('Return Data:', returnData.value)
console.log('Return Products:', returnOrderProducts.value)

const isReturn = computed(() => {
  return orderData.value?.order?.status === 'Returned'
})
</script>

<template>
  <UMain>
    <UContainer class="space-y-5 py-4 sm:py-6 lg:py-8">
      <AppBreadcrumbs />

      <UCard variant="subtle" class="w-full">
        <div class="mb-4">
          <h2 class="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            {{ isReturn ? 'Return Tracking' : 'Order Tracking' }}
          </h2>
          <UFormField label="Track ID" class="mt-3">
            <UInput :value="shortId" disabled />
          </UFormField>
        </div>

        <OrdersDetail
          v-if="orderData?.order"
          :order="orderData.order"
          :orderproduct="orderData.orderProducts" />
        <!-- Show return tracking if order status is Returned -->
        <template v-if="isReturn && features.orderReturn">
          <OrdersTrackReturn :return-order="returnData" />

          <!-- Show return products -->
          <div v-if="returnOrderProducts?.length" class="mt-6">
            <h3 class="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-100">
              Returned Products
            </h3>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <OrdersReturnProduct
                v-for="product in returnOrderProducts"
                :key="product.id"
                :product="product"
                is-return />
            </div>
          </div>
        </template>

        <!-- Show normal order tracking for any other status -->
        <template v-else-if="orderData?.order">
          <OrdersTrack :order="orderData.order" />

          <!-- Show original order products -->
          <div v-if="orderData?.orderProducts?.length" class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <OrdersProduct
              v-for="product in orderData.orderProducts"
              :key="product.id"
              :product="product" />
          </div>
        </template>
      </UCard>
    </UContainer>
  </UMain>
</template>
