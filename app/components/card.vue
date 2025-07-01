<script setup lang="ts">
import type { Variant } from '~/types/variant'
import { formatCurrency } from '~/utils/formatCurrency'
import { parseImage } from '~~/shared/utils/parseImage'

const props = defineProps<{
  variant: Variant
}>()

console.log('images', props.variant)

const formatVariantOptions = (variantOptions: Variant['variantOptions']) => {
  return variantOptions?.map(vo => vo.option.name).join(' • ') || ''
}
</script>

<template>
  <div class="flex gap-3 *:font-medium ">
    <template v-if="variant.variantOptions?.[0]?.option?.image && parseImage(variant.variantOptions[0].option.image) !== null">
      <NuxtImg
        :src="parseImage(variant.variantOptions[0].option.image) || ''"
        provider="cloudflare"
        class="size-14 rounded shadow bg-elevated" />
    </template>

    <div class="grow flex flex-col justify-between items-start text-sm">
      <p v-if="variant.variantOptions?.length">
        {{ formatVariantOptions(variant.variantOptions) }}
      </p>
      <div class="space-x-2">
        <UBadge :color="!variant.stock ? 'error' : 'info'" variant="soft" :label="variant.stock ? `${variant.stock} In Stock` : 'No Stock'" />
        <UBadge v-if="variant.discount > 0" variant="soft" :color="variant.discount ? 'success' : 'neutral'" :label="variant.discount ? `${variant.discount} % OFF` : ''" />
      </div>
    </div>
    <div>
      <div class="flex flex-col justify-between items-end *:flex *:gap-3">
        <div>
          <p class="text-muted">
            Purchase Price
          </p>
          <p>
            {{ formatCurrency(variant.purchasePrice || 0) }}
          </p>
        </div>
        <div>
          <p class="text-muted">
            Sale Price
          </p>
          <p>
            {{ formatCurrency(variant.salePrice || 0) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
