<script lang="ts" setup>
import type { OfferType } from '#shared/types/offer'
import type { Product } from '~~/server/database/schema'

const route = useRoute()
const id = route.query.id
const router = useRouter()
const loading = ref(false)
const offerTableRef = ref()
const products = ref<Product[]>([])
const state = ref<OfferType>({ id: '', name: '', discount: 0, description: '', startDate: '', endDate: '', products: [] })

// fetch offer id
const res = await $fetch<{ offer: OfferType }>(`/api/offers/${id}`)
if (res.offer) { state.value = res.offer; products.value = res.offer.products ?? [] }

// patch offer
const patchOffer = async () => {
  loading.value = true
  try {
    const selectedProducts = offerTableRef.value?.selectedProductIds
      ? Array.from(offerTableRef.value.selectedProductIds)
      : []

    await $fetch(`/api/offers/${state.value.id}`, { method: 'PATCH', body: { ...state.value, productIds: selectedProducts } })
    router.back()
    showToast('offerUpdated')
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
      <DashboardVoucherOfferForm v-model="state" title="Patch" :loading="loading" @submit="patchOffer" />
      <DashboardVoucherOfferTable ref="offerTableRef" />
    </template>
  </UDashboardPanel>
</template>
