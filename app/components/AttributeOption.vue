<script setup lang="ts">
import { parseImage } from '~~/shared/utils/parseImage'

const emit = defineEmits(['refresh'])
const props = defineProps<{
  product: Product
  attributeId: string
  option: {
    id: string
    name?: string
    color?: string
    image?: string[] | string | null
  }
  refresh: () => void
}>()
console.log('option', props.option)

async function delOption(attrId, id) {
  console.log('delAttribute', attrId, id)
  if (props.product.activeVariants === true) {
    const confirmed = window.confirm(
      'Are you sure? All your active variants will be moved to inactive when you delete a option.'
    )
    if (!confirmed) return
  }
  const res = await $fetch(`/api/products/${props.product.id}/attributes/${attrId}/options/${id}`, {
    method: 'DELETE',
  })
  console.log('attribute res', res)
  emit('refresh')
}
</script>

<template>
  <span class="flex items-center gap-1">
    <div v-if="option.image && option.image !== '[]' && option.image.trim() !== ''" class="mb-2 flex flex-wrap gap-2">
      <NuxtImg :src="parseImage(option.image)" provider="cloudflare" class="rounded size-14 shadow bg-elevated" />
    </div>
    <div v-if="option.color" :style="{ backgroundColor: `${option.color}` }" class="h-6 w-24 rounded" />
    <UBadge v-if="option.name" :label="option.name" variant="soft" class="px-3 py-1" />
    <UButton icon="i-heroicons-x-mark" color="error" variant="soft" size="xs" @click="delOption(attributeId, option.id)" />
  </span>
</template>
