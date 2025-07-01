<script setup lang="ts">
import type { Slider } from '~~/server/database/schema'

const loading = ref(false)
const { ui } = useAppConfig()
const isSliderOpen = ref(false)
const selectedSliderId = ref('')
const isDeleteModal = ref(false)
const selectedDefaultSlider = ref<Slider | null>(null)
const modalMode = ref<'add' | 'upd'>('add')

const sliders = ref<Slider[]>([])
const fetchSliders = async () => {
  loading.value = true
  try {
    const response = await $fetch<Slider[]>('/api/slider')
    sliders.value = response
  }
  catch { showToast('error') }
  finally { loading.value = false }
}
fetchSliders()

const deleteSlider = async () => {
  loading.value = true
  try {
    await $fetch(`/api/slider/${selectedSliderId.value}`, { method: 'DELETE' })
    sliders.value = sliders.value.filter(slider => slider.id !== selectedSliderId.value)
    isDeleteModal.value = false
    showToast('slideDeleted')
  }
  catch { showToast('error') }
  finally { loading.value = false }
}

const deleteModal = (id: string) => {
  selectedSliderId.value = id
  isDeleteModal.value = true
}

const openModal = (slider?: Slider) => {
  if (slider) {
    selectedDefaultSlider.value = { ...slider }
    modalMode.value = 'upd'
  }
  else {
    selectedDefaultSlider.value = null
    modalMode.value = 'add'
  }
  isSliderOpen.value = true
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <AppBreadcrumbs />
        </template>
        <template #right>
          <UButton label="Add Slider" class="cursor-pointer" :icon="ui.icons.add" @click="openModal()" />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <DashboardSliderDisplay :sliders :loading @delete="deleteModal" @modal="openModal" />
      <DashboardSliderModal
        v-model:is-open="isSliderOpen"
        :modal-mode
        :default-value="selectedDefaultSlider"
        @refresh="fetchSliders"
        @modal="openModal" />
      <DashboardPartialsDeleteModal v-model:is-open="isDeleteModal" :loading title="slider" @delete="deleteSlider" />
    </template>
  </UDashboardPanel>
</template>
