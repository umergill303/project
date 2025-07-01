<script lang="ts" setup>
import type { Coupon } from '~~/server/database/schema'

const loading = ref(false)
const isModalOpen = ref(false)
const isDeleteModal = ref(false)
const selectedCouponId = ref('')
const coupons = ref<Coupon[]>([])
const modalMode = ref<'add' | 'upd'>('add')
const selectedDefaultCoupon = ref<Coupon | null>(null)

const fetchCoupons = async () => {
  loading.value = true
  try { coupons.value = await $fetch<Coupon[]>('/api/coupons') }
  catch { console.log('Failed to fetch coupons') }
  finally { loading.value = false }
}
fetchCoupons()

const openModal = (coupon?: Coupon) => {
  if (coupon) {
    selectedDefaultCoupon.value = { ...coupon }
    modalMode.value = 'upd'
  }
  else {
    selectedDefaultCoupon.value = null
    modalMode.value = 'add'
  }
  isModalOpen.value = true
}
defineExpose({ openModal })

const deleteCoupon = async () => {
  loading.value = true
  try {
    await $fetch(`/api/coupons/${selectedCouponId.value}`, { method: 'DELETE' })
    coupons.value = coupons.value.filter(coupon => coupon.id !== selectedCouponId.value)
    isDeleteModal.value = false
    showToast('couponDeleted')
  }
  catch { showToast('error') }
  finally { loading.value = false }
}

const deleteModal = (id: string) => {
  selectedCouponId.value = id
  isDeleteModal.value = true
}
</script>

<template>
  <div>
    <DashboardPartialsDeleteModal v-model:is-open="isDeleteModal" :loading title="coupon" @delete="deleteCoupon" />
    <DashboardVoucherCouponsDisplay :coupons :loading @delete="deleteModal" @modal="openModal" @refresh="fetchCoupons" />
    <DashboardVoucherCouponsModal v-model:is-open="isModalOpen" :modal-mode :default-value="selectedDefaultCoupon" @refresh="fetchCoupons" />
  </div>
</template>
