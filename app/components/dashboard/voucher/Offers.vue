<script lang="ts" setup>
const loading = ref(false)
const selectedOfferId = ref()
const isDeleteModal = ref(false)

const offersData = ref<OfferType[]>([])
const fetchOffers = async () => {
  loading.value = true
  try {
    const res = await $fetch<{ offer_data: OfferType[] }>('/api/offers')
    offersData.value = res.offer_data
  }
  catch { showToast('error') }
  finally { loading.value = false }
}
fetchOffers()

// delete offer and its products
const deleteOffer = async () => {
  loading.value = true
  try {
    await $fetch(`/api/offers/${selectedOfferId.value}`, { method: 'DELETE' })
    offersData.value = offersData.value?.filter(offer => offer.id !== selectedOfferId.value)
    isDeleteModal.value = false
    showToast('offerDeleted')
  }
  catch { showToast('error') }
  finally { loading.value = false }
}
const deleteModal = (id: string) => {
  selectedOfferId.value = id
  isDeleteModal.value = true
}
</script>

<template>
  <div>
    <DashboardVoucherOfferDisplay :offers-data :loading @delete="deleteModal" @refresh="fetchOffers" />
    <DashboardPartialsDeleteModal v-model:is-open="isDeleteModal" :loading title="Offer" @delete="deleteOffer" />
  </div>
</template>
