<script setup lang="ts">
const props = defineProps<{
  product: Product
  attributeId: string
  attributeType?: string
  options: []
  refresh: () => void
}>()
const emit = defineEmits(['refresh'])
async function delOption(attrId, id) {
  console.log('delAttribute', attrId, id)
  if (props.product.activeVariants === true) {
    const confirmed = window.confirm(
      'Are you sure? All your active variants will be moved to inactive when you delete an attribute.'
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
  <div>
    <div class="flex flex-wrap gap-2">
      <AttributeOption
        v-for="option in options"
        :key="option.id"
        :product="props.product"
        :attribute-id
        :option
        @refresh="emit('refresh')" />
    </div>
    <!-- Add Option Input -->
    <AttributeOptionInput :product="props.product" :attribute-id="props.attributeId" :attribute-type="props.attributeType" @refresh="emit('refresh')" />
  </div>
</template>
