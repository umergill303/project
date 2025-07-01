<script lang="ts" setup>
import type { Tag } from '~~/server/database/schema'

const { ui } = useAppConfig()
const isModalOpen = ref(false)
const isDeleteModal = ref(false)
const modalMode = ref<'add' | 'upd'>('add')

const { tagData, loading, fetchTags, deleteItem } = useClassification()
fetchTags()

const selectedTagId = ref()
const delTag = async () => {
  await deleteItem('/api/tag', selectedTagId.value)
  isDeleteModal.value = false
  showToast('tagDeleted')
}

const openDeleteModal = (id: number) => {
  selectedTagId.value = id
  isDeleteModal.value = true
}

const selectedTag = ref<Tag | null>(null)
const openModal = (tag?: Tag) => {
  if (tag) {
    selectedTag.value = { ...tag }
    modalMode.value = 'upd'
  }
  else {
    selectedTag.value = null
    modalMode.value = 'add'
  }
  isModalOpen.value = true
}

// search
const search = ref('')
const filterTags = computed(() =>
  tagData.value.filter(tag => (tag.name ?? '').toLowerCase().includes(search.value.toLowerCase())))
</script>

<template>
  <UDashboardPanel id="tags" :ui="{ body: 'gap-2 sm:gap-3' }">
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
      <DashboardBrandCateCard :items="filterTags" title="tags" :loading @delete="openDeleteModal" @modal="openModal" />
      <DashboardBrandCateModal
        v-model:is-open="isModalOpen"
        :modal-mode
        title="tags"
        api="/api/tag"
        :default-value="selectedTag"
        @refresh="fetchTags" />
      <DashboardPartialsDeleteModal v-model:is-open="isDeleteModal" title="tag" :loading @delete="delTag" />
    </template>
  </UDashboardPanel>
</template>
