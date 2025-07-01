<script setup lang="ts">
import type { Product } from '~~/server/database/schema'
import type { Variant } from '~/types/variant'

const props = defineProps<{
  product: Product
}>()

// Loading states
const deleteLoading = ref(false)
const delActiveLoading = ref(false)
const loadingInactive = ref(false)
const loadingActive = ref(false)

// Fetch inactive variants
const {
  data: inactiveVariants,
  execute: executeInactive
} = await useFetch<Variant[]>(`/api/products/${props.product.id}/variants`, {
  query: { active: false },
  immediate: false,
  server: false,
  lazy: true
})

// Fetch active variants
const {
  data: activeVariants,
  execute: executeActive
} = await useFetch<Variant[]>(`/api/products/${props.product.id}/variants`, {
  query: { active: true },
  immediate: false,
  server: false,
  lazy: true
})

// Wrapper for executeInactive with loading state
const fetchInactiveVariants = async () => {
  loadingInactive.value = true
  try {
    await executeInactive()
  }
  finally {
    loadingInactive.value = false
  }
}

// Wrapper for executeActive with loading state
const fetchActiveVariants = async () => {
  loadingActive.value = true
  try {
    await executeActive()
  }
  finally {
    loadingActive.value = false
  }
}

// Delete all inactive variants
const deleteAllInactive = async () => {
  deleteLoading.value = true
  if (!inactiveVariants.value || inactiveVariants.value.length === 0) {
    deleteLoading.value = false
    return
  }

  try {
    await $fetch(`/api/products/${props.product.id}/variants/delinactive`, {
      method: 'DELETE'
    })
    await fetchInactiveVariants()
  }
  catch (error) {
    console.error('Error deleting all inactive variants:', error)
  }
  finally {
    deleteLoading.value = false
  }
}

const delActiveVariants = async () => {
  delActiveLoading.value = true
  if (!activeVariants.value || activeVariants.value.length === 0) {
    delActiveLoading.value = false
    return
  }

  try {
    await $fetch(`/api/products/${props.product.id}/variants/delactive`, {
      method: 'DELETE'
    })
    await fetchActiveVariants()
  }
  catch (error) {
    console.error('Error deleting all inactive variants:', error)
  }
  finally {
    delActiveLoading.value = false
  }
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Inactive Variants Card -->
    <UCard variant="soft">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="font-medium">
            Inactive Variants
          </div>
          <div class="flex gap-2 flex-wrap">
            <UButton
              label="Load Inactive Variants"
              icon="i-heroicons-arrow-path"
              size="sm"
              variant="soft"
              :loading="loadingInactive"
              @click="fetchInactiveVariants()" />
            <UButton
              label="Delete All Inactive"
              color="error"
              :disabled="!inactiveVariants?.length"
              icon="i-heroicons-trash"
              size="sm"
              :loading="deleteLoading"
              variant="soft"
              @click="deleteAllInactive()" />
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <!-- Variants List -->
        <div v-if="loadingInactive" class="text-center py-8">
          <div class="flex justify-center">
            <USpinner />
          </div>
          <p class="mt-2">
            Loading inactive variants...
          </p>
        </div>

        <div v-else-if="inactiveVariants?.length" class="space-y-3">
          <UCard v-for="variant in inactiveVariants" :key="variant.id" variant="subtle">
            <Card :variant />
          </UCard>
        </div>

        <div v-else-if="inactiveVariants !== null && inactiveVariants?.length === 0" class="text-center py-8 text-muted">
          <UIcon name="i-heroicons-check-circle" class="mx-auto h-12 w-12 text-neutral-400 mb-2" />
          <p>No inactive variants found</p>
        </div>

        <div v-else class="text-center py-8 text-muted">
          <p>Click "Load Inactive Variants" to fetch data</p>
        </div>
      </div>
    </UCard>

    <!-- Active Variants Card -->
    <UCard variant="soft">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="font-semibold">
            Active Variants
          </div>
          <div class="flex items-center gap-2">
            <UButton
              label="Load Active Variants"
              icon="i-heroicons-arrow-path"
              size="sm"
              variant="soft"
              :loading="loadingActive"
              @click="fetchActiveVariants()" />
            <UButton
              label="Delete Active Variant"
              icon="i-heroicons-trash"
              size="sm"
              color="error"
              variant="soft"
              :loading="delActiveLoading"
              @click="delActiveVariants" />
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <div v-if="loadingActive" class="text-center py-8">
          <div class="flex justify-center">
            <USpinner />
          </div>
          <p class="mt-2">
            Loading active variants...
          </p>
        </div>

        <div v-else-if="activeVariants?.length && props.product.activeVariants" class="space-y-3">
          <UCard v-for="variant in activeVariants" :key="variant.id" variant="subtle">
            <Card :variant />
          </UCard>
        </div>

        <div v-else-if="activeVariants !== null && activeVariants?.length === 0" class="text-center py-8 text-muted">
          <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto size-12 text-neutral-400 mb-2" />
          <p>No active variants found</p>
        </div>

        <div v-else class="text-center py-8 text-muted">
          <p>Click "Load Active Variants" to fetch data</p>
        </div>
      </div>
    </UCard>
  </div>
</template>
