<script lang="ts" setup>
const route = useRoute()
const productId = (route.params as { id: string }).id
</script>

<template>
  <UDashboardPanel id="patch_product" :ui="{ body: 'gap-2 sm:gap-3' }">
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <AppBreadcrumbs />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <DashboardProductsForm :product-id mode="upd" />
    </template>
  </UDashboardPanel>
</template>
