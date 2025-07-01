<script setup lang="ts">
import type { Variant } from '~/types/variant'
import type { Product } from '~~/server/database/schema/products'

const props = defineProps<{ productId: string }>()

const isGeneratingVariants = ref(false)
const rawVariants = ref<Variant[]>([])

const { data: fetchedVariants, refresh: refreshVariants } = await useFetch(`/api/products/${props.productId}/variants`, {
  watch: false
})

const { data: product, refresh: refreshProduct } = await useFetch<Product>(`/api/products/${props.productId}`, {
  watch: false
})

watchEffect(() => {
  if (fetchedVariants.value) {
    rawVariants.value = fetchedVariants.value
  }
})

async function refreshAll() {
  await refreshVariants()
  await refreshProduct()
}

async function generateVariants() {
  if (product.value?.activeVariants === true) {
    const confirmed = window.confirm(
      'Are you sure? All your active variants will be moved to inactive when you generate new variants.'
    )
    if (!confirmed) return
  }

  try {
    isGeneratingVariants.value = true
    await $fetch(`/api/products/${props.productId}/variants/generate`)
    await refreshAll()
  }
  catch (error) {
    console.error('Error generating variants:', error)
  }
  finally {
    isGeneratingVariants.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <UCard variant="soft">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-medium">
            Product Variants
          </h2>
          <p class="text-sm text-muted mt-1">
            Manage different variations of your product
          </p>
        </div>
        <UButton
          label="Generate Variants"
          icon="i-heroicons-sparkles"
          :loading="isGeneratingVariants"
          @click="generateVariants" />
      </div>
    </UCard>

    <Attributes :product @refresh="refreshAll" />
    <ActiveVariants :variants="rawVariants" :product />
    <InActiveVariants :product />
  </div>
</template>
