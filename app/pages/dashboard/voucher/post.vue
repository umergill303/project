<script lang="ts" setup>
import type { OfferType } from '#shared/types/offer'

const router = useRouter()
const loading = ref(false)
const offerTableRef = ref()
const state = ref<OfferType>({ id: '', name: '', discount: 0, description: '', startDate: '', endDate: '', products: [] })

// patch offer
const postOffer = async () => {
  loading.value = true
  try {
    const selectedProducts = offerTableRef.value?.selectedProductIds
      ? Array.from(offerTableRef.value.selectedProductIds)
      : []

    await $fetch(`/api/offers`, { method: 'POST', body: { ...state.value, productIds: selectedProducts } })
    router.back()
    showToast('offerAdded')
  }
  catch (error) { console.log(error); showToast('error') }
  finally { loading.value = false }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <AppBreadcrumbs />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <DashboardVoucherOfferForm v-model="state" title="Post" :loading="loading" @submit="postOffer" />
      <DashboardVoucherOfferTable ref="offerTableRef" />
    </template>
  </UDashboardPanel>
</template>
