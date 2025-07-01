<script setup lang="ts">
const route = useRoute()
const offerProductTable = ref()
const offerId = route.query.id
</script>

<template>
  <UDashboardPanel :ui="{ body: 'gap-2 sm:gap-3' }">
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <AppBreadcrumbs />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <DashboardVoucherOfferTable ref="offerProductTable" :offer-id="offerId?? ''" :show-del-btn="true" show-action-btn />
    </template>
  </UDashboardPanel>
</template>
