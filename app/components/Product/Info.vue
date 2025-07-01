<script lang="ts" setup>
import type { TabsItem } from '@nuxt/ui'

const { product } = defineProps<{ product: Product }>()

const productSpecs = computed(() => {
  try {
    if (!product.specs) return {}

    let specsString = product.specs

    // Step 1: Remove the outermost escaped quotes
    if (specsString.startsWith('\"') && specsString.endsWith('\"')) {
      specsString = specsString.slice(1, -1)
    }

    // Step 2: Unescape the inner JSON string
    specsString = specsString.replace(/\\"/g, '"')

    // Step 3: Parse the actual JSON
    return JSON.parse(specsString)
  }
  catch (e) {
    console.error('Error parsing specs:', e)
    console.log('Original specs:', product.specs)
    return {}
  }
})

const specsData = computed(() => {
  if (!productSpecs.value || typeof productSpecs.value !== 'object') {
    return []
  }

  return Object.entries(productSpecs.value).map(([key, value]) => ({
    specification: key,
    value: String(value)
  }))
})

const items = [
  {
    label: 'Description',
    description: product.description,
    slot: 'description' as const
  },
  {
    label: 'Specifications',
    description: 'Product Specifications',
    slot: 'specifications' as const
  }
] satisfies TabsItem[]
</script>

<template>
  <UCard variant="subtle">
    <UTabs :items="items" variant="link" class="gap-4 w-full">
      <template #description="{ item }">
        <div class="prose prose-sm max-w-none" v-html="item.description" />
      </template>

      <template #specifications="{ item }">
        <UCard variant="soft">
          <div class="prose prose-sm max-w-none">
            <UTable
              v-if="specsData.length"
              :data="specsData"
              class="flex-1 w-full">
              <template #default="{ row }">
                <tr class="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <td class="py-2 w-1/3 capitalize">
                    {{ row.specification }}
                  </td>
                  <td class="py-2 w-2/3">
                    {{ row.value }}
                  </td>
                </tr>
              </template>
            </UTable>
            <p v-else>
              No specifications available.
            </p>
          </div>
        </UCard>
      </template>
    </UTabs>
  </UCard>
</template>
