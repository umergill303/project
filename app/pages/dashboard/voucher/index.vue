<script lang="ts" setup>
const { ui } = useAppConfig()
const couponRef = ref()
const openModal = () => {
  couponRef.value?.openModal()
}
</script>

<template>
  <UDashboardPanel :ui="{ body: 'gap-2 sm:gap-3' }">
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <AppBreadcrumbs />
        </template>
        <template #right>
          <UButton label="Add Coupon" :icon="ui.icons.add" @click="openModal()" />
          <UButton label="Add Offer" :icon="ui.icons.add" @click="navigateTo('/dashboard/voucher/post')" />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="grid grid-cols-1 gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardVoucherCoupons ref="couponRef" class="min-w-0" />
          <DashboardVoucherOffers class="min-w-0" />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
