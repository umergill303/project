<script setup lang="ts">
import * as z from 'zod'
import type { Variant } from '~/types/variant'
import type { Product } from '~~/server/database/schema/products'
import { parseImage } from '~~/shared/utils/parseImage'

const route = useRoute()
const toast = useToast()

const productId = route.params.id

const props = defineProps<{
  variant: Variant
  product: Product
}>()
console.log('product*********', props.product.activeVariants)

console.log('active', props.variant)

const attrOptionSChema = z.object({
  purchasePrice: z.number().min(0, 'Price cannot be negative'),
  salePrice: z.number().min(0, 'Price cannot be negative'),
}).superRefine((val, ctx) => {
  if (val.salePrice < val.purchasePrice) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Sale price must be ≥ purchase price',
      path: ['salePrice']
    })
  }
})

const variantState = reactive({
  purchasePrice: props.variant.purchasePrice || 0,
  salePrice: props.variant.salePrice || 0,
  discount: props.variant.discount || 0,
  stock: props.variant.stock || 0,
  active: props.variant.active,
})

const formField = [
  { label: 'Purchase Price', name: 'purchasePrice' },
  { label: 'Sale Price', name: 'salePrice' },
  { label: 'Discount', name: 'discount' },
  { label: 'Stock', name: 'stock' },
]

const handleSave = async () => {
  try {
    const data = await $fetch(`/api/products/${productId}/variant/`, {
      method: 'PATCH',
      body: {
        id: props.variant.id,
        purchasePrice: variantState.purchasePrice,
        salePrice: variantState.salePrice,
        discount: variantState.discount,
        stock: variantState.stock,
        sku: props.variant.sku,
        order: props.variant.order,
        active: props.variant.active,
      },
    })

    toast.add({
      title: 'Success',
      description: 'Variant saved successfully!',
      color: 'primary',
    })

    console.log('Variant updated:', data)
  }
  catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to save variant.',
      color: 'error',
    })
    console.error('Error updating variant:', error)
  }
}
</script>

<template>
  <UCard v-if="props.product.activeVariants" variant="soft">
    <template #header>
      <div class="flex justify-between items-center">
        <div class="flex flex-wrap gap-1.5 items-center">
          <div v-for="(option, index) in props.variant.variantOptions" :key="index">
            <template v-if="parseImage(option.option.image)">
              <NuxtImg
                :src="parseImage(option.option.image)"
                provider="cloudflare"
                class="size-8 rounded shadow bg-elevated" />
            </template>
            <UBadge v-if="option.option.name" class="px-3" variant="subtle" :label="option.option.name" />
          </div>
        </div>
        <UButton
          label="Save variant"
          icon="tabler:edit"
          size="sm"
          color="info"
          variant="soft"
          class="cursor-pointer px-3"
          @click="handleSave" />
      </div>
    </template>

    <UForm :state="variantState" :schema="attrOptionSChema" class="grid grid-cols-2 md:grid-cols-4 gap-2">
      <UFormField
        v-for="field in formField"
        :key="field.name"
        :label="field.label"
        :name="field.name"
        class="w-full">
        <UButtonGroup v-if="field.name === 'purchasePrice' || field.name === 'salePrice'">
          <UButton :label="useRuntimeConfig().public.ecommerce.currency ?? ''" variant="subtle" class="px-3" color="neutral" />
          <UInput
            v-model="(variantState as Record<string, any>)[field.name]"
            type="number"
            variant="subtle"
            class="w-full" />
        </UButtonGroup>

        <UButtonGroup v-else-if="field.name === 'discount'">
          <UButton label="%" variant="subtle" class="px-3" color="neutral" />
          <UInput
            v-model="(variantState as Record<string, any>)[field.name]"
            type="number"
            variant="subtle"
            class="w-full" />
        </UButtonGroup>

        <UInput
          v-else
          v-model="(variantState as Record<string, any>)[field.name]"
          type="number"
          variant="subtle"
          class="w-full" />
      </UFormField>
    </UForm>
  </UCard>
</template>
