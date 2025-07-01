<script lang="ts" setup>
const route = useRoute()
const productId = (route.params as { id: string }).id
const { product } = await useProduct(productId)
</script>

<template>
  <UDashboardPanel id="variant" :ui="{ body: 'gap-2 sm:gap-3' }">
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <AppBreadcrumbs />
        </template>
      </UDashboardNavbar>
    </template>
    <template v-if="product" #body>
      <Variants
        :product-id
        :product-stock="product.stock"
        :product-sale-price="product.salePrice"
        :product-purchase-price="product.purchasePrice" />
    </template>
  </UDashboardPanel>
</template>
