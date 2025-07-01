<script lang="ts" setup>
import type { Category } from '~~/server/database/schema'

const { ui } = useAppConfig()
const isModalOpen = ref(false)
const isDeleteModal = ref(false)
const modalMode = ref<'add' | 'upd'>('add')

const { cateData, loading, fetchCategories, deleteItem } = useClassification()
fetchCategories()

const selectedCateId = ref()
const delCate = async () => {
  await deleteItem('/api/categories', selectedCateId.value)
  isDeleteModal.value = false
  showToast('categoryDeleted')
}

const openDeleteModal = (id: number) => {
  selectedCateId.value = id
  isDeleteModal.value = true
}

const selectedCate = ref<Category | null>(null)
const openModal = (cate?: Category) => {
  if (cate) {
    selectedCate.value = { ...cate }
    modalMode.value = 'upd'
  }
  else {
    selectedCate.value = null
    modalMode.value = 'add'
  }
  isModalOpen.value = true
}

// search
const search = ref('')
const filterCate = computed(() =>
  cateData.value.filter(cate => (cate.name ?? '').toLowerCase().includes(search.value.toLowerCase())))
</script>

<template>
  <UDashboardPanel id="categories" :ui="{ body: 'gap-2 sm:gap-3' }">
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <AppBreadcrumbs class="hidden sm:block" />
        </template>
        <template #right>
          <DashboardPartialsInputSearch v-model:search="search" placeholder="categories" />
          <UButton class="cursor-pointer shadow-sm" :icon="ui.icons.add" @click="openModal()" />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <DashboardBrandCateCard :items="filterCate" title="categories" :loading @delete="openDeleteModal" @modal="openModal" />
      <DashboardBrandCateModal
        v-model:is-open="isModalOpen"
        :modal-mode
        title="categories"
        featured
        api="/api/categories"
        :default-value="selectedCate"
        @refresh="fetchCategories" />
      <DashboardPartialsDeleteModal v-model:is-open="isDeleteModal" title="category" :loading @delete="delCate" />
    </template>
  </UDashboardPanel>
</template>
