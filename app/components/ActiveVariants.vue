<script setup lang="ts">
import type { Variant } from '~/types/variant'
import type { Product } from '~~/server/database/schema'

const props = defineProps<{
  variants: Variant[]
  product: Product
}>()

console.log('variants', props.variants)
</script>

<template>
  <div v-if="props.product.activeVariants" class="space-y-2">
    <ActiveVariant v-for="variant in props.variants" :key="variant.id" :variant="variant" :product="props.product" />
  </div>
  <UCard v-else class="text-center py-8 text-muted" variant="soft">
    <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto size-12 text-neutral-400 mb-2" />
    <p>Please add Complete Attribute and Options Then Again Click On Generate Variants</p>
  </UCard>
</template>
