<script lang="ts" setup>
import { formatCurrency } from '~/utils/formatCurrency'
import { parseImage } from '#shared/utils/parseImage'

interface props {
  name: string
  thumbnail: string
  quantity: string
  salePrice: number
  variant?: {
    optionName: string
    attributeName: string
    hint: string | null
    color: string | null
    image: string | null
    colorOptionName: string
  } | null
}
const props = defineProps<props>()
console.log('variant', props.variant)
</script>

<template>
  <div class="flex items-center gap-2 w-full py-2">
    <NuxtImg
      :src="variant?.image ? parseImage(variant?.image): thumbnail"
      provider="cloudflare"
      class="w-14 h-12 rounded shadow-sm bg-(--ui-border-accented)" />
    <div class="w-full text-sm font-medium">
      <p>{{ name }}</p>

      <div v-if="variant" class="flex items-center text-xs text-muted-foreground gap-2">
        <span v-if="variant.attributeName">{{ variant.optionName }}</span>
        <span
          v-if="variant.color"
          class="inline-block size-4 rounded ml-2"
          :style="{ backgroundColor: variant.color }" />
        <span v-if="variant.colorOptionName">{{ variant.colorOptionName }}</span>
      </div>

      <div class="flex justify-between w-full">
        <p>{{ `${formatCurrency(salePrice)} x ${quantity}` }}</p>
        <p>{{ formatCurrency(Number(quantity) * salePrice) }}</p>
      </div>
    </div>
  </div>
</template>
