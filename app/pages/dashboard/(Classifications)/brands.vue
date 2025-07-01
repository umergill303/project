<script lang="ts" setup>
import type { Brand } from '~~/server/database/schema'

const { ui } = useAppConfig()
const isModalOpen = ref(false)
const isDeleteModal = ref(false)
const modalMode = ref<'add' | 'upd'>('add')

const { brandData, loading, fetchBrands, deleteItem } = useClassification()
fetchBrands()

const selectedBrandId = ref()
const delBrand = async () => {
  await deleteItem('/api/brands', selectedBrandId.value)
  isDeleteModal.value = false
  showToast('brandDeleted')
}

const openDeleteModal = (id: number) => {
  selectedBrandId.value = id
  isDeleteModal.value = true
}

const selectedBrand = ref<Brand | null>(null)
const openModal = (brand?: Brand) => {
  if (brand) {
    selectedBrand.value = { ...brand }
    modalMode.value = 'upd'
  }
  else {
    selectedBrand.value = null
    modalMode.value = 'add'
  }
  isModalOpen.value = true
}

// search
const search = ref('')
const filterBrands = computed(() =>
  brandData.value.filter(brand => (brand.name ?? '').toLowerCase().includes(search.value.toLowerCase())))
</script>

<template>
  <UDashboardPanel id="brands" :ui="{ body: 'gap-2 sm:gap-3' }">
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <AppBreadcrumbs class="hidden sm:block" />
        </template>
        <template #right>
          <DashboardPartialsInputSearch v-model:search="search" placeholder="brands" />
          <UButton class="cursor-pointer shadow-sm" :icon="ui.icons.add" @click="openModal()" />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <DashboardBrandCateCard :items="filterBrands" title="brands" :loading @delete="openDeleteModal" @modal="openModal" />
      <DashboardBrandCateModal
        v-model:is-open="isModalOpen"
        :modal-mode
        title="brands"
        api="/api/brands"
        :default-value="selectedBrand"
        @refresh="fetchBrands" />
      <DashboardPartialsDeleteModal v-model:is-open="isDeleteModal" title="brand" :loading @delete="delBrand" />
    </template>
  </UDashboardPanel>
</template>
